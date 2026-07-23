export class ProjectDataConfigurationModel {
  id: number = 0;
  cust_Id: string = '';
  proj_Id: string = '';
  configuration_Setting_Id: number = 0;
  int_Value: number = 0;
  bit_Value: boolean = false;
  string_Value: string = '';
  is_Approved: boolean = false;
  comments: string = '';
  approved_By: string = '';
  approveD_BY_NAME: string = '';
  approval_Comments: string = '';
  end_date: Date | null = null;
  isActive: boolean = true;
  created_Date: string = '';
  created_By: string = '';
  updated_Date: string = '';
  updated_By: string = '';
  isMailApproveReject: boolean = false;
  iS_APPROVAL?: boolean;
}
