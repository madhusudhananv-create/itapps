import { Component, OnInit, Input } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatSort, MatDialogConfig, MatDialog } from '@angular/material';
import { AppsService } from './../../../../Services/apps.service';
import { ActivatedRoute } from '@angular/router';
import { myUtility } from './../../../../Shared/myUtility';
import { CustomerModel, ResourcesSummary } from '../../../../models/customer-model';

@Component({
  selector: 'app-cssnpsdetails-table',
  templateUrl: './cssnpsdetails-table.component.html',
  styleUrls: ['./cssnpsdetails-table.component.scss']
})
export class CSSNPSDetailsTableComponent implements OnInit {

  //dataSource: MatTableDataSource<any>;
  displayedColumns = ['respondant_NAME', 'project_NAME', 'csS1', 'npS1','csS2', 'npS2','csS3', 'npS3','csS4', 'npS4'];   
  heatMapData : any;
  showNPSDetails : boolean = false;
  showCSSNPSTooltip : boolean = false;

  showNPSTooltip : boolean = false;

  customerList: CustomerModel[] = [];
  custId: string[];
  vcustomerids : string[];
  customerids : string[] = [];
  customerid : string;

lastQuarter : any;
currentQuarter : any;

quarter1 : any;
quarter2 : any;

  @Input() dataSource : MatTableDataSource<any>;
  @Input() isDataAvailable : boolean;
  @Input() Category : string;
  @Input() NoData : string;

  ID:number;
  qualityScore : number;
  cssQualityFeedback : string;
  successScore : string;
  cssSuccesssFeedback : string;
  valueaddScore : string;
  cssValueaddFeedback : string;
  npsFeedback : string;

  csatQuestion1 : string;
  csatQuestion2 : string;
  csatQuestion3 : string;
  npsQuestion : string;
  feedback : string;

 
  
  constructor(private route: ActivatedRoute,private _appservice: AppsService,public _util: myUtility) { }

  ngOnInit() {

        this.service_LoadCustomerByEmpIdByCustomerId(this.customerid);

  }


  service_LoadCustomerByEmpIdByCustomerId(customerid) {
    
    this._util.determineCustIdsBasedOnRole().subscribe(
      data => {
        this.customerids = data;
        this.custId = this.customerids;
        this.vcustomerids = this.customerids;
        this.getNPSScoreDataRange();
      },
      (error) => {}
    )    
  }


getNPSScoreDataRange()
  {
    var vQuarter1 = "";
    var vQuarter2 = "";
    
    this._appservice.getNPSScoreDataRange("NetPromotorScore-ViewDetails",vQuarter1,vQuarter2,this.custId).subscribe(data => {    
    this.heatMapData = data;   

      this.currentQuarter = this.heatMapData.currentQuarter;
      this.lastQuarter = this.heatMapData.lastQuarter;     

      this.quarter1 = this.heatMapData.quarter1;
      this.quarter2 = this.heatMapData.quarter2; 

      
      
  
    }, error => {//console.log(error);
      this._util.serviceError(error); });
  }

  getSpecificCSSNPSScores(ID : any,quarter : number)  {     
     
     
     var ObjqualityScore = this.heatMapData.listNPSViewDetails.filter((NPSViewDetails) => NPSViewDetails.id==ID);
     this.qualityScore = ObjqualityScore[0].qualityScore3;

     return this.heatMapData.listNPSViewDetails.filter((NPSViewDetails) => NPSViewDetails.id==ID);
  }


  closePopup(popupName : string) {    
    
    
      if(popupName=="showNPSTooltip")
        this.showNPSTooltip = false;  

     if(popupName=="showCSSNPSTooltip")
        this.showCSSNPSTooltip = false;  
      
  }


  ShowNPSTooltip(id : number,pos : number)
  {
      this.ID = id;
      var ObjqualityScore = this.heatMapData.listNPSViewDetails.filter((NPSViewDetails) => NPSViewDetails.id==this.ID);
            
      if(pos == 1)      
        this.npsFeedback = ObjqualityScore[0].npsFeedback1;   

      if(pos == 2)      
        this.npsFeedback = ObjqualityScore[0].npsFeedback2;    

      if(pos == 3)      
        this.npsFeedback = ObjqualityScore[0].npsFeedback3; 

      if(pos == 4)      
        this.npsFeedback = ObjqualityScore[0].npsFeedback4; 
     
      this.showNPSTooltip = !this.showNPSTooltip;  
      this.showCSSNPSTooltip = false;     
      
  }


  ShowCSSNPSTooltip(id : number,pos : number)
  {
      this.ID = id;
      var ObjqualityScore = this.heatMapData.listNPSViewDetails.filter((NPSViewDetails) => NPSViewDetails.id==this.ID);
      
      
//console.log("ObjqualityScore", ObjqualityScore);
      
      
      this.csatQuestion1 = ObjqualityScore[0].csatQuestion1;
      this.csatQuestion2 = ObjqualityScore[0].csatQuestion1;;
      this.csatQuestion3 = ObjqualityScore[0].csatQuestion1;;
      this.npsQuestion = ObjqualityScore[0].npsQuestion1;
      
      
      if(pos == 1)
      {
      this.qualityScore = ObjqualityScore[0].qualityScore1;      
      this.cssQualityFeedback = ObjqualityScore[0].cssQualityFeedback1;
      this.successScore = ObjqualityScore[0].successScore1;
      this.cssSuccesssFeedback = ObjqualityScore[0].cssSuccesssFeedback1;
      this.valueaddScore = ObjqualityScore[0].valueaddScore1;
      this.cssValueaddFeedback = ObjqualityScore[0].cssValueaddFeedback1;
      this.feedback = ObjqualityScore[0].feedback1;
      }
     
      if(pos == 2)
      {
      this.qualityScore = ObjqualityScore[0].qualityScore2;      
      this.cssQualityFeedback = ObjqualityScore[0].cssQualityFeedback2;
      this.successScore = ObjqualityScore[0].successScore2;
      this.cssSuccesssFeedback = ObjqualityScore[0].cssSuccesssFeedback2;
      this.valueaddScore = ObjqualityScore[0].valueaddScore2;
      this.cssValueaddFeedback = ObjqualityScore[0].cssValueaddFeedback2;
      this.feedback = ObjqualityScore[0].feedback2;
    }
    
    if(pos == 3)
      {
      this.qualityScore = ObjqualityScore[0].qualityScore3;      
      this.cssQualityFeedback = ObjqualityScore[0].cssQualityFeedback3;
      this.successScore = ObjqualityScore[0].successScore3;
      this.cssSuccesssFeedback = ObjqualityScore[0].cssSuccesssFeedback3;
      this.valueaddScore = ObjqualityScore[0].valueaddScore3;
      this.cssValueaddFeedback = ObjqualityScore[0].cssValueaddFeedback3;
      this.feedback = ObjqualityScore[0].feedback3;
    }
    
    if(pos == 4)
      {
      this.qualityScore = ObjqualityScore[0].qualityScore4;      
      this.cssQualityFeedback = ObjqualityScore[0].cssQualityFeedback4;
      this.successScore = ObjqualityScore[0].successScore4;
      this.cssSuccesssFeedback = ObjqualityScore[0].cssSuccesssFeedback4;
      this.valueaddScore = ObjqualityScore[0].valueaddScore4;
      this.cssValueaddFeedback = ObjqualityScore[0].cssValueaddFeedback4;
      this.feedback = ObjqualityScore[0].feedback4;
      }

      this.showNPSTooltip = false;  
      this.showCSSNPSTooltip = !this.showCSSNPSTooltip;      

  }



}
