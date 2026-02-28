export interface AgentRegistration {
  agentId: string;
  apiKey: string;
  walletId: string;
  balanceUsdc: string;
  depositAddress?: string;
  registrationUrl: string;
}

export interface AgentInfo {
  agentId: string;
  name: string;
  agentType: string;
  operatorEmail?: string;
  wallet?: Record<string, unknown>;
  depositAddress?: string;
  registrationUrl: string;
  createdAt: string;
}

export interface AgentFundResult {
  walletId: string;
  method: string;
  checkoutUrl?: string;
  depositAddress?: string;
  network?: string;
  usdcContract?: string;
  balanceUsdc: string;
}
