# Success Goal & KPI Performance Page - Complete UI Recreation Prompt

## Page Overview
Create an Apple-inspired modern page for displaying Customer Success Goal & KPI Performance metrics with filterable data tables, product views, iOS-style segmented controls, glassmorphic filter sidebar, and comprehensive SLA rejection workflows.

---

## Layout Structure

### Main Container
- **Background**: Linear gradient (135deg, #FAFAFA 0%, #FFFFFF 100%)
- **Border-radius**: 20px
- **Margin**: 16px
- **Width**: calc(100% - 32px)
- **Min-height**: 600px
- **Box-shadow**: 0 4px 16px rgba(0, 0, 0, 0.08)
- **Border**: 1px solid rgba(0, 0, 0, 0.08)
- **Font-family**: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif
- **Transition**: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
- **Hover box-shadow**: 0 8px 32px rgba(0, 0, 0, 0.12)

---

## Main Sections

### 1. Glassmorphism Filter Sidebar (Right Side Filter)
**Visibility**: Toggled by filter icon click
**Position**: Fixed right side
**Width**: 300px
**Background**: rgba(255, 255, 255, 0.75)
**Backdrop-filter**: blur(20px) saturate(180%)
**Box-shadow**: -2px 0 20px rgba(0, 0, 0, 0.1)
**Padding**: 24px
**Z-index**: 1000
**Animation**: Slide-in from right (transform: translateX(100%) to translateX(0))
**Transition**: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)

#### Filter Header
- **Layout**: Horizontal flex, space-between
- **Margin-bottom**: 20px

