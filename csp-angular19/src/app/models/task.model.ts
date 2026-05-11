export interface TaskModel {
  id: number;
  parenT_TASK_ID?: number;
  parenT_EVENT_ID?: number;
  tasK_TYPE_ID: number;
  tasK_CATEGORY_ID: number;
  description: string;
  requiremenT_REFERENCE?: string;
  priority: string;
  scheduleD_START_DATE?: Date;
  scheduleD_DURATION?: number;
  duE_DATE?: Date;
  status: string;
  comments?: string;
  actuaL_START_DATE?: Date;
  actuaL_END_DATE?: Date;
  actuaL_DURATION?: number;
  cusT_ID: string;
  cusT_NM?: string;
  proJ_ID: string;
  proJ_NM?: string;
  owner: string;
  assigneD_TO: string;
  seT_REMINDER?: boolean;
  seT_RECURRENCE?: boolean;
  recurrence?: RecurrenceModel;
  createD_BY?: string;
  createD_ON?: Date;
  modifieD_BY?: string;
  modifieD_ON?: Date;
  isactive?: boolean;
  isTask?: boolean;
  isAllDisabled?: boolean;
  empName?: string;
  ownerName?: string;
  isEmpSelVisible?: boolean;
  isOwner?: boolean;
  isNew?: boolean;
  isAudit?: boolean;
  isMoredetailsShown?: boolean;
  moreText?: string;
  reschedulE_REQUESTER?: string;
  reschedulE_DATE?: Date;
  reschedulE_REASON?: string;
  statuS_PREV?: string;
  reschedulE_DATE_PREV?: Date;
  reschedulE_REQUESTER_PREV?: string;
  reschedulE_REASON_PREV?: string;
  reasoN_FOR_CANCEL?: string;
  iS_DRAFT?: boolean;
  remarks?: string;
}

export interface TaskTypeModel {
  id: number;
  title: string;
  description?: string;
  createD_BY?: string;
  createD_DATE?: Date;
  updateD_BY?: string;
  updateD_DATE?: Date;
  isactive?: boolean;
}

export interface TaskCategoryModel {
  id: number;
  tasK_TYPE_ID?: number;
  title: string;
  description?: string;
  createD_BY?: string;
  createD_DATE?: Date;
  updateD_BY?: string;
  updateD_DATE?: Date;
  isactive?: boolean;
}

export interface RecurrenceModel {
  id?: number;
  tasK_ID?: number;
  starT_DATE?: Date;
  enD_DATE?: Date;
  frequency?: string;
  dailY_IS_MONDAY?: boolean;
  dailY_IS_TUESDAY?: boolean;
  dailY_IS_WEDNESDAY?: boolean;
  dailY_IS_THURSDAY?: boolean;
  dailY_IS_FRIDAY?: boolean;
  dailY_IS_SATURDAY?: boolean;
  dailY_IS_SUNDAY?: boolean;
  weeklY_SELECTED_DAY?: string;
  fortnightlY_SELECTED_DAY?: string;
  monthlY_SELECTED_DAY?: string;
  monthlY_SKIP_DAYS?: number;
  quarterlY_SKIP_DAYS?: number;
  quarterlY_SELECTED_DAY?: string;
  biannuaL_FIRST_SELECTED_DAY?: string;
  biannuaL_FIRST_SKIP_DAYS?: number;
  biannuaL_FIRST_SELECTED_MONTH?: string;
  biannuaL_SECOND_SELECTED_DAY?: string;
  biannuaL_SECOND_SKIP_DAYS?: number;
  biannuaL_SECOND_SELECTED_MONTH?: string;
  annuaL_SELECTED_DAY?: string;
  annuaL_SKIP_DAYS?: number;
  annuaL_SELECTED_MONTH?: string;
}
