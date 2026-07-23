# Configuration EXT Component Page - Complete UI Recreation Prompt

## Page Overview
Create a modern configuration management page for external system integrations with Material Design table, form fields, responsive layout, and proper access control. Manages configuration settings for various system modules.

---

## Layout Structure

### Main Container
- **Background**: #F8FAFC (light gray)
- **Padding**: 16px
- **Min-height**: 100vh
- **Font-family**: 'Roboto', 'Segoe UI', Tahoma, sans-serif

---

## Page Header
**Background**: White (#FFFFFF)
**Padding**: 16px 20px
**Border-radius**: 8px
**Box-shadow**: 0 2px 4px rgba(0, 0, 0, 0.1)
**Margin-bottom**: 12px

### Header Layout
**Display**: Horizontal flex, space-between, align-center

**Left Side**:
- **Back Button**: 32×32px, Material icon "arrow_back", transparent background
- **Customer Logo**: Height 32px, auto width, margin-right 8px
- **Page Title**: "Configuration Management" (18px, font-weight 600, color #212121)

**Right Side**:
- **Add New Button**: Primary raised button
  - Icon: Material icon "add"
  - Text: "Add Configuration"
  - Height: 36px
  - Background: #1976d2
  - Color: White
  - Font-weight: 500

---

## Filter Section
**Background**: White
**Padding**: 12px 16px
**Border-radius**: 8px
**Box-shadow**: 0 2px 4px rgba(0, 0, 0, 0.1)
**Margin-bottom**: 12px

### Filter Layout
**Display**: Horizontal flex, gap 12px, align-center

**Components**:
1. **Module Filter** (Material Select):
   - **Width**: 200px
   - **Label**: "Module"
   - **Options**: All modules available
   - **Appearance**: Outline

2. **Status Filter** (Material Chip List):
   - **Options**: Active, Inactive
   - **Selectable**: Yes
   - **Style**: Material chips

3. **Search Input** (Material Input):
   - **Width**: 300px
   - **Placeholder**: "Search configurations..."
   - **Icon**: Material icon "search" (prefix)

4. **Clear Filters Button**:
   - **Type**: Stroked button
   - **Text**: "Clear"
   - **Height**: 36px

---

## Data Table (Material Table)
**Background**: White
**Border-radius**: 8px
**Box-shadow**: 0 2px 8px rgba(0, 0, 0, 0.08)
**Overflow**: hidden

### Table Specifications
**Width**: 100%
**Font-size**: 13px
**Mat-elevation**: z2

### Table Header
**Background**: #F5F7FA
**Height**: 48px
**Position**: sticky, top 0
**Z-index**: 10

**Header Cell Styling**:
- **Color**: #424242
- **Font-weight**: 600
- **Font-size**: 13px
- **Text-transform**: capitalize
- **Padding**: 12px 16px
- **Text-align**: left
- **Border-bottom**: 2px solid #E0E0E0

### Column Definitions

| Column | Width | Content | Sortable |
|--------|-------|---------|----------|
| **No.** | 60px | Sequential index | No |
| **Module Name** | 150px | Text | Yes |
| **Config Key** | 200px | Text (monospace) | Yes |
| **Config Value** | 250px | Text/Display value | Yes |
| **Data Type** | 120px | Badge (String/Number/Boolean/JSON) | Yes |
| **Description** | 300px | Text (truncated) | No |
| **Status** | 100px | Toggle/Badge | Yes |
| **Last Updated** | 150px | Date (dd-MMM-yyyy) | Yes |
| **Updated By** | 150px | User name | Yes |
| **Actions** | 100px | Icon buttons | No |

### Data Row Styling
**Height**: 56px
**Background**: White
**Border-bottom**: 1px solid rgba(0, 0, 0, 0.06)
**Transition**: all 0.2s ease

**Hover State**:
- **Background**: #F9FAFB
- **Box-shadow**: 0 1px 3px rgba(0, 0, 0, 0.08)

**Cell Styling**:
- **Padding**: 12px 16px
- **Vertical-align**: middle
- **Color**: #424242
- **Font-size**: 13px

### Index Column
**Text-align**: center
**Font-weight**: 600
**Color**: #757575

### Config Key Column
**Font-family**: 'Courier New', monospace
**Font-size**: 12px
**Color**: #5E35B1
**Background**: #F5F3FF (light purple)
**Padding**: 6px 10px
**Border-radius**: 4px
**Display**: inline-block

### Config Value Column
**Max-width**: 250px
**Overflow**: hidden
**Text-overflow**: ellipsis
**White-space**: nowrap
**Tooltip**: Full value on hover

**Value Types**:
- **Boolean**: Toggle switch or Yes/No badge
- **Number**: Right-aligned, monospace font
- **String**: Left-aligned, normal font
- **JSON**: Expandable icon/button to view full JSON

### Data Type Badge
**Display**: inline-block
**Padding**: 4px 10px
**Border-radius**: 12px
**Font-size**: 11px
**Font-weight**: 600
**Text-transform**: uppercase

**Type Colors**:
- **String**: Background #E3F2FD, Color #1976D2
- **Number**: Background #E8F5E9, Color #388E3C
- **Boolean**: Background #FFF3E0, Color #F57C00
- **JSON**: Background #F3E5F5, Color #7B1FA2

### Status Column
**Material Slide Toggle**:
- **Size**: Medium
- **Color**: Primary (#1976d2) when active
- **Track**: Gray when inactive
- **Disabled**: Based on access control

**Alternative Badge** (read-only):
- **Active**: Background #E8F5E9, Color #388E3C, Text "Active"
- **Inactive**: Background #FFEBEE, Color #D32F2F, Text "Inactive"

### Date Column
**Format**: dd-MMM-yyyy (e.g., "15-Jan-2024")
**Color**: #616161
**Font-size**: 12px

### Actions Column
**Layout**: Horizontal flex, gap 4px, justify center

**Edit Button**:
- **Type**: Icon button (mat-icon-button)
- **Icon**: Material icon "edit", 18px
- **Color**: #1976D2
- **Size**: 36×36px
- **Hover**: Background rgba(25, 118, 210, 0.08)
- **Tooltip**: "Edit Configuration"

**Delete Button**:
- **Type**: Icon button
- **Icon**: Material icon "delete", 18px
- **Color**: #D32F2F
- **Size**: 36×36px
- **Hover**: Background rgba(211, 47, 47, 0.08)
- **Tooltip**: "Delete Configuration"

**View/Expand Button** (for JSON):
- **Icon**: Material icon "visibility", 18px
- **Color**: #7B1FA2
- **Tooltip**: "View Full Value"

---

## Pagination & Table Features
**Position**: Below table
**Background**: White
**Padding**: 12px 16px
**Border-top**: 1px solid #E0E0E0

**Material Paginator**:
- **Page sizes**: [10, 25, 50, 100]
- **Default**: 25
- **Style**: Material Design

**Mat-sort**: Enabled on sortable columns with arrow indicators

---

## Add/Edit Dialog

### Dialog Container
**Width**: 700px (desktop), 95vw (mobile)
**Max-height**: 85vh
**Border-radius**: 12px
**Box-shadow**: 0 11px 15px rgba(0, 0, 0, 0.2)

### Dialog Header
**Padding**: 20px 24px
**Border-bottom**: 1px solid #E0E0E0
**Background**: White

**Layout**: Horizontal flex, space-between

**Title**:
- **Icon**: Material icon "settings", 24px, color #1976D2
- **Text**: "Add Configuration" or "Edit Configuration" (18px, font-weight 600, color #212121)

**Close Button**:
- **Icon**: Material icon "close"
- **Size**: 36×36px

### Dialog Body
**Padding**: 24px
**Max-height**: calc(85vh - 140px)
**Overflow-y**: auto

**Form Layout**: Vertical flex, gap 16px

**Form Fields** (All Material Form Fields):

1. **Module Name** (Select - Required):
   - **Label**: "Module Name"
   - **Options**: Project, Task, Risk, KPI, Dashboard, etc.
   - **Appearance**: Outline
   - **Required marker**: Red asterisk

2. **Configuration Key** (Input - Required):
   - **Label**: "Configuration Key"
   - **Placeholder**: "e.g., max_upload_size"
   - **Pattern**: Lowercase, underscores only
   - **Hint**: "Use lowercase letters and underscores only"

3. **Configuration Value** (Textarea - Required):
   - **Label**: "Configuration Value"
   - **Rows**: 3
   - **Auto-grow**: Yes
   - **Placeholder**: "Enter value..."

4. **Data Type** (Select - Required):
   - **Label**: "Data Type"
   - **Options**: String, Number, Boolean, JSON
   - **Default**: String

5. **Description** (Textarea - Optional):
   - **Label**: "Description"
   - **Rows**: 2
   - **Placeholder**: "Brief description of this configuration..."

6. **Status** (Slide Toggle):
   - **Label**: "Active"
   - **Default**: Checked (true)
   - **Color**: Primary

**Validation**:
- Required fields: Show error messages below field
- Config key: Must be unique, lowercase with underscores
- Config value: Validate based on data type (number, JSON format, etc.)
- Real-time validation feedback

### Dialog Footer
**Padding**: 16px 24px
**Border-top**: 1px solid #E0E0E0
**Background**: #FAFAFA

**Button Layout**: Horizontal flex, justify-end, gap 12px

**Cancel Button**:
- **Type**: Stroked button
- **Text**: "Cancel"
- **Height**: 40px

**Save Button**:
- **Type**: Raised button
- **Color**: Primary (#1976D2)
- **Text**: "Save Configuration"
- **Icon**: Material icon "save"
- **Height**: 40px
- **Disabled**: When form invalid

---

## Confirmation Dialog (Delete)

### Dialog Size
**Width**: 400px
**Min-height**: 180px

### Dialog Content
**Icon**: Material icon "warning", 56px, color #FF9800
**Title**: "Confirm Deletion" (20px, font-weight 600)
**Message**: "Are you sure you want to delete this configuration? This action cannot be undone." (14px, color #616161)

### Actions
**Layout**: Horizontal flex, justify-end, gap 12px

**Cancel Button**: Stroked button, "Cancel"
**Delete Button**: Raised button, warn color (#D32F2F), "Delete"

---

## Empty State
**Visibility**: When no configurations
**Padding**: 60px 20px
**Text-align**: center
**Background**: White
**Border-radius**: 8px

**Components**:
- **Icon**: Material icon "settings", 64px, color #BDBDBD, opacity 0.5
- **Title**: "No Configurations Found" (18px, font-weight 600, color #424242)
- **Description**: "Click 'Add Configuration' to create your first configuration" (14px, color #757575)
- **Button**: "Add Configuration" (same as header button)

---

## Loading State
**Type**: Material progress bar
**Position**: Top of table
**Color**: Primary (#1976D2)
**Mode**: Indeterminate

**Alternative**: Material spinner centered in table area

---

## Snackbar Notifications
**Position**: Bottom center
**Duration**: 3000ms
**Style**: Material snackbar

**Messages**:
- "Configuration saved successfully" (success - green)
- "Configuration deleted successfully" (success)
- "Failed to save configuration" (error - red)
- "Configuration key already exists" (warning - orange)

---

## Color Palette

### Primary Colors
- **Primary**: #1976D2 (blue)
- **Accent**: #FF9800 (orange)
- **Warn**: #D32F2F (red)

### Background Colors
- **Page**: #F8FAFC
- **Card**: #FFFFFF
- **Header**: #F5F7FA
- **Hover**: #F9FAFB

### Text Colors
- **Primary**: #212121
- **Secondary**: #424242
- **Hint**: #757575
- **Disabled**: #BDBDBD

### Data Type Colors
- **String**: #1976D2 (blue)
- **Number**: #388E3C (green)
- **Boolean**: #F57C00 (orange)
- **JSON**: #7B1FA2 (purple)

### Status Colors
- **Active**: #388E3C (green)
- **Inactive**: #D32F2F (red)

---

## Typography

### Font Stack
`'Roboto', 'Segoe UI', Tahoma, sans-serif`

### Font Sizes
- **Page Title**: 18px
- **Dialog Title**: 18px
- **Table Headers**: 13px
- **Table Cells**: 13px
- **Form Labels**: 12px
- **Badges**: 11px
- **Config Keys**: 12px (monospace)

### Font Weights
- **Titles**: 600
- **Headers**: 600
- **Body**: 400
- **Badges**: 600

---

## Spacing System

### Padding
- **Page**: 16px
- **Cards**: 12-20px
- **Table Cells**: 12-16px
- **Dialog**: 20-24px

### Margin
- **Between Cards**: 12px
- **Between Form Fields**: 16px
- **Between Buttons**: 12px

---

## Responsive Design

### Desktop (>960px)
- **Table**: Full width, all columns visible
- **Dialog**: 700px width

### Tablet (600px - 959px)
- **Table**: Horizontal scroll
- **Dialog**: 90vw width
- **Filter Section**: Wrap filters

### Mobile (≤599px)
- **Table**: Transform to card layout
- **Each row**: Card with label-value pairs
- **Filters**: Vertical stack
- **Dialog**: Full width minus margins

---

## Access Control

### Role-Based Permissions
- **View**: All authenticated users
- **Add**: Admin, Config Manager
- **Edit**: Admin, Config Manager
- **Delete**: Admin only
- **Toggle Status**: Admin, Config Manager

**UI Behavior**:
- Hide buttons if no permission
- Disable form fields if read-only
- Show "No permission" message if needed

---

## Accessibility

### ARIA Labels
- All icon buttons: aria-label
- Table: role="table", proper headers
- Form fields: Associated labels
- Dialogs: aria-modal="true", role="dialog"
- Toggle switches: aria-checked state

### Keyboard Navigation
- Tab order: Logical flow
- Table: Arrow keys for cell navigation
- Dialogs: Escape to close, Enter to submit
- All interactive elements accessible

### Color Contrast
- Text on backgrounds: WCAG AA compliant (4.5:1)
- Interactive elements: Sufficient contrast
- Focus indicators: Visible outline

---

## Implementation Notes

1. Use Angular Material v19+ components
2. Implement Material table with sorting and pagination
3. Use reactive forms with validators
4. Add access control service checks
5. Implement confirmation dialogs for destructive actions
6. Add snackbar notifications for user feedback
7. Use Material dialog for add/edit forms
8. Implement proper error handling
9. Add loading states for async operations
10. Use Material slide toggle for status
11. Validate configuration keys (unique, format)
12. Implement search/filter debouncing (300ms)
13. Add export to CSV/JSON functionality (optional)
14. Implement audit logging (optional)

---

## Key Features

1. **CRUD Operations**: Full create, read, update, delete
2. **Filtering**: Module, status, search
3. **Sorting**: Multi-column sorting
4. **Pagination**: Configurable page sizes
5. **Validation**: Real-time form validation
6. **Access Control**: Role-based permissions
7. **Responsive**: Mobile, tablet, desktop layouts
8. **Status Toggle**: Quick active/inactive switch
9. **Data Types**: Support for multiple value types
10. **Search**: Quick configuration lookup
11. **Empty States**: User guidance
12. **Loading States**: Visual feedback
13. **Notifications**: Success/error messages
14. **Confirmation**: Prevent accidental deletions

---

This prompt provides complete specifications to recreate the Configuration EXT Component page with modern Material Design, proper access control, and responsive layout.
