import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { Observable } from "rxjs/Observable";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { catchError, finalize } from "rxjs/operators";
import { of } from "rxjs/observable/of";
import { RiskModel } from "../models/risk-model";

export class RiskDatasource implements DataSource<RiskModel> {
    private Risks = new BehaviorSubject<RiskModel[]>([]);
    private loadingRisks = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingRisks.asObservable();
    constructor() { }
    loadLessons(risks:RiskModel[]) {
        this.loadingRisks.next(true);
        this.Risks.next(risks);
   }
    connect(collectionViewer: CollectionViewer): Observable<RiskModel[]> {
//console.log("Connecting data source");
        return this.Risks.asObservable();
    }
    disconnect(collectionViewer: CollectionViewer): void {
        this.Risks.complete();
        this.loadingRisks.complete();
    }
}
