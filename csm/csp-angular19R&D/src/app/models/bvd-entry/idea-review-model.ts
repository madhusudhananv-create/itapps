export class IdeaReview {
  ideA_ID: number = 0;
  revieW_COMMENTS: string = '';
  ideA_STATUS_ID: number = 0;
  ideA_STATUS_TITLE: string = '';
  
  // Additional fields for extended functionality
  ideA_REVIEW_ID?: number;
  review_Status?: number;
  revieweD_BY?: string;
  revieweD_DT?: Date;
  createD_BY?: string;
  createD_DT?: Date;
  modifieD_BY?: string;
  modifieD_DT?: Date;
  
  constructor() {}
}
