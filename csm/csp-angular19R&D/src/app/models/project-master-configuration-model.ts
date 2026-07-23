export class ProjectMasterConfigurationModel {
  id: number = 0;
  setting_Name: string = '';
  setting_Type: number = 0;
  min_Threshhold: number = 0;
  max_Threshhold: number = 0;
  values_Collection: string = '';
  isActive: boolean = true;
  created_Date: Date | null = null;
  created_By: string = '';
  updated_Date: Date | null = null;
  updated_By: string = '';
}
