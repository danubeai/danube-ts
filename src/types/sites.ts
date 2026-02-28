export interface SiteComponents {
  contact?: Record<string, unknown>;
  about?: Record<string, unknown>;
  services?: Record<string, unknown>[];
  docs?: Record<string, unknown>;
  pricing?: Record<string, unknown>;
  faq?: Record<string, unknown>[];
  legal?: Record<string, unknown>;
  navigation?: Record<string, unknown>[];
  identity?: Record<string, unknown>;
  products?: Record<string, unknown>[];
  team?: Record<string, unknown>[];
  blog?: Record<string, unknown>[];
  jobs?: Record<string, unknown>[];
}

export interface AgentSite {
  id: string;
  domain: string;
  url: string;
  status: string;
  pageTitle?: string;
  pageDescription?: string;
  faviconUrl?: string;
  components: SiteComponents;
  discoveredTools: Record<string, unknown>[];
  category?: string;
  tags: string[];
  serviceId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgentSiteListItem {
  id: string;
  domain: string;
  pageTitle?: string;
  pageDescription?: string;
  faviconUrl?: string;
  category?: string;
  componentCount: number;
  toolCount: number;
  status: string;
}
