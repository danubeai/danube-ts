export { DanubeClient } from './client.js';
export type { DanubeClientOptions } from './client.js';

// Errors
export {
  DanubeError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ExecutionError,
  ConfigurationRequiredError,
  DanubeConnectionError,
  DanubeTimeoutError,
} from './errors.js';

// Types
export type {
  Parameter,
  Tool,
  ToolResult,
  BatchToolCall,
  BatchToolResult,
  ServiceType,
  Service,
  ServiceToolsResult,
  WorkflowStep,
  Workflow,
  WorkflowDetail,
  WorkflowStepResult,
  WorkflowExecution,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  SiteComponents,
  AgentSite,
  AgentSiteListItem,
  SkillFile,
  Skill,
  SkillContent,
  Contact,
  Identity,
  CredentialStoreResult,
  WalletBalance,
  WalletTransaction,
  AgentRegistration,
  AgentInfo,
  AgentFundResult,
} from './types/index.js';

// Resource types
export type { ToolRating, RatingAggregate } from './resources/ratings.js';
export type { APIKeyResponse, APIKeyWithSecret, APIKeyPermissions } from './resources/api-keys.js';
export type { WebhookResponse, WebhookCreateResponse, WebhookDeliveryResponse } from './resources/webhooks.js';
export type { SpendingLimits } from './resources/wallet.js';
