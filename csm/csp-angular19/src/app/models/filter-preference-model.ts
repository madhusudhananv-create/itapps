import { ParameterModel } from "./parameter-model";

export class FilterPreferenceModel {
  id: number = 0;
  tablE_NAME: string = '';
  fielD_NAME: string = '';
  displaY_NAME: string = '';
  datA_TYPE: string = '';
  include: boolean = false;
  sorting: boolean = false;
  sortinG_DIRECTION: boolean = false;
  parameteR_TABLE_NAME: string = '';
  createD_BY: string = '';
  createD_DATE: Date = new Date();
  updateD_BY: string = '';
  updateD_DATE: Date = new Date();
  isactive: Boolean = true;
  
  values: ParameterModel[] = [];
  searchString: string = '';
  searchStringValue: string = '';
  
  constructor(name?: string, displayName?: string, enable?: boolean, dataType?: string, values?: ParameterModel[]) {
    if (name) this.tablE_NAME = name;
    if (displayName) this.displaY_NAME = displayName;
    if (enable !== undefined) this.include = enable;
    if (dataType) this.datA_TYPE = dataType;
    if (values) this.values = values;
  }
}
