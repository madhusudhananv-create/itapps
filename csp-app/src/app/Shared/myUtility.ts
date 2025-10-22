import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ChartsService } from '../Services/charts.service';
import { Chart } from 'angular-highcharts';
import { AppControlsModel, AppAccessControlsModel } from '../models/access-control-model';
import { AppServiceOthers } from '../Services/apps.service.other';
import { Observable } from 'rxjs/Observable';
import { CSMTitlesModel } from '../models/csm-titles-model';
import { enumRoles } from '../Shared/enum';
import * as XLSX from 'xlsx';
import { SharedService } from './shared.service';
import { Subject, observable } from 'rxjs';
import { rxSubscriber } from 'rxjs/internal-compatibility';
import { CustomerProjectsListModel } from '../models/customer-projects-model';
import { AccessControl } from './accessControl';
import { FailureAssessment } from '../models/fmea/fm-project-mapping';
import { MatDialog } from '@angular/material';
import { GoogleLoginProvider, SocialAuthService } from 'angularx-social-login';
import { environment } from '../../environments/environment';

@Injectable()
export class myUtility {
    tempData: any;
    CustomerIds: string[] = [];
    btnCalledFromNewCSMDashboard: boolean = false;
    linkCalledfromSQA: boolean = false;
    linkCallfromAllCustlistView: boolean = false;
    linkCalledWithIdeaId: boolean = false;
    BaseMeasureEnabledCustomers = '';
    kpiProcessEnabledCustomers = '';
    riskSubject: any = new Subject<any>();
    companyName = environment.company_name;
    //public gavsService: SocialAuthService;


    constructor(private _router: Router, private _chartsService: ChartsService, private _otherServices: AppServiceOthers, private matDialog: MatDialog) {
        //localStorage.clear();
        this.AppSettings.empid = localStorage.getItem('empid');
        this.AppSettings.displayname = localStorage.getItem('displayname');
        this.AppSettings.token = localStorage.getItem('token');
        this.AppSettings.logintype = localStorage.getItem('logintype');
        this.AppSettings.role = localStorage.getItem('role');

        // this.gavsService = new SocialAuthService({
        //     autoLogin: false,
        //     providers: [{
        //       id: GoogleLoginProvider.PROVIDER_ID,
        //       provider:
        //         new GoogleLoginProvider(
        //          '360086473959-4rtb8ep6eq60tt3pm8922g33cr6pvbqe.apps.googleusercontent.com'
        //         )
        //     }]
        //   });
    }
    public holidayIds: string = "3,5"


    public AppSettings = {
        empid: '',
        displayname: '',
        token: '',
        role: '',
        access: '',
        logintype: '',
        customerid: ''
    }

    public ColorShaders = {
        WeekEndShade: "#f3f37e",
        LeaveShade: "#c5fbc5",
        HolidayShade: "#a3ffff",
        BlockedShade: "#dddddd",
        ApprovedShade: "#dcf7e9",
        RejectedShade: "#f7dfe0",
        ReviewShade: "#f8deaf",
        ApprovalShade: "#fcceab"
    }
    public service
    public previousPage(custId) {
        if (this.linkCallfromAllCustlistView) {
            localStorage.setItem('selectedCustomer', custId);
            this._router.navigate(['/newdashboard/allcust/listview']);
        }
        else if (this.linkCalledWithIdeaId) {
            let ideaId = localStorage.getItem('ideaId')
            this._router.navigate(['/newdashboard/cust', custId, true, 'listview', ideaId])
        }
        else
            this._router.navigate(['/newdashboard/cust', custId, true, 'listview'])
    }
    public empid(Empid) {
        this.AppSettings.empid = Empid;
        localStorage.setItem('empid', Empid);
    }
    public displayname(DisplayName) {
        this.AppSettings.displayname = DisplayName;
        localStorage.setItem('displayname', DisplayName);
    }
    public token(Token) {
        this.AppSettings.token = Token;
        localStorage.setItem('token', Token);
    }
    public logintype(Logintype) {
        this.AppSettings.logintype = Logintype;
        localStorage.setItem('logintype', Logintype);
    }
    public customerid(Customerid) {
        this.AppSettings.customerid = Customerid;
        localStorage.setItem('customerid', Customerid);
    }
    public role(Role) {
        this.AppSettings.role = Role;
        localStorage.setItem('role', Role);
    }
    public access(Access) {
        this.AppSettings.access = Access;
        localStorage.setItem('access', Access);
        //this._access = this.getAccessList();
    }
    private _access: AppAccessControlsModel[] = []

    ngOnInit() {
        this.determineCustIdsBasedOnRole();
    }

    public getProjectListForUser(): string[] {
        let projects = localStorage.getItem('projIds');
        if (projects != undefined && projects != null && projects != "") {
            return projects.split(',');

        }
        else {
            this._otherServices.getAllProjectIdsForUser(this.AppSettings.token).subscribe(data => {
                localStorage.setItem('projIds', data.join(','));
                return data;
            }, error => {

            });
        }
    }



    public getAccessList(): AppAccessControlsModel[] {
        if ((this._access === null || this._access.length === 0) && localStorage.getItem('access') != '') {
            this._access = JSON.parse(localStorage.getItem('access'));
        }
        return this._access;
    }

