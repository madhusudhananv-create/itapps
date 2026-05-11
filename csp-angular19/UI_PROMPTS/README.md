# UI Recreation Prompts

This directory contains detailed, standalone prompts for recreating all modernized UI pages and workflows from the CSM Angular application. Each prompt file is comprehensive and self-contained, providing complete specifications for layout, design system, components, colors, fonts, spacing, and interactions.

---

## Purpose

These prompts are designed to be fed into any AI tool (ChatGPT, Claude, Copilot, etc.) to recreate identical pages without needing to reference the original codebase. 

### Detailed Page Prompts (5,000+ words each)
Each comprehensive prompt contains:

- **Complete layout specifications** with pixel-perfect dimensions
- **Color palette** with exact hex codes
- **Typography** with font families, sizes, and weights
- **Spacing system** with padding and margin values
- **Component specifications** with all props and states
- **Interaction details** including hover, focus, and active states
- **Responsive breakpoints** with mobile/tablet/desktop adjustments
- **Accessibility requirements** (ARIA labels, keyboard navigation, contrast ratios)
- **Implementation notes** for developers

### High-Level Workflow Prompts (1,500-2,500 words each)
Concise workflow-focused prompts containing:

- Multi-phase workflow descriptions (Setup → Plan → Execute)
- Key form sections and data structures
- Navigation flows and state management
- Integration points and API expectations
- Core features and business logic

---

## Prompt Files

### 1. [ACTION_ITEMS_PAGE_PROMPT.md](./ACTION_ITEMS_PAGE_PROMPT.md)
**Page**: Action Items Management Page  
**Design Style**: Material Design  
**Key Features**: 
- Data table with CRUD operations
- Advanced filtering and search
- Status and priority badges
- Responsive card view on mobile
- Export to Excel functionality

### 2. [SUCCESS_GOAL_KPI_PERFORMANCE_PROMPT.md](./SUCCESS_GOAL_KPI_PERFORMANCE_PROMPT.md)
**Page**: Customer Success Goal & KPI Performance  
**Design Style**: Apple-inspired (SF Pro Display, iOS colors)  
**Key Features**:
- Glassmorphic filter sidebar with backdrop blur
- iOS-style segmented control
- Product KPI performance table
- Gradient text headers
- Multi-view support (Goal/Area/Tower)
- SLA rejection workflow

### 3. [CHECKLIST_ASSESSMENT_PAGE_PROMPT.md](./CHECKLIST_ASSESSMENT_PAGE_PROMPT.md)
**Page**: Checklist Assessment Page  
**Design Style**: Apple-inspired/Material hybrid  
**Key Features**:
- Project selector with search
- Planned assessment accordion table
- 4-level hierarchical checklist (Tower > Model > Area > Process)
- Color-coded hierarchy levels
- Inline checkpoint editing
- Comprehensive form sections with colored row backgrounds

### 4. [KPI_DETAILS_PAGE_PROMPT.md](./KPI_DETAILS_PAGE_PROMPT.md)
**Page**: KPI Performance Dashboard  
**Design Style**: Apple iOS-inspired (SF Pro Text)  
**Key Features**:
- Card-based expandable goal sections
- Status chips with color coding
- Target vs Actual visual comparison
- Priority badges with icons
- Skeleton loading states
- Smooth expansion animations
- Trend chart integration

### 5. [KPI_TARGETS_GRID_PROMPT.md](./KPI_TARGETS_GRID_PROMPT.md)
**Page**: Set KPI & Targets Grid  
**Design Style**: Legacy-inspired with modern implementation  
**Key Features**:
- Light blue headers with dark text (not gradient)
- Color-coded tier borders (Red/Orange/Green/Blue)
- Material Design icons
- Fixed column widths for optimal readability
- Inline editing with Material form fields
- Sticky actions column
- Multi-tier target definition (4 tiers)

