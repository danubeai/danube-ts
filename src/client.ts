import { HTTPClient } from './http.js';
import { ToolsResource } from './resources/tools.js';
import { ServicesResource } from './resources/services.js';
import { WorkflowsResource } from './resources/workflows.js';
import { SitesResource } from './resources/sites.js';
import { SkillsResource } from './resources/skills.js';
import { IdentityResource } from './resources/identity.js';
import { CredentialsResource } from './resources/credentials.js';
import { WalletResource } from './resources/wallet.js';
import { AgentsResource } from './resources/agents.js';
import { RatingsResource } from './resources/ratings.js';
import { APIKeysResource } from './resources/api-keys.js';
import { WebhooksResource } from './resources/webhooks.js';

const DEFAULT_BASE_URL = 'https://api.danubeai.com';

function getEnv(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
}

export interface DanubeClientOptions {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
}

export class DanubeClient {
  private http: HTTPClient;
  private _tools?: ToolsResource;
  private _services?: ServicesResource;
  private _workflows?: WorkflowsResource;
  private _sites?: SitesResource;
  private _skills?: SkillsResource;
  private _identity?: IdentityResource;
  private _credentials?: CredentialsResource;
  private _wallet?: WalletResource;
  private _agents?: AgentsResource;
  private _ratings?: RatingsResource;
  private _apiKeys?: APIKeysResource;
  private _webhooks?: WebhooksResource;

  constructor(options?: DanubeClientOptions) {
    const apiKey = options?.apiKey ?? getEnv('DANUBE_API_KEY') ?? '';
    const baseUrl = options?.baseUrl ?? getEnv('DANUBE_API_URL') ?? DEFAULT_BASE_URL;
    const timeoutStr = getEnv('DANUBE_TIMEOUT');
    const timeout = options?.timeout ?? (timeoutStr ? parseFloat(timeoutStr) : 30);
    const retriesStr = getEnv('DANUBE_MAX_RETRIES');
    const maxRetries = options?.maxRetries ?? (retriesStr ? parseInt(retriesStr, 10) : 3);

    this.http = new HTTPClient({ baseUrl, apiKey, timeout, maxRetries });
  }

  get tools(): ToolsResource {
    return (this._tools ??= new ToolsResource(this.http));
  }

  get services(): ServicesResource {
    return (this._services ??= new ServicesResource(this.http));
  }

  get workflows(): WorkflowsResource {
    return (this._workflows ??= new WorkflowsResource(this.http));
  }

  get sites(): SitesResource {
    return (this._sites ??= new SitesResource(this.http));
  }

  get skills(): SkillsResource {
    return (this._skills ??= new SkillsResource(this.http));
  }

  get identity(): IdentityResource {
    return (this._identity ??= new IdentityResource(this.http));
  }

  get credentials(): CredentialsResource {
    return (this._credentials ??= new CredentialsResource(this.http));
  }

  get wallet(): WalletResource {
    return (this._wallet ??= new WalletResource(this.http));
  }

  get agents(): AgentsResource {
    return (this._agents ??= new AgentsResource(this.http));
  }

  get ratings(): RatingsResource {
    return (this._ratings ??= new RatingsResource(this.http));
  }

  get apiKeys(): APIKeysResource {
    return (this._apiKeys ??= new APIKeysResource(this.http));
  }

  get webhooks(): WebhooksResource {
    return (this._webhooks ??= new WebhooksResource(this.http));
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.http.get<Record<string, unknown>>('/v1/health');
      return true;
    } catch {
      return false;
    }
  }

  close(): void {
    this.http.close();
  }

  [Symbol.dispose](): void {
    this.close();
  }
}
