import { RagsModel } from "./rags-model";
import { ScopeModel } from "./scope-Model";
import { DeliveryModel, DeliveryDetailsModel } from "./delivery-model";
import { PeopleModel } from "./people-model";
import { ResourceModel } from "./resource-model";
import { ProcessModel } from "./process-model";
import { RiskModel } from "./risk-model";
import { IssueModel } from "./issue-model";
import { ValueaddModel } from "./valueadd-model";
import { ActionitemModel } from "./actionitem-model";
import { InnovationModel } from "./innovation-model";
import { SuccessModel } from "./success-model";

export class ProjectDetailsModel {
    proJ_ID: string;
    proJ_NM: string;
    proJ_RAG: string;
    publisheD_ON: Date;
    lastupdated: string;
    details: {
        rags: RagsModel[],
        scope: ScopeModel,
        deliveryDetails: DeliveryDetailsModel,
        people: PeopleModel,
        resource: ResourceModel[],
        process: ProcessModel[],
        risk: RiskModel[],
        issue: IssueModel[],
        valueadds: ValueaddModel[],
        actionitems: ActionitemModel[],
        innovation : InnovationModel[],
        success : SuccessModel[],
    }
}
