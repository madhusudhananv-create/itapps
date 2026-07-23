# Checklist Findings Page - Complete UI Recreation Prompt

## Page Overview
Create a findings management page for tracking, categorizing, and resolving audit/assessment findings with Material Design cards, severity classification, attachment support, and action plan tracking.

---

## Layout Structure

### Main Container
- **Background**: #F8FAFC
- **Padding**: 16px
- **Min-height**: 100vh
- **Font-family**: 'Roboto', 'Segoe UI', sans-serif

---

## Page Header
**Background**: White
**Border-radius**: 8px
**Box-shadow**: 0 2px 4px rgba(0, 0, 0, 0.1)
**Padding**: 16px 20px
**Margin-bottom**: 16px

### Header Layout (Flex, space-between)

**Left Side**:
- **Back Button**: 32×32px, icon "arrow_back"
- **Customer Logo**: 32px height
- **Page Title**: "Checklist Findings" (18px, font-weight 600)

**Right Side**:
- **Add Finding Button**: Primary raised button
  - Icon: Material icon "add"
  - Text: "Add Finding"
  - Background: #1976d2

---

## Filter Section
**Background**: White
**Border-radius**: 8px
**Padding**: 12px 16px
**Margin-bottom**: 16px

### Filters (Horizontal flex, gap 12px)

1. **Severity Filter** (Multi-select chips):
   - Critical, High, Medium, Low
   - Color-coded chips

2. **Status Filter** (Multi-select chips):
   - Open, In Progress, Resolved, Closed

3. **Assessment Filter** (Dropdown):
   - List of assessments

4. **Search Input**:
   - Placeholder: "Search findings..."
   - Icon: "search"

---

## Findings Cards Display
**Layout**: Grid auto-fit, min 350px per column, gap 16px

### Finding Card
**Background**: White
**Border-radius**: 12px
**Box-shadow**: 0 2px 8px rgba(0, 0, 0, 0.08)
**Padding**: 20px
**Transition**: all 0.2s ease
**Hover**: Box-shadow increase, translateY(-2px)

#### Card Header
**Layout**: Horizontal flex, space-between

