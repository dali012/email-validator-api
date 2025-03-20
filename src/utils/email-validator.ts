import {
  DISPOSABLE_DOMAINS,
  DOMAIN_TYPOS,
  FREE_EMAIL_PROVIDERS,
  ROLE_BASED_PREFIXES,
} from "constants/index";
import { DnsResponse } from "types";

interface ValidationResult {
  email: string;
  is_valid: boolean;
  score: number; // 0-1 confidence score
  suggested_correction?: string;
  checks: {
    syntax: boolean;
    mx_records: boolean;
    disposable: boolean;
    role_account: boolean;
    free_provider: boolean;
  };
}

export async function validateEmail(email: string): Promise<ValidationResult> {
  // Normalize email by trimming whitespace and converting to lowercase
  const normalizedEmail = email.trim().toLowerCase();

  const result: ValidationResult = {
    email: normalizedEmail,
    is_valid: false,
    score: 0,
    checks: {
      syntax: false,
      mx_records: false,
      disposable: false,
      role_account: false,
      free_provider: false,
    },
  };

  // Basic syntax validation before doing other checks
  const isValidSyntax = validateSyntax(normalizedEmail);
  result.checks.syntax = isValidSyntax;

  // Skip further checks if syntax is invalid
  if (!isValidSyntax) {
    return finishValidation(result);
  }

  // Split email into parts - we know it's valid at this point
  const [localPart, domain] = normalizedEmail.split("@");
  const domainLower = domain.toLowerCase();

  // Run all checks in parallel for better performance
  const [mxRecordsCheck, domainTypoCheck] = await Promise.all([
    checkMxRecords(domainLower),
    checkDomainTypos(localPart, domainLower),
  ]);

  // Apply results
  result.checks.mx_records = mxRecordsCheck;

  if (domainTypoCheck) {
    result.suggested_correction = domainTypoCheck;
  }

  // These are quick in-memory checks, no need for Promise.all
  result.checks.role_account = checkRoleAccount(localPart);
  result.checks.free_provider = FREE_EMAIL_PROVIDERS.has(domainLower);
  result.checks.disposable = DISPOSABLE_DOMAINS.has(domainLower);

  return finishValidation(result);
}

// Helper function for role account checking
function checkRoleAccount(localPart: string): boolean {
  const localLower = localPart.toLowerCase();
  return Array.from(ROLE_BASED_PREFIXES).some(
    (prefix: string) =>
      localLower === prefix || localLower.startsWith(`${prefix}.`)
  );
}

// Helper function for domain typo checking
function checkDomainTypos(localPart: string, domain: string): string | null {
  const correctedDomain = DOMAIN_TYPOS[domain];
  return correctedDomain ? `${localPart}@${correctedDomain}` : null;
}

function validateSyntax(email: string): boolean {
  // RFC 5322 compliant regex that catches more edge cases
  const pattern =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  // Convert to lowercase and test
  return pattern.test(email.toLowerCase());
}

function finishValidation(result: ValidationResult): ValidationResult {
  // Start with 0 score
  let score = 0;

  // Base checks
  if (result.checks.syntax) {
    score += 0.4; // Syntax is the minimum requirement

    if (result.checks.mx_records) {
      score += 0.4; // MX records indicate deliverability
    }

    // Apply additional quality factors
    if (!result.checks.disposable) {
      score += 0.1; // Not disposable is better
    }

    if (!result.checks.role_account) {
      score += 0.1; // Personal accounts preferred over role-based
    }

    // Small bonus for custom domains (non-free providers)
    if (!result.checks.free_provider) {
      score += 0.05;
    }

    // Cap at 1.0
    score = Math.min(score, 1.0);
  }

  // Round to 2 decimal places
  result.score = Math.round(score * 100) / 100;

  // An email is valid if it has proper syntax and working mail server
  result.is_valid = result.checks.syntax && result.checks.mx_records;

  return result;
}

async function checkMxRecords(domain: string): Promise<boolean> {
  try {
    // Use Cloudflare's DNS-over-HTTPS API
    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${domain}&type=MX`,
      {
        headers: {
          Accept: "application/dns-json",
        },
        cf: {
          cacheTtl: 3600, // Cache for 1 hour when using Cloudflare
          cacheEverything: true,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`DNS query failed with status: ${response.status}`);
    }

    const data: DnsResponse = await response.json();
    const hasMxRecords = Boolean(data.Answer && data.Answer.length > 0);

    // Cache successful lookups longer than failures
    // This is an additional layer of control beyond the initial fetch options
    if (response.ok) {
      const newCacheTtl = hasMxRecords ? 3600 : 300; // 1 hour for success, 5 minutes for no MX records
      const cache = caches.default;

      // Create a new response with updated cache headers
      const modifiedResponse = new Response(JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": `public, max-age=${newCacheTtl}`,
        },
      });

      // Store the modified response in the cache
      const cacheKey = new Request(
        `https://cloudflare-dns.com/dns-query?name=${domain}&type=MX`
      );
      await cache.put(cacheKey, modifiedResponse);
    }

    return hasMxRecords;
  } catch (error) {
    console.error(`Error checking MX records for ${domain}:`, error);
    return false;
  }
}
