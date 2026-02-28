import type { HTTPClient } from '../http.js';

export interface ToolRating {
  toolId: string;
  rating: number;
  comment?: string;
  createdAt?: string;
}

export interface RatingAggregate {
  toolId: string;
  averageRating: number;
  totalRatings: number;
  ratingDistribution: Record<string, number>;
}

function mapToolRating(data: Record<string, unknown>): ToolRating {
  return {
    toolId: (data.tool_id ?? '') as string,
    rating: (data.rating ?? 0) as number,
    comment: data.comment as string | undefined,
    createdAt: data.created_at as string | undefined,
  };
}

function mapRatingAggregate(data: Record<string, unknown>): RatingAggregate {
  return {
    toolId: (data.tool_id ?? '') as string,
    averageRating: (data.average_rating ?? 0) as number,
    totalRatings: (data.total_ratings ?? 0) as number,
    ratingDistribution: (data.rating_distribution ?? {}) as Record<string, number>,
  };
}

export class RatingsResource {
  constructor(private http: HTTPClient) {}

  async submit(toolId: string, rating: number, comment?: string): Promise<ToolRating> {
    const body: Record<string, unknown> = { tool_id: toolId, rating };
    if (comment !== undefined) {
      body.comment = comment;
    }
    const data = await this.http.post<Record<string, unknown>>('/v1/ratings', body);
    return mapToolRating(data);
  }

  async getMine(toolId: string): Promise<ToolRating | null> {
    const data = await this.http.get<Record<string, unknown>>(`/v1/ratings/my/${toolId}`);
    if (data.rating == null) {
      return null;
    }
    return mapToolRating(data);
  }

  async getToolRatings(toolId: string): Promise<RatingAggregate> {
    const data = await this.http.get<Record<string, unknown>>(`/v1/ratings/tool/${toolId}`);
    return mapRatingAggregate(data);
  }
}
