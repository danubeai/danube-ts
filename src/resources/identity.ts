import type { HTTPClient } from '../http.js';
import type { Contact, Identity } from '../types/identity.js';

function mapContact(data: Record<string, unknown>): Contact {
  return {
    name: (data.name ?? '') as string,
    email: (data.email ?? '') as string,
    phone: data.phone as string | undefined,
    relationship: data.relationship as string | undefined,
    company: data.company as string | undefined,
    notes: data.notes as string | undefined,
    nickname: data.nickname as string | undefined,
    source: (data.source ?? '') as string,
  };
}

function mapIdentity(data: Record<string, unknown>): Identity {
  const keyPeople = Array.isArray(data.key_people)
    ? (data.key_people as Record<string, unknown>[]).map(mapContact)
    : [];
  const contacts = Array.isArray(data.contacts)
    ? (data.contacts as Record<string, unknown>[]).map(mapContact)
    : [];
  return {
    profile: (data.profile ?? {}) as Record<string, unknown>,
    keyPeople,
    contacts,
    preferences: (data.preferences ?? {}) as Record<string, unknown>,
    raw: data as Record<string, unknown>,
  };
}

export class IdentityResource {
  constructor(private http: HTTPClient) {}

  async get(): Promise<Identity> {
    const data = await this.http.get<Record<string, unknown>>('/v1/identity/api');
    return mapIdentity(data);
  }
}