### 6. [CONFIGURATION_EXT_COMPONENT_PROMPT.md](./CONFIGURATION_EXT_COMPONENT_PROMPT.md)
**Page**: Configuration Management  
**Design Style**: Material Design  
**Key Features**:
- Material table with sorting/pagination
- Data type badges (String/Number/Boolean/JSON)
- Status toggle switches
- Add/Edit modal dialogs
- Advanced filtering
- Role-based access control
- Validation and error handling

### 7. [CHECKLIST_EXECUTION_NEW_PROMPT.md](./CHECKLIST_EXECUTION_NEW_PROMPT.md)
**Page**: Checklist Based Assessment Execution  
**Design Style**: Apple-inspired with gradient backgrounds  
**Key Features**:
- Gradient background sections
- 4-level color-coded hierarchy
- Inline checkpoint table editing
- Form sections with colored row backgrounds
- Progress indicators
- Auto-save functionality
- Nested expansion panels

### 8. [ASSESSMENT_STATUS_PAGE_PROMPT.md](./ASSESSMENT_STATUS_PAGE_PROMPT.md)
**Page**: Assessment Status Tracking  
**Design Style**: Material Design  
**Key Features**:
- Date range selection (From/To Month+Year)
- Assessment timeline management
- Progress tracking with visual progress bars
- Planned vs Actual date comparison
- Assessor assignment tracking
- Timeline view option

### 9. [CHECKLIST_FINDINGS_PAGE_PROMPT.md](./CHECKLIST_FINDINGS_PAGE_PROMPT.md)
**Page**: Findings Management  
**Design Style**: Material Design with Cards  
**Key Features**:
- Card-based findings display
- Severity classification (Critical/High/Medium/Low)
- Status tracking (Open/In Progress/Resolved/Closed)
- Attachment management with drag-drop upload
- Action plan tracking
- Comment threading and discussion
- History/audit trail
- Side panel for finding details

### 10. [PREMIER_DASHBOARD_PROMPT.md](./PREMIER_DASHBOARD_PROMPT.md)
**Page**: Executive Premier Dashboard  
**Design Style**: Modern Material with Charts  
**Key Features**:
- KPI summary cards with trends
- Customer Success Goal trend charts
- Assessment calendar/timeline view
- Risk overview widget with donut chart
- Top issues and recent assessments widgets
- Quick actions panel
- Interactive drill-down navigation
- Responsive grid layout (70/30 split)

### 11. [QA_ASSESSMENT_DETAILS_PROMPT.md](./QA_ASSESSMENT_DETAILS_PROMPT.md)
**Page**: QA Assessment Details & Lifecycle  
**Design Style**: Material Design with Tabs  
**Key Features**:
- Multi-tab interface (Checklist/Findings/Evidence/Comments/History)
- 4-level hierarchical checklist display (read-only)
- Evidence management with file uploads
- Comment threading with timeline
- Comprehensive audit trail
- Approval/review workflow
- PDF export and print functionality
- Status-based action buttons

### 12. [RISK_MANAGEMENT_PAGE_PROMPT.md](./RISK_MANAGEMENT_PAGE_PROMPT.md)
**Page**: Risk Management & Tracking  
**Design Style**: Material Design  
**Key Features**:
- 15-column data table with risk assessment details
- Color-coded RAG status via 4px left border
- 4-tier risk level system (Low/Moderate/High/Catastrophic)
- 5-section accordion form for detailed risk entry
- Auto-calculation of risk rating (Likelihood × Consequences)
- Treatment plan management with side panel
- Action items tracking integration
- Export to Excel functionality

### 13. [ISSUES_MANAGEMENT_PAGE_PROMPT.md](./ISSUES_MANAGEMENT_PAGE_PROMPT.md)
**Page**: Issues Management & Resolution  
**Design Style**: Material Design with Purple Theme  
**Key Features**:
- 17-column data table with severity classification
- Purple accent theme with 5 color-coded form sections
- 3-tier severity system (High/Medium/Low) with icons
- 7-section card-based form (no accordion)
- Employee search with autocomplete
- File attachment support with chips
- Character counters on textareas
- Responsive card view on mobile

