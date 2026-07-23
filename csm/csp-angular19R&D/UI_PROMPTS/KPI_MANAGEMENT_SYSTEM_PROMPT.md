# KPI Management System - Complete UI Recreation Prompt
## Integrated Goals, Definitions & Details Pages

## System Overview
Create a comprehensive **KPI Management System** across three integrated pages for defining goals, configuring KPI definitions with targets, and tracking performance achievements in an enterprise Customer Success Management platform. This is a sophisticated workflow featuring tab-based navigation, multi-tier target configuration, star-based rating systems, auto-calculating status indicators, and CAPA (Corrective Action Plan) integration.

---

## Design System & Framework

### Technology Stack
- **Framework**: Angular 19+ (standalone components)  
- **UI Library**: Angular Material v19+ (Material Design 3)  
- **Icons**: Material Icons  
- **Styling**: SCSS with design tokens and CSS variables  
- **Charts**: Google Charts / Highcharts for trend visualization

### Design Philosophy
**Apple-inspired Modern Design** with clean layouts, soft backgrounds, rounded cards, subtle shadows, and clear color-coded status indicators. Emphasis on data density, clarity, and efficient workflows for performance tracking.

---

## Page 1: KPI Goals

### Layout Structure

**Split Layout**:
- **Left**: Table of existing goals (60% width)
- **Right**: Add/Edit goal form (40% width)
- **Responsive**: Stack vertically on mobile

### Color Palette
**Styling Specifications:**

### Goals Table

**Table Container**:
- Background: #FFFFFF
- Border-radius: 8px
- Box-shadow: `0 2px 4px rgba(0, 0, 0, 0.1)`
- Margin-right: 16px

**Table Structure**:
**Component Structure:**

Sorting functionality is enabled on table columns.

**Column Definitions** (6 columns):

| Column | Width | Type | Description |
|--------|-------|------|-------------|
| **No.** | 60px | badge | Sequential index with blue circular badge |
| **Goal Description** | 40% | text | Red if expired, bold |
| **Start Date** | 15% | badge | Light blue badge, dd-MMM-yyyy |
| **End Date** | 15% | badge | Light blue badge, dd-MMM-yyyy |
| **Display Order** | 12% | badge | Yellow badge with order number |
| **Actions** | 100px | icons | Edit (teal) / Delete (red) |

**Table Header Styling**:
**Styling Specifications:**

Background color: #5c6bc0. Text color: #FFFFFF. Font size: 12px. Font weight: 600.

**Row Styling**:
- Height: 48px
- Border-bottom: 1px solid #e0e0e0
- Alternate rows: Background #fafafa
- Hover: Background rgba(92, 107, 192, 0.05)

**Index Badge**:
**Styling Specifications:**

