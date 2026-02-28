import type { HTTPClient } from '../http.js';
import type {
  Workflow,
  WorkflowDetail,
  WorkflowExecution,
  WorkflowStep,
  WorkflowStepResult,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
} from '../types/workflows.js';

interface ListOptions {
  query?: string;
  limit?: number;
}

function mapWorkflow(data: Record<string, unknown>): Workflow {
  return {
    id: data.id as string,
    name: data.name as string,
    description: data.description as string | undefined,
    stepCount: (data.step_count ?? 0) as number,
    ownerId: (data.owner_id ?? '') as string,
    visibility: (data.visibility ?? 'public') as string,
    tags: (data.tags ?? []) as string[],
    totalExecutions: (data.total_executions ?? 0) as number,
    successRate: data.success_rate as number | undefined,
    createdAt: data.created_at as string | undefined,
  };
}

function mapWorkflowStep(data: Record<string, unknown>): WorkflowStep {
  return {
    stepNumber: (data.step_number ?? 0) as number,
    toolId: (data.tool_id ?? '') as string,
    toolName: (data.tool_name ?? '') as string,
    description: (data.description ?? '') as string,
    inputMapping: (data.input_mapping ?? {}) as Record<string, unknown>,
  };
}

function mapWorkflowDetail(data: Record<string, unknown>): WorkflowDetail {
  const steps = Array.isArray(data.steps)
    ? (data.steps as Record<string, unknown>[]).map(mapWorkflowStep)
    : [];
  return {
    id: data.id as string,
    name: data.name as string,
    description: data.description as string | undefined,
    steps,
    ownerId: (data.owner_id ?? '') as string,
    visibility: (data.visibility ?? 'public') as string,
    tags: (data.tags ?? []) as string[],
    createdAt: data.created_at as string | undefined,
    updatedAt: data.updated_at as string | undefined,
  };
}

function mapStepResult(data: Record<string, unknown>): WorkflowStepResult {
  return {
    stepNumber: (data.step_number ?? 0) as number,
    toolId: (data.tool_id ?? '') as string,
    toolName: (data.tool_name ?? '') as string,
    status: (data.status ?? '') as string,
    result: data.result,
    error: data.error as string | undefined,
    executionTimeMs: data.execution_time_ms as number | undefined,
  };
}

function mapExecution(data: Record<string, unknown>): WorkflowExecution {
  const stepResults = Array.isArray(data.step_results)
    ? (data.step_results as Record<string, unknown>[]).map(mapStepResult)
    : [];
  return {
    id: data.id as string,
    workflowId: (data.workflow_id ?? '') as string,
    userId: (data.user_id ?? '') as string,
    status: (data.status ?? '') as string,
    inputs: (data.inputs ?? {}) as Record<string, unknown>,
    stepResults,
    error: data.error as string | undefined,
    executionTimeMs: data.execution_time_ms as number | undefined,
    startedAt: data.started_at as string | undefined,
    completedAt: data.completed_at as string | undefined,
    createdAt: data.created_at as string | undefined,
  };
}

export class WorkflowsResource {
  constructor(private http: HTTPClient) {}

  async list(options?: ListOptions): Promise<Workflow[]> {
    const params: Record<string, unknown> = {
      limit: options?.limit ?? 10,
    };
    if (options?.query) {
      params.query = options.query;
    }
    const data = await this.http.get<Record<string, unknown>[]>('/v1/workflows/public', params);
    return Array.isArray(data) ? data.map(mapWorkflow) : [];
  }

  async get(workflowId: string): Promise<WorkflowDetail> {
    const data = await this.http.get<Record<string, unknown>>(`/v1/workflows/${workflowId}`);
    return mapWorkflowDetail(data);
  }

  async execute(
    workflowId: string,
    inputs?: Record<string, unknown>
  ): Promise<WorkflowExecution> {
    const data = await this.http.post<Record<string, unknown>>(
      `/v1/workflows/${workflowId}/execute`,
      { inputs: inputs ?? {} }
    );
    return mapExecution(data);
  }

  async getExecution(executionId: string): Promise<WorkflowExecution> {
    const data = await this.http.get<Record<string, unknown>>(
      `/v1/workflows/executions/${executionId}`
    );
    return mapExecution(data);
  }

  async create(request: CreateWorkflowRequest): Promise<WorkflowDetail> {
    const steps = request.steps.map((s) => ({
      step_number: s.stepNumber,
      tool_id: s.toolId,
      tool_name: s.toolName,
      description: s.description,
      input_mapping: s.inputMapping,
    }));

    const data = await this.http.post<Record<string, unknown>>('/v1/workflows', {
      name: request.name,
      description: request.description ?? '',
      steps,
      visibility: request.visibility ?? 'private',
      tags: request.tags ?? [],
    });
    return mapWorkflowDetail(data);
  }

  async update(
    workflowId: string,
    updates: UpdateWorkflowRequest
  ): Promise<WorkflowDetail> {
    const body: Record<string, unknown> = {};
    if (updates.name !== undefined) body.name = updates.name;
    if (updates.description !== undefined) body.description = updates.description;
    if (updates.visibility !== undefined) body.visibility = updates.visibility;
    if (updates.tags !== undefined) body.tags = updates.tags;
    if (updates.steps !== undefined) {
      body.steps = updates.steps.map((s) => ({
        step_number: s.stepNumber,
        tool_id: s.toolId,
        tool_name: s.toolName,
        description: s.description,
        input_mapping: s.inputMapping,
      }));
    }

    const data = await this.http.patch<Record<string, unknown>>(
      `/v1/workflows/${workflowId}`,
      body
    );
    return mapWorkflowDetail(data);
  }

  async delete(workflowId: string): Promise<void> {
    await this.http.delete(`/v1/workflows/${workflowId}`);
  }
}
