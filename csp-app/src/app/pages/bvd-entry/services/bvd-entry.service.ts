import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IdeaCategory } from '../../../models/bvd-entry/benefit-details-quantitative-model';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { myUtility } from '../../../Shared/myUtility';
import { environment } from '../../../../environments/environment';
import { ImplementationPlan } from '../../../models/bvd-entry/idea-implementation-plan-model';
import { BenefitViewDetails } from '../idea-benefit-entry/idea-benefit-entry.component';
import { IdeaStageStatus } from '../../../models/bvd-entry/idea-stage-status';
import { IdeaReview } from '../../../models/bvd-entry/idea-review-model';
import { IdeaStatus, IdeaImprovementType, PotentialSolutionCategory, Idea } from "../../../models/bvd-entry/idea-model";


@Injectable({
    providedIn: 'root'
})
export class BvdEntryService {
    apiurl: string = "";
    apiurl_auth: string = "";
    currentStep: number = 1;
    ideA_ID: number = 0;
    projecT_ID: string = '';
    bvdViewType: number = 1;
    bvdidea = new Idea();
    bvdreview = new IdeaReview();
    bvdimplementationschdules: ImplementationPlan[] = []
    bvdbenefit: BenefitViewDetails[] = [];
    bvdstages = [];
    ideas: any[] = [];
    resources: any[] = [];
    isIdeaSubmitted: boolean = false;
    isIdeaApproved: boolean = false;

    constructor(private _util: myUtility, private _http: HttpClient) {
        console.log("new instace craeted");
        this.apiurl = environment.webapiuri;
        this.apiurl_auth = environment.webapiuri_auth;
    }

    getEmployeeName(empid) {
        let resource = this.resources.find(x => x.emP_ID == empid);
        if (resource != null)
            return resource.frsT_NM;
        else
            return "";
    }

    getIdeaCategories(): Observable<IdeaCategory[]> {
        let header = new HttpHeaders({
            Accept: "application/json",
            token: this._util.AppSettings.token,
            empId: localStorage.getItem("empid"),
        });
        return this._http.get<IdeaCategory[]>(
            this.apiurl + "/GetIdeaCategories", { headers: header }
        );
    }

    getIdeaStages(ideaid): Observable<IdeaStageStatus[]> {
        let header = new HttpHeaders({
            Accept: "application/json",
            token: this._util.AppSettings.token,
            empId: localStorage.getItem("empid"),
        });
        return this._http.get<IdeaStageStatus[]>(
            this.apiurl + "/GetIdeaStageStatus?Ideaid=" + ideaid, { headers: header }
        );
    }

    getIdeaStatus(): Observable<IdeaStatus[]> {
        let header = new HttpHeaders({
            Accept: "application/json",
            token: this._util.AppSettings.token,
            empId: localStorage.getItem("empid"),
        });
        return this._http.get<IdeaStatus[]>(
            this.apiurl + "/GetIdeaStatus", { headers: header }
        );
    }

    getSimilarIdeas(idea): Observable<Idea[]> {
        let header = new HttpHeaders({
            Accept: "application/json",
            token: this._util.AppSettings.token,
            empId: localStorage.getItem("empid"),
        });
        return this._http.post<Idea[]>(
            this.apiurl + "/GetSimilarIdeas", idea,
            { headers: header }
        );
    }

    getIdeaImprovementAndCategoryList(): Observable<any> {
        let header = new HttpHeaders({
            Accept: "application/json",
            token: this._util.AppSettings.token,
            empId: localStorage.getItem("empid"),
        });
        return this._http.get<any>(
            this.apiurl + "/GetIdeaImprovementsAndCategories", { headers: header }
        );
    }

    getApplicableBenefits(categoryids): Observable<any[]> {
        let header = new HttpHeaders({
            Accept: "application/json",
            token: this._util.AppSettings.token,
            empId: localStorage.getItem("empid"),
        });
        return this._http.post<any[]>(
            this.apiurl + "/GetApplicableBenefits", categoryids,
            { headers: header }
        );
    }

