# Operational Dashboard - KPI Performance & Health Index (Page 2) - Complete UI Recreation Prompt

## Page Overview
Create a comprehensive **Operational Dashboard for KPI Performance & Health Index** providing detailed analytics and performance metrics in an enterprise Customer Success Management platform. This is an analytical dashboard featuring an overall health index pie chart, KPI performance tables with achievement tracking, customer success goal monitoring (for Premier customers), semicircular gauge widgets for operational metrics, and auto-refresh functionality. The design uses modern card-based layout with prominent health visualization and color-coded performance indicators.

---

## Design System & Framework

### Technology Stack
- **Framework**: Angular 19+ (standalone components)  
- **UI Library**: Angular Material v19+ (Material Design 3)  
- **Icons**: Material Icons  
- **Styling**: SCSS with design tokens and CSS variables  
- **Charts**: Google Charts (PieChart, Gauge, ColumnChart)

### Design Philosophy
**Analytics-Focused Modern Dashboard** with prominent health index visualization, data-driven KPI tables, and status-driven color coding. Emphasis on performance metrics through charts and tables, providing detailed insights into customer success goal achievement, quality, performance, value, and compliance metrics. Clean, analytical layout optimized for monitoring and decision-making.

---

## Layout Structure

### 1. Page Header
**Background**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`  
**Padding**: 16px 24px  
**Border-radius**: 0 0 16px 16px  
**Box-shadow**: `0 4px 12px rgba(102, 126, 234, 0.2)`

**Header Content** (Flex, justify-content: space-between):

**Left Side**:
- **Page Title**: "KPI Performance & Health Index"
  - Font-size: 22px
  - Font-weight: 700
  - Color: #FFFFFF

**Right Side** (gap: 12px):

1. **Auto-Refresh Timer Display**:
   **Styling Specifications:**

Background color: rgba(255, 255, 255, 0.2). Text color: #FFFFFF. Font size: 13px. Font weight: 700
  - Color: #1e293b
- **Help Icon**: 
  - Icon: `help_outline`
  - Color: #64748b
  - Tooltip: Shows health index calculation methodology

**Pie Chart** (Google Charts):. Padding: 8px 16px. Border radius: 20px for rounded corners.javascript
{
  width: '100%',
  height: 320,
  pieHole: 0.4, // Donut chart
  colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'],
  legend: { 
    position: 'bottom',
    textStyle: { fontSize: 12 }
  },
  chartArea: { width: '90%', height: '75%' },
  pieSliceText: 'percentage',
  pieSliceTextStyle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  animation: {
    startup: true,
    duration: 1000,
    easing: 'out'
  }
}
**Styling Specifications:**

Text color: #1e293b. Font size: 36px. Font weight: 700.

### Right Column: Category Breakdown

**Breakdown Card**:
- **Background**: #FFFFFF
- **Border-radius**: 12px
- **Box-shadow**: `0 2px 8px rgba(0, 0, 0, 0.08)`
- **Padding**: 20px

**Card Header**:
- **Title**: "Category Details"
  - Font-size: 16px
  - Font-weight: 600
  - Color: #1e293b

**Category Items** (4 items):
**Styling Specifications:**

Background color: linear-gradient(90deg, rgba($category-color, 0.05) 0%, transparent 100%). Text color: #1e293b. Font size: 14px. Font weight: 600. Padding: 16px. Border radius: 6px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 8px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

**Category Details**:

1. **Quality** (Green #10b981):
   - Icon: `verified`
   - Score: 92%
   - KPIs: 12 tracked
   - Action: "View Quality KPIs"

2. **Performance** (Blue #3b82f6):
   - Icon: `speed`
   - Score: 88%
   - KPIs: 15 tracked
   - Action: "View Performance KPIs"

3. **Value** (Orange #f59e0b):
   - Icon: `trending_up`
   - Score: 85%
   - KPIs: 8 tracked
   - Action: "View Value KPIs"

4. **Compliance** (Purple #8b5cf6):
   - Icon: `gavel`
   - Score: 95%
   - KPIs: 6 tracked
   - Action: "View Compliance KPIs"

**Click Behavior**: Opens filter dialog with selected category pre-filtered

---

## Performance of KPI Section

### Section Card
**Background**: #FFFFFF  
**Border-radius**: 12px  
**Box-shadow**: `0 2px 8px rgba(0, 0, 0, 0.08)`  
**Padding**: 20px  
**Margin-top**: 16px

### Section Header
**Display**: Flex, justify-content: space-between  
**Padding-bottom**: 12px  
**Border-bottom**: 2px solid #e5e7eb

**Title**: "Performance of KPI"  
- Font-size: 18px
- Font-weight: 700
- Color: #1e293b

**Actions** (gap: 8px):
- **Export Button**: Icon `file_download`, tooltip "Export to Excel"
- **Refresh Button**: Icon `refresh`, tooltip "Refresh Data"
- **Settings Button**: Icon `settings`, tooltip "Configure KPIs"

### KPI Performance Table

**Table Structure**:
**Component Structure:**

Sorting functionality is enabled on table columns.

**Column Definitions** (varies by customer type):

**Standard Columns** (7 columns):
| Column | Width | Type | Description |
|--------|-------|------|-------------|
| **Project/Product** | 25% | text | Project or product name |
| **Customer Name** | 18% | text | Customer name (for multi-customer view) |
| **Period** | 12% | badge | Month/Quarter/Week |
| **Achievement** | 12% | badge | Percentage with color coding |
| **Trend** | 10% | icon/chart | Up/down arrows or sparkline |
| **Transition** | 10% | button | Transition planning link |
| **Actions** | 13% | icons | View/Edit/CAPA icons |

**Frontier Customer Additional Columns**:
- **Service Mode**: Service delivery mode
- **Delivery Manager**: Manager name
- **Location**: Delivery location

**Table Styling**:
**Styling Specifications:**

Background color: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%). Text color: #FFFFFF. Font size: 13px. Font weight: 600. Padding: 12px 8px. Subtle box shadow provides depth and elevation. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

**Achievement Badge**:
**Styling Specifications:**

Background color: linear-gradient(135deg, #10b981, #059669). Text color: #FFFFFF. Font size: 13px. Font weight: 600. Padding: 6px 14px. Border radius: 16px for rounded corners. Gap between elements: 6px.

**Trend Indicators**:
**Styling Specifications:**

Text color: #10b981. Font size: 20px. Font weight: 600. Gap between elements: 4px.

**Period Badge**:
**Styling Specifications:**

Background color: #f1f5f9. Text color: #475569. Font size: 11px. Font weight: 500. Padding: 4px 10px. Border radius: 12px for rounded corners.

---

## Customer Success Goal Section (Premier Customers)

### Section Card
**Display**: Only for Premier customers  
**Background**: #FFFFFF  
**Border-radius**: 12px  
**Box-shadow**: `0 2px 8px rgba(0, 0, 0, 0.08)`  
**Padding**: 20px  
**Margin-top**: 16px

### Section Header
**Title**: "Customer Success Goals"  
- Font-size: 18px
- Font-weight: 700
- Color: #1e293b
- Icon: `flag` (margin-right: 8px, color: #8b5cf6)

### Goals Table

**Column Definitions** (5 columns):
| Column | Width | Type | Description |
|--------|-------|------|-------------|
| **Goal Name** | 35% | text | Goal description |
| **Period** | 15% | badge | Date range |
| **Target** | 15% | text | Target percentage |
| **Achievement** | 20% | progress bar | Visual progress with percentage |
| **Details** | 15% | button | View details link |

**Table Styling**: Same as KPI table but with gradient header in different color:
**Styling Specifications:**

Background color: linear-gradient(135deg, #10b981 0%, #059669 100%).

**Achievement Progress Bar**:
**Styling Specifications:**

Background color: #e5e7eb. Text color: #1e293b. Font size: 13px. Font weight: 600. Border radius: 4px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px. Smooth transitions enhance user experience with animated state changes.

---

## Widgets Row Section

### Widget Grid
**Display**: Grid  
**Grid-template-columns**: repeat(auto-fit, minmax(240px, 1fr))  
**Gap**: 16px  
**Margin-top**: 16px

### Widget Cards (6 widgets)

**Base Widget Styling**: Same as Customer Overview page  
**Widgets Included**:
1. **Events & Tasks**: Column chart + summary
2. **Action Items**: Semicircular gauge + priority stats
3. **Issues**: Semicircular gauge + severity stats
4. **Risks**: Semicircular gauge + level stats
5. **Appreciations**: Semicircular gauge + period stats

**Note**: Contract Status, Key Highlights, and Service Improvement Plan are NOT on this page

---

## Filter Dialog

### Dialog Configuration
**Width**: 600px  
**Max-height**: 80vh  
**Border-radius**: 12px

### Dialog Content

**Header**:
- **Title**: "Filter KPI Performance"
  - Font-size: 18px
  - Font-weight: 700
- **Close Button**: Icon `close`

**Filter Sections**:

1. **Category Filter** (chips):
   **Component Structure:**scss
$primary-purple: #667eea. Font size: 16px
  - Font-weight: 600
  - Color: #1e293b

**Category Items** (4 items):
**Styling Specifications:**

Background color: linear-gradient(90deg, rgba($category-color, 0.05) 0%, transparent 100%). Text color: #1e293b. Font size: 14px. Font weight: 600. Padding: 16px. Border radius: 6px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 8px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

**Category Details**:

1. **Quality** (Green #10b981):
   - Icon: `verified`
   - Score: 92%
   - KPIs: 12 tracked
   - Action: "View Quality KPIs"

2. **Performance** (Blue #3b82f6):
   - Icon: `speed`
   - Score: 88%
   - KPIs: 15 tracked
   - Action: "View Performance KPIs"

3. **Value** (Orange #f59e0b):
   - Icon: `trending_up`
   - Score: 85%
   - KPIs: 8 tracked
   - Action: "View Value KPIs"

4. **Compliance** (Purple #8b5cf6):
   - Icon: `gavel`
   - Score: 95%
   - KPIs: 6 tracked
   - Action: "View Compliance KPIs"

**Click Behavior**: Opens filter dialog with selected category pre-filtered

---

## Performance of KPI Section

### Section Card
**Background**: #FFFFFF  
**Border-radius**: 12px  
**Box-shadow**: `0 2px 8px rgba(0, 0, 0, 0.08)`  
**Padding**: 20px  
**Margin-top**: 16px

### Section Header
**Display**: Flex, justify-content: space-between  
**Padding-bottom**: 12px  
**Border-bottom**: 2px solid #e5e7eb

**Title**: "Performance of KPI"  
- Font-size: 18px
- Font-weight: 700
- Color: #1e293b

**Actions** (gap: 8px):
- **Export Button**: Icon `file_download`, tooltip "Export to Excel"
- **Refresh Button**: Icon `refresh`, tooltip "Refresh Data"
- **Settings Button**: Icon `settings`, tooltip "Configure KPIs"

### KPI Performance Table

**Table Structure**:
**Component Structure:**

Sorting functionality is enabled on table columns.

**Column Definitions** (varies by customer type):

**Standard Columns** (7 columns):
| Column | Width | Type | Description |
|--------|-------|------|-------------|
| **Project/Product** | 25% | text | Project or product name |
| **Customer Name** | 18% | text | Customer name (for multi-customer view) |
| **Period** | 12% | badge | Month/Quarter/Week |
| **Achievement** | 12% | badge | Percentage with color coding |
| **Trend** | 10% | icon/chart | Up/down arrows or sparkline |
| **Transition** | 10% | button | Transition planning link |
| **Actions** | 13% | icons | View/Edit/CAPA icons |

**Frontier Customer Additional Columns**:
- **Service Mode**: Service delivery mode
- **Delivery Manager**: Manager name
- **Location**: Delivery location

**Table Styling**:
**Styling Specifications:**

Background color: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%). Text color: #FFFFFF. Font size: 13px. Font weight: 600. Padding: 12px 8px. Subtle box shadow provides depth and elevation. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

**Achievement Badge**:
**Styling Specifications:**

Background color: linear-gradient(135deg, #10b981, #059669). Text color: #FFFFFF. Font size: 13px. Font weight: 600. Padding: 6px 14px. Border radius: 16px for rounded corners. Gap between elements: 6px.

**Trend Indicators**:
**Styling Specifications:**

Text color: #10b981. Font size: 20px. Font weight: 600. Gap between elements: 4px.

**Period Badge**:
**Styling Specifications:**

Background color: #f1f5f9. Text color: #475569. Font size: 11px. Font weight: 500. Padding: 4px 10px. Border radius: 12px for rounded corners.

---

## Customer Success Goal Section (Premier Customers)

### Section Card
**Display**: Only for Premier customers  
**Background**: #FFFFFF  
**Border-radius**: 12px  
**Box-shadow**: `0 2px 8px rgba(0, 0, 0, 0.08)`  
**Padding**: 20px  
**Margin-top**: 16px

### Section Header
**Title**: "Customer Success Goals"  
- Font-size: 18px
- Font-weight: 700
- Color: #1e293b
- Icon: `flag` (margin-right: 8px, color: #8b5cf6)

### Goals Table

**Column Definitions** (5 columns):
| Column | Width | Type | Description |
|--------|-------|------|-------------|
| **Goal Name** | 35% | text | Goal description |
| **Period** | 15% | badge | Date range |
| **Target** | 15% | text | Target percentage |
| **Achievement** | 20% | progress bar | Visual progress with percentage |
| **Details** | 15% | button | View details link |

**Table Styling**: Same as KPI table but with gradient header in different color:
**Styling Specifications:**

Background color: linear-gradient(135deg, #10b981 0%, #059669 100%).

**Achievement Progress Bar**:
**Styling Specifications:**

Background color: #e5e7eb. Text color: #1e293b. Font size: 13px. Font weight: 600. Border radius: 4px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px. Smooth transitions enhance user experience with animated state changes.

---

## Widgets Row Section

### Widget Grid
**Display**: Grid  
**Grid-template-columns**: repeat(auto-fit, minmax(240px, 1fr))  
**Gap**: 16px  
**Margin-top**: 16px

### Widget Cards (6 widgets)

**Base Widget Styling**: Same as Customer Overview page  
**Widgets Included**:
1. **Events & Tasks**: Column chart + summary
2. **Action Items**: Semicircular gauge + priority stats
3. **Issues**: Semicircular gauge + severity stats
4. **Risks**: Semicircular gauge + level stats
5. **Appreciations**: Semicircular gauge + period stats

**Note**: Contract Status, Key Highlights, and Service Improvement Plan are NOT on this page

---

## Filter Dialog

### Dialog Configuration
**Width**: 600px  
**Max-height**: 80vh  
**Border-radius**: 12px

### Dialog Content

**Header**:
- **Title**: "Filter KPI Performance"
  - Font-size: 18px
  - Font-weight: 700
- **Close Button**: Icon `close`

**Filter Sections**:

1. **Category Filter** (chips):
   **Component Structure:**scss
$primary-purple: #667eea. Font weight: 600
  - Color: #1e293b

**Category Items** (4 items):
**Styling Specifications:**

Background color: linear-gradient(90deg, rgba($category-color, 0.05) 0%, transparent 100%). Text color: #1e293b. Font size: 14px. Font weight: 600. Padding: 16px. Border radius: 6px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 8px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

**Category Details**:

1. **Quality** (Green #10b981):
   - Icon: `verified`
   - Score: 92%
   - KPIs: 12 tracked
   - Action: "View Quality KPIs"

2. **Performance** (Blue #3b82f6):
   - Icon: `speed`
   - Score: 88%
   - KPIs: 15 tracked
   - Action: "View Performance KPIs"

3. **Value** (Orange #f59e0b):
   - Icon: `trending_up`
   - Score: 85%
   - KPIs: 8 tracked
   - Action: "View Value KPIs"

4. **Compliance** (Purple #8b5cf6):
   - Icon: `gavel`
   - Score: 95%
   - KPIs: 6 tracked
   - Action: "View Compliance KPIs"

**Click Behavior**: Opens filter dialog with selected category pre-filtered

---

## Performance of KPI Section

### Section Card
**Background**: #FFFFFF  
**Border-radius**: 12px  
**Box-shadow**: `0 2px 8px rgba(0, 0, 0, 0.08)`  
**Padding**: 20px  
**Margin-top**: 16px

### Section Header
**Display**: Flex, justify-content: space-between  
**Padding-bottom**: 12px  
**Border-bottom**: 2px solid #e5e7eb

**Title**: "Performance of KPI"  
- Font-size: 18px
- Font-weight: 700
- Color: #1e293b

**Actions** (gap: 8px):
- **Export Button**: Icon `file_download`, tooltip "Export to Excel"
- **Refresh Button**: Icon `refresh`, tooltip "Refresh Data"
- **Settings Button**: Icon `settings`, tooltip "Configure KPIs"

### KPI Performance Table

**Table Structure**:
**Component Structure:**

Sorting functionality is enabled on table columns.

**Column Definitions** (varies by customer type):

**Standard Columns** (7 columns):
| Column | Width | Type | Description |
|--------|-------|------|-------------|
| **Project/Product** | 25% | text | Project or product name |
| **Customer Name** | 18% | text | Customer name (for multi-customer view) |
| **Period** | 12% | badge | Month/Quarter/Week |
| **Achievement** | 12% | badge | Percentage with color coding |
| **Trend** | 10% | icon/chart | Up/down arrows or sparkline |
| **Transition** | 10% | button | Transition planning link |
| **Actions** | 13% | icons | View/Edit/CAPA icons |

**Frontier Customer Additional Columns**:
- **Service Mode**: Service delivery mode
- **Delivery Manager**: Manager name
- **Location**: Delivery location

**Table Styling**:
**Styling Specifications:**

Background color: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%). Text color: #FFFFFF. Font size: 13px. Font weight: 600. Padding: 12px 8px. Subtle box shadow provides depth and elevation. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

**Achievement Badge**:
**Styling Specifications:**

Background color: linear-gradient(135deg, #10b981, #059669). Text color: #FFFFFF. Font size: 13px. Font weight: 600. Padding: 6px 14px. Border radius: 16px for rounded corners. Gap between elements: 6px.

**Trend Indicators**:
**Styling Specifications:**

Text color: #10b981. Font size: 20px. Font weight: 600. Gap between elements: 4px.

**Period Badge**:
**Styling Specifications:**

Background color: #f1f5f9. Text color: #475569. Font size: 11px. Font weight: 500. Padding: 4px 10px. Border radius: 12px for rounded corners.

---

## Customer Success Goal Section (Premier Customers)

### Section Card
**Display**: Only for Premier customers  
**Background**: #FFFFFF  
**Border-radius**: 12px  
**Box-shadow**: `0 2px 8px rgba(0, 0, 0, 0.08)`  
**Padding**: 20px  
**Margin-top**: 16px

### Section Header
**Title**: "Customer Success Goals"  
- Font-size: 18px
- Font-weight: 700
- Color: #1e293b
- Icon: `flag` (margin-right: 8px, color: #8b5cf6)

### Goals Table

**Column Definitions** (5 columns):
| Column | Width | Type | Description |
|--------|-------|------|-------------|
| **Goal Name** | 35% | text | Goal description |
| **Period** | 15% | badge | Date range |
| **Target** | 15% | text | Target percentage |
| **Achievement** | 20% | progress bar | Visual progress with percentage |
| **Details** | 15% | button | View details link |

**Table Styling**: Same as KPI table but with gradient header in different color:
**Styling Specifications:**

Background color: linear-gradient(135deg, #10b981 0%, #059669 100%).

**Achievement Progress Bar**:
**Styling Specifications:**

Background color: #e5e7eb. Text color: #1e293b. Font size: 13px. Font weight: 600. Border radius: 4px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px. Smooth transitions enhance user experience with animated state changes.

---

## Widgets Row Section

### Widget Grid
**Display**: Grid  
**Grid-template-columns**: repeat(auto-fit, minmax(240px, 1fr))  
**Gap**: 16px  
**Margin-top**: 16px

### Widget Cards (6 widgets)

**Base Widget Styling**: Same as Customer Overview page  
**Widgets Included**:
1. **Events & Tasks**: Column chart + summary
2. **Action Items**: Semicircular gauge + priority stats
3. **Issues**: Semicircular gauge + severity stats
4. **Risks**: Semicircular gauge + level stats
5. **Appreciations**: Semicircular gauge + period stats

**Note**: Contract Status, Key Highlights, and Service Improvement Plan are NOT on this page

---

## Filter Dialog

### Dialog Configuration
**Width**: 600px  
**Max-height**: 80vh  
**Border-radius**: 12px

### Dialog Content

**Header**:
- **Title**: "Filter KPI Performance"
  - Font-size: 18px
  - Font-weight: 700
- **Close Button**: Icon `close`

**Filter Sections**:

1. **Category Filter** (chips):
   **Component Structure:**scss
$primary-purple: #667eea. Padding: 16px. Border radius: 6px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 8px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

**Category Details**:

1. **Quality** (Green #10b981):
   - Icon: `verified`
   - Score: 92%
   - KPIs: 12 tracked
   - Action: "View Quality KPIs"

2. **Performance** (Blue #3b82f6):
   - Icon: `speed`
   - Score: 88%
   - KPIs: 15 tracked
   - Action: "View Performance KPIs"

3. **Value** (Orange #f59e0b):
   - Icon: `trending_up`
   - Score: 85%
   - KPIs: 8 tracked
   - Action: "View Value KPIs"

4. **Compliance** (Purple #8b5cf6):
   - Icon: `gavel`
   - Score: 95%
   - KPIs: 6 tracked
   - Action: "View Compliance KPIs"

**Click Behavior**: Opens filter dialog with selected category pre-filtered

---

## Performance of KPI Section

### Section Card
**Background**: #FFFFFF  
**Border-radius**: 12px  
**Box-shadow**: `0 2px 8px rgba(0, 0, 0, 0.08)`  
**Padding**: 20px  
**Margin-top**: 16px

### Section Header
**Display**: Flex, justify-content: space-between  
**Padding-bottom**: 12px  
**Border-bottom**: 2px solid #e5e7eb

**Title**: "Performance of KPI"  
- Font-size: 18px
- Font-weight: 700
- Color: #1e293b

**Actions** (gap: 8px):
- **Export Button**: Icon `file_download`, tooltip "Export to Excel"
- **Refresh Button**: Icon `refresh`, tooltip "Refresh Data"
- **Settings Button**: Icon `settings`, tooltip "Configure KPIs"

### KPI Performance Table

**Table Structure**:
**Component Structure:**

Sorting functionality is enabled on table columns.

**Column Definitions** (varies by customer type):

**Standard Columns** (7 columns):
| Column | Width | Type | Description |
|--------|-------|------|-------------|
| **Project/Product** | 25% | text | Project or product name |
| **Customer Name** | 18% | text | Customer name (for multi-customer view) |
| **Period** | 12% | badge | Month/Quarter/Week |
| **Achievement** | 12% | badge | Percentage with color coding |
| **Trend** | 10% | icon/chart | Up/down arrows or sparkline |
| **Transition** | 10% | button | Transition planning link |
| **Actions** | 13% | icons | View/Edit/CAPA icons |

**Frontier Customer Additional Columns**:
- **Service Mode**: Service delivery mode
- **Delivery Manager**: Manager name
- **Location**: Delivery location

**Table Styling**:
**Styling Specifications:**

Background color: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%). Text color: #FFFFFF. Font size: 13px. Font weight: 600. Padding: 12px 8px. Subtle box shadow provides depth and elevation. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

**Achievement Badge**:
**Styling Specifications:**

Background color: linear-gradient(135deg, #10b981, #059669). Text color: #FFFFFF. Font size: 13px. Font weight: 600. Padding: 6px 14px. Border radius: 16px for rounded corners. Gap between elements: 6px.

**Trend Indicators**:
**Styling Specifications:**

Text color: #10b981. Font size: 20px. Font weight: 600. Gap between elements: 4px.

**Period Badge**:
**Styling Specifications:**

Background color: #f1f5f9. Text color: #475569. Font size: 11px. Font weight: 500. Padding: 4px 10px. Border radius: 12px for rounded corners.

---

## Customer Success Goal Section (Premier Customers)

### Section Card
**Display**: Only for Premier customers  
**Background**: #FFFFFF  
**Border-radius**: 12px  
**Box-shadow**: `0 2px 8px rgba(0, 0, 0, 0.08)`  
**Padding**: 20px  
**Margin-top**: 16px

### Section Header
**Title**: "Customer Success Goals"  
- Font-size: 18px
- Font-weight: 700
- Color: #1e293b
- Icon: `flag` (margin-right: 8px, color: #8b5cf6)

### Goals Table

**Column Definitions** (5 columns):
| Column | Width | Type | Description |
|--------|-------|------|-------------|
| **Goal Name** | 35% | text | Goal description |
| **Period** | 15% | badge | Date range |
| **Target** | 15% | text | Target percentage |
| **Achievement** | 20% | progress bar | Visual progress with percentage |
| **Details** | 15% | button | View details link |

**Table Styling**: Same as KPI table but with gradient header in different color:
**Styling Specifications:**

Background color: linear-gradient(135deg, #10b981 0%, #059669 100%).

**Achievement Progress Bar**:
**Styling Specifications:**

Background color: #e5e7eb. Text color: #1e293b. Font size: 13px. Font weight: 600. Border radius: 4px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px. Smooth transitions enhance user experience with animated state changes.

---

## Widgets Row Section

### Widget Grid
**Display**: Grid  
**Grid-template-columns**: repeat(auto-fit, minmax(240px, 1fr))  
**Gap**: 16px  
**Margin-top**: 16px

### Widget Cards (6 widgets)

**Base Widget Styling**: Same as Customer Overview page  
**Widgets Included**:
1. **Events & Tasks**: Column chart + summary
2. **Action Items**: Semicircular gauge + priority stats
3. **Issues**: Semicircular gauge + severity stats
4. **Risks**: Semicircular gauge + level stats
5. **Appreciations**: Semicircular gauge + period stats

**Note**: Contract Status, Key Highlights, and Service Improvement Plan are NOT on this page

---

## Filter Dialog

### Dialog Configuration
**Width**: 600px  
**Max-height**: 80vh  
**Border-radius**: 12px

### Dialog Content

**Header**:
- **Title**: "Filter KPI Performance"
  - Font-size: 18px
  - Font-weight: 700
- **Close Button**: Icon `close`

**Filter Sections**:

1. **Category Filter** (chips):
   **Component Structure:**scss
$primary-purple: #667eea. Gap between elements: 8px):
- **Export Button**: Icon `file_download`, tooltip "Export to Excel"
- **Refresh Button**: Icon `refresh`, tooltip "Refresh Data"
- **Settings Button**: Icon `settings`, tooltip "Configure KPIs"

### KPI Performance Table

**Table Structure**:
**Component Structure:**

Sorting functionality is enabled on table columns.

**Column Definitions** (varies by customer type):

**Standard Columns** (7 columns):
| Column | Width | Type | Description |
|--------|-------|------|-------------|
| **Project/Product** | 25% | text | Project or product name |
| **Customer Name** | 18% | text | Customer name (for multi-customer view) |
| **Period** | 12% | badge | Month/Quarter/Week |
| **Achievement** | 12% | badge | Percentage with color coding |
| **Trend** | 10% | icon/chart | Up/down arrows or sparkline |
| **Transition** | 10% | button | Transition planning link |
| **Actions** | 13% | icons | View/Edit/CAPA icons |

**Frontier Customer Additional Columns**:
- **Service Mode**: Service delivery mode
- **Delivery Manager**: Manager name
- **Location**: Delivery location

**Table Styling**:
**Styling Specifications:**

Background color: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%). Text color: #FFFFFF. Font size: 13px. Font weight: 600. Padding: 12px 8px. Subtle box shadow provides depth and elevation. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

**Achievement Badge**:
**Styling Specifications:**

Background color: linear-gradient(135deg, #10b981, #059669). Text color: #FFFFFF. Font size: 13px. Font weight: 600. Padding: 6px 14px. Border radius: 16px for rounded corners. Gap between elements: 6px.

**Trend Indicators**:
**Styling Specifications:**

Text color: #10b981. Font size: 20px. Font weight: 600. Gap between elements: 4px.

**Period Badge**:
**Styling Specifications:**

Background color: #f1f5f9. Text color: #475569. Font size: 11px. Font weight: 500. Padding: 4px 10px. Border radius: 12px for rounded corners.

---

## Customer Success Goal Section (Premier Customers)

### Section Card
**Display**: Only for Premier customers  
**Background**: #FFFFFF  
**Border-radius**: 12px  
**Box-shadow**: `0 2px 8px rgba(0, 0, 0, 0.08)`  
**Padding**: 20px  
**Margin-top**: 16px

### Section Header
**Title**: "Customer Success Goals"  
- Font-size: 18px
- Font-weight: 700
- Color: #1e293b
- Icon: `flag` (margin-right: 8px, color: #8b5cf6)

### Goals Table

**Column Definitions** (5 columns):
| Column | Width | Type | Description |
|--------|-------|------|-------------|
| **Goal Name** | 35% | text | Goal description |
| **Period** | 15% | badge | Date range |
| **Target** | 15% | text | Target percentage |
| **Achievement** | 20% | progress bar | Visual progress with percentage |
| **Details** | 15% | button | View details link |

**Table Styling**: Same as KPI table but with gradient header in different color:
**Styling Specifications:**

Background color: linear-gradient(135deg, #10b981 0%, #059669 100%).

**Achievement Progress Bar**:
**Styling Specifications:**

Background color: #e5e7eb. Text color: #1e293b. Font size: 13px. Font weight: 600. Border radius: 4px for rounded corners. Flexbox layout enables flexible positioning and alignment. Gap between elements: 12px. Smooth transitions enhance user experience with animated state changes.

---

## Widgets Row Section

### Widget Grid
**Display**: Grid  
**Grid-template-columns**: repeat(auto-fit, minmax(240px, 1fr))  
**Gap**: 16px  
**Margin-top**: 16px

### Widget Cards (6 widgets)

**Base Widget Styling**: Same as Customer Overview page  
**Widgets Included**:
1. **Events & Tasks**: Column chart + summary
2. **Action Items**: Semicircular gauge + priority stats
3. **Issues**: Semicircular gauge + severity stats
4. **Risks**: Semicircular gauge + level stats
5. **Appreciations**: Semicircular gauge + period stats

**Note**: Contract Status, Key Highlights, and Service Improvement Plan are NOT on this page

---

## Filter Dialog

### Dialog Configuration
**Width**: 600px  
**Max-height**: 80vh  
**Border-radius**: 12px

### Dialog Content

**Header**:
- **Title**: "Filter KPI Performance"
  - Font-size: 18px
  - Font-weight: 700
- **Close Button**: Icon `close`

**Filter Sections**:

1. **Category Filter** (chips):
   **Component Structure:**scss
$primary-purple: #667eea. Hover effects provide visual feedback on interactive elements.

### Category Colors
**Styling Specifications:**

### Status Colors
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
| Element | Size | Weight | Color |
|---------|------|--------|-------|
| **Page Title** | 22px | 700 | #FFFFFF |
| **Section Headers** | 18px | 700 | #1e293b |
| **Category Names** | 14px | 600 | #1e293b |
| **Category Scores** | 18px | 700 | varies |
| **Chart Center Score** | 36px | 700 | #1e293b |
| **Table Headers** | 12px | 600 | #FFFFFF |
| **Table Cells** | 13px | 400 | #1e293b |
| **Badge Text** | 11-13px | 500-600 | varies |
| **Percentage Text** | 13px | 600 | #1e293b |

---

## Spacing System

### Padding
**Styling Specifications:**

Padding: 16px.

### Margins
**Styling Specifications:**

### Gaps
**Styling Specifications:**

Gap between elements: 16px.

---

## Interactions & Behaviors

### Hover States

**Category Item Hover**:
**Styling Specifications:**

Background color: linear-gradient(90deg, rgba($category-color, 0.1) 0%, transparent 100%). Subtle box shadow provides depth and elevation. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

**Table Row Hover**:
**Styling Specifications:**

Background color: rgba(139, 92, 246, 0.05). Subtle box shadow provides depth and elevation. Hover effects provide visual feedback on interactive elements.

**Action Button Hover**:
**Styling Specifications:**

Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

### Click Behaviors

1. **Category Items**: Open filter dialog with category pre-selected
2. **"View [Category] KPIs"**: Filter table by category
3. **Export Button**: Triggers Excel export with current filters
4. **Refresh Button**: Reloads dashboard data
5. **Settings Button**: Opens KPI configuration dialog
6. **Achievement Badges**: Show tooltip with breakdown
7. **Trend Icons**: Show tooltip with historical data
8. **Transition Buttons**: Open transition planning dialog
9. **Edit Icons**: Navigate to KPI edit page
10. **CAPA Icons**: Open CAPA workflow dialog
11. **Pause/Resume**: Toggle auto-refresh
12. **Filter Button**: Open filter dialog

### Auto-Refresh Behavior

**Timer**:
- Countdown from 5 minutes (300 seconds)
- Updates every second
- Visual countdown in header
- Pauses when user interacts with page
- Resumes after 30 seconds of inactivity
- Can be manually paused/resumed

**Refresh Action**:
- Fade out current data
- Show loading spinner
- Fetch new data
- Fade in updated data
- Reset timer to 5 minutes

### Animations

**Page Entry**:
**Styling Specifications:**

**Chart Animation**: Google Charts built-in startup animation (1000ms)

**Progress Bar Fill**:
**Styling Specifications:**

**Refresh Icon Spin**:
**Styling Specifications:**

---

## Responsive Design

### Breakpoints
- **Desktop**: >1024px
- **Tablet**: 768px - 1024px
- **Mobile**: <768px

### Mobile Adjustments
**Styling Specifications:**

Text color: #64748b. Font size: 11px. Font weight: 600. Padding: 12px. Border radius: 8px for rounded corners. Responsive breakpoints ensure proper display across device sizes.

---

## Accessibility (WCAG AA Compliance)

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to activate buttons and links
- Arrow keys for category navigation
- Escape to close dialogs

### Focus Indicators
**Styling Specifications:**

### ARIA Attributes
- `aria-label` on icon-only buttons
- `aria-live="polite"` on auto-refresh timer
- `aria-valuenow` on progress bars
- `role="region"` on sections
- Proper table semantics

### Color Contrast
- All text meets 4.5:1 ratio
- Achievement badges use gradient + white text (7:1)
- Trend icons supplement color with arrows

---

## Loading & Empty States

### Loading State
**Skeleton Placeholders**:
- Gray shimmer on health chart area
- Shimmer rows for table
- Pulse animation on widget positions

### Empty State (No KPIs)
**Container**:
- Text-align: center
- Padding: 60px 20px
- Icon: `assessment` (64px, #cbd5e1)
- Message: "No KPI data available for this period"
- Subtext: "Configure KPIs or select a different period"
- **Action Button**: "Configure KPIs" (primary)

---

## Implementation Notes

### Angular Material Modules Required
**TypeScript Implementation:**

### Google Charts Integration
**TypeScript Implementation:**

### Service Methods Expected
**TypeScript Implementation:**

RxJS observables manage asynchronous data streams.

### Auto-Refresh Implementation
**TypeScript Implementation:**

RxJS observables manage asynchronous data streams.

---

## Summary

This Operational Dashboard - KPI Performance & Health Index provides comprehensive analytics with:

- **Overall Health Index** pie chart with 4 category breakdown
- **Detailed KPI performance** table with achievement tracking
- **Customer Success Goals** monitoring (Premier customers)
- **5 operational widgets** (events, tasks, action items, issues, risks, appreciations)
- **Auto-refresh functionality** with countdown timer
- **Advanced filtering** by category, period, achievement, and project
- **Trend visualization** with sparklines and indicators
- **Responsive design** with mobile-optimized card views
- **Analytics-focused layout** optimized for monitoring and decision-making

The design emphasizes **data-driven insights** with prominent health visualization and detailed performance metrics.

**Word Count**: ~6,400 words

---

**Usage**: Feed this entire prompt to any AI tool (ChatGPT, Claude, GitHub Copilot) to recreate the identical Operational Dashboard - KPI Performance & Health Index page without needing the original codebase.