    public IsPremier(custid) {
        if (custid == "202100062" || custid == "212100001")
            return true;
        else
            return false;
    }

    public IsTimeSheetApplicable(custid) {

        if (custid == "202100040" || custid == "212100001")
            return true;
        else
            return false;
    }

    public showFilteredRows(option, datasource) {
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        if (option == 1)
            this.tempData = datasource;
        else if (option == "2")
            this.tempData = datasource.filter(x => new Date(x.targeT_DATE) <= currentDate);
        else if (option == "3")
            this.tempData = datasource.filter(x => new Date(x.targeT_DATE) > currentDate);

        return this.tempData;
    }

    public selectedCustomerId: string;
    // validateLogin() {
    //     let _router: Router
    //     if (this.AppSettings.empid === "" || this.AppSettings.empid === null) {
    //         _router.navigateByUrl('/login');
    //     }
    // }
    validateLogin(): boolean {
        let empid = localStorage.getItem('empid');
        let token = localStorage.getItem('token');
        if (empid === "" || empid === null || token === "" || token === null) {
            alert("Please login to continue");
            this._router.navigateByUrl('/login');
            return false;
        }
        return true;
    }

    public IsGAVS(): boolean {
        if (this.AppSettings.logintype === 'gavs')
            return true;
        else
            return false;
    }

    public IsBaseMeasureEnabledCustomer(custId: string): boolean {

        this.LoadBaseMeasureEnabledCustomers();
        if (this.BaseMeasureEnabledCustomers != null && this.BaseMeasureEnabledCustomers.indexOf(custId) > -1)
            return true;
        else
            return false;
    }
    public LoadBaseMeasureEnabledCustomers() {
        if (this.BaseMeasureEnabledCustomers == null || this.BaseMeasureEnabledCustomers == undefined || this.BaseMeasureEnabledCustomers == '') {
            this._otherServices.getBaseMeasureEnabledCustomers(this.AppSettings.token).subscribe(data => {
                if (data != null)
                    this.BaseMeasureEnabledCustomers = data;
            })
        }
    }
    public IsKPIProcessEnabledCustomer(custId: string): boolean {
        this.LoadKPIProcessEnabledCustomers();
        if (this.kpiProcessEnabledCustomers != null && this.kpiProcessEnabledCustomers.indexOf(custId) > -1)
            return true;
        else
            return false;
    }
    public LoadKPIProcessEnabledCustomers() {
        if (this.kpiProcessEnabledCustomers == null || this.kpiProcessEnabledCustomers == undefined || this.kpiProcessEnabledCustomers == '') {
            this._otherServices.getKPIProcessEnabledCustomers(this.AppSettings.token).subscribe(data => {
                if (data != null)
                    this.kpiProcessEnabledCustomers = data;
            })
        }
    }
    public IsEditable() {
        if (this.AppSettings.logintype === 'customer')
            return false;
        else if (this.AppSettings.role === enumRoles.CustomerSuccessManager.toString())
            return true;
        else if (this.AppSettings.role === enumRoles.ProjectManager.toString())
            return true;
        else if (this.AppSettings.role === enumRoles.Quality.toString())
            return true;
        else if (this.AppSettings.role === enumRoles.PMO.toString())
            return true;
        else if (this.AppSettings.role === enumRoles.Finance.toString())
            return true;
        else if (this.AppSettings.role === enumRoles.Marketing.toString())
            return true;
        else if (this.AppSettings.role === enumRoles.GSLab.toString())
            return true;
        else
            return false;
    }
    public IsApprover() {
        if (this.AppSettings.logintype === 'customer')
            return true;
        else if (this.AppSettings.role === enumRoles.CustomerSuccessManager.toString())
            return true;
        else if (this.AppSettings.role === enumRoles.PMO.toString())
            return true;
        else if (this.AppSettings.role === enumRoles.ProjectManager.toString())
            return true;
        else
            false;
    }
    public IsQuality() {
        if (this.AppSettings.role === enumRoles.Quality.toString())
            return true;
        else
            return false;
    }
    public IsHR() {
        if (this.AppSettings.role === enumRoles.HR.toString())
            return true;
        else
            return false;
    }
    public IsCSM() {
        if (this.AppSettings.role === enumRoles.CustomerSuccessManager.toString())
            return true;
        else
            return false;
    }

    public IsCSMorPM() {
        if (this.AppSettings.role === enumRoles.CustomerSuccessManager.toString())
            return true;
        else if (this.AppSettings.role === enumRoles.ProjectManager.toString())
            return true;
        else
            return false;
    }
    public IsPMO() {
        if (this.AppSettings.role === enumRoles.PMO.toString())
            return true;
        else
            return false;
    }

