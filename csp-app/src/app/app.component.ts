import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { forEach } from "@angular/router/src/utils/collection";
import { Observable } from "rxjs/Rx";
import { Http, Headers, RequestOptions } from "@angular/http";
import { Router, ActivatedRoute } from "@angular/router";
import { myUtility } from "./Shared/myUtility";
import { MediaMatcher } from "@angular/cdk/layout";
import { environment } from "../environments/environment";
import { Location } from "@angular/common";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  showContentMenu: boolean = false;
  companyName = environment.company_name;
  //=================
  test: number[] = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    0,
  ];
  mobileQuery: MediaQueryList;
  fillerNav = Array(50)
    .fill(0)
    .map((_, i) => `Nav Item ${i + 1}`);
  shouldRun: boolean = true;
  fillerContent = Array(50)
    .fill(0)
    .map(
      () =>
        `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
           labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
           laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
           voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
           cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`
    );
  private _mobileQueryListener: () => void;
  //=============
  errorMessage: string;
  receivedData: any[];
  nprojects: any[];
  // constructor(private _appService: AppService) {
  // }


  constructor(
    private _router: Router,
    private _http: Http,
    private _util: myUtility,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private location: Location,

  ) {
    this.mobileQuery = media.matchMedia("(max-width: 600px)");
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }
  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
  webapiuri: String = "";
  ngOnInit(): void {
    
   //entry point for application
    var empId = localStorage.getItem("empid");
    var path = this.location.path();
    // alert(atob(path));
    // alert(btoa(path));
    // alert(atob(btoa(path)));
    if (empId == undefined || empId == null || empId.trim() == "") {
      if (
        path.indexOf("CustomerSuccessSurvey") > 0 ||
        path.indexOf("login") > 0 ||
        path.indexOf("setpassword") > 0
      ) {
      } else if (path.indexOf("landingpage") < 0) {
     
        
        this.logout();
        localStorage.setItem('navigateurl', path);
      
      }
    }
    this.webapiuri = environment.webapiuri;
    if (window.location.pathname == "/login") {
      this.showContentMenu = true;
    }
     
    // webapiuri: String = "";
    // ngOnInit(): void {

    //     var empId = localStorage.getItem('empid');
    //     var path = this.location.path();
    //     // alert(atob(path));
    //     // alert(btoa(path));
    //     // alert(atob(btoa(path)));
    //     if (empId == undefined || empId == null || empId.trim() == '') {
    //         if(path.indexOf("CustomerSuccessSurvey") > 0 || path.indexOf("login") > 0 || path.indexOf("setpassword") > 0 )
    //         {

    //         if (window.location.pathname == "/newdashboard/enterpriseview") {
    //           this.showContentMenu = true;
    //         }

    //         if (window.location.pathname == "/projectsKPI") {
    //           this.showContentMenu = true;
    //         }
    // //this.service_getProjects('100248', '');
  }
  ngDoCheck() {
    if (window.location.pathname == "/login") {
      this.showContentMenu = true;
    }

    if (window.location.pathname == "/newdashboard/enterpriseview") {
      this.showContentMenu = true;
    }

    if (window.location.pathname == "/projectsKPI") {
      this.showContentMenu = true;
    }
    if (window.location.pathname == "/cileaderboard") {
      this.showContentMenu = true;
    }

    if (window.location.pathname == "/fmeamanagement") {
      this.showContentMenu = true;
    }
    if (window.location.pathname == "/sqamanagement/sqahelp") {
      this.showContentMenu = true;
      }
      
      // if(window.location.pathname == "/newdashboard/custm"){
      //   this.showContentMenu = true;
      // }

      //console.log(window.location.pathname.indexOf("csm-dashboard"))
        if(window.location.pathname.indexOf("newdashboard/cust")>-1)
        {
          this.showContentMenu = true;
        }
        if(window.location.pathname.indexOf("csm-dashboard")>-1)
        {
          this.showContentMenu = true;
        }
        if(window.location.pathname.indexOf("successgoal/metric")){
          this.showContentMenu = true;
        }
  }

  logout() {
    this._util.empid("");
    this._router.navigateByUrl("/login");
    //localStorage.clear();
  }
  service_getProjects(empid, projectid) {
    //receivedData = "";
    let apiuri: string =
      this.webapiuri + "GetProjects?EmpId=" + empid + "&ProjectId=";
    this._http.get(apiuri).subscribe(
      (data) => {
        this.receivedData = data.json();
        //localStorage.setItem('projectDetails', this.receivedData);
        //return this.receivedData;
      },
      (error) => {
        alert(error.text());
      }
    );
    //return this.receivedData;
  }
}
