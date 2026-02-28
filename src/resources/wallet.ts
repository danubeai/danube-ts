import type { HTTPClient } from '../http.js';
import type { WalletBalance, WalletTransaction } from '../types/wallet.js';

export interface SpendingLimits {
  id: string;
  userId: string;
  maxPerCallAtomic: number;
  dailyLimitAtomic: number | null;
  createdAt?: string;
  updatedAt?: string;
}

interface TransactionOptions {
  limit?: number;
  offset?: number;
}

interface UpdateSpendingLimitsOptions {
  maxPerCallAtomic?: number;
  dailyLimitAtomic?: number | null;
}

function mapBalance(data: Record<string, unknown>): WalletBalance {
  return {
    balanceCents: (data.balance_cents ?? 0) as number,
    balanceDollars: (data.balance_dollars ?? 0) as number,
    lifetimeSpentCents: (data.lifetime_spent_cents ?? 0) as number,
    lifetimeDepositedCents: (data.lifetime_deposited_cents ?? 0) as number,
  };
}

function mapTransaction(data: Record<string, unknown>): WalletTransaction {
  return {
    id: data.id as string,
    type: (data.type ?? '') as string,
    amountCents: (data.amount_cents ?? 0) as number,
    balanceAfterCents: (data.balance_after_cents ?? 0) as number,
    referenceId: data.reference_id as string | undefined,
    metadata: (data.metadata ?? {}) as Record<string, unknown>,
    createdAt: data.created_at as string | undefined,
  };
}

function mapSpendingLimits(data: Record<string, unknown>): SpendingLimits {
  return {
    id: (data.id ?? '') as string,
    userId: (data.user_id ?? '') as string,
    maxPerCallAtomic: (data.max_per_call_atomic ?? 5_000_000) as number,
    dailyLimitAtomic: (data.daily_limit_atomic ?? null) as number | null,
    createdAt: data.created_at as string | undefined,
    updatedAt: data.updated_at as string | undefined,
  };
}

export class WalletResource {
  constructor(private http: HTTPClient) {}

  async getBalance(): Promise<WalletBalance> {
    const data = await this.http.get<Record<string, unknown>>('/v1/wallet/balance');
    return mapBalance(data);
  }

  async getTransactions(options?: TransactionOptions): Promise<WalletTransaction[]> {
    const params: Record<string, unknown> = {
      limit: options?.limit ?? 50,
      offset: options?.offset ?? 0,
    };
    const data = await this.http.get<Record<string, unknown>[]>('/v1/wallet/transactions', params);
    return Array.isArray(data) ? data.map(mapTransaction) : [];
  }

  async getSpendingLimits(): Promise<SpendingLimits> {
    const data = await this.http.get<Record<string, unknown>>('/v1/x402/settings');
    return mapSpendingLimits(data);
  }

  async updateSpendingLimits(options: UpdateSpendingLimitsOptions): Promise<SpendingLimits> {
    const body: Record<string, unknown> = {};
    if (options.maxPerCallAtomic !== undefined) body.max_per_call_atomic = options.maxPerCallAtomic;
    if (options.dailyLimitAtomic !== undefined) body.daily_limit_atomic = options.dailyLimitAtomic;
    const data = await this.http.put<Record<string, unknown>>('/v1/x402/settings', body);
    return mapSpendingLimits(data);
  }
}