    public IsTeamMember() {
        if (this.AppSettings.role === enumRoles.TeamMember.toString())
            return true;
        else
            return false;
    }
    public IsCustomer() {
        if (this.AppSettings.logintype === 'customer')
            return true;
        else
            return false;
    }
    public IsBUHead() {
        if (this.AppSettings.role === enumRoles.BUHeadIMS.toString())
            return true;
        else
            return false;
    }
    public IsLoggedIn() {
        if (this.AppSettings.empid === null || this.AppSettings.empid === '')
            return false;
        else
            return true;
    }
    public GetProjectName(project) {
        if (this.IsGAVS())
            return project.proJ_NM
        else if (project.proJ_ALIAS_NM != undefined && project.proJ_ALIAS_NM != null && project.proJ_ALIAS_NM != '')
            return project.proJ_ALIAS_NM;
        else
            return project.proJ_NM;
    }
    public GetFileExtension(fileName) {
        var result = fileName.substr(fileName.lastIndexOf('.'));
        return result;
    }
    public GetFileNameWithoutExtension(fileName) {
        var result = (fileName.split('\\').pop().split('/').pop().split('.'))[0];
        return result;
    }
    public getDate(selectedDate) {
        let day = selectedDate.getDate();
        let month = selectedDate.getMonth() + 1;
        if (month == 1) { month = "Jan" }
        if (month == 2) { month = "Feb" }
        if (month == 3) { month = "Mar" }
        if (month == 4) { month = "Apr" }
        if (month == 5) { month = "May" }
        if (month == 6) { month = "Jun" }
        if (month == 7) { month = "Jul" }
        if (month == 8) { month = "Aug" }
        if (month == 9) { month = "Sep" }
        if (month == 10) { month = "Oct" }
        if (month == 11) { month = "Nov" }
        if (month == 12) { month = "Dec" }
        return day + "-" + month + '-' + selectedDate.getFullYear();
    }
    public Month() {
        return this.getMonthAbr(new Date().getMonth());
    }
    public MonthCurrAbr() {
        return this.getMonthAbr(new Date().getMonth());
    }
    public prevMonthAbr() {
        return this.getMonthAbr(new Date().getMonth() - 1);
    }
    public MonthCurrNum(): number {
        return new Date().getMonth();
    }

    public is102802() {
        return this.AppSettings.empid == "102802";
    }

    public getMonthNames() {
        return [{ value: 0, title: 'Jan' }, { value: 1, title: 'Feb' }, { value: 2, title: 'Mar' },
        { value: 3, title: 'Apr' }, { value: 4, title: 'May' }, { value: 5, title: 'Jun' },
        { value: 6, title: 'Jul' }, { value: 7, title: 'Aug' }, { value: 8, title: 'Sep' },
        { value: 9, title: 'Oct' }, { value: 10, title: 'Nov' }, { value: 11, title: 'Dec' }];
    }

    public getMonthAbr(month: number) {
        month = month + 1;
        if (month == 1) return "Jan";
        if (month == 2) return "Feb";
        if (month == 3) return "Mar";
        if (month == 4) return "Apr";
        if (month == 5) return "May";
        if (month == 6) return "Jun";
        if (month == 7) return "Jul";
        if (month == 8) return "Aug";
        if (month == 9) return "Sep";
        if (month == 10) return "Oct";
        if (month == 11) return "Nov";
        if (month == 12 || month == 0) return "Dec";
    }
    public getMonthNum(month: string) {
        if (month == "Jan") return 0;
        if (month == "Feb") return 1;
        if (month == "Mar") return 2;
        if (month == "Apr") return 3;
        if (month == "May") return 4;
        if (month == "Jun") return 5;
        if (month == "Jul") return 6;
        if (month == "Aug") return 7;
        if (month == "Sep") return 8;
        if (month == "Oct") return 9;
        if (month == "Nov") return 10;
        if (month == "Dec") return 11;
    }
    public Year() {
        return new Date().getFullYear();
    }

    public updateRAG(rags, category, rag) {
        let myrag = rags.filter(t => t.category === category);
        if (myrag != null && myrag.length > 0)
            myrag[0].rag = rag;
        else {
            let ragRec = {
                id: 0,
                projecT_ID: '',
                category: category,
                rag: rag,
                createD_BY: '',
                createD_DATE: new Date(),
                updateD_BY: '',
                updateD_DATE: new Date(),
                isactive: true
            };
            rags.push(ragRec);
        }
    }
    public getRAG(rags, category) {
        let result = 'black';
        if (rags != undefined) {
            let myrag = rags.filter(t => t.category === category);
            if (myrag != null && myrag.length > 0)
                result = myrag[0].rag;
        }
        return result;
    }
    prob: string[] = ['Rare', 'Remote', 'Moderate', 'Likely', 'Frequent']
    impact: string[] = ['Insignificant', 'Minor', 'Significant', 'Major', 'Critical']
    //*****************************************
    public ClearAuthenticationDetails() {
        this.empid('');
        this.displayname('');
        this.token('');
    }
    private RepeatedError: Boolean = false;
    public serviceError(error) {
        console.log(error);
        if (error.status === 0)
            alert("CSM server connection is interupted, Please check your network connection. For urgent queries contact csmplatformsupport@" + environment.domain_name);
        else if (error.status === 500) {
            alert(`CSM server: Error(500) while handling data, please contact ${this.companyName} team (csmplatformsupport@` + environment.domain_name + `).`);
        }
        else if (error.status === 404)
            alert(`CSM server: Error(404) while handling data, please contact ${this.companyName} (csmplatformsupport@` + environment.domain_name + `).`);
        else if (error.status === 501)
            alert("Duplicate values in excel not copied ");
        else if (error.status === 400) {
            let errMsg = this.GetErrorMessage(error);
            if (errMsg.trim().toLowerCase() != "ok")
                alert(errMsg);
            if (errMsg.includes('Authorization Issue')) {
                this.RepeatedError = true

                this.ClearAuthenticationDetails();
                this._router.navigateByUrl('/login');
            }
        }
        else if (error.status === 401) {
            console.log(error);
            if (error.statusText === "Invalid Token") {
                console.log(error);
                if (this.RepeatedError === false)
                    alert("Session Expired, Please login again");
                this.RepeatedError = true
                this.matDialog.closeAll();
                this.ClearAuthenticationDetails();
                this._router.navigateByUrl('/login');
            }
            else if (error.statusText === "Unauthorized") {
                this._router.navigateByUrl('/login');
                this.ClearAuthenticationDetails();
                if (error.text().trim().toLowerCase() != "ok")
                    alert(error.text());
            }
            else {
                let err = error.statusText;
                if (error.error != undefined && error.error != null)
                    err = err + " : " + error.error;
                if (err.trim().toLowerCase() != "ok")
                    alert(err);
            }
            this._router.navigateByUrl('/login');
        }
        else if (error.status === 409) {
            let errMsg = this.GetErrorMessage(error);
            if (errMsg.trim().toLowerCase() != "ok")
                alert(errMsg);
        }
        else {
            if (error.text != undefined && error.text != null)
                alert(error.text() + error.statusText);
            else {
                if (error.statusText.trim().toLowerCase() != "ok")
                    alert(error.statusText);
            }
        }
    }

