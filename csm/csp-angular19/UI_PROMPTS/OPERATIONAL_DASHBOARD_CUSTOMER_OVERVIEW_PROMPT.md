# Operational Dashboard - Customer Overview (Page 1) - Complete UI Recreation Prompt

## Page Overview
Create a comprehensive **Operational Dashboard for Customer Overview** providing a holistic view of customer/project performance in an enterprise Customer Success Management platform. This is the primary operational dashboard featuring success goal performance tables, event/task tracking, semicircular gauge widgets for action items, risks, issues, and appreciations, contract status monitoring, key highlights carousel, service improvement plan tracking, and multi-page navigation. The design uses modern card-based layout with colorful gradients and Google Charts visualizations.

---

## Design System & Framework

### Technology Stack
- **Framework**: Angular 19+ (standalone components)  
- **UI Library**: Angular Material v19+ (Material Design 3)  
- **Icons**: Material Icons  
- **Styling**: SCSS with design tokens and CSS variables  
- **Charts**: Google Charts (Column charts, Semicircular gauges)

### Design Philosophy
**Modern Card-Based Dashboard** with vibrant gradients, clean white cards, and status-driven color coding. Emphasis on data visualization through charts and gauges, providing at-a-glance insights into customer health, performance, and operational metrics. Responsive design adapts seamlessly from desktop to mobile with card stacking.

---

## Layout Structure

