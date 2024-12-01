import { Component, OnInit, Output, ViewChild, EventEmitter, Input } from '@angular/core';
import { myUtility } from '../../../../Shared/myUtility';
import { COODashboardService } from '../../coo-dashboard.service';
import { MatTableDataSource } from '@angular/material';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { debug } from 'util';
import { OverallDashboardStatusComponent } from '../../overall-dashboard-status/overall-dashboard-status.component';
import { COODashboardCommon } from '../../coo-dashboard-common';

@Component({
   selector: 'app-achievementby-customersuccessgoal',
   templateUrl: './achievementby-customersuccessgoal.component.html',
   styleUrls: ['./achievementby-customersuccessgoal.component.scss']
})
export class AchievementByCustomerSuccessGoalComponent implements OnInit {
   progress: boolean;
   _dataModel: any;
   testhtml: string;
   constructor(public _cooDashboardService: COODashboardService,  public _cooDashboardCommon: COODashboardCommon, public _util: myUtility, private _sanitizer: DomSanitizer,
      private _overallDashboardStatusComponent: OverallDashboardStatusComponent) {

   }
   selectedQValue: string = 'Q1';
   @Input() isvisible = false;
   range1: any[] = [2022, 2023];
   startYear = new Date().getFullYear(); 
   onClose() {

   }
   getStatus(score): SafeHtml {
      let ophtml = "";
      if (score >= 95) {
         ophtml = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#32c8f5" class="bi bi-dot" viewBox="0 0 16 16" style="
         margin: -17px;
     "> <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"></path></svg>`;
      }
      else if (score >= 85) {
         ophtml = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#54af4c" class="bi bi-dot" viewBox="0 0 16 16" style="
         margin: -17px;
     "> <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"></path></svg>`;
      }
      else if (score >= 70) {
         ophtml = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#e6ac0c" class="bi bi-dot" viewBox="0 0 16 16" style="
         margin: -17px;
     "> <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"></path></svg>`;
      }
      else {
         ophtml = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#fd5050" class="bi bi-dot" viewBox="0 0 16 16" style="
         margin: -17px;
     "> <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"></path></svg>`;
        
      } this.testhtml = ophtml + "&nbsp;&nbsp;&nbsp;"+score+"%"; 
      return this.transform( ophtml + "&nbsp;&nbsp;&nbsp;"+score+"%");
   }
   transform(value: any) {
     return this._sanitizer.bypassSecurityTrustHtml(value);
   }
   ngOnInit(): void {
      //this._coodashboardService.customerSuccessGoalScore = this._coodashboardService.overallHealthIndex;
      // this.getOverallHealthIndexTrend();
   }

getclass(pers:string)
{
   return pers.toLowerCase()+"Bar";
}
 
   Apply() {
   }
   Reset() {

   }
   ViewBatch_onClick(goal)
   {
      this._overallDashboardStatusComponent.showcsgkpiperformance(goal.goaL_ID);
   }

}
