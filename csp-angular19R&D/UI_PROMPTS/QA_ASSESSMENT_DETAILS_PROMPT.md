# QA Assessment Details Page - Complete UI Recreation Prompt

## Page Overview
Create a Quality Assessment details page for viewing and managing assessment results, checkpoint scores, evidence attachments, and assessment lifecycle with Material Design tabs, expandable sections, and comprehensive audit trail.

---

## Layout Structure

### Main Container
- **Background**: #f5f7fa
- **Padding**: 12px
- **Min-height**: 100vh
- **Font-family**: 'Roboto', 'Segoe UI', Tahoma, sans-serif

---

## Page Header
**Background**: White
**Border-radius**: 8px
**Box-shadow**: 0 2px 4px rgba(0, 0, 0, 0.1)
**Padding**: 16px 20px
**Margin-bottom**: 12px

### Header Layout (Flex, space-between)

**Left Side**:
- **Back Button**: 32×32px, icon "arrow_back"
- **Assessment Icon**: Material icon "assignment", 28px, color #1976d2
- **Assessment Title**: 20px, font-weight 600
- **Assessment ID**: 12px, color #757575, uppercase

**Right Side**:
- **Status Badge**: Large badge showing current status
  - **Planned**: Blue
  - **In Progress**: Orange
  - **Under Review**: Purple
  - **Completed**: Green
  - **Approved**: Dark Green

**Badge Styling**:
- **Padding**: 8px 16px
- **Border-radius**: 20px
- **Font-size**: 13px
- **Font-weight**: 600
- **Box-shadow**: 0 2px 6px rgba(0,0,0,0.15)

---

## Assessment Overview Card
**Background**: White
**Border-radius**: 8px
**Padding**: 20px
**Margin-bottom**: 12px

### Layout: Grid 4 columns (2 on tablet, 1 on mobile)

**Metadata Fields**:

