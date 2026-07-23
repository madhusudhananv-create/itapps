import { Component, OnInit, EventEmitter, Input, Output, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MyUtility } from '../../my-utility';

export class FilterPreferenceModel {
  fielD_NAME: string;
  displaY_NAME: string;
  searchString: string = '';
  searchStringValue: string = '';
  datA_TYPE: string;
  values: any[] = [];

  constructor(fieldName: string, displayName: string, dataType: string, values: any[] = []) {
    this.fielD_NAME = fieldName;
    this.displaY_NAME = displayName;
    this.datA_TYPE = dataType;
    this.values = values;
  }
}

/**
 * Table Filter Component
 * Simplified version for filtering table data
 * 
 * Features:
 * - Dynamic filter field selection
 * - String and dropdown filtering
 * - Multiple filter criteria
 * - Apply and Clear functionality
 * - Visual filter tags
 */
@Component({
  selector: 'app-table-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './table-filter.component.html',
  styleUrls: ['./table-filter.component.scss']
})
export class TableFilterComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];
  @Input() tableName: string = '';
  @Input() filterCriteria: FilterPreferenceModel[] = [];
  @Input() custId: string = '';
  @Output() onChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() OnAdd: EventEmitter<boolean> = new EventEmitter<boolean>();

  originalData: any[] = [];
  filteredData: any[] = [];
  filterPref: FilterPreferenceModel[] = [];
  filterCriterias: FilterPreferenceModel[] = [];
  selectedFilterPref: FilterPreferenceModel = new FilterPreferenceModel('', '', 'string', []);

  private _util = inject(MyUtility);

  constructor() { }

  ngOnInit() {
    this.LoadFilterPreference(this.tableName);
    this.originalData = this.data || [];
    this.filteredData = this.data || [];
    this.filterCriterias = this.filterCriteria != null && this.filterCriteria != undefined ? this.filterCriteria : [];
  }

  ngOnChanges() {
    this.LoadFilterPreference(this.tableName);
    this.originalData = this.data || [];
    this.filteredData = this.data || [];
    this.filterCriterias = this.filterCriteria != null && this.filterCriteria != undefined ? this.filterCriteria : [];
  }

  emitChanges() {
    const obj = { data: this.filteredData, criteria: this.filterCriterias };
    this.onChange.emit(obj);
  }

  getFieldIcon(dataType: string): string {
    switch (dataType) {
      case 'string':
        return 'text_fields';
      case 'number':
        return 'tag';
      case 'date':
        return 'calendar_today';
      case 'boolean':
        return 'toggle_on';
      default:
        return 'filter_alt';
    }
  }

  LoadFilterPreference(tableName: string) {
    this.filterPref = [];

    if (tableName === 'CONFIG_EXT') {
      this.filterPref.push(new FilterPreferenceModel('key', 'Key', 'string'));
      this.filterPref.push(new FilterPreferenceModel('value', 'Value', 'string'));
      this.filterPref.push(new FilterPreferenceModel('description', 'Description', 'string'));
      this.filterPref.push(new FilterPreferenceModel('customeR_NAME', 'Customer Name', 'string'));
      this.filterPref.push(new FilterPreferenceModel('projecT_NAME', 'Project Name', 'string'));
      this.filterPref.push(new FilterPreferenceModel('comments', 'Comments', 'string'));
      this.filterPref.push(new FilterPreferenceModel('isencrypt', 'Encryption', 'number', [
        { id: true, name: 'Yes' },
        { id: false, name: 'No' }
      ]));
    } else if (tableName === 'CUSTOMER_FEEDBACK') {
      this.filterPref.push(new FilterPreferenceModel('tickeT_ID', 'Ticket ID', 'string'));
      this.filterPref.push(new FilterPreferenceModel('customeR_EMAILID', 'Email', 'string'));
      this.filterPref.push(new FilterPreferenceModel('feedback', 'Feedback', 'string'));
      this.filterPref.push(new FilterPreferenceModel('status', 'Status', 'string', [
        { id: 'New', name: 'New' },
        { id: 'Submitted', name: 'Submitted' },
        { id: 'Work-in-Progress', name: 'Work-in-Progress' },
        { id: 'Resolved', name: 'Resolved' },
        { id: 'Closed', name: 'Closed' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('comments', 'Comments', 'string'));
    } else if (tableName === 'PROJECT_RISK') {
      this.filterPref.push(new FilterPreferenceModel('description', 'Risk Description', 'string'));
      this.filterPref.push(new FilterPreferenceModel('impact', 'Business Impact', 'string'));
      this.filterPref.push(new FilterPreferenceModel('impacT_SCALE', 'Consequences', 'string', [
        { id: '1', name: 'Insignificant' },
        { id: '2', name: 'Minor' },
        { id: '3', name: 'Significant' },
        { id: '4', name: 'Major' },
        { id: '5', name: 'Critical' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('probabilitY_SCALE', 'Likelihood', 'string', [
        { id: '1', name: 'Rare' },
        { id: '2', name: 'Remote' },
        { id: '3', name: 'Moderate' },
        { id: '4', name: 'Likely' },
        { id: '5', name: 'Frequent' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('owner', 'Risk Owner', 'string'));
      this.filterPref.push(new FilterPreferenceModel('status', 'Status', 'string', [
        { id: 'Identified', name: 'Identified' },
        { id: 'Assessed', name: 'Assessed' },
        { id: 'Planned', name: 'Planned' },
        { id: 'In-Process', name: 'In-Process' },
        { id: 'Occurred', name: 'Occurred' },
        { id: 'Not-Occurred', name: 'Not Occurred' },
        { id: 'Closed', name: 'Closed' }
      ]));
    } else if (tableName === 'PROJECT_ACTIONITEM') {
      this.filterPref.push(new FilterPreferenceModel('description', 'Description', 'string'));
      this.filterPref.push(new FilterPreferenceModel('status', 'Status', 'string', [
        { id: 'In Progress', name: 'In Progress' },
        { id: 'Completed', name: 'Completed' },
        { id: 'Cancelled', name: 'Cancelled' },
        { id: 'Suspended', name: 'Suspended' },
        { id: 'Open', name: 'Open' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('priority', 'Priority', 'string', [
        { id: 'Critical', name: 'Critical' },
        { id: 'High', name: 'High' },
        { id: 'Medium', name: 'Medium' },
        { id: 'Low', name: 'Low' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('source', 'Source', 'string'));
      this.filterPref.push(new FilterPreferenceModel('owner', 'Owner', 'string'));
    } else if (tableName === 'PROJECT_ASSESSMENTS') {
      this.filterPref.push(new FilterPreferenceModel('description', 'Description', 'string'));
      this.filterPref.push(new FilterPreferenceModel('assigneD_TO_NAME', 'Responsible', 'string'));
      this.filterPref.push(new FilterPreferenceModel('priority', 'Priority', 'string', [
        { id: 'Critical', name: 'Critical' },
        { id: 'High', name: 'High' },
        { id: 'Medium', name: 'Medium' },
        { id: 'Low', name: 'Low' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('status', 'Status', 'string', [
        { id: 'PLANNED', name: 'Planned' },
        { id: 'IN PROGRESS', name: 'In Progress' },
        { id: 'COMPLETED', name: 'Completed' },
        { id: 'CANCELLED', name: 'Cancelled' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('owneR_NAME', 'Owner', 'string'));
    } else if (tableName === 'PROJECT_ISSUE') {
      this.filterPref.push(new FilterPreferenceModel('description', 'Description', 'string'));
      this.filterPref.push(new FilterPreferenceModel('actioN_PLAN', 'Action Plan', 'string'));
      this.filterPref.push(new FilterPreferenceModel('assigneD_TO_NAME', 'Assigned To', 'string'));
      this.filterPref.push(new FilterPreferenceModel('issuE_TYPE', 'Issue Type', 'string', [
        { id: 'Business', name: 'Business' },
        { id: 'Other functions', name: 'Other functions' },
        { id: 'Environment', name: 'Environment' },
        { id: 'Resource', name: 'Resource' },
        { id: 'Communication', name: 'Communication' },
        { id: 'Planning', name: 'Planning' },
        { id: 'Process', name: 'Process' },
        { id: 'Scope', name: 'Scope' },
        { id: 'Constraint', name: 'Constraint' },
        { id: 'Monitoring and Control', name: 'Monitoring and Control' },
        { id: 'Hardware', name: 'Hardware' },
        { id: 'Software', name: 'Software' },
        { id: 'Server', name: 'Server' },
        { id: 'Telecom', name: 'Telecom' },
        { id: 'Desktop', name: 'Desktop' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('status', 'Status', 'string', [
        { id: 'Open', name: 'Open' },
        { id: 'In-Progress', name: 'In-Progress' },
        { id: 'Closed', name: 'Closed' },
        { id: 'On Hold', name: 'On Hold' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('severity', 'Severity', 'string', [
        { id: 'High', name: 'High' },
        { id: 'Medium', name: 'Medium' },
        { id: 'Low', name: 'Low' }
      ]));
    } else if (tableName === 'EVENT_TASK_DETAILS') {
      this.filterPref.push(new FilterPreferenceModel('taskTitle', 'Task Title', 'string'));
      this.filterPref.push(new FilterPreferenceModel('taskType', 'Task Type', 'string', [
        { id: 'Task', name: 'Task' },
        { id: 'Event', name: 'Event' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('status', 'Status', 'string', [
        { id: 'Planned', name: 'Planned' },
        { id: 'Started', name: 'Started' },
        { id: 'Completed', name: 'Completed' },
        { id: 'Cancelled', name: 'Cancelled' },
        { id: 'Suspended', name: 'Suspended' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('priority', 'Priority', 'string', [
        { id: 'High', name: 'High' },
        { id: 'Medium', name: 'Medium' },
        { id: 'Low', name: 'Low' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('taskCategory', 'Task Category', 'string'));
    } else if (tableName === 'IDEA') {
      this.filterPref.push(new FilterPreferenceModel('projecT_NAME', 'Project', 'string'));
      this.filterPref.push(new FilterPreferenceModel('description', 'Description', 'string'));
      this.filterPref.push(new FilterPreferenceModel('type', 'Type', 'string', [
        { id: 'Idea', name: 'Idea' },
        { id: 'Continuous Improvement', name: 'Continuous Improvement' },
        { id: 'Release', name: 'Release' },
        { id: 'Service', name: 'Service' },
        { id: 'Service Improvement', name: 'Service Improvement' },
        { id: 'Innovation', name: 'Innovation' },
        { id: 'Automation', name: 'Automation' },
        { id: 'Process Improvement', name: 'Process Improvement' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('responsible', 'Identified By', 'string'));
      this.filterPref.push(new FilterPreferenceModel('status', 'Status', 'string', [
        { id: 'Draft', name: 'Draft' },
        { id: 'Submitted', name: 'Submitted' },
        { id: 'Implemented', name: 'Implemented' },
        { id: 'Approved', name: 'Approved' },
        { id: 'Rejected', name: 'Rejected' },
        { id: 'On-Hold', name: 'On-Hold' },
        { id: 'Planned', name: 'Planned' },
        { id: 'Completed', name: 'Completed' }
      ]));
    } else if (tableName === 'PROJECT_INNOVATION') {
      this.filterPref.push(new FilterPreferenceModel('title', 'Title', 'string'));
      this.filterPref.push(new FilterPreferenceModel('status', 'Status', 'string', [
        { id: 'Identified', name: 'Identified' },
        { id: 'Planning', name: 'Planning' },
        { id: 'Execution', name: 'Execution' },
        { id: 'Completed', name: 'Completed' }
      ]));
    } else if (tableName === 'PROJECT_FINDINGS') {
      this.filterPref.push(new FilterPreferenceModel('findinG_TITLE', 'Finding Title', 'string'));
      this.filterPref.push(new FilterPreferenceModel('findinG_TYPE', 'Finding Type', 'string', [
        { id: 'Strength', name: 'Strength' },
        { id: 'Weakness', name: 'Weakness' },
        { id: 'Opportunity', name: 'Opportunity' },
        { id: 'Threat', name: 'Threat' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('stagE_DESCRIPTION', 'Stage Description', 'string', [
        { id: 'AUDITEE_ACCEPTANCE AND CAP SUBMISSION', name: 'AUDITEE_ACCEPTANCE AND CAP SUBMISSION' },
        { id: 'CAP REVIEW', name: 'CAP REVIEW' },
        { id: 'IMPLEMENT CAP', name: 'IMPLEMENT CAP' },
        { id: 'VERIFY CAP IMPLEMENTATION', name: 'VERIFY CAP IMPLEMENTATION' }
      ]));
    } else if (tableName === 'PROJECT_FINDINGS_BY_AGE') {
      this.filterPref.push(new FilterPreferenceModel('findinG_TITLE', 'Finding Title', 'string'));
      this.filterPref.push(new FilterPreferenceModel('findinG_TYPE', 'Finding Type', 'string', [
        { id: 'Strength', name: 'Strength' },
        { id: 'Weakness', name: 'Weakness' },
        { id: 'Opportunity', name: 'Opportunity' },
        { id: 'Threat', name: 'Threat' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('stagE_DESCRIPTION', 'Stage Description', 'string', [
        { id: 'AUDITEE_ACCEPTANCE AND CAP SUBMISSION', name: 'AUDITEE_ACCEPTANCE AND CAP SUBMISSION' },
        { id: 'CAP REVIEW', name: 'CAP REVIEW' },
        { id: 'IMPLEMENT CAP', name: 'IMPLEMENT CAP' },
        { id: 'VERIFY CAP IMPLEMENTATION', name: 'VERIFY CAP IMPLEMENTATION' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('agE_OF_FINDING_IN_DAYS', 'Age of Finding', 'string', [
        { id: '< 7 days', name: '< 7 days' },
        { id: '> 7 days', name: '> 7 days' },
        { id: '> 14 days', name: '> 14 days' },
        { id: '> 21 days', name: '> 21 days' },
        { id: '> 30 days', name: '> 30 days' }
      ]));
    } else if (tableName === 'CUST_REQ_REF') {
      this.filterPref.push(new FilterPreferenceModel('requiremenT_TITLE', 'Requirement Title', 'string'));
      this.filterPref.push(new FilterPreferenceModel('requirement_Applicability', 'Applicability', 'string', [
        { id: 'Account Level', name: 'Account Level' },
        { id: 'Service Level', name: 'Service Level' },
        { id: 'Process Model', name: 'Process Model' },
        { id: 'Process Area', name: 'Process Area' },
        { id: 'Process', name: 'Process' },
        { id: 'Country Level', name: 'Country Level' },
        { id: 'State Level', name: 'State Level' },
        { id: 'Region Level', name: 'Region Level' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('requirement_Category', 'Category', 'string', [
        { id: 'SoW', name: 'SoW' },
        { id: 'MSA', name: 'MSA' },
        { id: 'Security-Exhibit', name: 'Security-Exhibit' },
        { id: 'Legal', name: 'Legal' },
        { id: 'Statutory', name: 'Statutory' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('status', 'Status', 'string', [
        { id: 'Not Planned', name: 'Not Planned' },
        { id: 'Planned', name: 'Planned' },
        { id: 'Implemented', name: 'Implemented' },
        { id: 'Not Implemented', name: 'Not Implemented' },
        { id: 'Partially Implemented', name: 'Partially Implemented' },
        { id: 'In-Progress', name: 'In-Progress' },
        { id: 'Cancelled', name: 'Cancelled' },
        { id: 'Deferred', name: 'Deferred' },
        { id: 'On-hold', name: 'On-hold' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('owner', 'Owner', 'string', [
        { id: 'Customer Success Manager', name: 'Customer Success Manager' },
        { id: 'Project Manager', name: 'Project Manager' },
        { id: 'Team Member', name: 'Team Member' },
        { id: 'BU-Head IMS', name: 'BU-Head IMS' },
        { id: 'Customer', name: 'Customer' },
        { id: 'PMO', name: 'PMO' },
        { id: 'Quality', name: 'Quality' },
        { id: 'Finance', name: 'Finance' },
        { id: 'Fuctional Manager', name: 'Fuctional Manager' },
        { id: 'HR', name: 'HR' },
        { id: 'Account Manager', name: 'Account Manager' },
        { id: 'Marketing', name: 'Marketing' },
        { id: 'GSLab', name: 'GSLab' }
      ]));
    } else if (tableName === 'IDEA') {
      this.filterPref.push(new FilterPreferenceModel('title', 'Title', 'string'));
      this.filterPref.push(new FilterPreferenceModel('status', 'Status', 'string', [
        { id: 'Draft', name: 'Draft' },
        { id: 'Submitted', name: 'Submitted' },
        { id: 'Implemented', name: 'Implemented' },
        { id: 'Approved', name: 'Approved' },
        { id: 'Rejected', name: 'Rejected' },
        { id: 'On-Hold', name: 'On-Hold' },
        { id: 'Planned', name: 'Planned' },
        { id: 'Completed', name: 'Completed' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('type', 'Type', 'string', [
        { id: 'Idea', name: 'Idea' },
        { id: 'Continuous Improvement', name: 'Continuous Improvement' },
        { id: 'Release', name: 'Release' },
        { id: 'Service', name: 'Service' },
        { id: 'Service Improvement', name: 'Service Improvement' },
        { id: 'Innovation', name: 'Innovation' },
        { id: 'Automation', name: 'Automation' },
        { id: 'Process Improvement', name: 'Process Improvement' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('benefiT_TYPE', 'Benefit Type', 'string', [
        { id: 'Quantitative', name: 'Quantitative' },
        { id: 'Qualitative', name: 'Qualitative' }
      ]));
    } else if (tableName === 'PROJECT_BEST_PRACTICES') {
      this.filterPref.push(new FilterPreferenceModel('description', 'Description', 'string'));
      this.filterPref.push(new FilterPreferenceModel('servicE_AREA', 'Service Area', 'string'));
      this.filterPref.push(new FilterPreferenceModel('procesS_AREA', 'Process Area', 'string'));
      this.filterPref.push(new FilterPreferenceModel('process', 'Process', 'string'));
      this.filterPref.push(new FilterPreferenceModel('reporteD_BY', 'Reported By', 'string'));
      this.filterPref.push(new FilterPreferenceModel('revieweD_BY', 'Reviewed By', 'string'));
      this.filterPref.push(new FilterPreferenceModel('approveD_BY', 'Approved By', 'string'));
    } else if (tableName === 'FMEA_PROJECT') {
      this.filterPref.push(new FilterPreferenceModel('failurE_MODE', 'Failure Mode', 'string'));
      this.filterPref.push(new FilterPreferenceModel('isapplicable', 'Applicable', 'string', [
        { id: 'Applicable', name: 'Applicable' },
        { id: 'Not Applicable', name: 'Not Applicable' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('isapproved', 'Approved', 'string', [
        { id: 'Approved', name: 'Approved' },
        { id: 'Rejected', name: 'Rejected' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('rF_SEVERITY_ID', 'Severity', 'string', [
        { id: 'None', name: 'None' },
        { id: 'Very Minor', name: 'Very Minor' },
        { id: 'Minor', name: 'Minor' },
        { id: 'Very Low', name: 'Very Low' },
        { id: 'Low', name: 'Low' },
        { id: 'Moderate', name: 'Moderate' },
        { id: 'High', name: 'High' },
        { id: 'Very High', name: 'Very High' },
        { id: 'Severe', name: 'Severe' },
        { id: 'Critical', name: 'Critical' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('rF_OCCURRENCE_ID', 'Occurrence', 'string', [
        { id: '1-Remote - Failure is unlikely', name: '1-Remote - Failure is unlikely' },
        { id: '2-Remote - Failure is unlikely', name: '2-Remote - Failure is unlikely' },
        { id: '3-Low- Relatively few failures', name: '3-Low- Relatively few failures' },
        { id: '4-Moderate - Occasional failures', name: '4-Moderate - Occasional failures' },
        { id: '5-Moderate - Occasional failures', name: '5-Moderate - Occasional failures' },
        { id: '6-Moderate - Occasional failures', name: '6-Moderate - Occasional failures' },
        { id: '7-High :Repeated failures', name: '7-High :Repeated failures' },
        { id: '8-High :Repeated failures', name: '8-High :Repeated failures' },
        { id: '9-Very High : Failure is almost inevitable', name: '9-Very High : Failure is almost inevitable' },
        { id: '10-Very High : Failure is almost inevitable', name: '10-Very High : Failure is almost inevitable' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('rF_DETECTION_ID', 'Detection', 'string', [
        { id: '1-Before failure occurs', name: '1-Before failure occurs' },
        { id: '2-Before failure occurs', name: '2-Before failure occurs' },
        { id: '3-Before failure occurs', name: '3-Before failure occurs' },
        { id: '4-During a failure', name: '4-During a failure' },
        { id: '5-During a failure', name: '5-During a failure' },
        { id: '6-During a failure', name: '6-During a failure' },
        { id: '7-After a failure', name: '7-After a failure' },
        { id: '8-After a failure', name: '8-After a failure' },
        { id: '9-After a failure', name: '9-After a failure' },
        { id: '10-Cannot detect', name: '10-Cannot detect' }
      ]));
    } else if (tableName === 'PM_CHECKLIST') {
      this.filterPref.push(new FilterPreferenceModel('checklistName', 'Checklist Name', 'string'));
      this.filterPref.push(new FilterPreferenceModel('maturitY_LEVEL', 'Maturity Level', 'string', [
        { id: 'Yes', name: 'Yes' },
        { id: 'No', name: 'No' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('iS_WEIGHTAGE_APPLICABLE', 'Weightage Applicable', 'string', [
        { id: 'Yes', name: 'Yes' },
        { id: 'No', name: 'No' }
      ]));
    } else if (tableName === 'SETUP_CHECKLIST') {
      this.filterPref.push(new FilterPreferenceModel('title', 'Title', 'string'));
      this.filterPref.push(new FilterPreferenceModel('description', 'Description', 'string'));
      this.filterPref.push(new FilterPreferenceModel('version', 'Version', 'string'));
      this.filterPref.push(new FilterPreferenceModel('maturitY_LEVEL', 'Maturity Level', 'string', [
        { id: true, name: 'Yes' },
        { id: false, name: 'No' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('iS_WEIGHTAGE_APPLICABLE', 'Weightage Applicable', 'string', [
        { id: true, name: 'Yes' },
        { id: false, name: 'No' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('correctivE_ACTION_TRACKING', 'Corrective Action Tracking', 'string', [
        { id: true, name: 'Yes' },
        { id: false, name: 'No' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('iS_APPROVED', 'Approved', 'string', [
        { id: true, name: 'Yes' },
        { id: false, name: 'No' }
      ]));
    } else if (tableName === 'KPI') {
      this.filterPref.push(new FilterPreferenceModel('kpI_NAME', 'KPI Name', 'string'));
      this.filterPref.push(new FilterPreferenceModel('servicE_AREA_ID', 'Service Area', 'string', [
        { id: 'Backlog', name: 'Backlog' },
        { id: 'Non Backlog', name: 'Non Backlog' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('servicE_LEVEL_ID', 'Service Level', 'string', [
        { id: 'Key Measurement', name: 'Key Measurement' },
        { id: 'Critical Service Level', name: 'Critical Service Level' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('slA_CATEGORY', 'SLA Category', 'string', [
        { id: 'Backlog Devlopment', name: 'Backlog Devlopment' },
        { id: 'Backlog Execution', name: 'Backlog Execution' },
        { id: 'Testing', name: 'Testing' },
        { id: 'Delivery', name: 'Delivery' },
        { id: 'Use', name: 'Use' },
        { id: 'Availability And Usability', name: 'Availability And Usability' },
        { id: 'KTLO', name: 'KTLO' },
        { id: 'Operational Effectiveness', name: 'Operational Effectiveness' },
        { id: 'Problem', name: 'Problem' },
        { id: 'User Experience', name: 'User Experience' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('slA_STATUS', 'SLA Status', 'string', [
        { id: 'Met', name: 'Met' },
        { id: 'Not Met', name: 'Not Met' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('exclusioN_SLA_STATUS', 'Exclusion SLA Status', 'string', [
        { id: 'Met', name: 'Met' },
        { id: 'Not Met', name: 'Not Met' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('frequency', 'Frequency', 'string', [
        { id: 'Monthly', name: 'Monthly' },
        { id: 'Quarterly', name: 'Quarterly' },
        { id: 'Release', name: 'Release' }
      ]));
    } else if (tableName === 'KPI_DETAILS') {
      this.filterPref.push(new FilterPreferenceModel('servicE_AREA_ID', 'Service Tower', 'string', [
        { id: 'Backlog', name: 'Backlog' },
        { id: 'Non Backlog', name: 'Non Backlog' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('servicE_LEVEL_ID', 'Service Level Measurement Type', 'string', [
        { id: 'Key Measurement', name: 'Key Measurement' },
        { id: 'Critical Service Level', name: 'Critical Service Level' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('frequency', 'Frequency', 'string', [
        { id: 'Monthly', name: 'Monthly' },
        { id: 'Quarterly', name: 'Quarterly' },
        { id: 'Release', name: 'Release' }
      ]));
    } else if (tableName === 'KPI_PRODUCT') {
      this.filterPref.push(new FilterPreferenceModel('kpI_NAME', 'KPI Name', 'string'));
      this.filterPref.push(new FilterPreferenceModel('modE_TITLE', 'Mode Title', 'string', [
        { id: 'Product Devops', name: 'Product Devops' },
        { id: 'Module Devops', name: 'Module Devops' },
        { id: 'Classic Run and Maintain', name: 'Classic Run and Maintain' },
        { id: 'Run/End of Life cycle support', name: 'Run/End of Life cycle support' },
        { id: 'Retire', name: 'Retire' },
        { id: 'Create & Manage Delivery Platform', name: 'Create & Manage Delivery Platform' },
        { id: 'Niche Skill Support', name: 'Niche Skill Support' },
        { id: 'Default', name: 'Default' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('servicE_AREA_TYPE', 'Service Area Type', 'string', [
        { id: 'Backlog', name: 'Backlog' },
        { id: 'Non Backlog', name: 'Non Backlog' }
      ]));
    } else if (tableName === 'KPI_MASTER') {
      this.filterPref.push(new FilterPreferenceModel('kpI_NAME', 'KPI Name', 'string'));
      this.filterPref.push(new FilterPreferenceModel('servicE_AREA', 'Service Area', 'string', [
        { id: 'Backlog', name: 'Backlog' },
        { id: 'Non-Backlog', name: 'Non-Backlog' },
        { id: 'Both', name: 'Both' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('servicE_LEVEL', 'Service Level', 'string', [
        { id: 'Key Measurement', name: 'Key Measurement' },
        { id: 'Critical Service Level', name: 'Critical Service Level' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('frequency', 'Frequency', 'string', [
        { id: 'Monthly', name: 'Monthly' },
        { id: 'Quarterly', name: 'Quarterly' },
        { id: 'Release', name: 'Release' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('slA_CATEGORY', 'SLA Category', 'string', [
        { id: 'Backlog Devlopment', name: 'Backlog Devlopment' },
        { id: 'Backlog Execution', name: 'Backlog Execution' },
        { id: 'Testing', name: 'Testing' },
        { id: 'Delivery', name: 'Delivery' },
        { id: 'Use', name: 'Use' },
        { id: 'Availability And Usability', name: 'Availability And Usability' },
        { id: 'KTLO', name: 'KTLO' },
        { id: 'Operational Effectiveness', name: 'Operational Effectiveness' },
        { id: 'Problem', name: 'Problem' },
        { id: 'User Experience', name: 'User Experience' }
      ]));
    } else if (tableName === 'RISK_REPOSITORY') {
      // Dialog mode filters for Risk Repository
      this.filterPref.push(new FilterPreferenceModel('servicE_TOWER_TITLE', 'Service Tower', 'string'));
      this.filterPref.push(new FilterPreferenceModel('description', 'Risk Description', 'string'));
      this.filterPref.push(new FilterPreferenceModel('impact', 'Risk Impact', 'string'));
      this.filterPref.push(new FilterPreferenceModel('probabilitY_SCALE', 'Likelihood', 'string', [
        { id: 'Rare', name: 'Rare' },
        { id: 'Remote', name: 'Remote' },
        { id: 'Moderate', name: 'Moderate' },
        { id: 'Likely', name: 'Likely' },
        { id: 'Frequent', name: 'Frequent' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('impacT_SCALE', 'Consequences', 'string', [
        { id: 'Insignificant', name: 'Insignificant' },
        { id: 'Minor', name: 'Minor' },
        { id: 'Significant', name: 'Significant' },
        { id: 'Major', name: 'Major' },
        { id: 'Critical', name: 'Critical' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('risK_TREATMENT_STRATEGY', 'Risk Treatment Strategy', 'string', [
        { id: 'Accept', name: 'Accept' },
        { id: 'Avoid', name: 'Avoid' },
        { id: 'Reduce', name: 'Reduce' },
        { id: 'Transfer', name: 'Transfer' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('threats', 'Threats', 'string'));
      this.filterPref.push(new FilterPreferenceModel('vulnerabilities', 'Vulnerabilities', 'string'));
    } else if (tableName === 'RISK_REPOSITORY_MASTER') {
      this.filterPref.push(new FilterPreferenceModel('risK_STATEMENT', 'Risk Statement', 'string'));
      this.filterPref.push(new FilterPreferenceModel('likelihood', 'Likelihood', 'string', [
        { id: 'Rare', name: 'Rare' },
        { id: 'Remote', name: 'Remote' },
        { id: 'Moderate', name: 'Moderate' },
        { id: 'Likely', name: 'Likely' },
        { id: 'Frequent', name: 'Frequent' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('consequences', 'Consequences', 'string', [
        { id: 'Insignificant', name: 'Insignificant' },
        { id: 'Minor', name: 'Minor' },
        { id: 'Significant', name: 'Significant' },
        { id: 'Major', name: 'Major' },
        { id: 'Critical', name: 'Critical' }
      ]));
      this.filterPref.push(new FilterPreferenceModel('risK_TREATMENT_STRATEGY', 'Risk Treatment Strategy', 'string', [
        { id: 'Accept', name: 'Accept' },
        { id: 'Avoid', name: 'Avoid' },
        { id: 'Reduce', name: 'Reduce' },
        { id: 'Transfer', name: 'Transfer' }
      ]));
    }
  }

  public tbnAddFilter_OnClick() {
    const newFilterValue = new FilterPreferenceModel('', '', 'string', []);
    Object.assign(newFilterValue, this.selectedFilterPref);

    if (!newFilterValue.displaY_NAME || newFilterValue.displaY_NAME === '') {
      this._util.showWarningPopup('Please choose the filter by Value', 'Validation Error');
      return;
    }

    if (!newFilterValue.searchString || newFilterValue.searchString === '') {
      this._util.showWarningPopup('Please enter a search value', 'Validation Error');
      return;
    }

    this.OnAdd.emit(true);

    if (newFilterValue.values.length > 0) {
      // This is a dropdown field (has values)
      const vals = newFilterValue.values.filter((t: any) => t.id === newFilterValue.searchString);
      if (vals.length > 0) {
        newFilterValue.searchStringValue = vals[0].name;
      } else {
        newFilterValue.searchStringValue = newFilterValue.searchString;
      }
    } else {
      // This is a text field (no values)
      newFilterValue.searchStringValue = newFilterValue.searchString;
    }

    this.filterCriterias.push(newFilterValue);
    this.ApplyCriteriaRange(this.filterCriterias);
    this.selectedFilterPref = new FilterPreferenceModel('', '', 'string', []);
    this.emitChanges();
  }

  public btnClearFilter_OnClick() {
    this.selectedFilterPref = new FilterPreferenceModel('', '', 'string', []);
    this.filterCriterias = [];
    this.filteredData = this.originalData;
    this.emitChanges();
    this.LoadFilterPreference(this.tableName);
  }

  public btnRemoveFilter_OnClick(filterCriteria: FilterPreferenceModel) {
    this.filterCriterias.splice(this.filterCriterias.indexOf(filterCriteria), 1);
    this.filteredData = this.originalData;
    this.ApplyCriteriaRange(this.filterCriterias);
    this.emitChanges();
  }

  ApplyCriteriaRange(criterias: FilterPreferenceModel[]) {
    this.filteredData = this.originalData;

    for (const criteria of criterias) {
      try {
        if (criteria.datA_TYPE === 'string' && criteria.values.length === 0) {
          // Regular string search (text fields)
          this.filteredData = this.filteredData.filter((t: any) => {
            const value = t[criteria.fielD_NAME];
            if (value === null || value === undefined) return false;
            return value.toString().toLowerCase().includes(criteria.searchStringValue.toLowerCase());
          });
        } else if (criteria.datA_TYPE === 'string' && criteria.values.length > 0) {
          // String dropdown (like status)
          this.filteredData = this.filteredData.filter((t: any) => {
            return t[criteria.fielD_NAME] === criteria.searchString;
          });
        } else if (criteria.datA_TYPE === 'number') {
          // Number dropdown
          this.filteredData = this.filteredData.filter((t: any) => {
            return t[criteria.fielD_NAME] == criteria.searchString;
          });
        }
      } catch (e) {
        console.error('Filter error:', e);
      }
    }
  }
}