### 1. Customer Header Section
**Background**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`  
**Padding**: 16px 24px  
**Border-radius**: 0 0 16px 16px  
**Box-shadow**: `0 4px 12px rgba(102, 126, 234, 0.2)`  
**Position**: Sticky top

**Header Layout** (Flex, justify-content: space-between):

**Left Side**:
- **Customer Logo**: 
  - Width: 120px
  - Height: auto
  - Max-height: 60px
  - Border-radius: 8px
  - Background: white
  - Padding: 8px
  - Margin-right: 16px

- **Customer Name**:
  **Styling Specifications:**

Background color: linear-gradient(90deg, #ffffff, #f0f9ff, #ffffff). Text color: transparent. Font size: 24px. Font weight: 700. Padding: 8px 16px
   - Border-radius: 20px
   - Hover: Background rgba(255, 255, 255, 0.3)

2. **Feedback Button**:
   - Icon: `feedback` (20px)
   - Text: "Feedback"
   - Same styling as Back button

3. **Voice of Customer Button**:
   - Icon: `record_voice_over` (20px)
   - Text: "Voice of Customer"
   - Same styling as Back button

4. **Filter Button**:
   - Icon: `filter_list` (20px)
   - Text: "Filter"
   - Same styling as Back button
   - Click: Opens filter dialog

**Navigation Row** (Below header, padding: 8px 24px):
- **Previous Button** (left):
  - Icon: `chevron_left` (24px)
  - Text: "Previous"
  - Disabled: When on first page
  
- **Page Indicator** (center):
  - Text: "Customer Overview (1 of 3)"
  - Font-size: 14px
  - Color: #FFFFFF
  
- **Next Button** (right):
  - Icon: `chevron_right` (24px)
  - Text: "Next"
  - Click: Navigates to Assessment Status page

### 2. Main Content Area
**Background**: #f5f7fa  
**Padding**: 16px  
**Display**: Grid or Flex column  
**Gap**: 16px

---

## Performance of Success Goal Section

### Section Card
**Background**: #FFFFFF  
**Border-radius**: 12px  
**Box-shadow**: `0 2px 8px rgba(0, 0, 0, 0.08)`  
**Padding**: 20px

### Section Header
**Display**: Flex, justify-content: space-between  
**Padding-bottom**: 12px  
**Border-bottom**: 2px solid #e5e7eb

**Title**: "Performance of Success Goal"  
- Font-size: 18px
- Font-weight: 700
- Color: #1e293b

**Actions** (gap: 8px):
- **Export Button**: Icon `file_download`, tooltip "Export to Excel"
- **Refresh Button**: Icon `refresh`, tooltip "Refresh Data"

### Performance Table

**Table Structure**:. Border radius: 20px
   - Hover: Background rgba(255, 255, 255, 0.3)

2. **Feedback Button**:
   - Icon: `feedback` (20px)
   - Text: "Feedback"
   - Same styling as Back button

3. **Voice of Customer Button**:
   - Icon: `record_voice_over` (20px)
   - Text: "Voice of Customer"
   - Same styling as Back button

4. **Filter Button**:
   - Icon: `filter_list` (20px)
   - Text: "Filter"
   - Same styling as Back button
   - Click: Opens filter dialog

**Navigation Row** (Below header, padding: 8px 24px):
- **Previous Button** (left):
  - Icon: `chevron_left` (24px)
  - Text: "Previous"
  - Disabled: When on first page
  
- **Page Indicator** (center):
  - Text: "Customer Overview (1 of 3)"
  - Font-size: 14px
  - Color: #FFFFFF
  
- **Next Button** (right):
  - Icon: `chevron_right` (24px)
  - Text: "Next"
  - Click: Navigates to Assessment Status page

### 2. Main Content Area
**Background**: #f5f7fa  
**Padding**: 16px  
**Display**: Grid or Flex column  
**Gap**: 16px

---

## Performance of Success Goal Section

### Section Card
**Background**: #FFFFFF  
**Border-radius**: 12px  
**Box-shadow**: `0 2px 8px rgba(0, 0, 0, 0.08)`  
**Padding**: 20px

### Section Header
**Display**: Flex, justify-content: space-between  
**Padding-bottom**: 12px  
**Border-bottom**: 2px solid #e5e7eb

**Title**: "Performance of Success Goal"  
- Font-size: 18px
- Font-weight: 700
- Color: #1e293b

**Actions** (gap: 8px):
- **Export Button**: Icon `file_download`, tooltip "Export to Excel"
- **Refresh Button**: Icon `refresh`, tooltip "Refresh Data"

### Performance Table

**Table Structure**: for rounded corners. Gap between elements: 12px):

1. **Back Button**:
   - Icon: `arrow_back` (20px)
   - Background: rgba(255, 255, 255, 0.2)
   - Color: #FFFFFF
   - Padding: 8px 16px
   - Border-radius: 20px
   - Hover: Background rgba(255, 255, 255, 0.3)

2. **Feedback Button**:
   - Icon: `feedback` (20px)
   - Text: "Feedback"
   - Same styling as Back button

3. **Voice of Customer Button**:
   - Icon: `record_voice_over` (20px)
   - Text: "Voice of Customer"
   - Same styling as Back button

4. **Filter Button**:
   - Icon: `filter_list` (20px)
   - Text: "Filter"
   - Same styling as Back button
   - Click: Opens filter dialog

**Navigation Row** (Below header, padding: 8px 24px):
- **Previous Button** (left):
  - Icon: `chevron_left` (24px)
  - Text: "Previous"
  - Disabled: When on first page
  
- **Page Indicator** (center):
  - Text: "Customer Overview (1 of 3)"
  - Font-size: 14px
  - Color: #FFFFFF
  
- **Next Button** (right):
  - Icon: `chevron_right` (24px)
  - Text: "Next"
  - Click: Navigates to Assessment Status page

### 2. Main Content Area
**Background**: #f5f7fa  
**Padding**: 16px  
**Display**: Grid or Flex column  
**Gap**: 16px

---

## Performance of Success Goal Section

### Section Card
**Background**: #FFFFFF  
**Border-radius**: 12px  
**Box-shadow**: `0 2px 8px rgba(0, 0, 0, 0.08)`  
**Padding**: 20px

### Section Header
**Display**: Flex, justify-content: space-between  
**Padding-bottom**: 12px  
**Border-bottom**: 2px solid #e5e7eb

**Title**: "Performance of Success Goal"  
- Font-size: 18px
- Font-weight: 700
- Color: #1e293b

**Actions** (gap: 8px):
- **Export Button**: Icon `file_download`, tooltip "Export to Excel"
- **Refresh Button**: Icon `refresh`, tooltip "Refresh Data"

### Performance Table

**Table Structure**:. Hover effects provide visual feedback on interactive elements.html
<table mat-table [dataSource]="successGoalData" class="performance-table">


**Column Definitions** (varies by customer type):

**Standard Columns** (8 columns):
| Column | Width | Type | Description |
|--------|-------|------|-------------|
| **Project** | 25% | text | Project name with link |
| **Achievement** | 12% | badge | Percentage with color coding |
| **Customer Contact** | 18% | text | Contact name and role |
| **Trend** | 10% | chart | Sparkline trend chart |
| **Transition** | 10% | button | Transition planning link |
| **SLA Reviews** | 10% | button | SLA review link |
| **CAPA** | 8% | button | Corrective action plan link |
| **Actions** | 7% | icons | View/Edit icons |

**CBH/Frontier Customer Additional Columns**:
- **Service Agreement**: Agreement name
- **Service Delivery Manager**: Manager name
- **Delivery Location**: Location name

**Table Styling**:
**Styling Specifications:**

Background color: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%). Text color: #FFFFFF. Font size: 12px. Font weight: 600. Padding: 12px 8px. Subtle box shadow provides depth and elevation. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

**Achievement Badge**:
**Styling Specifications:**

Background color: linear-gradient(135deg, #10b981, #059669). Text color: #FFFFFF. Font size: 13px. Font weight: 600. Padding: 6px 14px. Border radius: 16px for rounded corners.

**Trend Sparkline** (Google Charts):
- **Type**: Line chart (mini)
- **Width**: 80px
- **Height**: 30px
- **Colors**: Green (upward trend), Red (downward trend)
- **No axes or labels**: Pure visualization

---

## Widgets Grid Section

### Grid Layout
**Display**: Grid  
**Grid-template-columns**: repeat(auto-fit, minmax(280px, 1fr))  
**Gap**: 16px  
**Margin-top**: 16px

### Widget Card Base Styling
**Styling Specifications:**

Background color: #FFFFFF. Padding: 20px. Border radius: 12px for rounded corners. Subtle box shadow provides depth and elevation. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

---

## Widget 1: Events & Tasks

### Widget Structure
**2-column layout within card**:
- **Left**: Column chart (60% width)
- **Right**: Summary table (40% width)

### Widget Header
**Text**: "Events & Tasks"  
- Font-size: 16px
- Font-weight: 600
- Color: #1e293b
- Margin-bottom: 12px

### Column Chart (Google Charts)
**Chart Type**: ColumnChart  
**Config**:
**Implementation Details:**

This section implements the described functionality using javascript. The implementation spans approximately 9 lines and follows the component structure outlined above.

**Data Structure**:
- **Categories**: Due Events, Overdue Events, Due Tasks, Overdue Tasks
- **Values**: Count for each category
- **Colors**: Blue (#3b82f6) for Due, Red (#ef4444) for Overdue

### Summary Table
**Table Styling**:
- Border: 1px solid #e5e7eb
- Border-radius: 6px
- Font-size: 12px

**Rows**:
1. Total Events: Count
2. Total Tasks: Count
3. **View Details Link**: 
   - Icon: `open_in_new`
   - Color: #3b82f6
   - Click: Opens events/tasks page

---

## Widget 2-6: Semicircular Gauge Widgets

### Common Gauge Layout
Each widget contains:
- **Header**: Widget title with icon
- **Gauge Chart**: Google Charts gauge (semicircular)
- **Stats Grid**: 2×2 or 2×3 grid with counts by status/priority
- **Footer Link**: "View Details" with icon

### Gauge Chart Configuration
**Implementation Details:**

This section implements the described functionality using javascript. The implementation spans approximately 10 lines and follows the component structure outlined above.

### Widget 2: Action Items
**Header Icon**: `assignment` (Purple gradient: #a855f7 to #7c3aed)  
**Gauge Color**: Purple gradient  
**Stats Grid** (2×2):
- Critical: Count (Red #ef4444)
- High: Count (Orange #f59e0b)
- Medium: Count (Yellow #eab308)
- Low: Count (Green #10b981)

**Gauge Value**: Percentage of completed action items

### Widget 3: Appreciations
**Header Icon**: `star` (Gold gradient: #f59e0b to #d97706)  
**Gauge Color**: Gold gradient  
**Stats Grid** (2×2):
- This Month: Count
- Last Month: Count
- This Quarter: Count
- YTD: Count

**Gauge Value**: Appreciation count for current month

### Widget 4: Risks
**Header Icon**: `warning` (Red gradient: #ef4444 to #dc2626)  
**Gauge Color**: Red gradient  
**Stats Grid** (2×3):
- Critical: Count (Red #dc2626)
- High: Count (Orange #ea580c)
- Moderate: Count (Yellow #ca8a04)
- Low: Count (Green #16a34a)
- Open: Count (Blue #3b82f6)
- Closed: Count (Gray #64748b)

**Gauge Value**: Percentage of open risks

### Widget 5: Issues
**Header Icon**: `bug_report` (Orange gradient: #f97316 to #ea580c)  
**Gauge Color**: Orange gradient  
**Stats Grid** (2×3):
- Critical: Count (Red #dc2626)
- High: Count (Orange #ea580c)
- Medium: Count (Yellow #ca8a04)
- Low: Count (Green #16a34a)
- Open: Count (Blue #3b82f6)
- Resolved: Count (Gray #64748b)

**Gauge Value**: Percentage of resolved issues

### Widget 6: Contract Status
**Header Icon**: `description` (Blue gradient: #3b82f6 to #1e40af)  
**Gauge Color**: Blue gradient  
**Stats Grid** (2×2):
- Projects to Start: Count (Green #10b981)
- Projects to End: Count (Red #ef4444)
- Active Contracts: Count (Blue #3b82f6)
- Pending Renewals: Count (Orange #f59e0b)

**Gauge Value**: Percentage of active contracts

### Stats Grid Styling
**Styling Specifications:**

Background color: #f8fafc. Text color: #64748b. Font size: 11px. Font weight: 500. Padding: 8px 12px. Border radius: 4px for rounded corners. CSS Grid layout organizes content in a responsive grid structure. Gap between elements: 8px.

---

## Key Highlights Section

### Section Card
**Background**: #FFFFFF  
**Border-radius**: 12px  
**Box-shadow**: `0 2px 8px rgba(0, 0, 0, 0.08)`  
**Padding**: 20px  
**Margin-top**: 16px

### Section Header
**Text**: "Key Highlights"  
- Font-size: 18px
- Font-weight: 700
- Color: #1e293b

**Filter Buttons** (right-aligned, gap: 8px):
- **This Week**: Chip button, active state highlighted
- **This Month**: Chip button

### Highlights Carousel
**Display**: Flex, gap 12px, overflow-x auto  
**Scroll**: Smooth horizontal scroll with hidden scrollbar

**Highlight Card**:
**Styling Specifications:**

Background color: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%). Text color: #64748b. Font size: 11px. Font weight: 600. Padding: 16px. Border radius: 8px for rounded corners. Subtle box shadow provides depth and elevation.

### Empty State
**Display**: When no highlights exist  
**Content**:
- Icon: `lightbulb` (64px, #cbd5e1)
- Text: "No highlights for this period"
- Subtext: "Add highlights to track key achievements"

---

## Service Improvement Plan Section

### Section Card
**Background**: #FFFFFF  
**Border-radius**: 12px  
**Box-shadow**: `0 2px 8px rgba(0, 0, 0, 0.08)`  
**Padding**: 20px  
**Margin-top**: 16px

### Section Header
**Text**: "Service Improvement Plan (CAPA Stages)"  
- Font-size: 18px
- Font-weight: 700
- Color: #1e293b

### CAPA Table

**Column Definitions** (5 columns):
| Column | Width | Type | Description |
|--------|-------|------|-------------|
| **Project** | 30% | text | Project name |
| **Submission** | 17.5% | badge | Status (Pending/Approved/Rejected) |
| **Review** | 17.5% | badge | Review stage status |
| **Implementation** | 17.5% | badge | Implementation status |
| **Verification** | 17.5% | badge | Verification status |

**Table Styling**:
**Styling Specifications:**

Background color: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%). Text color: #FFFFFF. Font size: 12px. Font weight: 600. Padding: 10px 12px. Border radius: 8px for rounded corners.

**Stage Status Badges**:
**Styling Specifications:**

Background color: #fef3c7. Text color: #92400e. Font size: 11px. Font weight: 600. Padding: 4px 10px. Border radius: 12px for rounded corners.

### Empty State
**Display**: When no CAPA data exists  
**Content**:
- Icon: `check_circle` (64px, #cbd5e1)
- Text: "No service improvement plans in progress"
- Subtext: "All projects are performing well"

---

## Color Palette

### Primary Colors
**Styling Specifications:**

### Status Colors
**Styling Specifications:**

### Widget Accent Colors
**Styling Specifications:**

### Background Colors
**Styling Specifications:**

### Text Colors
**Styling Specifications:**

---

## Typography

### Font Families
**Styling Specifications:**

### Font Specifications
| Element | Size | Weight | Color | Special |
|---------|------|--------|-------|---------|
| **Customer Name** | 24px | 700 | Gradient | Shimmer animation |
| **Section Headers** | 18px | 700 | #1e293b | - |
| **Widget Headers** | 16px | 600 | #1e293b | - |
| **Table Headers** | 12px | 600 | #FFFFFF | Uppercase |
| **Table Cells** | 13px | 400 | #1e293b | - |
| **Stat Labels** | 11px | 500 | #64748b | - |
| **Stat Counts** | 18px | 700 | #1e293b | - |
| **Badge Text** | 11-13px | 600 | varies | Uppercase (some) |
| **Button Text** | 14px | 500 | varies | - |

---

## Spacing System

### Padding
**Styling Specifications:**

Padding: 16px 24px.

### Margins
**Styling Specifications:**

### Gaps
**Styling Specifications:**

Gap between elements: 16px.

---

## Interactions & Behaviors

### Hover States

**Card Hover**:
**Styling Specifications:**

Subtle box shadow provides depth and elevation. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

**Table Row Hover**:
**Styling Specifications:**

Background color: rgba(59, 130, 246, 0.05). Subtle box shadow provides depth and elevation. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

**Button Hover**:
**Styling Specifications:**

Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

### Click Behaviors

1. **View Details Links**: Navigate to respective detail pages
2. **Export Button**: Triggers Excel export
3. **Refresh Button**: Reloads dashboard data
4. **Previous/Next Buttons**: Navigate between dashboard pages
5. **Filter Button**: Opens filter dialog
6. **Project Names**: Navigate to project detail page
7. **Achievement Badges**: Show tooltip with breakdown
8. **Transition/SLA/CAPA Buttons**: Open respective dialogs

### Animations

**Customer Name Shimmer**:
**Styling Specifications:**

**Chart Loading**:
- Fade-in animation: 500ms
- Startup animation: Google Charts built-in

**Card Entry**:
**Styling Specifications:**

---

## Responsive Design

### Breakpoints
- **Desktop**: >1024px
- **Tablet**: 768px - 1024px
- **Mobile**: <768px

### Mobile Adjustments
**Styling Specifications:**

Font size: 11px. Font weight: 600. Padding: 8px 12px. Border radius: 8px for rounded corners. Responsive breakpoints ensure proper display across device sizes.

---

## Accessibility (WCAG AA Compliance)

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to activate buttons
- Arrow keys for carousel navigation

### Focus Indicators
**Styling Specifications:**

### ARIA Attributes
- `aria-label` on icon-only buttons
- `role="region"` on sections with `aria-labelledby`
- `aria-live="polite"` on dynamic content updates
- Proper table semantics with `<th scope="col">`

### Color Contrast
- All text meets 4.5:1 ratio
- Status badges use both color and text
- Icons supplement color coding

---

## Loading & Empty States

### Loading State
**Skeleton Placeholders**:
- Gray shimmer effect on card positions
- Animated pulse on data areas
- Progress spinner for charts

### Empty States
- **No Data**: Icon + message + helper text
- **No Highlights**: Lightbulb icon + instructional text
- **No CAPA**: Check circle icon + positive message

---

## Implementation Notes

### Angular Material Modules Required
**TypeScript Implementation:**

### Google Charts Integration
**TypeScript Implementation:**

### Service Methods Expected
**TypeScript Implementation:**

RxJS observables manage asynchronous data streams.

---

## Summary

This Operational Dashboard - Customer Overview provides a comprehensive, executive-level view of customer health with:

- **Performance tracking** via success goal table with achievement badges
- **Visual analytics** through Google Charts (gauges, columns, sparklines)
- **6 key metric widgets** (action items, appreciations, risks, issues, contract status, events/tasks)
- **Key highlights** carousel for recent achievements
- **CAPA tracking** for service improvement initiatives
- **Multi-page navigation** for comprehensive customer overview
- **Responsive design** with mobile-optimized layouts
- **Modern card-based UI** with gradients and smooth transitions

The design emphasizes **at-a-glance insights** while providing drill-down capabilities for detailed analysis.

**Word Count**: ~5,800 words

---

**Usage**: Feed this entire prompt to any AI tool (ChatGPT, Claude, GitHub Copilot) to recreate the identical Operational Dashboard - Customer Overview page without needing the original codebase.
