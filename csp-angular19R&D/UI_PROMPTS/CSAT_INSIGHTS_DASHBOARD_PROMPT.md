# CSAT Insights Dashboard - Complete UI Recreation Prompt

## Page Overview
Create a comprehensive **CSAT (Customer Satisfaction) Insights Dashboard** for analyzing customer satisfaction survey data across questions, time periods, and customer segments. The dashboard features a multi-page interface with **3 views**: Heat Map Table (CSS Score), Response Category Charts, and **Question-wise Rating Analysis** (primary focus), all controlled by a unified compact filter panel with 9 filter fields and Prev/Next navigation.

---

## Design System & Framework

### Technology Stack
- **Framework**: Angular 19+ (standalone components)  
- **UI Library**: Angular Material v19+ (Material Design 3)  
- **Charts**: High charts (column/bar charts for rating distribution)  
- **Icons**: Material Icons  
- **Styling**: SCSS with modern Inter font system  
- **Color Scheme**: Modern blue/teal with gradient accents

### Design Philosophy
**Modern Material Design with Chart Focus** - Clean, data-driven interface emphasizing visual analytics through charts. Uses Inter font family for professional aesthetics, soft gradients for backgrounds, and color-coded rating categories (NPS-style: Need Improvement/Good/Great/Excellent).

---

## Layout Structure

### 1. Page Container
**Styling Specifications:**

Background color: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%). Padding: 12px.

### 2. Filter Panel (Compact, Horizontal, Persistent Across All Pages)
**Position**: Top of page, sticky  
**Background**: #ffffff  
**Border-radius**: 12px  
**Box-shadow**: `0 4px 12px rgba(0, 0, 0, 0.08)`  
**Padding**: `4px 12px 15px`  
**Margin**: `4px 8px`  
**Border**: `1px solid #e2e8f0`

**Layout**: Single row with 9 filter fields + action buttons

#### Filter Fields (Left to Right, Compact Height: 30px)

