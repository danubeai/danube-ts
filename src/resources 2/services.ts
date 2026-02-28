import type { HTTPClient } from '../http.js';
import type { Service, ServiceToolsResult, ServiceType } from '../types/services.js';
import type { Tool } from '../types/tools.js';

interface ListOptions {
  query?: string;
  limit?: number;
}

interface GetToolsOptions {
  limit?: number;
}

function mapService(data: Record<string, unknown>): Service {
  return {
    id: data.id as string,
    name: data.name as string,
    description: (data.description ?? '') as string,
    summary: (data.summary ?? '') as string,
    version: (data.version ?? '') as string,
    serviceType: (data.service_type ?? 'api') as ServiceType,
    url: data.url as string | undefined,
    isConnected: (data.is_connected ?? false) as boolean,
    toolCount: (data.tool_count ?? 0) as number,
    isVerified: (data.is_verified ?? false) as boolean,
    visibility: (data.visibility ?? 'public') as string,
    category: data.category as string | undefined,
    verificationTier: (data.verification_tier ?? 'unverified') as string,
    logo: (data.logo ?? '') as string,
    documentationUrl: data.documentation_url as string | undefined,
    requiresCredentials: (data.requires_credentials ?? false) as boolean,
  };
}

function mapTool(data: Record<string, unknown>): Tool {
  return {
    id: data.id as string,
    name: data.name as string,
    description: (data.description ?? '') as string,
    serviceId: (data.service_id ?? '') as string,
    parameters: (data.parameters ?? {}) as Record<string, unknown>,
    isPaid: (data.is_paid ?? false) as boolean,
    pricePerCallCents: data.price_per_call_cents as number | undefined,
    tags: (data.tags ?? []) as string[],
    method: (data.method ?? '') as string,
    tips: data.tips as string | undefined,
    metadata: (data.metadata ?? {}) as Record<string, unknown>,
  };
}

export class ServicesResource {
  constructor(private http: HTTPClient) {}

  async list(options?: ListOptions): Promise<Service[]> {
    const params: Record<string, unknown> = {
      limit: options?.limit ?? 10,
    };
    if (options?.query) {
      params.query = options.query;
    }
    const data = await this.http.get<Record<string, unknown>[]>('/v1/services/public', params);
    return Array.isArray(data) ? data.map(mapService) : [];
  }

  async get(serviceId: string): Promise<Service> {
    const data = await this.http.get<Record<string, unknown>>(`/v1/services/public/${serviceId}`);
    return mapService(data);
  }

  async getTools(serviceId: string, options?: GetToolsOptions): Promise<ServiceToolsResult> {
    const params: Record<string, unknown> = {
      limit: options?.limit ?? 50,
    };
    const data = await this.http.get<Record<string, unknown>>(
      `/v1/services/${serviceId}/tools`,
      params
    );
    const tools = Array.isArray(data.tools) ? (data.tools as Record<string, unknown>[]).map(mapTool) : [];
    return {
      tools,
      needsConfiguration: (data.needs_configuration ?? false) as boolean,
      skipped: (data.skipped ?? false) as boolean,
      configurationRequired: data.configuration_required as Record<string, unknown> | undefined,
    };
  }
}
