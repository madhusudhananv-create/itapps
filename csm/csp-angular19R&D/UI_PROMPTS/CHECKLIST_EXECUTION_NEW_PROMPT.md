# Checklist Execution New Page - Complete UI Recreation Prompt

## Page Overview
Create an Apple-inspired modern Checklist Based Assessment execution page with gradient backgrounds, card-based layouts, 4-level color-coded hierarchy (Service Tower > Process Model > Process Area > Process), modern form sections, and comprehensive checkpoint tables with inline editing.

---

## Layout Structure

### Main Container
- **Background**: Linear gradient (135deg, #F5F7FA 0%, #E8ECF1 100%)
- **Padding**: 20px
- **Min-height**: 100vh
- **Font-family**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif

---

## Page Header Section
**Background**: White
**Border-radius**: 16px
**Box-shadow**: 0 2px 8px rgba(0, 0, 0, 0.08)
**Padding**: 20px 24px
**Margin-bottom**: 24px

### Header Layout
**Display**: Horizontal flex, space-between, align-center

**Left Side**:
- **Back Button**: Circular button, 40×40px, Material icon "arrow_back", color #3B82F6
  - **Hover**: Background rgba(59, 130, 246, 0.08), scale 1.05
  - **Transition**: all 0.3s ease
- **Company Logo**: Height 40px, rounded corners 8px, subtle shadow, margin 0 12px
- **Project Selector**: Inline Material select dropdown, compact style
- **Page Title**: Gradient text (Blue spectrum: #3B82F6 → #2563EB)
  - **Font-size**: 32px
  - **Font-weight**: 700
  - **Letter-spacing**: -0.5px
  - **Background-clip**: text
  - **-webkit-text-fill-color**: transparent

**Right Side** (Action Buttons):
- **Layout**: Horizontal flex, gap 12px

**Buttons** (48×48px each):
1. **Export Button**: 
   - Icon: Material icon "download"
   - Color: #3B82F6
   - Background: transparent
   - Hover: Background rgba(59, 130, 246, 0.08)

2. **Filter Button**:
   - Icon: Material icon "filter_list"
   - Color: #3B82F6
   - Same hover effect

3. **Save Button**:
   - Background: Linear gradient (135deg, #10B981, #059669) - Green
   - Icon: Material icon "save"
   - Color: White
   - Border-radius: 12px
   - Box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3)
   - Hover: translateY(-2px), shadow increase

---

## Assessment Form Section (Card)
**Background**: White
**Border-radius**: 16px
**Box-shadow**: 0 2px 8px rgba(0, 0, 0, 0.08)
**Padding**: 0 (sections have individual padding)
**Margin-bottom**: 20px
**Overflow**: hidden

### Section Headers (Collapsible)
**Padding**: 16px 20px
**Background**: Linear gradient (to right, #F0F9FF, #DBEAFE) - Light blue
**Border-bottom**: 1px solid #E5E7EB
**Cursor**: pointer
**User-select**: none

**Layout**: Horizontal flex, space-between, align-center

**Left**:
- **Icon**: Material icon (varies by section), 20px, color #3B82F6
- **Title**: (16px, font-weight 600, color #1A202C, text-transform uppercase, letter-spacing 0.5px)

**Right**:
- **Chevron Icon**: Material icon "expand_more", rotate 0deg/180deg on expand

### Form Fields Grid
**Padding**: 20px 24px
**Display**: CSS Grid
**Grid-template-columns**: repeat(auto-fit, minmax(280px, 1fr))
**Gap**: 16px
**Background**: White

### Row-Specific Background Colors
**Purpose**: Visual grouping with colored gradients

**Row 1 (Basic Information)**: 
- **Background**: Linear gradient (to right, #EFF6FF, #DBEAFE) - Blue
- **Border-radius**: 12px
- **Padding**: 20px
- **Margin-bottom**: 16px

**Row 2 (Checklist Details)**:
- **Background**: Linear gradient (to right, #F0FDFA, #CCFBF1) - Teal
- **Same styling**

**Row 3 (Communication)**:
- **Background**: Linear gradient (to right, #F5F3FF, #EDE9FE) - Purple
- **Same styling**

### Field Styling (Material Form Fields)
**Appearance**: Outline
**Background**: White
**Border-radius**: 10px
**Border**: 1.5px solid #D1D9E0

**Label**:
- **Font-size**: 11px
- **Font-weight**: 600
- **Text-transform**: uppercase
- **Letter-spacing**: 0.3px
- **Color**: #64748B

**Required Asterisk**: Color #EF4444 (red)

**Info Badge** (for conditional fields):
- **Background**: rgba(59, 130, 246, 0.12)
- **Color**: #3B82F6
- **Font-size**: 10px
- **Padding**: 2px 6px
- **Border-radius**: 4px
- **Text**: "As on audit date/today"

**Input**:
- **Height**: 40px (single-line), auto (textarea)
- **Padding**: 10px 12px
- **Font-size**: 14px
- **Color**: #1A202C

**Focus State**:
- **Border-color**: #3B82F6
- **Box-shadow**: 0 0 0 3px rgba(59, 130, 246, 0.1)

**Disabled State**:
- **Background**: #F8FAFC
- **Color**: #94A3B8
- **Cursor**: not-allowed

---

## Hierarchical Checklist Display (4 Levels)
**Section**: Main content area
**Margin-top**: 24px

### Level 1: Service Tower
**Card Styling**:
- **Background**: Linear gradient (135deg, #3B82F6, #2563EB) - Blue
- **Color**: White (#FFFFFF)
- **Border-radius**: 16px
- **Padding**: 20px 24px
- **Margin-bottom**: 16px
- **Box-shadow**: 0 4px 16px rgba(59, 130, 246, 0.25)

**Header Layout**: Horizontal flex, space-between, align-center

**Left**:
- **Icon**: Material icon "business", 24px, white
- **Title**: Service Tower name (18px, font-weight 600)

**Center**:
- **N/A Checkbox**: Semi-transparent white background (rgba(255,255,255,0.2))
  - **Backdrop-filter**: blur(10px)
  - **Padding**: 8px 16px
  - **Border-radius**: 10px
  - **Label**: "N/A" checkbox

**Right**:
- **Score Display**: White text with backdrop blur
  - **Background**: rgba(255, 255, 255, 0.2)
  - **Backdrop-filter**: blur(10px)
  - **Padding**: 8px 16px
  - **Border-radius**: 12px
  - **Font-weight**: 600
  - **Format**: "Score: 85/100"

**Expansion Icon**: Chevron, rotation animation

### Level 2: Process Model
**Layout**: Nested within Service Tower
**Background**: Linear gradient (to right, #F0F9FF, #E0F2FE) - Light blue
**Border-left**: 4px solid #0284C7 (ocean blue)
**Border-radius**: 12px
**Padding**: 16px 20px
**Margin**: 16px 0 16px 20px

**Header**:
- **Icon**: Material icon "account_tree", 20px, color #0284C7
- **Title**: Process Model name (16px, font-weight 500)
- **Score Badge**: 
  - Background #E0F2FE
  - Color #0369A1
  - Padding 6px 12px
  - Border-radius 10px

### Level 3: Process Area
**Background**: Linear gradient (to right, #F0FDFA, #CCFBF1) - Teal
**Border-left**: 3px solid #14B8A6 (cyan)
**Border-radius**: 10px
**Padding**: 14px 18px
**Margin**: 12px 0 12px 16px

**Header**:
- **Icon**: Material icon "folder", 18px, color #0D9488
- **Title**: Process Area name (15px, font-weight 500)
- **Score Badge**: Background #CCFBF1, Color #0F766E

### Level 4: Process
**Background**: Linear gradient (to right, #F5F3FF, #EDE9FE) - Purple
**Border-left**: 2px solid #7C3AED (indigo)
**Border-radius**: 8px
**Padding**: 12px 16px
**Margin**: 12px 0 12px 12px

**Header**:
- **Icon**: Material icon "check_circle_outline", 16px, color #7C3AED
- **Title**: Process name (14px, font-weight 500)
- **Score Badge**: Background #EDE9FE, Color #6D28D9

---

## Checkpoints Table (within Level 4)
**Width**: 100%
**Border-collapse**: separate
**Border-spacing**: 0 4px
**Margin-top**: 16px
**Background**: Transparent

### Table Header
**Background**: Linear gradient (to bottom, #F8FAFC, #F1F5F9)
**Border-radius**: 8px (top corners)
**Padding**: 10px 8px

**Header Cell**:
- **Font-size**: 11px
- **Font-weight**: 600
- **Text-transform**: uppercase
- **Letter-spacing**: 0.4px
- **Color**: #475569
- **Text-align**: left

### Column Definitions

| Column | Width | Content Type |
|--------|-------|--------------|
| **S.No** | 60px | Sequential number |
| **Wheelage** | 140px | Dropdown select |
| **Look for** | Min 250px | Text description |
| **Status** | 160px | Dropdown (NA/Yes/No/Partial) |
| **Score** | 100px | Number input (0-100) |
| **Notes** | Min 200px | Textarea |
| **Findings** | 80px | Icon button |

### Table Rows
**Background**: White
**Border**: 1px solid #E5E7EB
**Border-radius**: 8px
**Padding**: 10px 8px
**Margin-bottom**: 4px
**Transition**: all 0.2s ease

**Hover**:
- **Background**: #F8FAFC
- **Box-shadow**: 0 2px 6px rgba(0, 0, 0, 0.06)

**Cell Padding**: 8px
**Cell Vertical-align**: middle

### S.No Cell
**Text-align**: center
**Font-weight**: 600
**Color**: #3B82F6

### Wheelage Dropdown
**Material Select**:
- **Appearance**: Outline
- **Height**: 36px
- **Font-size**: 12px
- **Options**: S1, S2, S3, S4, C1, C2, C3, C4, etc.
- **Border-radius**: 6px

### Look for Cell
**Font-size**: 13px
**Color**: #1A202C
**Line-height**: 1.5
**Max-width**: 350px
**Word-wrap**: break-word

### Status Dropdown
**Material Select**:
- **Appearance**: Outline
- **Height**: 36px
- **Font-size**: 12px
- **Options**: NA, Yes, No, Partial
- **Color-coded options**:
  - **NA**: Gray
  - **Yes**: Green (#10B981)
  - **No**: Red (#EF4444)
  - **Partial**: Orange (#F59E0B)

### Score Input
**Material Input**:
- **Type**: number
- **Min**: 0
- **Max**: 100
- **Height**: 36px
- **Font-size**: 13px
- **Text-align**: center
- **Font-weight**: 600
- **Border-radius**: 6px

**Color-coded by value**:
- **80-100**: Color #10B981 (green)
- **60-79**: Color #F59E0B (orange)
- **0-59**: Color #EF4444 (red)

### Notes Textarea
**Material Textarea**:
- **Rows**: 2
- **Auto-grow**: Yes
- **Max-rows**: 5
- **Font-size**: 12px
- **Padding**: 8px
- **Border-radius**: 6px

### Findings Button
**Type**: Icon button
**Icon**: Material icon "add_circle_outline" or "description"
**Size**: 36×36px
**Color**: #7C3AED (purple)
**Hover**: Background rgba(124, 58, 237, 0.08), scale 1.1

---

## Action Buttons (Bottom)
**Layout**: Horizontal flex, center aligned, gap 16px
**Padding**: 24px 32px
**Background**: White
**Border-top**: 1px solid #E5E7EB
**Position**: sticky, bottom 0
**Box-shadow**: 0 -2px 8px rgba(0, 0, 0, 0.04)

### Save Button
**Background**: Linear gradient (135deg, #10B981, #059669) - Green
**Color**: White
**Padding**: 12px 32px
**Height**: 48px
**Border-radius**: 12px
**Font-size**: 15px
**Font-weight**: 600
**Icon**: Material icon "save", 20px, margin-right 8px
**Box-shadow**: 0 4px 12px rgba(16, 185, 129, 0.3)
**Hover**: translateY(-2px), box-shadow 0 6px 18px rgba(16, 185, 129, 0.4)

### Submit Button
**Background**: Linear gradient (135deg, #3B82F6, #2563EB) - Blue
**Same styling as Save**
**Icon**: Material icon "send", 20px
**Box-shadow**: 0 4px 12px rgba(59, 130, 246, 0.3)

### Cancel Button
**Background**: #F1F5F9
**Color**: #475569
**Height**: 48px
**Padding**: 12px 28px
**Border-radius**: 12px
**Font-size**: 15px
**Font-weight**: 500
**Hover**: Background #E2E8F0

---

## Progress Indicators
**Type**: Material progress bar
**Position**: Between major sections
**Height**: 3px
**Color**: #3B82F6
**Border-radius**: 2px

**Progress Calculation**: (Completed checkpoints / Total checkpoints) × 100

---

## Empty State (No Checklist Selected)
**Padding**: 100px 20px
**Text-align**: center

**Components**:
- **Icon**: Material icon "assignment", 80px, color #D1D9E0, opacity 0.5
- **Title**: "No Checklist Selected" (24px, font-weight 600, color #1A202C)
- **Description**: "Please select a checklist from the dropdown above to begin assessment" (16px, color #64748B, margin-top 8px)

---

## Loading State
**Type**: Skeleton loaders within each section

**Skeleton Card**:
- **Background**: Linear gradient animation (shimmer)
- **Height**: Varies by section
- **Border-radius**: 12px
- **Animation**: 2s infinite

---

## Color Palette

### Primary Colors
- **Blue**: #3B82F6
- **Dark Blue**: #1D4ED8  
- **Light Blue**: #DBEAFE

### Hierarchy Colors
- **Level 1 (Tower)**: #3B82F6 (blue gradient)
- **Level 2 (Model)**: #0284C7 (ocean blue)
- **Level 3 (Area)**: #0D9488 (teal)
- **Level 4 (Process)**: #7C3AED (purple)

### Semantic Colors
- **Success/Green**: #10B981
- **Warning/Orange**: #F59E0B
- **Error/Red**: #EF4444
- **Info/Blue**: #3B82F6

### Background Colors
- **Page**: #F5F7FA → #E8ECF1 (gradient)
- **Card**: #FFFFFF
- **Row 1**: #EFF6FF → #DBEAFE
- **Row 2**: #F0FDFA → #CCFBF1
- **Row 3**: #F5F3FF → #EDE9FE

### Text Colors
- **Primary**: #1A202C
- **Secondary**: #475569
- **Tertiary**: #64748B
- **Muted**: #94A3B8

### Border Colors
- **Light**: #E5E7EB
- **Medium**: #D1D9E0
- **Focus**: #3B82F6

---

## Typography

### Font Stack
`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`

### Font Sizes
- **Page Title**: 32px
- **Section Titles**: 16-18px
- **Tower Names**: 18px
- **Model Names**: 16px
- **Area Names**: 15px
- **Process Names**: 14px
- **Field Labels**: 11px
- **Table Headers**: 11px
- **Body Text**: 13-14px
- **Buttons**: 15px

### Font Weights
- **Page Title**: 700
- **Section Titles**: 600
- **Body**: 400-500
- **Buttons**: 600

---

## Spacing System (Based on 4px grid)

### Padding
- **Container**: 20-24px
- **Cards**: 20-24px
- **Sections**: 16-20px
- **Form rows**: 20px
- **Table cells**: 8-10px

### Margin
- **Between cards**: 20-24px
- **Between sections**: 16-20px
- **Level indentation**: 12-20px
- **Between buttons**: 16px

### Gaps
- **Form grid**: 16px
- **Button groups**: 16px
- **Table rows**: 4px

---

## Responsive Design

### Desktop (>1024px)
- **Full layout**: All features visible
- **Table**: All columns visible

### Tablet (768px - 1023px)
- **Form fields**: 2-column grid
- **Table**: Horizontal scroll
- **Reduced padding**: 12-16px

### Mobile (≤767px)
- **Form fields**: Single column
- **Table**: Card-based layout (transform)
- **Hierarchy**: Maintain nesting, reduce indentation
- **Font sizes**: Slightly smaller
- **Buttons**: Full width or stacked

---

## Accessibility

### ARIA Labels
- Expansion panels: aria-expanded
- Checkboxes: aria-checked
- Buttons: aria-label
- Form fields: Associated labels
- Tables: Proper table roles

### Keyboard Navigation
- Tab order: Logical flow
- Enter/Space: Activate buttons
- Arrow keys: Navigate table
- Escape: Close modals

### Color Contrast
- All text: WCAG AA compliant (4.5:1)
- White text on blue gradient: 7:1 contrast
- Interactive elements: Distinguishable

---

## Implementation Notes

1. Use Angular Material v19+ components
2. Implement nested expansion panels for hierarchy
3. Use reactive forms with validators
4. Add auto-save functionality (debounced)
5. Implement proper state management
6. Add confirmation dialogs for navigation
7. Use Material table for checkpoints
8. Implement inline editing
9. Add keyboard shortcuts
10. Implement progress tracking
11. Use backdrop-filter for glassmorphism
12. Add smooth scroll to sections
13. Implement drag-drop for ordering (optional)

---

This prompt provides complete specifications to recreate the Checklist Execution New page with identical Apple-inspired design, 4-level color-coded hierarchy, gradient backgrounds, and modern form layouts.
