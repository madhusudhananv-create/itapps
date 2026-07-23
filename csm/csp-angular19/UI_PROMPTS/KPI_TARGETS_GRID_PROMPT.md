# KPI & Targets Grid Page - Complete UI Recreation Prompt

## Page Overview
Create a modernized KPI & Targets grid with legacy-inspired light blue headers, color-coded tier borders, Material Design icons, and responsive layout for managing and viewing KPI definitions and target values.

---

## Layout Structure

### Main Container
- **Background**: ##F5F7FA (light gray)
- **Padding**: 16px
- **Min-height**: 100vh
- **Font-family**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif

---

## Page Header
**Background**: White
**Padding**: 16px 20px
**Border-radius**: 12px
**Box-shadow**: 0 2px 4px rgba(0, 0, 0, 0.1)
**Margin-bottom**: 16px

### Header Layout
**Display**: Horizontal flex, space-between, align-center

**Left Side**:
- **Back Button**: 36×36px circle, Material icon "arrow_back", color #475569
- **Page Title**: "Set KPI & Targets" (20px, font-weight 600, color #1D1D1F)

**Right Side**:
- **Add New KPI Button**: Primary button, gradient background (#1976d2 → #1565c0)
  - Icon: Material icon "add", 20px
  - Text: "Add New KPI"
  - Height: 40px
  - Padding: 10px 20px
  - Border-radius: 8px
  - Font-weight: 600

---

## Filter Section
**Background**: White
**Border-radius**: 12px
**Padding**: 16px
**Margin-bottom**: 16px
**Box-shadow**: 0 2px 4px rgba(0, 0, 0, 0.1)

**Layout**: Horizontal flex, gap 12px, flex-wrap

**Filters**:
1. **Service Tower Dropdown**: Multi-select, width 250px
2. **Work Group Dropdown**: Multi-select, width 200px
3. **Priority Filter**: Multi-select, width 150px
4. **Status Filter**: Multi-select, width 150px
5. **Search Input**: Text input with search icon, width 300px

**Apply/Clear Buttons**:
- **Gap**: 8px
- **Height**: 36px
- **Border-radius**: 6px

---

## Data Table (Material Table)
**Background**: White
**Border-radius**: 12px
**Box-shadow**: 0 2px 8px rgba(0, 0, 0, 0.08)
**Overflow**: hidden

### Table Specifications
**Width**: 100%
**Font-size**: 12px
**Border-collapse**: collapse
**Table-layout**: fixed

### Header Row
**Background**: #e8f4fd (light blue)
**Height**: 48px
**Position**: sticky, top 0
**Z-index**: 10

**Header Cell Styling**:
- **Background**: #e8f4fd !important
- **Color**: #1d1d1f (dark text, NOT white)
- **Font-weight**: 600
- **Font-size**: 13px
- **Text-transform**: none (normal case, NOT ALL-CAPS)
- **Padding**: 10px 8px
- **Text-align**: left
- **Border**: none
- **Line-height**: 1.4

### Tier Column Styling (Special Headers)
**Each tier group has colored top border only**:

**Tier Group Structure**: 3 columns per tier
- Description column
- Operator column  
- Value column

**All tier columns**:
- **Background**: #e8f4fd (light blue background)
- **Color**: #1d1d1f (dark text)
- **Border-top**: 3px solid (color varies by tier)

**Tier Colors** (top border only):
1. **Tier 1 (Red)**: Border-top #e53935
2. **Tier 2 (Orange)**: Border-top #fb8c00
3. **Tier 3 (Green)**: Border-top #43a047
4. **Tier 4 (Blue)**: Border-top #1e88e5

### Column Definitions & Widths

| Column | Min Width | Content Type |
|--------|-----------|--------------|
| **No.** | 40px | Sequential number |
| **KPI Identifier** | 140px | Text (unique ID) |
| **Work Group / KPI Area** | 110px | Dropdown select |
| **KPI Name** | 180px | Text (multi-line, max 2 lines) |
| **Service Tower** | 110px | Dropdown select |
| **Support Window** | 100px | Text |
| **Priority** | 80px | Dropdown (Critical/High/Medium/Low) |
| **Frequency** | 90px | Dropdown (Monthly/Quarterly/etc) |
| **Tier 1 - Description** | 120px | Text |
| **Tier 1 - Operator** | 90px | Dropdown (≥, >, =, <, ≤) |
| **Tier 1 - Value** | 80px | Number input |
| **Tier 2 - Description** | 120px | Text |
| **Tier 2 - Operator** | 90px | Dropdown |
| **Tier 2 - Value** | 80px | Number input |
| **Tier 3 - Description** | 120px | Text |
| **Tier 3 - Operator** | 90px | Dropdown |
| **Tier 3 - Value** | 80px | Number input |
| **Tier 4 - Description** | 120px | Text |
| **Tier 4 - Operator** | 90px | Dropdown |
| **Tier 4 - Value** | 80px | Number input |
| **Unit of Measurement** | 80px | Text (%, Number, etc) |
| **Actions** | 100px | Icon buttons (sticky right) |

### KPI Name Column (Special Handling)
**Problem**: Long names wrapping into 6+ lines  
**Solution**:
- **Min-width**: 180px
- **Max-width**: 280px
- **Word-break**: break-word
- **Line-height**: 1.4
- **Max-lines**: 2 (with text-overflow ellipsis on 3rd line)
- **Padding**: 8px
- **Vertical-align**: top
- **Tooltip**: Full KPI name on hover

### Data Row Styling
**Height**: Auto (min 52px)
**Background**: White
**Border-bottom**: 1px solid rgba(0, 0, 0, 0.06)
**Transition**: all 0.2s ease

**Hover State**:
- **Background**: rgba(25, 118, 210, 0.04)
- **Box-shadow**: 0 1px 3px rgba(0, 0, 0, 0.08)

**Cell Padding**: 8px 8px
**Cell Font-size**: 12px
**Cell Color**: #212121
**Vertical-align**: middle

### No. Column (Index)
**Text-align**: center
**Font-weight**: 600
**Color**: #1976d2
**Background**: Linear gradient (to right, #E3F2FD, transparent)

### Priority Cell
**Display**: Dropdown or badge

**Priority Badges** (read-only mode):
- **Critical**: Background #FFEBEE, Color #C62828, Icon "error"
- **High**: Background #FFF3E0, Color #E65100, Icon "warning"
- **Medium**: Background #FFF9C4, Color #F57F17, Icon "info"
- **Low**: Background #E8F5E9, Color #2E7D32, Icon "check_circle"

**Badge Styling**:
- **Padding**: 4px 8px
- **Border-radius**: 10px
- **Font-size**: 11px
- **Font-weight**: 600
- **Display**: inline-flex, align-center
- **Gap**: 4px

### Dropdown Cells (Editable)
**Material Select**:
- **Appearance**: Outline
- **Height**: 36px
- **Font-size**: 12px
- **Padding**: 4px 8px
- **Border-radius**: 4px
- **Border**: 1px solid #D1D9E0
- **Focus**: Blue border (#1976d2), glow shadow

### Input Cells (Numbers, Text)
**Material Input**:
- **Height**: 36px
- **Font-size**: 12px
- **Padding**: 6px 8px
- **Border-radius**: 4px
- **Border**: 1px solid #D1D9E0
- **Focus**: Blue border (#1976d2)

### Actions Column (Sticky Right)
**Position**: sticky, right 0
**Background**: White (matches row background)
**Box-shadow**: -2px 0 4px rgba(0, 0, 0, 0.05) (left border shadow)
**Z-index**: 5
**Text-align**: center

**Button Group**:
- **Layout**: Horizontal flex, gap 4px, justify center

**Edit Button**:
- **Type**: Icon button (mat-icon-button)
- **Icon**: Material icon "edit", 18px
- **Color**: #1976d2 (blue)
- **Size**: 32×32px
- **Border-radius**: 50%
- **Hover**: Background rgba(25, 118, 210, 0.08), scale 1.1

**Delete Button**:
- **Type**: Icon button
- **Icon**: Material icon "delete", 18px
- **Color**: #d32f2f (red)
- **Size**: 32×32px
- **Border-radius**: 50%
- **Hover**: Background rgba(211, 47, 47, 0.08), scale 1.1

---

## Pagination
**Position**: Below table
**Background**: White
**Padding**: 12px 16px
**Border-top**: 1px solid rgba(0, 0, 0, 0.06)

**Material Paginator**:
- **Page sizes**: [10, 25, 50, 100]
- **Default**: 25
- **Style**: Material Design standard

---

## Add/Edit Modal Dialog

### Dialog Container
**Width**: 800px (desktop), 95vw (mobile)
**Max-height**: 90vh
**Border-radius**: 12px
**Box-shadow**: 0 8px 32px rgba(0, 0, 0, 0.12)
**Background**: White

### Dialog Header
**Padding**: 20px 24px
**Border-bottom**: 1px solid #E5E7EB
**Background**: #FAFBFC

**Layout**: Horizontal flex, space-between

**Left**:
- **Icon**: Material icon "add_circle" or "edit", 24px, color #1976d2
- **Title**: "Add New KPI" or "Edit KPI" (18px, font-weight 600)

**Right**:
- **Close Button**: Icon button with "close" icon, 36×36px

### Dialog Body
**Padding**: 24px
**Max-height**: calc(90vh - 160px)
**Overflow-y**: auto

**Form Layout**: Grid 2 columns (1 column on mobile), gap 16px

**Form Fields** (Material Form Fields):
- **Appearance**: Outline
- **Label**: 12px, font-weight 600, color #64748B
- **Input Height**: 42px
- **Border-radius**: 8px
- **Required fields**: Red asterisk

**Field Groups**:

**Basic Information**:
1. KPI Identifier (required, text input)
2. KPI Name (required, textarea, rows 2)
3. Work Group / KPI Area (required, dropdown)
4. Service Tower (required, dropdown)
5. Priority (required, dropdown)
6. Frequency (required, dropdown)
7. Support Window (optional, text input)
8. Unit of Measurement (required, text input)

**Target Values** (Expandable Sections):

**Each Tier Section**:
- **Header**: "Tier [1-4] - [Color Name]" (expandable)
- **Border-left**: 4px solid (tier color)
- **Padding**: 16px
- **Background**: Light tint of tier color
- **Fields**: Description, Operator, Value (3 fields per tier)

### Dialog Footer
**Padding**: 16px 24px
**Border-top**: 1px solid #E5E7EB
**Background**: #FAFBFC

**Button Layout**: Horizontal flex, justify-end, gap 12px

**Cancel Button**:
- **Background**: #F5F5F5
- **Color**: #1D1D1F
- **Height**: 40px
- **Padding**: 10px 20px

**Save Button**:
- **Background**: Linear gradient (#1976d2 → #1565c0)
- **Color**: White
- **Height**: 40px
- **Padding**: 10px 24px
- **Icon**: Material icon "save"
- **Disabled**: Gray background, cursor not-allowed

---

## Empty State
**Padding**: 80px 20px
**Text-align**: center

**Components**:
- **Icon**: Material icon "grid_view", 72px, color #E0E0E0
- **Title**: "No KPIs Defined" (20px, font-weight 600, color #1D1D1F)
- **Description**: "Click 'Add New KPI' to create your first KPI definition" (14px, color #6E6E73)
- **Action Button**: "Add New KPI" button (same as header button)

---

## Loading State
**Type**: Material progress bar or spinner
**Color**: #1976d2
**Position**: Top of table or center
**Backdrop**: Semi-transparent overlay

---

## Color Palette

### Primary Colors
- **Blue**: #1976d2
- **Dark Blue**: #1565c0
- **Light Blue Background**: #e8f4fd

### Tier Colors
- **Tier 1 (Red)**: #e53935
- **Tier 2 (Orange)**: #fb8c00
- **Tier 3 (Green)**: #43a047
- **Tier 4 (Blue)**: #1e88e5

### Priority Colors
- **Critical**: #C62828 (red)
- **High**: #E65100 (orange)
- **Medium**: #F57F17 (yellow)
- **Low**: #2E7D32 (green)

### Background Colors
- **Page**: #F5F7FA
- **Card**: #FFFFFF
- **Header**: #e8f4fd
- **Hover**: rgba(25, 118, 210, 0.04)

### Text Colors
- **Primary**: #1d1d1f (dark, NOT white on headers)
- **Secondary**: #475569
- **Tertiary**: #94A3B8

### Border Colors
- **Light**: #E5E7EB
- **Medium**: #D1D9E0
- **Focus**: #1976d2

---

## Typography

### Font Stack
`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

### Font Sizes
- **Page Title**: 20px
- **Dialog Title**: 18px
- **Table Headers**: 13px
- **Table Cells**: 12px
- **Labels**: 12px
- **Badges**: 11px

### Font Weights
- **Headers**: 600
- **Body**: 400
- **Labels**: 600
- **Badges**: 600

---

## Spacing System

### Padding
- **Page**: 16px
- **Cards**: 16-20px
- **Table Cells**: 8px
- **Dialog**: 20-24px

### Margin
- **Between Sections**: 16px
- **Between Buttons**: 8-12px

---

## Responsive Design

### Desktop (>1200px)
- **Table**: Horizontal scroll if needed
- **All columns visible**: Maintain all columns

### Tablet (768px - 1199px)
- **Table**: Horizontal scroll enabled
- **Sticky columns**: First column (No/KPI Name), last column (Actions)

### Mobile (≤767px)
- **Table**: Card-based view (transform to stacked cards)
- **Each row**: Becomes a card with label-value pairs
- **Actions**: Bottom of each card

---

## Accessibility

### ARIA Labels
- All icon buttons: aria-label
- Table headers: Proper scope
- Form fields: Associated labels
- Dialogs: aria-modal, role="dialog"

### Keyboard Navigation
- Tab order: Logical flow
- Table: Arrow key navigation
- Dropdowns: Type-ahead search
- Escape: Close dialogs

### Color Contrast
- Text on light blue header: Dark text (#1d1d1f) for 7:1 contrast
- All text meets WCAG AA (4.5:1)
- Interactive elements distinguishable

---

## Key Differences from Modern Design
This design intentionally maintains **legacy-inspired aesthetics** with modern implementation:

1. **Light blue headers with dark text** - NOT gradient, NOT white text
2. **Normal case headers** - NOT all uppercased
3. **Simple tier borders** - Top border only, NOT full card styling
4. **Traditional table layout** - NOT card-based expansion panels
5. **Material icons** - REPLACING Font Awesome icons
6. **Sticky actions column** - Modern UX improvement

---

## Implementation Notes

1. Use Angular Material v19+ table component
2. Implement virtual scrolling for >100 rows
3. Use Material form fields with outline appearance
4. Implement proper validation (required fields, number ranges)
5. Add confirmation dialog for delete operations
6. Implement inline editing (optional)
7. Add export to Excel functionality
8. Use Material dialog for add/edit forms
9. Implement proper error handling
10. Add undo/redo for edits (optional)
11. Responsive card view for mobile

---

This prompt provides complete specifications to recreate the KPI & Targets Grid page with legacy-inspired light blue headers, modern Material Design components, and proper tier color coding.
