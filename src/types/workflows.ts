export interface WorkflowStep {
  stepNumber: number;
  toolId: string;
  toolName: string;
  description: string;
  inputMapping: Record<string, unknown>;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  stepCount: number;
  ownerId: string;
  visibility: string;
  tags: string[];
  totalExecutions: number;
  successRate?: number;
  createdAt?: string;
}

export interface WorkflowDetail {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  ownerId: string;
  visibility: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkflowStepResult {
  stepNumber: number;
  toolId: string;
  toolName: string;
  status: string;
  result?: unknown;
  error?: string;
  executionTimeMs?: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  userId: string;
  status: string;
  inputs: Record<string, unknown>;
  stepResults: WorkflowStepResult[];
  error?: string;
  executionTimeMs?: number;
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
}

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  steps: WorkflowStep[];
  visibility?: string;
  tags?: string[];
}

export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  steps?: WorkflowStep[];
  visibility?: string;
  tags?: string[];
}
