import { aimiApiClient } from '@shared/services/aimiApiClient';

// Backs the admin Review Score page. Reads a project's activities (every practice, with and
// without an entered score) and saves the per-activity accepted scores in one transaction.

const ENDPOINTS = {
  GET_ACTIVITIES: '/api/AllSys/GetAimiActivities',
  UPDATE_ACCEPTED_SCORES: '/api/AllSys/UpdateAimiActivityAcceptedScores',
};

/** One activity as the review page needs it. */
export interface ReviewActivity {
  id: number;
  practice: string;
  sdlcPhase: string;
  activity: string;
  applicability: string;
  /** Score the project entered. null = activity has no score (blank or N/A). */
  enteredScore: number | null;
  /** Score the admin accepted. null = not reviewed yet. */
  acceptedScore: number | null;
  comment: string;
  status: string;
}

export interface ReviewChange {
  id: number;
  acceptedScore: number | null;
  comment: string;
}

interface ApiRow {
  ID: number;
  PRACTICE: string;
  SDLC_PHASE: string;
  ACTIVITY: string;
  APPLICABILITY: string | null;
  AI_ADOPTION_SCORE: number | null;
  STATUS: string | null;
  ACCEPTED_SCORE: number | null;
  ACCEPTED_SCORE_COMMENT: string | null;
}

export const scoreReviewService = {
  /** Every activity of a project, across all of its practices. */
  getProjectActivities: async (projectId: string): Promise<ReviewActivity[]> => {
    const rows =
      (await aimiApiClient.get<ApiRow[]>(ENDPOINTS.GET_ACTIVITIES, {
        projectId,
      })) ?? [];
    return rows.map((r) => ({
      id: r.ID,
      practice: r.PRACTICE,
      sdlcPhase: r.SDLC_PHASE,
      activity: r.ACTIVITY,
      applicability: r.APPLICABILITY ?? '',
      enteredScore:
        r.AI_ADOPTION_SCORE === null || r.AI_ADOPTION_SCORE === undefined
          ? null
          : Number(r.AI_ADOPTION_SCORE),
      acceptedScore:
        r.ACCEPTED_SCORE === null || r.ACCEPTED_SCORE === undefined
          ? null
          : Number(r.ACCEPTED_SCORE),
      comment: r.ACCEPTED_SCORE_COMMENT ?? '',
      status: r.STATUS ?? 'submitted',
    }));
  },

  /** Saves every change in one call; the API rejects the whole batch if any entry is invalid. */
  saveReviews: async (changes: ReviewChange[]): Promise<void> => {
    if (changes.length === 0) return;
    await aimiApiClient.post(ENDPOINTS.UPDATE_ACCEPTED_SCORES, {
      ITEMS: changes.map((c) => ({
        ID: c.id,
        ACCEPTED_SCORE: c.acceptedScore,
        ACCEPTED_SCORE_COMMENT: c.comment.trim() || null,
      })),
    });
  },
};

/**
 * Overall score for a set of activities, the same rule everywhere: average over activities that
 * are not in the 'NA' phase and have a score. `pick` chooses which score each activity counts.
 */
export const averageScore = (
  activities: ReviewActivity[],
  pick: (a: ReviewActivity) => number | null
): number | null => {
  const scores = activities
    .filter((a) => a.sdlcPhase !== 'NA')
    .map(pick)
    .filter((s): s is number => s !== null);
  if (scores.length === 0) return null;
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
};
