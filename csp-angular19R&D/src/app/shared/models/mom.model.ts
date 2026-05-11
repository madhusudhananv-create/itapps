export class MOM_DETAIL {
  id: number = 0;
  customeR_ID: number = 0;
  projecT_ID: number = 0;
  discussioN_POINTS: string = '';
  actioN_ITEM: string = '';
  priority: string = '';
  responsibility: number = 0;
  targeT_DATE: Date | null = null;
}

export class MOM {
  createD_BY: string = '';
  meetinG_DATE: Date | null = null;
  meetinG_TIME: string = '';
  meetinG_DESCRIPTION: string = '';
  meetinG_VENUE: string = '';
  chairperson: string = '';
  meetinG_AGENDA: string = '';
  status: string = '';
  meetinG_PARTICIPANTS: string = '';
  moM_ITEMS: MOM_DETAIL[] = [];
}
