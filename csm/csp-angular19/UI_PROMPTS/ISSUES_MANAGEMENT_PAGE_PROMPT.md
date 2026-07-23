# Issues Management Page - Complete UI Recreation Prompt

## Page Overview
Create a comprehensive **Issues Management Page** for tracking and resolving project issues in an enterprise Customer Success Management platform. The page features a 17-column data table with severity classification (High/Medium/Low), status tracking, employee assignment with autocomplete search, and a detailed 7-section form with color-coded headers for adding/editing issues.

---

## Design System & Framework

### Technology Stack
- **Framework**: Angular 19+ (standalone components)  
- **UI Library**: Angular Material v19+ (Material Design 3)  
- **Icons**: Material Icons  
- **Styling**: SCSS with design tokens and CSS variables  
- **Theme**: Purple accent theme with teal/orange highlights

### Design Philosophy
**Material Design with Purple Accent Theme** - Clean, professional interface with color-coded severity indicators and status badges. The design uses a purple primary theme (#7b1fa2 / #6a1b9a) with distinct section headers in 5 different colors for visual organization.

---

## Layout Structure

### 1. Page Container
**Styling Specifications:**

Background color: #f5f7fa. Padding: 8px.

### 2. Unified Header Row (Top Navigation Bar)
**Background**: White (#ffffff)  
**Border-radius**: 8px  
**Box-shadow**: `0 2px 4px rgba(0, 0, 0, 0.08)`  
**Display**: Flex layout with 8px gap  
**Padding**: `6px 12px`  
**Min-height**: 50px

**Header Components (Left to Right)**:

1. **Back Button**
   - Size: 30×30px
   - Icon: `arrow_back` (Material Icons)
   - Icon size: 20px
   - Color: #616161 (default), #7b1fa2 (hover)
   - Background: Transparent (default), rgba(123, 31, 162, 0.08) (hover)
   - Border-radius: 6px
   - Transition: `all 0.2s ease`
   - Tooltip: "Back to Dashboard"

2. **Logo Placeholder**
   - Width: 35px, Height: 30px
   - Image: `assets/images/CustomerLogo.png`
   - Margin-right: 8px

3. **Portfolio/Project Selector**
   - Custom component: `<app-portfolio-project-selector>`
   - Height: 34px (compact)
   - Font-size: 13px
   - Multi-project selection support
   - Emits: `(projectsSelected)` event

4. **Status Filter Group**
   - Container gap: 10px
   - Label "Status:" (13px, font-weight 600, margin-right 6px)
   - **3 Checkboxes**:
     - ✓ **All** (checkbox-size: 16×16px, label 13px, default text color)
     - ✓ **Past Due Date** (color: #d32f2f, disabled when All checked)
     - ✓ **Due For Closure** (color: #f57c00, disabled when All checked)
   - Padding: 3px on checkbox wrapper

5. **Action Buttons (Right-aligned)**
   - Gap: 8px between buttons
   - **Export Button**: 
     - Stroked button, 34×34px
     - Icon: `file_download` (20px)
     - Border: 1px solid #e0e0e0
     - Color: #7b1fa2
     - Hover: Background rgba(123, 31, 162, 0.08)
     - Tooltip: "Export to Excel"
   
   - **Filter Toggle Button**:
     - Stroked button, 34×34px
     - Icon: `filter_list` (20px)
     - Border: 1px solid #e0e0e0
     - Color: #7b1fa2
     - Hover: Background rgba(123, 31, 162, 0.08)
     - Tooltip: "Show/Hide Filter"
   
   - **Add Issue Button**:
     - Raised button (mat-raised-button)
     - Background: `linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%)`
     - Color: #ffffff
     - Height: 34px
     - Padding: 0 16px
     - Icon: `add_circle_outline` (20px, margin-right 6px)
     - Text: "Add Issue" (13px, font-weight 600)
     - Border-radius: 6px
     - Box-shadow: `0 2px 4px rgba(123, 31, 162, 0.3)`
     - Hover: `translateY(-1px)`, enhanced shadow
     - Tooltip: "Add New Issue"

### 3. Advanced Filters Card (Collapsible)
**Display**: Shown/hidden via filter toggle button  
**Background**: White  
**Border-radius**: 8px  
**Padding**: `8px 12px`  
**Margin**: 6px 0  
**Border**: `1px solid #e0e0e0`  
**Box-shadow**: `0 1px 3px rgba(0, 0, 0, 0.05)`

**Contains**:
- `<app-table-filter>` component
- Dynamic column filtering
- Filter criteria builder

### 4. Action Bar
**Background**: White  
**Border-radius**: 8px  
**Box-shadow**: `0 2px 4px rgba(0, 0, 0, 0.08)`  
**Padding**: `8px 12px`  
**Margin-bottom**: 8px  
**Display**: Flex, space-between alignment

**Left Side**:
- **Page Title**: "Issues" 
  - Font-size: 20px
  - Font-weight: 700
  - Color: #212121
  - Letter-spacing: -0.5px

**Right Side**:
- **Issue Summary Stats** (Optional):
  - Total issues count
  - High severity count (red badge)
  - Open issues count (blue badge)

### 5. Loading State
- **Mat-progress-bar** (when isLoading = true)
- Mode: indeterminate
- Color: Purple (#7b1fa2)
- Height: 3px
- Border-radius: 2px
- Margin-bottom: 12px

### 6. Empty State (No Issues Found)
**Container**:
- Background: White
- Padding: 50px 20px
- Border-radius: 8px
- Text-align: center
- Box-shadow: `0 2px 4px rgba(0, 0, 0, 0.05)`

**Icon**: `inbox` (Material Icons)
- Size: 64×64px
- Color: #9e9e9e
- Opacity: 0.5

**Heading**: "No Issues Found"
- Font-size: 18px
- Font-weight: 600
- Color: #212121
- Margin: 16px 0 8px

**Message**: "No issues are defined for the selected projects."
- Font-size: 13px
- Color: #616161

### 7. Data Table Card
**Background**: White  
**Border-radius**: 8px  
**Box-shadow**: `0 2px 4px rgba(0, 0, 0, 0.08)`  
**Padding**: 0  
**Class**: `.table-container.mat-elevation-z2`

Contains Material table with sorting, pagination, and 17 columns.

---

## Color Palette

### Primary Colors
**Styling Specifications:**

### Background Colors
**Styling Specifications:**

Text color: #e0e0e0. Hover effects provide visual feedback on interactive elements.

### Text Colors
**Styling Specifications:**

### Severity Colors (3-Tier System)
**Styling Specifications:**

### Status Badge Colors
**Styling Specifications:**

### Form Section Header Colors (5 Colors)
**Styling Specifications:**

---

## Typography

### Font Families
**Styling Specifications:**

### Font Specifications
| Element | Size | Weight | Color | Letter Spacing |
|---------|------|--------|-------|----------------|
| **Page Title** | 20px | 700 | #212121 | -0.5px |
| **Form Title** | 18px | 700 | #ffffff | -0.3px |
| **Section Header** | 15px | 600 | #ffffff | normal |
| **Table Header** | 12px | 600 | #616161 | 0.3px |
| **Table Cell** | 11px | 400 | #212121 | normal |
| **Form Labels** | 13px | 600 | #424242 | normal |
| **Form Inputs** | 13px | 400 | #212121 | normal |
| **Badge Text** | 9px | 600 | varies | 0.5px (uppercase) |
| **Button Text** | 13px | 600 | varies | normal |
| **Helper Text** | 11px | 400 | #757575 | normal |
| **Empty State H2** | 18px | 600 | #212121 | normal |
| **Empty State P** | 13px | 400 | #616161 | normal |

---

## Spacing System

### Padding
**Styling Specifications:**

Padding: 8px.

### Margins
**Styling Specifications:**

### Gaps
**Styling Specifications:**

Gap between elements: 8px.

---

## Material Table - 17 Columns

### Table Configuration
**TypeScript Implementation:**

Data models define the structure and types for component data.

**MatPaginator**:
- Page sizes: [10, 20, 50, 100]
- Show first/last buttons: true
- Font-size: 12px

**MatSort**: Enabled on all columns (except actions)

### Column Definitions

#### 1. **No.** (index) - 40px width, centered
- **Type**: Sequential index number
- **Display**: Simple text
- **Styling**:
  - Font-size: 11px
  - Font-weight: 600
  - Color: #757575
- **Calculation**: `((pageIndex * pageSize) + rowIndex + 1)`

#### 2. **Portfolio** (portfoliO_NM) - 8% width
- **Header**: "Portfolio"
- **Sortable**: Yes
- **Data**: `issue.portfoliO_NM`
- **Styling**: 
  - Font-size: 11px
  - Text truncate with ellipsis
  - Tooltip: Full portfolio name

#### 3. **Subvertical** (subvertical) - 7% width
- **Header**: "Subvertical"
- **Sortable**: Yes
- **Data**: `issue.subvertical`
- **Styling**: Font-size 11px, text truncate

#### 4. **Project** (proJ_NM) - 9% width
- **Header**: "Project"
- **Sortable**: Yes
- **Data**: `issue.proJ_NM`
- **Styling**: 
  - Font-size: 11px
  - Text truncate with tooltip

#### 5. **Title** (title) - 12% width
- **Header**: "Title"
- **Sortable**: Yes
- **Data**: `issue.title`
- **Styling**: 
  - Font-size: 11px
  - Font-weight: 500
  - Text truncate with tooltip
  - Max-width: 180px

#### 6. **Description** (description) - 14% width
- **Header**: "Description"
- **Sortable**: Yes
- **Data**: `issue.description`
- **Styling**: 
  - Font-size: 11px
  - Max-width: 200px
  - Word-break: normal
  - Tooltip: Full description
  - Line-clamp: 2 lines

#### 7. **Issue Type** (issuE_TYPE) - 7% width
- **Header**: "Issue Type"
- **Sortable**: Yes
- **Data**: `issue.issuE_TYPE`
- **Values**: Technical / Process / Resource / Communication / Quality / Other
- **Styling**: 
  - Font-size: 11px
  - Text truncate

#### 8. **Severity** (severity) - 6% width
- **Header**: "Severity"
- **Sortable**: Yes
- **Display**: Color-coded badge
- **Values & Colors**:
  - **High**: Background #ffebee, Text #d32f2f, Icon `priority_high`
  - **Medium**: Background #fff3e0, Text #f57c00, Icon `remove`
  - **Low**: Background #e8f5e9, Text #388e3c, Icon `arrow_downward`
- **Badge Styling**:
  - Padding: 2px 8px
  - Border-radius: 8px
  - Font-size: 9px
  - Font-weight: 600
  - Text-transform: uppercase
  - Letter-spacing: 0.5px
  - Icon size: 12px (inline before text)

#### 9. **Action Plan** (actioN_PLAN) - 10% width
- **Header**: "Action Plan"
- **Sortable**: Yes
- **Data**: `issue.actioN_PLAN`
- **Styling**: 
  - Font-size: 11px
  - Max-width: 150px
  - Word-break: normal
  - Tooltip: Full action plan

#### 10. **Assigned To** (assigneD_TO) - 8% width
- **Header**: "Assigned To"
- **Sortable**: Yes (by employee name)
- **Display**: Employee name chip
- **Chip Styling**:
  - Background: `rgba(0, 137, 123, 0.1)` (light teal)
  - Color: #00796b
  - Padding: 3px 8px
  - Border-radius: 10px
  - Font-size: 10px
  - Font-weight: 500
  - Icon: `person` (12px, margin-right 4px)
- **Data**: Employee name lookup

#### 11. **Identified Date** (identifieD_DATE) - 7% width
- **Header**: "Identified"
- **Sortable**: Yes
- **Data**: `issue.identifieD_DATE | date:'dd-MMM-yyyy'`
- **Styling**: 
  - Font-size: 10px
  - Color: #757575

#### 12. **Target Date** (targeT_DATE) - 7% width
- **Header**: "Target Date"
- **Sortable**: Yes
- **Data**: `issue.targeT_DATE | date:'dd-MMM-yyyy'`
- **Styling**: 
  - Font-size: 10px
  - Color: #757575
- **Conditional Styling**: 
  - If past due and not closed: Red text (#d32f2f), font-weight 600

#### 13. **Resolved Date** (issuE_RESOLVED_DATE) - 7% width
- **Header**: "Resolved"
- **Sortable**: Yes
- **Data**: `issue.issuE_RESOLVED_DATE | date:'dd-MMM-yyyy'`
- **Styling**: 
  - Font-size: 10px
  - Color: #2e7d32 (green) if date exists
  - Empty if null

#### 14. **Status** (status) - 6% width
- **Header**: "Status"
- **Sortable**: Yes
- **Display**: Status badge with dynamic colors
- **Badge Colors**: See "Status Badge Colors" section
- **Values**: Open / In Progress / Resolved / Closed / On Hold / Cancelled
- **Badge Styling**: Same as severity badges

#### 15. **Info** (info) - 3% width, centered
- **Header**: (icon only)
- **Icon**: `info_outline` (18px)
- **Color**: #1976d2 (blue)
- **Click**: Opens readonly info dialog (500px width)
- **Hover**: 
  - Background: `rgba(25, 118, 210, 0.1)` (circular, 32px)
  - Color: #1565c0 (darker blue)
- **Tooltip**: "View Issue Details"

#### 16. **Edit** (edit) - 3% width, centered
- **Header**: (icon only)
- **Icon**: `edit` (18px)
- **Color**: #00897b (teal)
- **Click**: Opens edit form
- **Hover**: 
  - Background: `rgba(0, 137, 123, 0.1)` (circular, 32px)
  - Color: #00695c (darker teal)
- **Tooltip**: "Edit Issue"
- **Conditional**: Disabled if user lacks edit permission

#### 17. **Delete** (delete) - 3% width, centered
- **Header**: (icon only)
- **Icon**: `delete_outline` (18px)
- **Color**: #d32f2f (red)
- **Click**: Opens confirmation dialog
- **Hover**: 
  - Background: `rgba(211, 47, 47, 0.1)` (circular, 32px)
  - Color: #c62828 (darker red)
- **Tooltip**: "Delete Issue"
- **Conditional**: Disabled if user lacks delete permission

### Table Styling

**Table Header**:
**Styling Specifications:**

Background color: linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%). Text color: #616161. Font size: 12px. Font weight: 600. Padding: 12px 12px.

**Table Row**:
**Styling Specifications:**

Background color: rgba(123, 31, 162, 0.04). Subtle box shadow provides depth and elevation. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

**Table Cell**:
**Styling Specifications:**

Text color: #212121. Font size: 11px. Padding: 10px 12px.

---

## Add/Edit Form (7-Section Structure)

### Form Container
**Display**: Replaces table view when editing/adding  
**Background**: #f5f7fa (same as page)  
**Padding**: 12px  
**Max-width**: 1200px (centered)

### Form Header (Gradient Bar)
**Background**: Depends on mode
- Add mode: `linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%)` (purple)
- Edit mode: Same purple gradient

**Padding**: 12px 16px  
**Border-radius**: 8px 8px 0 0  
**Display**: Flex, space-between alignment

**Left Side**:
- **Title**: "Add Issue" or "Edit Issue"
  - Font-size: 18px
  - Font-weight: 700
  - Color: #ffffff
  - Letter-spacing: -0.3px

**Right Side (Action Buttons)**:
- **Save Button**:
  - Icon: `save` (20px)
  - Background: #ffffff
  - Color: #7b1fa2
  - Size: 34×34px
  - Border-radius: 50%
  - Hover: Scale 1.05, box-shadow
  - Tooltip: "Save Issue"
  
- **Cancel Button**:
  - Icon: `close` (20px)
  - Border: 2px solid #ffffff
  - Color: #ffffff
  - Size: 34×34px
  - Border-radius: 50%
  - Background: transparent
  - Hover: Background rgba(255, 255, 255, 0.15)
  - Tooltip: "Cancel"

### 7 Form Sections (Card-based, No Accordion)

**Section Base Styling**:
- Background: #ffffff
- Border: 1px solid #e0e0e0
- Border-radius: 8px
- Margin-bottom: 8px
- Box-shadow: `0 1px 3px rgba(0, 0, 0, 0.05)`

**Section Header** (Color-coded):
- Padding: 12px 16px
- Font-size: 15px
- Font-weight: 600
- Color: #ffffff
- Border-radius: 8px 8px 0 0
- Letter-spacing: normal

**Section Content**:
- Padding: 16px 20px
- Background: #ffffff

#### Section 1: Project Information
**Header Background**: `linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%)` (Purple)  
**Header Text**: "Project Information"

**Fields (2-column responsive layout)**:

1. **Portfolio** (mat-select, single)
   - Label: "Portfolio" (required ✱)
   - Appearance: outline
   - Options: Dynamic portfolio list
   - Icon prefix: `business` (18px, #7b1fa2)
   - Font-size: 13px

2. **Subvertical** (mat-select, single)
   - Label: "Subvertical"
   - Depends on portfolio selection
   - Icon prefix: `account_tree` (18px, #7b1fa2)

3. **Project** (mat-select, single)
   - Label: "Project" (required ✱)
   - Depends on portfolio/subvertical
   - Icon prefix: `folder` (18px, #7b1fa2)

#### Section 2: Issue Details
**Header Background**: `linear-gradient(135deg, #e53935 0%, #c62828 100%)` (Red)  
**Header Text**: "Issue Details"

**Fields**:

1. **Title** (mat-input, text)
   - Label: "Issue Title" (required ✱)
   - Max-length: 200 characters
   - Character counter: Shown
   - Icon prefix: `title` (18px, #e53935)
   - Placeholder: "Brief description of the issue"

2. **Description** (textarea, autosize)
   - Label: "Detailed Description" (required ✱)
   - Min-height: 80px
   - Max-height: 200px
   - Max-length: 1000 characters
   - Character counter: Shown
   - Vertical resize: enabled
   - Icon prefix: `description` (18px, #e53935)
   - Placeholder: "Provide comprehensive details about the issue"

3. **Issue Type** (mat-select, single)
   - Label: "Issue Type" (required ✱)
   - Options: Technical / Process / Resource / Communication / Quality / Other
   - Icon prefix: `category` (18px, #e53935)

#### Section 3: Classification & Assignment
**Header Background**: `linear-gradient(135deg, #00897b 0%, #00695c 100%)` (Teal)  
**Header Text**: "Classification & Assignment"

**Fields**:

1. **Severity** (mat-select, single)
   - Label: "Severity" (required ✱)
   - Options: High / Medium / Low
   - Option styling: Each option shows colored badge preview
   - Icon prefix: `warning` (18px, #00897b)

2. **Assigned To** (Custom employee search component)
   - Label: "Assigned To" (required ✱)
   - Component: `<app-employee-search>`
   - Autocomplete with search
   - Display: Employee photo (24px circle) + name
   - Icon prefix: `person` (18px, #00897b)

3. **Reporter** (mat-select or readonly)
   - Label: "Reported By"
   - Options: Employee list
   - Default: Current user
   - Icon prefix: `contact_mail` (18px, #00897b)

#### Section 4: Timeline & Dates
**Header Background**: `linear-gradient(135deg, #f57c00 0%, #e64a19 100%)` (Orange)  
**Header Text**: "Timeline & Dates"

**Fields (3-column layout)**:

1. **Identified Date** (mat-datepicker)
   - Label: "Identified Date" (required ✱)
   - Format: dd-MMM-yyyy
   - Default: Today
   - Icon suffix: `event` (18px)

2. **Target Date** (mat-datepicker)
   - Label: "Target Resolution Date" (required ✱)
   - Min-date: Identified Date + 1 day
   - Format: dd-MMM-yyyy
   - Icon suffix: `event` (18px)

3. **Resolved Date** (mat-datepicker)
   - Label: "Resolved Date"
   - Enabled only when Status = "Resolved" or "Closed"
   - Format: dd-MMM-yyyy
   - Icon suffix: `event_available` (18px)

#### Section 5: Resolution Plan
**Header Background**: `linear-gradient(135deg, #ffa000 0%, #ff8f00 100%)` (Amber)  
**Header Text**: "Resolution Plan"

**Fields**:

1. **Action Plan** (textarea, autosize)
   - Label: "Action Plan" (required ✱)
   - Min-height: 80px
   - Max-height: 200px
   - Max-length: 1000 characters
   - Character counter: Shown
   - Icon prefix: `assignment` (18px, #ffa000)
   - Placeholder: "Describe the plan to resolve this issue"

2. **Root Cause** (textarea, autosize)
   - Label: "Root Cause Analysis"
   - Min-height: 60px
   - Max-height: 150px
   - Icon prefix: `search` (18px, #ffa000)
   - Placeholder: "Identify the root cause (optional)"

#### Section 6: Status & Priority
**Header Background**: `linear-gradient(135deg, #1976d2 0%, #1565c0 100%)` (Blue)  
**Header Text**: "Status & Priority"

**Fields (2-column layout)**:

1. **Status** (mat-select, single)
   - Label: "Current Status" (required ✱)
   - Options: Open / In Progress / Resolved / Closed / On Hold / Cancelled
   - Option styling: Color-coded badges
   - Icon prefix: `flag` (18px, #1976d2)

2. **Priority** (mat-select, single)
   - Label: "Priority"
   - Options: Critical / High / Medium / Low
   - Option styling: Color-coded badges
   - Icon prefix: `low_priority` (18px, #1976d2)

#### Section 7: Additional Information
**Header Background**: `linear-gradient(135deg, #5e35b1 0%, #512da8 100%)` (Deep Purple)  
**Header Text**: "Additional Information"

**Fields**:

1. **Attachments** (File upload, optional)
   - Label: "Attachments"
   - Accept: .pdf, .doc, .docx, .xls, .xlsx, .png, .jpg
   - Max file size: 10MB
   - Multiple files: Yes
   - Icon prefix: `attach_file` (18px, #5e35b1)
   - Display: File chips with delete icon

2. **Comments** (textarea, autosize)
   - Label: "Additional Comments"
   - Min-height: 60px
   - Max-height: 150px
   - Icon prefix: `comment` (18px, #5e35b1)
   - Placeholder: "Any additional notes or comments"

### Field Styling

**Form Field Base**:
**Styling Specifications:**

Text color: #424242. Font size: 13px. Font weight: 600.

**Character Counter**:
**Styling Specifications:**

Text color: #757575. Font size: 11px.

**Required Asterisk**:
**Styling Specifications:**

Text color: #d32f2f. Font weight: 700.

### Form Layout

**2-Column Responsive Grid**:
**Styling Specifications:**

CSS Grid layout organizes content in a responsive grid structure. Gap between elements: 14px. Responsive breakpoints ensure proper display across device sizes.

### Submit Section (Bottom of Form)
**Container**:
- Padding: 20px
- Background: #ffffff
- Border-top: 1px solid #e0e0e0
- Border-radius: 0 0 8px 8px
- Text-align: center

**Submit Button**:
**Styling Specifications:**

Background color: linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%). Text color: #ffffff. Font size: 14px. Font weight: 600. Padding: 10px 40px. Border radius: 6px for rounded corners. Subtle box shadow provides depth and elevation. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

**Cancel Button** (Stroked):
**Styling Specifications:**

Background color: transparent. Text color: #7b1fa2. Font size: 14px. Font weight: 600. Padding: 8px 32px. Hover effects provide visual feedback on interactive elements.

---

## Interactions & Behaviors

### Hover States

**Table Row Hover**:
**Styling Specifications:**

Background color: rgba(123, 31, 162, 0.04). Subtle box shadow provides depth and elevation. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

**Action Icon Hover**:
**Styling Specifications:**

Background color: rgba(var(--icon-color-rgb), 0.1). Border radius: 50% for rounded corners. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

**Button Hover**:
**Styling Specifications:**

Subtle box shadow provides depth and elevation. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

### Click Behaviors

1. **Add Issue Button**: Clears form, opens in add mode, sets default values (current user as reporter, today as identified date)
2. **Edit Icon (Row)**: Loads issue data into form, opens in edit mode
3. **Delete Icon (Row)**: Opens confirmation dialog:
   - Width: 450px
   - Title: "Delete Issue?"
   - Message: "Are you sure you want to delete this issue? This action cannot be undone."
   - Buttons: Cancel (stroked) / Delete (raised, warn color)
4. **Info Icon (Row)**: Opens readonly issue details dialog (500px width)
5. **Export Button**: Triggers Excel download with current filtered data
6. **Filter Toggle**: Shows/hides advanced filter card with slide-down animation (200ms)
7. **Portfolio/Project Selector**: Filters table data, reloads issues for selected projects
8. **Status Checkbox (Header)**: Filters table rows (All / Past Due / Due for Closure)
9. **Save Button (Form)**: Validates form, saves issue, shows success/error snackbar, returns to table view
10. **Cancel Button (Form)**: Shows confirmation if form dirty, returns to table view

### Form Validation

**Required Fields**:
- Portfolio, Project, Title, Description, Issue Type, Severity, Assigned To, Identified Date, Target Date, Action Plan, Status

**Validation Rules**:
- **Title**: 3-200 characters
- **Description**: 10-1000 characters
- **Target Date**: Must be > Identified Date
- **Resolved Date**: Required when Status = "Resolved" or "Closed"
- **Resolved Date**: Must be >= Identified Date
- **File Attachments**: Max 10MB per file, allowed extensions only

**Error Display**:
- Inline errors below fields (red text, 11px)
- Field border turns red
- Error snackbar for form-level errors
- Scroll to first error field

### Conditional Field Behavior

- **Resolved Date field**: Enabled only when Status = "Resolved" or "Closed"
- **Subvertical field**: Options depend on selected Portfolio
- **Project field**: Options depend on selected Portfolio and Subvertical
- **Attachment display**: Shows file chips only when files uploaded

### Employee Search Component

**Component**: `<app-employee-search>`

**Features**:
- Autocomplete dropdown
- Search by name or email
- Display: Photo (24px circle) + Name + Email
- Minimum 2 characters to trigger search
- Loading spinner while searching
- "No results" message if no matches

---

## Responsive Design

### Breakpoints

**Desktop**: > 1200px (3-column date layout, full table)  
**Tablet**: 769px - 1200px (2-column form layout, horizontal scroll table)  
**Mobile**: ≤ 768px (1-column form layout, card view instead of table)

### Mobile Adjustments

**Styling Specifications:**

Background color: #ffffff. Text color: #212121. Font size: 14px. Font weight: 600. Padding: 12px. Border radius: 8px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 8px. Responsive breakpoints ensure proper display across device sizes.

---

## Accessibility (WCAG AA Compliance)

### Keyboard Navigation
- All buttons and links focusable via Tab
- Enter/Space to activate
- Arrow keys for dropdowns and radio groups
- Escape to close dialogs
- Focus trap in modal dialogs

### Focus Indicators
**Styling Specifications:**

Border radius: 4px for rounded corners.

### ARIA Attributes
- `aria-label` on icon-only buttons
- `aria-required="true"` on required fields
- `aria-describedby` for helper text
- `aria-invalid="true"` on error fields
- `role="alert"` on error messages
- `role="table"` with proper semantics

### Color Contrast
- All text meets WCAG AA (4.5:1 minimum)
- Badge text uses 600 weight on colored backgrounds
- Icons paired with text labels where possible
- Severity indicators use both color AND icon

### Screen Reader Support
- Proper heading hierarchy (h1 for page title, h2 for section headers)
- Alt text on logo
- Table headers properly associated
- Status changes announced
- Form validation errors announced

---

## Loading & Empty States

### Loading State
**Mat-progress-bar** (indeterminate):
**Styling Specifications:**

Background color: linear-gradient(90deg, #7b1fa2, #9c27b0, #7b1fa2).

### Empty State (No Issues)
See "Layout Structure > Empty State" section above.

---

## Dialogs & Modals

### 1. Issue Details Dialog (Info)
- **Width**: 500px
- **Max-height**: 80vh
- **Content**: Readonly issue details in labeled rows
- **Buttons**: Close

### 2. Delete Confirmation Dialog
- **Width**: 450px
- **Panel Class**: `delete-confirmation-dialog`
- **Title**: "Delete Issue?"
- **Icon**: `warning` (48px, #f57c00)
- **Message**: "Are you sure you want to delete this issue? This action cannot be undone."
- **Buttons**:
  - Cancel: Stroked, default focus
  - Delete: Raised, warn color (#d32f2f)

### 3. Unsaved Changes Confirmation
- **Width**: 400px
- **Triggered**: When canceling form with unsaved changes
- **Title**: "Discard Changes?"
- **Message**: "You have unsaved changes. Are you sure you want to discard them?"
- **Buttons**:
  - Stay: Stroked, default focus
  - Discard: Raised, warn color

---

## Snackbar Notifications

### Success Message
**TypeScript Implementation:**

Data models define the structure and types for component data.

**Styling**:
**Styling Specifications:**

Background color: #4caf50. Text color: #ffffff. Font weight: 500.

### Error Message
**TypeScript Implementation:**

Data models define the structure and types for component data.

**Styling**:
**Styling Specifications:**

Background color: #f44336. Text color: #ffffff. Font weight: 500.

---

## Additional Features

### Export to Excel
- **Format**: .xlsx
- **Filename**: `Issues_Export_YYYY-MM-DD.xlsx`
- **Columns**: All 17 columns (except action icons)
- **Data**: Current filtered view
- **Library**: ExcelJS or XLSX.js
- **Formatting**: Headers bold, severity/status color-coded

### Character Counter
**Display**: Bottom-right of textareas
**Styling Specifications:**

Text color: #757575. Font size: 11px.

### File Attachment Chips
**Styling Specifications:**

Background color: #ede7f6. Text color: #7b1fa2. Font size: 12px. Padding: 4px 10px 4px 8px. Margin: 4px 4px 4px 0. Border radius: 16px for rounded corners. Hover effects provide visual feedback on interactive elements.

---

## Implementation Notes

### Angular Material Modules Required
**TypeScript Implementation:**

### Custom Components Required
**TypeScript Implementation:**

### State Management
- **isLoading**: boolean
- **bShowFilter**: boolean
- **input**: IssueModelExt[]
- **EditIssue**: IssueModelExt
- **dataSource**: MatTableDataSource<IssueModelExt>
- **AllChecked, PastDueChecked, DueClosureChecked**: boolean

---

## Summary

This Issues Management Page provides a comprehensive interface for enterprise issue tracking with:

- **17-column data table** with sorting, pagination, and filtering
- **7-section form** with color-coded headers (5 gradient colors)
- **3-tier severity system** (High/Medium/Low) with color-coded badges and icons
- **6 status types** with distinct badge colors
- **Employee search** with autocomplete for assignment
- **File attachment** support with chips
- **Character counters** on textareas
- **Responsive design** with card view on mobile
- **Export to Excel** functionality
- **WCAG AA accessibility** compliance

The purple accent theme with teal and orange highlights creates a distinct visual identity while maintaining professional aesthetics.

**Word Count**: ~5,200 words

---

**Usage**: Feed this entire prompt to any AI tool (ChatGPT, Claude, GitHub Copilot) to recreate the identical Issues Management Page without needing access to the original codebase.
