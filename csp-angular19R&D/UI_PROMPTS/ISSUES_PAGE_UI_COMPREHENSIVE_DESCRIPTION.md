# Issues Management Page - Comprehensive UI Description

## 1. LAYOUT STRUCTURE

### 1.1 Page Container
- **Container**: `.page-container`
  - Padding: `8px 16px`
  - Background: `#fafafa` (gray-50)
  - Min-height: `calc(100vh - 64px)`
  - Font family: `'Roboto', 'Segoe UI', Tahoma, sans-serif`

### 1.2 Main Sections (Read-Only View)
1. **Unified Header** - Logo, back button, portfolio/project selector, status filters, action buttons
2. **Advanced Filters Card** - Collapsible table filter component
3. **Action Bar** - Page title and action buttons area
4. **Progress Bar** - Loading indicator
5. **Empty/Loading States** - No data or loading messages
6. **Data Table Card** - Main issues table with pagination

### 1.3 Edit Form Structure
1. **Form Header** - Purple gradient with title and action buttons
2. **Basic Information Card** - Project, title, description, reported by
3. **Impact Assessment Card** - Impact summary, business impact, service impact
4. **Issue Details Card** - Location, category, severity, source
5. **Root Cause & Action Plan Card** - Root cause analysis and action steps
6. **Assignment & Timeline Card** - Assigned to, dates, status, comments
7. **Form Footer** - Cancel and Save buttons

---

## 2. COLOR PALETTE

### 2.1 Primary Colors
**Styling Specifications:**

Text color: #1976d2
Primary Light: #e3f2fd
Accent Color: #00897b
Accent Light: #e0f2f1
Warning Color: #f44336
Warning Light: #ffebee
Success Color: #4caf50
Success Light: #e8f5e9.

### 2.2 Gray Scale
**Styling Specifications:**

### 2.3 Text Colors
**Styling Specifications:**

### 2.4 Special Colors
**Styling Specifications:**

Background color: #f3e5f5 (light purple)
Table Row Hover: #e3f2fd (light blue)
Form Purple Theme: #7b1fa2 (primary), #6a1b9a (dark)
Orange (Medium Severity): #f57c00, #ff9800
Red (High Severity): #d32f2f, #c62828. Hover effects provide visual feedback on interactive elements.

### 2.5 Severity Colors
**Styling Specifications:**

Background color: #ffebee
  - Text: #d32f2f
  - Border: #f44336

Medium:
  - Background: #fff3e0
  - Text: #f57c00
  - Border: #ff9800

Low:
  - Background: #e8f5e9
  - Text: #388e3c
  - Border: #4caf50.

### 2.6 Status Colors
**Styling Specifications:**

Background color: #e3f2fd
  - Text: #1976d2

In-Progress:
  - Background: #e3f2fd
  - Text: #1976d2

Closed:
  - Background: #e8f5e9
  - Text: #388e3c

On Hold:
  - Background: #fff3e0
  - Text: #f57c00.

### 2.7 Type Badge Colors
**Styling Specifications:**

Background color: #e0f2f1
  - Text: #00897b.

### 2.8 Owner Chip Colors
**Styling Specifications:**

Background color: rgba(103, 126, 234, 0.12)
  - Text: #5568d3.

### 2.9 Card Header Gradients
**Styling Specifications:**

Text color: #7b1fa2

Impact Assessment:
  - Gradient: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)
  - Icon Color: #c62828

Issue Details:
  - Gradient: linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)
  - Icon Color: #00897b

Root Cause & Action Plan:
  - Gradient: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)
  - Icon Color: #ef6c00

Assignment & Timeline:
  - Gradient: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)
  - Icon Color: #f9a825.

---

## 3. TYPOGRAPHY

### 3.1 Font Families
**Styling Specifications:**

### 3.2 Font Sizes
**Styling Specifications:**

Font weight: 500
Table Font: 11px (cells), 12px (headers)
Date Cells: 9px
Form Labels: 13px, font-weight: 600
Form Inputs: 12px - 13px
Form Headers (h2): 1.25rem (20px), font-weight: 600
Card Headers (h3): 1rem (16px), font-weight: 600
Badges: 9px, font-weight: 600
Status Filter Labels: 13px, font-weight: 500
Button Text: 0.85rem - 0.9rem
Index Badge: 9px, font-weight: 600
Info Icon: 18px.

