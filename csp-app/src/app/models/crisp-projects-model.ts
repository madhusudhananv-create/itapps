import { CrispProjectCategoryModel } from "./crisp-project-category-model";
import { CrispProjectCriteriaModel } from "./crisp-project-criteria-model";
import { CrispProjectValidationsModel } from "./crisp-project-validations-model";
import { CrispScoresProjectModel } from "./crisp-scores-project-model";
import { CrispScoresCategoryModel } from "./crisp-scores-category-model";
import { CrispScoresCriteriaModel } from "./crisp-scores-criteria-model";
import { CrispScoresValidationsModel } from "./crisp-scores-validations-model";
import { CrispCategoryModel } from "./crisp-category-model";
import { CrispCriteriaModel } from "./crisp-criteria-model";
import { CrispValidationsModel } from "./crisp-validations-model";
import { CustomerProjectsModel } from "./customer-projects-model";
import { ProjectsModel } from "./projects-model";

export class CrispProjectsModel {
    crisP_PROJECT_CATEGORY:CrispProjectCategoryModel[];
    crisP_PROJECT_CRITERIA:CrispProjectCriteriaModel[];
    crisP_PROJECT_VALIDATIONS:CrispProjectValidationsModel[];

    crisP_SCORES_PROJECT: CrispScoresProjectModel;
    crisP_SCORES_CATEGORY: CrispScoresCategoryModel[];
    crisP_SCORES_CRITERIA: CrispScoresCriteriaModel[];
    crisP_SCORES_VALIDATIONS: CrispScoresValidationsModel[];
}

export class CrispDataModel{
    projects: ProjectsModel[];
    crisP_CATEGORY: CrispCategoryModel[];
    crisP_CRITERIA: CrispCriteriaModel[];
    crisP_VALIDATIONS: CrispValidationsModel[];
    crisP_PROJECT: CrispProjectsModel[];
} 
