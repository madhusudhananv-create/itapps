using System;

namespace GAVS.AllocationSystem.Model.CSP.SP
{
    // Flat result-set shapes for the ITOps Admin Setup read stored procedures
    // (usp_ITOpsGet*, see DB Scripts/2026/ITOperationMaturity/V2/
    // ITOperationMaturity_V2_13_ReadStoredProcedures.sql). Each mirrors one
    // SELECT's column list exactly - EF6's Database.SqlQuery<T> maps by name
    // and throws if the result columns and T's properties disagree, so these
    // are intentionally flat DTOs rather than the entity classes.

    public class ITOpsAssessmentCycleSpRow
    {
        public int CycleId { get; set; }
        public string CycleLabel { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string CycleStatus { get; set; }
        public string Description { get; set; }
        /// <summary>Null when the cycle has no assessments yet.</summary>
        public string AssessmentStatus { get; set; }
        public int? StatusCount { get; set; }
    }

    public class ITOpsAssessmentTeamSpRow
    {
        public string RoleType { get; set; } // "Assessor" | "Reviewer" | "Assessee"
        public int ID { get; set; }
        public int AssessmentId { get; set; }
        public string EmpId { get; set; }
        public bool IsPrimary { get; set; }
    }

    public class ITOpsDomainProjectMapDomainSpRow
    {
        public int MappingId { get; set; }
        public string ProjectId { get; set; }
        public int DomainId { get; set; }
        public string DomainCode { get; set; }
        public string DomainName { get; set; }
    }

    public class ITOpsDomainProjectMapAssesseeSpRow
    {
        public string ProjectId { get; set; }
        public string EmpId { get; set; }
    }

    public class ITOpsCategoryForDomainSpRow
    {
        public int CategoryId { get; set; }
        public int DomainId { get; set; }
        public string Name { get; set; }
        public int DisplayOrder { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsCurrent { get; set; }
        public int ParameterCount { get; set; }
        public int VersionCount { get; set; }
    }
}