### 3.3 Letter Spacing
**Styling Specifications:**

### 3.4 Line Heights
**Styling Specifications:**

---

## 4. SPACING

### 4.1 Padding
**Styling Specifications:**

Padding: 6px 12px - 8px 24px
Badge Padding: 2px 6px. Gap between elements: 16px
Form Row Margin Bottom: 12px
Radio Group Container: 12px 16px
Assignment Display: 16px
Form Footer: 16px
Table Cell: 8px 6px (vertical) | 6px 6px (header)
Index Column: 6px 2px
Table Cell (description): 8px 6px
Button Padding: 6px 12px - 8px 24px
Badge Padding: 2px 6px.

### 4.2 Margins
**Styling Specifications:**

### 4.3 Gaps
**Styling Specifications:**

Gap between elements: none (flex alignment)
Status Group Gap: 4px
Header Actions Gap: 8px
Filters Section Gap: 12px
Filter Group Gap: 6px - 12px
Checkbox Group Gap: 12px
Action Bar Right Gap: 12px
Form Gap: 16px
Form Row Gap: 16px
Form Title Section Gap: 10px
Form Actions Header Gap: 10px
Form Footer Gap: 12px
Radio Group Gap: 16px
Assignment Display Gap: 12px
Suffix Group Gap: 4px.

### 4.4 Border Radius
**Styling Specifications:**

---

## 5. MATERIAL COMPONENTS

### 5.1 Components Used
- `MatTableModule` - Data table
- `MatPaginatorModule` - Table pagination
- `MatSortModule` - Column sorting
- `MatDialogModule` - Modal dialogs
- `MatFormFieldModule` - Form fields (outline appearance)
- `MatInputModule` - Text inputs
- `MatSelectModule` - Dropdowns
- `MatDatepickerModule` - Date pickers
- `MatNativeDateModule` - Date adapter
- `MatCheckboxModule` - Checkboxes
- `MatRadioModule` - Radio buttons
- `MatIconModule` - Icons
- `MatProgressBarModule` - Loading bar
- `MatProgressSpinnerModule` - Loading spinner
- `MatButtonModule` - Buttons (raised, stroked)
- `MatTooltipModule` - Tooltips

### 5.2 Custom Components
- `PortfolioProjectSelectorComponent` - Portfolio/project filter
- `TableFilterComponent` - Advanced filtering
- `EmployeeSearchComponent` - Employee autocomplete
- `EntityBaseInfoComponent` - Info modal
- `WarningPopupComponent` - Alert/confirmation dialogs

### 5.3 Form Field Configuration
**Styling Specifications:**

Background color: #fafafa
Border Radius: 6px
Min Height (standard): 44px
Min Height (compact): 38px
Border Color: rgba(0, 0, 0, 0.12)
Focus Border Color: #7b1fa2
Border Width (focused): 2px
Icon Prefix Color: #7b1fa2
Label Color: #333
Label Font Weight: 600
Label Font Size: 13px. Text color: rgba(0, 0, 0, 0.12)
Focus Border Color: #7b1fa2
Border Width (focused): 2px
Icon Prefix Color: #7b1fa2
Label Color: #333
Label Font Weight: 600
Label Font Size: 13px.

---

## 6. TABLE COLUMNS

### 6.1 Complete Column List
**TypeScript Implementation:**

### 6.2 Column Details

| Column | Header | Width | Data Type | Special Styling |
|--------|--------|-------|-----------|----------------|
| index | No. | 36px | Number | Red circle badge, center-aligned |
| portfoliO_NM | Portfolio | 7% | String | Word-break enabled, truncate with tooltip |
| subvertical | Subvertical | 6% | String | Word-break enabled, truncate with tooltip |
| proJ_NM | Project | 7% | String | Word-break enabled, truncate with tooltip |
| title | Title | 10% | String | Word-break enabled, description-cell class |
| description | Description | 12% | String | Word-break enabled, description-cell class |
| issuE_TYPE | Type | 6% | String | Type badge (teal background) |
| severity | Severity | 5% | String | Color-coded badge (High/Medium/Low) |
| actioN_PLAN | Action Plan | 10% | String | Word-break enabled, description-cell class |
| assigneD_TO | Assigned To | 7% | String | Owner chip (purple background) |
| identifieD_DATE | Identified Date | 70px | Date | dd-MMM-yyyy format, 9px font |
| targeT_DATE | Target Date | 70px | Date | dd-MMM-yyyy format, 9px font |
| issuE_RESOLVED_DATE | Resolved Date | 70px | Date | dd-MMM-yyyy format, 9px font |
| status | Status | 5% | String | Color-coded badge (status colors) |
| info | - | 20px | Action | Info icon button (blue) |
| edit | - | 20px | Action | Edit icon button (teal) |
| delete | - | 20px | Action | Delete icon button (red) |

