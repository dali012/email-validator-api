export interface Env {
  EMAIL_RESULTS: KVNamespace;
  PENDING_VERIFICATIONS: KVNamespace;
  API_USAGE: KVNamespace;
  DB: D1Database;
  API_BASE_URL: string;
  EMAIL_FROM: string;
  RESEND_API_KEY: string;
}

export interface Variables {}

interface DnsRecord {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

export interface DnsResponse {
  Status: number;
  TC: boolean;
  RD: boolean;
  RA: boolean;
  AD: boolean;
  CD: boolean;
  Question: Array<{ name: string; type: number }>;
  Answer?: Array<DnsRecord>;
}
