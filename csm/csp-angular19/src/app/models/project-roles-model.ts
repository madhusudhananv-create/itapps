/**
 * Project Roles Model (application role dropdown)
 * Backed by GET /GetCSMTitles (AllSysController -> CSM_TITLES entity).
 * Field casing reflects the global CamelCasePropertyNamesContractResolver transform
 * (see access-control.model.ts for the full explanation) - "TITLE"/"ID" fully lowercase,
 * "SORT_ORDER" -> "sorT_ORDER".
 */
export interface ProjectRolesModel {
  id: number;
  title: string;
  sorT_ORDER: number;
}