### 14. [CSAT_INSIGHTS_DASHBOARD_PROMPT.md](./CSAT_INSIGHTS_DASHBOARD_PROMPT.md)
**Page**: CSAT Insights & Analytics Dashboard  
**Design Style**: Modern Material with Highcharts  
**Key Features**:
- 3-page dashboard (Heat Map/Response Charts/Question-wise Insights)
- Compact 9-field filter panel with Prev/Next navigation
- Dynamic Highcharts generation (one per survey question)
- 4-tier rating system (Need Improvement/Good/Great/Excellent)
- Trend-wise data toggle for time-based analysis
- Account search with live filtering
- Inter font system with gradient button accents
- Export charts to PNG/PDF/CSV/Excel

### 15. [CSAT_CONFIGURATION_PAGE_PROMPT.md](./CSAT_CONFIGURATION_PAGE_PROMPT.md)
**Page**: PCSAT Survey Configuration (Project & Respondent Setup)  
**Design Style**: Modern Blue Gradient with Material Stepper  
**Key Features**:
- 2-step wizard (Project Selection → Respondent Validation)
- Vertical Material stepper with linear progression
- Project selection table with 10 columns and bulk operations
- Color-coded Yes/No dropdowns (green/red) for PCSAT eligibility
- Respondent validation table with employee autocomplete
- Prediction scoring (1-5) and CSAT SPOC assignment
- Real-time validation with animated error feedback
- Extensive form validation and confirmation dialogs

### 16. [CUSTOMER_SATISFACTION_SURVEY_PROMPT.md](./CUSTOMER_SATISFACTION_SURVEY_PROMPT.md)
**Page**: Customer Satisfaction Survey Form  
**Design Style**: Clean Blue Gradient Theme  
**Key Features**:
- NPS rating with clickable 0-10 pills (color-coded by range)
- Star rating system for multiple criteria (1-5 stars)
- Auto-fill interaction when "Overall Experience" rated 5 stars
- Conditional comments (required if rating < threshold)
- Dynamic question rendering based on survey configuration
- Character counters on all text areas (300-500 chars)
- Date picker for meeting date (CSS-specific fields)
- Draft and submit workflows with comprehensive validation
- Thank you dialog on successful submission

### 17. [KPI_MANAGEMENT_SYSTEM_PROMPT.md](./KPI_MANAGEMENT_SYSTEM_PROMPT.md)
**Page**: Integrated KPI Management (Goals → Definitions → Details)  
**Design Style**: Apple-inspired Modern Design  
**Key Features**:
- 3-page integrated workflow system
- **Goals Page**: Define goal periods with start/end dates, split layout (table + form)
- **Definitions Page**: 9-column KPI table with expandable 4-tier targets, multi-period configuration
- **Details Page**: Accordion-based achievement tracking with auto-calculating status
- 4-tier color-coded target system (Baseline/Acceptable/Good/Excellent: Red/Orange/Green/Blue)
- Auto-status calculation (Not Met/Below/Met/Exceeded) based on actuals vs targets
- CAPA integration for underperforming KPIs
- Star-based rating display and trend visualization
- Fixed save button with smooth transitions

### 18. [OPERATIONAL_DASHBOARD_CUSTOMER_OVERVIEW_PROMPT.md](./OPERATIONAL_DASHBOARD_CUSTOMER_OVERVIEW_PROMPT.md)
**Page**: Operational Dashboard - Customer Overview (Page 1)  
**Design Style**: Modern Card-Based with Gradients & Charts  
**Key Features**:
- Holistic customer performance overview with animated gradient customer name
- Success goal performance table (8+ columns) with achievement badges
- 6 semicircular gauge widgets (Events/Tasks, Action Items, Appreciations, Risks, Issues, Contract Status)
- Google Charts visualizations (column charts, gauges, sparkline trends)
- Key highlights carousel with weekly/monthly filter
- Service improvement plan CAPA stage tracking
- Multi-page navigation (Customer Overview → Assessment Status → Success Journey)
- Color-coded status indicators and responsive card layout