    public GetErrorMessage(error) {
        let msg = "";
        if (error.error != undefined && error.error != null &&
            error.error.message != undefined && error.error.message != null)
            msg = error.error.message;
        else if (error.error != undefined && error.error != null)
            msg = error.error;
        else if (error.text != undefined && error.text != null)
            msg = error.text();
        else
            msg = error.statusText;
        return msg;
    }

    public GetAuthHeader() {
        let header = new Headers({ 'Accept': 'application/json' });
        header.append('token', this.AppSettings.token);
        return { headers: header }
    }
    public Today(): Date {
        return new Date();
    }
    public DaysInMonth(month, year) {
        if (Number(month)) {
            return new Date(year, month, 0).getDate();
        }
        else {
            let monthnumber: number = 0
            if (month === 'Jan') monthnumber = 1;
            else if (month === 'Feb') monthnumber = 2;
            else if (month === 'Mar') monthnumber = 3;
            else if (month === 'Apr') monthnumber = 4;
            else if (month === 'May') monthnumber = 5;
            else if (month === 'Jun') monthnumber = 6;
            else if (month === 'Jul') monthnumber = 7;
            else if (month === 'Aug') monthnumber = 8;
            else if (month === 'Sep') monthnumber = 9;
            else if (month === 'Oct') monthnumber = 10;
            else if (month === 'Nov') monthnumber = 11;
            else if (month === 'Dec') monthnumber = 12;
            return new Date(year, monthnumber, 0).getDate();
        }
    }
    public GetNumberArray(iCount: number) {
        let lst: number[] = [];
        for (let i = 1; i <= iCount; i++) {
            lst.push(i);
        }
        return lst;
    }
    public ToggleSideNav() {
        this.ShowSideNav = !this.ShowSideNav;
    }
    public ShowSideNav: boolean = true;

    //Load Chart Data
    public highlights;
    public chartsMonthly;
    public tableMonth: string = this.Month();
    public tableYear: number = this.Year();
    GetHighlights(client_ID, projecT_ID, date) {
        if (date === undefined)
            date = new Date();
        this._chartsService.getHighlightsByDate(client_ID, projecT_ID, date, 'Monthly', this.AppSettings.token)
            .subscribe
            (
                data => {
                    this.highlights = data;
                }
                ,
                error => {
                    this.serviceError(error);
                }
            );
    }
    GetCharts(client_ID, projecT_ID) {
        this._chartsService.getCharts(client_ID, projecT_ID, new Date(), 'LastUpdated', this.AppSettings.token)
            .subscribe
            (
                data => {
                    if (data.radarHighChart) {
                        data.radarHighChart = new Chart(data.radarHighChart);
                    }
                    if (data.trendHighChartGroup.length > 0) {
                        for (let i = 0; i < data.trendHighChartGroup.length; i++) {
                            if (data.trendHighChartGroup[i].trendHighChart.length > 0) {
                                for (let j = 0; j < data.trendHighChartGroup[i].trendHighChart.length; j++) {
                                    //data.trendHighChartGroup[i].trendHighChart[j] = new Chart(data.trendHighChartGroup[i].trendHighChart[j]);
                                    data.trendHighChartGroup[i].trendHighChart[j].trendHighChart = new Chart(data.trendHighChartGroup[i].trendHighChart[j].trendHighChart);
                                }

                            }
                        }
                    }
                    this.chartsMonthly = data;
                    this.tableMonth = data.month;
                    this.tableYear = data.year;
                    this.GetHighlights(client_ID, projecT_ID, '1-' + this.tableMonth + '-' + this.tableYear.toString())
                }
                ,
                error => {
                    this.serviceError(error);
                }
            );
    }

