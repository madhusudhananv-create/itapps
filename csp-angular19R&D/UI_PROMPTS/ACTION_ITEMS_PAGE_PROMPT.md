# Action Items Page - Complete UI Recreation Prompt

## Page Overview
Create a modern Action Items management page with Material Design principles, featuring a data table for tracking project action items with CRUD operations, filtering, and export capabilities.

---

## Layout Structure

### Container
- **Background**: Light gray (#f5f7fa)
- **Padding**: 6px overall
- **Min-height**: 100vh
- **Font-family**: 'Roboto', 'Segoe UI', Tahoma, sans-serif

---

## Main Sections

### 1. Unified Header Row
**Layout**: Horizontal flexbox, nowrap, space-between alignment
**Background**: White (#ffffff)
**Border-radius**: 8px
**Box-shadow**: 0 2px 4px rgba(0, 0, 0, 0.1)
**Padding**: 4px 8px 4px 0px
**Margin-bottom**: 4px
**Min-height**: 48px

**Components (left to right)**:

#### A. Back Button
- **Size**: 28px × 28px
- **Background**: Transparent
- **Border-radius**: 6px
- **Icon**: Material Icon "arrow_back", 18px, gray (#757575)
- **Hover**: Light gray background (rgba(0, 0, 0, 0.04)), icon turns blue (#1976d2)
- **Transition**: all 0.3s ease

#### B. Customer Logo
- **Size**: 32px × 28px (fixed, flex-shrink: 0)
- **Image**: Should fit within bounds (object-fit: contain)
- **Display**: Flexbox center alignment

#### C. Portfolio/Project Selector
- **Component**: Multi-select dropdowns (inline)
- **Height**: 32px
- **Font-size**: 13px
- **Style**: Material form fields with compact styling

#### D. Status Filter Group
- **Layout**: Horizontal flex, white-space: nowrap
- **Components**:
  - **Label**: "Status:" in 13px, font-weight 500, color #212121
  - **Checkbox "All"**: Material checkbox, 16px size
  - **Checkbox "Open - Past Due Date"**: Material checkbox, warn color, disabled when "All" checked, label in red (#d32f2f)
  - **Checkbox "Open - Due For Closure"**: Material checkbox, accent color, disabled when "All" checked, label in orange (#ed6c02)
- **Label font-size**: 13px
- **Checkbox size**: 16px

#### E. Header Action Buttons (Right Side)
- **Layout**: Horizontal flex, gap 8px, margin-left: auto
- **Padding-right**: 10px

**Buttons** (all 32px × 32px):
1. **Export Button**
   - **Type**: Stroked button (mat-stroked-button)
   - **Icon**: Material Icon "download", 18px
   - **Tooltip**: "Export to Excel"

2. **Filter Button**
   - **Type**: Stroked button
   - **Icon**: Material Icon "filter_list", 18px
   - **Tooltip**: "Show/Hide Filter"

3. **Add Button**
   - **Type**: Raised button, primary color
   - **Icon**: Material Icon "add", 18px
   - **Background**: #1976d2
   - **Tooltip**: "Add Action Item"

**Button Hover Effects**:
- **Transform**: translateY(-1px)
- **Box-shadow**: 0 4px 8px rgba(0, 0, 0, 0.12)
- **Transition**: all 0.3s ease

---

### 2. Advanced Filters Card (Collapsible)
**Visibility**: Conditional (toggled by filter button)
**Background**: White (#ffffff)
**Border-radius**: 10px
**Padding**: 6px 12px
**Margin-bottom**: 4px
**Box-shadow**: 0 2px 4px rgba(0, 0, 0, 0.1)
**Border**: 1px solid rgba(0, 0, 0, 0.06)

**Content**: Advanced table filter component with border-top separator (1px solid #e0e0e0), padding-top: 8px

---

### 3. Action Bar
**Layout**: Horizontal flex, space-between
**Background**: White
**Border-radius**: 8px
**Box-shadow**: 0 2px 4px rgba(0, 0, 0, 0.1)
**Padding**: 6px 12px
**Margin-bottom**: 6px

**Components**:
- **Left**: Page title "Action Items" (14px, font-weight 600, color #333)
- **Right**: "Minutes of Meeting" button
  - **Type**: mat-button
  - **Height**: 32px
  - **Font-size**: 12px
  - **Icon**: Material Icon "description", 18px, margin-right 6px
  - **Border-radius**: 6px
  - **Text-transform**: none

---

### 4. Progress Bar
**Type**: Material indeterminate progress bar
**Visibility**: Shown while loading
**Margin-bottom**: 16px
**Border-radius**: 4px

---

### 5. Empty State Card
**Visibility**: Shown when no data
**Background**: White
**Border-radius**: 8px
**Box-shadow**: 0 2px 4px rgba(0, 0, 0, 0.1)
**Padding**: 40px 20px
**Text-align**: center

**Components**:
- **Icon**: Material Icon "inbox", 56px, color #757575, opacity 0.5, margin-bottom 12px
- **Title**: "No Action Items Found" (16px, font-weight 600, color #212121, margin 12px 0 6px)
- **Description**: "No action items are defined for the projects assigned to you." (12px, color #757575)

---

### 6. Loading State Card
**Visibility**: Shown during initial load
**Background**: White
**Border-radius**: 8px
**Box-shadow**: 0 2px 4px rgba(0, 0, 0, 0.1)
**Padding**: 40px 20px
**Layout**: Flexbox column, center aligned, gap 12px

**Components**:
- **Spinner**: Material spinner, diameter 40px
- **Text**: "Loading action items..." (12px, color #757575)

---

### 7. Data Table Card
**Background**: White
**Border-radius**: 8px
**Box-shadow**: 0 2px 4px rgba(0, 0, 0, 0.1)
**Overflow**: hidden

#### Table Specifications

**Font-size**: 12px
**Table-layout**: fixed

**Header Row**:
- **Background**: Light blue (#bbdefb)
- **Height**: 48px
- **Font-weight**: 600
- **Font-size**: 12px
- **Text-transform**: capitalize
- **Letter-spacing**: 0.3px
- **Color**: #333
- **Padding**: 10px 8px
- **Alignment**: left

**Data Rows**:
- **Height**: 52px
- **Border-bottom**: 1px solid rgba(0, 0, 0, 0.06)
- **Hover background**: rgba(103, 126, 234, 0.05)
- **Hover box-shadow**: 0 2px 4px rgba(0, 0, 0, 0.08)
- **Transition**: all 0.2s ease
- **Cell padding**: 10px 8px
- **Cell font-size**: 12px
- **Cell color**: #212121

#### Column Definitions

| Column | Width | Special Styling |
|--------|-------|----------------|
| **No.** | 50px | Circular badge with gradient background |
| **Project** | Auto | Text truncate with tooltip, max-width 180px |
| **Portfolio** | Auto | Text truncate with tooltip, max-width 180px |
| **Description** | Max 800px | Multi-line, word-wrap, line-height 1.5 |
| **Owner** | Auto | Chip-style badge |
| **Target Date** | Auto | Date format (dd-MMM-yyyy), gray text |
| **Identified Date** | Auto | Date format (dd-MMM-yyyy), gray text |
| **Status** | Auto | Color-coded status badge |
| **Priority** | Auto | Color-coded priority badge |
| **Source** | Auto | Plain text |
| **Completion Date** | Auto | Date format (dd-MMM-yyyy), gray text |
| **Info** | Action | Icon button |
| **Edit** | Action | Icon button |
| **Delete** | Action | Icon button |

#### Special Cell Styles

**1. Index Badge (No. column)**:
- **Display**: inline-flex, center aligned
- **Size**: 23px × 23px
- **Background**: Linear gradient (135deg, #1e88e5 0%, #1565c0 100%)
- **Color**: white
- **Border-radius**: 50% (circular)
- **Font-weight**: 600
- **Font-size**: 11px
- **Box-shadow**: 0 2px 4px rgba(0, 0, 0, 0.1)

**2. Owner Chip**:
- **Display**: inline-block
- **Padding**: 4px 10px
- **Background**: rgba(103, 126, 234, 0.12)
- **Border-radius**: 14px (pill shape)
- **Font-size**: 10px
- **Color**: #5568d3
- **Font-weight**: 500
- **Word-wrap**: break-word
- **Line-height**: 1.4

**3. Status Badges**:
- **Display**: inline-block
- **Padding**: 3px 10px
- **Border-radius**: 10px
- **Font-size**: 10px
- **Font-weight**: 600
- **Text-transform**: uppercase
- **Letter-spacing**: 0.3px
- **White-space**: nowrap

**Status Colors**:
- **In Progress**: Background #e3f2fd, Text #1976d2
- **Completed**: Background #e8f5e9, Text #388e3c
- **Cancelled**: Background #ffebee, Text #d32f2f
- **Suspended**: Background #fff3e0, Text #f57c00
- **Open**: Background #e3f2fd, Text #1565c0

**4. Priority Badges**:
- **Display**: inline-block
- **Padding**: 3px 10px
- **Border-radius**: 10px
- **Font-size**: 10px
- **Font-weight**: 600
- **Text-transform**: uppercase
- **Letter-spacing**: 0.3px

**Priority Colors**:
- **Critical**: Background #ffebee, Text #c62828
- **High**: Background #fff3e0, Text #e65100
- **Medium**: Background #fff9c4, Text #f57f17
- **Low**: Background #e8f5e9, Text #2e7d32

**5. Action Buttons (Info/Edit/Delete)**:
- **Type**: mat-icon-button
- **Icon size**: 18px
- **Button size**: 32px × 32px
- **Border-radius**: 50%
- **Transition**: all 0.2s ease

**Icon Colors & Hover**:
- **Info**: Blue (#1976d2), hover background rgba(25, 118, 210, 0.08)
- **Edit**: Blue (#1976d2), hover background rgba(25, 118, 210, 0.08)
- **Delete**: Red (#d32f2f), hover background rgba(211, 47, 47, 0.08)

**Hover Effect**:
- **Transform**: scale(1.1)
- **Cursor**: pointer

---

### 8. Paginator
**Location**: Below table
**Page sizes**: [5, 10, 20]
**Default page size**: 5
**Style**: Material Design paginator with standard styling

---

## Edit/Add Form Section

### Form Container
**Background**: Light gray (#f5f7fa)
**Visibility**: Conditional (shown when edit/add mode)

### Form Header
**Layout**: Horizontal flex, space-between
**Background**: White
**Border-radius**: 8px
**Box-shadow**: 0 2px 8px rgba(0, 0, 0, 0.1)
**Padding**: 16px 20px
**Margin-bottom**: 16px

**Left Side**:
- **Icon**: Material Icon "assignment", 28px, color #1976d2
- **Title**: "Edit Action Item" or "Add New Action Item" (20px, font-weight 600, color #212121)
- **Layout**: Horizontal flex, gap 12px, align center

**Right Side** (Button Group):
- **Save Button**: Raised button, primary color, mat-icon "save", 36px height
- **Close Button**: Stroked button, mat-icon "close", 36px height
- **Gap**: 8px between buttons

---

## Color Palette

### Primary Colors
- **Primary**: #1976d2
- **Accent**: #00897b
- **Warn**: #d32f2f

### Background Colors
- **Page Background**: #f5f7fa
- **Card Background**: #ffffff
- **Header Gradient**: #bbdefb

### Text Colors
- **Primary Text**: #212121
- **Secondary Text**: #757575
- **Muted Text**: #9e9e9e

### Semantic Colors
- **Success**: #4caf50 (green)
- **Warning**: #ff9800 (orange)
- **Error**: #f44336 (red)
- **Info**: #2196f3 (blue)

### Shadows
- **Small**: 0 2px 4px rgba(0, 0, 0, 0.1)
- **Medium**: 0 4px 8px rgba(0, 0, 0, 0.12)
- **Large**: 0 8px 16px rgba(0, 0, 0, 0.15)

---

## Typography

### Font Stack
`'Roboto', 'Segoe UI', Tahoma, sans-serif`

### Font Sizes
- **Page Title**: 18px (large headers), 14px (action bar)
- **Form Title**: 20px
- **Section Headers**: 14-16px
- **Body Text**: 12-13px
- **Table Headers**: 12px
- **Table Cells**: 12px
- **Badges/Chips**: 10-11px
- **Buttons**: 12-13px

### Font Weights
- **Headers**: 600
- **Body**: 400
- **Labels**: 500
- **Badges**: 600

---

## Spacing System

### Padding
- **Page Container**: 6px
- **Cards**: 6-12px (compact), 16-20px (normal), 40px (empty states)
- **Buttons**: 4-6px (icon only), 6-12px (with text)
- **Form Fields**: 10-16px

### Margin
- **Between Sections**: 4-6px
- **Between Buttons**: 8px
- **Between Form Fields**: 16px

### Gaps (Flexbox)
- **Small**: 4-6px
- **Medium**: 8-12px
- **Large**: 16-20px

---

## Interactions & Animations

### Hover Effects
- **Buttons**: translateY(-1px), box-shadow increase
- **Table Rows**: Background color change, shadow appearance
- **Icon Buttons**: scale(1.1), background color appearance

### Transitions
- **Standard**: all 0.3s ease
- **Quick**: all 0.2s ease
- **Smooth**: all 0.4s cubic-bezier(0.4, 0, 0.2, 1)

### Loading States
- **Progress Bar**: Indeterminate animation
- **Spinner**: Rotating animation
- **Skeleton Loaders**: Pulse animation (if applicable)

---

## Responsive Design

### Breakpoints
- **Mobile**: ≤768px
- **Tablet**: 769px - 968px
- **Desktop**: >968px

### Mobile Adjustments (≤768px)
- **Unified Header**: Wrap to multiple rows if needed
- **Filters**: Stack vertically
- **Status Checkboxes**: Full width, stacked
- **Action Buttons**: Maintain minimum touch target 48px
- **Table**: Horizontal scroll enabled
- **Form Fields**: Full width, single column

### Tablet Adjustments (≤968px)
- **Status Group**: Remove left margin
- **Filter Groups**: Wrap as needed
- **Table**: Maintain readability with adjusted columns

---

## Accessibility

### ARIA Labels
- All icon buttons must have matTooltip
- Form fields must have proper labels
- Table columns must have sortable headers

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Tab order follows logical flow
- Enter/Space activates buttons

### Color Contrast
- Text on backgrounds must meet WCAG AA standards (4.5:1 for normal text)
- Icon colors must be distinguishable
- Status badges must have sufficient contrast

---

## Implementation Notes

1. Use Angular Material components (v19+)
2. Implement Material table with sorting and pagination
3. Use reactive forms for edit/add functionality
4. Implement proper access control checks
5. Add loading states for all async operations
6. Implement proper error handling
7. Use Material icons throughout
8. Implement tooltip directives for truncated text
9. Add confirmation dialogs for delete operations
10. Implement export to Excel functionality
11. Use Material dialog for edit forms (or inline forms)
12. Implement proper validation for form fields

---

## Key Features

1. **CRUD Operations**: Create, Read, Update, Delete action items
2. **Filtering**: Portfolio, Project, Status, Advanced filters
3. **Sorting**: All columns sortable
4. **Pagination**: Configurable page sizes
5. **Export**: Excel export functionality
6. **Search**: Filter by multiple criteria
7. **Access Control**: Role-based feature visibility
8. **Responsive**: Mobile, tablet, desktop support
9. **Loading States**: Progress indicators
10. **Empty States**: User-friendly messaging

---

This prompt provides complete specifications to recreate the Action Items page with identical design, layout, colors, fonts, spacing, and interactions.
