export interface SkillFile {
  name: string;
  content: string;
  contentType?: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  serviceId?: string;
  metadata: Record<string, unknown>;
}

export interface SkillContent {
  id: string;
  name: string;
  description: string;
  skillMd: string;
  scripts: SkillFile[];
  references: SkillFile[];
  assets: SkillFile[];
  license?: string;
  compatibility?: string;
  metadata: Record<string, unknown>;
  serviceId?: string;
}
