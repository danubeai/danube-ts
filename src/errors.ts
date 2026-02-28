export class DanubeError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'DanubeError';
    this.statusCode = statusCode;
  }
}

export class AuthenticationError extends DanubeError {
  constructor(message = 'Invalid or missing API key') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends DanubeError {
  constructor(message = 'Permission denied') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends DanubeError {
  resource: string;
  identifier: string;

  constructor(resource: string, identifier: string, message?: string) {
    super(message ?? `${resource} not found: ${identifier}`, 404);
    this.name = 'NotFoundError';
    this.resource = resource;
    this.identifier = identifier;
  }
}

export class ValidationError extends DanubeError {
  constructor(message = 'Invalid request parameters') {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends DanubeError {
  retryAfter?: number;

  constructor(message = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 429);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class ExecutionError extends DanubeError {
  toolId?: string;

  constructor(message: string, toolId?: string) {
    super(message, 500);
    this.name = 'ExecutionError';
    this.toolId = toolId;
  }
}

export class ConfigurationRequiredError extends DanubeError {
  serviceId: string;
  serviceName: string;

  constructor(message: string, serviceId: string, serviceName: string) {
    super(message, 403);
    this.name = 'ConfigurationRequiredError';
    this.serviceId = serviceId;
    this.serviceName = serviceName;
  }
}

export class DanubeConnectionError extends DanubeError {
  constructor(message = 'Failed to connect to Danube API') {
    super(message, 503);
    this.name = 'DanubeConnectionError';
  }
}

export class DanubeTimeoutError extends DanubeError {
  constructor(message = 'Request timed out') {
    super(message, 504);
    this.name = 'DanubeTimeoutError';
  }
}
