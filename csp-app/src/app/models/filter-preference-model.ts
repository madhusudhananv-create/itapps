import { ParameterModel } from "./parameter-model";

export class FilterPreferenceModel {
  id:number;
  tablE_NAME:string;
  fielD_NAME: string;
  displaY_NAME: string;
  datA_TYPE: string;
  include: boolean;
  sorting:boolean;
  sortinG_DIRECTION:boolean;
  parameteR_TABLE_NAME:string;
  createD_BY:string;
  createD_DATE:Date;
  updateD_BY:string;
  updateD_DATE:Date;
  isactive:Boolean;
  
  values: ParameterModel[];
  searchString:string;
  searchStringValue:string;
  constructor(name, displayName, enable, dataType, values) {
    this.tablE_NAME = name;
    this.displaY_NAME = displayName;
    this.include = enable;
    this.datA_TYPE = dataType;
    this.values = values;
  }
}