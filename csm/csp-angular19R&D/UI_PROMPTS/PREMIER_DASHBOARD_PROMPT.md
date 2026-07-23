# Premier Dashboard - Complete UI Recreation Prompt

## Page Overview
Create an executive dashboard for displaying high-level customer success metrics, KPI performance, assessment status, risk indicators, and portfolio health with modern cards, charts, and drill-down capabilities.

---

## Layout Structure

### Main Container
- **Background**: Linear gradient (#FAFAFA → #FFFFFF)
- **Padding**: 16px
- **Min-height**: 100vh
- **Font-family**: 'Roboto', 'Segoe UI', sans-serif

---

## Dashboard Header
**Background**: White
**Border-radius**: 12px
**Box-shadow**: 0 2px 8px rgba(0, 0, 0, 0.08)
**Padding**: 20px 24px
**Margin-bottom**: 20px

### Header Layout (Flex, space-between)

**Left Side**:
- **Customer Logo**: 48px height, rounded corners
- **Customer Name**: 24px, font-weight 600
- **Last Updated**: 12px, color #757575, icon "access_time"

**Right Side** (Controls):
- **Date Range Selector**: Month + Year dropdowns (compact)
- **Portfolio Filter**: Multi-select dropdown
- **Refresh Button**: Icon "refresh", circular 40×40px
- **Export Button**: Icon "download", circular 40×40px

---

## KPI Summary Cards (Top Section)
**Layout**: Grid 4 columns (desktop), 2 (tablet), 1 (mobile)
**Gap**: 16px
**Margin-bottom**: 20px

### Card Structure (Reusable)
**Background**: White
**Border-radius**: 12px
**Box-shadow**: 0 2px 8px rgba(0, 0, 0, 0.04)
**Padding**: 20px
**Transition**: all 0.2s ease
**Hover**: Box-shadow increase, cursor pointer (if clickable)

**Layout**: Vertical flex

**Icon** (Top):
- **Size**: 48×48px
- **Background**: Light color (varies by metric)
- **Border-radius**: 12px
- **Icon**: 24px, colored

**Value** (Center):
- **Font-size**: 32px
- **Font-weight**: 700
- **Color**: Based on status (green/orange/red)
- **Animation**: Count-up on load

**Label** (Bottom):
- **Font-size**: 14px
- **Color**: #757575
- **Text-transform**: uppercase
- **Letter-spacing**: 0.5px

**Trend Indicator** (Optional):
- **Icon**: "trending_up" or "trending_down"
- **Value**: ±X% (12px, color green/red)
- **Position**: Bottom right corner

### KPI Cards (4 cards)

**1. Success Goal Achievement**:
- **Icon**: "flag", color #1976d2
- **Background**: #E3F2FD
- **Value**: "85%" (green if ≥80%, orange 60-79%, red <60%)
- **Label**: "Success Goals Met"

**2. KPI Performance**:
- **Icon**: "analytics", color #388e3c
- **Background**: #E8F5E9
- **Value**: "92%" (color-coded)
- **Label**: "KPI Targets Achieved"

**3. Assessment Status**:
- **Icon**: "assignment_turned_in", color #f57c00
- **Background**: #FFF3E0
- **Value**: "7/10" (assessments completed)
- **Label**: "Assessments Complete"

**4. Open Issues**:
- **Icon**: "error_outline", color #d32f2f
- **Background**: #FFEBEE
- **Value**: "12" (count)
- **Label**: "Open Action Items"

---

## Main Content Grid
**Layout**: CSS Grid
**Template**: 2 columns (70% / 30%) on desktop, 1 column on mobile
**Gap**: 20px

### Left Column (Main Charts)

#### 1. Customer Success Goal Trend Chart (Card)
**Height**: 400px
**Chart Type**: Line chart (Highcharts or similar)
**Background**: White card

**Card Header**:
- **Title**: "Customer Success Goal Performance" (18px, font-weight 600)
- **Period Selector**: Month/Quarter/Year tabs (Material tabs)
- **Legend**: Color-coded goals

**Chart Configuration**:
- **X-axis**: Time period
- **Y-axis**: Percentage (0-100%)
- **Lines**: One per success goal
- **Colors**: Material palette
- **Tooltips**: Detailed on hover
- **Grid**: Light gray
- **Animation**: Smooth draw-in

#### 2. KPI Performance Dashboard (Card)
**Height**: Auto (dynamic based on content)

**Table/Cards Hybrid**:
- **Header**: KPI name, target, actual, status
- **Row**: Mini card for each KPI area
  - **Icon**: Folder icon
  - **Name**: KPI area name
  - **Progress Bar**: Visual progress (0-100%)
  - **Status Badge**: Met/Not Met/Exceeded
  - **Drill-down**: Click to see details

**Layout**: Grid 2 columns (if space), otherwise stack

#### 3. Assessment Calendar/Timeline (Card)
**Height**: 350px

**View Options**: Calendar or Timeline (toggle)

**Calendar View**:
- **Material Calendar**: mat-calendar component
- **Marked Dates**: Dots/colors for assessments
  - **Planned**: Blue dot
  - **In Progress**: Orange dot
  - **Completed**: Green dot
- **Click**: Show assessment details

**Timeline View**:
- **Vertical timeline**: Past, present, future
- **Cards**: Assessment cards on timeline
- **Status indicators**: Color-coded

---

### Right Column (Summary Widgets)

#### 1. Risk Overview Widget (Card)
**Height**: 200px

**Layout**: Donut chart or segmented display

**Segments**:
- **Critical Risks**: Count + percentage (red)
- **High Risks**: Count + percentage (orange)
- **Medium Risks**: Count + percentage (yellow)
- **Low Risks**: Count + percentage (green)

**Center**: Total risk count (large number)

**Click**: Navigate to risk page

#### 2. Top Issues Widget (Card)
**Height**: 300px

**List**: Top 5 critical issues/action items

**Each Item**:
- **Priority Icon**: Color-coded
- **Title**: Issue title (truncated)
- **Owner**: Avatar + name (small)
- **Due Date**: Color-coded by urgency

**Footer**: "View All Issues" link

#### 3. Recent Assessments Widget (Card)
**Height**: 300px

**List**: Last 5 assessments

**Each Item**:
- **Icon**: Assessment type icon
- **Title**: Assessment name
- **Status Badge**: Current status
- **Score**: Compliance percentage
- **Date**: Completed date

**Footer**: "View All Assessments" link

#### 4. Quick Actions Widget (Card)
**Height**: 200px

**Buttons**: Large icon buttons (4 actions)

1. **Add Action Item**: Icon "add_task"
2. **Schedule Assessment**: Icon "event"
3. **Upload Documents**: Icon "upload_file"
4. **Generate Report**: Icon "description"

**Button Styling**:
- **Size**: 60×60px (icon area)
- **Icon**: 32px
- **Label**: 12px, below icon
- **Hover**: Background color, lift effect

---

## Interactive Elements

### Drill-Down Behavior
**Click on KPI Card** → Navigate to KPI Details page with filters pre-applied
**Click on Assessment** → Open assessment details dialog
**Click on Risk segment** → Navigate to risk page filtered by severity
**Click on Issue** → Open issue details side panel

### Refresh Animation
**Icon**: Rotate 360deg (0.5s)
**Cards**: Fade out/in (0.3s)
**Charts**: Re-draw animation

### Loading States
**Cards**: Skeleton loader (shimmer effect)
**Charts**: Loading spinner in center
**Text**: Skeleton bars (animated gradient)

---

## Responsive Breakpoints

### Desktop (>1200px)
- **KPI Cards**: 4 columns
- **Main Grid**: 70/30 split
- **All widgets**: Visible

### Tablet (768px - 1199px)
- **KPI Cards**: 2 columns
- **Main Grid**: 60/40 split
- **Some widgets**: Collapsed

### Mobile (≤767px)
- **KPI Cards**: 1 column
- **Main Grid**: 1 column (stacked)
- **Charts**: Reduced height
- **Widgets**: Carousel or tabs

---

## Color Palette

### Status Colors
- **Success**: #4caf50
- **Warning**: #ff9800
- **Error**: #f44336
- **Info**: #2196f3

### Chart Colors
**Material Palette** (8 colors for multiple lines):
1. #1976d2 (blue)
2. #388e3c (green)
3. #f57c00 (orange)
4. #7b1fa2 (purple)
5. #c62828 (red)
6. #00796b (teal)
7. #fbc02d (yellow)
8. #455a64 (blue-gray)

### Background
- **Page**: #FAFAFA → #FFFFFF (gradient)
- **Cards**: #FFFFFF
- **Hover**: #F5F5F5

---

## Typography

### Font Sizes
- **Customer Name**: 24px
- **Card Titles**: 18px
- **KPI Values**: 32px
- **KPI Labels**: 14px
- **Body Text**: 13px
- **Small Text**: 12px

### Font Weights
- **Customer Name**: 600
- **Card Titles**: 600
- **KPI Values**: 700
- **Labels**: 400

---

## Charts Configuration (Highcharts)

### Common Settings
- **Credits**: Disabled
- **Export**: Enabled (PNG, PDF, SVG)
- **Animation**: Smooth (1000ms)
- **Responsive**: True
- **Tooltip**: Custom formatted
- **Legend**: Bottom aligned

### Line Chart Settings
- **Line Width**: 2px
- **Marker**: Circle, 4px
- **Area Fill**: Semi-transparent gradient
- **Grid**: Light gray, dashed

---

## Empty State
(If no data for customer)

**Icon**: Material icon "dashboard", 80px, color #e0e0e0  
**Title**: "No Dashboard Data Available" (20px, font-weight 600)  
**Description**: "Select a customer and date range to view dashboard metrics" (14px, color #757575)

---

## Implementation Notes

1. Use Angular Material v19+ for UI components
2. Integrate Highcharts for charting  
3. Implement lazy loading for widgets
4. Add caching for dashboard data (5 min TTL)
5. Use RxJS for real-time updates (optional)
6. Implement drill-down routing with state preservation
7. Add export dashboard to PDF functionality
8. Use virtual scrolling in lists (if >50 items)
9. Implement responsive image optimization
10. Add print stylesheet
11. Use Angular CDK for drag-drop widget reordering (optional)
12. Implement dark mode toggle (optional)

---

This prompt recreates an executive Premier Dashboard with KPI cards, trend charts, widgets, and interactive drill-down capabilities using modern Material Design and charting libraries.
