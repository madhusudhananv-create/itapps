# Assessment Status Page - Complete UI Recreation Prompt

## Page Overview
Create an Assessment Status tracking page with Material Design, featuring date range selection, project filtering, assessment timeline table, and status tracking. Similar to Action Items page but focused on assessment lifecycle management.

---

## Layout Structure

### Main Container
- **Background**: #f5f7fa (light gray)
- **Padding**: 6px
- **Min-height**: 100vh
- **Font-family**: 'Roboto', 'Segoe UI', Tahoma, sans-serif

---

## Unified Compact Header Row
**Background**: White (#ffffff)
**Border-radius**: 8px
**Box-shadow**: 0 2px 4px rgba(0, 0, 0, 0.1)
**Padding**: 6px 10px
**Margin-bottom**: 6px
**Min-height**: 44px
**Display**: Horizontal flex, gap 8px, nowrap

### Header Components (Left to Right)

**1. Back Button**:
- **Size**: 26×26px
- **Icon**: Material icon "arrow_back", 18px, color #757575
- **Hover**: Background rgba(0,0,0,0.04), icon color #1976d2

**2. Customer Logo**:
- **Size**: 26×26px
- **Border-radius**: 4px

**3. Date Range Selectors** (KEY DIFFERENCE from Action Items):

**From Month Dropdown**:
- **Width**: 90px
- **Height**: 32px
- **Label**: "From Month"
- **Options**: JAN, FEB, MAR, APR, MAY, JUN, JUL, AUG, SEP, OCT, NOV, DEC
- **Font-size**: 11px (label), 12px (options)

**From Year Dropdown**:
- **Width**: 75px
- **Height**: 32px
- **Label**: "Year"
- **Options**: Dynamic (current ± 3 years)

**Date Separator** ("-"):
- **Font-size**: 16px
- **Color**: #757575
- **Margin**: 0 4px

**To Month Dropdown**:
- **Same styling as From Month**

**To Year Dropdown**:
- **Same styling as From Year**

**4. Project Selector**:
- **Component**: Portfolio-Project-Selector
- **Width**: Auto (flex)
- **Height**: 32px compact

**5. Status Filter Group**:
- **Label**: "Status:" (font-weight 500, font-size 12px)
- **Checkboxes**: Open, Closed, Canceled
- **Layout**: Horizontal, inline
- **Font-size**: 12px

**6. Action Buttons** (Right Side):
- **Export Button**: Icon only, 28×28px, Material icon "download"
- **Filter Button**: Icon only, 28×28px, Material icon "filter_list"

---

## Data Table (Material Table)
**Background**: White
**Border-radius**: 8px
**Box-shadow**: 0 2px 8px rgba(0, 0, 0, 0.08)
**Margin-top**: 12px

### Table Header
**Background**: #bbdefb (light blue)
**Height**: 48px
**Font-weight**: 600
**Font-size**: 12px
**Text-transform**: capitalize
**Color**: #333

### Column Definitions

| Column | Width | Content |
|--------|-------|---------|
| **No.** | 50px | Index badge (circular, gradient blue) |
| **Assessment Title** | 250px | Clickable link, primary color |
| **Assessment Type** | 150px | Text |
| **Project Name** | 200px | Text with truncation |
| **Planned Date** | 120px | Date (dd-MMM-yyyy) |
| **Actual Start** | 120px | Date or "—" |
| **Due Date** | 120px | Date |
| **Completion Date** | 120px | Date or "—" |
| **Status** | 120px | Status badge |
| **Progress %** | 100px | Progress bar + percentage |
| **Assessor** | 150px | User name |
| **Actions** | 100px | Icon buttons |

### Status Badges
**Open**: Background #e3f2fd, Color #1976d2  
**Completed**: Background #e8f5e9, Color #388e3c  
**In Progress**: Background #fff3e0, Color #f57c00  
**Canceled**: Background #ffebee, Color #d32f2f

**Badge Styling**:
- **Padding**: 3px 10px
- **Border-radius**: 10px
- **Font-size**: 10px
- **Font-weight**: 600
- **Text-transform**: uppercase

### Progress Bar
**Container**: 100px width
**Height**: 6px
**Background**: #e0e0e0
**Fill**: Linear gradient (#1976d2 → #1565c0)
**Border-radius**: 3px
**Text**: Percentage (12px, font-weight 600) above bar

### Row Hover
**Background**: rgba(103, 126, 234, 0.05)
**Box-shadow**: 0 2px 4px rgba(0, 0, 0, 0.08)

### Action Buttons
**Edit**: Icon "edit", 18px, color #1976d2, hover background rgba(25, 118, 210, 0.08)  
**View**: Icon "visibility", 18px, color #5856d6, hover background rgba(88, 86, 214, 0.08)  
**Delete**: Icon "delete", 18px, color #d32f2f, hover background rgba(211, 47, 47, 0.08)

---

## Date Range Validation

### Visual Feedback
- **Invalid Range**: Red border on dropdowns
- **Valid Range**: Normal border
- **Error Message**: Below dropdowns (12px, color #d32f2f)

### Business Rules
- To Date must be >= From Date
- Maximum range: 12 months
- Cannot select future dates

---

## Timeline View (Optional Alternative View)

### Toggle Button
**Text**: "Timeline View" / "Table View"
**Position**: Top right of table
**Style**: Material chip with icon

### Timeline Layout
**Display**: Vertical timeline with cards
**Card per Assessment**:
- **Left**: Date marker (circle + vertical line)
- **Right**: Assessment card with details
- **Color**: Based on status
- **Animation**: Fade in on scroll

---

## Empty State
**Icon**: Material icon "event_note", 64px, color #bdbdbd  
**Title**: "No Assessments Found" (18px, font-weight 600)  
**Description**: "No assessments scheduled for the selected date range and projects" (14px, color #757575)  
**Action**: "Adjust filters" button

---

## Color Palette

### Primary
- **Blue**: #1976d2
- **Blue Light**: #bbdefb
- **Blue Dark**: #1565c0

### Status Colors
- **Open**: #1976d2 (blue)
- **In Progress**: #f57c00 (orange)
- **Completed**: #388e3c (green)
- **Canceled**: #d32f2f (red)

### Background
- **Page**: #f5f7fa
- **Card**: #ffffff
- **Header**: #bbdefb

---

## Typography

### Font Sizes
- **Headers**: 12px
- **Body**: 12-13px
- **Labels**: 11px
- **Badges**: 10px

### Font Weights
- **Headers**: 600
- **Body**: 400
- **Badges**: 600

---

## Spacing

### Padding
- **Container**: 6px
- **Header**: 6px 10px
- **Table cells**: 10px 8px

### Gaps
- **Header items**: 8px
- **Form fields**: 8px

---

## Responsive Design

### Mobile (≤768px)
- **Header**: Wrap to multiple rows
- **Date selectors**: Stack vertically
- **Table**: Card layout transformation
- **Font sizes**: Reduce by 1px

---

## Key Differences from Action Items Page

1. **Date Range Selection**: From/To month+year dropdowns instead of single filter
2. **Timeline Focus**: Planned vs Actual dates emphasis
3. **Progress Tracking**: Progress bars instead of simple status
4. **Assessment Types**: Categorization by assessment methodology
5. **Assessor Column**: Track who performed assessment

---

## Implementation Notes

1. Use Angular Material v19+ components
2. Implement date range validation
3. Add mat-table with sorting
4. Create reusable date range selector component
5. Implement progress bar as standalone component
6. Add export to Excel with date range in filename
7. Use reactive forms for date pickers
8. Implement proper validation messages
9. Add loading states between date changes
10. Cache data for quick date range switching

---

This prompt recreates the Assessment Status page with date range selection, progress tracking, and timeline management features using Material Design principles.