### 6.3 Table Styling
**Styling Specifications:**

Background color: #f3e5f5 (light purple)
Header Font Size: 12px
Header Font Weight: 600
Header Text Transform: capitalize
Header Letter Spacing: 0.3px
Row Min Height: 48px
Row Border: 1px solid rgba(0, 0, 0, 0.06)
Row Hover Background: rgba(103, 126, 234, 0.05)
Row Hover Shadow: 0 2px 4px rgba(0, 0, 0, 0.08)
Cell Vertical Align: middle
Table Layout: fixed (with word-break). Hover effects provide visual feedback on interactive elements.

---

## 7. STATUS/BADGE SYSTEM

### 7.1 Severity Badges
**Styling Specifications:**

Background color: #ffebee !important
  - Text Color: #d32f2f !important
  - Row Border Left: 4px solid #f44336

Medium:
  - Background: #fff3e0 !important
  - Text Color: #f57c00 !important
  - Row Border Left: 4px solid #ff9800

Low:
  - Background: #e8f5e9 !important
  - Text Color: #388e3c !important
  - Row Border Left: 4px solid #4caf50. Text color: #d32f2f !important
  - Row Border Left: 4px solid #f44336

Medium:
  - Background: #fff3e0 !important
  - Text Color: #f57c00 !important
  - Row Border Left: 4px solid #ff9800

Low:
  - Background: #e8f5e9 !important
  - Text Color: #388e3c !important
  - Row Border Left: 4px solid #4caf50. Padding: 2px 6px
Font Size: 9px
Font Weight: 600
Border Radius: 8px
Text Transform: uppercase
Letter Spacing: 0.3px
White Space: nowrap

High:
  - Background: #ffebee !important
  - Text Color: #d32f2f !important
  - Row Border Left: 4px solid #f44336

Medium:
  - Background: #fff3e0 !important
  - Text Color: #f57c00 !important
  - Row Border Left: 4px solid #ff9800

Low:
  - Background: #e8f5e9 !important
  - Text Color: #388e3c !important
  - Row Border Left: 4px solid #4caf50.

### 7.2 Status Badges
**Styling Specifications:**

Background color: #e3f2fd
  - Text: #1976d2

In-Progress:
  - Background: #e3f2fd
  - Text: #1976d2

Closed:
  - Background: #e8f5e9
  - Text: #388e3c

On Hold:
  - Background: #fff3e0
  - Text: #f57c00. Padding: 2px 6px
Font Size: 9px
Font Weight: 600
Border Radius: 8px
Text Transform: uppercase
Letter Spacing: 0.3px
White Space: nowrap

Identified:
  - Background: #e3f2fd
  - Text: #1976d2

In-Progress:
  - Background: #e3f2fd
  - Text: #1976d2

Closed:
  - Background: #e8f5e9
  - Text: #388e3c

On Hold:
  - Background: #fff3e0
  - Text: #f57c00.

### 7.3 Type Badge
**Styling Specifications:**

Background color: #e0f2f1
Text: #00897b
Border Radius: 8px
White Space: normal
Word Break: normal
Line Height: 1.3. Padding: 2px 6px
Font Size: 9px
Font Weight: 500
Background: #e0f2f1
Text: #00897b
Border Radius: 8px
White Space: normal
Word Break: normal
Line Height: 1.3.

### 7.4 Owner Chip
**Styling Specifications:**

