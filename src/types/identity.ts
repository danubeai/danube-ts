export interface Contact {
  name: string;
  email: string;
  phone?: string;
  relationship?: string;
  company?: string;
  notes?: string;
  nickname?: string;
  source: string;
}

export interface Identity {
  profile: Record<string, unknown>;
  keyPeople: Contact[];
  contacts: Contact[];
  preferences: Record<string, unknown>;
  raw: Record<string, unknown>;
}
