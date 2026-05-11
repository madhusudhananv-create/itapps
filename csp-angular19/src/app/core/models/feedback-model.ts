export class FeedbackModel {
  id?: number;
  customeR_ID?: string;
  customeR_EMAILID?: string;
  feedback?: string;
  status?: string;
  comments?: string;
  createD_BY?: string
  createD_DATE?: Date;
  updateD_BY?: string;
  updateD_DATE?: Date;
  targeT_DATE?: Date;
  isactive?: Boolean;
  tickeT_ID?: string;
}