Background color: rgba(103, 126, 234, 0.12)
Border Radius: 10px
Font Size: 9px
Text: #5568d3
Font Weight: 500
White Space: normal
Max Width: 100%
Word Break: break-word
Line Height: 1.3. Padding: 2px 6px
Background: rgba(103, 126, 234, 0.12)
Border Radius: 10px
Font Size: 9px
Text: #5568d3
Font Weight: 500
White Space: normal
Max Width: 100%
Word Break: break-word
Line Height: 1.3.

### 7.5 Index Badge
**Styling Specifications:**

Background color: linear-gradient(135deg, #e53935 0%, #c62828 100%)
Color: white
Border Radius: 50%
Font Weight: 600
Font Size: 9px
Box Shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24). Text color: white
Border Radius: 50%
Font Weight: 600
Font Size: 9px
Box Shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24).

---

## 8. BUTTONS

### 8.1 Back Button
**Styling Specifications:**

Background color: white
Color: #616161
Box Shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)
Transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1)

Icon Size: 18px

Hover:
  - Background: #e3f2fd
  - Color: #1976d2
  - Transform: translateY(-2px)
  - Shadow: 0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)

Active:
  - Transform: translateY(0). Text color: #616161
Box Shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)
Transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1)

Icon Size: 18px

Hover:
  - Background: #e3f2fd
  - Color: #1976d2
  - Transform: translateY(-2px)
  - Shadow: 0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)

Active:
  - Transform: translateY(0). Flexbox layout enables flexible positioning and alignment. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

### 8.2 Header Action Buttons
**Styling Specifications:**

Background color: #1976d2
  - Color: white
  
  Hover:
    - Transform: translateY(-1px)
    - Shadow: 0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12). Text color: #e0e0e0
  - Text: gray
  
  Hover:
    - Border Color: #1976d2
    - Color: #1976d2

Add Button (raised, primary):
  - Background: #1976d2
  - Color: white
  
  Hover:
    - Transform: translateY(-1px)
    - Shadow: 0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12). Padding: 0
Line Height: 32px
Border Radius: 6px

Icon Size: 18px

Filter Button (stroked):
  - Border Color: #e0e0e0
  - Text: gray
  
  Hover:
    - Border Color: #1976d2
    - Color: #1976d2

Add Button (raised, primary):
  - Background: #1976d2
  - Color: white
  
  Hover:
    - Transform: translateY(-1px)
    - Shadow: 0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12). Hover effects provide visual feedback on interactive elements.

### 8.3 Form Header Buttons
**Styling Specifications:**

Background color: white
  - Color: #7b1fa2
  
  Hover:
    - Background: rgba(255, 255, 255, 0.9)
  
  Disabled:
    - Background: rgba(255, 255, 255, 0.5)
    - Color: rgba(0, 0, 0, 0.4)

Cancel Button (header):
  - Background: rgba(255, 255, 255, 0.2)
  - Color: white
  - Border: 1px solid rgba(255, 255, 255, 0.4)
  
  Hover:
    - Background: rgba(255, 255, 255, 0.3). Text color: #7b1fa2
  
  Hover:
    - Background: rgba(255, 255, 255, 0.9)
  
  Disabled:
    - Background: rgba(255, 255, 255, 0.5)
    - Color: rgba(0, 0, 0, 0.4)

Cancel Button (header):
  - Background: rgba(255, 255, 255, 0.2)
  - Color: white
  - Border: 1px solid rgba(255, 255, 255, 0.4)
  
  Hover:
    - Background: rgba(255, 255, 255, 0.3). Padding: 6px 16px
Border Radius: 6px
Font Weight: 500
Font Size: 0.85rem
Min Width: 44px
Min Height: 36px

Icon Size: 18px
Icon Margin: 0

Save Button (header):
  - Background: white
  - Color: #7b1fa2
  
  Hover:
    - Background: rgba(255, 255, 255, 0.9)
  
  Disabled:
    - Background: rgba(255, 255, 255, 0.5)
    - Color: rgba(0, 0, 0, 0.4)

Cancel Button (header):
  - Background: rgba(255, 255, 255, 0.2)
  - Color: white
  - Border: 1px solid rgba(255, 255, 255, 0.4)
  
  Hover:
    - Background: rgba(255, 255, 255, 0.3). Margin: 0