### 19. [OPERATIONAL_DASHBOARD_KPI_PERFORMANCE_PROMPT.md](./OPERATIONAL_DASHBOARD_KPI_PERFORMANCE_PROMPT.md)
**Page**: Operational Dashboard - KPI Performance & Health Index (Page 2)  
**Design Style**: Analytics-Focused Modern Dashboard  
**Key Features**:
- Overall Health Index donut chart with 4 categories (Quality/Performance/Value/Compliance)
- Category breakdown cards with scores and drill-down actions
- KPI performance table (7+ columns) with achievement tracking and trend indicators
- Customer Success Goals table with visual progress bars (Premier customers)
- 5 operational widgets (Events/Tasks, Action Items, Issues, Risks, Appreciations)
- Auto-refresh timer with pause/resume functionality (5-minute countdown)
- Advanced filter dialog with category chips, period selection, and achievement range slider
- Responsive design with mobile card views

---

## High-Level Workflow & Widget Prompts

### 18. [DASHBOARD_WIDGETS_PROMPT.md](./DASHBOARD_WIDGETS_PROMPT.md)
**Type**: Operational Dashboard Widgets  
**Design Style**: Card-based Material Design  
**Key Features**:
- 6 dashboard widgets (Risk Status, Contract Status, Assessment Status, CAP Stages, Findings by Type/Age)
- Gauge charts, donut charts, bar charts
- Empty states and loading states
- Click-through navigation to detail pages
- Responsive grid layout
- Real-time metrics display

### 20. [SQA_WORKFLOW_PROMPT.md](./SQA_WORKFLOW_PROMPT.md)
**Page**: SQA Management System - Complete 3-Phase Workflow (Setup → Plan → Execute)  
**Design Style**: Apple-Inspired Multi-Level Navigation with Material Design 3  
**Key Features**:
- **Multi-level navigation architecture**: Module switcher (L1) → Phase tabs (L2) → Step strip/Stepper (L3)
- **Setup Phase - Complete 10 numbered tabs** with horizontally scrollable Apple-style step strip:
  1. **New Process Model** - Split layout (form 35% | table 65%), CRUD with pagination/sorting
  2. **Assessment Check-list** - Maturity levels, weightage, corrective action tracking, approval workflow
  3. **New Process Area and Process** - Inline editable table, search filters, multi-select ISO references
  4. **Map Service Tower & Process** - Service tower mapping, checkbox selection, color-coded indicators
  5. **View Service Tower & Process** - Read-only mappings, split layout for adding towers
  6. **Map Process Model** - Process-to-model mapping with multi-select optgroups and inline search
  7. **View Process Model** - Read-only view with multi-filter search capabilities
  8. **Map Checklist Questions and Process** - Inline editable table, display order, weightage badges, maturity level dropdowns
  9. **PSPD (Process Service Tower Project Definition)** - 3-level nested tables, expansion panels, tailoring notes
  10. **Merge Checklist** - Multi-checklist selection, hierarchical preview, cascading checkbox selection
- **Plan Phase - Complete 2 tabs** with 3-step horizontal stepper:
  1. **View Planner** - Calendar/list view toggle, 5-filter bar (Type, Category, Customer, Project, Year), event card grid with color-coding, 13-column list table, period tabs (Yearly/Quarterly/Monthly/Weekly), draft indicators
  2. **Add Event/Task** - Multi-section flat form (Basic Information, Scheduling & Status, Customer & Assignment), 7 recurrence patterns (Daily/Weekly/Fortnightly/Monthly/Quarterly/Half-Yearly/Yearly), conditional fields, Save Draft/Submit actions
