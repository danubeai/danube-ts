export interface Parameter {
  name: string;
  description: string;
  type: string;
  location: string;
  required: boolean;
  default?: unknown;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  serviceId: string;
  parameters: Record<string, unknown>;
  isPaid: boolean;
  pricePerCallCents?: number;
  tags: string[];
  method: string;
  tips?: string;
  metadata: Record<string, unknown>;
}

export interface ToolResult {
  success: boolean;
  result?: unknown;
  error?: string;
  toolId?: string;
  toolName?: string;
  durationMs?: number;
  requestId?: string;
}

export interface BatchToolCall {
  toolId: string;
  toolInput?: Record<string, unknown>;
}

export interface BatchToolResult {
  toolId: string;
  success: boolean;
  result?: unknown;
  error?: string;
}