Save Button (header):
  - Background: white
  - Color: #7b1fa2
  
  Hover:
    - Background: rgba(255, 255, 255, 0.9)
  
  Disabled:
    - Background: rgba(255, 255, 255, 0.5)
    - Color: rgba(0, 0, 0, 0.4)

Cancel Button (header):
  - Background: rgba(255, 255, 255, 0.2)
  - Color: white
  - Border: 1px solid rgba(255, 255, 255, 0.4)
  
  Hover:
    - Background: rgba(255, 255, 255, 0.3). Hover effects provide visual feedback on interactive elements.

### 8.4 Form Footer Buttons
**Styling Specifications:**

Background color: white
  - Color: #666
  - Border: 1px solid #ddd
  
  Hover:
    - Background: #f5f5f5
    - Border Color: #bbb

Save Button:
  - Background: linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%)
  - Color: white
  
  Hover:
    - Shadow: 0 4px 16px rgba(123, 31, 162, 0.4)
    - Transform: translateY(-1px)
  
  Disabled:
    - Background: #ccc
    - Shadow: none
    - Transform: none. Text color: #666
  - Border: 1px solid #ddd
  
  Hover:
    - Background: #f5f5f5
    - Border Color: #bbb

Save Button:
  - Background: linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%)
  - Color: white
  
  Hover:
    - Shadow: 0 4px 16px rgba(123, 31, 162, 0.4)
    - Transform: translateY(-1px)
  
  Disabled:
    - Background: #ccc
    - Shadow: none
    - Transform: none. Padding: 8px 24px
Border Radius: 6px
Font Size: 0.9rem
Font Weight: 500
Transition: all 0.2s ease

Icon Margin Right: 8px

Cancel Button:
  - Background: white
  - Color: #666
  - Border: 1px solid #ddd
  
  Hover:
    - Background: #f5f5f5
    - Border Color: #bbb

Save Button:
  - Background: linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%)
  - Color: white
  
  Hover:
    - Shadow: 0 4px 16px rgba(123, 31, 162, 0.4)
    - Transform: translateY(-1px)
  
  Disabled:
    - Background: #ccc
    - Shadow: none
    - Transform: none. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

### 8.5 Action Link Buttons (Table Icons)
**Styling Specifications:**

Background color: rgba(25, 118, 210, 0.1)
    - Icon Color: #1565c0

Edit Button:
  - Color: #00897b
  
  Hover:
    - Background: rgba(0, 137, 123, 0.1)
    - Icon Color: #00695c

Delete Button:
  - Color: #d32f2f
  
  Hover:
    - Background: rgba(211, 47, 47, 0.1)
    - Icon Color: #c62828. Text color: #1976d2
  
  Hover:
    - Background: rgba(25, 118, 210, 0.1)
    - Icon Color: #1565c0

Edit Button:
  - Color: #00897b
  
  Hover:
    - Background: rgba(0, 137, 123, 0.1)
    - Icon Color: #00695c

Delete Button:
  - Color: #d32f2f
  
  Hover:
    - Background: rgba(211, 47, 47, 0.1)
    - Icon Color: #c62828. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

---

## 9. FILTERS

### 9.1 Unified Header Filters
**Styling Specifications:**

Text color: rgba(0, 0, 0, 0.87)
  - Margin Right: 4px

Checkbox Styling:
  - Margin: 0
  - Label Font Size: 13px
  - Checkbox Size: 16px

"Open - Past Due Date":
  - Label Color: #d32f2f
  - Border Color: #f44336

"Open - Due For Closure":
  - Label Color: #ff9800
  - Border Color: #ff9800. Margin: 0
  - Label Font Size: 13px
  - Checkbox Size: 16px

"Open - Past Due Date":
  - Label Color: #d32f2f
  - Border Color: #f44336

"Open - Due For Closure":
  - Label Color: #ff9800
  - Border Color: #ff9800. Flexbox layout enables flexible positioning and alignment. Gap between elements: 4px
White Space: nowrap
Flex Shrink: 1

Filter Label:
  - Font Size: 13px
  - Font Weight: 500
  - Color: rgba(0, 0, 0, 0.87)
  - Margin Right: 4px

Checkbox Styling:
  - Margin: 0
  - Label Font Size: 13px
  - Checkbox Size: 16px

"Open - Past Due Date":
  - Label Color: #d32f2f
  - Border Color: #f44336