1. **Business Unit** (mat-select, multi-select)
   - Width: 140px
   - Label: "BU" (9px, 700 weight, uppercase, letter-spacing 1px, #1e293b)
   - Label badge: Green left border (3px #125b9e)
   - Options: "All" + dynamic business unit list
   - Font-size: 11px
   - Background: #f8fafc
   - Border: 1px #e2e8f0 (normal), 2px #14b8a6 (focused)

2. **Account** (mat-select, multi-select with search)
   - Width: 170px
   - Label: "ACCOUNT" (badge style)
   - **Search Feature**: Sticky search input at top of dropdown
     - Placeholder: "Search accounts..."
     - Icon: `search` (12px)
     - Font-size: 12px
     - Height: 24px
     - Padding: 4px 8px
     - Background: #f8fafc
   - Options: "All" + filtered customer list
   - Special groups: "Top 15", "QA Spoc", "Strategic accounts"
   - Multi-select logic: "All" deselects when individual selected

3. **CSM** (mat-select, multi-select) - **Hidden by default**
   - Display: none
   - Used for CSM-specific filtering (admin view)

4. **Year** (mat-select, single)
   - Width: 78px
   - Label: "YEAR" (badge style)
   - Options: Dynamic list (current year ± 2 years, e.g., 2024, 2025, 2026)
   - Default: Current year

5. **Period** (mat-select, single)
   - Width: 80px
   - Label: "PERIOD" (badge style)
   - Options: Q1 / Q2 / Q3 / Q4 / H1 / H2 / Annual / Select Period
   - "Select Period" only for Premier customers
   - Default: Current quarter

6. **From Date** (mat-datepicker)
   - Width: 150px
   - Label: "FROM DATE" (badge style)
   - Format: "Month Day, Year" (e.g., "October 1, 2025")
   - Enabled only when Period = "Select Period"
   - Icon suffix: `event` (14px)
   - Custom date adapter for format

7. **To Date** (mat-datepicker)
   - Width: 150px
   - Label: "TO DATE" (badge style)
   - Format: "Month Day, Year"
   - Enabled only when Period = "Select Period"
   - Validation: Must be >= From Date
   - Icon suffix: `event` (14px)

8. **Show Data** (mat-select, single)
   - Width: 130px
   - Label: "SHOW DATA" (badge style)
   - Options:
     - Value 1: "For Specific Period"
     - Value 2: "Till Chosen Period"
     - Value 3: "For Last 4 Quarters"
   - Default: Value 1

9. **Frequency** (mat-select, single)
   - Width: 72px
   - Label: "FREQ" (badge style)
   - Options: All / Quarterly / Half-Yearly / Annual
   - Default: "Both" (All)

#### Action Buttons (Right-aligned, Stacked in 2 Rows)

**Row 1 (Navigation)**:
- **Prev Button**:
  - Size: 26px height
  - Padding: 4px 10px
  - Min-width: 58px
  - Text: "Prev"
  - Font-size: 10px, weight 600
  - Border: 1.5px solid #cbd5e1
  - Color: #475569
  - Background: #ffffff
  - Border-radius: 4px
  - Disabled when `currIndex === 0`
  - Hover: Background #f1f5f9, border #94a3b8

- **Next Button**:
  - Same styling as Prev
  - Text: "Next"
  - Disabled when `currIndex === 2`
  - Margin-left: 6px

**Row 2 (Actions)**:
- **Apply Button**:
  - Size: 26px height
  - Padding: 4px 10px
  - Text: "Apply"
  - Font-size: 10px, weight 600
  - Background: `linear-gradient(145deg, #2a79c4, #125b9e)`
  - Color: #ffffff
  - Border: none
  - Border-radius: 4px
  - Box-shadow: `0 2px 4px rgba(42, 121, 196, 0.3)`
  - Hover: Transform `translateY(-1px)`, enhanced shadow
  - Click: Emits filter data, triggers chart refresh

- **Reset Button**:
  - Same size as Apply
  - Background: `linear-gradient(145deg, #2da515, #43a82f)`
  - Text: "Reset"
  - Margin-left: 6px
  - Click: Resets all filters to defaults

- **View Details Button**:
  - Same size as Apply
  - Background: `linear-gradient(145deg, #f59e0b, #d97706)`
  - Text: "View Details"
  - Margin-left: 6px
  - Click: Opens detailed view modal

### 3. Page Content Area (Conditional Rendering Based on currIndex)

#### Layout Flow
**TypeScript Implementation:**

---

## Page 2: CSAT Insights (Question-wise Rating Analysis) - PRIMARY PAGE

### Component: `cssdashboard-next-page2`

### Container
**Background**: `linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)`  
**Padding**: 16px  
**Border-radius**: 14px  
**Box-shadow**: `0 4px 16px rgba(15, 23, 42, 0.06)`  
**Border**: `1px solid #e2e8f0`

### Header Section
**Position**: Top-right, absolute positioning  
**Display**: Conditional (visible when `trendQuarter == 2 || trendQuarter == 3`)

**Checkbox**:
**Styling Specifications:**

Background color: #ffffff. Text color: #475569. Font size: 11px. Font weight: 500. Padding: 5px 10px 5px 8px. Margin: 0. Border radius: 20px for rounded corners. Subtle box shadow provides depth and elevation.

**Text**: "Show Trend Wise Data"  
**Behavior**: On change, triggers `loadData(true)` to reload charts with trend-wise granularity

### Chart Grid Layout
**Display**: Grid  
**Columns**: 3 (Bootstrap-style `col-sm-4`)  
**Gap**: 12px  
**Responsive**: Maintains 3-column on desktop, stacks on mobile

**Each Chart Container**:
**Styling Specifications:**

Background color: #ffffff. Padding: 12px. Border radius: 14px for rounded corners. Subtle box shadow provides depth and elevation. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

### Chart Types
**Highcharts** - One chart per survey question  
**Chart Type**: Column or Bar chart (configurable)  
**Data**: Question-wise rating distribution (percentage/count per rating category)

### Number of Charts
**Dynamic**: Generated from API response
- Non-Monthly Frequency: Single array `surveyQuestions`
- Monthly Frequency: Two arrays `surveyQuestions.item1` (Month 1), `surveyQuestions.item2` (Month 2)
- **Example**: If 12 survey questions, displays 12 charts (4 rows × 3 columns)

### No Data State (Empty Charts)
**Container**:
**Styling Specifications:**

Background color: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%). Border radius: 14px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment.

**Icon**: `warning` (Material Icons)
- Size: 72×72px
- Color: #9e9e9e
- Opacity: 0.5
- Margin-bottom: 16px

**Text**: "No Data found"
- Font-size: 16px
- Font-weight: 500
- Color: #9e9e9e

### Loading State
**Mat-progress-bar**:
**Styling Specifications:**

Background color: linear-gradient(90deg, #3b82f6, #8b5cf6). Border radius: 2px for rounded corners.

**Display**: At top of content area  
**Mode**: Indeterminate

---

## Color Palette

### Primary Colors
**Styling Specifications:**

### Status/Alert Colors
**Styling Specifications:**

### Neutral Colors
**Styling Specifications:**

Text color: #e2e8f0.

### Rating Category Colors (NPS-Style 4-Tier System)
**Styling Specifications:**

Text color: #ef4444.

### Survey Chart Colors (Alternative Set)
**Styling Specifications:**

Text color: #06b6d4.

### Gradient Backgrounds (Buttons & UI Elements)
**Styling Specifications:**

---

## Typography

### Font Families
**Styling Specifications:**

### Font Specifications
| Element | Size | Weight | Color | Letter Spacing |
|---------|------|--------|-------|----------------|
| **Chart Titles** | 18px | 700 (Bold) | #0f172a | -0.025em |
| **Chart Subtitles** | 13px | 500 (Medium) | #64748b | normal |
| **Filter Labels** | 9px | 700 (Bold) | #1e293b | 1px (uppercase) |
| **Form Inputs** | 11-13px | 500 (Medium) | #334155 | normal |
| **Buttons** | 10px | 600 (Semi-bold) | #fff | normal |
| **Table Text** | 13px | 400-600 | #212121 | normal |
| **No Data Text** | 16px | 500 (Medium) | #9e9e9e | normal |
| **Axis Labels** | 12px | 500 (Medium) | #475569 | normal |
| **Legend** | 12px | 500 (Medium) | #475569 | normal |
| **Data Labels** | 11px | 600 (Semi-bold) | #1e293b | normal |
| **Tooltips** | 12px | 500 (Medium) | #ffffff | normal |

---

## Spacing & Dimensions

### Filter Panel Spacing
**Styling Specifications:**

Padding: 4px 12px 15px. Margin: 4px 8px. Gap between elements: 8px.

### Button Dimensions
**Styling Specifications:**

Padding: 4px 10px. Border radius: 4px for rounded corners.

### Chart Containers
**Styling Specifications:**

Padding: 16px. Gap between elements: 12px.

### Progress Bar
**Styling Specifications:**

Border radius: 2px for rounded corners.

---

## Highcharts Configuration (Complete Specification)

### Chart Container
**TypeScript Implementation:**

### Title Styling
**TypeScript Implementation:**

### Subtitle (Optional)
**TypeScript Implementation:**

### X-Axis
**TypeScript Implementation:**

### Y-Axis
**TypeScript Implementation:**

### Legend
**TypeScript Implementation:**

### Tooltip
**TypeScript Implementation:**

### Plot Options (Column Chart)
**TypeScript Implementation:**

### Series (Example Data Structure)
**TypeScript Implementation:**

### Credits
**TypeScript Implementation:**

### Exporting
**TypeScript Implementation:**

---

## Material Components Configuration

### Mat-Form-Field (Filter Panel)
**Styling Specifications:**

Background color: #f8fafc. Text color: #94a3b8. Font size: 11px. Font weight: 700. Border radius: 6px for rounded corners. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

### Mat-Select (Dropdown Panels)
**Styling Specifications:**

Background color: #eff6ff. Text color: #334155. Font size: 12px. Font weight: 500. Padding: 0 12px. Border radius: 10px for rounded corners. Subtle box shadow provides depth and elevation. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

### Account Search in Dropdown
**Styling Specifications:**

Background color: #ffffff. Text color: #64748b. Font size: 14px. Padding: 8px. Margin: 0.

### Mat-Datepicker
**Styling Specifications:**

Text color: #14b8a6. Font size: 14px. Border radius: 12px for rounded corners. Subtle box shadow provides depth and elevation.

### Mat-Checkbox
**Styling Specifications:**

Text color: #cbd5e1. Font size: 11px. Font weight: 500. Border radius: 4px for rounded corners.

### Mat-Progress-Bar
**Styling Specifications:**

Background color: linear-gradient(90deg, #3b82f6, #8b5cf6). Border radius: 2px for rounded corners.

---

## Interactions & Behaviors

### Filter Interactions

#### Multi-Select Logic ("All" Behavior)
**TypeScript Implementation:**

#### Period Selection → Date Picker Enable/Disable
**TypeScript Implementation:**

#### Business Unit → Account Filtering
**TypeScript Implementation:**

#### Account Search (Live Filtering)
**TypeScript Implementation:**

### Button Interactions

#### Apply Button
**TypeScript Implementation:**

#### Reset Button
**TypeScript Implementation:**

#### Prev/Next Buttons
**TypeScript Implementation:**

#### View Details Button
**TypeScript Implementation:**

### Chart Interactions

**Hover States**:
**Styling Specifications:**

Subtle box shadow provides depth and elevation. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

**Highcharts Point Click Event**:
**TypeScript Implementation:**

### Trend Data Toggle (Checkbox)
**TypeScript Implementation:**

---

## Responsive Design

### Breakpoints
**Styling Specifications:**

### Current Implementation (Desktop-Optimized)
- Filter panel: Fixed widths, may overflow on smaller screens
- Charts: 3-column grid (col-sm-4)
- Charts maintain 500px height regardless of screen size
- No explicit mobile breakpoints defined

### Recommended Mobile Adjustments (To Implement)
**Styling Specifications:**

Padding: 8px. Gap between elements: 8px. Responsive breakpoints ensure proper display across device sizes.

---

## Accessibility (WCAG AA Compliance)

### Keyboard Navigation
- All filter fields: Tab navigation
- Dropdowns: Arrow keys for selection
- Buttons: Enter/Space to activate
- Date pickers: Arrow keys in calendar
- Charts: Arrow keys to navigate data points (if Highcharts accessibility module enabled)

### Focus Indicators
**Styling Specifications:**

Border radius: 4px for rounded corners.

### ARIA Attributes
**Component Structure:**

Action buttons are provided for user interactions. Dropdown select fields allow users to choose from predefined options. Date picker components enable calendar-based date selection. Form validation ensures required fields are completed before submission.

### Color Contrast
- All text meets WCAG AA standards (4.5:1 minimum)
- Chart colors tested for accessibility
- Focus indicators high contrast
- Disabled states clearly indicated (opacity 0.44-0.5)

### Screen Reader Support
- Chart titles as headings (h2/h3)
- Data tables within charts have proper ARIA
- Filter labels associated with inputs
- Button text descriptive (not just icons)
- Loading/error states announced

### Highcharts Accessibility Module
**TypeScript Implementation:**

---

## Shadow & Elevation System

**Styling Specifications:**

Hover effects provide visual feedback on interactive elements.

**Usage**:
- Filter panel: `--shadow-md`
- Chart containers: `--shadow-lg`
- Chart hover: `--shadow-xl`
- Dropdowns: `--shadow-lg`
- Buttons: `--shadow-sm` (normal), `--shadow-md` (hover)

---

## Border Radius System

**Styling Specifications:**

---

## Animation & Transitions

**Styling Specifications:**

Smooth transitions enhance user experience with animated state changes.

---

## API Integration

### Service Methods Expected
**TypeScript Implementation:**

RxJS observables manage asynchronous data streams.

### Data Models
**TypeScript Implementation:**

Data models define the structure and types for component data.

---

## Implementation Notes

### Angular Material Modules Required
**TypeScript Implementation:**

### Highcharts Modules
**TypeScript Implementation:**

### State Management
**TypeScript Implementation:**

---

## Summary

This CSAT Insights Dashboard provides a comprehensive analytics interface with:

- **3-page navigation** (Heat Map, Response Charts, Question-wise Insights)
- **9-field compact filter panel** with multi-select, date pickers, and search
- **Dynamic Highcharts** generation (one per survey question)
- **4-tier rating system** (Need Improvement/Good/Great/Excellent) with color-coding
- **Trend-wise data toggle** for granular time-based analysis
- **Responsive chart grid** (3-column desktop layout)
- **Modern Inter font** typography system
- **Gradient button** accents (blue/green/amber)
- **Loading & empty states** with animations
- **WCAG AA accessibility** with Highcharts accessibility module
- **Export functionality** (PNG, PDF, CSV, Excel)

The design emphasizes **data visualization** through clean charts with professional styling, enabling stakeholders to quickly identify customer satisfaction trends and areas for improvement across survey questions.

**Word Count**: ~4,800 words

---

**Usage**: Feed this entire prompt to any AI tool (ChatGPT, Claude, GitHub Copilot) to recreate the identical CSAT Insights Dashboard without needing access to the original codebase. All specifications are self-contained and complete.
