import type { HTTPClient } from '../http.js';

export interface WebhookResponse {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface WebhookCreateResponse extends WebhookResponse {
  secret: string;
}

export interface WebhookDeliveryResponse {
  id: string;
  webhookId: string;
  eventType: string;
  payload: Record<string, unknown>;
  status: string;
  responseStatus?: number | null;
  responseBody?: string | null;
  attempts: number;
  deliveredAt?: string | null;
  createdAt?: string | null;
}

function mapWebhook(data: Record<string, unknown>): WebhookResponse {
  return {
    id: data.id as string,
    url: (data.url ?? '') as string,
    events: (data.events ?? []) as string[],
    isActive: (data.is_active ?? true) as boolean,
    description: data.description as string | null | undefined,
    createdAt: data.created_at as string | null | undefined,
    updatedAt: data.updated_at as string | null | undefined,
  };
}

function mapWebhookCreate(data: Record<string, unknown>): WebhookCreateResponse {
  return {
    ...mapWebhook(data),
    secret: data.secret as string,
  };
}

function mapDelivery(data: Record<string, unknown>): WebhookDeliveryResponse {
  return {
    id: data.id as string,
    webhookId: (data.webhook_id ?? '') as string,
    eventType: (data.event_type ?? '') as string,
    payload: (data.payload ?? {}) as Record<string, unknown>,
    status: (data.status ?? '') as string,
    responseStatus: data.response_status as number | null | undefined,
    responseBody: data.response_body as string | null | undefined,
    attempts: (data.attempts ?? 0) as number,
    deliveredAt: data.delivered_at as string | null | undefined,
    createdAt: data.created_at as string | null | undefined,
  };
}

interface CreateWebhookOptions {
  url: string;
  events: string[];
  description?: string;
}

interface UpdateWebhookOptions {
  url?: string;
  events?: string[];
  isActive?: boolean;
  description?: string;
}

interface GetDeliveriesOptions {
  limit?: number;
}

export class WebhooksResource {
  constructor(private http: HTTPClient) {}

  async list(): Promise<WebhookResponse[]> {
    const data = await this.http.get<Record<string, unknown>[]>('/v1/webhooks');
    return Array.isArray(data) ? data.map(mapWebhook) : [];
  }

  async create(options: CreateWebhookOptions): Promise<WebhookCreateResponse> {
    const body: Record<string, unknown> = {
      url: options.url,
      events: options.events,
    };
    if (options.description !== undefined) {
      body.description = options.description;
    }
    const data = await this.http.post<Record<string, unknown>>('/v1/webhooks', body);
    return mapWebhookCreate(data);
  }

  async update(webhookId: string, options: UpdateWebhookOptions): Promise<WebhookResponse> {
    const body: Record<string, unknown> = {};
    if (options.url !== undefined) body.url = options.url;
    if (options.events !== undefined) body.events = options.events;
    if (options.isActive !== undefined) body.is_active = options.isActive;
    if (options.description !== undefined) body.description = options.description;
    const data = await this.http.patch<Record<string, unknown>>(`/v1/webhooks/${webhookId}`, body);
    return mapWebhook(data);
  }

  async delete(webhookId: string): Promise<void> {
    await this.http.delete<Record<string, unknown>>(`/v1/webhooks/${webhookId}`);
  }

  async getDeliveries(webhookId: string, options?: GetDeliveriesOptions): Promise<WebhookDeliveryResponse[]> {
    const params: Record<string, unknown> = {};
    if (options?.limit !== undefined) params.limit = options.limit;
    const data = await this.http.get<Record<string, unknown>[]>(`/v1/webhooks/${webhookId}/deliveries`, params);
    return Array.isArray(data) ? data.map(mapDelivery) : [];
  }
}
