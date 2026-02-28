import type { Tool } from './tools.js';

export type ServiceType = 'mcp_server' | 'api' | 'internal' | 'website';

export interface Service {
  id: string;
  name: string;
  description: string;
  summary: string;
  version: string;
  serviceType: ServiceType;
  url?: string;
  isConnected: boolean;
  toolCount: number;
  isVerified: boolean;
  visibility: string;
  category?: string;
  verificationTier: string;
  logo: string;
  documentationUrl?: string;
  requiresCredentials: boolean;
}

export interface ServiceToolsResult {
  tools: Tool[];
  needsConfiguration: boolean;
  skipped: boolean;
  configurationRequired?: Record<string, unknown>;
}
