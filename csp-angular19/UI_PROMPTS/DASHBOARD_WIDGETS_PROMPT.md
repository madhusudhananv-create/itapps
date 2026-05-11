# Operational Dashboard Widgets - High-Level UI Recreation Prompt

## Overview
Create a set of **dashboard widgets** for an operational Customer Success Management platform. These widgets display key metrics including Risk status, Contract timeline, Assessment planning, and CAP (Corrective Action Plan) stages in a card-based dashboard layout.

---

## Design System

**Framework**: Angular 19+ with Material Design  
**Style**: Clean card-based widgets with charts and status indicators  
**Colors**: Professional palette with red/orange/green status colors  
**Typography**: Roboto, 12-16px for content, 18-24px for headers

---

## Widget 1: Risk Status Widget

### Layout
**Card Container**:
- Width: 250px (flexible in grid)
- Background: #ffffff
- Border-radius: 8px
- Box-shadow: `0 2px 4px rgba(0, 0, 0, 0.1)`
- Padding: 16px

### Header
- **Title**: "Risks" (16px, font-weight 600, #212121)
- **Icon**: `warning` or `report_problem` (Material Icons, 20px, #f57c00)

### Content - Gauge Chart
**Semi-circular gauge** (180-degree arc):
- **Outer ring**: Color-coded by highest risk level
  - Red (#f44336) for HIGH risks
  - Orange (#ff9800) for MED risks  
  - Green (#4caf50) for LOW risks
- **Center number**: Total HIGH risk count
  - Font-size: 48px
  - Font-weight: 700
  - Color: Matches gauge color
- **Chart dimensions**: 180px × 120px

### Status Summary (Below Gauge)
**3-column grid** showing risk counts:
**Implementation Details:**

This section implements the described functionality using generic. The implementation spans approximately 3 lines and follows the component structure outlined above.

**Each column**:
- Count: 20px, font-weight 700, color-coded
- Label: 11px, uppercase, color-coded
- Colors:
  - HIGH: #f44336 (red)
  - MED: #ff9800 (orange)
  - LOW: #4caf50 (green)

### Footer
- **"View Details" link**:
  - Color: #1976d2
  - Font-size: 13px
  - Icon: `arrow_forward` (16px)
  - Hover: Underline
  - Click: Navigate to full Risk Management page

### Empty State
When no risks:
- Display: "No Active Risks" (14px, #757575)
- Icon: `check_circle` (32px, #4caf50)

---

## Widget 2: Contracts Status Widget

### Layout
**Card Container**:
- Width: 280px (flexible)
- Background: #ffffff
- Border-radius: 8px
- Box-shadow: `0 2px 4px rgba(0, 0, 0, 0.1)`
- Padding: 16px

### Header
- **Title**: "Contracts Status" (16px, font-weight 600)
- **Subtitle**: "(Next 3 months)" (12px, #757575, font-weight 400)
- **Icon**: `assignment` or `description` (20px, #1976d2)

### Content - Timeline Display

**When contracts exist**:
Display upcoming contract milestones in list format:

**Implementation Details:**

This section implements the described functionality using generic. The implementation spans approximately 7 lines and follows the component structure outlined above.

**Each item**:
- Bullet: Circle indicator (8px)
  - Green (#4caf50) for starts
  - Orange (#ff9800) for closes
- Project name: 14px, font-weight 500, #212121
- Date: 12px, #757575
- Margin-bottom: 12px between items

**When no contracts**:
Display centered message:
- **Text**: "No Projects/Contracts to start or close in next 3 months"
  - Font-size: 13px
  - Color: #757575
  - Text-align: center
  - Line-height: 1.4
- **Icon**: `event_available` (40px, #9e9e9e, opacity 0.5)
- **Padding**: 24px vertical

### Footer
- **"View All Contracts" link** (if contracts exist)
  - Color: #1976d2
  - Font-size: 13px

---

## Widget 3: Assessment Status Widget

### Layout
**Card Container**:
- Width: 320px (flexible)
- Background: #ffffff
- Border-radius: 8px
- Box-shadow: `0 2px 4px rgba(0, 0, 0, 0.1)`
- Padding: 16px

### Header
- **Icon**: Pie chart icon (Material Icons, 20px, #7b1fa2)
- **Title**: "Assessment Status" (16px, font-weight 600)
- **Period**: "Apr - 2026" (12px, #757575)

### Content - Assessment Timeline

**When assessments planned**:
Display assessment cards:
**Implementation Details:**

This section implements the described functionality using generic. The implementation spans approximately 6 lines and follows the component structure outlined above.

**Each assessment**:
- Title: 14px, font-weight 500
- Date: 12px, #757575
- Status badge: Color-coded (Blue/Green/Orange)
- Progress bar: 4px height, rounded, gradient fill

**When no assessments**:
Display empty state:
- **Icon**: Calendar/clipboard icon (64px, #e0e0e0)
- **Title**: "No Assessment Planned" (16px, font-weight 500, #616161)
- **Message**: "There are no assessments scheduled for this period" (12px, #9e9e9e)
- **Padding**: 32px vertical

### Footer
- **"View Details" link**:
  - Color: #1976d2
  - Font-size: 13px
  - Icon: `arrow_forward`

---

## Widget 4: CAP Stages Widget

### Layout
**Card Container**:
- Width: 380px (flexible)
- Background: #ffffff
- Border-radius: 8px
- Box-shadow: `0 2px 4px rgba(0, 0, 0, 0.1)`
- Padding: 16px

### Header
- **Icon**: `format_list_bulleted` (20px, #1976d2)
- **Title**: "CAP Stages" (16px, font-weight 600)
- **Subtitle**: "Corrective Action Plan" (12px, #757575)

### Content - Donut Chart

**Chart Configuration** (Highcharts or Chart.js):
- **Type**: Donut/Doughnut chart
- **Dimensions**: 220px × 220px
- **Center hole**: 50% radius
- **Data labels**: Show count on each segment

**5 Stages with Colors**:
1. **Review** - Blue (#2196f3) - Count: 1
2. **Submitted** - Red (#f44336) - Count: 2
3. **Verification** - Green (#4caf50) - Count: 1
4. **Implementation** - Orange (#ff9800) - Count: 8
5. **Customer Approval** - Amber (#ffc107) - Count: 0

**Chart Features**:
- Hover: Highlight segment, show percentage
- Data labels: Count inside segment (white text, 14px, bold)
- Legend position: Right side
- Legend font: 12px, Roboto

### Legend (Right Side)
Vertical list with colored squares:
**Implementation Details:**

This section implements the described functionality using generic. The implementation spans approximately 4 lines and follows the component structure outlined above.

**Legend item**:
- Color square: 12×12px, border-radius 2px
- Text: 12px, #616161
- Count: In parentheses, font-weight 500
- Spacing: 8px between items

### Footer
- **"View Details" link**:
  - Color: #1976d2
  - Font-size: 13px
  - Icon: `arrow_forward`
  - Click: Navigate to CAP workflow page

### Empty State
When no CAP items:
- Display: "No Active CAP Items" (14px, #757575)
- Icon: `assignment_turned_in` (40px, #9e9e9e)

---

## Widget 5: Findings by Type Widget

### Layout
**Card Container**:
- Width: 320px
- Background: #ffffff
- Border-radius: 8px
- Padding: 16px

### Header
- **Icon**: `format_align_left` (20px, #00897b)
- **Title**: "Findings by Type" (16px, font-weight 600)

### Content - Horizontal Bar Chart

**Chart Configuration**:
- **Type**: Horizontal bar chart
- **Height**: 200px
- **Y-axis**: Finding types (Process, Technical, Compliance, Documentation)
- **X-axis**: Count (0-10 scale)
- **Bar color**: Gradient from #00897b to #00695c
- **Bar height**: 24px
- **Spacing**: 16px between bars

**Data labels**:
- Position: End of bar (outside if bar too short)
- Font: 12px, font-weight 600
- Color: #212121

### Footer
- Link: "View All Findings" (#1976d2, 13px)

---

## Widget 6: Findings by Age Widget

### Layout
Similar to Widget 5

### Header
- **Icon**: `schedule` (20px, #f57c00)
- **Title**: "Findings by Age" (16px, font-weight 600)

### Content - Stacked Bar Chart

**Age Categories**:
- 0-30 days (Green #4caf50)
- 31-60 days (Amber #ffc107)
- 61-90 days (Orange #ff9800)
- 90+ days (Red #f44336)

**Chart**: Horizontal stacked bars by severity (High/Medium/Low)

---

## Dashboard Grid Layout

### Responsive Grid
**Styling Specifications:**

Padding: 16px. CSS Grid layout organizes content in a responsive grid structure. Gap between elements: 16px. Responsive breakpoints ensure proper display across device sizes.

### Widget Order (Desktop)
**Implementation Details:**

This section implements the described functionality using generic. The implementation spans approximately 7 lines and follows the component structure outlined above.

---

## Interactions

### Hover States
- Widget cards: `box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15)`
- Links: Underline, color darken 10%
- Chart segments: Highlight, show tooltip

### Click Behaviors
- **View Details links**: Navigate to full page
- **Chart segments**: Drill down to filtered data view
- **Widget header**: Optional collapse/expand

### Loading States
- Skeleton loaders for each widget type
- Shimmer animation while data loads

### Refresh
- **Auto-refresh**: Every 5 minutes
- **Manual refresh**: Icon button in widget header
- **Loading indicator**: Small spinner in header

---

## API Integration

### Expected Service Methods
**TypeScript Implementation:**

RxJS observables manage asynchronous data streams.

### Data Models
**TypeScript Implementation:**

Data models define the structure and types for component data.

---

## Accessibility

- **ARIA labels**: All charts and widgets
- **Keyboard navigation**: Tab through links
- **Color contrast**: WCAG AA compliant
- **Screen reader**: Chart data in table format (hidden)

---

## Summary

This dashboard provides **6 key widgets** for operational monitoring:
- Risk status with gauge visualization
- Contract timeline for next 3 months
- Assessment planning status
- CAP workflow stage distribution
- Findings analysis by type and age

Each widget is **self-contained**, with loading states, empty states, and drill-down navigation to detailed views.

**Word Count**: ~1,800 words