"Open - Due For Closure":
  - Label Color: #ff9800
  - Border Color: #ff9800.

### 9.2 Advanced Filters Card
**Styling Specifications:**

Background color: white
Border Radius: 8px
Padding: 6px 12px
Margin Bottom: 4px
Box Shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)
Border: 1px solid #eeeeee

Advanced Filter Section:
  - Padding Top: 8px
  - Border Top: 1px solid #eeeeee

Component: app-table-filter
  - Table Name: 'PROJECT_ISSUE'
  - Search by: portfolio, subvertical, project, title, description, type, severity, action plan, assigned to, dates, status. Padding: 6px 12px
Margin Bottom: 4px
Box Shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)
Border: 1px solid #eeeeee

Advanced Filter Section:
  - Padding Top: 8px
  - Border Top: 1px solid #eeeeee

Component: app-table-filter
  - Table Name: 'PROJECT_ISSUE'
  - Search by: portfolio, subvertical, project, title, description, type, severity, action plan, assigned to, dates, status.

### 9.3 Portfolio/Project Selector
**Styling Specifications:**

Padding: 6px (top and bottom).

---

## 10. ADD/EDIT MODAL

### 10.1 Form Header
**Styling Specifications:**

Background color: linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%)
Padding: 14px 20px
Border Radius: 10px
Margin Bottom: 16px
Box Shadow: 0 3px 10px rgba(0, 0, 0, 0.12)

Title Section:
  - Display: flex
  - Gap: 10px
  - Icon Color: white
  - Icon Size: 24px
  - Title Color: white
  - Title Size: 1.25rem
  - Title Weight: 600

Action Buttons:
  - Gap: 10px
  - See Section 8.3 for button styles. Text color: white
  - Icon Size: 24px
  - Title Color: white
  - Title Size: 1.25rem
  - Title Weight: 600

Action Buttons:
  - Gap: 10px
  - See Section 8.3 for button styles. Padding: 14px 20px
Border Radius: 10px
Margin Bottom: 16px
Box Shadow: 0 3px 10px rgba(0, 0, 0, 0.12)

Title Section:
  - Display: flex
  - Gap: 10px
  - Icon Color: white
  - Icon Size: 24px
  - Title Color: white
  - Title Size: 1.25rem
  - Title Weight: 600

Action Buttons:
  - Gap: 10px
  - See Section 8.3 for button styles. Flexbox layout enables flexible positioning and alignment. Gap between elements: 10px
  - Icon Color: white
  - Icon Size: 24px
  - Title Color: white
  - Title Size: 1.25rem
  - Title Weight: 600

Action Buttons:
  - Gap: 10px
  - See Section 8.3 for button styles.

### 10.2 Form Cards

#### Basic Information Card
**Styling Specifications:**

#### Impact Assessment Card
**Styling Specifications:**

#### Issue Details Card
**Styling Specifications:**

#### Root Cause & Action Plan Card
**Styling Specifications:**

#### Assignment & Timeline Card
**Styling Specifications:**

### 10.3 Form Footer
**Styling Specifications:**

Background color: #f8f9fa
Border Radius: 10px
Margin Top: 16px

Buttons:
  - See Section 8.4 for button styles
  - Cancel: Stroked button
  - Save Issue: Raised button with purple gradient. Padding: 16px
Background: #f8f9fa
Border Radius: 10px
Margin Top: 16px

Buttons:
  - See Section 8.4 for button styles
  - Cancel: Stroked button
  - Save Issue: Raised button with purple gradient. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px
Padding: 16px
Background: #f8f9fa
Border Radius: 10px
Margin Top: 16px

Buttons:
  - See Section 8.4 for button styles
  - Cancel: Stroked button
  - Save Issue: Raised button with purple gradient.

---

## 11. INTERACTIONS

### 11.1 Hover States

**Table Rows:**
**Styling Specifications:**

Background color: rgba(103, 126, 234, 0.05)
  - Box Shadow: 0 2px 4px rgba(0, 0, 0, 0.08)
  - Transition: all 0.2s ease. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

**Back Button:**
**Styling Specifications:**

