# SQA Management System - Complete UI Specification

## Overview

Create a comprehensive **SQA (Software Quality Assurance) Management System** built with **Angular 19+** (standalone components) and **Angular Material v19+**, implementing a complete three-phase workflow: **Setup → Plan → Execute**. This system manages end-to-end quality assurance processes from checklist configuration through assessment planning to audit execution with detailed findings tracking.

The interface uses a **multi-level navigation hierarchy**:
- **Level 1**: Module switcher (SQA Management | GRC)
- **Level 2**: Phase tabs (Setup | Plan | Execute) with segmented control styling
- **Level 3**: Numbered step strip for Setup phase (10 scrollable tabs)
- **Level 4**: Sub-tabs within Plan and Execute phases

---

## Navigation Architecture

### Level 1 & 2: Module and Phase Navigation

**Module Switcher (Level 1):**
The top-level navigation uses a Material tab group containing two tabs: "SQA Management" and "GRC". This switcher allows users to toggle between different management modules.

**Phase Tabs (Level 2):**
The second level implements a segmented control-style tab group containing three phase tabs:
- **Setup** tab with settings icon
- **Plan** tab with calendar icon  
- **Execute** tab with play circle icon

Each tab label combines an icon and text label in a horizontal layout.

**Segmented Control Styling:**
The phase-level tab group features:
- Light gray background (#F5F5F7) with bottom border in Apple gray (#E5E5EA)
- Each tab has minimum width of 120px and fixed height of 44px
- Tab labels display icon and text side-by-side with 6px gap
- Font: 13px -apple-system (or Segoe UI/Roboto), medium weight (500), secondary gray color (#6E6E73)
- Icons sized at 18×18px
- Active tab: Blue accent color (#0071E3), bold weight (600)
- Blue underline indicator (2px height) for active tab
- Pagination controls hidden for clean appearance

---

## PHASE 1: SETUP

### Setup Phase Overview

The Setup phase contains **10 numbered tabs** displayed in a horizontally scrollable Apple-style step strip. Each tab manages specific aspects of the SQA configuration workflow.

**Step Strip Container:**
**Component Structure:**

Material tabs organize the content into separate sections.

**Step Strip Styling:**
**Styling Specifications:**

Background color: #FFFFFF. Text color: #6B7280. Font size: 12px. Font weight: 600. Padding: 0 20px. Border radius: 12px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 8px.

---

## SETUP TAB 1: New Process Model

### Layout Structure

The page uses a **two-column split layout**:
- **Form Section** (left): 35% width - Contains the data entry form for creating/editing process models
- **Table Section** (right): 65% width - Displays the list of existing process models with CRUD operations
- **Gap between columns**: 16px

This layout allows users to simultaneously view existing records while adding or editing new ones, promoting efficient workflow.

### Form Section

**Card Container Design:**
The form appears within a white card with:
- Background: Pure white (#FFFFFF)
- Border radius: 12px for rounded corners
- Box shadow: Subtle 0 1px 4px rgba(0,0,0,0.08) for elevation
- Padding: 16px internal spacing
- Height: Fit-content (adjusts to form fields)

**Card Header:**
The form header contains:
- A blue circular icon (add_circle for new, edit for editing mode) at 20×20px
- Title text "New Process Model" or "Edit Process Model" in 14px bold font
- Horizontal layout with 8px gap between icon and text
- Bottom border separator (1px solid #E5E5EA) with 12px padding below
- Blue accent color (#0071E3) for icon

**Form Fields (85% width for compact appearance):**

The form contains four fields arranged vertically:

1. **Process Model Description** (Required field marked with *)
   - Material outlined form field with full width
   - Prefix icon: "description" icon
   - Input type: Textarea (1 row, auto-expanding)
   - Validation: Required, pattern excludes < and > characters
   - Placeholder: "Enter process model title"
   - Bound to model.title property

2. **Industry Standard Reference** (Optional)
   - Material outlined form field with full width
   - Prefix icon: "business" icon  
   - Input type: Textarea (1 row)
   - Pattern validation: Excludes < and > characters
   - Placeholder: "Enter industry standard reference (e.g., ISO 9001, CMMI)"
   - Bound to model.description property

3. **Release Version Reference** (Optional)
   - Material outlined form field with full width
   - Prefix icon: "code" icon
   - Input type: Textarea (1 row)
   - Pattern validation: Excludes < and > characters  
   - Placeholder: "Enter release version reference (e.g., v1.0, 2024.1)"
   - Bound to model.releasE_VERSION_REFERENCE property

4. **Release Date** (Required field marked with *)
   - Material outlined form field with full width
   - Prefix icon: "event" icon
   - Input type: Date picker with calendar popup
   - Datepicker toggle button as suffix
   - Placeholder: "Select release date"
   - Bound to model.releasE_DATE property

**Action Buttons:**
Two buttons arranged horizontally below the form fields:
- **Save/Update Button**: 
  - Primary button with accent color (blue for new, primary for update)
  - Icon changes based on mode: "save" icon for new records, "update" icon for editing
  - Text changes: "Save" for new, "Update" for editing
  - Click handler: SubmitModelForm()
- **Clear Button**:
  - Standard raised button
  - "clear" icon with "Clear" text
  - Click handler: ClearInputs()
- Button styling: Flexbox layout with 12px gap, each button flex:1 (equal width), 36px height, 13px font size, medium weight (500), 8px border radius, 18×18px icons with 6px right margin
- Top margin: 24px spacing above buttons

### Table Section

**Card Container:**
The table appears in a card matching the form card style with three main areas:

**Table Header:**
- Horizontal layout with space-between alignment
- Light gray background (#F8F9FA) with bottom border (#E5E5EA)
- Padding: 12px 16px
- Left side: Blue "list" icon (18×18px) + "Process Models List" title in 13px bold
- Right side: Record count badge showing "X records" in smaller text with gray background

**Table Scroll Container:**
Scrollable container wrapping the Material table to handle overflow:
- Horizontal overflow: Auto (shows scrollbar if needed)
- Vertical overflow: Auto for many records
- Max height constraints based on viewport
  }
  
  .record-count {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    background: #1CBDAA;
    color: #FFFFFF;
    font-size: 11px;
    font-weight: 600;
    border-radius: 12px;
  }
}
**Styling Specifications:**

Text color: linear-gradient(to bottom, #F9FAFB, #F3F4F6). Text color: #475569. Font size: 11px. Font weight: 600. Padding: 12px 16px. Border radius: 3px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 4px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

**Paginator Styling:**
**Styling Specifications:**

Background color: #FAFAFA. Text color: #6B7280. Font size: 12px. Padding: 8px 16px.

**Empty State:**
**Component Structure:**

Material icons enhance visual clarity throughout the interface.

**Styling Specifications:**

Text color: #6B7280. Font size: 13px. Padding: 40px 20px !important. Margin: 0 auto 12px.

---

## SETUP TAB 2: Assessment Check-list

### Layout Structure

Same split layout: **Form (35%) | Table (65%)**

### Form Section

**Card Header:**
**Component Structure:**

Material icons enhance visual clarity throughout the interface.

**Form Fields:**

1. **Title** * (Required)
**Component Structure:**

This section uses Material form fields with outlined appearance. Two-way data binding connects form inputs to component properties. Form validation ensures required fields are completed before submission.

2. **Description** * (Required)
**Component Structure:**

This section uses Material form fields with outlined appearance. Textarea fields accommodate multi-line text input. Two-way data binding connects form inputs to component properties. Form validation ensures required fields are completed before submission.

3. **Maturity Level Applicable** (Checkbox)
**Component Structure:**

Checkboxes provide boolean/multi-select input options. Two-way data binding connects form inputs to component properties.

**Conditional Fields (when maturity checked):**
**Component Structure:**

This section uses Material form fields with outlined appearance. Dropdown select fields allow users to choose from predefined options. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties.

4. **Weightage Applicable** (Checkbox with conditional button)
**Component Structure:**

Action buttons are provided for user interactions. Checkboxes provide boolean/multi-select input options. Material icons enhance visual clarity throughout the interface. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

5. **Corrective Action Tracking** (Checkbox)
**Component Structure:**

Checkboxes provide boolean/multi-select input options. Two-way data binding connects form inputs to component properties.

6. **Is Merged Checklist** (Display only when editing)
**Component Structure:**

Checkboxes provide boolean/multi-select input options. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties.

7. **Version & Effective Date** (Split row)
**Component Structure:**

This section uses Material form fields with outlined appearance. Date picker components enable calendar-based date selection. Two-way data binding connects form inputs to component properties. Form validation ensures required fields are completed before submission.

8. **Findings Type** (Split row)
**Component Structure:**

This section uses Material form fields with outlined appearance. Dropdown select fields allow users to choose from predefined options. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties.

9. **Status List** * (with add button)
**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods. Form validation ensures required fields are completed before submission.

**Info Note:**
**Component Structure:**

Material icons enhance visual clarity throughout the interface.

**Styling Specifications:**

Background color: #EFF6FF. Text color: #0071E3. Font size: 18px. Padding: 12px. Border radius: 4px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 8px.

**Action Buttons:**
**Component Structure:**

Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. Conditional rendering (*ngIf) controls element visibility based on component state. Click handlers respond to user interactions with appropriate methods.

### Table Section

**Filter Component:**
**Component Structure:**

This section uses Material form fields with outlined appearance. Dropdown select fields allow users to choose from predefined options. Two-way data binding connects form inputs to component properties.

**Table Columns:**

| Column | Width | Sortable | Display |
|--------|-------|----------|---------|
| S.No | 60px | No | Auto-numbered |
| Title | auto | Yes | Clickable title |
| Description | 250px | No | Truncated with tooltip |
| Version | 100px | Yes | Badge styling |
| Effective From | 140px | Yes | dd-MMM-yyyy format |
| Process Model | 180px | No | Model name or '-' |
| Action | 140px | No | Revise, Edit, Delete buttons |
| Approve | 80px | No | Checkbox (for approvers only) |

**Version Badge:**
**Component Structure:**

**Styling Specifications:**

Background color: linear-gradient(135deg, #667eea 0%, #764ba2 100%). Text color: #FFFFFF. Font size: 11px. Font weight: 600. Padding: 4px 10px. Border radius: 12px for rounded corners. Subtle box shadow provides depth and elevation.

**Action Buttons:**
**Component Structure:**

Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. Click handlers respond to user interactions with appropriate methods.

**Approve Column (for approvers):**
**Component Structure:**

Checkboxes provide boolean/multi-select input options. Two-way data binding connects form inputs to component properties.

---

## SETUP TAB 3: New Process Area and Process

### Top Bar (when not in add mode)

**Left Group:**
**Component Structure:**

This section uses Material form fields with outlined appearance. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**Right Group:**
**Component Structure:**

Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. Click handlers respond to user interactions with appropriate methods.

**Styling:**
**Styling Specifications:**

Background color: #FFFFFF. Text color: #0071E3. Font size: 13px. Font weight: 500. Padding: 12px 16px. Border radius: 8px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 16px.

### Process Area Form (shown when adding)

**Split Layout:**
**Component Structure:**

This section uses Material form fields with outlined appearance. A Material table component displays the data with sorting capabilities. Action buttons are provided for user interactions. Textarea fields accommodate multi-line text input. Material icons enhance visual clarity throughout the interface. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods. Form validation ensures required fields are completed before submission.

### Main Process Table (Editable Inline)

**Table Columns (Editable):**
**Component Structure:**

This section uses Material form fields with outlined appearance. A Material table component displays the data with sorting capabilities. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Textarea fields accommodate multi-line text input. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods. Form validation ensures required fields are completed before submission.

**Inline Edit Styling:**
**Styling Specifications:**

Background color: #F0F9FF. Text color: #0071E3. Font size: 12px. Padding: 6px 0. Margin: 0. Border radius: 8px for rounded corners. Subtle box shadow provides depth and elevation.

---

## SETUP TAB 4: Map Service Tower & Process

### Note Section

**Component Structure:**

Material icons enhance visual clarity throughout the interface.

**Styling Specifications:**

Background color: linear-gradient(135deg, #E3F2FF 0%, #F0F8FF 100%). Text color: #007AFF. Font size: 20px. Font weight: 500. Padding: 14px 20px. Margin: 16px. Border radius: 8px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px.

### Filter Row

**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**Styling Specifications:**

Background color: #FAFAFA. Text color: #1D1D1F. Font size: 13px. Font weight: 500. Padding: 16px. Border radius: 8px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 16px.

### Mapping Table

**Table Columns:**

| Column | Width | Description |
|--------|-------|-------------|
| S.No | 60px | Auto-numbered |
| Process Area | 200px | From dropdown selection |
| Process Title | auto | Process name |
| Process Description | 250px | Process description |
| ISO/Process Model Reference | 200px | HTML rendered references |
| Select Process | 120px | Checkbox for selection |

**Component Structure:**

A Material table component displays the data with sorting capabilities. Checkboxes provide boolean/multi-select input options. Material icons enhance visual clarity throughout the interface. Two-way data binding connects form inputs to component properties.

**Color Note:**
**Component Structure:**

Material icons enhance visual clarity throughout the interface.

**Styling Specifications:**

Background color: #FEF2F2. Text color: #FF3B30. Font size: 12px. Font weight: 600. Padding: 12px 16px. Margin: 16px. Flexbox layout enables flexible positioning and alignment. Gap between elements: 8px.

---

## SETUP TAB 5: View Service Tower & Process

### Split Layout (when adding Service Tower)

**Left: Add Service Tower Form (400px fixed)**
**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Textarea fields accommodate multi-line text input. Material icons enhance visual clarity throughout the interface. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods. Form validation ensures required fields are completed before submission.

**Right: Service Tower List Table**
**Component Structure:**

A Material table component displays the data with sorting capabilities. Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

### View Mappings Section

**Top Bar:**
**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**View Table (Read-only):**
**Component Structure:**

A Material table component displays the data with sorting capabilities.

---

## SETUP TAB 6: Map Process Model

### Purpose
Map processes to process models by selecting a process model, choosing process areas, and assigning processes to the selected model via multi-select ISO/Process Model references.

### Note Section

**Component Structure:**

Material icons enhance visual clarity throughout the interface.

**Styling Specifications:**

Background color: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%). Text color: #1E40AF.

### Filter Row

**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**Styling Specifications:**

Background color: #F8FAFC. Text color: #0071E3. Font size: 20px. Font weight: 500. Padding: 16px. Border radius: 6px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 16px.

### Mapping Table

**Progress Bar (during loading):**
**Component Structure:**

Conditional rendering (*ngIf) controls element visibility based on component state.

**Table Structure:**

| Column | Width | Description | Features |
|--------|-------|-------------|----------|
| S.No | 60px | Auto-numbered | Calculated with pagination |
| Process Area | 200px | Display only | From selected areas |
| Process Title | auto | Display only | Process name |
| Process Description | 250px | Display only | Truncated with ellipsis |
| ISO/Process Model – Section/Clause Reference | 300px | Multi-select | Grouped options (optgroups) |
| Select Process | 120px | Checkbox | For bulk selection |

**Component Structure:**

This section uses Material form fields with outlined appearance. A Material table component displays the data with sorting capabilities. Dropdown select fields allow users to choose from predefined options. Checkboxes provide boolean/multi-select input options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties.

**Action Row:**
**Component Structure:**

Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. Click handlers respond to user interactions with appropriate methods.

**Styling Specifications:**

Background color: #FAFAFA. Text color: #475569. Font size: 12px. Font weight: 500. Padding: 16px. Margin: 0. Flexbox layout enables flexible positioning and alignment.

---

## SETUP TAB 7: View Process Model

### Purpose
Read-only view of all process-to-process-model mappings with search and filter capabilities.

### Top Bar

**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**Styling Specifications:**

Background color: #FFFFFF. Padding: 16px. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px.

### View Table (Read-Only)

**Table Columns:**

| Column | Width | Description |
|--------|-------|-------------|
| S.No | 60px | Auto-numbered |
| Process Model | 200px | Process model name |
| Process Area | 200px | Process area name |
| Process Title | auto | Process title |
| Process Description | 250px | Process description (truncated) |
| ISO/Process Model - Section/Clause Reference | 300px | HTML rendered references |

**Component Structure:**

A Material table component displays the data with sorting capabilities. Material icons enhance visual clarity throughout the interface.

**Styling Specifications:**

Background color: linear-gradient(135deg, #667eea 0%, #764ba2 100%). Text color: #FFFFFF. Font size: 11px. Font weight: 600. Padding: 4px 12px. Margin: 0. Border radius: 12px for rounded corners. Subtle box shadow provides depth and elevation.

---

## SETUP TAB 8: Map Checklist Questions and Process

### Purpose
Assign checklist questions to specific processes with display order, weightage, category, and maturity level configuration.

### Filter Bar (Two Rows)

**Row 1: Checklist Selection**
**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**Row 2: Filter Controls**
**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**Styling Specifications:**

Background color: #F8FAFC. Font size: 24px. Padding: 12px 16px. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px.

### Mapping Table (Editable)

**Table Columns:**

| Column | Width | Editable | Display When | Description |
|--------|-------|----------|--------------|-------------|
| S.No | 60px | No | Always | Auto-numbered |
| Display order | 100px | Yes (number input) | Edit mode | Question order |
| Question title | auto | Yes (textarea) | Edit mode | Question text |
| Weightage | 120px | Yes (dropdown) | Edit mode, if weightage applicable | Point value |
| Category | 140px | Yes (dropdown) | Edit mode | Question category |
| Maturity Level | 140px | Yes (dropdown) | Edit mode, if maturity applicable | L1-L5 |
| Effective From | 140px | Yes (textarea) | Edit mode | Date display |
| Action | 140px | No | Always | Edit/Save/Delete/Cancel icons |

**Component Structure:**

This section uses Material form fields with outlined appearance. A Material table component displays the data with sorting capabilities. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Textarea fields accommodate multi-line text input. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods. Form validation ensures required fields are completed before submission.

**Styling Specifications:**

Background color: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%). Text color: #1F2937. Font size: 12px. Font weight: 700. Padding: 6px 0. Margin: 0. Border radius: 12px for rounded corners. Subtle box shadow provides depth and elevation.

---

## SETUP TAB 9: PSPD (Process Service Tower Project Definition)

### Purpose
Configure which processes from which service towers are applicable to specific projects, with hierarchical nested tables and tailoring notes.

### Header Row

**Component Structure:**

Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. Conditional rendering (*ngIf) controls element visibility based on component state. Click handlers respond to user interactions with appropriate methods.

**Styling Specifications:**

Background color: #FFFFFF. Padding: 16px. Flexbox layout enables flexible positioning and alignment. Gap between elements: 20px.

### Add Service Section

**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**Styling Specifications:**

Background color: #FFF4E5. Text color: #FFFFFF. Padding: 16px. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px. Hover effects provide visual feedback on interactive elements.

### Filter Row (when enableDiv = true)

**Component Structure:**

This section uses Material form fields with outlined appearance. Dropdown select fields allow users to choose from predefined options. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties.

### Process Configuration Section (Nested Tables)

**Structure:**. Padding: 12px 16px. Border radius: 3px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 4px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

**Paginator Styling:**
**Styling Specifications:**

Background color: #FAFAFA. Text color: #6B7280. Font size: 12px. Padding: 8px 16px.

**Empty State:**
**Component Structure:**

Material icons enhance visual clarity throughout the interface.

**Styling Specifications:**

Text color: #6B7280. Font size: 13px. Padding: 40px 20px !important. Margin: 0 auto 12px.

---

## SETUP TAB 2: Assessment Check-list

### Layout Structure

Same split layout: **Form (35%) | Table (65%)**

### Form Section

**Card Header:**
**Component Structure:**

Material icons enhance visual clarity throughout the interface.

**Form Fields:**

1. **Title** * (Required)
**Component Structure:**

This section uses Material form fields with outlined appearance. Two-way data binding connects form inputs to component properties. Form validation ensures required fields are completed before submission.

2. **Description** * (Required)
**Component Structure:**

This section uses Material form fields with outlined appearance. Textarea fields accommodate multi-line text input. Two-way data binding connects form inputs to component properties. Form validation ensures required fields are completed before submission.

3. **Maturity Level Applicable** (Checkbox)
**Component Structure:**

Checkboxes provide boolean/multi-select input options. Two-way data binding connects form inputs to component properties.

**Conditional Fields (when maturity checked):**
**Component Structure:**

This section uses Material form fields with outlined appearance. Dropdown select fields allow users to choose from predefined options. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties.

4. **Weightage Applicable** (Checkbox with conditional button)
**Component Structure:**

Action buttons are provided for user interactions. Checkboxes provide boolean/multi-select input options. Material icons enhance visual clarity throughout the interface. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

5. **Corrective Action Tracking** (Checkbox)
**Component Structure:**

Checkboxes provide boolean/multi-select input options. Two-way data binding connects form inputs to component properties.

6. **Is Merged Checklist** (Display only when editing)
**Component Structure:**

Checkboxes provide boolean/multi-select input options. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties.

7. **Version & Effective Date** (Split row)
**Component Structure:**

This section uses Material form fields with outlined appearance. Date picker components enable calendar-based date selection. Two-way data binding connects form inputs to component properties. Form validation ensures required fields are completed before submission.

8. **Findings Type** (Split row)
**Component Structure:**

This section uses Material form fields with outlined appearance. Dropdown select fields allow users to choose from predefined options. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties.

9. **Status List** * (with add button)
**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods. Form validation ensures required fields are completed before submission.

**Info Note:**
**Component Structure:**

Material icons enhance visual clarity throughout the interface.

**Styling Specifications:**

Background color: #EFF6FF. Text color: #0071E3. Font size: 18px. Padding: 12px. Border radius: 4px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 8px.

**Action Buttons:**
**Component Structure:**

Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. Conditional rendering (*ngIf) controls element visibility based on component state. Click handlers respond to user interactions with appropriate methods.

### Table Section

**Filter Component:**
**Component Structure:**

This section uses Material form fields with outlined appearance. Dropdown select fields allow users to choose from predefined options. Two-way data binding connects form inputs to component properties.

**Table Columns:**

| Column | Width | Sortable | Display |
|--------|-------|----------|---------|
| S.No | 60px | No | Auto-numbered |
| Title | auto | Yes | Clickable title |
| Description | 250px | No | Truncated with tooltip |
| Version | 100px | Yes | Badge styling |
| Effective From | 140px | Yes | dd-MMM-yyyy format |
| Process Model | 180px | No | Model name or '-' |
| Action | 140px | No | Revise, Edit, Delete buttons |
| Approve | 80px | No | Checkbox (for approvers only) |

**Version Badge:**
**Component Structure:**

**Styling Specifications:**

Background color: linear-gradient(135deg, #667eea 0%, #764ba2 100%). Text color: #FFFFFF. Font size: 11px. Font weight: 600. Padding: 4px 10px. Border radius: 12px for rounded corners. Subtle box shadow provides depth and elevation.

**Action Buttons:**
**Component Structure:**

Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. Click handlers respond to user interactions with appropriate methods.

**Approve Column (for approvers):**
**Component Structure:**

Checkboxes provide boolean/multi-select input options. Two-way data binding connects form inputs to component properties.

---

## SETUP TAB 3: New Process Area and Process

### Top Bar (when not in add mode)

**Left Group:**
**Component Structure:**

This section uses Material form fields with outlined appearance. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**Right Group:**
**Component Structure:**

Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. Click handlers respond to user interactions with appropriate methods.

**Styling:**
**Styling Specifications:**

Background color: #FFFFFF. Text color: #0071E3. Font size: 13px. Font weight: 500. Padding: 12px 16px. Border radius: 8px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 16px.

### Process Area Form (shown when adding)

**Split Layout:**
**Component Structure:**

This section uses Material form fields with outlined appearance. A Material table component displays the data with sorting capabilities. Action buttons are provided for user interactions. Textarea fields accommodate multi-line text input. Material icons enhance visual clarity throughout the interface. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods. Form validation ensures required fields are completed before submission.

### Main Process Table (Editable Inline)

**Table Columns (Editable):**
**Component Structure:**

This section uses Material form fields with outlined appearance. A Material table component displays the data with sorting capabilities. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Textarea fields accommodate multi-line text input. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods. Form validation ensures required fields are completed before submission.

**Inline Edit Styling:**
**Styling Specifications:**

Background color: #F0F9FF. Text color: #0071E3. Font size: 12px. Padding: 6px 0. Margin: 0. Border radius: 8px for rounded corners. Subtle box shadow provides depth and elevation.

---

## SETUP TAB 4: Map Service Tower & Process

### Note Section

**Component Structure:**

Material icons enhance visual clarity throughout the interface.

**Styling Specifications:**

Background color: linear-gradient(135deg, #E3F2FF 0%, #F0F8FF 100%). Text color: #007AFF. Font size: 20px. Font weight: 500. Padding: 14px 20px. Margin: 16px. Border radius: 8px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px.

### Filter Row

**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**Styling Specifications:**

Background color: #FAFAFA. Text color: #1D1D1F. Font size: 13px. Font weight: 500. Padding: 16px. Border radius: 8px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 16px.

### Mapping Table

**Table Columns:**

| Column | Width | Description |
|--------|-------|-------------|
| S.No | 60px | Auto-numbered |
| Process Area | 200px | From dropdown selection |
| Process Title | auto | Process name |
| Process Description | 250px | Process description |
| ISO/Process Model Reference | 200px | HTML rendered references |
| Select Process | 120px | Checkbox for selection |

**Component Structure:**

A Material table component displays the data with sorting capabilities. Checkboxes provide boolean/multi-select input options. Material icons enhance visual clarity throughout the interface. Two-way data binding connects form inputs to component properties.

**Color Note:**
**Component Structure:**

Material icons enhance visual clarity throughout the interface.

**Styling Specifications:**

Background color: #FEF2F2. Text color: #FF3B30. Font size: 12px. Font weight: 600. Padding: 12px 16px. Margin: 16px. Flexbox layout enables flexible positioning and alignment. Gap between elements: 8px.

---

## SETUP TAB 5: View Service Tower & Process

### Split Layout (when adding Service Tower)

**Left: Add Service Tower Form (400px fixed)**
**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Textarea fields accommodate multi-line text input. Material icons enhance visual clarity throughout the interface. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods. Form validation ensures required fields are completed before submission.

**Right: Service Tower List Table**
**Component Structure:**

A Material table component displays the data with sorting capabilities. Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

### View Mappings Section

**Top Bar:**
**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**View Table (Read-only):**
**Component Structure:**

A Material table component displays the data with sorting capabilities.

---

## SETUP TAB 6: Map Process Model

### Purpose
Map processes to process models by selecting a process model, choosing process areas, and assigning processes to the selected model via multi-select ISO/Process Model references.

### Note Section

**Component Structure:**

Material icons enhance visual clarity throughout the interface.

**Styling Specifications:**

Background color: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%). Text color: #1E40AF.

### Filter Row

**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**Styling Specifications:**

Background color: #F8FAFC. Text color: #0071E3. Font size: 20px. Font weight: 500. Padding: 16px. Border radius: 6px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 16px.

### Mapping Table

**Progress Bar (during loading):**
**Component Structure:**

Conditional rendering (*ngIf) controls element visibility based on component state.

**Table Structure:**

| Column | Width | Description | Features |
|--------|-------|-------------|----------|
| S.No | 60px | Auto-numbered | Calculated with pagination |
| Process Area | 200px | Display only | From selected areas |
| Process Title | auto | Display only | Process name |
| Process Description | 250px | Display only | Truncated with ellipsis |
| ISO/Process Model – Section/Clause Reference | 300px | Multi-select | Grouped options (optgroups) |
| Select Process | 120px | Checkbox | For bulk selection |

**Component Structure:**

This section uses Material form fields with outlined appearance. A Material table component displays the data with sorting capabilities. Dropdown select fields allow users to choose from predefined options. Checkboxes provide boolean/multi-select input options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties.

**Action Row:**
**Component Structure:**

Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. Click handlers respond to user interactions with appropriate methods.

**Styling Specifications:**

Background color: #FAFAFA. Text color: #475569. Font size: 12px. Font weight: 500. Padding: 16px. Margin: 0. Flexbox layout enables flexible positioning and alignment.

---

## SETUP TAB 7: View Process Model

### Purpose
Read-only view of all process-to-process-model mappings with search and filter capabilities.

### Top Bar

**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**Styling Specifications:**

Background color: #FFFFFF. Padding: 16px. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px.

### View Table (Read-Only)

**Table Columns:**

| Column | Width | Description |
|--------|-------|-------------|
| S.No | 60px | Auto-numbered |
| Process Model | 200px | Process model name |
| Process Area | 200px | Process area name |
| Process Title | auto | Process title |
| Process Description | 250px | Process description (truncated) |
| ISO/Process Model - Section/Clause Reference | 300px | HTML rendered references |

**Component Structure:**

A Material table component displays the data with sorting capabilities. Material icons enhance visual clarity throughout the interface.

**Styling Specifications:**

Background color: linear-gradient(135deg, #667eea 0%, #764ba2 100%). Text color: #FFFFFF. Font size: 11px. Font weight: 600. Padding: 4px 12px. Margin: 0. Border radius: 12px for rounded corners. Subtle box shadow provides depth and elevation.

---

## SETUP TAB 8: Map Checklist Questions and Process

### Purpose
Assign checklist questions to specific processes with display order, weightage, category, and maturity level configuration.

### Filter Bar (Two Rows)

**Row 1: Checklist Selection**
**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**Row 2: Filter Controls**
**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**Styling Specifications:**

Background color: #F8FAFC. Font size: 24px. Padding: 12px 16px. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px.

### Mapping Table (Editable)

**Table Columns:**

| Column | Width | Editable | Display When | Description |
|--------|-------|----------|--------------|-------------|
| S.No | 60px | No | Always | Auto-numbered |
| Display order | 100px | Yes (number input) | Edit mode | Question order |
| Question title | auto | Yes (textarea) | Edit mode | Question text |
| Weightage | 120px | Yes (dropdown) | Edit mode, if weightage applicable | Point value |
| Category | 140px | Yes (dropdown) | Edit mode | Question category |
| Maturity Level | 140px | Yes (dropdown) | Edit mode, if maturity applicable | L1-L5 |
| Effective From | 140px | Yes (textarea) | Edit mode | Date display |
| Action | 140px | No | Always | Edit/Save/Delete/Cancel icons |

**Component Structure:**

This section uses Material form fields with outlined appearance. A Material table component displays the data with sorting capabilities. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Textarea fields accommodate multi-line text input. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods. Form validation ensures required fields are completed before submission.

**Styling Specifications:**

Background color: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%). Text color: #1F2937. Font size: 12px. Font weight: 700. Padding: 6px 0. Margin: 0. Border radius: 12px for rounded corners. Subtle box shadow provides depth and elevation.

---

## SETUP TAB 9: PSPD (Process Service Tower Project Definition)

### Purpose
Configure which processes from which service towers are applicable to specific projects, with hierarchical nested tables and tailoring notes.

### Header Row

**Component Structure:**

Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. Conditional rendering (*ngIf) controls element visibility based on component state. Click handlers respond to user interactions with appropriate methods.

**Styling Specifications:**

Background color: #FFFFFF. Padding: 16px. Flexbox layout enables flexible positioning and alignment. Gap between elements: 20px.

### Add Service Section

**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**Styling Specifications:**

Background color: #FFF4E5. Text color: #FFFFFF. Padding: 16px. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px. Hover effects provide visual feedback on interactive elements.

### Filter Row (when enableDiv = true)

**Component Structure:**

This section uses Material form fields with outlined appearance. Dropdown select fields allow users to choose from predefined options. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties.

### Process Configuration Section (Nested Tables)

**Structure:**. Margin: 0 auto 12px.

---

## SETUP TAB 2: Assessment Check-list

### Layout Structure

Same split layout: **Form (35%) | Table (65%)**

### Form Section

**Card Header:**
**Component Structure:**

Material icons enhance visual clarity throughout the interface.

**Form Fields:**

1. **Title** * (Required)
**Component Structure:**

This section uses Material form fields with outlined appearance. Two-way data binding connects form inputs to component properties. Form validation ensures required fields are completed before submission.

2. **Description** * (Required)
**Component Structure:**

This section uses Material form fields with outlined appearance. Textarea fields accommodate multi-line text input. Two-way data binding connects form inputs to component properties. Form validation ensures required fields are completed before submission.

3. **Maturity Level Applicable** (Checkbox)
**Component Structure:**

Checkboxes provide boolean/multi-select input options. Two-way data binding connects form inputs to component properties.

**Conditional Fields (when maturity checked):**
**Component Structure:**

This section uses Material form fields with outlined appearance. Dropdown select fields allow users to choose from predefined options. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties.

4. **Weightage Applicable** (Checkbox with conditional button)
**Component Structure:**

Action buttons are provided for user interactions. Checkboxes provide boolean/multi-select input options. Material icons enhance visual clarity throughout the interface. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

5. **Corrective Action Tracking** (Checkbox)
**Component Structure:**

Checkboxes provide boolean/multi-select input options. Two-way data binding connects form inputs to component properties.

6. **Is Merged Checklist** (Display only when editing)
**Component Structure:**

Checkboxes provide boolean/multi-select input options. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties.

7. **Version & Effective Date** (Split row)
**Component Structure:**

This section uses Material form fields with outlined appearance. Date picker components enable calendar-based date selection. Two-way data binding connects form inputs to component properties. Form validation ensures required fields are completed before submission.

8. **Findings Type** (Split row)
**Component Structure:**

This section uses Material form fields with outlined appearance. Dropdown select fields allow users to choose from predefined options. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties.

9. **Status List** * (with add button)
**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods. Form validation ensures required fields are completed before submission.

**Info Note:**
**Component Structure:**

Material icons enhance visual clarity throughout the interface.

**Styling Specifications:**

Background color: #EFF6FF. Text color: #0071E3. Font size: 18px. Padding: 12px. Border radius: 4px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 8px.

**Action Buttons:**
**Component Structure:**

Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. Conditional rendering (*ngIf) controls element visibility based on component state. Click handlers respond to user interactions with appropriate methods.

### Table Section

**Filter Component:**
**Component Structure:**

This section uses Material form fields with outlined appearance. Dropdown select fields allow users to choose from predefined options. Two-way data binding connects form inputs to component properties.

**Table Columns:**

| Column | Width | Sortable | Display |
|--------|-------|----------|---------|
| S.No | 60px | No | Auto-numbered |
| Title | auto | Yes | Clickable title |
| Description | 250px | No | Truncated with tooltip |
| Version | 100px | Yes | Badge styling |
| Effective From | 140px | Yes | dd-MMM-yyyy format |
| Process Model | 180px | No | Model name or '-' |
| Action | 140px | No | Revise, Edit, Delete buttons |
| Approve | 80px | No | Checkbox (for approvers only) |

**Version Badge:**
**Component Structure:**

**Styling Specifications:**

Background color: linear-gradient(135deg, #667eea 0%, #764ba2 100%). Text color: #FFFFFF. Font size: 11px. Font weight: 600. Padding: 4px 10px. Border radius: 12px for rounded corners. Subtle box shadow provides depth and elevation.

**Action Buttons:**
**Component Structure:**

Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. Click handlers respond to user interactions with appropriate methods.

**Approve Column (for approvers):**
**Component Structure:**

Checkboxes provide boolean/multi-select input options. Two-way data binding connects form inputs to component properties.

---

## SETUP TAB 3: New Process Area and Process

### Top Bar (when not in add mode)

**Left Group:**
**Component Structure:**

This section uses Material form fields with outlined appearance. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**Right Group:**
**Component Structure:**

Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. Click handlers respond to user interactions with appropriate methods.

**Styling:**
**Styling Specifications:**

Background color: #FFFFFF. Text color: #0071E3. Font size: 13px. Font weight: 500. Padding: 12px 16px. Border radius: 8px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 16px.

### Process Area Form (shown when adding)

**Split Layout:**
**Component Structure:**

This section uses Material form fields with outlined appearance. A Material table component displays the data with sorting capabilities. Action buttons are provided for user interactions. Textarea fields accommodate multi-line text input. Material icons enhance visual clarity throughout the interface. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods. Form validation ensures required fields are completed before submission.

### Main Process Table (Editable Inline)

**Table Columns (Editable):**
**Component Structure:**

This section uses Material form fields with outlined appearance. A Material table component displays the data with sorting capabilities. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Textarea fields accommodate multi-line text input. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods. Form validation ensures required fields are completed before submission.

**Inline Edit Styling:**
**Styling Specifications:**

Background color: #F0F9FF. Text color: #0071E3. Font size: 12px. Padding: 6px 0. Margin: 0. Border radius: 8px for rounded corners. Subtle box shadow provides depth and elevation.

---

## SETUP TAB 4: Map Service Tower & Process

### Note Section

**Component Structure:**

Material icons enhance visual clarity throughout the interface.

**Styling Specifications:**

Background color: linear-gradient(135deg, #E3F2FF 0%, #F0F8FF 100%). Text color: #007AFF. Font size: 20px. Font weight: 500. Padding: 14px 20px. Margin: 16px. Border radius: 8px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px.

### Filter Row

**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**Styling Specifications:**

Background color: #FAFAFA. Text color: #1D1D1F. Font size: 13px. Font weight: 500. Padding: 16px. Border radius: 8px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 16px.

### Mapping Table

**Table Columns:**

| Column | Width | Description |
|--------|-------|-------------|
| S.No | 60px | Auto-numbered |
| Process Area | 200px | From dropdown selection |
| Process Title | auto | Process name |
| Process Description | 250px | Process description |
| ISO/Process Model Reference | 200px | HTML rendered references |
| Select Process | 120px | Checkbox for selection |

**Component Structure:**

A Material table component displays the data with sorting capabilities. Checkboxes provide boolean/multi-select input options. Material icons enhance visual clarity throughout the interface. Two-way data binding connects form inputs to component properties.

**Color Note:**
**Component Structure:**

Material icons enhance visual clarity throughout the interface.

**Styling Specifications:**

Background color: #FEF2F2. Text color: #FF3B30. Font size: 12px. Font weight: 600. Padding: 12px 16px. Margin: 16px. Flexbox layout enables flexible positioning and alignment. Gap between elements: 8px.

---

## SETUP TAB 5: View Service Tower & Process

### Split Layout (when adding Service Tower)

**Left: Add Service Tower Form (400px fixed)**
**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Textarea fields accommodate multi-line text input. Material icons enhance visual clarity throughout the interface. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods. Form validation ensures required fields are completed before submission.

**Right: Service Tower List Table**
**Component Structure:**

A Material table component displays the data with sorting capabilities. Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

### View Mappings Section

**Top Bar:**
**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**View Table (Read-only):**
**Component Structure:**

A Material table component displays the data with sorting capabilities.

---

## SETUP TAB 6: Map Process Model

### Purpose
Map processes to process models by selecting a process model, choosing process areas, and assigning processes to the selected model via multi-select ISO/Process Model references.

### Note Section

**Component Structure:**

Material icons enhance visual clarity throughout the interface.

**Styling Specifications:**

Background color: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%). Text color: #1E40AF.

### Filter Row

**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**Styling Specifications:**

Background color: #F8FAFC. Text color: #0071E3. Font size: 20px. Font weight: 500. Padding: 16px. Border radius: 6px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 16px.

### Mapping Table

**Progress Bar (during loading):**
**Component Structure:**

Conditional rendering (*ngIf) controls element visibility based on component state.

**Table Structure:**

| Column | Width | Description | Features |
|--------|-------|-------------|----------|
| S.No | 60px | Auto-numbered | Calculated with pagination |
| Process Area | 200px | Display only | From selected areas |
| Process Title | auto | Display only | Process name |
| Process Description | 250px | Display only | Truncated with ellipsis |
| ISO/Process Model – Section/Clause Reference | 300px | Multi-select | Grouped options (optgroups) |
| Select Process | 120px | Checkbox | For bulk selection |

**Component Structure:**

This section uses Material form fields with outlined appearance. A Material table component displays the data with sorting capabilities. Dropdown select fields allow users to choose from predefined options. Checkboxes provide boolean/multi-select input options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties.

**Action Row:**
**Component Structure:**

Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. Click handlers respond to user interactions with appropriate methods.

**Styling Specifications:**

Background color: #FAFAFA. Text color: #475569. Font size: 12px. Font weight: 500. Padding: 16px. Margin: 0. Flexbox layout enables flexible positioning and alignment.

---

## SETUP TAB 7: View Process Model

### Purpose
Read-only view of all process-to-process-model mappings with search and filter capabilities.

### Top Bar

**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**Styling Specifications:**

Background color: #FFFFFF. Padding: 16px. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px.

### View Table (Read-Only)

**Table Columns:**

| Column | Width | Description |
|--------|-------|-------------|
| S.No | 60px | Auto-numbered |
| Process Model | 200px | Process model name |
| Process Area | 200px | Process area name |
| Process Title | auto | Process title |
| Process Description | 250px | Process description (truncated) |
| ISO/Process Model - Section/Clause Reference | 300px | HTML rendered references |

**Component Structure:**

A Material table component displays the data with sorting capabilities. Material icons enhance visual clarity throughout the interface.

**Styling Specifications:**

Background color: linear-gradient(135deg, #667eea 0%, #764ba2 100%). Text color: #FFFFFF. Font size: 11px. Font weight: 600. Padding: 4px 12px. Margin: 0. Border radius: 12px for rounded corners. Subtle box shadow provides depth and elevation.

---

## SETUP TAB 8: Map Checklist Questions and Process

### Purpose
Assign checklist questions to specific processes with display order, weightage, category, and maturity level configuration.

### Filter Bar (Two Rows)

**Row 1: Checklist Selection**
**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**Row 2: Filter Controls**
**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**Styling Specifications:**

Background color: #F8FAFC. Font size: 24px. Padding: 12px 16px. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px.

### Mapping Table (Editable)

**Table Columns:**

| Column | Width | Editable | Display When | Description |
|--------|-------|----------|--------------|-------------|
| S.No | 60px | No | Always | Auto-numbered |
| Display order | 100px | Yes (number input) | Edit mode | Question order |
| Question title | auto | Yes (textarea) | Edit mode | Question text |
| Weightage | 120px | Yes (dropdown) | Edit mode, if weightage applicable | Point value |
| Category | 140px | Yes (dropdown) | Edit mode | Question category |
| Maturity Level | 140px | Yes (dropdown) | Edit mode, if maturity applicable | L1-L5 |
| Effective From | 140px | Yes (textarea) | Edit mode | Date display |
| Action | 140px | No | Always | Edit/Save/Delete/Cancel icons |

**Component Structure:**

This section uses Material form fields with outlined appearance. A Material table component displays the data with sorting capabilities. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Textarea fields accommodate multi-line text input. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods. Form validation ensures required fields are completed before submission.

**Styling Specifications:**

Background color: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%). Text color: #1F2937. Font size: 12px. Font weight: 700. Padding: 6px 0. Margin: 0. Border radius: 12px for rounded corners. Subtle box shadow provides depth and elevation.

---

## SETUP TAB 9: PSPD (Process Service Tower Project Definition)

### Purpose
Configure which processes from which service towers are applicable to specific projects, with hierarchical nested tables and tailoring notes.

### Header Row

**Component Structure:**

Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. Conditional rendering (*ngIf) controls element visibility based on component state. Click handlers respond to user interactions with appropriate methods.

**Styling Specifications:**

Background color: #FFFFFF. Padding: 16px. Flexbox layout enables flexible positioning and alignment. Gap between elements: 20px.

### Add Service Section

**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**Styling Specifications:**

Background color: #FFF4E5. Text color: #FFFFFF. Padding: 16px. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px. Hover effects provide visual feedback on interactive elements.

### Filter Row (when enableDiv = true)

**Component Structure:**

This section uses Material form fields with outlined appearance. Dropdown select fields allow users to choose from predefined options. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties.

### Process Configuration Section (Nested Tables)

**Structure:**. Hover effects provide visual feedback on interactive elements.
Service Tower (outer table)
└── Process Model (middle table)
    └── Service Area Header Row
        └── Process List (inner table with checkboxes)
**Styling Specifications:**

Text color: #F8FAFC. Text color: #FFFFFF. Font size: 20px. Font weight: 600. Padding: 16px. Margin: 0. Border radius: 12px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 10px. Hover effects provide visual feedback on interactive elements.

### Mapped Service Towers Section

**Two-Column Layout:**

**Left Column (30%): Service Tower List**
**Component Structure:**

Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Click handlers respond to user interactions with appropriate methods.

**Right Column (70%): Process Mapping (Expansion Panels)**
**Component Structure:**

This section uses Material form fields with outlined appearance. Expandable panels are used to show/hide detailed information. Checkboxes provide boolean/multi-select input options. Textarea fields accommodate multi-line text input. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**Styling Specifications:**

Background color: #FFFFFF. Text color: #1F2937. Font size: 14px. Font weight: 600. Padding: 16px. Margin: 0 0 12px 0. Border radius: 12px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 16px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

### Footer Note

**Component Structure:**

Material icons enhance visual clarity throughout the interface.

**Styling Specifications:**

Background color: #EFF6FF. Text color: #0071E3. Font size: 20px. Font weight: 600. Padding: 16px. Margin: 16px. Border radius: 8px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px.

---

## SETUP TAB 10: Merge Checklist

### Purpose
Combine multiple existing checklists into a single merged checklist by selecting questions from each source checklist with hierarchical checkbox selection.

### Layout Structure

**Two-column layout (30% left | 70% right) with 7px gap**

**Component Structure:**

**Styling Specifications:**

Background color: #F8FAFC. Padding: 16px. Flexbox layout enables flexible positioning and alignment. Gap between elements: 7px.

### Right Column: Merge Section

**Merge Controls:**
**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods. Form validation ensures required fields are completed before submission.

**Styling Specifications:**

Background color: #FFFFFF. Font size: 12px. Padding: 16px. Border radius: 12px 12px 0 0 for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px.

### Preview Section (shown when showPreviewGrid = true)

**Component Structure:**

Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state.

**Styling Specifications:**

Background color: linear-gradient(135deg, #667eea 0%, #764ba2 100%). Text color: #FFFFFF. Font size: 24px. Font weight: 600. Padding: 16px. Border radius: 0 0 12px 12px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment.

### Hierarchical Preview Component

**(Embedded app-preview-popup with isMergeView=true)**

**Features:**
- Nested hierarchy: Service Tower → Process Area → Process → Questions
- Checkboxes at all levels (cascading selection)
- Parent checkbox selects/deselects all child items
- Child selection updates parent state (indeterminate if partially selected)

**Structure:**
**Component Structure:**

Expandable panels are used to show/hide detailed information. Checkboxes provide boolean/multi-select input options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties.

**Styling Specifications:**

Background color: #F9FAFB. Text color: #667eea. Font size: 14px. Font weight: 600. Padding: 8px 16px. Border radius: 8px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 10px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

### Action Buttons

**Component Structure:**

Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. Click handlers respond to user interactions with appropriate methods.

**Styling Specifications:**

Background color: #FFFFFF. Padding: 20px. Border radius: 0 0 12px 12px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px.

---

## PHASE 2: PLAN

### Plan Phase Overview

The Plan phase manages the scheduling and planning of SQA assessments, including event/task creation, calendar visualization, and recurrence pattern configuration. It is accessed via the **Plan** tab in the Level 2 segmented control.

**Sub-tabs within Plan:**
- **View Planner** - Calendar or list view of scheduled assessments
- **Add Event/Task** - Form for creating/editing events and tasks

**Navigation Structure:**
**Component Structure:**

Material tabs organize the content into separate sections.

---

## PLAN TAB 1: View Planner

### Purpose
Display scheduled SQA assessments in calendar or list format with comprehensive filtering and year/period navigation.

### Page Layout Structure. Padding: 16px. Margin: 0. Border radius: 12px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 10px. Hover effects provide visual feedback on interactive elements.

### Mapped Service Towers Section

**Two-Column Layout:**

**Left Column (30%): Service Tower List**
**Component Structure:**

Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Click handlers respond to user interactions with appropriate methods.

**Right Column (70%): Process Mapping (Expansion Panels)**
**Component Structure:**

This section uses Material form fields with outlined appearance. Expandable panels are used to show/hide detailed information. Checkboxes provide boolean/multi-select input options. Textarea fields accommodate multi-line text input. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**Styling Specifications:**

Background color: #FFFFFF. Text color: #1F2937. Font size: 14px. Font weight: 600. Padding: 16px. Margin: 0 0 12px 0. Border radius: 12px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 16px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

### Footer Note

**Component Structure:**

Material icons enhance visual clarity throughout the interface.

**Styling Specifications:**

Background color: #EFF6FF. Text color: #0071E3. Font size: 20px. Font weight: 600. Padding: 16px. Margin: 16px. Border radius: 8px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px.

---

## SETUP TAB 10: Merge Checklist

### Purpose
Combine multiple existing checklists into a single merged checklist by selecting questions from each source checklist with hierarchical checkbox selection.

### Layout Structure

**Two-column layout (30% left | 70% right) with 7px gap**

**Component Structure:**

**Styling Specifications:**

Background color: #F8FAFC. Padding: 16px. Flexbox layout enables flexible positioning and alignment. Gap between elements: 7px.

### Right Column: Merge Section

**Merge Controls:**
**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods. Form validation ensures required fields are completed before submission.

**Styling Specifications:**

Background color: #FFFFFF. Font size: 12px. Padding: 16px. Border radius: 12px 12px 0 0 for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px.

### Preview Section (shown when showPreviewGrid = true)

**Component Structure:**

Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state.

**Styling Specifications:**

Background color: linear-gradient(135deg, #667eea 0%, #764ba2 100%). Text color: #FFFFFF. Font size: 24px. Font weight: 600. Padding: 16px. Border radius: 0 0 12px 12px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment.

### Hierarchical Preview Component

**(Embedded app-preview-popup with isMergeView=true)**

**Features:**
- Nested hierarchy: Service Tower → Process Area → Process → Questions
- Checkboxes at all levels (cascading selection)
- Parent checkbox selects/deselects all child items
- Child selection updates parent state (indeterminate if partially selected)

**Structure:**
**Component Structure:**

Expandable panels are used to show/hide detailed information. Checkboxes provide boolean/multi-select input options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties.

**Styling Specifications:**

Background color: #F9FAFB. Text color: #667eea. Font size: 14px. Font weight: 600. Padding: 8px 16px. Border radius: 8px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 10px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

### Action Buttons

**Component Structure:**

Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. Click handlers respond to user interactions with appropriate methods.

**Styling Specifications:**

Background color: #FFFFFF. Padding: 20px. Border radius: 0 0 12px 12px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px.

---

## PHASE 2: PLAN

### Plan Phase Overview

The Plan phase manages the scheduling and planning of SQA assessments, including event/task creation, calendar visualization, and recurrence pattern configuration. It is accessed via the **Plan** tab in the Level 2 segmented control.

**Sub-tabs within Plan:**
- **View Planner** - Calendar or list view of scheduled assessments
- **Add Event/Task** - Form for creating/editing events and tasks

**Navigation Structure:**
**Component Structure:**

Material tabs organize the content into separate sections.

---

## PLAN TAB 1: View Planner

### Purpose
Display scheduled SQA assessments in calendar or list format with comprehensive filtering and year/period navigation.

### Page Layout Structure. Margin: 0. Border radius: 12px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 10px. Hover effects provide visual feedback on interactive elements.

### Mapped Service Towers Section

**Two-Column Layout:**

**Left Column (30%): Service Tower List**
**Component Structure:**

Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Click handlers respond to user interactions with appropriate methods.

**Right Column (70%): Process Mapping (Expansion Panels)**
**Component Structure:**

This section uses Material form fields with outlined appearance. Expandable panels are used to show/hide detailed information. Checkboxes provide boolean/multi-select input options. Textarea fields accommodate multi-line text input. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**Styling Specifications:**

Background color: #FFFFFF. Text color: #1F2937. Font size: 14px. Font weight: 600. Padding: 16px. Margin: 0 0 12px 0. Border radius: 12px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 16px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

### Footer Note

**Component Structure:**

Material icons enhance visual clarity throughout the interface.

**Styling Specifications:**

Background color: #EFF6FF. Text color: #0071E3. Font size: 20px. Font weight: 600. Padding: 16px. Margin: 16px. Border radius: 8px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px.

---

## SETUP TAB 10: Merge Checklist

### Purpose
Combine multiple existing checklists into a single merged checklist by selecting questions from each source checklist with hierarchical checkbox selection.

### Layout Structure

**Two-column layout (30% left | 70% right) with 7px gap**

**Component Structure:**

**Styling Specifications:**

Background color: #F8FAFC. Padding: 16px. Flexbox layout enables flexible positioning and alignment. Gap between elements: 7px.

### Right Column: Merge Section

**Merge Controls:**
**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods. Form validation ensures required fields are completed before submission.

**Styling Specifications:**

Background color: #FFFFFF. Font size: 12px. Padding: 16px. Border radius: 12px 12px 0 0 for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px.

### Preview Section (shown when showPreviewGrid = true)

**Component Structure:**

Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state.

**Styling Specifications:**

Background color: linear-gradient(135deg, #667eea 0%, #764ba2 100%). Text color: #FFFFFF. Font size: 24px. Font weight: 600. Padding: 16px. Border radius: 0 0 12px 12px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment.

### Hierarchical Preview Component

**(Embedded app-preview-popup with isMergeView=true)**

**Features:**
- Nested hierarchy: Service Tower → Process Area → Process → Questions
- Checkboxes at all levels (cascading selection)
- Parent checkbox selects/deselects all child items
- Child selection updates parent state (indeterminate if partially selected)

**Structure:**
**Component Structure:**

Expandable panels are used to show/hide detailed information. Checkboxes provide boolean/multi-select input options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties.

**Styling Specifications:**

Background color: #F9FAFB. Text color: #667eea. Font size: 14px. Font weight: 600. Padding: 8px 16px. Border radius: 8px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 10px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

### Action Buttons

**Component Structure:**

Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. Click handlers respond to user interactions with appropriate methods.

**Styling Specifications:**

Background color: #FFFFFF. Padding: 20px. Border radius: 0 0 12px 12px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px.

---

## PHASE 2: PLAN

### Plan Phase Overview

The Plan phase manages the scheduling and planning of SQA assessments, including event/task creation, calendar visualization, and recurrence pattern configuration. It is accessed via the **Plan** tab in the Level 2 segmented control.

**Sub-tabs within Plan:**
- **View Planner** - Calendar or list view of scheduled assessments
- **Add Event/Task** - Form for creating/editing events and tasks

**Navigation Structure:**
**Component Structure:**

Material tabs organize the content into separate sections.

---

## PLAN TAB 1: View Planner

### Purpose
Display scheduled SQA assessments in calendar or list format with comprehensive filtering and year/period navigation.

### Page Layout Structure. Hover effects provide visual feedback on interactive elements.
┌─────────────────────────────────────────────────────────────┐
│ Stepper Header (1. Planner | 2. Manage Event/Task | 3. Execute) │
├─────────────────────────────────────────────────────────────┤
│ View Toggle Bar (Planner title | Calendar/List | Audit count)│
├─────────────────────────────────────────────────────────────┤
│ Filter Bar (Type, Category, Customer, Project, Year, Period)│
├─────────────────────────────────────────────────────────────┤
│ Progress Bar (conditional loading)                           │
├─────────────────────────────────────────────────────────────┤
│ Calendar Grid / List Table (based on view selection)        │
├─────────────────────────────────────────────────────────────┤
│ Footer Note                                                  │
└─────────────────────────────────────────────────────────────┘
**Styling Specifications:**

Text color: #F5F5F7. Text color: #1D1D1F. Font size: 15px. Font weight: 600. Padding: 8px 16px. Margin: 0. Border radius: 8px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 16px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

### Filter Bar

**Layout:**
**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**Styling:**
**Styling Specifications:**

Background color: #F8FAFC. Text color: #1D1D1F. Font size: 13px. Font weight: 500. Padding: 12px 16px. Margin: 0. Border radius: 6px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

### Calendar Grid (View = 'calendar')

**Table Structure:**
**Component Structure:**

The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Click handlers respond to user interactions with appropriate methods.

**Styling:**
**Styling Specifications:**

Background color: #FAFAFA. Text color: #6E6E73. Font size: 11px. Font weight: 600. Padding: 0. Border radius: 4px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 3px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

### List View (View = 'list')

**Table Structure:**
**Component Structure:**

A Material table component displays the data with sorting capabilities.

**Styling:**
**Styling Specifications:**

Background color: #FAFAFA. Text color: #6E6E73. Font size: 12px. Font weight: 600. Padding: 16px 24px. Border radius: 8px for rounded corners. Subtle box shadow provides depth and elevation. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

### Footer Note

**Component Structure:**

**Styling Specifications:**

Background color: #FAFAFA. Text color: #6E6E73. Font size: 12px. Font weight: 600. Padding: 12px 24px.

---

## PLAN TAB 2: Add Event/Task

### Purpose
Create or edit events and tasks for SQA assessments with comprehensive form fields including recurrence patterns, priority, status tracking, and project assignment.

### Overall Layout

**Container:**
**Component Structure:**

The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state.

**Styling:**
**Styling Specifications:**

Background color: #FFFFFF. Padding: 0. Margin: 0 auto.

### Form Section Structure

All sections use a flat design with NO card wrappers, separated by dividers:

**Section Header:**
**Component Structure:**

**Section Divider:**
**Styling Specifications:**

Background color: #E5E7EB. Margin: 0 20px.

### Section 1: Basic Information

**Component Structure:**

Textarea fields accommodate multi-line text input. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties. Form validation ensures required fields are completed before submission.

### Section 2: Scheduling & Status

**Component Structure:**

This section uses Material form fields with outlined appearance. Date picker components enable calendar-based date selection. Textarea fields accommodate multi-line text input. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Form validation ensures required fields are completed before submission.

### Section 3: Customer & Assignment

**Component Structure:**

The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

### Form Footer & More Details

**Component Structure:**

This section uses Material form fields with outlined appearance. Dropdown select fields allow users to choose from predefined options. Textarea fields accommodate multi-line text input. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods. Form validation ensures required fields are completed before submission.

### Action Buttons

**Component Structure:**

Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. Conditional rendering (*ngIf) controls element visibility based on component state. Click handlers respond to user interactions with appropriate methods.

### Info Box

**Component Structure:**

### Form Field Styling

**Styling Specifications:**

Background color: #FFFFFF. Text color: #1D1D1F. Font size: 12px. Font weight: 500. Padding: 0. Margin: 0. Border radius: 4px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. CSS Grid layout organizes content in a responsive grid structure. Gap between elements: 8px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

---

## PHASE 3: EXECUTE

### Execute Phase Overview

The Execute phase is where planned SQA assessments are carried out using hierarchical checklists. It includes project selection, viewing planned assessments, filling assessment details, and executing 4-level hierarchical checklists with findings tracking.

**Primary Component:** Checklist Based Assessment

---

## EXECUTE: Checklist Based Assessment

### Purpose
Execute SQA assessments by selecting a planned assessment, filling in assessment details, evaluating checkpoints in a hierarchical structure, adding findings, and submitting the completed assessment.

### Overall Page Structure. Padding: 8px 16px. Margin: 0. Border radius: 8px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 16px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

### Filter Bar

**Layout:**
**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**Styling:**
**Styling Specifications:**

Background color: #F8FAFC. Text color: #1D1D1F. Font size: 13px. Font weight: 500. Padding: 12px 16px. Margin: 0. Border radius: 6px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

### Calendar Grid (View = 'calendar')

**Table Structure:**
**Component Structure:**

The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Click handlers respond to user interactions with appropriate methods.

**Styling:**
**Styling Specifications:**

Background color: #FAFAFA. Text color: #6E6E73. Font size: 11px. Font weight: 600. Padding: 0. Border radius: 4px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 3px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

### List View (View = 'list')

**Table Structure:**
**Component Structure:**

A Material table component displays the data with sorting capabilities.

**Styling:**
**Styling Specifications:**

Background color: #FAFAFA. Text color: #6E6E73. Font size: 12px. Font weight: 600. Padding: 16px 24px. Border radius: 8px for rounded corners. Subtle box shadow provides depth and elevation. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

### Footer Note

**Component Structure:**

**Styling Specifications:**

Background color: #FAFAFA. Text color: #6E6E73. Font size: 12px. Font weight: 600. Padding: 12px 24px.

---

## PLAN TAB 2: Add Event/Task

### Purpose
Create or edit events and tasks for SQA assessments with comprehensive form fields including recurrence patterns, priority, status tracking, and project assignment.

### Overall Layout

**Container:**
**Component Structure:**

The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state.

**Styling:**
**Styling Specifications:**

Background color: #FFFFFF. Padding: 0. Margin: 0 auto.

### Form Section Structure

All sections use a flat design with NO card wrappers, separated by dividers:

**Section Header:**
**Component Structure:**

**Section Divider:**
**Styling Specifications:**

Background color: #E5E7EB. Margin: 0 20px.

### Section 1: Basic Information

**Component Structure:**

Textarea fields accommodate multi-line text input. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties. Form validation ensures required fields are completed before submission.

### Section 2: Scheduling & Status

**Component Structure:**

This section uses Material form fields with outlined appearance. Date picker components enable calendar-based date selection. Textarea fields accommodate multi-line text input. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Form validation ensures required fields are completed before submission.

### Section 3: Customer & Assignment

**Component Structure:**

The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

### Form Footer & More Details

**Component Structure:**

This section uses Material form fields with outlined appearance. Dropdown select fields allow users to choose from predefined options. Textarea fields accommodate multi-line text input. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods. Form validation ensures required fields are completed before submission.

### Action Buttons

**Component Structure:**

Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. Conditional rendering (*ngIf) controls element visibility based on component state. Click handlers respond to user interactions with appropriate methods.

### Info Box

**Component Structure:**

### Form Field Styling

**Styling Specifications:**

Background color: #FFFFFF. Text color: #1D1D1F. Font size: 12px. Font weight: 500. Padding: 0. Margin: 0. Border radius: 4px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. CSS Grid layout organizes content in a responsive grid structure. Gap between elements: 8px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

---

## PHASE 3: EXECUTE

### Execute Phase Overview

The Execute phase is where planned SQA assessments are carried out using hierarchical checklists. It includes project selection, viewing planned assessments, filling assessment details, and executing 4-level hierarchical checklists with findings tracking.

**Primary Component:** Checklist Based Assessment

---

## EXECUTE: Checklist Based Assessment

### Purpose
Execute SQA assessments by selecting a planned assessment, filling in assessment details, evaluating checkpoints in a hierarchical structure, adding findings, and submitting the completed assessment.

### Overall Page Structure. Margin: 0. Border radius: 8px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 16px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

### Filter Bar

**Layout:**
**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**Styling:**
**Styling Specifications:**

Background color: #F8FAFC. Text color: #1D1D1F. Font size: 13px. Font weight: 500. Padding: 12px 16px. Margin: 0. Border radius: 6px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

### Calendar Grid (View = 'calendar')

**Table Structure:**
**Component Structure:**

The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Click handlers respond to user interactions with appropriate methods.

**Styling:**
**Styling Specifications:**

Background color: #FAFAFA. Text color: #6E6E73. Font size: 11px. Font weight: 600. Padding: 0. Border radius: 4px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 3px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

### List View (View = 'list')

**Table Structure:**
**Component Structure:**

A Material table component displays the data with sorting capabilities.

**Styling:**
**Styling Specifications:**

Background color: #FAFAFA. Text color: #6E6E73. Font size: 12px. Font weight: 600. Padding: 16px 24px. Border radius: 8px for rounded corners. Subtle box shadow provides depth and elevation. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

### Footer Note

**Component Structure:**

**Styling Specifications:**

Background color: #FAFAFA. Text color: #6E6E73. Font size: 12px. Font weight: 600. Padding: 12px 24px.

---

## PLAN TAB 2: Add Event/Task

### Purpose
Create or edit events and tasks for SQA assessments with comprehensive form fields including recurrence patterns, priority, status tracking, and project assignment.

### Overall Layout

**Container:**
**Component Structure:**

The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state.

**Styling:**
**Styling Specifications:**

Background color: #FFFFFF. Padding: 0. Margin: 0 auto.

### Form Section Structure

All sections use a flat design with NO card wrappers, separated by dividers:

**Section Header:**
**Component Structure:**

**Section Divider:**
**Styling Specifications:**

Background color: #E5E7EB. Margin: 0 20px.

### Section 1: Basic Information

**Component Structure:**

Textarea fields accommodate multi-line text input. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Two-way data binding connects form inputs to component properties. Form validation ensures required fields are completed before submission.

### Section 2: Scheduling & Status

**Component Structure:**

This section uses Material form fields with outlined appearance. Date picker components enable calendar-based date selection. Textarea fields accommodate multi-line text input. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Form validation ensures required fields are completed before submission.

### Section 3: Customer & Assignment

**Component Structure:**

The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

### Form Footer & More Details

**Component Structure:**

This section uses Material form fields with outlined appearance. Dropdown select fields allow users to choose from predefined options. Textarea fields accommodate multi-line text input. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods. Form validation ensures required fields are completed before submission.

### Action Buttons

**Component Structure:**

Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. Conditional rendering (*ngIf) controls element visibility based on component state. Click handlers respond to user interactions with appropriate methods.

### Info Box

**Component Structure:**

### Form Field Styling

**Styling Specifications:**

Background color: #FFFFFF. Text color: #1D1D1F. Font size: 12px. Font weight: 500. Padding: 0. Margin: 0. Border radius: 4px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. CSS Grid layout organizes content in a responsive grid structure. Gap between elements: 8px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

---

## PHASE 3: EXECUTE

### Execute Phase Overview

The Execute phase is where planned SQA assessments are carried out using hierarchical checklists. It includes project selection, viewing planned assessments, filling assessment details, and executing 4-level hierarchical checklists with findings tracking.

**Primary Component:** Checklist Based Assessment

---

## EXECUTE: Checklist Based Assessment

### Purpose
Execute SQA assessments by selecting a planned assessment, filling in assessment details, evaluating checkpoints in a hierarchical structure, adding findings, and submitting the completed assessment.

### Overall Page Structure. Hover effects provide visual feedback on interactive elements.
┌─────────────────────────────────────────────────────────────┐
│ Project Selection Card                                       │
├─────────────────────────────────────────────────────────────┤
│ Planned Assessment Accordion (Expansion Panel)               │
│   └─ Planned Assessments Table                              │
├─────────────────────────────────────────────────────────────┤
│ Main Tab Group (Checklist | Findings)                        │
│   ├─ Assessment Details Fields (3 rows of form fields)      │
│   ├─ 4-Level Hierarchical Checklist                         │
│   │   └─ Service Tower → Process Model → Process Area → Process│
│   │       └─ Checkpoint Table with Status/Score/Notes       │
│   └─ Action Footer (Save Draft | Submit)                    │
└─────────────────────────────────────────────────────────────┘
**Styling Specifications:**

Text color: #F8FAFC. Text color: #1A56DB. Font size: 18px. Font weight: 600. Padding: 14px 20px. Flexbox layout enables flexible positioning and alignment. Gap between elements: 10px.

---

## Planned Assessment Accordion

### Structure

**Expansion Panel:**
**Component Structure:**

Expandable panels are used to show/hide detailed information. Checkboxes provide boolean/multi-select input options. Material icons enhance visual clarity throughout the interface. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties.

### Planned Assessments Table

**Table Columns (13 total):**
1. Title (clickable link)
2. Planned Date
3. Actual Start
4. Due Date
5. Compliance % (Audit date)
6. Current Compliance %
7. Total Findings
8. Open
9. Closed
10. Status (badge)
11. Findings (clickable link)
12. Action (revert link)
13. Report (PDF button)

**HTML Structure:**
**Component Structure:**

Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Click handlers respond to user interactions with appropriate methods.

**Table Styling:**
**Styling Specifications:**

Background color: #F1F5F9. Text color: #1A56DB. Font size: 18px. Font weight: 600. Padding: 14px 20px. Border radius: 12px !important for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 10px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

---

## Main Tab Group: Checklist Tab

### Tab Structure

**Component Structure:**

Material tabs organize the content into separate sections. Conditional rendering (*ngIf) controls element visibility based on component state.

**Tab Styling:**
**Styling Specifications:**

Background color: #F5F5F7. Text color: #0071E3. Font size: 13px. Font weight: 500.

### Assessment Details Fields

**3-Row Layout:**

**ROW 1:**
- Assessment Title (textarea, readonly, span 1)
- Appraiser Name (dropdown, required, span 1)
- Appraisee Name(s) (multi-select, required, span 1)
- Planned Start Date (datepicker, readonly, span 1)
- Planned End Date (datepicker, readonly, span 1)
- Planned Hrs (number input, readonly, span 1)
- Actual Hrs (number input, editable, span 1)

**ROW 2:**
- Choose a Checklist (dropdown, conditional disable, span 1)
- Version (number input, readonly, span 1)
- Score (number input, readonly, span 1)
- Process Compliance % (number input, readonly, span 1)
- Score (Today) (if submitted, readonly, span 1)
- Compliance % (Today) (if submitted, readonly, span 1)
- Actual Start Date (datepicker, min=startDate, max=today, span 1)
- Actual End Date (datepicker, min=startDate, max=today, disable if submitted, span 1)

**ROW 3:**
- Customer (multi-select with search, span 1)
- CC List (multi-select with search, span 1)
- To List (multi-select with search, span 1)
- Applicable Service Tower (multi-select, readonly, span 1)
- View Maturity Level (button, aligned to bottom right)

**HTML:**
**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Date picker components enable calendar-based date selection. Textarea fields accommodate multi-line text input. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods. Form validation ensures required fields are completed before submission.

**Field Styling:**
**Styling Specifications:**

Background color: #FAFCFF. Text color: #6B7280. Font size: 10.5px. Font weight: 500. Padding: 16px 20px. Border radius: 6px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. CSS Grid layout organizes content in a responsive grid structure. Gap between elements: 12px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

---

## 4-Level Hierarchical Checklist

### Structure Overview. Padding: 14px 20px. Flexbox layout enables flexible positioning and alignment. Gap between elements: 10px.

---

## Planned Assessment Accordion

### Structure

**Expansion Panel:**
**Component Structure:**

Expandable panels are used to show/hide detailed information. Checkboxes provide boolean/multi-select input options. Material icons enhance visual clarity throughout the interface. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties.

### Planned Assessments Table

**Table Columns (13 total):**
1. Title (clickable link)
2. Planned Date
3. Actual Start
4. Due Date
5. Compliance % (Audit date)
6. Current Compliance %
7. Total Findings
8. Open
9. Closed
10. Status (badge)
11. Findings (clickable link)
12. Action (revert link)
13. Report (PDF button)

**HTML Structure:**
**Component Structure:**

Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Click handlers respond to user interactions with appropriate methods.

**Table Styling:**
**Styling Specifications:**

Background color: #F1F5F9. Text color: #1A56DB. Font size: 18px. Font weight: 600. Padding: 14px 20px. Border radius: 12px !important for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 10px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

---

## Main Tab Group: Checklist Tab

### Tab Structure

**Component Structure:**

Material tabs organize the content into separate sections. Conditional rendering (*ngIf) controls element visibility based on component state.

**Tab Styling:**
**Styling Specifications:**

Background color: #F5F5F7. Text color: #0071E3. Font size: 13px. Font weight: 500.

### Assessment Details Fields

**3-Row Layout:**

**ROW 1:**
- Assessment Title (textarea, readonly, span 1)
- Appraiser Name (dropdown, required, span 1)
- Appraisee Name(s) (multi-select, required, span 1)
- Planned Start Date (datepicker, readonly, span 1)
- Planned End Date (datepicker, readonly, span 1)
- Planned Hrs (number input, readonly, span 1)
- Actual Hrs (number input, editable, span 1)

**ROW 2:**
- Choose a Checklist (dropdown, conditional disable, span 1)
- Version (number input, readonly, span 1)
- Score (number input, readonly, span 1)
- Process Compliance % (number input, readonly, span 1)
- Score (Today) (if submitted, readonly, span 1)
- Compliance % (Today) (if submitted, readonly, span 1)
- Actual Start Date (datepicker, min=startDate, max=today, span 1)
- Actual End Date (datepicker, min=startDate, max=today, disable if submitted, span 1)

**ROW 3:**
- Customer (multi-select with search, span 1)
- CC List (multi-select with search, span 1)
- To List (multi-select with search, span 1)
- Applicable Service Tower (multi-select, readonly, span 1)
- View Maturity Level (button, aligned to bottom right)

**HTML:**
**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Date picker components enable calendar-based date selection. Textarea fields accommodate multi-line text input. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods. Form validation ensures required fields are completed before submission.

**Field Styling:**
**Styling Specifications:**

Background color: #FAFCFF. Text color: #6B7280. Font size: 10.5px. Font weight: 500. Padding: 16px 20px. Border radius: 6px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. CSS Grid layout organizes content in a responsive grid structure. Gap between elements: 12px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

---

## 4-Level Hierarchical Checklist

### Structure Overview. Hover effects provide visual feedback on interactive elements.
Service Tower (Level 1 - Expansion Panel)
├─ Process Model (Level 2 - Block)
│  ├─ Process Area (Level 3 - Block)
│  │  ├─ Process (Level 4 - Block)
│  │  │  └─ Checkpoint Table
│  │  │     ├─ S.No
│  │  │     ├─ Weightage
│  │  │     ├─ Look For
│  │  │     ├─ Status (dropdown)
│  │  │     ├─ Score (readonly)
│  │  │     ├─ Notes (textarea)
│  │  │     └─ Findings (button)


### Level 1: Service Tower Panel

**HTML:**
**Component Structure:**

Expandable panels are used to show/hide detailed information. Checkboxes provide boolean/multi-select input options. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties.

**Styling:**
**Styling Specifications:**

Background color: #EBF3FF !important. Text color: #1D4ED8. Font size: 20px. Font weight: 700. Padding: 12px 16px. Border radius: 10px !important for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 10px.

### Level 2: Process Model Block

**HTML:**
**Component Structure:**

Checkboxes provide boolean/multi-select input options. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties.

**Styling:**
**Styling Specifications:**

Background color: #CCFBF1. Text color: #065F46. Font size: 12px. Font weight: 700. Padding: 10px. Border radius: 8px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px.

### Level 3: Process Area Block

**HTML:**
**Component Structure:**

Checkboxes provide boolean/multi-select input options. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties.

**Styling:**
**Styling Specifications:**

Background color: #F3E8FF. Text color: #6B21A8. Font size: 11.5px. Font weight: 700. Padding: 8px. Border radius: 7px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px.

### Level 4: Process Block with Checkpoint Table

**HTML:**
**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Checkboxes provide boolean/multi-select input options. Textarea fields accommodate multi-line text input. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Conditional rendering (*ngIf) controls element visibility based on component state. Two-way data binding connects form inputs to component properties. Click handlers respond to user interactions with appropriate methods.

**Styling:**
**Styling Specifications:**

Background color: #FEF3C7. Text color: #78350F. Font size: 11px. Font weight: 700. Padding: 6px. Border radius: 6px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

---

## Action Footer

**Layout:**
**Component Structure:**

Action buttons are provided for user interactions. Material icons enhance visual clarity throughout the interface. Conditional rendering (*ngIf) controls element visibility based on component state. Click handlers respond to user interactions with appropriate methods.

**Styling:**
**Styling Specifications:**

Background color: #F9FAFB. Text color: #212529. Font size: 13px. Font weight: 500. Padding: 16px 20px. Border radius: 6px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

---

## Findings Tab

**Component:**
**Component Structure:**

Conditional rendering (*ngIf) controls element visibility based on component state.

**Styling:**
**Styling Specifications:**

Background color: #FAFAFA. Padding: 20px.

---

## Common Design System

### Typography

**Styling Specifications:**

Text color: #1D1D1F. Font weight: 600.

### Colors

**Styling Specifications:**

### Spacing Scale

**Styling Specifications:**

### Border Radius

**Styling Specifications:**

### Shadows

**Styling Specifications:**

### Material Component Overrides

**Styling Specifications:**

Background color: #0071E3. Text color: #1F2937. Font size: 13px. Font weight: 500. Padding: 6px 0. Border radius: 8px for rounded corners. Subtle box shadow provides depth and elevation. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

---

## Technical Specifications

### Component Structure

**TypeScript Implementation:**

Data models define the structure and types for component data. This is a standalone Angular component with defined selector, template, and styles.

### Data Models

**TypeScript Implementation:**

Data models define the structure and types for component data.

---

## Responsive Design

### Breakpoints

**Styling Specifications:**

### Mobile Adjustments

**Styling Specifications:**

Responsive breakpoints ensure proper display across device sizes.

---

## Accessibility

### ARIA Labels

**Component Structure:**

This section uses Material form fields with outlined appearance. Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Textarea fields accommodate multi-line text input. Material icons enhance visual clarity throughout the interface. The structure uses Angular's *ngFor directive to iterate over data collections dynamically. Click handlers respond to user interactions with appropriate methods. Form validation ensures required fields are completed before submission.

### Keyboard Navigation

- All interactive elements accessible via Tab key
- Enter key activates buttons and selects options
- Escape key closes dropdowns and dialogs
- Arrow keys navigate dropdown options
- Space key toggles checkboxes

### Focus Indicators

**Styling Specifications:**

Border radius: 4px for rounded corners.

### Screen Reader Support

**Component Structure:**

Conditional rendering (*ngIf) controls element visibility based on component state. Form validation ensures required fields are completed before submission.

---

This comprehensive specification covers the complete SQA Management Setup phase with all 10 tabs, providing pixel-perfect details for recreating the interface in Angular 19 with Material Design 3.
