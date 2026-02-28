import type { HTTPClient } from '../http.js';
import type { Skill, SkillContent, SkillFile } from '../types/skills.js';

interface SearchOptions {
  limit?: number;
}

interface GetOptions {
  skillId?: string;
  skillName?: string;
}

function mapSkill(data: Record<string, unknown>): Skill {
  return {
    id: data.id as string,
    name: data.name as string,
    description: (data.description ?? '') as string,
    serviceId: data.service_id as string | undefined,
    metadata: (data.metadata ?? {}) as Record<string, unknown>,
  };
}

function mapSkillFile(data: Record<string, unknown>): SkillFile {
  return {
    name: data.name as string,
    content: data.content as string,
    contentType: data.content_type as string | undefined,
  };
}

function mapSkillContent(data: Record<string, unknown>): SkillContent {
  return {
    id: data.id as string,
    name: data.name as string,
    description: (data.description ?? '') as string,
    skillMd: (data.skill_md ?? data.skill_md_content ?? '') as string,
    scripts: Array.isArray(data.scripts)
      ? (data.scripts as Record<string, unknown>[]).map(mapSkillFile)
      : [],
    references: Array.isArray(data.references)
      ? (data.references as Record<string, unknown>[]).map(mapSkillFile)
      : [],
    assets: Array.isArray(data.assets)
      ? (data.assets as Record<string, unknown>[]).map(mapSkillFile)
      : [],
    license: data.license as string | undefined,
    compatibility: data.compatibility as string | undefined,
    metadata: (data.metadata ?? {}) as Record<string, unknown>,
    serviceId: data.service_id as string | undefined,
  };
}

export class SkillsResource {
  constructor(private http: HTTPClient) {}

  async search(query: string, options?: SearchOptions): Promise<Skill[]> {
    const params: Record<string, unknown> = {
      query,
      limit: options?.limit ?? 10,
    };
    const data = await this.http.get<Record<string, unknown>[]>('/v1/skills/search', params);
    return Array.isArray(data) ? data.map(mapSkill) : [];
  }

  async get(options: GetOptions): Promise<SkillContent> {
    if (options.skillId) {
      const data = await this.http.get<Record<string, unknown>>(`/v1/skills/${options.skillId}`);
      return mapSkillContent(data);
    }
    if (options.skillName) {
      // Search by name and get the first exact match
      const results = await this.search(options.skillName, { limit: 5 });
      const match = results.find(
        (s) => s.name.toLowerCase() === options.skillName!.toLowerCase()
      );
      const skill = match ?? results[0];
      if (!skill) {
        throw new Error(`Skill not found: ${options.skillName}`);
      }
      const data = await this.http.get<Record<string, unknown>>(`/v1/skills/${skill.id}`);
      return mapSkillContent(data);
    }
    throw new Error('Either skillId or skillName must be provided');
  }
}