    saveIdeaBenefits(benefits): Observable<any[]> {
        let header = new HttpHeaders({
            Accept: "application/json",
            token: this._util.AppSettings.token,
            empId: localStorage.getItem("empid"),
        });
        return this._http.post<any[]>(
            this.apiurl + "/SaveIdeaBenefits",
            benefits,
            { headers: header }
        );
    }

    deleteIdeaBenefit(benefits): Observable<any> {
        let header = new HttpHeaders({
            Accept: "application/json",
            token: this._util.AppSettings.token,
            empId: localStorage.getItem("empid"),
        });
        return this._http.post<any>(
            this.apiurl + "/DeleteIdeaBenefit",
            benefits,
            { headers: header }
        );
    }

    getCategoryByBenefitPillar(pillarid, TypeId): Observable<any[]> {
        let header = new HttpHeaders({
            Accept: "application/json",
            token: this._util.AppSettings.token,
            empId: localStorage.getItem("empid"),
        });
        return this._http.get<any[]>(
            this.apiurl + "/GetCategoryByBenefitPillar?PillarId=" + pillarid + "&TypeId=" + TypeId,
            { headers: header }
        );
    }

    saveIdeaImplementationDetails(data): Observable<any> {
        let header = new HttpHeaders({
            Accept: "application/json",
            token: this._util.AppSettings.token,
            empId: localStorage.getItem("empid"),
        });
        return this._http.post<any>(this.apiurl + "/SaveIdeaImplementationDetails", data, { headers: header });
    }

    saveReviewerResponse(data): Observable<any> {
        let header = new HttpHeaders({
            Accept: "application/json",
            token: this._util.AppSettings.token,
            empId: localStorage.getItem("empid"),
        });
        return this._http.post<any>(this.apiurl + "/SaveReviewerResponse", data, { headers: header });
    }

    getAllIdeas(ideaInputs): Observable<any> {
        let header = new HttpHeaders({
            'Accept': 'application/json',
            token: this._util.AppSettings.token,
            empId: localStorage.getItem("empid")
        });
        return this._http.post<any>(this.apiurl + "/GetAllIdeas", ideaInputs, { headers: header }
        );
    }

    getAllIdeasByCustomer(customerId): Observable<any[]> {
        let header = new HttpHeaders({
            Accept: "application/json",
            token: this._util.AppSettings.token,
            empId: localStorage.getItem("empid"),
        });
        return this._http.get<any[]>(this.apiurl + "/GetAllIdeasByCustomer?CustomerId=" + customerId, { headers: header });
    }

    getIdeaDetailsById(ideaid): Observable<any> {
        let header = new HttpHeaders({
            Accept: "application/json",
            token: this._util.AppSettings.token,
            empId: localStorage.getItem("empid"),
        });
        return this._http.get<any>(this.apiurl + "/GetIdeaDetailsById?Ideaid=" + ideaid, { headers: header });
    }

    getIdeaById(ideaId): Observable<any> {
        let header = new HttpHeaders({
            Accept: "application/json",
            token: this._util.AppSettings.token,
            empId: localStorage.getItem("empid"),
        });
        return this._http.get<any>(this.apiurl + "/GetIdeasDetailById?ideaId=" + ideaId, { headers: header });
    }

    getIdeaStatusList(): Observable<IdeaStatus[]> {
        let header = new HttpHeaders({
            Accept: "application/json",
            token: this._util.AppSettings.token,
            empId: localStorage.getItem("empid"),
        });
        return this._http.get<IdeaStatus[]>(
            this.apiurl + "/GetIdeaStatus", { headers: header }
        );
    }

    saveIdeaDetails(idea): Observable<Idea> {
        let header = new HttpHeaders({
            Accept: "application/json",
            token: this._util.AppSettings.token,
            empId: localStorage.getItem("empid"),
        });
        return this._http.post<Idea>(
            this.apiurl + "/SaveIdeaDetails", idea, { headers: header }
        );
    }

