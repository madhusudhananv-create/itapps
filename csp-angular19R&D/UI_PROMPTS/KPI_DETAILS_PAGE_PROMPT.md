# KPI Details Page - Complete UI Recreation Prompt

## Page Overview
Create an Apple-inspired modern page displaying KPI performance details with card-based expandable goal sections, status chips, target pills, priority badges, and smooth animations. Transform from flat table layout to elegant Material Design cards.

---

## Layout Structure

### Main Container
- **Background**: Linear gradient (135deg, #FAFAFA 0%, #FFFFFF 100%)
- **Padding**: 16px
- **Min-height**: 100vh
- **Font-family**: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif

---

## Page Header (Sticky)
**Position**: Sticky, top 0
**Z-index**: 100
**Background**: White with subtle shadow
**Padding**: 16px 20px
**Border-bottom**: 1px solid rgba(0, 0, 0, 0.06)

### Header Layout
**Display**: Horizontal flex, space-between, align-center

**Left Side**:
- **Back Button**: 36×36px, rounded circle, Material icon "arrow_back", color #007AFF, hover background rgba(0, 122, 255, 0.08)
- **Page Title**: "KPI Performance Dashboard" (28px, font-weight 600, gradient text: #007AFF → #5856D6)

**Right Side** (Filter Controls):
- **Month Selector**: Material select dropdown, compact style
- **Year Selector**: Material select dropdown, compact style  
- **Portfolio Filter**: Material multi-select
- **Project Filter**: Material multi-select
- **Filter Toggle Button**: Icon button with "filter_list" icon

---

## Filter Section (Collapsible)
**Visibility**: Toggled by filter button
**Background**: White
**Border-radius**: 12px
**Padding**: 16px 20px
**Margin-bottom**: 16px
**Box-shadow**: 0 2px 8px rgba(0, 0, 0, 0.04)

**Layout**: Grid auto-fit, minimum 280px per column, gap 16px

**Filters Include**:
- Month dropdown
- Year dropdown
- Portfolio multi-select
- Project multi-select
- Service Tower multi-select
- Status multi-select
- Priority multi-select

**Apply/Reset Buttons**:
- **Apply**: Gradient blue-purple background, white text, 40px height
- **Reset**: Light gray background, dark text, 40px height
- **Gap**: 12px between buttons

---

## Cards Container
**Layout**: Vertical flex, gap 16px
**Padding**: 0 4px

---

## Goal Card (Expandable Material Card)
**Background**: White
**Border-radius**: 16px
**Box-shadow**: 0 2px 8px rgba(0, 0, 0, 0.04)
**Margin-bottom**: 16px
**Overflow**: hidden
**Transition**: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
**Hover**: Box-shadow 0 4px 16px rgba(0, 0, 0, 0.08), translateY(-2px)

### Card Header (Expansion Header)
**Padding**: 20px 24px
**Background**: Linear gradient (to right, #FAFBFC 0%, #FFFFFF 100%)
**Border-bottom**: 1px solid rgba(0, 0, 0, 0.04) (when expanded)
**Cursor**: pointer
**User-select**: none

**Layout**: Horizontal flex, space-between, align-center

**Left Side**:
- **Goal Icon**: Material icon "flag", 24px, color #007AFF
- **Goal Title**: (18px, font-weight 600, color #1D1D1F, letter-spacing -0.3px)
- **Goal Description** (if any): (14px, color #6E6E73, margin-top 4px)

**Center** (Metrics):
- **Total KPIs Count**: (15px, color #8E8E93)
  - Format: "12 KPIs"
  - Icon: Material icon "assessment"

**Right Side**:
- **Overall Score**: Circular progress indicator (48px diameter)
  - Center text: "85%" (14px, font-weight 600)
  - Ring color: Green (#34C759) if ≥80%, Orange (#FF9500) if 60-79%, Red (#FF3B30) if <60%
  - Background: Light gray ring
- **Chevron Icon**: Material icon "expand_more", 24px, rotation animation (0deg/180deg)

### Card Body (Expansion Panel Content)
**Padding**: 0 24px 24px
**Animation**: Height expand/collapse, opacity fade

---

## KPI Area Section (within Goal Card)
**Padding**: 16px 0
**Border-bottom**: 1px solid rgba(0, 0, 0, 0.04) (between sections)

### Area Header
**Layout**: Horizontal flex, space-between, align-center
**Margin-bottom**: 12px

**Left**:
- **Area Icon**: Material icon "folder_open", 20px, color #5856D6
- **Area Name**: (16px, font-weight 600, color #1D1D1F)

**Right**:
- **Area Score**: Chip badge (background #F2F2F7, color #1D1D1F, padding 6px 12px, border-radius 12px)

---

## KPI Item Card
**Background**: White
**Border**: 1.5px solid #F2F2F7
**Border-radius**: 12px
**Padding**: 16px
**Margin-bottom**: 12px
**Transition**: all 0.2s ease
**Hover**: Border-color #007AFF, box-shadow 0 2px 8px rgba(0, 122, 255, 0.12), translateY(-1px)

### KPI Card Layout (Grid)
**Display**: CSS Grid
**Grid-template-columns**: 2fr 1fr 1fr 1fr 1fr auto
**Gap**: 16px
**Align-items**: center

**Column 1: KPI Details** (Left section, spans 2fr)

**KPI Name**:
- **Font-size**: 15px
- **Font-weight**: 600
- **Color**: #1D1D1F
- **Margin-bottom**: 4px
- **Line-height**: 1.4

**Identifier**:
- **Font-size**: 12px
- **Color**: #8E8E93
- **Display**: inline-flex
- **Icon**: Material icon "tag", 14px
- **Gap**: 4px

**Service Tower** (if applicable):
- **Chip**: Background rgba(136, 86, 214, 0.12), color #5856D6
- **Padding**: 4px 8px
- **Border-radius**: 8px
- **Font-size**: 11px
- **Font-weight**: 600
- **Margin-top**: 6px
- **Display**: inline-block

**Column 2: Priority Badge**
**Priority Chip**:
- **Display**: inline-flex, align-center
- **Padding**: 6px 12px
- **Border-radius**: 10px
- **Font-size**: 12px
- **Font-weight**: 600
- **Gap**: 4px

**Priority Types**:
1. **Critical**: Background #FFEBEE, Color #C62828, Icon "error"
2. **High**: Background #FFF3E0, Color #E65100, Icon "warning"
3. **Medium**: Background #FFF9C4, Color #F57F17, Icon "info"
4. **Low**: Background #E8F5E9, Color #2E7D32, Icon "check_circle"

**Column 3: Target Pill**
**Target Display**:
- **Display**: flex column, align-center
- **Label**: "Target" (10px, color #8E8E93, uppercase, letter-spacing 0.5px)
- **Value**: (14px, font-weight 600)

**Target Pill**:
- **Padding**: 6px 10px
- **Border-radius**: 12px
- **Font-size**: 13px
- **Font-weight**: 600
- **Margin-top**: 4px

**Target Colors** (based on operator):
- **Red** (#FF3B30): ≥ or > operators
- **Yellow** (#FF9500): = operator
- **Green** (#34C759): ≤ or < operators
- **Blue** (#007AFF): Range operators

**Column 4: Actual Value**
**Actual Display**:
- **Layout**: Same as Target
- **Label**: "Actual" (10px, color #8E8E93)
- **Value**: (16px, font-weight 700, color based on status)
  - Green (#34C759): Met/Exceeded
  - Orange (#FF9500): Below target
  - Red (#FF3B30): Not met

**Column 5: Status Chip**
**Status Badge**:
- **Display**: inline-flex, align-center
- **Padding**: 8px 14px
- **Border-radius**: 14px
- **Font-size**: 13px
- **Font-weight**: 600
- **Gap**: 6px
- **Box-shadow**: 0 2px 4px rgba(0, 0, 0, 0.08)

**Status Types**:
1. **Met**: Background #E8F5E9, Color #2E7D32, Icon "check_circle"
2. **Not Met**: Background #FFEBEE, Color #C62828, Icon "cancel"
3. **Exceeded**: Background #E3F2FD, Color #1565C0, Icon "verified"
4. **NA**: Background #F5F5F5, Color #757575, Icon "remove_circle"

**Column 6: Action Buttons**
**Button Group**:
- **Layout**: Horizontal flex, gap 4px

**Trend Button**:
- **Type**: Icon button
- **Icon**: Material icon "trending_up", 20px
- **Color**: #007AFF
- **Size**: 36×36px
- **Border-radius**: 8px
- **Hover**: Background rgba(0, 122, 255, 0.08), scale(1.05)
- **Tooltip**: "View Trend"

**Details Button**:
- **Type**: Icon button
- **Icon**: Material icon "visibility", 20px
- **Color**: #5856D6
- **Same styling as Trend button**
- **Tooltip**: "View Details"

---

## Frequency Badge
**Position**: Top-right corner of KPI card
**Display**: Inline chip
**Background**: rgba(142, 142, 147, 0.12)
**Color**: #8E8E93
**Padding**: 4px 10px
**Border-radius**: 10px
**Font-size**: 11px
**Font-weight**: 600
**Text-transform**: uppercase

---

## Empty State
**Visibility**: When no KPIs to display
**Padding**: 80px 20px
**Text-align**: center

**Components**:
- **Icon**: Material icon "assessment", 80px, color #E5E5EA, opacity 0.5
- **Title**: "No KPI Data Available" (20px, font-weight 600, color #1D1D1F, margin-top 16px)
- **Description**: "Select filters and apply to view KPI performance data" (15px, color #6E6E73, margin-top 8px)
- **Action Button**: "Apply Filters" button (gradient background)

---

## Loading States

### Skeleton Loader (Card)
**Background**: Linear gradient animation (shimmer effect)
**Border-radius**: 12px
**Height**: 120px (card placeholder)
**Margin-bottom**: 16px

**Animation**:
**Styling Specifications:**

**Background**: linear-gradient(90deg, #F5F5F5 25%, #E0E0E0 50%, #F5F5F5 75%)
**Background-size**: 2000px 100%
**Animation**: shimmer 2s infinite

### Loading Spinner (First Load)
**Type**: Material spinner
**Diameter**: 48px
**Color**: #007AFF
**Position**: Center of viewport
**Message**: "Loading KPI data..." (14px, color #8E8E93, margin-top 16px)

---

## Color Palette (Apple iOS Inspired)

### Primary Colors
- **Blue**: #007AFF (primary actions, icons)
- **Purple**: #5856D6 (secondary actions)
- **Green**: #34C759 (success, met)
- **Orange**: #FF9500 (warning, below target)
- **Red**: #FF3B30 (error, not met)
- **Gray**: #8E8E93 (secondary text)
- **Light Gray**: #F2F2F7 (backgrounds)

### Text Colors
- **Primary**: #1D1D1F
- **Secondary**: #6E6E73
- **Tertiary**: #8E8E93

### Background Colors
- **Page**: #FAFAFA → #FFFFFF (gradient)
- **Card**: #FFFFFF
- **Hover**: #FAFBFC
- **Chip**: #F2F2F7

### Shadows
- **Subtle**: 0 2px 8px rgba(0, 0, 0, 0.04)
- **Medium**: 0 4px 16px rgba(0, 0, 0, 0.08)
- **Strong**: 0 8px 32px rgba(0, 0, 0, 0.12)

---

## Typography

### Font Stack
`-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif`

### Font Sizes
- **Page Title**: 28px
- **Goal Title**: 18px
- **Area Name**: 16px
- **KPI Name**: 15px
- **Body Text**: 14px
- **Labels**: 12px
- **Chips/Badges**: 11-13px
- **Small Text**: 10px

### Font Weights
- **Regular**: 400
- **Medium**: 500
- **Semi-bold**: 600
- **Bold**: 700

---

## Spacing System (8px Grid)

### Padding
- **Container**: 16px
- **Cards**: 16-24px
- **Chips**: 4-8px (vertical), 10-14px (horizontal)
- **Buttons**: 8-12px

### Margin
- **Between Cards**: 16px
- **Between Sections**: 16-20px
- **Between Elements**: 8-12px

### Gaps
- **Grid Gap**: 16px
- **Button Groups**: 4px
- **Flex Gaps**: 8-12px

---

## Animations & Transitions

### Standard Transition
`all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`

### Hover Effects
- **Cards**: translateY(-2px), box-shadow increase
- **Buttons**: scale(1.05), background appearance
- **KPI Cards**: Border color change, shadow

### Expansion Animation
- **Height**: Auto expand/collapse
- **Opacity**: Fade in/out (0.3s ease)
- **Transform**: Slide down (translateY)

### Loading Animation
- **Skeleton**: Shimmer effect (2s infinite)
- **Spinner**: Rotate (1s linear infinite)

---

## Responsive Design

### Breakpoints
- **Mobile**: ≤600px
- **Tablet**: 601px - 768px
- **Desktop**: >768px

### Mobile Adjustments (≤600px)
- **KPI Card Grid**: Single column (stack all elements)
- **Header**: Stack title and filters
- **Filter Section**: Single column grid
- **Font Sizes**: Reduce by 1-2px
- **Padding**: Reduce to 12px
- **Cards**: Border-radius 8px

### Tablet Adjustments (≤768px)
- **KPI Card Grid**: 2-column layout for some elements
- **Filter Grid**: 2 columns
- **Maintain readability**: Adequate spacing

---

## Interactions

### Click Targets
- **Minimum**: 44×44px (touch-friendly)
- **Button Size**: 36-40px height
- **Chip Clickable**: Full chip area

### Hover States
- All interactive elements must have hover feedback
- Cursor pointer on clickable elements
- Visual feedback (color, shadow, scale)

### Focus States
- Blue outline: 2px solid #007AFF
- Outline offset: 2px
- Visible on keyboard navigation

---

## Accessibility

### ARIA Labels
- Expansion panels: aria-expanded="true/false"
- Buttons: aria-label descriptive text
- Status badges: aria-label with full status text
- Icons: aria-hidden="true" (decorative)

### Keyboard Navigation
- Tab order: Logical left-to-right, top-to-bottom
- Enter/Space: Activate buttons
- Arrow keys: Navigate within card groups
- Escape: Close expanded sections

### Color Contrast
- Text on backgrounds: WCAG AA compliant (4.5:1 ratio)
- Interactive elements: Sufficient contrast
- Status indicators: Color + icon (not color alone)

---

## Implementation Notes

1. Use Angular Material v19+ components
2. Implement virtual scrolling for large KPI lists (>100 items)
3. Use Material expansion panels for goal cards
4. Implement proper state management (RxJS)
5. Add debouncing for filter changes (300ms)
6. Implement lazy loading for KPI details
7. Use Material chips for status/priority badges
8. Add transition groups for list animations
9. Implement error boundaries
10. Use CSS Grid and Flexbox for responsive layouts
11. Add print stylesheet (optional)
12. Implement export to Excel/PDF (optional)

---

## Key Features

1. **Card-Based Layout**: Modern Material Design cards
2. **Expandable Sections**: Smooth expansion animations
3. **Status Visualization**: Color-coded chips and badges
4. **Priority Indicators**: Icon-based priority system
5. **Target Comparison**: Visual target vs actual display
6. **Trend Analysis**: Quick access to trend charts
7. **Filtering**: Comprehensive multi-criteria filtering
8. **Search**: Quick KPI search functionality
9. **Responsive**: Mobile-first design
10. **Loading States**: Skeleton loaders and spinners
11. **Empty States**: Helpful guidance
12. **Accessibility**: WCAG AA compliant

---

This prompt provides complete specifications to recreate the KPI Details page with identical Apple-inspired design, transforming from table layout to elegant card-based interface with all interactions and animations.
