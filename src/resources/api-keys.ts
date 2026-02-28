import type { HTTPClient } from '../http.js';

export interface APIKeyPermissions {
  allowedServices?: string[] | null;
  allowedTools?: string[] | null;
  maxSpendPerCallCents?: number | null;
  maxSpendPerDayCents?: number | null;
}

export interface APIKeyResponse {
  id: string;
  keyPrefix: string;
  name: string;
  createdAt: string;
  lastUsed?: string | null;
  permissions?: APIKeyPermissions | null;
}

export interface APIKeyWithSecret extends APIKeyResponse {
  key: string;
}

function mapPermissions(data: Record<string, unknown> | null | undefined): APIKeyPermissions | null {
  if (!data) return null;
  return {
    allowedServices: data.allowed_services as string[] | null | undefined,
    allowedTools: data.allowed_tools as string[] | null | undefined,
    maxSpendPerCallCents: data.max_spend_per_call_cents as number | null | undefined,
    maxSpendPerDayCents: data.max_spend_per_day_cents as number | null | undefined,
  };
}

function mapAPIKey(data: Record<string, unknown>): APIKeyResponse {
  return {
    id: data.id as string,
    keyPrefix: (data.key_prefix ?? '') as string,
    name: (data.name ?? '') as string,
    createdAt: (data.created_at ?? '') as string,
    lastUsed: data.last_used as string | null | undefined,
    permissions: mapPermissions(data.permissions as Record<string, unknown> | null),
  };
}

function mapAPIKeyWithSecret(data: Record<string, unknown>): APIKeyWithSecret {
  return {
    ...mapAPIKey(data),
    key: data.key as string,
  };
}

interface CreateAPIKeyOptions {
  name: string;
  permissions?: {
    allowedServices?: string[] | null;
    allowedTools?: string[] | null;
    maxSpendPerCallCents?: number | null;
    maxSpendPerDayCents?: number | null;
  } | null;
}

export class APIKeysResource {
  constructor(private http: HTTPClient) {}

  async list(): Promise<APIKeyResponse[]> {
    const data = await this.http.get<Record<string, unknown>[]>('/v1/api-keys');
    return Array.isArray(data) ? data.map(mapAPIKey) : [];
  }

  async create(options: CreateAPIKeyOptions): Promise<APIKeyWithSecret> {
    const body: Record<string, unknown> = { name: options.name };
    if (options.permissions) {
      body.permissions = {
        allowed_services: options.permissions.allowedServices,
        allowed_tools: options.permissions.allowedTools,
        max_spend_per_call_cents: options.permissions.maxSpendPerCallCents,
        max_spend_per_day_cents: options.permissions.maxSpendPerDayCents,
      };
    }
    const data = await this.http.post<Record<string, unknown>>('/v1/api-keys', body);
    return mapAPIKeyWithSecret(data);
  }

  async rotate(keyId: string): Promise<APIKeyWithSecret> {
    const data = await this.http.post<Record<string, unknown>>(`/v1/api-keys/${keyId}/rotate`);
    return mapAPIKeyWithSecret(data);
  }

  async revoke(keyId: string): Promise<void> {
    await this.http.delete<Record<string, unknown>>(`/v1/api-keys/${keyId}`);
  }
}
