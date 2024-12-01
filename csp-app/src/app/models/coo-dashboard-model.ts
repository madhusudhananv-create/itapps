import { List } from "sp-pnp-js";

export class DashboardSearchParams {
  PROJ_IDS: string[];
  CUST_ID: string[];
  START_DATE: Date;
  END_DATE: Date;
  ALL_PROJECTS: boolean = true;
  GOAL_ID:number =0;
}
export class NameValuePair {
  Name: string;
  value: number;
  constructor(Name: string, value: number) {
    this.Name = Name;
    this.value = value;
  }
}
export class SuccessGoalScoresMain {
curQtr:Number;
lastQtr:Number;
YTM:Number;
}

export class CustomerIDNMList{
  cusT_ID : string;
  cusT_NM: String; 
}
export class SuccessGoalScoresSmall {
  curQtr:Number;
  lastQtr:Number;
  YTM:Number;
  }

export class CustomerProjectsScores{
  custID : string;
  custName: String;
  score: Number; 
  portfolioScores :PortfolioScores[]; 
  isExpanded: boolean;
}

export class PortfolioScores{
  portfolioID : string;
  portfolioName: String;
  score: Number;  
  projScores :ProjectScores[]; 
  isExpanded: boolean;
}
export class ProjectScores{
  projID : string;
  projName: String;
  score: Number; 
}