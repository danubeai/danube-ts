# danube

Official TypeScript SDK for [Danube AI](https://danubeai.com) — tool discovery, execution, and integration for AI agents.

## Installation

```bash
npm install danube
```

## Quick Start

```typescript
import { DanubeClient } from 'danube';

const client = new DanubeClient({ apiKey: 'dk_...' });

// Search and execute tools
const tools = await client.tools.search('send email');
const result = await client.tools.execute({
  toolName: 'Gmail - Send Email',
  parameters: { to: 'user@example.com', subject: 'Hello' },
});

// Clean up
client.close();
```

## Configuration

```typescript
const client = new DanubeClient({
  apiKey: 'dk_...',       // or set DANUBE_API_KEY env var
  baseUrl: 'https://...',  // or set DANUBE_API_URL env var (default: https://api.danubeai.com)
  timeout: 30,             // seconds (default: 30)
  maxRetries: 3,           // retry count for transient errors (default: 3)
});
```

## Resources

### Tools

```typescript
// Search tools
const tools = await client.tools.search('weather forecast');

// Search within a service
const tools = await client.tools.search('send', { serviceId: 'service-uuid' });

// Get tool by ID
const tool = await client.tools.get('tool-uuid');

// Execute by ID
const result = await client.tools.execute({
  toolId: 'tool-uuid',
  parameters: { city: 'London' },
});

// Execute by name (searches automatically)
const result = await client.tools.execute({
  toolName: 'Weather - Get Forecast',
  parameters: { city: 'London' },
});
```

### Services

```typescript
const services = await client.services.list({ query: 'email' });
const service = await client.services.get('service-uuid');
const { tools, needsConfiguration } = await client.services.getTools('service-uuid');
```

### Workflows

```typescript
const workflows = await client.workflows.list({ query: 'data pipeline' });
const detail = await client.workflows.get('workflow-uuid');

const execution = await client.workflows.execute('workflow-uuid', {
  query: 'analyze this data',
});

const status = await client.workflows.getExecution(execution.id);
```

### Agent Web (Sites)

```typescript
const sites = await client.sites.search({ query: 'stripe' });
const site = await client.sites.get('site-uuid');
const stripe = await client.sites.getByDomain('stripe.com');
```

### Skills

```typescript
const skills = await client.skills.search('data analysis');
const skill = await client.skills.get({ skillName: 'My Skill' });
```

### Identity

```typescript
const identity = await client.identity.get();
console.log(identity.profile, identity.contacts);
```

### Credentials

```typescript
await client.credentials.store({
  serviceId: 'service-uuid',
  credentialType: 'api_key',
  credentialValue: 'sk-...',
});
```

### Wallet

```typescript
const balance = await client.wallet.getBalance();
console.log(`$${balance.balanceDollars}`);

const transactions = await client.wallet.getTransactions({ limit: 10 });
```

### Agents

```typescript
// Register an autonomous agent (no auth required)
const registration = await client.agents.register({
  name: 'My Agent',
  operatorEmail: 'admin@example.com',
});
console.log(registration.apiKey); // one-time display

// Get agent info (requires API key)
const info = await client.agents.getInfo();

// Fund agent wallet
const fund = await client.agents.fundWallet({
  method: 'card_checkout',
  amountCents: 1000,
});
```

## Error Handling

```typescript
import {
  DanubeClient,
  AuthenticationError,
  NotFoundError,
  RateLimitError,
} from 'danube';

try {
  const result = await client.tools.execute({ toolName: 'My Tool' });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof NotFoundError) {
    console.error(`Not found: ${error.resource}`);
  } else if (error instanceof RateLimitError) {
    console.error(`Rate limited, retry after ${error.retryAfter}s`);
  }
}
```

## Requirements

- Node.js 18+ (uses native `fetch`)
- Zero runtime dependencies

## License

MIT