Background color: linear-gradient(135deg, #1976d2, #1565c0). Text color: #FFFFFF. Font size: 12px. Font weight: 600. Border radius: 50% for rounded corners. Flexbox layout enables flexible positioning and alignment.

**Expired Goal Indicator**:
**Styling Specifications:**

Text color: #dc2626. Font weight: 700.

**Date Badge**:
**Styling Specifications:**

Background color: #e3f2fd. Text color: #1976d2. Font size: 11px. Font weight: 500. Padding: 4px 10px. Border radius: 12px for rounded corners.

### Goal Form (Add/Edit)

**Form Container**:
- Background: #FFFFFF
- Border-radius: 8px
- Box-shadow: `0 2px 4px rgba(0, 0, 0, 0.1)`
- Padding: 20px

**Form Title**: "Add Goal" or "Edit Goal"  
- Font-size: 16px
- Font-weight: 600
- Color: #303c7a
- Margin-bottom: 20px

**Form Fields** (5 fields):

1. **Start Date** (mat-datepicker)
   - Label: "Start Date" (required ✱)
   - Appearance: outline
   - Icon suffix: `calendar_today`
   - Validation: Cannot be after End Date

2. **End Date** (mat-datepicker)
   - Label: "End Date" (required ✱)
   - Appearance: outline
   - Icon suffix: `calendar_today`
   - Validation: Cannot be before Start Date

3. **Description** (textarea)
   - Label: "Goal Description" (required ✱)
   - Appearance: outline
   - Rows: 3
   - Max-length: 255

4. **Display Order** (number input)
   - Label: "Display Order" (required ✱)
   - Appearance: outline
   - Min: 1
   - Width: 100px

5. **Internal Goal** (checkbox)
   - Label: "Internal Goal"
   - Font-size: 13px

**Form Buttons**:
- **Save**: 
  - Background: #303c7a
  - Color: #FFFFFF
  - Padding: 8px 24px
  - Icon: `save`
- **Clear**: 
  - Background: #e0e0e0
  - Color: #424242
  - Padding: 8px 20px
  - Icon: `clear`

### Empty State
**Display**: When no goals exist  
**Container**:
- Text-align: center
- Padding: 60px 20px

**Icon**: `flag` (72px, #9e9e9e, opacity 0.5)  
**Message**: "No goals are currently defined. Add a goal to get started."  
- Font-size: 14px
- Color: #757575

---

## Page 2: KPI Definitions

### Layout Structure

**Toolbar** (top):
- Goal selector dropdown
- Add KPI button (right)
- Refresh button

**Main Content**: Expandable table with KPI rows

### Color Palette
**Styling Specifications:**

### Toolbar

**Background**: White  
**Padding**: 12px 16px  
**Border-bottom**: 2px solid #e0e0e0  
**Display**: Flex, space-between

**Left Side**:
**Component Structure:**

This section uses Material form fields with outlined appearance. Dropdown select fields allow users to choose from predefined options. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties.
- Width: 400px
- Font-size: 13px

**Right Side** (gap 12px):
- **Refresh Button**: Icon `refresh`, tooltip "Refresh"
- **Add KPI Button**: Raised button, primary color, icon `add`, text "Add KPI"

### KPI Definitions Table

**Table Container**:
- Background: #FFFFFF
- Border-radius: 8px
- Box-shadow: `0 2px 4px rgba(0, 0, 0, 0.1)`

**Column Definitions** (9 columns):

| Column | Width | Type | Description |
|--------|-------|------|-------------|
| **No.** | 50px | badge | Circular gradient badge |
| **KPI Identifier** | 10% | text | Alphanumeric code |
| **Work Group / KPI Area** | 12% | text | Category/area |
| **KPI Name** | 18% | text | Red if expired |
| **Service Tower** | 12% | chips | Multi-select chips |
| **Support Window** | 10% | text | Support hours |
| **Frequency** | 10% | badge | Build/Monthly/Weekly/etc. |
| **UOM** | 10% | text | Unit of measurement |
| **Actions** | 100px | icons | Edit / Delete / Expand |

**Expandable Row** (Target Tiers):
- Displays 4-tier target cards
- Color-coded dot indicators
- Target values and descriptions
- Operator symbols (>=, <=, etc.)

**Tier Card Layout**:
**Styling Specifications:**

Background color: #f8f9fa. Text color: $tier-color. Font size: 18px. Font weight: 600. Padding: 12px. Border radius: 6px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px.

### KPI Definition Form (Add/Edit)

**Form Layout**: Grid with 2 columns  
**Modal/Inline**: Can be inline replacement or dialog

**Meta Fields** (Section 1):
1. KPI Identifier (text, required)
2. Work Group / KPI Area (text, required)
3. Base Measure Master KPI (select with search)
4. KPI Name (text, required)
5. Numerator (readonly, auto-filled)
6. Denominator (readonly, auto-filled)
7. Formula (readonly, auto-filled)
8. Abbreviation (text, required)
9. Global Category (select, grouped)
10. Support Window (text)
11. Priority (text)
12. Unit of Measurement (readonly)
13. Frequency (select: Build/Fortnightly/Monthly/Quarterly/Weekly)
14. Service Tower (multi-select)
15. Show in Customer Success Journey (checkbox)
16. Is SOW Commitment (checkbox)

**Target Configuration** (Section 2):

**Period Table**:
- Columns: Start Date, End Date, Actions (Edit/Delete)
- Add new period button
- Must align with goal date range

**Tier Configuration** (4 tiers per period):

For each tier (Low, Medium, High, Very High):
- **Operator**: Select (>=, <=, <, >, =)
- **Target**: Number input
- **Description**: Text input (optional)

**Visual Tier Display**:
**Implementation Details:**

This section implements the described functionality using generic. The implementation spans approximately 4 lines and follows the component structure outlined above.

---

## Page 3: KPI Details (Achievement Tracking)

### Layout Structure

**Apple-Inspired Dashboard**:
- Filter controls (month/year)
- Accordion panels per goal
- KPI cards within each goal
- Fixed save button at bottom

### Color Palette
**Styling Specifications:**

### Filter Panel

**Background**: White  
**Padding**: 16px  
**Border-radius**: 8px  
**Box-shadow**: `0 2px 4px rgba(0, 0, 0, 0.1)`  
**Margin-bottom**: 16px

**Contains**:
- **Month Dropdown**: Select month
- **Year Dropdown**: Select year
- **Exclusion Toggle**: Include/Exclude exclusions
- **Apply Button**: Primary button to load data

### Goal Accordion

**Each Panel**:
**Component Structure:**

Expandable panels are used to show/hide detailed information.

**Panel Header Styling**:
**Styling Specifications:**

Background color: linear-gradient(135deg, #667eea 0%, #764ba2 100%). Text color: #FFFFFF. Font weight: 600. Border radius: 8px for rounded corners.

### KPI Area Card

**Card Container**:
- Background: #FFFFFF
- Border: 1px solid #e0e0e0
- Border-radius: 8px
- Padding: 16px
- Margin-bottom: 12px

**Card Header**:
- **Area Name**: Font-size 14px, font-weight 600
- **KPI Count**: Badge with count

**KPI List**:
Each KPI displays:

1. **KPI Name & Metadata**
   - Name (font-weight 600)
   - Support Window (small badge)
   - UOM (small text)

2. **Target Pills** (4 pills for tiers)
**Styling Specifications:**

Background color: #ffebee. Text color: #c62828. Font size: 10px. Font weight: 600. Padding: 3px 10px. Border radius: 12px for rounded corners.

3. **Actual Value Input**
**Component Structure:**

This section uses Material form fields with outlined appearance. Two-way data binding connects form inputs to component properties.
- Width: 100px
- Aligned right

4. **Status Chip**
**Styling Specifications:**

Background color: #ffebee. Text color: #f60000. Font size: 11px. Font weight: 600. Padding: 4px 12px. Border radius: 12px for rounded corners. Gap between elements: 4px.

Icons by status:
- Not Met: `close` (red)
- Below Target: `trending_down` (orange)
- Met: `check_circle` (green)
- Exceeded: `trending_up` (blue)
- NA: `remove` (gray)

5. **CAPA Button** (if Not Met/Below)
**Component Structure:**

Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. Click handlers respond to user interactions with appropriate methods.
- Tooltip: "Corrective Action Plan Required"
- Color: #f60000

6. **Edit Actual Button**
**Component Structure:**

Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. Click handlers respond to user interactions with appropriate methods.
- Opens dialog for base measure entry or highlights

### Save Button (Fixed Bottom)

**Styling Specifications:**

Background color: linear-gradient(135deg, #1976d2, #1565c0). Text color: #FFFFFF. Font size: 14px. Font weight: 600. Padding: 12px 32px. Border radius: 24px for rounded corners. Subtle box shadow provides depth and elevation. Hover effects provide visual feedback on interactive elements.

---

## Auto-Calculation Logic

### KPI Status Calculation

**TypeScript Implementation:**

### Color Code by Tier Reached

Actual value determines which tier is achieved, which sets:
- Background color of status chip
- Text color
- Icon

---

## Integration Between Pages

### Flow:
1. **Goals Page**: Define goal periods (start/end dates)
2. **Definitions Page**: 
   - Select goal
   - Create KPIs with targets for each period within goal
   - Targets must be within goal date range
3. **Details Page**:
   - Select period (month/year)
   - Enter actuals for each KPI
   - System auto-calculates status based on targets
   - Trigger CAPA if Not Met

### Data Dependencies:
- Definitions page requires at least one goal
- Details page requires KPIs with targets for selected period
- CAPA workflow triggered from Details page

---

## Dialogs & Modals

### 1. Delete Confirmation (Goals/Definitions)
**Width**: 400px  
**Content**:
- Title: "Confirm Deletion"
- Message: "Are you sure you want to delete this [goal/KPI]?"
- Buttons: Cancel / Delete (warn)

### 2. CAPA Dialog (from Details)
**Width**: 900px  
**Height**: 600px  
**Content**: Full CAPA workflow (5 stages)
- Submission
- Review
- Customer Approval
- Implementation
- Verification

### 3. Base Measure Dialog
**Width**: 700px  
**Content**: Form for entering numerator/denominator values
**Purpose**: Calculate KPI actual from base measures

### 4. Highlights/NA Dialog
**Width**: 500px  
**Content**:
- Textarea for highlights/remarks
- Checkbox for "Mark as Not Applicable"
- Save button

---

## Responsive Design

### Mobile Adjustments
**Styling Specifications:**

Responsive breakpoints ensure proper display across device sizes.

---

## Accessibility

### Keyboard Navigation
- Tab through all form fields and buttons
- Enter/Space to activate buttons
- Arrow keys for dropdowns and accordions

### ARIA Attributes
- `aria-label` on icon-only buttons
- `aria-required` on required fields
- `aria-expanded` on accordion panels
- `role="table"` with proper semantics

### Color Contrast
- All status colors meet WCAG AA (4.5:1)
- Icons supplement color coding
- Text weights enhance readability

---

## Loading & Empty States

### Loading State (Details Page)
**Skeleton Cards**: Shimmer effect placeholders for KPIs  
**Progress Bar**: At top during data load

### Empty State (No KPIs)
**Icon**: `assessment` (64px, gray, opacity 0.5)  
**Message**: "No KPIs defined for this goal. Add KPIs in the Definitions page."  
**Button**: "Go to Definitions" (links to Definitions page)

---

## Implementation Notes

### Material Modules Required
**TypeScript Implementation:**

### Service Methods
**TypeScript Implementation:**

RxJS observables manage asynchronous data streams.

---

## Summary

This integrated KPI Management System provides:

- **3-page workflow**: Goals → Definitions → Details
- **Multi-tier target system**: 4-tier color-coded targets (Baseline/Acceptable/Good/Excellent)
- **Auto-calculating status**: Based on actual vs targets
- **CAPA integration**: For underperforming KPIs
- **Apple-inspired design**: Clean, modern, professional
- **Responsive layouts**: Mobile-optimized
- **Full accessibility**: WCAG AA compliant

**Total Word Count**: ~6,200 words

---

**Usage**: Feed this entire prompt to any AI tool to recreate the complete KPI Management System without needing access to the original codebase. All specifications are self-contained and complete.
