# GRC Workflow (Setup → Plan → Execute) - High-Level UI Recreation Prompt

## Overview
Create a **3-phase Governance, Risk, and Compliance (GRC) workflow** for managing regulatory compliance, risk assessments, and governance controls. The workflow consists of **Setup** (framework configuration), **Plan** (compliance scheduling), and **Execute** (control evaluation and attestation).

---

## Design System

**Framework**: Angular 19+ with Material Design  
**Theme**: Professional with purple/indigo accents (#7b1fa2, #5e35b1)  
**Layout**: Multi-step form wizard with progress tracking  
**Typography**: Roboto, 12-16px

---

## Phase 1: GRC Setup

### Purpose
Configure GRC frameworks, compliance standards, control libraries, and governance policies.

### Layout Structure

**Page Header**:
- Title: "GRC Framework Setup" (24px, font-weight 700, #212121)
- Subtitle: "Configure governance, risk, and compliance parameters" (14px, #757575)
- Icon: `security` (32px, #7b1fa2)

**5-Tab Interface**:
1. **Compliance Frameworks** - ISO 27001, SOC 2, GDPR, HIPAA, etc.
2. **Control Library** - Security controls and requirements
3. **Risk Registry** - Risk catalog and assessment criteria
4. **Policy Management** - Governance policies and procedures
5. **Roles & Responsibilities** - GRC team and stakeholder assignments

### Tab 1: Compliance Frameworks

**Framework Catalog** (Card Grid - 3 columns):

**Framework Card**:
- **Header**: Framework logo/icon + name
  - ISO 27001 (blue icon)
  - SOC 2 Type II (green icon)
  - GDPR (orange icon)
  - HIPAA (red icon)
  - PCI DSS (purple icon)
- **Status Badge**: Active / Inactive / In Progress
- **Metadata**:
  - Version: (e.g., "ISO 27001:2022")
  - Domains: 14 (e.g., for ISO 27001)
  - Controls: 93
  - Compliance %: Progress bar (e.g., 75%)
- **Actions**:
  - Configure (icon button)
  - Enable/Disable toggle
  - View Details

**Configure Framework Dialog** (800px width):
- **Applicability**: Which projects/services apply
- **Scope Statement**: Textarea describing compliance scope
- **Domain Selection**: Multi-select checklist
  - Select all / Deselect all
  - Each domain with control count
- **Assessment Frequency**: Dropdown (Quarterly, Semi-annual, Annual)
- **Assessor Assignment**: Employee search
- **Target Compliance Date**: Datepicker
- **Actions**: Save Configuration / Cancel

### Tab 2: Control Library

**Control Table** (mat-table with grouping):
- **Grouping**: By framework and domain
- **Columns**: 
  - Control ID (e.g., "ISO-A.5.1")
  - Control Name
  - Type (Preventive, Detective, Corrective)
  - Status (Implemented, Partial, Not Implemented)
  - Owner
  - Last Assessment
  - Actions

**Control Types Color-Coding**:
- **Preventive**: Blue (#2196f3)
- **Detective**: Orange (#ff9800)
- **Corrective**: Green (#4caf50)
- **Compensating**: Purple (#9c27b0)

**Add/Edit Control Form** (Side Panel - 40% width):
- **Framework** (dropdown)
- **Domain/Category** (dropdown, filtered by framework)
- **Control ID** (text, auto-generated or manual)
- **Control Name** (text, required, 200 char)
- **Description** (rich text editor, 2000 char)
- **Control Type** (radio: Preventive/Detective/Corrective)
- **Implementation Status** (dropdown):
  - Not Started
  - In Progress
  - Implemented
  - Under Review
  - Approved
- **Evidence Requirements**: Multi-select checkboxes
  - Documentation
  - Screenshots
  - Logs
  - Reports
  - Attestations
- **Owner** (employee search, required)
- **Frequency** (dropdown): Continuous, Weekly, Monthly, Quarterly, Annual
- **Related Risks** (multi-select from risk registry)

### Tab 3: Risk Registry

**Risk Catalog Table**:
- **Columns**:
  - Risk ID (auto-generated: GRC-R-001)
  - Risk Title
  - Category (Operational, Financial, Strategic, Compliance, Technology)
  - Inherent Risk Level (Red/Orange/Yellow/Green)
  - Residual Risk Level (after controls)
  - Control Effectiveness
  - Owner
  - Actions

**Risk Categories with Icons**:
- Operational: `work` (blue)
- Financial: `attach_money` (green)
- Strategic: `flag` (purple)
- Compliance: `gavel` (orange)
- Technology: `computer` (teal)

**Add Risk Form** (Dialog - 700px):
- **Risk Title** (text, required)
- **Category** (dropdown)
- **Description** (textarea, 1000 char)
- **Inherent Impact** (dropdown: 1-5 scale)
- **Inherent Likelihood** (dropdown: 1-5 scale)
- **Inherent Risk Score**: Auto-calculated (Impact × Likelihood)
- **Risk Level**: Auto-determined
  - 1-5: Low (Green)
  - 6-12: Medium (Yellow)
  - 13-20: High (Orange)
  - 21-25: Critical (Red)
- **Mitigating Controls**: Multi-select from control library
- **Residual Impact** (dropdown: 1-5, after controls)
- **Residual Likelihood** (dropdown: 1-5, after controls)
- **Risk Owner** (employee search)
- **Review Frequency** (dropdown)

### Tab 4: Policy Management

**Policy Library** (List View with Cards):

**Each Policy Card**:
- **Policy Name** (16px, bold)
- **Policy Number** (e.g., "GRC-POL-001")
- **Category** (badge: Information Security, Data Privacy, Access Control, etc.)
- **Version** (e.g., "v2.1")
- **Effective Date** / **Review Date**
- **Status**:
  - Draft (gray)
  - Under Review (orange)
  - Approved (green)
  - Archived (red)
- **Owner** (employee chip)
- **Actions**: View, Edit, Download PDF, Send for Approval

**Add Policy Form**:
- **Policy Name** (text, required)
- **Policy Number** (auto-generated or manual)
- **Category** (dropdown)
- **Related Framework** (multi-select: ISO 27001, SOC 2, etc.)
- **Policy Content** (rich text editor):
  - Support: Bold, Italic, Lists, Tables, Links
  - Template insertion
- **Attachments** (file upload)
- **Effective Date** (datepicker)
- **Review Frequency** (dropdown: Annual, Bi-annual, Custom)
- **Next Review Date** (datepicker, auto-calculated)
- **Owner** (employee search)
- **Approvers** (multi-select employee search)
- **Distribution List** (multi-select employee search)

**Policy Approval Workflow**:
1. Draft → Submit for Review
2. Under Review → Approve/Reject (by approvers)
3. Approved → Publish (distribute to stakeholders)
4. Published → Review (on review date)

### Tab 5: Roles & Responsibilities

**GRC Team Matrix** (mat-table):
- **Columns**:
  - Employee Name
  - Role (GRC Manager, Compliance Officer, Risk Manager, Auditor, Control Owner)
  - Frameworks Assigned
  - Controls Owned (count)
  - Active Projects
  - Actions

**Role Badges**:
- **GRC Manager**: Purple gradient
- **Compliance Officer**: Blue
- **Risk Manager**: Orange
- **Auditor**: Teal
- **Control Owner**: Green

**Assign Role Dialog**:
- **Employee** (search with autocomplete)
- **Role** (dropdown)
- **Frameworks** (multi-select)
- **Controls** (multi-select, filtered by framework)
- **Permissions**:
  - View only
  - Edit controls
  - Submit assessments
  - Approve assessments
  - Admin access
- **Effective Date** (datepicker)
- **Expiration Date** (datepicker, optional)

---

## Phase 2: GRC Plan

### Purpose
Schedule compliance assessments, assign control evaluators, and configure assessment parameters.

### Layout Structure

**Page Header**:
- Title: "Plan GRC Assessment" (24px)
- Visual Stepper: Setup > **Plan** > Execute > Report
- Progress: 2/4 steps (50%)

**Form Wizard** (7 steps with left navigation):

### Step 1: Assessment Type Selection

**Card Selection** (3 options, radio selection):

**Option 1: Framework Compliance Assessment**
- Icon: `verified_user` (48px, blue)
- Description: "Full compliance assessment against selected framework"
- Scope: All domains and controls
- Duration: 4-8 weeks

**Option 2: Control Effectiveness Assessment**
- Icon: `fact_check` (48px, green)
- Description: "Evaluate effectiveness of specific controls"
- Scope: Selected controls only
- Duration: 1-2 weeks

**Option 3: Risk Assessment**
- Icon: `warning` (48px, orange)
- Description: "Assess risks and control gaps"
- Scope: Risk registry review
- Duration: 2-4 weeks

### Step 2: Scope Definition

**Framework Selection** (if Framework Assessment):
- **Primary Framework** (radio):
  - ISO 27001
  - SOC 2 Type II
  - GDPR
  - HIPAA
  - Custom
- **Domains/Clauses** (multi-select tree):
  - Select all / Deselect all
  - Expandable tree showing domains > controls

**Control Selection** (if Control Assessment):
- **Filter by**:
  - Framework (dropdown)
  - Domain (dropdown, filtered)
  - Control Type (checkboxes: Preventive, Detective, Corrective)
  - Status (checkboxes: Implemented, Partial, Not Implemented)
- **Selected Controls**: Sortable table
  - Drag-drop to reorder
  - Remove button per row

### Step 3: Project & Service Scope

- **Projects** (multi-select with search)
  - All projects (checkbox)
  - Filter by portfolio
- **Services/Applications** (multi-select)
  - Auto-populate from selected projects
- **Locations/Facilities** (multi-select)
- **Departments** (multi-select)

### Step 4: Timeline & Milestones

**Assessment Period**:
- **Start Date** (datepicker, required)
- **End Date** (datepicker, required)
- **Duration**: Auto-calculated (e.g., "6 weeks")

**Milestone Timeline** (Gantt-style visual):
**Implementation Details:**

This section implements the described functionality using generic. The implementation spans approximately 5 lines and follows the component structure outlined above.

**Key Milestones** (editable dates):
- Kickoff Meeting
- Evidence Submission Deadline
- Testing Completion
- Draft Report
- Final Report
- Certification (if applicable)

### Step 5: Team Assignment

**Assessment Team**:
- **Lead Assessor** (employee search, required)
  - Must have GRC Manager or Compliance Officer role
- **Co-Assessors** (multi-select)
  - Filter by GRC roles
- **Subject Matter Experts** (multi-select)
  - Technical experts for specific domains
- **Control Owners** (auto-populated from control library)
  - Can override assignments
  - Assign multiple controls to same owner

**Stakeholder Notifications**:
- **Notify on Start** (checkboxes):
  - Control owners
  - Project managers
  - Executive sponsors
- **Status Update Frequency** (dropdown):
  - Weekly
  - Bi-weekly
  - Monthly
  - At milestones only

### Step 6: Evidence & Documentation Requirements

**Evidence Collection Settings**:
- **Evidence Repository**: Dropdown (SharePoint, Google Drive, Local Upload)
- **Folder Structure**: Auto-create folders by domain/control
- **Naming Convention**: Template (e.g., "CTRL-ID_Date_Description.pdf")

**Required Evidence Types** (per control type):
- **Preventive Controls**:
  - Configuration screenshots
  - Policy documents
  - Training records
- **Detective Controls**:
  - Log files
  - Monitoring reports
  - Alerts/notifications
- **Corrective Controls**:
  - Incident reports
  - Remediation plans
  - Closure evidence

**Attestation Requirements**:
- **Control Owner Attestation**: Required (checkbox)
- **Management Attestation**: Required for critical controls
- **Third-Party Verification**: Optional (checkbox)

### Step 7: Review & Submit

**Summary View** (Read-only cards):
- **Assessment Type**: Framework Compliance - ISO 27001
- **Scope**: 14 domains, 93 controls
- **Projects**: 5 projects selected
- **Timeline**: Apr 1 - Jun 30, 2026 (12 weeks)
- **Team**: Lead Assessor + 3 Co-Assessors
- **Evidence**: SharePoint repository configured

**Validation Checklist**:
- ✓ All required fields completed
- ✓ At least one assessor assigned
- ✓ Assessment period is valid
- ✓ All controls have owners
- ⚠ Optional: Kickoff meeting scheduled

**Action Buttons**:
- **Back** (navigate to previous step)
- **Save Draft** (save for later)
- **Schedule Assessment** (submit and send notifications)

**Post-Submission**:
- Success notification
- Assessment ID generated (e.g., "GRC-ASS-2026-001")
- Kickoff email sent to team
- Calendar invites created
- Evidence folders created

---

## Phase 3: GRC Execute

### Purpose
Conduct GRC assessment by evaluating controls, collecting evidence, and documenting findings.

### Layout Structure

**Page Header**:
- **Assessment ID**: GRC-ASS-2026-001 (14px, gray)
- **Title**: ISO 27001 Compliance Assessment (20px, bold)
- **Framework Badge**: ISO 27001:2022 (blue badge)
- **Status**: In Progress (orange chip)
- **Progress**: 45 / 93 controls completed (48%)
- **Timeline**: Week 4 of 12 (progress bar)

**4-Tab Interface**:

### Tab 1: Control Evaluation

**Domain Accordion** (Expansion panels by domain):

**Domain Panel Header**:
- **Background**: Purple gradient
- **Icon**: Domain-specific icon
- **Title**: "A.5 - Information Security Policies" (16px, white, bold)
- **Progress**: 8/12 controls completed (67%)
- **Status Summary**: 6 Pass, 2 Fail, 4 Not Tested

**Control Evaluation Table** (within panel):

| Control ID | Control Name | Type | Status | Evidence | Finding | Actions |
|------------|-------------|------|--------|----------|---------|---------|
| A.5.1 | Policies for info security | Prev | ✓ Pass | 3 files | None | View |
| A.5.2 | Review of policies | Det | ✗ Fail | 1 file | Yes | View |
| A.5.3 | Topic-specific policies | Prev | ⊙ Testing | 0 files | - | Evaluate |

**Evaluate Control Dialog** (700px width):

**Control Details**:
- Control ID & Name (header)
- Description (read-only, expandable)
- Control Type badge
- Owner (employee chip)

**Evaluation Section**:
- **Implementation Status** (radio group):
  - ✓ Implemented (green)
  - ⊙ Partially Implemented (orange)
  - ✗ Not Implemented (red)
  - ⊘ Not Applicable (gray)

- **Effectiveness Assessment** (rating):
  - 5-star rating
  - 1-2 stars: Ineffective (red)
  - 3 stars: Partially Effective (orange)
  - 4-5 stars: Effective (green)

- **Testing Method** (checkboxes, multi-select):
  - Document Review
  - Interview
  - Observation
  - System Testing
  - Sample Testing

- **Evidence Collected**:
  - File upload area (drag-drop)
  - Supported: PDF, DOC, XLS, PNG, JPG, ZIP
  - Max 50MB total per control
  - Evidence list with delete option

**Findings Section** (if deficiency identified):
- **Finding Type** (radio):
  - Observation (info only)
  - Minor Finding (low risk)
  - Major Finding (high risk)
  - Critical Finding (immediate action)
- **Description** (textarea, required if finding exists, 1500 char)
- **Impact** (dropdown): 
  - Confidentiality breach
  - Integrity compromise  
  - Availability impact
  - Compliance violation
- **Root Cause Analysis** (textarea, 1000 char)
- **Recommendation** (textarea, required, 1500 char)
- **Remediation Plan** (textarea, 1000 char)
- **Responsible Party** (employee search)
- **Target Completion Date** (datepicker, required)
- **Priority** (dropdown): Critical, High, Medium, Low

**Attestation**:
- **Control Owner Attestation**:
  - Checkbox: "I attest that this control is implemented as described"
  - Digital signature field
  - Date (auto-filled)
  - Comments (optional, textarea)

**Actions**:
- **Save & Continue** (save current control, move to next)
- **Save & Close** (save and return to table)
- **Cancel** (discard changes)

### Tab 2: Findings Management

**Findings Table** (mat-table):
- **Columns**:
  - Finding ID (auto: GRC-F-001)
  - Control ID
  - Type (color-coded badges)
  - Priority (color-coded)
  - Status (Open, In Progress, Resolved, Closed)
  - Owner
  - Target Date
  - Days Overdue (if applicable)
  - Actions

**Finding Type Colors**:
- **Critical**: Red (#d32f2f) badge
- **Major**: Orange (#f57c00)
- **Minor**: Amber (#ffc107)
- **Observation**: Blue (#2196f3)

**Filters**:
- By Type (multi-select)
- By Priority (multi-select)
- By Status (multi-select)
- By Owner (autocomplete)
- Overdue only (toggle)

**Finding Details Side Panel** (40% width):
- Full finding information (read-only)
- **Remediation Tracking**:
  - Progress updates (timeline)
  - Attachments (documents, screenshots)
  - Comments thread
  - Status history
- **Actions**:
  - Update Status
  - Add Comment
  - Upload Evidence
  - Mark as Resolved
  - Reopen (if needed)

### Tab 3: Evidence Repository

**Folder Tree View** (left sidebar, 30%):
- By Framework
  - By Domain
    - By Control ID
      - Evidence files

**File List View** (main area, 70%):
- **Columns**:
  - File Name
  - Type (icon)
  - Size
  - Uploaded By
  - Upload Date
  - Related Control
  - Actions (Download, Preview, Delete)

**Bulk Operations**:
- Select multiple files
- Download as ZIP
- Move to folder
- Delete selected

**Upload Area**:
- Drag-drop zone
- Browse files button
- **Auto-tag** with control ID, domain, date
- Progress bars for uploads

### Tab 4: Assessment Report

**Report Preview**:
- **Executive Summary** (editable rich text):
  - Assessment objective
  - Scope
  - Key findings
  - Overall compliance status
  - Recommendations

**Compliance Dashboard**:
- **Overall Compliance %**: Large metric (e.g., 87%)
  - Color-coded: Green >90%, Orange 70-90%, Red <70%
- **Domain Compliance**: Horizontal bar chart
  - Each domain with % compliance
- **Control Status**: Donut chart
  - Implemented: X controls (green)
  - Partial: Y controls (orange)
  - Not Implemented: Z controls (red)

**Findings Summary**:
- **By Severity**: Bar chart (Critical, Major, Minor, Observation)
- **By Domain**: Stacked bar chart
- **Top 5 Risks**: List with risk scores

**Detailed Report Sections** (auto-generated):
1. Introduction
2. Methodology
3. Scope & Approach
4. Domain-by-Domain Assessment
5. Findings & Recommendations
6. Control Effectiveness Analysis
7. Remediation Plan
8. Conclusion
9. Appendices (evidence log, attestations)

**Report Actions**:
- **Generate PDF**: Full report with branding
- **Generate Excel**: Control matrix export
- **Schedule Review Meeting**: Calendar integration
- **Submit for Approval**: Workflow trigger
- **Publish Report**: Distribute to stakeholders

### Bottom Action Bar (Sticky)

**Left Side**:
- **Last saved**: 5 minutes ago (gray text)
- **Auto-save**: Enabled (green dot)

**Center**:
- **Progress**: 45 / 93 controls (48%)
- **Findings**: 12 open findings

**Right Side**:
- **Save Draft** (stroked button)
- **Submit Assessment** (raised, purple, icon: `send`)
  - Enabled only when all controls evaluated
  - Triggers approval workflow

---

## Approval Workflow (Post-Execution)

### Review Stage
**Assigned to**: Lead Assessor, GRC Manager

**Review Tasks**:
- Verify all controls evaluated
- Review findings for completeness
- Ensure evidence is sufficient
- Check attestations
- Approve/Reject/Request Changes

**Actions**:
- **Approve**: Move to Management Review
- **Reject**: Return to assessor with comments
- **Request Changes**: Specific control re-evaluation

### Management Review
**Assigned to**: Executive Sponsor, Compliance Committee

**Review Dashboard**:
- Executive summary
- Compliance metrics
- Critical findings
- Budget impact (if remediation needed)
- Timeline for remediation

**Actions**:
- **Certify Compliance**: Issue certificate (if passing)
- **Accept with Conditions**: Approve with remediation plan
- **Reject**: Major gaps identified

### Post-Approval
- **Notifications**: All stakeholders
- **Certificate Generation**: PDF certificate with seal
- **Remediation Tracking**: Auto-create tasks from findings
- **Archive**: Move to completed assessments

---

## Key Features

### Dashboard Integration
- Real-time compliance score
- Findings trend chart
- Upcoming assessments calendar
- Overdue findings alerts

### Automation
- Auto-assign controls based on ownership
- Auto-populate evidence from integrated systems
- Scheduled reminder emails
- Progress reports (weekly)

### Integrations
- **SIEM Systems**: Auto-import logs as evidence
- **Ticketing Systems**: Create remediation tickets
- **Document Management**: Link to policy repository
- **Identity Management**: Sync user access controls

### Reporting
- **Compliance Dashboard**: Live metrics
- **Trend Analysis**: Historical compliance over time
- **Gap Analysis**: Control coverage vs. requirements
- **Benchmark Reports**: Compare against industry standards

---

## API Integration

### Service Methods
**TypeScript Implementation:**

RxJS observables manage asynchronous data streams.

---

## Summary

GRC workflow provides **comprehensive governance, risk, and compliance management** through:
- **Setup**: Configure frameworks, controls, risks, and policies
- **Plan**: Schedule compliance assessments with scope definition
- **Execute**: Evaluate controls with evidence collection and finding management

Supports **multi-framework compliance** (ISO 27001, SOC 2, GDPR, HIPAA), **automated reporting**, and **remediation tracking** for enterprise compliance programs.

**Word Count**: ~2,400 words