    GetRiskChart(riskDashboardInputs) {
        if (riskDashboardInputs != null && riskDashboardInputs != undefined) {
            if (riskDashboardInputs.projecT_IDS == null)
                riskDashboardInputs.projecT_IDS = "-1";
            this._chartsService.getRiskChart(riskDashboardInputs, this.AppSettings.token).subscribe(
                data => {
                    this.chartsMonthly = data;
                    this.riskSubject.next(this.chartsMonthly);
                },
                error => {
                    this.serviceError(error);
                }
            )
        }
    }
    GetTable(client_ID, proj_ID, date) {
        this._chartsService.getTable(client_ID, proj_ID, date, 'Monthly', this.AppSettings.token)
            .subscribe
            (
                data => {
                    this.chartsMonthly.tableChart = data;
                }
                ,
                error => {
                    this.serviceError(error);
                }
            );
    }
    //Access Controls
    public AppRoles: CSMTitlesModel[] = [];

    public GetAppRoleName(roleId) {
        let roleName = '';
        if (this.AppRoles.length === 0) {
            this.LoadAppResource();
        }
        else {
            let appRoles: CSMTitlesModel[] = this.AppRoles.filter(t => t.id === roleId);

            if (appRoles.length > 0)
                roleName = appRoles[0].title;
        }
        return roleName
    }
    public LoadAppRoles() {
        if (this.AppRoles.length === 0) {
            this._otherServices.getAppRoles(this.AppSettings.token).subscribe(data => {
                this.AppRoles = data;
            }, error => { this.serviceError(error); }
            );
        }
    }

    private AppControls: AppControlsModel[] = [];

    public GetAppResourceName(controlId) {
        if (this.AppControls.length === 0)
            this.LoadAppResource();

        let appControls: AppControlsModel[] = this.AppControls.filter(t => t.resourcE_ID === controlId);
        if (appControls.length == 0)
            return this.AppControls.filter(t => t.resourcE_ID === controlId);
        else
            return appControls[0].resourcE_NAME.toString().concat("(" + appControls[0].resourcE_ID + ")");
    }

    public LoadAppResource() {
        if (this.AppControls.length === 0) {
            this._otherServices.getAppControls(this.AppSettings.token).subscribe(data => {
                this.AppControls = data;

            }, error => { this.serviceError(error); }
            );
        }
    }

    //Userstory
    public userstory_rightpanel_hidden = true;
    public userstory_leftpanel_width = '100%';

    public CopyObject(inObj: any): any {
        let str = JSON.stringify(inObj);
        let outObj: any = JSON.parse(str);
        return outObj;
    }
    public GetLocalDate(date: Date) {
        try {
            return date.toDateString();
        }
        catch {
            return date;
        }
    }
    public exportToExcel(element: any, filename: string) {
        var config = { raw: true, type: 'base64' };
        const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element, config);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