Background color: #e3f2fd
  - Color: #1976d2
  - Transform: translateY(-2px)
  - Shadow: 0 3px 6px rgba(0, 0, 0, 0.15). Text color: #1976d2
  - Transform: translateY(-2px)
  - Shadow: 0 3px 6px rgba(0, 0, 0, 0.15). Hover effects provide visual feedback on interactive elements.

**Action Buttons:**
**Styling Specifications:**

Hover effects provide visual feedback on interactive elements.

**Action Icons:**
**Styling Specifications:**

Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

**Form Fields:**
**Styling Specifications:**

Text color: #7b1fa2. Hover effects provide visual feedback on interactive elements.

**Info Icons:**
**Styling Specifications:**

Text color: #0288d1 (darker blue)
  - Transform: scale(1.15)
  - Transition: all 0.25s ease. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

**Form Cards:**
**Styling Specifications:**

Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

### 11.2 Click Behaviors

**Edit Row:**
- Copies row data to EditIssue object
- Switches to edit mode
- Scrolls to top of page
- Shows form with populated data

**Delete Row:**
- Opens confirmation dialog
- On confirm: Deletes issue from backend
- Removes from local array
- Refreshes table
- Shows success message

**Add Issue:**
- Clears EditIssue object
- Initializes with defaults
- Switches to edit mode
- Scrolls to top

**Info Icon:**
- Opens EntityBaseInfoComponent modal
- Shows full issue details
- Modal width: 500px
- Panel class: 'entity-info-dialog'

**Filter Toggle:**
- Toggles bShowFilter boolean
- Shows/hides advanced filter component
- Updates button tooltip

**Status Checkboxes:**
- All: Unchecks Past Due and Due for Closure
- Past Due/Due for Closure: Disabled when All is checked
- On change: Calls showFilteredRows()

**Portfolio/Project Selection:**
- Filters table data
- Updates project dropdown options
- Re-renders table

**Submit Form:**
- Validates all fields
- Checks for special characters
- Validates dates
- Calls addIssue or updateIssue service
- Shows success/error message
- Refreshes data

### 11.3 Employee Search

**Display Mode:**
**Styling Specifications:**

Background color: #fafafa
Border: 1px solid #eeeeee
Padding: 16px. Padding: 16px.

**Edit Mode:**
**Styling Specifications:**

**Selection:**
- User types to search employee
- Selects from dropdown
- Employee ID and name saved
- Returns to display mode

### 11.4 Form Validation

**Required Fields:**
- Project Name
- Reported By
- Title
- Description
- Impact Summary
- Business impact (yes/no)
- Service Impact
- Financial Impact
- Issue Category
- Severity
- Issue Source
- Root Cause
- Action Plan
- Assigned To
- Reported By (person name)
- Level
- Reported Date
- Acknowledgement Date
- Target Date
- Status
- Comments (required if status = Closed)

**Special Validation:**
- Special character only check
- Number only check
- Date validation (target >= identified, resolved >= identified && <= today)
- Resolved date required for Closed status
- Comments required for Closed status

**Character Limits:**
- Title: 100
- Description: 2000
- Impact Summary: 2000
- Business Impact Description: 2000
- Service Impact: 2000
- Financial Impact Description: 2000
- Root Cause: 2000
- Action Plan: 2000
- Reported By: 50
- Issue Source (Other): 200

---

## 12. RESPONSIVE DESIGN

### 12.1 Breakpoints

**1200px and below:**
**Styling Specifications:**

**768px and below (Mobile/Tablet):**
**Styling Specifications:**

Padding: 12px 16px. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px.

### 12.2 Desktop (Default)
**Styling Specifications:**

Padding: 16px

Unified Header:
  - All elements in single row
Filters:
  - Horizontal layout
Table:
  - Full width
  - All columns visible
Form:
  - Two/three column grids for form rows. Margin: 0 auto
Padding: 16px

Unified Header:
  - All elements in single row
Filters:
  - Horizontal layout
Table:
  - Full width
  - All columns visible
Form:
  - Two/three column grids for form rows.

### 12.3 Tablet (768px - 1200px)
**Styling Specifications:**

### 12.4 Mobile (<768px)
**Styling Specifications:**

---

## 13. SHADOWS

**Styling Specifications:**

Hover effects provide visual feedback on interactive elements.

---

## 14. TRANSITIONS

**Styling Specifications:**

Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

