import { useState, useEffect, useCallback } from 'react';
import { activityService } from '../services/activityService';
import type { AcceptedScoreInfo } from '../services/activityService';

const EMPTY_REVIEW: AcceptedScoreInfo = {
  acceptedScore: undefined,
  scoreReviewed: false,
  acceptedScoreComment: '',
};

interface UseAcceptedScoreProps {
  projectId?: string;
  practice?: string;
}

/**
 * Loads and saves the admin-reviewed Accepted Score for a project + practice.
 * The review lives on the activity rows, so it is saved on its own and can't
 * overwrite project info (AI Adoption Metrics) the way a project-info upsert did.
 */
export const useAcceptedScore = ({
  projectId,
  practice,
}: UseAcceptedScoreProps) => {
  const [review, setReview] = useState<AcceptedScoreInfo>(EMPTY_REVIEW);

  useEffect(() => {
    if (!projectId || !practice) {
      setReview(EMPTY_REVIEW);
      return;
    }

    let cancelled = false;
    activityService
      .getAcceptedScore(projectId, practice)
      .then((info) => {
        if (!cancelled) setReview(info);
      })
      .catch(() => {
        if (!cancelled) setReview(EMPTY_REVIEW);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, practice]);

  const saveReview = useCallback(
    async (info: AcceptedScoreInfo) => {
      if (!projectId || !practice) {
        throw new Error('Project and practice are required');
      }
      await activityService.updateAcceptedScore(projectId, practice, info);
      setReview(info);
    },
    [projectId, practice]
  );

  return { review, saveReview };
};
