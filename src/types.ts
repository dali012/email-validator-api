export interface Env {
  EMAIL_RESULTS: KVNamespace;
  DB: D1Database;
  ADMIN_SECRET_KEY: string;
}

export interface Variables {
  requestBody?: {
    name: string;
    expiresIn?: number;
  };
}

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