---

## 15. SPECIAL FEATURES

### 15.1 Table Features
- Fixed table layout with word-break enabled
- Sortable columns (MatSort)
- Pagination (5, 10, 20 items per page)
- Row hover effects
- Severity-based left border indicators
- Truncated text with tooltips
- Inline action buttons

### 15.2 Filter Features
- Portfolio/Project cascading filters
- Status-based quick filters (All, Past Due, Due for Closure)
- Advanced column-based filtering
- Real-time filter application
- Filter collapse/expand toggle

### 15.3 Form Features
- Conditional field visibility
- Character counters on text fields
- Info tooltips on all fields
- Employee autocomplete search
- Date validation
- Radio button conditional logic
- Form card color-coding by section
- Scroll to top on edit
- Field validation with error messages

### 15.4 Accessibility Features
- Tooltips on all interactive elements
- Mat-icon for visual indicators
- ARIA labels (via Material components)
- Keyboard navigation support
- Focus indicators
- Color contrast compliance

---

## 16. ANIMATIONS

### 16.1 Page Entry
**Styling Specifications:**

### 16.2 Hover Transformations
- Buttons: translateY(-1px to -2px)
- Info icons: scale(1.15)
- Cards: shadow increase

### 16.3 Smooth Scrolling
**TypeScript Implementation:**

---

## 17. Z-INDEX LAYERS

**Styling Specifications:**

---

## 18. ISSUE CATEGORIES

**TypeScript Implementation:**

---

## 19. ISSUE SOURCE OPTIONS

**TypeScript Implementation:**

---

## 20. LOCATION OPTIONS

**TypeScript Implementation:**

---

## 21. DATA FLOW

### 21.1 Read-Only View
1. Component loads → Fetches all issues for customer
2. Applies saved portfolio filter (if any)
3. Shows default view: Open - Past Due & Open - Due for Closure
4. User can filter by:
   - Portfolio/Project
   - Status (checkboxes)
   - Advanced filters (table-filter component)
5. Table updates reactively

### 21.2 Add Issue Flow
1. Click Add button
2. Form appears with empty EditIssue
3. User fills required fields
4. Conditional fields show/hide based on selections
5. Submit → Validation
6. If valid → API call → Success message
7. Table refreshes with new data
8. Returns to read-only view

### 21.3 Edit Issue Flow
1. Click edit icon on table row
2. Data copied to EditIssue
3. Form appears with populated data
4. User modifies fields
5. Submit → Validation
6. If valid → API call → Success message
7. Data refreshed
8. Returns to read-only view

### 21.4 Delete Issue Flow
1. Click delete icon
2. Confirmation dialog appears
3. On confirm → API call
4. Remove from local array
5. Table refreshes
6. Success message

---

## 22. API INTEGRATION

### 22.1 Services
- `AppsService` - Main service for CRUD operations
- `AccessControlService` - Permission checks
- `UtilityService` - Helper functions, error handling
- `SharedService` - Shared state (portfolio/project selections)

### 22.2 API Methods
- `getAllIssuesForCustomer(custId, allproj)` - Fetch all issues
- `addIssue(issue)` - Create new issue
- `updateIssue(issue)` - Update existing issue
- `deleteIssue(issue)` - Delete issue
- `GetCustomerProjectsName(custId, allproj)` - Get project list
- `getPortfolioName(projectId)` - Get portfolio for project
- `getEmpInfo()` - Get employee list for autocomplete

### 22.3 Access Control
**TypeScript Implementation:**

---

## SUMMARY

The Issues Management Page is a comprehensive Angular Material-based UI with:

- **Modern Design**: Purple theme with gradient headers, color-coded sections
- **Rich Table**: 17 columns with sorting, pagination, filtering, tooltips
- **Advanced Filtering**: Portfolio/project cascading filters, status quick filters, column-based advanced filters
- **Complex Form**: 20+ fields across 5 categorized sections with conditional logic
- **User Experience**: Smooth animations, hover effects, responsive design, accessibility features
- **Validation**: Extensive client-side validation with custom business rules
- **Integration**: Full CRUD operations with backend API, access control, shared state management

The page follows Material Design principles with custom theming to match the CSM Platform design system, providing a professional and intuitive interface for managing project issues.
