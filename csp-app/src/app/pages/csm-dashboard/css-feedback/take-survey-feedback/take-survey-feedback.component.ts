import { Component, OnInit,Input,SimpleChanges} from '@angular/core';
import { myUtility } from '../../../../Shared/myUtility';
import { AppsService } from '../../../../Services/apps.service';
import { ProjectsModel } from '../../../../models/projects-model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-take-survey-feedback',
  templateUrl: './take-survey-feedback.component.html',
  styleUrls: ['./take-survey-feedback.component.scss']
})
export class TakeSurveyFeedbackComponent implements OnInit {
  tableYear: number = this._util.Year();
  detailmonthly = [];
  input_customerid: string;
  allproj: boolean = false;
  generateResults: boolean = false;
  projNames: ProjectsModel[];
  _loading: boolean = false;
  panelExpand:boolean[]=[];
  companyName = environment.company_name;
  // isOpen: boolean;
  // @Input() value: number = 0

  // public circumference: number = 2 * Math.PI * 47
  // public strokeDashoffset: number = 73

  ngOnChanges(changes: SimpleChanges) {
    // if (changes['value']) {
    //   this.onPercentageChanged(changes['value'].currentValue)
    // }
  }

  // onPercentageChanged(val: number) {
  //   const offset = this.circumference - (val / 100) * this.circumference
  //   this.strokeDashoffset = offset
  // }
  constructor(public _util: myUtility,private _appService: AppsService) { }

  ngOnInit() {
  }
  
//   navOpen($event) {
// this.isOpen = !this.isOpen;
//   }
  // type = 'PieChart';
  // data: any[] = [
  //   ['', 43],
  //   ['', 43],
  //   ['', 14]
  // ]
  // columnNames = ['', ''];
  // width = 72;
  // height = 78;
  // options: google.visualization.PieChartOptions = {
    
  //   chartArea: { 'width': '100%', 'height': '80%' },
  //   legend: {
  //     position: 'right', alignment: 'center', textStyle: {
  //       fontSize: 9, bold: true
  //     }
  //   },
  //   tooltip: {       trigger: 'selection'     },  
  //   pieSliceBorderColor: 'transparent',
  //   pieSliceText: 'value',
  //   pieSliceTextStyle: { fontSize: 9 }
  // };
  ShowQuarterlyTable() {
    if (this.detailmonthly != undefined)
      for (var i = 0; i < this.detailmonthly.length; i++) {
       
          return true;
      }

    return false;
  }
  getAllProjectsFromCustomer() {
    this._appService.GetCustomerProjectsName(this.input_customerid, this.allproj).subscribe(
      data => {
        this.projNames = data;
        if (this.projNames != undefined && this.projNames != null && this.projNames.length > 0) {

          if (this.generateResults)
            this.ApplyFilter();
        }



      },
      error => {
        // this.showGetDetails=true;

        this._util.serviceError(error);
      }
    )

  }
  ApplyFilter() {
    this._loading = true;
    this.panelExpand=[];
  }
}