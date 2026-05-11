import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IdeaCategory } from '../../../models/bvd-entry/benefit-details-quantitative-model';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ImplementationPlan } from '../../../models/bvd-entry/idea-implementation-plan-model';
import { IdeaStageStatus } from '../../../models/bvd-entry/idea-stage-status';
import { IdeaReview } from '../../../models/bvd-entry/idea-review-model';
import { IdeaStatus, IdeaImprovementType, PotentialSolutionCategory, Idea } from "../../../models/bvd-entry/idea-model";

// Interface for BenefitViewDetails (used in the service)
export interface BenefitViewDetails {
  // Add properties as needed based on legacy usage
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class BvdEntryService {
  apiurl: string = "";
  apiurl_auth: string = "";
  currentStep: number = 1;
  ideA_ID: number = 0;
  projecT_ID: string = '';
  customerid: number = 0;
  reset: string = '';
  bvdViewType: number = 1;
  bvdidea = new Idea();
  bvdreview = new IdeaReview();
  bvdimplementationschdules: ImplementationPlan[] = []
  bvdbenefit: BenefitViewDetails[] = [];
  bvdstages: any[] = [];
  ideas: any[] = [];
  resources: any[] = [];
  isIdeaSubmitted: boolean = false;
  isIdeaApproved: boolean = false;

  constructor(private _http: HttpClient) {
    this.apiurl = environment.webapiuri;
    this.apiurl_auth = environment.webapiuri_auth;
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Accept: "application/json",
      token: localStorage.getItem('token') || '',
      empId: localStorage.getItem("empid") || '',
    });
  }

  getEmployeeName(empid: string): string {
    let resource = this.resources.find(x => x.emP_ID == empid);
    if (resource != null)
      return resource.frsT_NM;
    else
      return "";
  }

  getIdeaCategories(): Observable<IdeaCategory[]> {
    return this._http.get<IdeaCategory[]>(
      this.apiurl + "/GetIdeaCategories", { headers: this.getAuthHeaders() }
    );
  }

  getIdeaStages(ideaid: number): Observable<IdeaStageStatus[]> {
    return this._http.get<IdeaStageStatus[]>(
      this.apiurl + "/GetIdeaStageStatus?Ideaid=" + ideaid, { headers: this.getAuthHeaders() }
    );
  }

  getIdeaStatus(): Observable<IdeaStatus[]> {
    return this._http.get<IdeaStatus[]>(
      this.apiurl + "/GetIdeaStatus", { headers: this.getAuthHeaders() }
    );
  }

  getSimilarIdeas(idea: Idea): Observable<Idea[]> {
    return this._http.post<Idea[]>(
      this.apiurl + "/GetSimilarIdeas", idea,
      { headers: this.getAuthHeaders() }
    );
  }

  getIdeaImprovementAndCategoryList(): Observable<any> {
    return this._http.get<any>(
      this.apiurl + "/GetIdeaImprovementsAndCategories", { headers: this.getAuthHeaders() }
    );
  }

  getApplicableBenefits(categoryids: any): Observable<any[]> {
    return this._http.post<any[]>(
      this.apiurl + "/GetApplicableBenefits", categoryids,
      { headers: this.getAuthHeaders() }
    );
  }

  saveIdeaBenefits(benefits: any): Observable<any[]> {
    return this._http.post<any[]>(
      this.apiurl + "/SaveIdeaBenefits",
      benefits,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteIdeaBenefit(benefits: any): Observable<any> {
    return this._http.post<any>(
      this.apiurl + "/DeleteIdeaBenefit",
      benefits,
      { headers: this.getAuthHeaders() }
    );
  }

  getCategoryByBenefitPillar(pillarid: number, TypeId: number): Observable<any[]> {
    return this._http.get<any[]>(
      this.apiurl + "/GetCategoryByBenefitPillar?PillarId=" + pillarid + "&TypeId=" + TypeId,
      { headers: this.getAuthHeaders() }
    );
  }

  saveIdeaImplementationDetails(data: any): Observable<any> {
    return this._http.post<any>(this.apiurl + "/SaveIdeaImplementationDetails", data, { headers: this.getAuthHeaders() });
  }

  saveReviewerResponse(data: any): Observable<any> {
    return this._http.post<any>(this.apiurl + "/SaveReviewerResponse", data, { headers: this.getAuthHeaders() });
  }

  getAllIdeas(ideaInputs: any): Observable<any> {
    return this._http.post<any>(this.apiurl + "/GetAllIdeas", ideaInputs, { headers: this.getAuthHeaders() });
  }

  getAllIdeasByCustomer(customerId: number): Observable<any[]> {
    return this._http.get<any[]>(this.apiurl + "/GetAllIdeasByCustomer?CustomerId=" + customerId, { headers: this.getAuthHeaders() });
  }

  getIdeaDetailsById(ideaid: number): Observable<any> {
    return this._http.get<any>(this.apiurl + "/GetIdeaDetailsById?Ideaid=" + ideaid, { headers: this.getAuthHeaders() });
  }

  getIdeaById(ideaId: number): Observable<any> {
    return this._http.get<any>(this.apiurl + "/GetIdeasDetailById?ideaId=" + ideaId, { headers: this.getAuthHeaders() });
  }

  getIdeaStatusList(): Observable<IdeaStatus[]> {
    return this._http.get<IdeaStatus[]>(
      this.apiurl + "/GetIdeaStatus", { headers: this.getAuthHeaders() }
    );
  }

  saveIdeaDetails(idea: Idea): Observable<Idea> {
    return this._http.post<Idea>(
      this.apiurl + "/SaveIdeaDetails", idea, { headers: this.getAuthHeaders() }
    );
  }

  getIdeaImprovements(): Observable<IdeaImprovementType[]> {
    return this._http.get<IdeaImprovementType[]>(
      this.apiurl + "/GetIdeaImprovements", { headers: this.getAuthHeaders() }
    );
  }

  getImplementationSchdule(ideaid: number): Observable<ImplementationPlan[]> {
    return this._http.get<ImplementationPlan[]>(
      this.apiurl + "/GetImplementationSchdule?IdeaId=" + ideaid, { headers: this.getAuthHeaders() }
    );
  }

  updateImplementationSchdule(imprec: ImplementationPlan): Observable<ImplementationPlan> {
    return this._http.post<ImplementationPlan>(
      this.apiurl + "/UpdateImplementationSchdule", imprec, { headers: this.getAuthHeaders() }
    );
  }

  updateIdeaStatus(ideaUpdates: any[]): Observable<any> {
    return this._http.post<any>(
      this.apiurl + "/UpdateIdeaStatus", ideaUpdates, { headers: this.getAuthHeaders() }
    );
  }

  getPotentialSolutionCategories(): Observable<PotentialSolutionCategory[]> {
    return this._http.get<PotentialSolutionCategory[]>(
      this.apiurl + "/GetPotentialSolutionCategories", { headers: this.getAuthHeaders() }
    );
  }

  submitIdea(ideaId: number): Observable<any> {
    return this._http.post<any>(
      this.apiurl + "/SubmitIdea",
      ideaId,
      { headers: this.getAuthHeaders() }
    );
  }

  DeleteIdeaById(ideaId: number): Observable<any> {
    return this._http.get<any>(
      this.apiurl + "/DeleteIdea?ideaId=" + ideaId, { headers: this.getAuthHeaders() }
    );
  }

  deleteImplementationSchdule(ImpId: number): Observable<any> {
    return this._http.post<any>(
      this.apiurl + "/DeleteImplementationSchdule?ImpId=" + ImpId, { headers: this.getAuthHeaders() }
    );
  }

  updateIdeaDetails(Id: number, Comments: string): Observable<any[]> {
    return this._http.get<any[]>(
      this.apiurl + "/UpdateIdeaDetails?IdeaId=" + Id + "&Comments=" + Comments, { headers: this.getAuthHeaders() }
    );
  }

  getprojectsNameForAPortfolioNew(portfolioId: number): Observable<any[]> {
    return this._http.get<any[]>(
      this.apiurl + "/GetprojectsNameForAPortfolioNew?Portfolio=" + portfolioId, { headers: this.getAuthHeaders() }
    );
  }

  getIdeaImprovementTypes(): Observable<IdeaImprovementType[]> {
    return this._http.get<IdeaImprovementType[]>(
      this.apiurl + "/GetIdeaImprovementTypes", { headers: this.getAuthHeaders() }
    );
  }
}
