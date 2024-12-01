import { enumDateRange } from "../Shared/enum";

export class TimesheetTypeModel {
    period: enumDateRange; // = enumDateRange.Monthly;
    dateRange:DateRangeModel[] = [];
    selectedDateRange:DateRangeModel = new DateRangeModel();
    selectedDates:string[]=[];
    dayLimit:number; // 
}
export class DateRangeModel {
    startDate: Date = new Date();
    endDate: Date = new Date();
    displayName: string="";
    current: boolean=false;
}