        /* save to file */
        XLSX.writeFile(wb, filename + '.xlsx');
    }
    public Years(n) {
        let datearray: number[] = [];
        //let i;
        let d = new Date();
        let b = d.getFullYear();
        for (let i = 0; i < n; i++) {
            datearray[i] = b - i;
        }
        return datearray;
    }
    public Years_Financial(n) {
        let datearray: number[] = [];
        //let i;
        let d = new Date();
        let b = d.getFullYear();
        let m = d.getMonth();
        if (m >= 4) {
            b = b + 1;
            n = n + 1;
        }

        for (let i = 0; i < n; i++) {
            datearray[i] = b - i;
        }
        return datearray;
    }

    public ApplyCriteriaRange(criteria: any[], originalData: any[]) {
        if (criteria == undefined || criteria == null) return originalData;
        let fieldNames = criteria.map(x => x.fielD_NAME);
        let filteredData = originalData;
        let fieldNamesDistinct = fieldNames.filter((n, i) => fieldNames.indexOf(n) === i);

        fieldNamesDistinct.forEach(element => {
            let filteredCriteria = criteria.filter(t => t.fielD_NAME === element);
            filteredData = filteredData.filter(t => filteredCriteria.some(e => this.ApplyCriteriaOnData(e, t)));
        });

        return filteredData;
    }

    ApplyCriteriaOnData(criteria, data) {
        try {
            return data[criteria.fielD_NAME].toLowerCase().search(criteria.searchStringValue.toLowerCase()) > -1;

        }
        catch (e) {
            if (e.stack.search("TypeError") > -1) {
                return data[criteria.fielD_NAME] == criteria.searchString;
            }
        }
    }

    ShouldLoadAllProjects() {
        return this.AppSettings.role === enumRoles.PMO.toString() ||
            this.AppSettings.role === enumRoles.CustomerSuccessManager.toString() || this.AppSettings.role === enumRoles.FunctionalManager.toString() ||
            this.AppSettings.role === enumRoles.BUHeadIMS.toString();
    }
    // Common methods for enterprise dashboard

    determineCustIdsBasedOnRole() {
        let a: string[] = [];
        if (this.IsCSM()) {
            return this._chartsService.getTaggedCustomerIds(this.AppSettings.empid, this.AppSettings.token);
        }

        else if (this.IsCustomer()) {
            return this._chartsService.getCustomerId(this.AppSettings.empid, this.AppSettings.token)
        }
        else if (this.IsBUHead()) {
            return this._chartsService.getAllCustomerIds(this.AppSettings.token);
        }
        else {
            return Observable.of(a);
        }
    }

    getCustomerProjectListBasedOnRole() {
        let a: CustomerProjectsListModel[] = [];
        if (this.IsCSM()) {
            return this._chartsService.getCustomerProjectsList(this.AppSettings.empid, this.AppSettings.token, false);
        }
        else if (this.IsBUHead()) {
            return this._chartsService.getCustomerProjectsList(this.AppSettings.empid, this.AppSettings.token, false);
        }
        else {
            return Observable.of(a);
        }
    }


    setLocaleDate(dateValue) {
        var dtDateValue = new Date(dateValue);
        let UTCDate = Date.UTC(dtDateValue.getFullYear(), dtDateValue.getMonth(), dtDateValue.getDate());
        return new Date(UTCDate);
    }

    enumSelector(definition) {
        return Object.keys(definition)
            .filter(x => !isNaN(Number(x)))
            .map(key => ({
                title: definition[key], value: parseInt(key)
            }))
    }

    public getmonthsBasedonYear(year: number) {
        if (this.Year() == year) // is this current financial year
        {
            // get months upto current month
            return this.getMonthsuptoCurrentMonth(this.MonthCurrNum());
        }
        else {
            return this.getMonthNames();
        }
    }
    getMonthsuptoCurrentMonth(currMonth: number) {
        let months = [];
        for (var i = 0; i <= currMonth; i++) {
            months.push({ value: i, title: this.getMonthAbr(i) });

            if (i == currMonth) {
                break;
            }

        }

        return months;
    }
    public getDatesForQuarter(quarter, year) {
        let qStartDate = new Date();
        let qEndDate = new Date();
        if (quarter == "Q1") {
            qStartDate = new Date("04/01/" + year);
            qEndDate = new Date("06/30/" + year);
        }
        else if (quarter == "Q2") {
            qStartDate = new Date("07/01/" + year);
            qEndDate = new Date("09/30/" + year);
        }
        else if (quarter == "Q3") {
            qStartDate = new Date("10/01/" + year);
            qEndDate = new Date("12/31/" + year);
        }
        else if (quarter == "Q4") {
            qStartDate = new Date("01/01/" + (year + 1));
            qEndDate = new Date("03/31/" + (year + 1));
        }
        else if (quarter == "YT") {
            qStartDate = new Date("04/01/" + (year));
            qEndDate = new Date("03/31/" + (year + 1));
        }
        else if (quarter == "CP") {
            return this.getDatesForQuarter("Q" + this.getCurrentQuarter(), year);
        }
        else if (quarter == "LQ") {
            let lastQtr = this.getPreviuosQuarter();
            if (lastQtr => 3) year = year - 1;
            return this.getDatesForQuarter("Q" + lastQtr, year);
        }
        return { "startDate": qStartDate, "endDate": qEndDate }
    }

    public getDatesForPeriod(quarter, year) {
        let qStartDate = new Date();
        let qEndDate = new Date();
        if (quarter == "Q1") {
            qStartDate = new Date("04/01/" + year);
            qEndDate = new Date("06/30/" + year);
        }
        else if (quarter == "Q2") {
            qStartDate = new Date("07/01/" + year);
            qEndDate = new Date("09/30/" + year);
        }
        else if (quarter == "Q3") {
            qStartDate = new Date("10/01/" + year);
            qEndDate = new Date("12/31/" + year);
        }
        else if (quarter == "Q4") {
            qStartDate = new Date("01/01/" + (year + 1));
            qEndDate = new Date("03/31/" + (year + 1));
        }
        else if (quarter == "YT") {
            qStartDate = new Date("04/01/" + (year - 1));
            qEndDate = new Date();
            if (qEndDate.getFullYear() != year)
                qEndDate = new Date("03/31/" + (year));
        }
        else if (quarter == "CP") {
            return this.getDatesForQuarter("Q" + this.getCurrentQuarter(), year - 1);
        }
        else if (quarter == "LQ") {
            let lastQtr = this.getPreviuosQuarter();
            if (lastQtr => 3) year = year - 1;
            return this.getDatesForQuarter("Q" + lastQtr, year);
        }
        return { "startDate": qStartDate, "endDate": qEndDate }
    }

    getCurrentQuarter(): number {
        var today = new Date();
        var quarter = Math.floor((today.getMonth() + 3) / 3);
        if (quarter == 1) {
            return 4;
        }
        else {
            return quarter - 1;
        }
    }
    getPreviuosQuarter(): number {
        var today = new Date();
        var quarter = Math.floor((today.getMonth() + 3) / 3);
        if (quarter <= 2) {
            return quarter + 2;
        }
        else {
            return quarter - 2;
        }
    }
    getLastQuarterOf(quarter): string {
        if (quarter == "Q1") {
            return "Q4";
        } else if (quarter == "Q2") {
            return "Q1";
        }
        else if (quarter == "Q3") {
            return "Q2";
        }
        else if (quarter == "Q4") {
            return "Q3";
        }
    }
    public getDatesBasedOnQuarter(selectedquarter, year, trendQuarter, periodstartDate, periodendDate) {
        let startDate, endDate, fromDate, toDate, periodstartDate1, periodendDate1;
        let dates = [];
        var today = new Date(),
            quarter = Math.floor((today.getMonth() / 3));

        if (trendQuarter == 3) {
            switch (selectedquarter) {

                case "Q1":
                    fromDate = new Date(year - 1, 6, 1);
                    toDate = new Date(year, 6, 0);
                    break;
                case "Q2":
                    fromDate = new Date(year - 1, 9, 1);
                    toDate = new Date(year, 9, 0);
                    break;
                case "Q3":
                    fromDate = new Date(year - 1, 12, 1);
                    toDate = new Date(year, 12, 0);
                    break;
                case "Q4":
                    fromDate = new Date(year - 1, 3, 1);
                    toDate = new Date(year, 3, 0);
                    break;
                case "H1":
                    fromDate = new Date(year, 0, 1);
                    toDate = new Date(year, 6, 0);
                    break;
                case "H2":
                    fromDate = new Date(year, 6, 1);
                    toDate = new Date(year, 12, 0);
                    break;
                case "lastQuarter":
                    fromDate = new Date(year - 1, 4, 1);
                    toDate = new Date(year, 3, 0);
                    break;
                case "Annual":
                    fromDate = new Date(year, 0, 1);
                    toDate = new Date(year, 12, 0);
                    break;
            }
            dates.push({ fromDate, toDate });
            return dates;
        }
        switch (selectedquarter) {
            case "lastQuarter":
                startDate = new Date(today.getFullYear(), quarter * 3 - 3, 1);
                endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 3, 0);
                fromDate = startDate;
                toDate = endDate;
                break;
            case "Q1":
                startDate = new Date(year, 3, 1);
                endDate = new Date(year, 6, 0);
                fromDate = startDate;
                toDate = endDate;
                // fromDate = new Date(startDate.toLocaleDateString());
                // toDate = new Date(endDate.toLocaleDateString());
                break;
            case "Q2":
                if (trendQuarter == 2) {
                    startDate = new Date(year, 3, 1);
                    endDate = new Date(year, 9, 0);
                    fromDate = startDate;
                    toDate = endDate;
                    // fromDate = new Date(startDate.toLocaleDateString());
                    // toDate = new Date(endDate.toLocaleDateString());
                }
                else {
                    startDate = new Date(year, 6, 1);
                    endDate = new Date(year, 9, 0);
                    fromDate = startDate;
                    toDate = endDate;
                    // fromDate = new Date(startDate.toLocaleDateString());
                    // toDate = new Date(endDate.toLocaleDateString());
                }
                break;
            case "Q3":
                if (trendQuarter == 2) {
                    startDate = new Date(year, 3, 1);
                    endDate = new Date(year, 12, 0);
                    fromDate = startDate;
                    toDate = endDate;
                    // fromDate = new Date(startDate.toLocaleDateString());
                    // toDate = new Date(endDate.toLocaleDateString());
                }
                else {
                    startDate = new Date(year, 9, 1);
                    endDate = new Date(year, 12, 0);
                    fromDate = startDate;
                    toDate = endDate;
                    // fromDate = new Date(startDate.toLocaleDateString());
                    // toDate = new Date(endDate.toLocaleDateString());
                }
                break;
            case "Q4":
                if (trendQuarter == 2) {
                    startDate = new Date(year, 3, 1);
                    endDate = new Date(year + 1, 3, 0);
                    fromDate = startDate;
                    toDate = endDate;
                    // fromDate = new Date(startDate.toLocaleDateString());
                    // toDate = new Date(endDate.toLocaleDateString());
                }
                else {
                    startDate = new Date(year + 1, 0, 1);
                    endDate = new Date(year + 1, 3, 0);
                    fromDate = startDate;
                    toDate = endDate;
                    // fromDate = new Date(startDate.toLocaleDateString());
                    // toDate = new Date(endDate.toLocaleDateString());
                }
                break;
            case "H1":
                fromDate = new Date(year, 0, 1);
                toDate = new Date(year, 6, 0);
                break;
            case "H2":
                fromDate = new Date(year, 6, 1);
                toDate = new Date(year, 12, 0);
                break;
            case "Annual":  
                fromDate = new Date(year, 0, 1);
                toDate = new Date(year, 12, 0);
                break;                                    
            case "Select Period":
                let date = new Date();

                startDate = new Date(2021, 7, 1);
                endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

                if (periodstartDate != null && periodendDate != null) {
                    periodstartDate1 = new Date(periodstartDate);
                    periodendDate1 = new Date(periodendDate);
                    fromDate = periodstartDate1;
                    toDate = periodendDate1;
                    // fromDate = new Date(periodstartDate1.toLocaleDateString());
                    // toDate = new Date(periodendDate1.toLocaleDateString());
                }
                else {
                    fromDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
                    toDate = new Date(date.getFullYear(), date.getMonth(), 0);
                }
                break;
            default:
                startDate = null;
                endDate = null;
                fromDate = null;
                toDate = null;
                break;
        }

        dates.push({ fromDate, toDate });
        return dates;

    }

    public getQuarter(month) {
        let quarter;
        switch (month) {
            case 4:
            case 5:
            case 6: quarter = "Q1"; break;
            case 7:
            case 8:
            case 9: quarter = "Q2"; break;
            case 10:
            case 11:
            case 12: quarter = "Q3"; break;
            case 1:
            case 2:
            case 3: quarter = "Q4"; break;
        }
        return quarter;
    }

    public GetDefaultMonthForPremierSLA() {
        ////if current date is last day of the month, show current month
        var month = '';
        var year = this.Year();
        var date = new Date();
        var today = new Date().toDateString();
        var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toDateString();

        if (today == lastDay) {
            month = this.MonthCurrAbr();
        }
        else {
            if (this.MonthCurrAbr() == 'Jan') {
                month = 'Dec';
                year = this.Year() - 1;
            }
            else {
                month = this.prevMonthAbr();
            }
        }

        return [{ Month: month, Year: year }];

    }

    public GetSLAStatus(kpiDetail, includeExclusions) {
        let actual = ''
        if (!includeExclusions)
            actual = kpiDetail.kpI_ACTUAL;
        else {
            actual = kpiDetail.exclusioN_kpI_ACTUAL;
            if (actual == undefined || actual == null || actual === '') {
                if (kpiDetail.iS_EX_NO_DATA)
                    return 'NA';
                else
                    return kpiDetail.exclusioN_SLA_STATUS;
            }
        }
        let status = !includeExclusions ? kpiDetail.slA_STATUS : kpiDetail.exclusioN_SLA_STATUS;
        if (actual == undefined || actual == null || actual === '') {
            if (kpiDetail.iS_NO_DATA)
                return 'NA';
            else
                return kpiDetail.slA_STATUS;
        }
        else {
            return status;
        }
    }

    public showThumbsForProduct(data, includeExclusions, achievementPercent, viewBy) {
        if (viewBy == 'By Expected Service Level') {
            let achievePercent = (((data.meT_CRITICAL_KPI + data.meT_KEY_KPI) / data.overalL_KPI_COUNT) * 100);
            if (includeExclusions) {
                achievePercent = (((data.exclusioN_MET_CRITICAL_KPI + data.exclusioN_MET_KEY_KPI) / data.overalL_KPI_COUNT) * 100);
                if ((data.criticaL_KPI == data.exclusioN_MET_CRITICAL_KPI) && achievePercent >= Number(achievementPercent)) {
                    return 'Under Control';
                }
                else if ((data.criticaL_KPI != data.exclusioN_MET_CRITICAL_KPI)) {
                    return 'Need Focus';
                }
                else if ((data.criticaL_KPI == data.exclusioN_MET_CRITICAL_KPI) && achievePercent < Number(achievementPercent)) {
                    return 'Need Focus';
                }
            }
            else {
                if ((data.criticaL_KPI == data.meT_CRITICAL_KPI) && achievePercent >= Number(achievementPercent)) {
                    return 'Under Control';
                }
                else if ((data.criticaL_KPI != data.meT_CRITICAL_KPI)) {
                    return 'Need Focus';
                }
                else if ((data.criticaL_KPI == data.meT_CRITICAL_KPI) && achievePercent < Number(achievementPercent)) {
                    return 'Need Focus';
                }
            }
        }
        else if (viewBy == 'By Minimum Service Level') {
            let achievePercent = (((data.secondarY_MET_CRITICAL_KPI + data.secondarY_MET_KEY_KPI) / data.overalL_KPI_COUNT) * 100)
            if (includeExclusions) {
                achievePercent = (((data.exclusioN_SECONDARY_MET_CRITICAL_KPI + data.exclusioN_SECONDARY_MET_KEY_KPI) / data.overalL_KPI_COUNT) * 100)
                if ((data.criticaL_KPI == data.exclusioN_SECONDARY_MET_CRITICAL_KPI) && achievePercent >= Number(achievementPercent)) {
                    return 'Under Control';
                }
                else if ((data.criticaL_KPI != data.exclusioN_SECONDARY_MET_CRITICAL_KPI)) {
                    return 'Need Focus';
                }
                else if ((data.criticaL_KPI == data.exclusioN_SECONDARY_MET_CRITICAL_KPI) && achievePercent < Number(achievementPercent)) {
                    return 'Need Focus';
                }
            }
            else {
                if ((data.criticaL_KPI == data.secondarY_MET_CRITICAL_KPI) && achievePercent >= Number(achievementPercent)) {
                    return 'Under Control';
                }
                else if ((data.criticaL_KPI != data.secondarY_MET_CRITICAL_KPI)) {
                    return 'Need Focus';
                }
                else if ((data.criticaL_KPI == data.secondarY_MET_CRITICAL_KPI) && achievePercent < Number(achievementPercent)) {
                    return 'Need Focus';
                }
            }
        }
    }

    public getFindingsCount(openFindings, id, type) {
        let count = 0;
        let filteredOpenFinding = openFindings.filter(x => x.audiT_ID == id);
        if (openFindings.length > 0 && filteredOpenFinding.length > 0) {
            if (type == "total") {
                count = filteredOpenFinding[0].totaL_FINDINGS;
            }
            if (type == "open") {
                count = filteredOpenFinding[0].opeN_FINDINGS;
            }
            if (type == "closed") {
                count = filteredOpenFinding[0].closeD_FINDINGS;
            }
        }
        return count;
    }



}

