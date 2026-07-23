# Risk Management Page - Complete UI Recreation Prompt

## Page Overview
Create a comprehensive **Risk Management Page** for tracking and managing project risks in an enterprise Customer Success Management platform. The page features a sophisticated data table with 15 columns, advanced filtering capabilities, color-coded risk ratings (RAG status), inline editing forms with 5 expandable sections, and integrated treatment plan management with action items tracking.

---

## Design System & Framework

### Technology Stack
- **Framework**: Angular 19+ (standalone components)  
- **UI Library**: Angular Material v19+ (Material Design 3)  
- **Icons**: Material Icons  
- **Styling**: SCSS with design tokens and CSS variables  
- **Charts**: Not applicable (table-based interface)

### Design Philosophy
**Modern Material Design** with clean, professional aesthetics optimized for data-heavy enterprise workflows. The interface emphasizes clarity, accessibility, and efficient risk assessment workflows with color-coded visual indicators for quick risk level identification.

---

## Layout Structure

### 1. Page Container
**Styling Specifications:**

Background color: #f5f7fa. Padding: 6px.

### 2. Unified Header Row (Top Navigation Bar)
**Background**: White (#ffffff)  
**Border-radius**: 8px  
**Box-shadow**: `0 2px 4px rgba(0, 0, 0, 0.1)`  
**Display**: Flex layout with 6px gap between items  
**Padding**: `4px 8px 4px 0px`  
**Min-height**: 48px

**Header Components (Left to Right)**:

1. **Back Button**
   - Size: 28×28px
   - Icon: `arrow_back` (Material Icons)
   - Icon size: 18px
   - Color: #757575 (default), #1976d2 (hover)
   - Background: Transparent (default), rgba(0, 0, 0, 0.04) (hover)
   - Border-radius: 6px
   - Tooltip: "Back to Dashboard"

2. **Logo Placeholder**
   - Width: 32px, Height: 28px
   - Image: `assets/images/CustomerLogo.png`
   - Margin-right: 6px

3. **Portfolio/Project Selector**
   - Custom component: `<app-portfolio-project-selector>`
   - Height: 32px (compact)
   - Font-size: 13px
   - Multi-project selection support
   - Emits: `(projectsSelected)` event

4. **Status Filter Group**
   - Container gap: 12px
   - Label "Status:" (13px, font-weight 600, margin-right 8px)
   - **3 Checkboxes**:
     - ✓ **All** (checkbox-size: 16×16px, label 13px, default text color)
     - ✓ **Open - Past Due Date** (color: #d32f2f / warn, disabled when All checked)
     - ✓ **Due For Closure** (color: #ed6c02 / accent-orange, disabled when All checked)
   - Padding: 4px on checkbox wrapper

5. **Action Buttons (Right-aligned)**
   - Gap: 8px between buttons
   - **Export Button**: 
     - Stroked button, 32×32px
     - Icon: `download` (18px)
     - Border: 1px solid #e0e0e0
     - Tooltip: "Export to Excel"
   - **Filter Toggle Button**:
     - Stroked button, 32×32px
     - Icon: `filter_list` (18px)
     - Tooltip: "Show/Hide Filter"
   - **Add Risk Button**:
     - Raised button (mat-raised-button color="primary")
     - 32×32px
     - Icon: `add` (18px)
     - Background: #1976d2
     - Tooltip: "Add Risk"
     - Visible only when user has edit permission

### 3. Advanced Filters Card (Collapsible)
**Display**: Shown/hidden via filter toggle button  
**Background**: White  
**Border-radius**: 10px  
**Padding**: `6px 12px`  
**Margin-bottom**: 4px  
**Border**: `1px solid rgba(0, 0, 0, 0.06)`

**Contains**:
- `<app-table-filter>` component
- Dynamic column filtering
- Border-top: 1px solid #e0e0e0 (separator)
- Padding-top: 8px

### 4. Action Bar
**Background**: White  
**Border-radius**: 8px  
**Box-shadow**: `0 2px 4px rgba(0, 0, 0, 0.1)`  
**Padding**: `6px 12px`  
**Display**: Flex, space-between alignment

**Left Side**:
- **Page Title**: "Risks" 
  - Font-size: 18px
  - Font-weight: 600
  - Color: #212121

**Right Side (Gap: 12px)**:
- **Risk Matrix Link**:
  - Href: `/assets/images/risk_map_legend.png` (opens new tab)
  - Icon: `grid_on` (18px, margin-right 6px)
  - Text: "Risk Matrix"
  - Font-size: 12px
  - Color: #1976d2
  - Hover: rgba(25, 118, 210, 0.08) background
  - Padding: 6px 12px
  - Border-radius: 6px

- **Risk Statement Guideline Button**:
  - Mat-button
  - Height: 32px
  - Icon: `description` (18px, margin-right 6px)
  - Text: "Risk Statement Guideline"
  - Font-size: 12px
  - Click: Opens dialog (1100px width, 80vh max-height)

### 5. Loading State
- **Mat-progress-bar** (when isLoading = true)
- Mode: indeterminate
- Color: Primary (#1976d2)
- Border-radius: 4px
- Margin-bottom: 16px

### 6. Empty State (No Risks Found)
**Container**:
- Background: White
- Padding: 40px 20px
- Border-radius: 8px
- Text-align: center

**Icon**: `warning` (Material Icons)
- Size: 56×56px
- Color: #757575
- Opacity: 0.5

**Heading**: "No Risks Found"
- Font-size: 16px
- Font-weight: 600
- Color: #212121
- Margin: 16px 0 8px

**Message**: "No risks are defined for the projects assigned to you."
- Font-size: 12px
- Color: #757575

### 7. Data Table Card
**Background**: White  
**Border-radius**: 8px  
**Box-shadow**: `0 2px 4px rgba(0, 0, 0, 0.1)`  
**Class**: `.table-container.mat-elevation-z2`

Contains Material table with sorting, pagination, and 15 columns.

---

## Color Palette

### Primary Colors
**Styling Specifications:**

### Background Colors
**Styling Specifications:**

### Text Colors
**Styling Specifications:**

### Risk Level Colors (4-Tier System)
**Styling Specifications:**

### Status Badge Colors (10+ Status Types)
**Styling Specifications:**

### RAG (Red-Amber-Green) Border
**Left border on table rows**: 4px solid color based on `risk.rag` value (dynamically set)

---

## Typography

### Font Families
**Styling Specifications:**

### Font Specifications
| Element | Size | Weight | Color | Letter-spacing |
|---------|------|--------|-------|----------------|
| **Page Title** | 18px | 600 | #212121 | normal |
| **Form Title** | 20px | 600 | #212121 | normal |
| **Panel Title** | 15px | 600 | #212121 | normal |
| **Panel Subtitle** | 12px | 400 | #757575 | normal |
| **Table Header** | 12px | 600 | #212121 | 0.3px |
| **Table Cell** | 12px | 400 | #212121 | normal |
| **Form Labels** | 12px | 600 | #212121 | normal |
| **Form Inputs** | 12px | 400 | #212121 | normal |
| **Badge Text** | 10px | 600 | varies | 0.3px (uppercase) |
| **Button Text** | 13px | 500 | varies | normal |
| **Helper Text** | 12px | 400 | #757575 | normal |
| **Owner Chip** | 10px | 500 | #5568d3 | normal |
| **Date Cell** | 11px | 400 | #757575 | normal |
| **Empty State H3** | 16px | 600 | #212121 | normal |
| **Empty State P** | 12px | 400 | #757575 | normal |

---

## Spacing System

### Padding
**Styling Specifications:**

Padding: 6px.

### Margins
**Styling Specifications:**

### Gaps
**Styling Specifications:**

Gap between elements: 6px.

---

## Material Table - 15 Columns

### Table Configuration
**TypeScript Implementation:**

Data models define the structure and types for component data.

**MatPaginator**:
- Page sizes: [5, 10, 20]
- Show first/last buttons: true

**MatSort**: Enabled on all columns

### Column Definitions

#### 1. **No.** (index) - 50px width, centered
- **Type**: Sequential index number
- **Display**: Circular badge
- **Badge Styling**:
  - Width/height: 23px
  - Border-radius: 50%
  - Background: `linear-gradient(135deg, #1e88e5, #1565c0)`
  - Color: #ffffff
  - Font-size: 11px
  - Font-weight: 600
- **Calculation**: `((pageIndex * pageSize) + rowIndex + 1)`
- **Special**: 4px solid left border (color = `risk.rag`)
- **Border class**: `borderSolid`

#### 2. **Portfolio** (Portfolio_Name) - 10% width
- **Header**: "Portfolio"
- **Sortable**: Yes
- **Data**: `risk.portfoliO_NM`
- **Styling**: 
  - Class: `text-truncate`
  - Max-width: auto (ellipsis overflow)
  - Tooltip: Full portfolio name

#### 3. **Project** (proJ_NM) - 10% width
- **Header**: "Project"
- **Sortable**: Yes
- **Data**: `risk.proJ_NM`
- **Styling**: 
  - Class: `text-truncate`
  - Tooltip: Full project name

#### 4. **Identified On** (identifieD_DATE) - 8% width
- **Header**: "Identified On"
- **Sortable**: Yes
- **Data**: `risk.identifieD_DATE | date:'dd-MMM-yyyy'`
- **Styling**: 
  - Class: `date-cell`
  - Font-size: 11px
  - Color: #757575

#### 5. **Description** (description) - 15% width
- **Header**: "Description"
- **Sortable**: Yes
- **Data**: `risk.description`
- **Styling**: 
  - Class: `description-cell`
  - Max-width: 200px
  - Word-break: normal
  - Tooltip: Full description

#### 6. **Business Impact** (impact) - 12% width
- **Header**: "Business Impact"
- **Sortable**: Yes
- **Data**: `risk.impact`
- **Styling**: 
  - Class: `description-cell`
  - Word-break: normal
  - Tooltip: Full impact statement

#### 7. **Owner** (owner) - 8% width
- **Header**: "Owner"
- **Sortable**: Yes (by owner name)
- **Display**: Owner chip with styled background
- **Chip Styling**:
  - Background: `rgba(103, 126, 234, 0.12)`
  - Color: #5568d3
  - Padding: 4px 10px
  - Border-radius: 12px
  - Font-size: 10px
  - Font-weight: 500
- **Data**: `getOwnerName(risk)` function

#### 8. **Likelihood** (probabilitY_SCALE) - 7% width
- **Header**: "Likelihood"
- **Sortable**: Yes
- **Display**: Badge with light blue background
- **Badge Styling**:
  - Background: #e3f2fd
  - Color: #1565c0
  - Padding: 3px 10px
  - Border-radius: 10px
  - Font-size: 10px
  - Font-weight: 500
- **Values**: Rare / Remote / Moderate / Likely / Frequent

#### 9. **Consequences** (impacT_SCALE) - 7% width
- **Header**: "Consequences"
- **Sortable**: Yes
- **Display**: Badge with light orange background
- **Badge Styling**:
  - Background: #fff3e0
  - Color: #e65100
  - Padding: 3px 10px
  - Border-radius: 10px
  - Font-size: 10px
  - Font-weight: 500
- **Values**: Insignificant / Minor / Significant / Major / Critical

#### 10. **Risk Rating** (rating) - 6% width, centered
- **Header**: "Risk Rating"
- **Sortable**: Yes
- **Display**: Circular badge with gradient
- **Badge Styling**:
  - Width/height: 28px
  - Border-radius: 50%
  - Background: `linear-gradient(135deg, #667eea, #764ba2)`
  - Color: #ffffff
  - Font-size: 11px
  - Font-weight: 600
- **Data**: Numeric score (1-25)

#### 11. **Risk Level** (matrix) - 7% width
- **Header**: "Risk Level"
- **Sortable**: Yes
- **Display**: Color-coded badge
- **Values & Colors**:
  - **Low**: Background #e8f5e9, Text #388e3c
  - **Moderate**: Background #fff3e0, Text #f57c00
  - **High**: Background #ffebee, Text #d32f2f
  - **Catastrophic**: Background #f3e5f5, Text #7b1fa2
- **Badge Styling**: Same as status badges (3px 10px padding, 10px radius, uppercase, 10px font)

#### 12. **Status** (status) - 7% width
- **Header**: "Status"
- **Sortable**: Yes
- **Display**: Status badge with dynamic colors
- **Badge Colors**: See "Status Badge Colors" section
- **Values**: Identified / Assessed / Planned / In-Process / Occurred / Not-Occurred / Closed / etc.

#### 13. **Treatment Plan** (iS_PLAN_EXISTS) - 10% width
- **Header**: "Treatment Plan"
- **Display**: 
  - If available: "Available" text + view icon link
  - If not: "Not Available" text
- **View Icon**:
  - Icon: `visibility` (18px)
  - Color: #1976d2
  - Click: Opens treatment plan popup (900px width)
  - Tooltip: "View Treatment Plan"

#### 14. **Occurred/Closed** (actuaL_DATE) - 8% width
- **Header**: "Occurred/Closed"
- **Sortable**: Yes
- **Data**: `risk.actuaL_DATE | date:'dd-MMM-yyyy'`
- **Styling**: 
  - Class: `date-cell`
  - Font-size: 11px
  - Color: #757575
- **Display**: Shows date when risk occurred or was closed

#### 15. **Actions** (edit) - 100px width, centered
- **Header**: (No text, actions column)
- **Contains 3 action icons**:
  
  **Info Icon**:
  - Icon: `info` (18px)
  - Color: #1976d2
  - Click: Opens entity info popup (500px width)
  - Hover: rgba(25, 118, 210, 0.1) circular background (32px)
  - Tooltip: "View Info"
  
  **Edit Icon**:
  - Icon: `edit` (18px)
  - Color: #00897b (teal)
  - Click: Opens edit form
  - Hover: rgba(0, 137, 123, 0.1) circular background (32px)
  - Tooltip: "Edit Risk"
  
  **Delete Icon**:
  - Icon: `delete` (18px)
  - Color: #d32f2f (red)
  - Click: Opens confirmation dialog
  - Hover: rgba(211, 47, 47, 0.1) circular background (32px)
  - Tooltip: "Delete Risk"

### Table Row Styling

**Normal Row**:
- Background: #ffffff
- Border-bottom: 1px solid #e0e0e0
- **Left border**: 4px solid (color based on RAG status)

**Hover State**:
- Background: `rgba(103, 126, 234, 0.05)`
- Box-shadow: `0 2px 4px rgba(0, 0, 0, 0.08)`
- Transition: `all 0.2s ease`

**Draft Row** (if `risk.isDraft`):
- Background: #fffacd (light yellow)
- Hover: #fff9b8

**Selected Row**:
- Background: `rgb(214, 214, 214)` (light gray)

---

## Edit/Add Form (5-Section Accordion)

### Form Container
**Display**: Replaces table view when editing/adding  
**Background**: #f5f7fa (same as page)  
**Padding**: 16px

### Form Header (Gradient Bar)
**Background**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`  
**Padding**: 12px 16px  
**Border-radius**: 8px 8px 0 0  
**Display**: Flex, space-between alignment

**Left Side**:
- **Title**: "Edit Risk" or "Add Risk"
  - Font-size: 20px
  - Font-weight: 600
  - Color: #ffffff

**Right Side (Action Buttons)**:
- **Save Button**:
  - Icon: `save` (20px)
  - Background: #ffffff
  - Color: #667eea
  - Size: 36×36px
  - Border-radius: 50%
  - Hover: Scale 1.05, box-shadow
  - Tooltip: "Save"
  
- **Cancel Button**:
  - Icon: `close` (20px)
  - Border: 1px solid #ffffff
  - Color: #ffffff
  - Size: 36×36px
  - Border-radius: 50%
  - Background: transparent
  - Hover: Background rgba(255, 255, 255, 0.1)
  - Tooltip: "Cancel"

### 5 Expansion Panels (mat-expansion-panel)

**Panel Base Styling**:
- Background: #ffffff
- Border: 1px solid #e0e0e0
- Border-radius: 8px
- Margin-bottom: 16px
- Box-shadow: `0 2px 4px rgba(0, 0, 0, 0.05)`

**Panel Header**:
- Background: #f5f7fa (default), slight darker on hover
- Padding: 12px 16px
- Font-size: 15px
- Font-weight: 600
- Color: #212121
- Icon (expand): Rotate 180deg when open

**Panel Content**:
- Padding: 20px 16px
- Background: #ffffff

#### Panel 1: Risk Identification
**Expansion Panel Header**: "Risk Identification"

**Fields (2 columns, responsive)**:

1. **Portfolio** (mat-select, multi-select)
   - Label: "Portfolio" (required ✱)
   - Appearance: outline
   - Options: Dynamic portfolio list
   - Icon prefix: `business` (18px, #1976d2)
   - Height: 38px

2. **Project** (mat-select, multi-select)
   - Label: "Project" (required ✱)
   - Appearance: outline
   - Depends on portfolio selection
   - Icon prefix: `folder` (18px, #1976d2)

3. **Risk Description** (textarea, autosize)
   - Label: "Risk Description" (required ✱)
   - Appearance: outline
   - Min-height: 60px
   - Max-height: 150px
   - Vertical resize: enabled
   - Icon prefix: `description` (18px, #1976d2)

4. **Business Impact** (textarea, autosize)
   - Label: "Business Impact" (required ✱)
   - Min-height: 60px
   - Max-height: 150px
   - Icon prefix: `trending_down` (18px, #1976d2)

5. **Identified Date** (mat-datepicker)
   - Label: "Identified Date" (required ✱)
   - Format: dd-MMM-yyyy
   - Icon suffix: `calendar_today` (18px)
   - Default: Today

6. **Identified By** (mat-select)
   - Label: "Identified By"
   - Options: Employee list
   - Icon prefix: `person` (18px, #1976d2)

7. **Category** (mat-select)
   - Label: "Category"
   - Options: Dynamic category list
   - Icon prefix: `category` (18px, #1976d2)

8. **Type** (mat-select)
   - Label: "Type"
   - Options: Dynamic type list based on category
   - Icon prefix: `label` (18px, #1976d2)

9. **Owner** (mat-select)
   - Label: "Owner" (required ✱)
   - Options: Employee list
   - Icon prefix: `person` (18px, #1976d2)

#### Panel 2: Risk Analysis
**Expansion Panel Header**: "Risk Analysis"

**Fields**:

1. **Likelihood** (mat-radio-group, horizontal)
   - Label: "Likelihood" (required ✱)
   - Options: 
     - Rare (1) - Light blue badge
     - Remote (2)
     - Moderate (3)
     - Likely (4)
     - Frequent (5)
   - Auto-calculates risk rating on change

2. **Consequences** (mat-radio-group, horizontal)
   - Label: "Consequences" (required ✱)
   - Options:
     - Insignificant (1) - Light orange badge
     - Minor (2)
     - Significant (3)
     - Major (4)
     - Critical (5)
   - Auto-calculates risk rating on change

3. **Risk Rating** (readonly, auto-calculated)
   - Formula: Likelihood × Consequences
   - Display: Circular gradient badge (28px)
   - Background: Linear gradient #667eea to #764ba2
   - Color: White
   - Font-weight: 600

4. **Risk Level** (readonly, auto-calculated)
   - Logic:
     - < 5: Low (green)
     - < 10: Moderate (orange)
     - < 20: High (red)
     - ≥ 20: Catastrophic (purple)
   - Display: Color-coded badge

#### Panel 3: Risk Treatment Plan
**Expansion Panel Header**: "Risk Treatment Plan"

**Fields**:

1. **Treatment Option** (mat-select)
   - Label: "Treatment Option" (required ✱)
   - Options: Mitigate / Transfer / Accept / Avoid
   - Icon prefix: `healing` (18px, #1976d2)

2. **Treatment Strategy** (textarea, autosize)
   - Label: "Treatment Strategy" (required ✱)
   - Min-height: 60px
   - Max-height: 150px
   - Icon prefix: `policy` (18px, #1976d2)

3. **Contingency Plan** (textarea, autosize)
   - Label: "Contingency Plan"
   - Min-height: 60px
   - Max-height: 150px
   - Icon prefix: `backup` (18px, #1976d2)

4. **Target Date** (mat-datepicker)
   - Label: "Target Date"
   - Format: dd-MMM-yyyy
   - Validation: Must be > Identified Date
   - Icon suffix: `calendar_today` (18px)

#### Panel 4: Risk Evaluation
**Expansion Panel Header**: "Risk Evaluation"

**Fields**:

1. **Status** (mat-select)
   - Label: "Status" (required ✱)
   - Options: Identified / Assessed / Planned / In-Process / Occurred / Not-Occurred / Closed
   - Color-coded badges in dropdown
   - Icon prefix: `flag` (18px, #1976d2)

2. **Actual Date** (mat-datepicker)
   - Label: "Occurred/Closed Date"
   - Format: dd-MMM-yyyy
   - Enabled only when Status = Occurred or Closed
   - Icon suffix: `calendar_today` (18px)

3. **Evaluation Comments** (textarea, autosize)
   - Label: "Evaluation Comments"
   - Min-height: 60px
   - Max-height: 150px
   - Icon prefix: `comment` (18px, #1976d2)

#### Panel 5: Risk Treatment Effectiveness Verification
**Expansion Panel Header**: "Risk Treatment Effectiveness Verification"

**Fields**:

1. **Verification Date** (mat-datepicker)
   - Label: "Verification Date"
   - Format: dd-MMM-yyyy
   - Icon suffix: `calendar_today` (18px)

2. **Verified By** (mat-select)
   - Label: "Verified By"
   - Options: Employee list
   - Icon prefix: `verified_user` (18px, #1976d2)

3. **Verification Comments** (textarea, autosize)
   - Label: "Verification Comments"
   - Min-height: 60px
   - Max-height: 150px
   - Icon prefix: `fact_check` (18px, #1976d2)

4. **Effectiveness Rating** (mat-radio-group, horizontal)
   - Label: "Effectiveness Rating"
   - Options: Not Effective / Partially Effective / Fully Effective
   - Color-coded: Red / Orange / Green

### Form Layout

**Form Row (Responsive)**:
**Styling Specifications:**

Flexbox layout enables flexible positioning and alignment. Gap between elements: 16px. Responsive breakpoints ensure proper display across device sizes.

**Form Field Styling**:
- Appearance: outline
- Font-size: 12px (label), 12px (input)
- Label font-weight: 600
- Icon prefix color: #1976d2
- Icon prefix padding: 8px left, 4px right
- Min-height: 38px (input)
- Required asterisk: Red (✱)

**Submit Section** (Bottom of form):
- Margin-top: 24px
- Text-align: center
- **Submit Button**:
  - Mat-raised-button color="primary"
  - Padding: 12px 48px
  - Font-size: 14px
  - Font-weight: 600
  - Border-radius: 8px
  - Icon: `save` (margin-right 8px)
  - Text: "Save Risk"

---

## Side Panel: Treatment Plan Action Items (When Editing Existing Risk)

### Panel Container
**Display**: Only when editing risk with ID  
**Width**: 45% (desktop), 100% (mobile)  
**Position**: Float right (desktop), below form (mobile)  
**Border-left**: 3px solid #667eea (desktop)  
**Border-top**: 3px solid #667eea (mobile)  
**Max-height**: None (desktop), 400px (mobile)

### Panel Header
**Background**: Same gradient as form header (`linear-gradient(135deg, #667eea 0%, #764ba2 100%)`)  
**Padding**: 10px 12px  
**Border-radius**: 8px 8px 0 0

**Title**: "Treatment Plan Action Items"
- Font-size: 15px
- Font-weight: 600
- Color: #ffffff

**Add Button** (Right-aligned):
- Icon: `add_circle` (20px)
- Color: #ffffff
- Size: 28×28px
- Click: Opens action item dialog (600px width)
- Tooltip: "Add Action Item"

### Action Items Table
**Font-size**: 11px (compact)  
**Layout**: Fixed table layout  
**Background**: #ffffff

**11 Columns**:
1. **S.No** - 5% (sequential)
2. **Description** - 20%
3. **Owner** - 12%
4. **Target Date** - 10% (dd-MMM-yyyy)
5. **Identified Date** - 10% (dd-MMM-yyyy)
6. **Status** - 10% (badge)
7. **Priority** - 9% (badge: Critical/High/Medium/Low)
8. **Updated By** - 8%
9. **Updated Date** - 10% (dd-MMM-yyyy)
10. **Edit** - 3% (edit icon, #00897b)
11. **Delete** - 3% (delete icon, #d32f2f)

**Priority Badge Colors**:
- **Critical**: #ffebee bg, #c62828 text
- **High**: #fff3e0 bg, #ef6c00 text
- **Medium**: #fff9c4 bg, #f57f17 text
- **Low**: #e8f5e9 bg, #388e3c text

**Table Header**:
- Background: #f5f7fa
- Font-size: 11px
- Font-weight: 600
- Padding: 6px 8px
- Border-bottom: 1px solid #e0e0e0

**Table Row Hover**:
- Background: rgba(103, 126, 234, 0.05)

---

## Interactions & Behaviors

### Hover States

**Table Row Hover**:
**Styling Specifications:**

Background color: rgba(103, 126, 234, 0.05). Subtle box shadow provides depth and elevation. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

**Action Icon Hover**:
**Styling Specifications:**

Background color: rgba(25, 118, 210, 0.1). Padding: 4px. Border radius: 50% for rounded corners. Hover effects provide visual feedback on interactive elements.

**Button Hover**:
**Styling Specifications:**

Subtle box shadow provides depth and elevation. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

**Help Link Hover**:
**Styling Specifications:**

Background color: rgba(25, 118, 210, 0.08). Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

### Click Behaviors

1. **Add Risk Button**: Opens edit form in add mode, clears all fields
2. **Edit Icon (Row)**: Loads risk data, opens edit form
3. **Delete Icon (Row)**: Opens confirmation dialog (400px width)
   - Title: "Confirm Deletion"
   - Message: "Are you sure you want to delete this risk?"
   - Buttons: Cancel (stroked) / Delete (raised, warn color)
4. **Info Icon (Row)**: Opens entity info popup (500px width, readonly data)
5. **View Treatment Plan**: Opens treatment plan popup (900px width, shows full strategy/contingency)
6. **Risk Matrix Link**: Opens `/assets/images/risk_map_legend.png` in new tab
7. **Risk Statement Guideline Button**: Opens dialog (1100px width, 80vh max-height) with guideline component
8. **Export Button**: Triggers Excel download via `ExportTOExcel()` function
9. **Filter Toggle**: Shows/hides advanced filter card with slide animation
10. **Portfolio/Project Selector**: Emits selected projects, reloads risk data
11. **Status Checkbox (Header)**: Filters table rows based on status
12. **Expansion Panel**: Smooth expand/collapse animation (300ms ease)

### Auto-Calculations

**Risk Rating Calculation**:
**TypeScript Implementation:**

### Form Validation

**Required Fields**:
- Portfolio, Project, Description, Impact, Identified Date, Owner, Likelihood, Consequences, Treatment Option, Treatment Strategy, Status

**Validation Rules**:
- Target Date must be > Identified Date
- Actual Date required when Status = Occurred or Closed
- Special character validation on text fields
- Max lengths enforced on textareas

**Error Display**:
- Opens warning popup dialog
- Lists all validation errors in bullet points
- Highlights invalid fields with red border

### Conditional Field Visibility

- **Actual Date field**: Enabled only when Status = "Occurred" or "Closed"
- **Type field**: Options depend on selected Category
- **Project field**: Options depend on selected Portfolio(s)
- **Treatment Plan Side Panel**: Visible only when editing existing risk (risk.id exists)

---

## Responsive Design

### Breakpoints

**Mobile**: max-width 768px

### Mobile Adjustments

**Styling Specifications:**

Gap between elements: 8px. Responsive breakpoints ensure proper display across device sizes.

---

## Accessibility (WCAG AA Compliance)

### Keyboard Navigation
- All interactive elements focusable via Tab
- Enter/Space to activate buttons
- Arrow keys for radio groups and dropdowns
- Escape to close dialogs

### Focus Indicators
**Styling Specifications:**

### ARIA Attributes
- `aria-label` on icon-only buttons
- `aria-required` on required form fields
- `aria-describedby` on fields with helper text
- `role="table"` and proper table semantics

### Color Contrast
- All text meets WCAG AA standards (4.5:1 minimum)
- Badge text on colored backgrounds: 600 weight for better readability
- Icons paired with text where possible

### Screen Reader Support
- Proper heading hierarchy (h1 for page title)
- Alt text on logo image
- Tooltip content accessible via aria-label
- Table headers properly associated with data

---

## Loading & Empty States

### Loading State
**Mat-progress-bar** (indeterminate):
- Color: Primary (#1976d2)
- Height: 4px
- Border-radius: 4px
- Margin-bottom: 16px
- Position: Below action bar, above table

### Empty State (No Risks)
**Container**:
- Background: #ffffff
- Padding: 40px 20px
- Border-radius: 8px
- Text-align: center
- Box-shadow: `0 2px 4px rgba(0, 0, 0, 0.1)`

**Icon**: `warning` (Material Icons)
- Size: 56×56px
- Color: #757575
- Opacity: 0.5

**Heading**: "No Risks Found"
- Font-size: 16px
- Font-weight: 600
- Color: #212121
- Margin: 16px 0 8px

**Message**: "No risks are defined for the projects assigned to you."
- Font-size: 12px
- Color: #757575

---

## Dialogs & Modals

### 1. Entity Info Popup
- **Width**: 500px
- **Component**: `<app-entity-base-info>`
- **Scroll Strategy**: NoopScrollStrategy
- **Content**: Readonly risk details

### 2. Treatment Plan Popup
- **Width**: 900px
- **Height**: Auto (max 90vh)
- **Content**: Full treatment strategy and contingency plan
- **Buttons**: Close

### 3. Risk Statement Guideline Dialog
- **Width**: 1100px
- **Max-height**: 80vh
- **Component**: `<app-risk-statement-guideline>`
- **Content**: Guidelines for writing effective risk statements
- **Buttons**: Close

### 4. Delete Confirmation Dialog
- **Width**: 400px
- **Title**: "Confirm Deletion"
- **Message**: "Are you sure you want to delete this risk?"
- **Buttons**: 
  - Cancel (stroked, default focus)
  - Delete (raised, warn color)

### 5. Add Action Item Dialog
- **Width**: 600px
- **Form Fields**: Description, Owner, Target Date, Priority, Status
- **Buttons**: Cancel / Save

### 6. Warning Popup (Validation Errors)
- **Width**: 500px
- **Component**: `<app-warning-popup>`
- **Content**: List of validation errors
- **Icon**: `warning` (Material Icons, amber)
- **Button**: OK

---

## Additional UI Elements

### Risk Rating Guide Link
**Location**: Table footer left side  
**Link**: `/assets/images/risk_rating.png` (new tab)  
**Icon**: `trending_up` (18px)  
**Text**: "Risk Rating Guide"  
**Styling**: Same as Risk Matrix link

### Export Functionality
- **Format**: Excel (.xlsx)
- **Content**: Current filtered table data (all columns)
- **Filename**: `Risks_Export_YYYY-MM-DD.xlsx`
- **Trigger**: Export button click
- **Library**: ExcelJS or similar

### Draft Row Highlighting
**Condition**: `risk.isDraft === true`  
**Styling**:
- Background: #fffacd (light yellow)
- Hover: #fff9b8 (slightly darker yellow)
- Border-left: 4px solid #fbc02d (yellow)

### Selected Row Highlighting
**Condition**: Row is selected (click to select)  
**Styling**:
- Background: `rgb(214, 214, 214)` (light gray)

---

## Implementation Notes

### Angular Material Modules Required
**TypeScript Implementation:**

### Custom Components Required
**TypeScript Implementation:**

### State Management
- **isLoading**: boolean (controls progress bar)
- **bShowFilter**: boolean (controls filter card visibility)
- **input**: RiskModelExt[] (table data)
- **EditRisk**: RiskModelExt (current editing risk)
- **dataSource**: MatTableDataSource<RiskModelExt>
- **AllChecked, PastDueChecked, DueClosureChecked**: boolean (filter states)

### Service Methods Expected
**TypeScript Implementation:**

RxJS observables manage asynchronous data streams.

### Animations
**Styling Specifications:**

Smooth transitions enhance user experience with animated state changes.

---

## Summary

This Risk Management Page provides a comprehensive, enterprise-grade interface for tracking project risks with:

- **15-column data table** with sorting, pagination, and advanced filtering
- **5-section accordion form** for detailed risk entry with auto-calculations
- **Color-coded RAG status** via 4px left border on table rows
- **4-tier risk level system** (Low/Moderate/High/Catastrophic) with distinct badge colors
- **10+ status types** with unique badge styling
- **Integrated treatment plan management** with side panel for action items
- **Role-based access control** for add/edit/delete operations
- **Responsive design** adapting to mobile/tablet/desktop
- **WCAG AA accessibility** compliance
- **Export to Excel** functionality
- **Modal dialogs** for guidelines, info viewing, and confirmations

The design emphasizes **clarity and efficiency** for risk management professionals, with visual indicators (colors, badges, gradients) enabling quick risk assessment and prioritization.

**Word Count**: ~5,200 words

---

**Usage**: Feed this entire prompt to any AI tool (ChatGPT, Claude, GitHub Copilot) to recreate the identical Risk Management Page without needing access to the original codebase. All specifications are self-contained and complete.