**Left**:
- **Finding ID**: (12px, color #757575, uppercase)
- **Finding Title**: (16px, font-weight 600, color #212121)

**Right**:
- **Severity Badge**: Circular badge with color
  - **Critical**: Red (#d32f2f), icon "error"
  - **High**: Orange (#f57c00), icon "warning"
  - **Medium**: Yellow (#fbc02d), icon "info"
  - **Low**: Green (#388e3c), icon "check_circle"
  
**Severity Badge Styling**:
- **Size**: 32×32px (circular)
- **Icon**: 18px, white
- **Box-shadow**: 0 2px 4px rgba(0,0,0,0.2)

#### Card Body

**Finding Description**:
- **Font-size**: 14px
- **Color**: #424242
- **Line-height**: 1.6
- **Max-lines**: 3 (with "Show more" link)
- **Margin-bottom**: 12px

**Metadata Grid** (2 columns on desktop):

**Checkpoint**:
- Label: "Checkpoint" (11px, uppercase, #757575)
- Value: Text (13px, #212121)

**Process/Area**:
- Label: "Process Area"
- Value: Text with icon "folder"

**Identified Date**:
- Label: "Identified On"
- Value: Date (dd-MMM-yyyy)

**Due Date**:
- Label: "Target Closure"
- Value: Date with color coding
  - **Overdue**: Red
  - **Due Soon** (<7 days): Orange
  - **On Track**: Normal

**Status**:
- **Badge**: Inline badge with color
  - **Open**: Blue (#2196f3)
  - **In Progress**: Orange (#ff9800)
  - **Resolved**: Purple (#9c27b0)
  - **Closed**: Green (#4caf50)

**Badge Styling**:
- **Padding**: 4px 10px
- **Border-radius**: 12px
- **Font-size**: 11px
- **Font-weight**: 600

**Owner/Assigned To**:
- **Avatar + Name**: 24px avatar, name next to it
- **Layout**: Horizontal flex, gap 8px

#### Card Footer

**Action Section**:
- **Layout**: Horizontal flex, space-between

**Left** (Info chips):
- **Attachments Count**: Icon "attach_file" + number
- **Comments Count**: Icon "comment" + number  
- **Actions Count**: Icon "task_alt" + number

**Right** (Action buttons):
- **View Details**: Icon button "visibility", color #1976d2
- **Edit**: Icon button "edit", color #5856d6
- **Delete**: Icon button "delete", color #d32f2f

---

## Findings Table View (Alternative)

### Toggle Button
**Position**: Top right near filters
**Text**: "Card View" / "Table View"
**Icon**: "view_module" / "view_list"

### Table Columns

| Column | Width | Content |
|--------|-------|---------|
| **ID** | 80px | Finding reference |
| **Title** | 250px | Finding title |
| **Severity** | 100px | Badge |
| **Process Area** | 150px | Text |
| **Status** | 120px | Badge |
| **Identified** | 120px | Date |
| **Due Date** | 120px | Date (color-coded) |
| **Owner** | 150px | Name |
| **Actions** | 100px | Icon buttons |

---

## Finding Details Modal/Side Panel

### Panel Size
**Width**: 600px (desktop), 100vw (mobile)
**Height**: 100vh
**Position**: Fixed right, slide in animation

### Panel Header
**Background**: #1976d2 (gradient)
**Color**: White
**Padding**: 20px 24px

**Layout**: Horizontal flex, space-between

**Left**:
- Finding ID + Title (20px, font-weight 600)

**Right**:
- **Close Button**: Icon "close", 36×36px

### Panel Body (Scrollable)
**Padding**: 24px

#### Sections

**1. Basic Information** (Card):
- Finding Description (full text)
- Severity (badge with icon)
- Status (dropdown to update)
- Priority (dropdown)

**2. Context Information** (Card):
- Assessment Name
- Checkpoint Reference
- Process Area / Service Tower
- Identified By + Date
- Last Updated By + Date

**3. Impact & Risk** (Card):
- Impact Description (textarea)
- Risk Level (dropdown)
- Business Impact (text)

**4. Action Plan** (Expandable Card):
- **Corrective Action** (textarea)
- **Preventive Action** (textarea)
- **Responsible Person** (dropdown)
- **Target Date** (datepicker)
- **Actual Completion Date** (datepicker)

**5. Attachments** (Card):
- **Upload Area**: Drag-drop zone
- **File List**: File name, size, uploaded by, date
- **Download/Delete** buttons per file

**6. Comments/Discussion** (Card):
- **Comment Thread**: Timeline style
- **Add Comment**: Textarea + Send button
- **Each Comment**: Avatar, name, timestamp, text

**7. History/Audit Trail** (Expandable Card):
- **Timeline**: Status changes, edits, comments
- **Format**: Date, User, Action, Details

### Panel Footer
**Padding**: 16px 24px
**Border-top**: 1px solid #e0e0e0
**Background**: #fafafa

**Buttons**:
- **Save**: Primary button, gradient background
- **Cancel**: Stroked button

---

## Color Palette

### Severity Colors
- **Critical**: #d32f2f (red)
- **High**: #f57c00 (orange)
- **Medium**: #fbc02d (yellow/amber)
- **Low**: #388e3c (green)

### Status Colors
- **Open**: #2196f3 (blue)
- **In Progress**: #ff9800 (orange)
- **Resolved**: #9c27b0 (purple)
- **Closed**: #4caf50 (green)

### Background
- **Page**: #F8FAFC
- **Card**: #FFFFFF
- **Panel Header**: #1976d2

---

## Typography

### Font Sizes
- **Page Title**: 18px
- **Card Title**: 16px
- **Description**: 14px
- **Labels**: 11px (uppercase)
- **Body Text**: 13px
- **Badges**: 11px

### Font Weights
- **Titles**: 600
- **Body**: 400
- **Labels**: 600
- **Badges**: 600

---

## Spacing

### Padding
- **Container**: 16px
- **Cards**: 20px
- **Panel**: 24px

### Margins
- **Between cards**: 16px
- **Between sections**: 16px

### Gaps
- **Grid**: 16px
- **Flex items**: 8-12px

---

## Interactions

### Card Hover
**Transform**: translateY(-2px)
**Box-shadow**: 0 4px 16px rgba(0, 0, 0, 0.12)

### Status Update
**Animation**: Fade color transition (0.3s)
**Feedback**: Snackbar "Status updated successfully"

### File Upload
**Animation**: Upload progress bar
**Feedback**: File name + success icon

---

## Empty State
**Icon**: Material icon "search_off", 64px, color #bdbdbd  
**Title**: "No Findings Found" (18px, font-weight 600)  
**Description**: "No findings match your current filters" (14px, color #757575)  
**Action**: "Clear Filters" button

---

## Responsive Design

### Mobile (≤768px)
- **Cards**: Single column, full width
- **Panel**: Full screen overlay
- **Metadata**: Vertical stack
- **Action buttons**: Full width

---

## Implementation Notes

1. Use Angular Material v19+ components
2. Implement virtual scrolling for large lists
3. Use Material dialog or CDK overlay for side panel
4. Add file upload service with progress tracking
5. Implement real-time updates (optional WebSocket)
6. Add confirmation dialogs for delete
7. Implement comment threading
8. Add rich text editor for descriptions (optional)
9. Implement drag-drop file upload
10. Add export findings to PDF/Excel  
11. Implement bulk actions (select multiple, update status)
12. Add printing stylesheet

---

This prompt recreates the Findings Management page with card-based display, severity tracking, action plans, and comprehensive finding lifecycle management.
