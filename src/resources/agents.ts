import type { HTTPClient } from '../http.js';
import type { AgentRegistration, AgentInfo, AgentFundResult } from '../types/agents.js';

interface RegisterOptions {
  name: string;
  operatorEmail: string;
}

interface FundWalletOptions {
  method: string;
  amountCents?: number;
}

function mapRegistration(data: Record<string, unknown>): AgentRegistration {
  return {
    agentId: (data.agent_id ?? '') as string,
    apiKey: (data.api_key ?? '') as string,
    walletId: (data.wallet_id ?? '') as string,
    balanceUsdc: (data.balance_usdc ?? '0') as string,
    depositAddress: data.deposit_address as string | undefined,
    registrationUrl: (data.registration_url ?? '') as string,
  };
}

function mapInfo(data: Record<string, unknown>): AgentInfo {
  return {
    agentId: (data.agent_id ?? '') as string,
    name: (data.name ?? '') as string,
    agentType: (data.agent_type ?? '') as string,
    operatorEmail: data.operator_email as string | undefined,
    wallet: data.wallet as Record<string, unknown> | undefined,
    depositAddress: data.deposit_address as string | undefined,
    registrationUrl: (data.registration_url ?? '') as string,
    createdAt: (data.created_at ?? '') as string,
  };
}

function mapFundResult(data: Record<string, unknown>): AgentFundResult {
  return {
    walletId: (data.wallet_id ?? '') as string,
    method: (data.method ?? '') as string,
    checkoutUrl: data.checkout_url as string | undefined,
    depositAddress: data.deposit_address as string | undefined,
    network: data.network as string | undefined,
    usdcContract: data.usdc_contract as string | undefined,
    balanceUsdc: (data.balance_usdc ?? '0') as string,
  };
}

export class AgentsResource {
  constructor(private http: HTTPClient) {}

  async register(options: RegisterOptions): Promise<AgentRegistration> {
    const data = await this.http.publicPost<Record<string, unknown>>('/v1/agents', {
      name: options.name,
      operator_email: options.operatorEmail,
    });
    return mapRegistration(data);
  }

  async getInfo(): Promise<AgentInfo> {
    const data = await this.http.get<Record<string, unknown>>('/v1/agents/me');
    return mapInfo(data);
  }

  async fundWallet(options: FundWalletOptions): Promise<AgentFundResult> {
    const body: Record<string, unknown> = { method: options.method };
    if (options.amountCents != null) {
      body.amount_cents = options.amountCents;
    }
    const data = await this.http.post<Record<string, unknown>>('/v1/agents/wallets/fund', body);
    return mapFundResult(data);
  }
}
