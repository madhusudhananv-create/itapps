import { Component, OnInit } from '@angular/core';
import { ViewChild} from '@angular/core';
import {MatAccordion} from '@angular/material/expansion';
import { myUtility } from '../../../Shared/myUtility';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-help-page',
  templateUrl: './help-page.component.html',
  styleUrls: ['./help-page.component.scss'],
  
})
export class HelpPageComponent implements OnInit {
  togglebtn: boolean= false;
  togglebtnpa: boolean= false;
  togglebtnsa: boolean= false;
  togglebtnpspd: boolean= false;
  togglebtnck: boolean= false;
  togglebtnplanner:  boolean= false;
  BrowserModule;
  @ViewChild(MatAccordion) accordion: MatAccordion;
  // showSAMenu : boolean = false;
  // showPMMenu: boolean = false;
  // showPPMenu : boolean = false; 
  // showPSPDMenu : boolean = false; 
  // showChkMenu : boolean = false; 
  menuToggleStatus: boolean;

  constructor( private _router: Router,public _util: myUtility){

  }

  

 ngOnInit()
 {
   
 }
 
 logout() {
  if (confirm("Are you sure you want to log out?")) {
    if (this._util.IsGAVS()) {
      this.service_Logout();
      let loginurl = 'https://login.microsoftonline.com/' + environment.tenantid + '/oauth2/logout?post_logout_redirect_uri=' + environment.loginpage;
      window.location.href = loginurl;
    }
    else {
      this.service_Logout();
      this._router.navigateByUrl('/login');
    }
  }
}
onMenuToggleChange(value: boolean) {
  this.menuToggleStatus = value;
}
service_Logout() {
  // this.surveyService.Logout().subscribe(data => {
  //   this._util.empid('');
  //   this._util.displayname('');
  //   this._util.token('');
  // }, error => { this._util.serviceError(error); });
}

toggleProcessModel(){
  this.togglebtn=!this.togglebtn;
  this.togglebtnpa=false;
  this.togglebtnsa=false;
  this.togglebtnpspd=false;
  this.togglebtnck=false;
  this.togglebtnplanner=false;
}

toggleProcessArea(){
  this.togglebtn=false;
  this.togglebtnpa=!this.togglebtnpa;
  this.togglebtnsa=false;
  this.togglebtnpspd=false;
  this.togglebtnck=false;
  this.togglebtnplanner=false;
}
toggleServiceArea(){
  this.togglebtn=false;
  this.togglebtnpa=false;
  this.togglebtnsa=!this.togglebtnsa;
  this.togglebtnpspd=false;
  this.togglebtnck=false;
  this.togglebtnplanner=false;
}
togglebtnPSPD(){
  this.togglebtn=false;
  this.togglebtnpa=false;
  this.togglebtnsa=false;
  this.togglebtnpspd=!this.togglebtnpspd;
  this.togglebtnck=false;
  this.togglebtnplanner=false; 
}
togglebtnChecklist(){
  this.togglebtn=false;
  this.togglebtnpa=false;
  this.togglebtnsa=false;
  this.togglebtnpspd=false;
  this.togglebtnck=!this.togglebtnck;
  this.togglebtnplanner=false; 
}
togglebtnPlanner(){
  this.togglebtn=false;
  this.togglebtnpa=false;
  this.togglebtnsa=false;
  this.togglebtnpspd=false;
  this.togglebtnck=false;
  this.togglebtnplanner=!this.togglebtnplanner; 
}

 onClick1(){
  let x = document.querySelector("#topic1");
  if (x){
      x.scrollIntoView();
  }
}
  onClick2(){
    let x = document.querySelector("#topic2");
    if (x){
        x.scrollIntoView();
    }
}

onClick3(){
  let x = document.querySelector("#topic3");
  if (x){
      x.scrollIntoView();
  }
}
onClick4(){
  let x = document.querySelector("#topic4");
  if (x){
      x.scrollIntoView();
  }
}

onClick5(){
  let x = document.querySelector("#topic5");
  if (x){
      x.scrollIntoView();
  }
}

onClick6(){
  let x = document.querySelector("#topic6");
  if (x){
      x.scrollIntoView();
  }
}

onClick7(){
  let x = document.querySelector("#topic7");
  if (x){
      x.scrollIntoView();
  }
}

onClick8(){
  let x = document.querySelector("#topic8");
  if (x){
      x.scrollIntoView();
  }
}

onClick9(){
  let x = document.querySelector("#topic9");
  if (x){
      x.scrollIntoView();
  }
}

onClick10(){
  let x = document.querySelector("#topic10");
  if (x){
      x.scrollIntoView();
  }
}

onClick11(){
  let x = document.querySelector("#topic11");
  if (x){
      x.scrollIntoView();
  }
}

onClick12(){
  let x = document.querySelector("#topic12");
  if (x){
      x.scrollIntoView();
  }
}

onClick13(){
  let x = document.querySelector("#topic13");
  if (x){
      x.scrollIntoView();
  }
}

onClick14(){
  let x = document.querySelector("#topic14");
  if (x){
      x.scrollIntoView();
  }
}

onClick15(){
  let x = document.querySelector("#topic15");
  if (x){
      x.scrollIntoView();
  }
}


//  expandProcessModelMenu()
//  {
//    console.log("button clicked")
//   this.showPMMenu = !this.showPMMenu;
//  }
//  expandProcessMenu()
//  {
//    console.log("button clicked")
//   this.showPPMenu = !this.showPPMenu;
//  }
//  expandServiceAreaMenu()
//  {
//    console.log("button clicked")
//   this.showSAMenu = !this.showSAMenu;
//  }
//  expandPSPDMenu()
//  {
//    console.log("button clicked")
//   this.showPSPDMenu = !this.showPSPDMenu;
//  }
//  expandChecklistMenu()
//  {
//    console.log("button clicked")
//   this.showChkMenu = !this.showChkMenu;
//  }

}

export class SidenavOpenCloseExample {
  events: string[] = [];
  opened: boolean;

  shouldRun = [/(^|\.)plnkr\.co$/, /(^|\.)stackblitz\.io$/].some(h => h.test(window.location.host));
}
