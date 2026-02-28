import type { HTTPClient } from '../http.js';
import type { WalletBalance, WalletTransaction } from '../types/wallet.js';

interface TransactionOptions {
  limit?: number;
  offset?: number;
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
}
