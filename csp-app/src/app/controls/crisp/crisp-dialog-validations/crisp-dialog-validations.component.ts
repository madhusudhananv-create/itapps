import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crisp-dialog-validations',
  templateUrl: './crisp-dialog-validations.component.html',
  styleUrls: ['./crisp-dialog-validations.component.scss']
})
export class CrispDialogValidationsComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private _router: Router) {

    
   }

  ngOnInit() {
    console.log(this.data);
    console.log(this.data.summary.cusT_ID);
  }

  navigate(val){
    
    let url ='';
    if(val.criteriA_ID ==1){
      url = "/kpi/" + this.data.summary.cusT_ID ;
    }
    else if(val.criteriA_ID ==2){
      url = "/kpi/" + this.data.summary.cusT_ID ;
    }
    else if(val.criteriA_ID ==3){
      url = "/layout/risk/" + this.data.summary.cusT_ID ; 
    }
    else if(val.criteriA_ID ==4){
      url = "/layout/issues/" + this.data.summary.cusT_ID ; 
    }
    else if(val.criteriA_ID ==5){
      url = "/layout/ideas/" + this.data.summary.cusT_ID ; 
    }
    else if(val.criteriA_ID ==6){
      url = "/layout/ideas/" + this.data.summary.cusT_ID ; 
    }
    else if(val.criteriA_ID ==7){
      
    }
    else if(val.criteriA_ID ==8){
      
    }
    else if(val.criteriA_ID ==9){
      
    }
    else if(val.criteriA_ID ==10){
      url = "/layout/mandatorytrainingreport/" + this.data.summary.cusT_ID +"/" + this.data.summary.projecT_ID;   
    }
    else if(val.criteriA_ID ==11){
      url = "/layout/checklistfindings/" + this.data.summary.cusT_ID ;   
    }

    if(url!='')
      window.open(url,'_blank');
  }

}