    getIdeaImprovements(): Observable<IdeaImprovementType[]> {
        let header = new HttpHeaders({
            Accept: "application/json",
            token: this._util.AppSettings.token,
            empId: localStorage.getItem("empid"),
        });
        return this._http.get<IdeaImprovementType[]>(
            this.apiurl + "/GetIdeaImprovements", { headers: header }
        );
    }

    getImplementationSchdule(ideaid): Observable<ImplementationPlan[]> {
        let header = new HttpHeaders({
            Accept: "application/json",
            token: this._util.AppSettings.token,
            empId: localStorage.getItem("empid"),
        });
        return this._http.get<ImplementationPlan[]>(
            this.apiurl + "/GetImplementationSchdule?IdeaId=" + ideaid, { headers: header }
        );
    }

    updateImplementationSchdule(imprec): Observable<ImplementationPlan> {
        let header = new HttpHeaders({
            Accept: "application/json",
            token: this._util.AppSettings.token,
            empId: localStorage.getItem("empid"),
        });
        return this._http.post<ImplementationPlan>(
            this.apiurl + "/UpdateImplementationSchdule", imprec, { headers: header }
        );
    }

    updateIdeaStatus(id): Observable<any> {
        let header = new HttpHeaders({
            Accept: "application/json",
            token: this._util.AppSettings.token,
            empId: localStorage.getItem("empid"),
        });
        return this._http.post<any>(
            this.apiurl + "/UpdateIdeaStatus", id, { headers: header }
        );
    }



    getPotentialSolutionCategories(): Observable<PotentialSolutionCategory[]> {
        let header = new HttpHeaders({
            Accept: "application/json",
            token: this._util.AppSettings.token,
            empId: localStorage.getItem("empid"),
        });
        return this._http.get<PotentialSolutionCategory[]>(
            this.apiurl + "/GetPotentialSolutionCategories", { headers: header }
        );
    }

    submitIdea(ideaId): Observable<any> {
        let header = new HttpHeaders({
            Accept: "application/json",
            token: this._util.AppSettings.token,
            empId: localStorage.getItem("empid"),
        });
        return this._http.post<any>(
            this.apiurl + "/SubmitIdea",
            ideaId,
            { headers: header }
        );
    }

    DeleteIdeaById(ideaId): Observable<any> {
        let header = new HttpHeaders({
            Accept: "application/json",
            token: this._util.AppSettings.token,
            empId: localStorage.getItem("empid"),
        });
        return this._http.get<any>(
            this.apiurl + "/DeleteIdea?ideaId=" + ideaId, { headers: header }
        );
    }

    deleteImplementationSchdule(ImpId): Observable<any> {
        let header = new HttpHeaders({
            Accept: "application/json",
            token: this._util.AppSettings.token,
            empId: localStorage.getItem("empid"),
        });
        return this._http.post<any>(
            this.apiurl + "/DeleteImplementationSchdule?ImpId=" + ImpId, { headers: header }
        );
    }

    updateIdeaDetails(Id, Comments): Observable<any[]> {
        let header = new HttpHeaders({
            Accept: "application/json",
            token: this._util.AppSettings.token,
            empId: localStorage.getItem("empid"),
        });
        return this._http.get<any[]>(
            this.apiurl + "/UpdateIdeaDetails?IdeaId=" + Id + "&Comments=" + Comments, { headers: header }
        );

    }

    getprojectsNameForAPortfolioNew(portfolioId): Observable<any[]> {
        let header = new HttpHeaders({
            Accept: "application/json",
            token: this._util.AppSettings.token,
            empId: localStorage.getItem("empid"),
        });
        return this._http.get<any[]>(
            this.apiurl + "/GetprojectsNameForAPortfolioNew?Portfolio=" + portfolioId, { headers: header }

        );
    }

    getIdeaImprovementTypes(): Observable<IdeaImprovementType[]> {
        let header = new HttpHeaders({
            Accept: "application/json",
            token: this._util.AppSettings.token,
            empId: localStorage.getItem("empid"),
        });
        return this._http.get<IdeaImprovementType[]>(
            this.apiurl + "/GetIdeaImprovementTypes", { headers: header }
        );
    }


}