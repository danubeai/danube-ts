import type { HTTPClient } from '../http.js';
import type { Tool, ToolResult, BatchToolCall, BatchToolResult } from '../types/tools.js';
import { isValidUuid } from '../utils.js';

interface SearchOptions {
  serviceId?: string;
  limit?: number;
}

interface ExecuteOptions {
  toolId?: string;
  toolName?: string;
  parameters?: Record<string, unknown>;
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

function mapToolResult(data: Record<string, unknown>): ToolResult {
  return {
    success: (data.success ?? data.status === 'success') as boolean,
    result: data.result,
    error: data.error as string | undefined,
    toolId: (data.tool_id ?? data.toolId) as string | undefined,
    toolName: (data.tool_name ?? data.toolName) as string | undefined,
    durationMs: (data.duration_ms ?? data.durationMs) as number | undefined,
    requestId: (data.request_id ?? data.requestId) as string | undefined,
  };
}

export class ToolsResource {
  constructor(private http: HTTPClient) {}

  async search(query: string, options?: SearchOptions): Promise<Tool[]> {
    const params: Record<string, unknown> = {
      query,
      limit: options?.limit ?? 10,
    };
    if (options?.serviceId) {
      params.service_id = options.serviceId;
    }
    const data = await this.http.get<Record<string, unknown>[]>('/v1/tools/search', params);
    return Array.isArray(data) ? data.map(mapTool) : [];
  }

  async get(toolId: string): Promise<Tool> {
    const data = await this.http.get<Record<string, unknown>>(`/v1/tools/${toolId}`);
    return mapTool(data);
  }

  async execute(options: ExecuteOptions): Promise<ToolResult> {
    let toolId = options.toolId;

    if (!toolId && options.toolName) {
      const results = await this.search(options.toolName, { limit: 5 });
      const exactMatch = results.find(
        (t) => t.name.toLowerCase() === options.toolName!.toLowerCase()
      );
      const tool = exactMatch ?? results[0];
      if (!tool) {
        throw new Error(`Tool not found: ${options.toolName}`);
      }
      toolId = tool.id;
    }

    if (!toolId) {
      throw new Error('Either toolId or toolName must be provided');
    }

    // Clean the ID (strip whitespace, quotes)
    toolId = toolId.trim().replace(/^["']|["']$/g, '');

    if (!isValidUuid(toolId)) {
      // Try searching by name as fallback
      const results = await this.search(toolId, { limit: 5 });
      const tool = results[0];
      if (!tool) {
        throw new Error(`Invalid tool ID and no tool found by name: ${toolId}`);
      }
      toolId = tool.id;
    }

    const data = await this.http.post<Record<string, unknown>>(
      `/v1/tools/call/${toolId}`,
      { parameters: options.parameters ?? {} }
    );
    return mapToolResult(data);
  }

  async batchExecute(calls: BatchToolCall[]): Promise<BatchToolResult[]> {
    if (calls.length < 1 || calls.length > 10) {
      throw new Error('Batch calls must contain between 1 and 10 items');
    }

    const payload = calls.map((c) => ({
      tool_id: c.toolId,
      tool_input: c.toolInput ?? {},
    }));

    const data = await this.http.post<Record<string, unknown>>(
      '/v1/tools/call/batch',
      { calls: payload }
    );

    const results = (data.results ?? []) as Record<string, unknown>[];
    return results.map((r) => ({
      toolId: (r.tool_id ?? '') as string,
      success: (r.success ?? false) as boolean,
      result: r.result,
      error: r.error as string | undefined,
    }));
  }
}
