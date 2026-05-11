# Customer Satisfaction Survey Page - Complete UI Recreation Prompt

## Page Overview
Create a comprehensive **Customer Satisfaction Survey (CSS/CSAT) Form** for collecting customer feedback in an enterprise Customer Success Management platform. This is a modern, user-friendly survey interface featuring dynamic question rendering with NPS ratings (0-10 pills), star ratings for multiple criteria, text feedback areas, and optional qualitative questions. The design emphasizes clarity, accessibility, and a professional blue gradient theme with smooth transitions and validation.

---

## Design System & Framework

### Technology Stack
- **Framework**: Angular 19+ (standalone components)  
- **UI Library**: Angular Material v19+ (Material Design 3)  
- **Icons**: Material Icons  
- **Styling**: SCSS with design tokens and CSS variables  
- **Charts**: Not applicable  
- **Custom Components**: Star rating component

### Design Philosophy
**Modern, Clean Blue Theme** with excellent user experience prioritizing clarity, simplicity, and visual appeal. The interface provides immediate visual feedback, clear question layout, and intuitive rating mechanisms. Designed to minimize cognitive load and encourage thoughtful responses.

---

## Layout Structure

### 1. Main Container
**Styling Specifications:**

Background color: #FFFFFF. Font size: 13px. Padding: 12px 20px. Margin: 0 auto.