**Title**: "Filter" (bold, 16px, color #1D1D1F)
**Close Icon**: × (16px, cursor pointer, rotation 0deg to 90deg on hover, transition 0.3s)

#### Month Dropdown
- **Label**: "Month" (12px, font-weight 600, color #1D1D1F, margin-bottom 8px)
- **Select field**: White background, border-radius 8px, padding 8px 12px, border 1.5px solid rgba(0, 0, 0, 0.08)
- **Options**: Full month names (January, February, ..., December) instead of abbreviations
- **Font-size**: 13px
- **Focus**: Blue border (#007AFF), box-shadow 0 0 0 4px rgba(0, 122, 255, 0.12)

#### Year Dropdown
- **Label**: "Year" (12px, font-weight 600, color #1D1D1F, margin-bottom 8px)
- **Select field**: Same styling as month dropdown
- **Options**: Dynamic years (current ± 3 years)

#### Action Buttons
- **Layout**: Horizontal flex, gap 8px, margin-top 20px

**Apply Button**:
- **Background**: Linear gradient (135deg, #007AFF 0%, #5856D6 100%)
- **Color**: White
- **Padding**: 10px 20px
- **Border-radius**: 8px
- **Font-size**: 13px
- **Font-weight**: 600
- **Box-shadow**: 0 3px 10px rgba(0, 122, 255, 0.25)
- **Hover**: translateY(-1px), box-shadow 0 5px 14px rgba(0, 122, 255, 0.35)
- **Active**: translateY(0), box-shadow 0 2px 8px rgba(0, 122, 255, 0.2)

**Cancel Button**:
- **Background**: #F2F2F7
- **Color**: #1D1D1F
- **Padding**: 10px 20px
- **Border-radius**: 8px
- **Font-size**: 13px
- **Font-weight**: 600
- **Hover**: Background #E5E5EA

---

### 2. Apple-Style Header Section
**Padding**: 16px 24px 12px
**Border-bottom**: 1px solid rgba(0, 0, 0, 0.08)
**Background**: Linear gradient (135deg, #FFFFFF 0%, #FAFBFC 100%)

#### Top Row (Title and Actions)
**Layout**: Horizontal flex, space-between, align-center
**Margin-bottom**: 10px

**Page Title** (Left):
- **Font-size**: 16px
- **Font-weight**: 600
- **Color**: Text gradient (Blue #007AFF to Purple #5856D6)
- **Letter-spacing**: -0.3px
- **Margin**: 0 0 4px 0
- **Text**: "Customer Success Goal & KPI Performance - [Month], [Year]" or "Service Level Achievement - [Month], [Year]"
- **Background Clip**: text
- **-webkit-text-fill-color**: transparent

**Action Icons** (Right):
**Layout**: Horizontal flex, gap 12px

1. **Filter Icon**:
   - **Icon**: fa-filter (font-awesome) or Material icon "filter_list"
   - **Size**: 18px
   - **Color**: #007AFF (Apple blue)
   - **Cursor**: pointer
   - **Transition**: all 0.3s ease
   - **Hover**: Color lighten, scale(1.1)
   - **Tooltip**: "Filter here"

2. **Close Icon**:
   - **Icon**: × (multiplication sign)
   - **Size**: 22px
   - **Color**: #8E8E93 (Apple gray)
   - **Cursor**: pointer
   - **Transition**: all 0.3s ease
   - **Hover**: Color #1D1D1F, rotate(90deg)

#### Project Info Card
**Visibility**: Conditional (when project selected)
**Layout**: Horizontal flex, align-center
**Margin-top**: 10px
**Padding**: 10px 14px
**Background**: White (#FFFFFF)
**Border-radius**: 10px
**Box-shadow**: 0 2px 8px rgba(0, 0, 0, 0.04)
**Border**: 1px solid rgba(0, 0, 0, 0.08)
**Margin-left**: 2px
**Transition**: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
**Hover**: Box-shadow 0 4px 16px rgba(0, 0, 0, 0.08)

**Label**: "Project:" (12px, font-weight 600, color #6E6E73, uppercase, letter-spacing 0.3px, margin-right 8px)
**Project Name**: (14px, font-weight 600, color #1D1D1F)

---

### 3. iOS-Style Segmented Control (View By Section)
**Visibility**: Conditional (when project selected)
**Margin-top**: 12px
**Padding-left**: 2px
**Layout**: Horizontal flex, align-center, flex-wrap, gap 12px

#### Label
- **Text**: "View by:"
- **Font-size**: 12px
- **Font-weight**: 600
- **Color**: #6E6E73 (secondary text)
- **Text-transform**: uppercase
- **Letter-spacing**: 0.3px
- **Margin-right**: 8px

#### Segmented Control Container
- **Display**: inline-flex
- **Background**: #F2F2F7 (Apple light gray)
- **Border-radius**: 8px
- **Padding**: 2px
- **Box-shadow**: inset 0 1px 3px rgba(0, 0, 0, 0.08)

#### Radio Button Options (3 segments)
**Options**:
1. "Customer Success Goal"
2. "Work Group / KPI Area"
3. "Service Tower"

**Default State**:
- **Label padding**: 7px 14px
- **Font-size**: 13px
- **Font-weight**: 500
- **Color**: #6E6E73 (secondary text)
- **Cursor**: pointer
- **Border-radius**: 6px
- **Transition**: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
- **White-space**: nowrap
- **User-select**: none

**Hover State** (non-selected):
- **Color**: #1D1D1F (primary text)

**Selected/Active State**:
- **Background**: White (#FFFFFF)
- **Color**: #007AFF (Apple blue)
- **Font-weight**: 600
- **Box-shadow**: 0 2px 6px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)

**Hide native radio input**: display: none

---

### 4. Service Tower Dropdown Row
**Visibility**: Conditional (when "Service Tower" view selected)
**Layout**: Horizontal flex, align-center, gap 12px
**Margin-top**: 12px
**Padding-left**: 2px

#### Service Tower Dropdown (Material Select)
**Max-width**: 350px
**Width**: 350px
**Flex-shrink**: 0

**Field Wrapper**:
- **Background**: White (#FFFFFF)
- **Border-radius**: 8px
- **Border**: 1.5px solid rgba(0, 0, 0, 0.08)
- **Padding**: 8px 12px (infix)
- **Transition**: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
- **Hover**: Border-color #007AFF, box-shadow 0 0 0 3px rgba(0, 122, 255, 0.08)
- **Focus**: Border-color #007AFF, box-shadow 0 0 0 4px rgba(0, 122, 255, 0.12)

**Select Text**:
- **Font-size**: 13px
- **Font-weight**: 500
- **Color**: #1D1D1F
- **Placeholder**: "Select Service Tower"

**Select Arrow**:
- **Color**: #007AFF

**No subscript wrapper** (hide validation messages)

#### Apply Button
Same styling as filter sidebar Apply button:
- **Background**: Linear gradient (135deg, #007AFF 0%, #5856D6 100%)
- **Color**: White
- **Padding**: 10px 24px
- **Height**: auto
- **Border-radius**: 8px
- **Font-size**: 13px
- **Font-weight**: 600
- **Box-shadow**: 0 3px 10px rgba(0, 122, 255, 0.25)
- **Text-transform**: none
- **Letter-spacing**: 0.3px
- **Line-height**: 1.2
- **Hover**: translateY(-1px), box-shadow 0 5px 14px rgba(0, 122, 255, 0.35)
- **Active**: translateY(0), box-shadow 0 2px 8px rgba(0, 122, 255, 0.2)

---

### 5. Product KPI Table (Product View Mode)
**Visibility**: Conditional (when product view is active)
**Width**: 95%
**Margin-left**: 2%
**Margin-bottom**: 10px
**Border-collapse**: separate
**Border-spacing**: 0 5px

#### Table Header
**Background**: Transparent
**Color**: Black
**Margin-bottom**: 5px

**Row 1**:
- **Product** (width: 225px, max-width: 225px, padding-left: 5px, font-weight 500, font-size 12px)
- **Service Level Achievement** (colspan 3, width 80px, max-width 80px, text-align right, font-weight 500, font-size 12px)

**Row 2** (Sub-headers):
- Empty column (40% width, height 5px)
- **Overall** (colspan 2, text-align center, 18% width, font-size 10px, font-weight 500)
- **Critical Measurement** (text-align center, 18% width, font-size 10px, font-weight 500)
- **Key Measurement** (text-align center, 18% width, font-size 10px, font-weight 500)

#### Table Rows
**Border-left**: 3px solid (color varies by status)
**Box-shadow**: -1.5px 2px 2.5px 1px lightgray
**Cursor**: pointer
**Transition**: all 0.2s ease
**Hover**: Box-shadow increase, transform translateY(-1px)

**Column 1: Product Title**
- **Width**: 40%
- **Max-width**: 110px
- **Font-size**: 14px
- **Padding-left**: 5px
- **Overflow**: hidden
- **White-space**: nowrap
- **Text-overflow**: ellipsis
- **Tooltip**: Full product title

**Column 2: Status Icon**
- **Text-align**: center
- **Padding-left**: 4%
- **Icon**: Thumbs up (fa-thumbs-up) or Thumbs down (fa-thumbs-down)
- **Color**: Depends on status (green for good, red for "Need Focus")

**Column 3: Overall SLA Status**
- **Color**: Black
- **Font-size**: 12px
- **Text-align**: left
- **Width**: 10%
- **Format**: "Met/Total" (e.g., "8/10")

**Column 4: Critical Measurement**
- **Color**: Black
- **Font-size**: 12px
- **Text-align**: center
- **Width**: 15%
- **Format**: "Met/Total" (e.g., "3/3")

**Column 5: Key Measurement**
- **Color**: Black
- **Font-size**: 12px
- **Text-align**: center
- **Width**: 15%
- **Format**: "Met/Total" (e.g., "5/7")

---

### 6. KPI Details Table (Material Table)
**Width**: 95%
**Margin-left**: 25px
**Mat-elevation**: z8
**Border-collapse**: collapse

#### Table Controls Bar (Above Table)
**Layout**: Horizontal flex, space-between
**Margin-bottom**: 0.8%

**Left Side** (Action Buttons):
- **Gap**: 5px margin-right between buttons
- **Margin-left**: 25px

**Buttons**:
1. **Reject SLA** (warning color, #FF9500 background, border-radius 4px, font-size 13px, height 36px, text-transform none)
2. **Update SLA Rejection** (same styling)
3. **Send Review Feedback** (same styling)
4. **Clear** (primary color, #007AFF background)

**Right Side** (Exclusions Toggle):
- **Radio Group**: Material radio group, inline display
- **Options**:
  - "Before Exclusions" (value: false)
  - "After Exclusions" (value: true)
- **Padding**: 6px between options
- **Font-size**: 13px
- **Color**: #1D1D1F

**Checkbox** (Display Base Measure Information):
- **Position**: Float right, margin-right 55px
- **Label**: "Display Base Measure Information"
- **Font-size**: 13px

#### Progress Bar
**Type**: Material indeterminate progress bar
**Visibility**: When loading
**Color**: Primary (#007AFF)
**Height**: 4px
**Margin-bottom**: 8px

#### Table Columns

| Column | Width | Header Text |
|--------|-------|-------------|
| **Select** | 1% | Checkbox (master toggle) |
| **Reference** | 4% | "SLA Id" |
| **KPI Name** | 20% | "KPI Name" |
| **Frequency** | 5% | "Frequency" |
| **Expected Target** | 5% | "Expected" |
| **Minimum Target** | 5% | "Minimum" |
| **Actual** | 5% | "Actual" |
| **Status** | 5% | "Status" |
| **Priority** | 5% | "Priority" |
| **Trend** | 5% | "Trend" |
| **CAPA** | 5% | "CAPA" |

#### Table Header Styling
- **Background**: #BBDEFB (light blue)
- **Height**: 48px
- **Font-size**: 12px
- **Font-weight**: 600
- **Color**: #333
- **Text-align**: left
- **Padding**: 10px 8px
- **Text-transform**: capitalize
- **Letter-spacing**: 0.3px

#### Table Row Styling
- **Height**: 52px (variable based on content)
- **Border-bottom**: 1px solid rgba(0, 0, 0, 0.06)
- **Padding**: 10px 8px
- **Font-size**: 12px
- **Color**: #212121
- **Transition**: all 0.2s ease
- **Hover**: Background rgba(103, 126, 234, 0.05), box-shadow 0 2px 4px rgba(0, 0, 0, 0.08)

#### Special Cell Content

**1. Checkbox Cell**:
- Material checkbox
- Visibility: Based on access control and rejection status
- Master toggle in header

**2. KPI Name Cell** (Complex cell with multiple components):
- **KPI Title**: 14px, font-weight 500, color #1D1D1F
- **Status Badge**: See status badge styling below
- **Info Icon**: fa-info-circle, x-small size, absolute position, tooltip with comment
- **Comment Textarea** (conditional):
  - **Border-bottom**: 1px solid gray
  - **Margin-top**: 3px
  - **Placeholder**: Context-specific placeholder
  - **Max-length**: 1000 characters
  - **Font-size**: 12px
- **Base Measure Information** (conditional table):
  - **Font-size**: 12px
  - **Font-family**: Lato
  - **Color**: Gray (secondary)
  - **Border-spacing**: 0 5px
  - **Format**: "Numerator Description / Denominator Description = Numerator / Denominator"
- **Exclusion Comment** (conditional):
  - **Font-size**: 12px
  - **Color**: Gray
  - **Label**: "Exclusion Comment:" (color: orange, bold)

**3. Status Badge Styles**:
- **Display**: inline-block
- **Padding**: 4px 10px
- **Border-radius**: 12px
- **Font-size**: 11px
- **Font-weight**: 600

**Status Types**:
- **Status 1** (Pending): Background rgba(255, 149, 0, 0.12), Color #FF9500 (orange)
- **Status 2** (Approved): Background rgba(52, 199, 89, 0.12), Color #34C759 (green)
- **Status 3** (Rejected): Background rgba(255, 59, 48, 0.12), Color #FF3B30 (red)

**4. Target Pills** (Expected/Minimum/Actual cells):
- **Display**: inline-block
- **Padding**: 4px 8px
- **Border-radius**: 10px
- **Font-size**: 11px
- **Font-weight**: 600
- **Color coded based on performance**:
  - Red (#FF3B30): Below minimum
  - Yellow/Orange (#FF9500): Between minimum and expected
  - Green (#34C759): Met or exceeded expected
  - Blue (#007AFF): Exceeded significantly

**5. Trend and CAPA Cells**:
- Icon buttons or links
- Color: #007AFF
- Hover: Underline, color darken
- Cursor: pointer

---

### 7. Empty State
**Visibility**: When no data
**Text-align**: center
**Padding**: 60px 20px
**Background**: White
**Border-radius**: 12px
**Box-shadow**: 0 2px 8px rgba(0, 0, 0, 0.04)

**Icon**: Large icon (64px, color #8E8E93, opacity 0.5)
**Title**: "No KPI Data Available" (18px, font-weight 600, color #1D1D1F, margin 16px 0 8px)
**Message**: "Please select filters and apply to view KPI performance data." (14px, color #6E6E73)

---

## Color Palette (Apple-Inspired)

### Primary Colors
- **Apple Blue**: #007AFF
- **Apple Purple**: #5856D6
- **Apple Green**: #34C759
- **Apple Orange**: #FF9500
- **Apple Red**: #FF3B30
- **Apple Gray**: #8E8E93
- **Apple Light Gray**: #F2F2F7

### Text Colors
- **Primary**: #1D1D1F
- **Secondary**: #6E6E73

### Background Colors
- **White**: #FFFFFF
- **Light Gray**: #F2F2F7
- **Very Light Gray**: #FAFAFA
- **Dark**: #1C1C1E

### Borders & Shadows
- **Border Light**: rgba(0, 0, 0, 0.08)
- **Shadow Subtle**: 0 2px 8px rgba(0, 0, 0, 0.04)
- **Shadow Medium**: 0 4px 16px rgba(0, 0, 0, 0.08)
- **Shadow Strong**: 0 8px 32px rgba(0, 0, 0, 0.12)

---

## Typography

### Font Stack
`-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif`

### Font Sizes
- **Page Title**: 16px
- **Section Headers**: 14-16px
- **Body Text**: 13-14px
- **Table Headers**: 12px
- **Table Cells**: 12px
- **Labels**: 12px
- **Badges**: 11px
- **Small Text**: 10px

### Font Weights
- **Regular**: 400
- **Medium**: 500
- **Semi-bold**: 600
- **Bold**: 700

### Letter Spacing
- **Titles**: -0.3px (tighter)
- **Labels**: 0.3px (looser for uppercase)
- **Body**: 0 (default)

---

## Spacing System

### Padding
- **Container**: 16-24px
- **Cards**: 10-14px
- **Buttons**: 8-20px (vertical), 20-24px (horizontal)
- **Form Fields**: 8-12px
- **Table Cells**: 10-8px (vertical), 8px (horizontal)

### Margin
- **Between Sections**: 10-20px
- **Between Elements**: 8-16px
- **Between Buttons**: 5-8px

### Gaps (Flexbox)
- **Small**: 8px
- **Medium**: 12px
- **Large**: 20px

---

## Interactions & Animations

### Transitions
- **Smooth**: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
- **Bounce**: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)
- **Quick**: all 0.2s ease
- **Fade**: opacity 0.3s ease

### Hover Effects
- **Buttons**: translateY(-1px), box-shadow increase
- **Cards**: Box-shadow increase
- **Table Rows**: Background color change, shadow
- **Icons**: Scale(1.1), color change
- **Links**: Underline, color darken

### Active/Focus States
- **Buttons**: translateY(0), shadow decrease
- **Input Fields**: Blue border, glow shadow
- **Segmented Control**: Background white, shadow, color change

### Loading States
- **Progress Bar**: Indeterminate animation
- **Spinner**: Rotating animation
- **Backdrop**: Blur effect (backdrop-filter)

---

## Responsive Design

### Breakpoints
- **Mobile**: ≤768px
- **Tablet**: 769px - 1024px
- **Desktop**: >1024px

### Mobile Adjustments (≤768px)
- **Filter Sidebar**: Full width overlay
- **Header**: Stack elements vertically
- **Segmented Control**: Wrap to multiple rows
- **Service Tower Dropdown**: Full width
- **Product Table**: Horizontal scroll
- **KPI Table**: Horizontal scroll with sticky first column
- **Font Sizes**: Slightly smaller (12px body, 14px headers)

### Tablet Adjustments (≤1024px)
- **Filter Sidebar**: 250px width
- **Product Table**: Adjust column widths
- **KPI Table**: Maintain readability

---

## Accessibility

### ARIA Labels
- All icon buttons must have aria-label or matTooltip
- Table headers must have proper role="columnheader"
- Radio buttons must have proper aria-checked states
- Filter sidebar must have aria-modal="true" when open

### Keyboard Navigation
- Tab order follows logical flow (left to right, top to bottom)
- Enter/Space activates buttons
- Arrow keys navigate segmented control
- Escape closes filter sidebar
- All interactive elements keyboard accessible

### Color Contrast
- Text on backgrounds meets WCAG AA (4.5:1 ratio)
- Buttons have sufficient contrast
- Status badges have readable text
- Links are distinguishable

---

## Implementation Notes

1. Use Angular Material v19+ components
2. Implement Material table with sorting
3. Use reactive forms for filter inputs
4. Implement proper access control checks throughout
5. Add loading indicators for all async operations
6. Use Material dialog for confirmation actions
7. Implement tooltip directives for truncated text
8. Add proper validation for form inputs
9. Use Material checkbox/radio with custom styling
10. Implement backdrop-filter for glassmorphism (with -webkit prefix)
11. Use CSS gradients for text and backgrounds
12. Implement smooth transitions with cubic-bezier timing
13. Add touch-friendly targets (minimum 44x44px)
14. Implement horizontal scroll for tables on mobile
15. Use flexbox for responsive layouts

---

## Key Features

1. **Multi-View Support**: Customer Success Goal, Work Group/KPI Area, Service Tower
2. **iOS-Style Segmented Control**: Modern radio button alternative
3. **Glassmorphic Filter Sidebar**: Backdrop blur with smooth slide animation
4. **Product KPI Table**: Hierarchical view of product performance
5. **Detailed KPI Table**: Comprehensive data table with multiple columns
6. **SLA Rejection Workflow**: Multi-stage approval with comments
7. **Base Measure Display**: Expandable detail view
8. **Exclusions Toggle**: Before/After exclusions view
9. **Trend Charts**: Integration with chart viewing
10. **CAPA Viewing**: Corrective action tracking
11. **Filtering**: Advanced table filtering
12. **Export**: Excel export capability (implementation dependent)
13. **Access Control**: Role-based feature visibility
14. **Responsive**: Mobile, tablet, desktop support
15. **Apple Design Language**: SF Pro Display font, modern colors, smooth animations

---

This prompt provides complete specifications to recreate the Success Goal & KPI Performance page with identical Apple-inspired design, layout, colors, fonts, spacing, and interactions.