- **Execute Phase - Complete checklist-based assessment**:
  - Project selection card with customer/project dropdowns
  - Planned assessment accordion with 13-column table (Title, Planned Date, Actual Start, Due Date, Compliance %, Findings count, Status badges, Actions, PDF export)
  - Assessment details fields (3 rows with 7+8+5 fields): Appraiser/Appraisees, Dates, Checklist version, Scores, CC/To lists, Service Towers
  - 4-level hierarchical checklist (Service Tower → Process Model → Process Area → Process) with color-coded expansion panels (blue/teal/purple/yellow)
  - Checkpoint table with 7 columns: S.No, Weightage badge, Look For, Status dropdown, Score, Notes textarea, Findings button
  - Maturity level tracking, real-time score calculation (audit date vs. today), N/A checkboxes at all levels
  - Findings management dialog, Save Draft/Submit workflow
- Complete HTML/SCSS specifications, TypeScript models, responsive design, accessibility features (7,805 lines, ~16,200 words)
- Material Design 3 components with Apple aesthetics throughout

### 21. [GRC_WORKFLOW_PROMPT.md](./GRC_WORKFLOW_PROMPT.md)
**Type**: Governance, Risk, Compliance Workflow (Setup → Plan → Execute)  
**Design Style**: Wizard-based with purple/indigo accents  
**Key Features**:
- Multi-framework support (ISO 27001, SOC 2, GDPR, HIPAA, PCI DSS)
- Control library and risk registry management
- Policy management with approval workflow
- Control effectiveness assessment with evidence collection
- Compliance scoring and gap analysis
- Management attestation and certification
- Remediation tracking and reporting

---

## Design Themes

