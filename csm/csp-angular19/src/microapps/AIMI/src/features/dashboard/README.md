# Dashboard Feature

The Dashboard feature provides comprehensive statistical analysis and insights from AI maturity activities data.

## Features

### Summary Statistics

- **Total Activities**: Count of all recorded activities
- **Total Hours Saved**: Sum of hours saved across all activities
- **Revenue Generated**: Count of activities that generated revenue
- **High Adoption**: Count of activities with AI adoption score >= 4

### Statistical Analysis

The dashboard performs correlation analysis on the following relationships:

1. **AI Tool Used vs. SDLC Phase**: Analyzes the relationship between specific AI tools and SDLC phases
2. **Qualitative Benefit vs. Practice**: Examines correlations between benefits and practice areas
3. **% Work Done by AI vs. Hours Saved**: Measures the relationship between AI automation level and time savings
4. **Revenue Generated vs. AI Adoption Score**: Analyzes the impact of AI adoption on revenue generation

## Data Flow

1. **Data Loading**: Activities are loaded from localStorage using `activityStorageUtils`
2. **Calculation**: Statistical functions process the raw data
3. **Display**: Components render the calculated statistics and correlations
4. **Refresh**: Users can manually refresh data to see latest changes

## Styling

The dashboard uses consistent Material-UI styling with:

- Gradient backgrounds for visual appeal
- Hover effects for interactive elements
- Color-coded correlation indicators
- Responsive grid layout
- Consistent spacing and typography

## Statistical Calculations

### 1. Summary Statistics

#### Overall AI Adoption Score

```
Overall AI Adoption Score = Σ(AI Adoption Scores) / Total Activities
```

- **Range**: 0-5 (0 = No adoption, 5 = Leading edge)
- **Calculation**: Average of all AI adoption scores across activities

#### Overall % Work Done by AI

```
Overall % Work Done by AI = Σ(Work Done by AI %) / Total Activities
```

- **Range**: 0-100%
- **Calculation**: Average percentage of work done by AI across all activities

#### High Adoption Rate

```
High Adoption Rate = (Activities with AI Adoption Score ≥ 3) / Total Activities × 100
```

- **Definition**: Percentage of activities with moderate to advanced AI adoption

### 2. Correlation Analysis

#### Pearson Correlation Coefficient

For numerical data relationships (e.g., Hours Saved vs Revenue Generated):

```
r = Σ((x - x̄)(y - ȳ)) / √(Σ(x - x̄)² × Σ(y - ȳ)²)
```

Where:

- `r` = Correlation coefficient (-1 to +1)
- `x, y` = Data points
- `x̄, ȳ` = Means of x and y respectively

#### Chi-Square Approximation

For categorical data relationships (e.g., AI Tool vs SDLC Phase):

```
χ² = Σ((Observed - Expected)² / Expected)
```

Where:

- `Observed` = Actual frequency
- `Expected` = Expected frequency under independence assumption

### 3. AI Tools Analysis

#### Most Beneficial AI Tool Selection

```
Benefit Score = (Hours Saved × 0.4) + (Activities Count × 0.3) + (Revenue Activities × 0.3)
```

#### Tool Efficiency Metrics

- **Hours Saved per Tool**: Total hours saved across all activities using the tool
- **Activity Count**: Number of activities where the tool was used
- **Revenue Generation**: Number of activities that generated revenue
- **Average Work Done**: Average percentage of work done by AI for the tool

### 4. Qualitative Benefits Analysis

#### Benefit Frequency Analysis

```
Benefit Frequency = Count of activities achieving the benefit
```

#### Associated Tools Analysis

```
Tool Association Score = Frequency of tool usage with specific benefit
```

#### Most Frequent Tool per Benefit

```
Most Frequent Tool = Tool with highest usage frequency for specific benefit
```

### 5. Correlation Insights

#### Hours Saved Leaders

```
Hours Saved Score = Total Hours Saved by Tool
```

- **Ranking**: Tools ranked by total hours saved
- **Top 3**: Most effective tools for time savings

#### Revenue Generation Leaders

```
Revenue Score = Number of Revenue-Generating Activities by Tool
```

- **Ranking**: Tools ranked by revenue-generating activities
- **Top 3**: Most effective tools for revenue generation

#### Most Beneficial to Both

```
Combined Score = (Hours Saved Score × 0.5) + (Revenue Score × 0.5)
```

- **Ranking**: Tools that excel in both time savings and revenue generation
- **Top 3**: Most versatile tools

### 6. Key Performance Indicators (KPIs)

#### Average Hours Saved per Activity

```
Average Hours Saved = Total Hours Saved / Total Activities
```

#### Revenue Generation Rate

```
Revenue Generation Rate = (Revenue-Generating Activities / Total Activities) × 100
```

#### Efficiency Gain

```
Total Efficiency Gain = Σ(Hours Saved across all activities)
```

#### AI Adoption Rate

```
AI Adoption Rate = (Activities with AI Adoption Score > 0) / Total Activities × 100
```

### 7. Data Storage and Retrieval

#### Local Storage Structure

```typescript
interface ActivityData {
  id: string;
  sdlcPhase: string;
  aiTool: string;
  aiAdoptionScore: number; // 0-5
  workDoneByAI: number; // 0-100%
  hoursSaved: number;
  revenueGenerated: boolean;
  qualitativeBenefit: string;
  // ... other fields
}
```

#### Statistical Data Structure

```typescript
interface SummaryStatistics {
  totalActivities: number;
  totalHoursSaved: number;
  revenueGenerated: number;
  highAdoption: number;
  overallAIAdoptionScore: number;
  overallWorkDoneByAI: number;
}
```

### 8. Color Coding and Visual Indicators

#### Correlation Strength Colors

- **Strong Positive** (0.7-1.0): 🟢 Green (#2e7d32)
- **Moderate Positive** (0.4-0.7): 🔵 Blue (#1976d2)
- **Weak Positive** (0.2-0.4): 🟠 Orange (#ed6c02)
- **No Correlation** (-0.2-0.2): ⚫ Gray (#757575)
- **Weak Negative** (-0.4--0.2): 🟠 Orange (#ed6c02)
- **Moderate Negative** (-0.7--0.4): 🔵 Blue (#1976d2)
- **Strong Negative** (-1.0--0.7): 🔴 Red (#d32f2f)

#### AI Adoption Score Colors

- **0 (No adoption)**: 🔴 Red (#dc3545)
- **1 (Basic awareness)**: 🟠 Orange (#fd7e14)
- **2 (Initial implementation)**: 🟡 Yellow (#ffc107)
- **3 (Moderate integration)**: 🟢 Teal (#20c997)
- **4 (Advanced usage)**: 🟢 Green (#198754)
- **5 (Leading edge)**: 🟣 Purple (#6f42c1)

### 9. Performance Considerations

#### Calculation Optimization

- **Memoization**: Statistical calculations are memoized to prevent unnecessary re-computations
- **Lazy Loading**: Dashboard components load only when needed
- **Efficient Algorithms**: O(n) complexity for most calculations

#### Data Management

- **Local Storage**: All data persisted in browser localStorage
- **Real-time Updates**: Statistics update automatically when data changes
- **Error Handling**: Graceful handling of missing or invalid data