### 2. Header Section
**Background**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`  
**Padding**: 16px 24px  
**Border-radius**: 8px  
**Box-shadow**: `0 2px 8px rgba(0, 0, 0, 0.1)`  
**Margin-bottom**: 16px  
**Border-left**: 4px solid #7C2D5E  
**Display**: Flex, align-items center, gap 20px

**Header Content**:
- **Logo**: 
  - Width: 180px
  - Height: auto
  - Source: `assets/images/CustomerLogo.png`
  - Margin-right: 20px

- **Title**: "Customer Satisfaction Survey"
  - Font-size: 18px
  - Font-weight: 700
  - Color: #FFFFFF
  - Letter-spacing: 0.3px

### 3. Information Card
**Background**: #FFFFFF  
**Max-width**: 850px  
**Padding**: 12px 16px  
**Border**: 1px solid #cbd5e1  
**Border-left**: 4px solid #3b82f6  
**Border-radius**: 6px  
**Box-shadow**: `0 2px 8px rgba(0, 0, 0, 0.06)`  
**Margin-bottom**: 16px

**Grid Layout** (4 columns):
**Styling Specifications:**

CSS Grid layout organizes content in a responsive grid structure. Gap between elements: 12px.

**Info Item**:
- **Label**: 
  - Font-size: 11px
  - Font-weight: 600
  - Color: #64748b
  - Text-transform: uppercase
  - Margin-bottom: 4px
- **Value**:
  - Font-size: 13px
  - Font-weight: 500
  - Color: #1e293b

**Fields Displayed**:
1. Account / Portfolio
2. Project / Portfolio (depends on isMonthly)
3. Feedback Period
4. Respondent Name

### 4. Additional CSS Fields Card (Conditional)
**Display**: Only when `showCSSFields === true`  
**Styling**: Same as Information Card  
**Border-left**: 4px solid #10B981

**Contains**:

1. **Date of Meeting** (mat-datepicker)
   - Label: "Date of Meeting"
   - Required: true
   - Appearance: outline
   - Icon suffix: `calendar_today` (18px)
   - Format: dd-MMM-yyyy
   - Width: 240px

2. **CSM Notification Checkbox**
   - Label: "Check to notify the CSM"
   - Font-size: 12px
   - Color: #1e293b

3. **Email Template Link**
   - Text: "[Click here to view the email template]"
   - Color: #0094ff
   - Font-size: 12px
   - Hover: Text-decoration underline
   - Click: Opens dialog with email template

### 5. Introduction Text
**Background**: `linear-gradient(135deg, #EBF5FF 0%, #DBEAFE 100%)`  
**Padding**: 12px 16px  
**Border**: 1px solid #3b82f6  
**Border-radius**: 6px  
**Margin-bottom**: 16px  
**Font-size**: 13px  
**Color**: #1e293b  
**Line-height**: 1.6

**Content**:
**Implementation Details:**

This section implements the described functionality using generic. The implementation spans approximately 3 lines and follows the component structure outlined above.

### 6. Survey Card (Main Content)
**Background**: #FFFFFF  
**Border**: 1px solid #cbd5e1  
**Border-radius**: 6px  
**Box-shadow**: `0 2px 8px rgba(0, 0, 0, 0.06)`  
**Padding**: 16px 20px

---

## NPS Rating Section

### Section Header
**Background**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`  
**Padding**: 8px 16px  
**Border-radius**: 6px 6px 0 0  
**Margin**: -16px -20px 16px -20px  
**Color**: #FFFFFF  
**Font-size**: 13px  
**Font-weight**: 600

**Text**: "Net Promoter Score (NPS)"

### NPS Question
**Font-size**: 13px  
**Font-weight**: 600  
**Color**: #1e293b  
**Margin-bottom**: 12px

**Example**: "How likely are you to recommend {{Company}} to a friend or colleague?"

### NPS Rating Pills (0-10)
**Display**: Flex, gap 6px, wrap  
**Container**: Full width

**Each Pill**:
**Styling Specifications:**

Background color: #f8fafc. Text color: #64748b. Font size: 14px. Font weight: 600. Padding: 8px 12px. Border radius: 6px 0 0 6px for rounded corners. Subtle box shadow provides depth and elevation. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

**Rating Range Colors** (when selected):
- **0-6** (Detractors): Red gradient (#DC2626 to #EF4444)
- **7-8** (Passives): Orange gradient (#ff9800 to #FBC02D)
- **9-10** (Promoters): Green gradient (#059669 to #10B981)

### NPS Comments Textarea (Conditional)
**Display**: Only when NPS rating < 9  
**Margin-top**: 16px

**Label**: "Please provide reasons for your rating"  
**Required**: true  
**Font-size**: 12px

**Textarea**:
**Styling Specifications:**

Background color: #FEF2F2. Text color: #1A56DB. Font size: 13px. Padding: 10px 12px. Border radius: 6px for rounded corners. Subtle box shadow provides depth and elevation.

**Character Counter**:
- Position: Below textarea, right-aligned
- Font-size: 11px
- Color: #64748b
- Format: "{{current}} / 500 characters"
- Max-length: 500

---

## Criteria Rating Section

### Section Header
**Background**: `linear-gradient(135deg, #14B8A6 0%, #0891B2 100%)`  
**Padding**: 8px 16px  
**Border-radius**: 6px  
**Margin**: 20px 0 16px 0  
**Color**: #FFFFFF  
**Font-size**: 13px  
**Font-weight**: 600

**Text**: "Service Delivery Criteria"

### Criteria Table
**Border**: 1px solid #cbd5e1  
**Border-radius**: 6px  
**Overflow**: hidden

**Table Styling**:
**Styling Specifications:**

**Table Header**:
- Background: #f1f5f9
- Color: #334155
- Font-size: 11px
- Font-weight: 700
- Text-transform: uppercase
- Padding: 8px 12px
- Border-bottom: 2px solid #cbd5e1

**Columns** (3):
1. **Question** - 40% width
2. **Rating** - 35% width, text-align center
3. **Remarks** - 25% width

**Table Rows**:
- Padding: 8px 12px
- Border-bottom: 1px solid #e2e8f0
- Hover: Background #f8fafc

### Question Cell
**Font-size**: 13px  
**Font-weight**: 500  
**Color**: #1e293b  
**Display**: Flex, align-items center, gap 8px

**Info Icon** (if question has details):
- Icon: `info` (16px)
- Color: #64748b
- Cursor: pointer
- Tooltip: Shows question details on hover

### Star Rating Cell
**Component**: `<app-star-rating>`  
**Display**: Flex, justify-content center

**Star Rating Component Props**:
**TypeScript Implementation:**

**Star Styling**:
**Styling Specifications:**

Text color: #cbd5e1. Font size: 24px. Flexbox layout enables flexible positioning and alignment. Gap between elements: 4px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

**Rating Scale**:
- 1 star = 1
- 2 stars = 2
- 3 stars = 3
- 4 stars = 4
- 5 stars = 5

**Special Interaction**:
- If "Overall Experience" criterion is rated 5 stars
- Shows confirmation dialog: "Do you want to rate all criteria as 5?"
- If Yes: Auto-fills all criteria with 5 stars

### Remarks Textarea
**Width**: 100%  
**Min-height**: 50px  
**Padding**: 8px  
**Border**: 1px solid #e2e8f0  
**Border-radius**: 4px  
**Font-size**: 12px  
**Resize**: vertical

**Required**: When rating < 4 stars  
**Max-length**: 500 characters

**Validation Highlight**:
**Styling Specifications:**

Background color: #FEF2F2. Text color: #EF4444.

**Character Counter**: Same as NPS comments

---

## Additional Questions Section (Conditional)

**Display**: Only when `showQualitativeFeedback === true`  
**Max Questions**: 2

### Section Header
**Background**: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`  
**Padding**: 8px 16px  
**Border-radius**: 6px  
**Margin**: 20px 0 16px 0  
**Color**: #FFFFFF  
**Font-size**: 13px  
**Font-weight**: 600

**Text**: "Additional Feedback"

### Question Layout
**Each Question**:
- **Label**: Question text
  - Font-size: 13px
  - Font-weight: 600
  - Color: #1e293b
  - Margin-bottom: 8px
  
- **Textarea**:
  - Same styling as NPS comments
  - Max-length: 300 characters
  - Required: true if question exists

**Spacing**: 16px between questions

---

## Action Buttons

### Button Container
**Display**: Flex, gap 16px  
**Justify-content**: Center  
**Margin-top**: 24px  
**Padding-top**: 20px  
**Border-top**: 2px solid #e2e8f0

### Save as Draft Button
**Styling Specifications:**

Background color: linear-gradient(135deg, #ff9800 0%, #FBC02D 100%). Text color: #FFFFFF. Font size: 13px. Font weight: 600. Padding: 10px 28px. Border radius: 6px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 8px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.
- Icon: `save` (18px)
- Text: "Save as Draft"
- Click: Saves without validation, shows success dialog

### Submit Button
**Styling Specifications:**

Background color: linear-gradient(135deg, #1A56DB 0%, #3B82F6 100%). Text color: #FFFFFF. Font size: 13px. Font weight: 600. Padding: 10px 32px. Border radius: 6px for rounded corners. Subtle box shadow provides depth and elevation. Flexbox layout enables flexible positioning and alignment. Gap between elements: 8px. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.
- Icon: `send` (18px)
- Text: "Submit Survey"
- Click: Validates all fields, shows confirmation dialog, submits

**Disabled State**: 
- When `disableSubmit === true`
- Or when survey is already completed (`IsCompleted === true`)

---

## Color Palette

### Primary Colors
**Styling Specifications:**

### Status Colors
**Styling Specifications:**

### Background Colors
**Styling Specifications:**

Hover effects provide visual feedback on interactive elements.

### Text Colors
**Styling Specifications:**

### Border Colors
**Styling Specifications:**

---

## Typography

### Font Families
**Styling Specifications:**

### Font Specifications
| Element | Size | Weight | Color | Line-height |
|---------|------|--------|-------|-------------|
| **Page Title** | 18px | 700 | #FFFFFF | 1.4 |
| **Section Headers** | 13px | 600 | #FFFFFF | 1.3 |
| **Question Text** | 13px | 600 | #1e293b | 1.5 |
| **Info Labels** | 11px | 600 | #64748b | 1.3 |
| **Info Values** | 13px | 500 | #1e293b | 1.4 |
| **Table Headers** | 11px | 700 | #334155 | 1.2 |
| **Table Cells** | 13px | 500 | #1e293b | 1.5 |
| **Intro Text** | 13px | 400 | #1e293b | 1.6 |
| **Button Text** | 13px | 600 | varies | 1.4 |
| **Character Counter** | 11px | 400 | #64748b | 1.2 |
| **Rating Pill** | 14px | 600 | varies | 1.2 |

---

## Spacing System

### Padding
**Styling Specifications:**

Padding: 12px 20px.

### Margins
**Styling Specifications:**

### Gaps
**Styling Specifications:**

Gap between elements: 20px.

---

## Interactions & Behaviors

### Hover States

**Rating Pill Hover**:
**Styling Specifications:**

Background color: #e2e8f0. Text color: #94a3b8. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

**Star Hover**:
**Styling Specifications:**

Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

**Button Hover**:
**Styling Specifications:**

Subtle box shadow provides depth and elevation. Smooth transitions enhance user experience with animated state changes. Hover effects provide visual feedback on interactive elements.

### Click Behaviors

1. **NPS Rating Pill Click**: 
   - Selects rating (0-10)
   - Updates model
   - Shows/hides comments textarea based on rating < 9
   - Changes pill color based on range

2. **Star Click**: 
   - Updates rating (1-5)
   - Triggers event emission
   - If "Overall Experience" rated 5: Shows auto-fill dialog

3. **Save as Draft**: 
   - Saves current state without validation
   - Shows success dialog: "Saved as Draft"
   - Does not mark survey as complete

4. **Submit Survey**: 
   - Shows confirmation dialog: "Are you sure you want to submit?"
   - On confirm: Validates all required fields
   - If errors: Shows validation error dialog
   - If valid: Submits survey, shows success dialog, disables form

5. **Email Template Link**: 
   - Opens dialog with email template preview
   - Dialog width: 800px

### Validation Rules

**Required Fields**:
- NPS rating (0-10)
- NPS comments (if rating < 9)
- All criteria star ratings
- Criteria remarks (if rating < 4 stars)
- Additional question comments (if questions exist)
- Date of Meeting (if showCSSFields)
- CSAT SPOC Email (if showCSSFields)

**Validation Display**:
- Required textareas: Red border (#EF4444), light red background (#FEF2F2)
- Validation dialog: Lists all missing/invalid fields
- Prevents submission until all requirements met

### Auto-fill Interaction

**Trigger**: Rating "Overall Experience" as 5 stars  
**Dialog**:
- Title: "Auto-fill Ratings?"
- Message: "You rated Overall Experience as 5 stars. Would you like to rate all other criteria as 5 stars as well?"
- Buttons: "No" (stroked) / "Yes, Auto-fill" (raised, primary)
- On Yes: Sets all criteria to 5 stars

---

## Completion States

### Survey Completed
**When**: `IsCompleted === true`

**Changes**:
- All form fields disabled
- Buttons disabled
- Thank you message displayed
- No edits allowed

### Thank You Dialog
**Width**: 500px  
**Border-radius**: 12px  
**Padding**: 24px

**Icon**: `check_circle` (64px, color #10B981)  
**Title**: "Survey Submitted Successfully"  
- Font-size: 20px
- Font-weight: 700
- Color: #1e293b

**Message**: "Thanks for your time! Customer Satisfaction Survey submitted successfully. A detailed report will be sent to your e-mail shortly."  
- Font-size: 14px
- Color: #64748b
- Line-height: 1.6

**Button**: "Close"  
- Background: `linear-gradient(135deg, #10B981 0%, #059669 100%)`
- Color: #FFFFFF
- Padding: 10px 32px
- Border-radius: 6px

---

## Dialogs & Modals

### 1. Confirmation Dialog (Submit)
**Width**: 450px  
**Content**:
- Icon: `help_outline` (48px, #1A56DB)
- Title: "Confirm Submission"
- Message: "Are you sure you want to submit this survey? You won't be able to edit it afterwards."
- Buttons: "Cancel" (stroked) / "Submit" (raised, primary)

### 2. Validation Error Dialog
**Width**: 500px  
**Content**:
- Icon: `error` (48px, #EF4444)
- Title: "Incomplete Survey"
- Message: List of missing/invalid fields
- Button: "OK" (primary)

### 3. Success Dialog (Draft)
**Width**: 400px  
**Content**:
- Icon: `save` (48px, #ff9800)
- Title: "Saved as Draft"
- Message: "Your response is saved as draft. You can modify and submit later."
- Button: "OK" (primary)

### 4. Email Template Dialog
**Width**: 800px  
**Max-height**: 80vh  
**Content**: HTML email template preview  
**Button**: "Close"

### 5. Auto-fill Dialog
**Width**: 450px  
**Content**: See "Auto-fill Interaction" section  
**Buttons**: "No" / "Yes, Auto-fill"

---

## Responsive Design

### Breakpoints

**Tablet**: max-width 768px  
**Mobile**: max-width 600px

### Responsive Adjustments

**Styling Specifications:**

Font size: 16px. Font weight: 700. Padding: 8px 12px. Border radius: 6px for rounded corners. Responsive breakpoints ensure proper display across device sizes.

---

## Accessibility (WCAG AA Compliance)

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to select ratings
- Arrow keys for star ratings
- Escape to close dialogs

### Focus Indicators
**Styling Specifications:**

### ARIA Attributes
- `aria-label` on star rating components
- `aria-required` on required fields
- `aria-invalid` on validation errors
- `role="radiogroup"` on NPS pills
- `role="alert"` on validation messages
- Proper heading hierarchy (h1, h2)

### Color Contrast
- All text meets WCAG AA (4.5:1 minimum)
- Star ratings use gold color for visibility
- Required field highlights use both color and background

### Screen Reader Support
- Descriptive labels for all form fields
- Alternative text for icons
- Clear button labels (not icon-only)
- Tooltip content accessible

---

## Loading & Empty States

### Loading State
**Display**: Skeleton placeholders while loading questions  
**Components**:
- Shimmer effect on text placeholders
- Gray boxes where content will appear

### Error State (Failed to Load)
**Container**:
- Text-align: center
- Padding: 60px 20px
- Icon: `error_outline` (64px, #EF4444)
- Message: "Unable to load survey. Please try again later."
- Button: "Retry" (primary)

---

## Implementation Notes

### Angular Material Modules Required
**TypeScript Implementation:**

### Custom Components Required
**TypeScript Implementation:**

### Service Methods Expected
**TypeScript Implementation:**

RxJS observables manage asynchronous data streams.

### State Management
- **questions_NPS**: NPS question data
- **questions_Criteria**: Array of criteria questions
- **questions_Others**: Array of additional questions
- **selectedRating**: NPS rating (0-10)
- **IsCompleted**: Boolean for completed state
- **disableSubmit**: Boolean for submit button state
- **showQualitativeFeedback**: Boolean for additional questions
- **showCSSFields**: Boolean for CSS-specific fields

### Validation Logic
**TypeScript Implementation:**

---

## Summary

This Customer Satisfaction Survey Page provides a comprehensive, user-friendly interface for collecting customer feedback with:

- **Modern blue gradient theme** with professional aesthetics
- **NPS rating with 0-10 pills** and conditional comments
- **Star rating system** for multiple criteria with auto-fill option
- **Dynamic question rendering** based on configuration
- **Conditional fields** for CSS-specific requirements
- **Draft and submit** workflows with validation
- **Character counters** on all text areas
- **Responsive design** with mobile-optimized layouts
- **WCAG AA accessibility** compliance
- **Smooth transitions** and intuitive interactions

The design emphasizes **clarity and ease of use**, encouraging thoughtful responses while maintaining professionalism and brand consistency.

**Word Count**: ~5,400 words

---

**Usage**: Feed this entire prompt to any AI tool (ChatGPT, Claude, GitHub Copilot) to recreate the identical Customer Satisfaction Survey Page without needing access to the original codebase. All specifications are self-contained and complete.
