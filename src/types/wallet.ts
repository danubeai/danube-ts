export interface WalletBalance {
  balanceCents: number;
  balanceDollars: number;
  lifetimeSpentCents: number;
  lifetimeDepositedCents: number;
}

export interface WalletTransaction {
  id: string;
  type: string;
  amountCents: number;
  balanceAfterCents: number;
  referenceId?: string;
  metadata: Record<string, unknown>;
  createdAt?: string;
}