1. **Project Name**:
   - Label: "Project" (11px, uppercase, #757575)
   - Value: Project name (14px, #212121)
   - Icon: "folder"

2. **Assessor**:
   - Label: "Assessor"
   - Value: Name with avatar (24px)
   - Icon: "person"

3. **Planned Date**:
   - Label: "Planned Date"
   - Value: dd-MMM-yyyy
   - Icon: "event"

4. **Actual Completion**:
   - Label: "Completed On"
   - Value: dd-MMM-yyyy or "In Progress"
   - Icon: "event_available"

5. **Compliance Score**:
   - Label: "Process Compliance"
   - Value: Large percentage (24px, font-weight 700)
   - Color: Green ≥80%, Orange 60-79%, Red <60%
   - Progress bar below (full width, 6px height)

6. **Checkpoints**:
   - Label: "Checkpoints"
   - Value: "Completed / Total" (e.g., "45/50")
   - Progress indicator

7. **Findings**:
   - Label: "Total Findings"
   - Value: Count with severity breakdown
   - Icons for Critical/High/Medium/Low

8. **Last Updated**:
   - Label: "Last Modified"
   - Value: Date + time
   - By: Updated by name

---

## Content Tabs (Material Tabs)
**Background**: White
**Border-radius**: 8px
**Margin-bottom**: 12px

### Tab Configuration
**Tab Height**: 48px
**Indicator**: Blue underline, 3px
**Font-size**: 14px
**Font-weight**: 500
**Active Color**: #1976d2  
**Inactive Color**: #757575

### Tabs

1. **Checklist** (Default active)
2. **Findings**
3. **Evidence**
4. **Comments**
5. **History**

---

## Tab 1: Checklist View

### Hierarchical Display (4 Levels)
Same structure as Checklist Execution page:

**Service Tower** (Level 1):
- **Background**: Linear gradient (blue)
- **Color**: White
- **Header**: Icon + Title + Score
- **Expandable**: Yes

**Process Model** (Level 2):
- **Background**: Light blue (#F0F9FF)
- **Border-left**: 4px ocean blue
- **Icon**: "account_tree"

**Process Area** (Level 3):
- **Background**: Light teal (#F0FDFA)
- **Border-left**: 3px cyan

**Process** (Level 4):
- **Background**: Light purple (#F5F3FF)
- **Border-left**: 2px indigo

### Checkpoints Table (within Process)
**Read-only mode** (if assessment completed)

**Columns**:
| Column | Width | Content |
|--------|-------|---------|
| **S.No** | 50px | Index |
| **Checkpoint** | 300px | Description |
| **Wheelage** | 100px | Category |
| **Score** | 80px | Number with color |
| **Status** | 120px | Badge (Met/Not Met/NA) |
| **Evidence** | 100px | Icon if attached |
| **Findings** | 100px | Icon + count |

**Score Color Coding**:
- **100**: Green
- **75-99**: Light green
- **50-74**: Orange
- **<50**: Red

---

## Tab 2: Findings View

### Findings List (Card-based)
Similar to Checklist Findings page but scoped to this assessment

**Card Layout**: Vertical stack, gap 12px

**Each Finding Card**:
- **Severity Badge**: Top right corner
- **finding Title** (16px, font-weight 600)
- **Checkpoint Reference**: Link to checkpoint
- **Description**: Truncated (3 lines max)
- **Status**: Badge
- **Due Date**: With urgency indicator
- **Actions**: View/Edit buttons

**Filter Bar Above**:
- **Severity Chips**: Filter by Critical/High/Medium/Low
- **Status Chips**: Filter by Open/Resolved/Closed

---

## Tab 3: Evidence View

### Evidence Grid
**Layout**: Grid 3 columns (desktop), 2 (tablet), 1 (mobile)
**Gap**: 16px

### Evidence Card (per checkpoint with evidence)

**Card Structure**:
- **Thumbnail/Icon**: File type icon or image preview (120px height)
- **Checkpoint Reference**: Small gray text
- **File Name**: 14px, truncated, tooltip for full name
- **File Size**: 12px, gray
- **Uploaded By**: Avatar + name (12px)
- **Upload Date**: dd-MMM-yyyy
- **Actions**:
  - **Download**: Icon button "download"
  - **Preview**: Icon button "visibility" (for images/PDFs)
  - **Delete**: Icon button "delete" (if has permission)

**File Type Icons**:
- **Image**: "image", color #4caf50
- **PDF**: "picture_as_pdf", color #f44336
- **Excel**: "table_chart", color #388e3c
- **Word**: "description", color #2196f3
- **Other**: "insert_drive_file", color #757575

**Upload New Evidence Section**:
- **Drag-drop zone**: Dashed border, icon "cloud_upload"
- **Or Browse**: Button
- **Checkpoint Selector**: Dropdown to assign to checkpoint

---

## Tab 4: Comments View

### Comment Thread
**Layout**: Vertical timeline style

**Each Comment**:
- **Avatar**: 40px, left side
- **Name + Role**: 14px name, 12px role
- **Timestamp**: 11px, gray, relative time (e.g., "2 hours ago")
- **Comment Text**: 14px, multi-line, white background card
- **Actions** (if owner):
  - **Edit**: Icon "edit", 16px
  - **Delete**: Icon "delete", 16px

**Add Comment Section** (Bottom/Sticky):
- **Avatar**: Current user
- **Textarea**: Expandable, placeholder "Add a comment..."
- **Attachments**: Icon button to attach files
- **Send Button**: Icon "send", primary color

**Comment Card Styling**:  
- **Background**: White
- **Border**: 1px solid #e0e0e0
- **Border-radius**: 8px
- **Padding**: 12px
- **Box-shadow**: 0 1px 3px rgba(0,0,0,0.05)

---

## Tab 5: History/Audit Trail View

### Timeline Display
**Layout**: Vertical timeline with connecting line

**Each Event**:
- **Timestamp**: Left side (12px, gray)
- **Event Card**: Right side
  - **Icon**: Event type icon (circular background)
  - **Title**: Action performed (14px, font-weight 600)
  - **Actor**: "by [Name]" (12px, gray)
  - **Details**: Additional info if applicable
  - **Changed Fields**: Show old → new values

**Event Types & Icons**:
- **Created**: "add_circle", blue
- **Status Changed**: "swap_horiz", orange
- **Checkpoint Updated**: "edit", purple
- **Finding Added**: "report_problem", red
- **Evidence Uploaded**: "attach_file", green
- **Comment Added**: "comment", cyan
- **Approved**: "check_circle", dark green

**Timeline Line**:
- **Position**: Left side, vertical
- **Color**: #e0e0e0
- **Width**: 2px

**Icon Circles**:
- **Size**: 32×32px
- **Icon**: 18px, white
- **Background**: Color based on event type
- **Border**: 2px white
- **Box-shadow**: 0 2px 4px rgba(0,0,0,0.2)

---

## Action Buttons (Bottom Sticky Bar)

### If Status = "In Progress" or "Under Review"
**Background**: White
**Border-top**: 1px solid #e0e0e0
**Padding**: 16px 20px
**Box-shadow**: 0 -2px 8px rgba(0,0,0,0.08)

**Buttons** (Horizontal flex, gap 12px, center aligned):

1. **Save Draft**: Stroked button, "save"
2. **Submit for Review**: Primary button, "send"
3. **Export PDF**: Stroked button, "download"
4. **Print**: Stroked button, "print"

### If Status = "Completed"
**Buttons**:
1. **Re-open**: Stroked button (if has permission)
2. **Export PDF**: Primary button
3. **Print**: Stroked button

---

## Dialogs/Modals

### Approve Assessment Dialog
**Width**: 500px
**Title**: "Approve Assessment"
**Icon**: "check_circle", green

**Content**:
- Confirmation message
- Optional approval comments (textarea)
- Signature/approval checkbox

**Buttons**:
- **Cancel**: Stroked
- **Approve**: Primary (green background)

### Reject/Request Changes Dialog
**Width**: 500px
**Title**: "Request Changes"
**Icon**: "report_problem", orange

**Content**:
- Required rejection reason (textarea)
- Assign back to (dropdown - assessor)

**Buttons**:
- **Cancel**
- **Request Changes**: Warn color

---

## Color Palette

### Status Colors
- **Planned**: #2196f3 (blue)
- **In Progress**: #ff9800 (orange)
- **Under Review**: #9c27b0 (purple)
- **Completed**: #4caf50 (green)
- **Approved**: #2e7d32 (dark green)
- **Rejected**: #d32f2f (red)

### Score Colors
- **100**: #2e7d32 (dark green)
- **80-99**: #66bb6a (green)
- **60-79**: #ffa726 (orange)
- **<60**: #ef5350 (red)

---

## Typography

### Font Sizes
- **Page Title**: 20px
- **Section Titles**: 16px
- **Tab Labels**: 14px
- **Body Text**: 14px
- **Labels**: 11px (uppercase)
- **Metadata Values**: 14px
- **Comments**: 14px

---

## Responsive Design

### Mobile (≤768px)
- **Metadata Grid**: 1 column
- **Tabs**: Scrollable horizontal
- **Evidence Grid**: 1 column
- **Action bar**: Vertical stack

---

## Implementation Notes

1. Use Angular Material v19+ tabs component
2. Implement lazy loading for tab content
3. Add PDF export functionality (jsPDF or server-side)
4. Implement print stylesheet
5. Add file upload service with progress
6. Use virtual scrolling for large checkpoint lists
7. Implement real-time comment updates (optional)
8. Add undo/redo for edits (optional)
9. Implement autosave draft functionality
10. Add keyboard shortcuts (Ctrl+S for save, etc.)

---

This prompt recreates the QA Assessment Details page with comprehensive tabs for checklist, findings, evidence, comments, and history with Material Design components and modern interactions.
