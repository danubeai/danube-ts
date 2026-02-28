import type { HTTPClient } from '../http.js';
import type { AgentSite, AgentSiteListItem, SiteComponents } from '../types/sites.js';

interface SearchOptions {
  query?: string;
  category?: string;
  limit?: number;
}

function mapComponents(data: Record<string, unknown> | null | undefined): SiteComponents {
  if (!data) return {};
  return {
    contact: data.contact as Record<string, unknown> | undefined,
    about: data.about as Record<string, unknown> | undefined,
    services: data.services as Record<string, unknown>[] | undefined,
    docs: data.docs as Record<string, unknown> | undefined,
    pricing: data.pricing as Record<string, unknown> | undefined,
    faq: data.faq as Record<string, unknown>[] | undefined,
    legal: data.legal as Record<string, unknown> | undefined,
    navigation: data.navigation as Record<string, unknown>[] | undefined,
    identity: data.identity as Record<string, unknown> | undefined,
    products: data.products as Record<string, unknown>[] | undefined,
    team: data.team as Record<string, unknown>[] | undefined,
    blog: data.blog as Record<string, unknown>[] | undefined,
    jobs: data.jobs as Record<string, unknown>[] | undefined,
  };
}

function mapSite(data: Record<string, unknown>): AgentSite {
  return {
    id: data.id as string,
    domain: data.domain as string,
    url: (data.url ?? '') as string,
    status: (data.status ?? '') as string,
    pageTitle: data.page_title as string | undefined,
    pageDescription: data.page_description as string | undefined,
    faviconUrl: data.favicon_url as string | undefined,
    components: mapComponents(data.components as Record<string, unknown> | undefined),
    discoveredTools: (data.discovered_tools ?? []) as Record<string, unknown>[],
    category: data.category as string | undefined,
    tags: (data.tags ?? []) as string[],
    serviceId: data.service_id as string | undefined,
    createdAt: data.created_at as string | undefined,
    updatedAt: data.updated_at as string | undefined,
  };
}

function mapListItem(data: Record<string, unknown>): AgentSiteListItem {
  return {
    id: data.id as string,
    domain: data.domain as string,
    pageTitle: data.page_title as string | undefined,
    pageDescription: data.page_description as string | undefined,
    faviconUrl: data.favicon_url as string | undefined,
    category: data.category as string | undefined,
    componentCount: (data.component_count ?? 0) as number,
    toolCount: (data.tool_count ?? 0) as number,
    status: (data.status ?? '') as string,
  };
}

export class SitesResource {
  constructor(private http: HTTPClient) {}

  async search(options?: SearchOptions): Promise<AgentSiteListItem[]> {
    const params: Record<string, unknown> = {
      limit: options?.limit ?? 10,
    };
    if (options?.query) {
      params.query = options.query;
    }
    if (options?.category) {
      params.category = options.category;
    }
    const data = await this.http.get<Record<string, unknown>[]>(
      '/v1/agent-sites/search',
      params
    );
    return Array.isArray(data) ? data.map(mapListItem) : [];
  }

  async get(siteId: string): Promise<AgentSite> {
    const data = await this.http.get<Record<string, unknown>>(`/v1/agent-sites/${siteId}`);
    return mapSite(data);
  }

  async getByDomain(domain: string): Promise<AgentSite> {
    const data = await this.http.get<Record<string, unknown>>(
      `/v1/agent-sites/domain/${encodeURIComponent(domain)}`
    );
    return mapSite(data);
  }
}
