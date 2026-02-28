import type { HTTPClient } from '../http.js';
import type { CredentialStoreResult } from '../types/credentials.js';

interface StoreOptions {
  serviceId: string;
  credentialType: string;
  credentialValue: string;
}

function mapResult(data: Record<string, unknown>): CredentialStoreResult {
  return {
    success: (data.success ?? true) as boolean,
    serviceId: (data.service_id ?? '') as string,
    serviceName: (data.service_name ?? '') as string,
    credentialType: (data.credential_type ?? '') as string,
  };
}

export class CredentialsResource {
  constructor(private http: HTTPClient) {}

  async store(options: StoreOptions): Promise<CredentialStoreResult> {
    const data = await this.http.post<Record<string, unknown>>('/v1/credentials/store', {
      service_id: options.serviceId,
      credential_type: options.credentialType,
      credential_value: options.credentialValue,
    });
    return mapResult(data);
  }
}
