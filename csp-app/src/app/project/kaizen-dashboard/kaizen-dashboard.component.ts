import { Component, OnInit, Input } from '@angular/core';
import { myUtility } from '../../Shared/myUtility';
import { AppsService } from '../../Services/apps.service';

@Component({
  selector: 'app-kaizen-dashboard',
  templateUrl: './kaizen-dashboard.component.html',
  styleUrls: ['./kaizen-dashboard.component.scss']
})
export class KaizenDashboardComponent implements OnInit {
  ddyear: number[]
  selectedQuarter: string = "Q1";
  selectedYear: number = this._util.Year()
  @Input('customerId') custId : string;
  @Input('ProjectIds') projectIds: string[];
  selectedOption:string = "quarter";
  autoTicks = false;
  disabled = false;
  invert = false;
  max = 15;
  min = 0;
  kaizanData:any;
  showTicks = false;
  step = 5;
  value = 0;
  vertical = false;
  constructor(private _util: myUtility ,private _appService :AppsService) { }

  ngOnInit() {
    this.ddyear = this._util.Years(3);
    this.selectedYear = this._util.Year();
    this.getInnovationData()
  }
  ngOnChanges() {
    this.getInnovationData()
  }
  radioChange(event)
  {
    this.selectedOption = event.value;
    this.getInnovationData();
  }
  getInnovationData()
  {
    this._appService.getInnovationsForProject(this.custId,this.projectIds,this.selectedYear,this.value,this.selectedOption).subscribe(
      data => {
        this.kaizanData = data;
      },
      error => { this._util.serviceError(error); });
  }
  formatLabel(value: number | null) {
    if (value == 0) 
        return 'Q1';
    else  if (value == 5)
        return 'Q2';
    else if (value == 10) {
      return 'Q3';
    }
    else if(value ==15)
      return 'Q4'
    return value;
  }
  onInputChange(event)
  {
    this.value = event.value;
    this.getInnovationData();
  }
}