### Apple-Inspired Pages
- **Font**: SF Pro Display / SF Pro Text / -apple-system
- **Colors**: iOS palette (#007AFF blue, #34C759 green, #FF3B30 red, etc.)
- **Effects**: Glassmorphism, backdrop blur, smooth animations
- **Style**: Clean, minimalist, generous spacing

**Pages**: Success Goal KPI Performance, Checklist Assessment, KPI Details, Checklist Execution New

### Material Design Pages
- **Font**: Roboto, Segoe UI
- **Colors**: Material palette (#1976d2 blue, #388e3c green, #d32f2f red)
- **Components**: Material table, chips, buttons, form fields
- **Style**: Elevated cards, shadow depths, ripple effects

**Pages**: Action Items, Configuration EXT

### Legacy-Inspired Modern Pages
- **Font**: System fonts
- **Colors**: Traditional palette with light blue headers
- **Style**: Maintains familiar aesthetics with modern implementation
- **Components**: Material components styled to match legacy look

**Pages**: KPI & Targets Grid

---

## Usage Instructions

### For AI Tools
1. Copy the entire contents of a prompt file
2. Paste into your AI tool (ChatGPT, Claude, Copilot, etc.)
3. Add specific requirements or constraints if needed
4. Generate the code/design

### For Developers
1. Read the prompt as comprehensive specifications
2. Implement using the specified technology stack:
   - **Framework**: Angular 19+
   - **UI Library**: Angular Material v19+
   - **Styling**: SCSS
   - **Icons**: Material Icons
3. Follow the exact dimensions, colors, and spacing provided
4. Implement all accessibility requirements
5. Test responsive breakpoints

### For Designers
1. Use prompts as design specifications
2. Create mockups matching the exact specifications
3. Reference color palette and typography sections
4. Follow spacing system (usually 4px or 8px grid)

---

## Common Design Patterns

### Color Usage
- **Primary Actions**: Blue gradients or solid blues
- **Success/Save**: Green gradients (#10B981, #059669)
- **Danger/Delete**: Red shades (#DC2626, #EF4444)
- **Warning**: Orange shades (#FF9500, #F59E0B)
- **Info**: Blue shades (#007AFF, #3B82F6)

### Button Patterns
- **Primary**: Gradient background, white text, shadow, 40-48px height
- **Secondary**: Outlined or gray background
- **Icon Buttons**: 32-36px circular or square
- **Hover**: translateY(-1px or -2px), shadow increase
- **Active**: translateY(0), shadow decrease

### Card Patterns
- **Background**: White (#FFFFFF)
- **Border-radius**: 8-16px
- **Box-shadow**: 0 2px 8px rgba(0, 0, 0, 0.04-0.08)
- **Hover**: Shadow increase, subtle lift
- **Padding**: 16-24px

### Table Patterns
- **Header**: Light background (#F5F7FA or #BBDEFB)
- **Font-size**: 11-13px
- **Row height**: 48-56px
- **Hover**: Light background change, subtle shadow
- **Borders**: 1px solid rgba(0, 0, 0, 0.06)

### Typography Scale
- **Page Titles**: 20-32px, font-weight 600-700
- **Section Headers**: 16-18px, font-weight 600
- **Body Text**: 13-14px, font-weight 400
- **Labels**: 11-12px, font-weight 600, uppercase
- **Table Text**: 11-13px
- **Badges/Chips**: 10-11px, font-weight 600

### Spacing Scale
- **Base Unit**: 4px or 8px
- **Common Values**: 8px, 12px, 16px, 20px, 24px, 32px
- **Container Padding**: 16-24px
- **Card Padding**: 16-24px
- **Element Gaps**: 8-16px
- **Section Margins**: 16-24px

---

## Responsive Breakpoints

All prompts follow these standard breakpoints:

- **Mobile**: ≤600px or ≤768px
- **Tablet**: 601-768px or 769-1023px
- **Desktop**: >768px or >1024px

### Mobile Adjustments
- Single column layouts
- Stacked form fields
- Reduced font sizes (1-2px smaller)
- Reduced padding (8-12px)
- Horizontal scroll tables or card view
- Full-width buttons

---

## Accessibility Standards

All prompts specify WCAG 2.1 Level AA compliance:

- **Color Contrast**: 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **ARIA Labels**: Proper labels for icon buttons and complex components
- **Focus Indicators**: Visible focus outlines
- **Semantic HTML**: Proper heading structure, table roles
- **Alternative Text**: For images and icons

---

## Technology Stack

### Required
- **Angular**: 19+ (standalone components)
- **Angular Material**: 19+ (Material Design 3)
- **TypeScript**: 5+
- **SCSS**: For styling

### Optional
- **RxJS**: For reactive state management
- **Angular CDK**: For advanced components
- **Highcharts/Chart.js**: For trend charts
- **Export Libraries**: For Excel/PDF export

---

## Notes

- **Standalone Prompts**: Each file is completely self-contained
- **No Code Duplication**: Design systems are repeated for clarity
- **Pixel Perfect**: All dimensions are exact, not approximate
- **Production Ready**: Specifications include error handling, loading states, empty states
- **Tested Designs**: All designs have been implemented and tested

---

## Version History

- **v1.7** (2026-04-09): Completed SQA Management System prompt with Plan and Execute phases (Total: 21 prompts)
  - SQA_WORKFLOW_PROMPT.md: Expanded to full 3-phase comprehensive specification (7,805 lines, ~16,200 words)
  - **Plan Phase - Added complete 2-tab specifications**:
    - **Tab 1: View Planner** - Calendar/list view toggle, 5-filter bar, event card grid, 13-column list table, year/period navigation
    - **Tab 2: Add Event/Task** - Multi-section form (Basic Info, Scheduling, Customer Assignment), 7 recurrence patterns, status workflow
  - **Execute Phase - Added complete checklist execution specifications**:
    - Project selection card with customer/project dropdowns
    - Planned assessment accordion with 13-column table (Title, Dates, Compliance %, Findings, Status, Actions, Report)
    - Assessment details fields (3 rows: 7+8+5 fields) with appraiser/appraisees, dates, checklist, scores, service towers
    - 4-level hierarchical checklist structure (Service Tower → Process Model → Process Area → Process)
    - Color-coded expansion panels (blue, teal, purple, yellow) with N/A checkboxes and score displays
    - Checkpoint table with 7 columns (S.No, Weightage, Look For, Status dropdown, Score, Notes textarea, Findings button)
    - Maturity level tracking, real-time score calculation, findings management
    - Save Draft / Submit action footer with validation
  - All phases include complete HTML/SCSS code examples, responsive design, accessibility, Material Design 3 components
  - Apple-inspired aesthetics throughout with -apple-system fonts, iOS colors, smooth transitions

- **v1.6** (2026-04-09): Enhanced SQA Management System prompt to comprehensive specification (Total: 21 prompts)
  - SQA_WORKFLOW_PROMPT.md: Expanded from high-level workflow to comprehensive detailed prompt (~25,000 words)
  - **Added complete Setup phase specifications with all 10 numbered tabs** in Apple-style step strip
  - **Tab 1: New Process Model** - Split form/table layout, CRUD operations with pagination and sorting
  - **Tab 2: Assessment Check-list** - Maturity levels, weightage configuration, approval workflow, version filtering
  - **Tab 3: New Process Area and Process** - Inline editable table with multi-select ISO/Model references
  - **Tab 4: Map Service Tower & Process** - Service tower to process mapping with checkbox selection, color coding
  - **Tab 5: View Service Tower & Process** - Read-only view with filters, split layout for adding service towers
  - **Tab 6: Map Process Model** - Process-to-model mapping with multi-select optgroups, inline search
  - **Tab 7: View Process Model** - Read-only process model view with multi-filter capabilities
  - **Tab 8: Map Checklist Questions and Process** - Inline editable question mapping, display order, weightage badges, maturity levels
  - **Tab 9: PSPD (Process Service Tower Project Definition)** - Nested hierarchical tables, expansion panels, tailoring notes
  - **Tab 10: Merge Checklist** - Multi-checklist preview with hierarchical checkbox selection, cascading parent-child relationships
  - Includes multi-level navigation architecture, Material Design 3 components, Apple-inspired aesthetics
  - Complete styling specifications, responsive design, accessibility features, TypeScript data models

- **v1.5** (2026-04-09): Added 2 operational dashboard page prompts (Total: 22 prompts)
  - Operational Dashboard - Customer Overview (Page 1): Holistic view with success goals, widgets, highlights, CAPA tracking
  - Operational Dashboard - KPI Performance & Health Index (Page 2): Analytics-focused with health index, KPI tables, auto-refresh

- **v1.4** (2026-04-09): Added 3 survey & KPI management prompts (Total: 20 prompts)
  - CSAT Configuration Page (2-step wizard for project/respondent setup)
  - Customer Satisfaction Survey Form (NPS + star ratings)
  - KPI Management System (integrated Goals/Definitions/Details workflow)

- **v1.3** (2026-04-09): Added 3 high-level workflow & widget prompts (Total: 17 prompts)
  - Operational Dashboard Widgets (6 widgets)
  - SQA Workflow (Setup/Plan/Execute) - Initial high-level version
  - GRC Workflow (Setup/Plan/Execute)

- **v1.2** (2026-04-09): Added 3 critical management pages (Total: 14 pages)
  - Risk Management & Tracking
  - Issues Management & Resolution
  - CSAT Insights Dashboard

- **v1.1** (2026-04-09): Added 4 additional comprehensive UI prompts (Total: 11 pages)
  - Assessment Status Page
  - Checklist Findings Page
  - Premier Dashboard
  - QA Assessment Details Page

- **v1.0** (2026-04-09): Initial creation of 7 core UI prompt files
  - Action Items Page
  - Success Goal & KPI Performance
  - Checklist Assessment Page
  - KPI Details
  - KPI & Targets Grid
  - Configuration EXT Component
  - Checklist Execution New

---

## Contact & Support

For questions or clarifications about these prompts, refer to the source documentation in:
- `4_Modernized_Output/csp-angular19/` (implementation files)
- `4_Modernized_Output/csp-angular19/*.md` (design documentation)

---

## License

These prompts document the design specifications of the CSM Platform Angular application modernization project.
