# Checklist Assessment Page - Complete UI Recreation Prompt

## Page Overview
Create an Apple-inspired modern Checklist Assessment page with project selection, planned assessment accordion table, hierarchical checklist display (4 levels), and comprehensive form fields for audit management.

---

## Layout Structure

### Container (page-wrap)
- **Max-width**: 1400px
- **Margin**: 0 auto
- **Padding**: 14px 18px
- **Display**: flex column
- **Gap**: 12px
- **Background**: #F8FAFC
- **Font-family**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- **Font-size**: 13px
- **Min-height**: 100vh

---

## Main Sections

### 1. Project Selector Card
**Background**: White (#FFFFFF)
**Border**: 0.5px solid #E5E7EB
**Border-radius**: 12px
**Overflow**: hidden

#### Card Header
**Background**: #F1F5F9
**Padding**: 10px 16px
**Border-bottom**: 0.5px solid #E5E7EB
**Layout**: Horizontal flex, space-between

**Left Side**:
- **Back Button**: 32×32px, border-radius 8px, transparent background, Material icon "arrow_back" (20px, color #475569), hover background rgba(0,0,0,0.05)
- **Customer Logo**: Height 32px, auto width, object-fit contain, margin-right 6px
- **Folder Icon**: Material icon "folder_open", 18px, color #1A56DB
- **Title**: "Project Selection" (12px, font-weight 600, uppercase, letter-spacing 0.06em, color #1A202C)
- **Subtitle**: "Select a project to view checklist assessments" (11px, color #94A3B8)

#### Card Body
**Padding**: 16px 20px

**Project Select Field** (Material Select):
- **Max-width**: 320px
- **Width**: 100%
- **Appearance**: outline
- **Label**: "Select Project"
- **Font-size**: 12px (label and options)
- **Min-height**: 38px (infix)
- **Background**: White

**Dropdown Search** (inside dropdown):
- **Sticky position**: Top of dropdown
- **Background**: #F8FAFC
- **Border-bottom**: 1px solid #E5E7EB
- **Input**: Material text input with search icon suffix
- **Placeholder**: "Search project"
- **Font-size**: 12px

**No Results Message**:
- **Text**: "No results found"
- **Style**: Centered, italic, color #94A3B8, padding 12px

---

### 2. Page Title
**Text**: "Checklist Assessment"
**Font-size**: 20px
**Font-weight**: 700
**Color**: #1A202C
**Margin**: 8px 0
**Letter-spacing**: -0.02em
**Padding**: 0 4px

---

### 3. Loading Progress Bar
**Type**: Material indeterminate progress bar
**Color**: Primary (#1A56DB)
**Visibility**: Conditional (when loading)

---

### 4. Planned Assessment Expansion Panel (Material Accordion)
**Card styling**: Same as Project Selector Card
**Border-radius**: 12px !important
**Default**: Expanded when loaded

#### Expansion Panel Header
**Background**: #F1F5F9
**Padding**: 14px 20px
**Min-height**: 52px

**Title Section**:
- **Layout**: Horizontal flex, align-center, gap 10px
- **Icon**: Material icon "assignment", 18px, color #1A56DB
- **Title**: "Planned Assessment" (12px, font-weight 600, uppercase, letter-spacing 0.06em)
- **Subtitle**: "View list of planned assessments for the selected project" (11px, color #94A3B8)

#### Filter Bar (Checkbox)
**Layout**: Horizontal flex, justify-end
**Padding**: 10px 16px
**Background**: #FAFBFC
**Border-bottom**: 1px solid #E5E7EB

**Checkbox**:
- **Label**: "Include Completed Assessments" (12px, font-weight 500, color #1A202C)
- **Style**: Material checkbox with 6px margin-right

#### Planned Audits Table
**Wrapper**: Horizontal scrollable container
**Min-width**: 1100px (table)
**Width**: 100%
**Border-collapse**: separate
**Border-spacing**: 0
**Font-size**: 11px
**Margin**: 0 10px

**Scrollbar Styling**:
- **Height**: 6px (webkit)
- **Thumb**: rgba(0,0,0,0.1), border-radius 3px
- **Hover**: rgba(0,0,0,0.15)

**Table Header**:
- **Background**: Linear gradient (to bottom, #F9FAFB, #F3F4F6)
- **Font-size**: 10px (headers)
- **Font-weight**: 600
- **Color**: #475569
- **Text-transform**: uppercase
- **Letter-spacing**: 0.05em
- **Padding**: 8px 10px
- **Border-bottom**: 2px solid #E5E7EB
- **Position**: sticky, top 0
- **White-space**: nowrap

**Column Definitions**:

| Column | Width | Alignment | Font Size |
|--------|-------|-----------|-----------|
| **Title** | 200px (min 180px) | left | 11px |
| **Planned Date** | 85px | center | 11px |
| **Actual Start** | 85px | center | 11px |
| **Due Date** | 95px | center | 11px |
| **Compliance % (Audit date)** | 75px | center | 10px (header) |
| **Current Compliance %** | 75px | center | 10px |
| **Total Findings** | 55px | center | 10px |
| **Open** | 48px | center | 10px |
| **Closed** | 52px | center | 10px |
| **Status** | 90px | center | 10px |
| **Check** | 60px | center | 10px |

**Table Rows**:
- **Background**: White (#FFFFFF)
- **Border-bottom**: 1px solid #E5E7EB
- **Transition**: all 0.15s ease
- **Hover**: Background #F9FAFB, box-shadow 0 1px 3px rgba(0,0,0,0.05)
- **Padding**: 8px 10px (cells)

**Title Cell** (first column):
- **Text**: Clickable link
- **Color**: #1A56DB (blue)
- **Font-weight**: 500
- **Font-size**: 12px
- **Cursor**: pointer
- **Hover**: Underline, color #1D4ED8

**Date Cells**:
- **Format**: yyyy-mm-dd (first 10 characters)
- **Empty**: "—" (em dash)
- **Font-size**: 11px

**Numeric Cells** (Findings, Open, Closed):
- **Font-weight**: 600
- **Open**: Color #DC2626 (red)
- **Closed**: Color #059669 (green)
- **Total**: Color #1A202C (default)

**Status Cell** (Badge):

Base badge style:
- **Display**: inline-flex, align-center
- **Padding**: 4px 10px
- **Border-radius**: 12px
- **Font-size**: 10px
- **Font-weight**: 600
- **White-space**: nowrap
- **Letter-spacing**: 0.02em
- **Text-transform**: uppercase
- **Box-shadow**: 0 1px 2px rgba(0,0,0,0.05)

Badge types:
1. **Planned**: Background gradient (#DBEAFE → #BFDBFE), Color #1E40AF, Border 1px solid #93C5FD
2. **Submitted**: Background gradient (#D1FAE5 → #A7F3D0), Color #065F46, Border 1px solid #6EE7B7
3. **In Progress**: Background gradient (#FEF3C7 → #FDE68A), Color #92400E, Border 1px solid #FCD34D
4. **Completed**: Background gradient (#E0E7FF → #C7D2FE), Color #3730A3, Border 1px solid #A5B4FC

**Check Cell**:
- **Icon**: Material icon "done"
- **Color**: Blue (#007AFF) if checked, lightgray if not
- **Size**: 20px
- **Text-align**: center

**Empty State** (no data):
- **Padding**: 24px
- **Text-align**: center
- **Icon**: Material icon "assignment", 48px, opacity 0.3, color #94A3B8
- **Text**: "No planned assessments found for this project" (13px, margin-top 8px, color #94A3B8)

---

### 5. Assessment Form Card
**Visibility**: Conditional (when audit selected)
**Background**: White
**Border**: 0.5px solid #E5E7EB
**Border-radius**: 12px

#### Fields Section
**Padding**: 14px 16px 10px
**Border-bottom**: 0.5px solid #E5E7EB
**Background**: White

**Field Layout System**:
All rows use flexbox with nowrap (horizontal scrolling on mobile)

#### Row 1 (Light Blue Background: #EFF6FF)
**Background**: Linear gradient (to right, #EFF6FF, #DBEAFE)
**Padding**: 12px
**Border-radius**: 8px
**Margin-bottom**: 12px
**Gap**: 12px
**Min-width**: 280px per field

**Fields** (7 columns):
1. **Assessment Title** (textarea):
   - Label with required asterisk (red)
   - Material form field, outline appearance
   - Rows: 2
   - Readonly/disabled
   - Font-size: 13px

2. **Appraiser Name** (select):
   - Material select dropdown
   - Required
   - Disabled when submitted

3. **Appraisee Name(s)** (multi-select):
   - Material multi-select
   - Required
   - Disabled when submitted

4. **Planned Start Date** (datepicker):
   - Material datepicker
   - Readonly/disabled
   - Icon suffix

5. **Planned End Date** (datepicker):
   - Same as start date

6. **Planned Hrs** (number input):
   - Readonly/disabled

7. **Actual Hrs** (number input):
   - Disabled when submitted

#### Row 2 (Light Teal Background: #F0FDFA → #CCFBF1)
**Background**: Linear gradient (to right, #F0FDFA, #CCFBF1)
**Same layout structure as Row 1**

**Fields** (8 columns, conditional +2 when submitted):
1. Choose a Checklist (select)
2. Version (number, readonly)
3. Score (number, readonly)
4. Process Compliance % (number, readonly)
5. Score (Today) - *shown only when submitted*
6. Compliance % (Today) - *shown only when submitted*
7. Actual Start Date (datepicker)
8. Actual End Date (datepicker)

#### Row 3 (Light Purple Background: #F5F3FF → #EDE9FE)
**Background**: Linear gradient (to right, #F5F3FF, #EDE9FE)
**Same layout structure**

**Fields** (4 columns):
1. **CC List** (multi-select with search):
   - Dropdown search with "Search employee" input
   - Material icon "search" suffix
   - No results message

2. **To List** (multi-select with search):
   - Same as CC List

3. **Service Tower** (select):
   - Disabled when submitted

4. **Maturity Button**:
   - Text: "Calculate Maturity Level"
   - Primary button style
   - Icon: Material icon "calculate"
   - Disabled when submitted

**Field Wrapper Styling** (all fields):
- **Label**:
  - Font-size: 11px
  - Font-weight: 600
  - Text-transform: uppercase
  - Letter-spacing: 0.05em
  - Color: #64748B
  - Margin-bottom: 6px
  - Required asterisk: Color #DC2626

- **Material Form Field**:
  - Appearance: outline
  - White background
  - Border-radius: 8px
  - Border: 1.5px solid rgba(0,0,0,0.08)
  - Padding: 8px 12px (infix)
  - Min-height: 38px
  - Font-size: 13px
  - Focus: Blue border (#1A56DB), glow shadow

---

### 6. Hierarchical Checklist Display (4 Levels)
**Section**: Below form fields
**Padding**: 16px

**Loading Indicator**: Material progress bar when loading

#### Level 1: Service Tower
**Layout**: Expansion panel (Material accordion)
**Background**: Linear gradient (to right, #3B82F6, #2563EB) - Blue
**Color**: White (#FFFFFF)
**Padding**: 12px 16px
**Margin-bottom**: 12px
**Border-radius**: 12px
**Box-shadow**: 0 2px 8px rgba(59, 130, 246, 0.15)

**Header**:
- **Icon**: Material icon "business", 24px, white
- **Title**: Service tower name (16px, font-weight 600)
- **N/A Checkbox**: Semi-transparent white background (rgba(255,255,255,0.2)), backdrop-filter blur
- **Score Display**: White badge with backdrop blur, padding 6px 12px, border-radius 10px
- **Chevron Icon**: Rotation 0deg/180deg for expand/collapse

#### Level 2: Process Model
**Background**: Linear gradient (to right, #F0F9FF, #E0F2FE) - Light blue
**Border-left**: 4px solid #0284C7 (ocean blue)
**Padding**: 12px 20px 12px 16px
**Margin**: 16px 0 16px 20px
**Border-radius**: 10px

**Header**:
- **Icon**: Material icon "account_tree", 20px, color #0284C7
- **Title**: Process model name (15px, font-weight 500)
- **Score**: Badge with background #E0F2FE, color #0369A1

#### Level 3: Process Area
**Background**: Linear gradient (to right, #F0FDFA, #CCFBF1) - Teal
**Border-left**: 3px solid #14B8A6 (cyan)
**Padding**: 10px 16px 10px 12px
**Margin**: 12px 0 12px 16px
**Border-radius**: 8px

**Header**:
- **Icon**: Material icon "folder", 18px, color #0D9488
- **Title**: Process area name (14px, font-weight 500)
- **Score**: Badge with background #CCFBF1, color #0F766E

#### Level 4: Process
**Background**: Linear gradient (to right, #F5F3FF, #EDE9FE) - Purple
**Border-left**: 2px solid #7C3AED (indigo)
**Padding**: 10px 12px
**Margin**: 12px 0 12px 12px
**Border-radius**: 8px

**Header**:
- **Icon**: Material icon "check_circle_outline", 16px, color #7C3AED
- **Title**: Process name (13px, font-weight 500)
- **Score**: Badge with background #EDE9FE, color #6D28D9

#### Checkpoints Table (within Process)
**Width**: 100%
**Border-collapse**: separate
**Border-spacing**: 0 4px
**Margin-top**: 12px

**Table Header**:
- **Background**: Linear gradient (to bottom, #F8FAFC, #F1F5F9)
- **Font-size**: 11px
- **Font-weight**: 600
- **Text-transform**: uppercase
- **Letter-spacing**: 0.04em
- **Padding**: 8px 6px
- **Border-radius**: 6px (first/last th)

**Column Definitions**:

| Column | Width | Content |
|--------|-------|---------|
| **S.No** | 60px | Sequential number |
| **Wheelage** | 140px | Dropdown select |
| **Look for** | Min 250px | Text description |
| **Status** | 160px | Dropdown (NA, Yes, No, Partial) |
| **Score** | 100px | Number input (0-100) |
| **Notes** | Min 200px | Textarea (multi-line) |
| **Findings** | 80px | Icon button to add findings |

**Table Rows**:
- **Background**: White
- **Border**: 1px solid #E5E7EB
- **Border-radius**: 8px
- **Padding**: 8px 6px (cells)
- **Hover**: Background #F9FAFB, box-shadow 0 1px 2px rgba(0,0,0,0.04)
- **Transition**: all 0.15s ease

**Inline Form Fields**:
- **Select/Input**: Compact Material form fields
- **Font-size**: 12px
- **Height**: 32px
- **Border-radius**: 6px
- **Padding**: 4px 8px

**Findings Button**:
- **Type**: Icon button
- **Icon**: Material icon "add_circle_outline" or "visibility"
- **Size**: 32px
- **Color**: #1A56DB
- **Hover**: Background rgba(26, 86, 219, 0.08), scale 1.1

---

### 7. Action Buttons (Bottom of Form)
**Layout**: Horizontal flex, center aligned, gap 12px
**Padding**: 16px
**Border-top**: 1px solid #E5E7EB
**Background**: #FAFBFC

**Save Button**:
- **Background**: Linear gradient (135deg, #059669, #047857) - Green
- **Color**: White
- **Padding**: 10px 24px
- **Height**: 40px
- **Border-radius**: 8px
- **Font-size**: 14px
- **Font-weight**: 600
- **Icon**: Material icon "save", 18px
- **Box-shadow**: 0 3px 10px rgba(5, 150, 105, 0.25)
- **Hover**: translateY(-1px), box-shadow increase
- **Disabled**: Gray background, cursor not-allowed

**Submit Button**:
- **Background**: Linear gradient (135deg, #1A56DB, #1D4ED8) - Blue
- **Same styling as Save button**
- **Icon**: Material icon "send", 18px

**Cancel Button**:
- **Background**: #F2F2F7
- **Color**: #1D1D1F
- **Same size/padding as other buttons**
- **Border**: 1px solid #E5E7EB
- **Hover**: Background #E5E5EA

---

## Color Palette

### Primary Colors
- **Blue**: #1A56DB (primary actions)
- **Green**: #059669 (success, save)
- **Red**: #DC2626 (danger, required)
- **Amber**: #92400E (warning)

### Background Colors
- **Page**: #F8FAFC
- **Card**: #FFFFFF
- **Section**: #F1F5F9
- **Row 1**: #EFF6FF → #DBEAFE
- **Row 2**: #F0FDFA → #CCFBF1
- **Row 3**: #F5F3FF → #EDE9FE

### Text Colors
- **Primary**: #1A202C
- **Secondary**: #475569
- **Tertiary**: #94A3B8

### Border Colors
- **Light**: #E5E7EB
- **Medium**: #C8CACE
- **Focus**: #1A56DB

### Hierarchy Colors (Levels)
- **Level 1 (Tower)**: #3B82F6 (blue)
- **Level 2 (Model)**: #0284C7 (ocean blue)
- **Level 3 (Area)**: #14B8A6 (teal)
- **Level 4 (Process)**: #7C3AED (purple)

---

## Typography

### Font Stack
`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

### Font Sizes
- **Page Title**: 20px
- **Section Titles**: 12px
- **Tower Names**: 16px
- **Model Names**: 15px
- **Area Names**: 14px
- **Process Names**: 13px
- **Field Labels**: 11px
- **Body Text**: 13px
- **Table Headers**: 10-11px
- **Table Cells**: 11-12px

### Font Weights
- **Page Title**: 700
- **Section Titles**: 600
- **Labels**: 600
- **Body**: 400-500

### Letter Spacing
- **Titles**: -0.02em
- **Labels**: 0.05-0.06em (uppercase)
- **Body**: 0em

---

## Spacing System

### Padding
- **Page**: 14px 18px
- **Cards**: 10-16px
- **Sections**: 12-16px
- **Form Fields**: 8-12px
- **Table Cells**: 8-10px

### Margin
- **Between Cards**: 12px
- **Between Sections**: 12-16px
- **Between Fields**: 12px
- **Level Indentation**: 12-20px

### Gaps
- **Field Rows**: 12px
- **Action Buttons**: 12px
- **Header Items**: 10px

---

## Responsive Design

### Mobile (≤768px)
- **Field Rows**: Horizontal scroll enabled
- **Tables**: Horizontal scroll with sticky first column
- **Font Sizes**: Slightly reduced
- **Padding**: Reduced to 8-12px

---

This prompt provides complete specifications to recreate the Checklist Assessment page with identical design, layout, colors, fonts, spacing, and interactions including the complex 4-level hierarchical checklist structure.
