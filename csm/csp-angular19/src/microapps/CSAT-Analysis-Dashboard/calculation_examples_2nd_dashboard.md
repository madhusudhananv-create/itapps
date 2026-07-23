# Second Dashboard Calculation Examples - Customer Sentiment Dashboard

## Overview
This document explains how the calculated columns are computed in the **"Sentiments based on Customer feedback"** dashboard with real examples from your data.

## Dashboard Columns
- **S No.**: Serial Number (original data)
- **C_id**: Customer ID (original data)  
- **P_id**: Project ID (original data)
- **Avg Rating**: Average of all available score columns
- **Positive**: Count of positive words from comments
- **Neutral**: Count of neutral words from comments
- **Negative**: Count of negative words from comments
- **Avg Sentiment**: Overall sentiment based on compound sentiment analysis

---

## 1. Avg Rating Calculation

### Formula
```
Avg Rating = (Sum of all available score columns) ÷ (Number of available score columns)
```

### Score Columns Checked
- OVERALL_EXP
- TIMELINE_ADHERENCE
- QUALITY_OF_DELIVERY
- TIMELY_RESOURCE_FULFILLMENT
- RISK_MANAGEMENT
- THOUGHT_LEADERSHIP
- RESOURCE_COMPETENCY
- TIMELY_RESOURCE_FULFILLMENT_StaffAug

### Example 1: Record with Available Scores
**Record S No. 136:**
- RESOURCE_COMPETENCY: 5
- TIMELY_RESOURCE_FULFILLMENT_StaffAug: 5
- Other columns: undefined/null/empty

**Calculation:**
```
Available scores: [5, 5]
Sum = 5 + 5 = 10
Count = 2
Avg Rating = 10 ÷ 2 = 5.00
```

### Example 2: Record with No Scores
**Record S No. 1:**
- All score columns: undefined/null/empty

**Calculation:**
```
Available scores: []
Sum = 0
Count = 0
Avg Rating = 0.00 (default)
```

---

## 2. Positive/Neutral/Negative Word Count Calculation

### Comment Columns Analyzed
**Primary Comment Columns (for word counting):**
- OVERALL_EXP_COMMENTS
- TIMELINE_ADHERENCE_COMMENTS
- QUALITY_OF_DELIVERY_COMMENTS
- TIMELY_RESOURCE_FULFILLMENT_COMMENTS
- RISK_MANAGEMENT_COMMENTS
- THOUGHT_LEADERSHIP_COMMENTS

**Empty Comment Columns (should be empty):**
- RESOURCE_COMPETENCY_COMMENTS
- TIMELY_RESOURCE_FULFILLMENT_StaffAug_COMMENTS

### Word Lists Used

**Positive Words:**
```
['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'perfect', 'outstanding', 'superb', 'brilliant']
```

**Negative Words:**
```
['bad', 'terrible', 'awful', 'horrible', 'disappointing', 'poor', 'worst', 'frustrated', 'angry', 'upset']
```

**Neutral Words:**
```
['okay', 'fine', 'average', 'normal', 'standard', 'acceptable', 'satisfactory']
```

### Example 1: Record with Comments
**Record S No. 136:**
- OVERALL_EXP_COMMENTS: "The service was excellent and outstanding"
- TIMELINE_ADHERENCE_COMMENTS: "Good delivery on time"
- Other comment columns: empty/null

**Calculation:**
```
Comment 1: "The service was excellent and outstanding"
Words: ['the', 'service', 'was', 'excellent', 'and', 'outstanding']
Positive words: 'excellent', 'outstanding' = 2
Negative words: 0
Neutral words: 0

Comment 2: "Good delivery on time"
Words: ['good', 'delivery', 'on', 'time']
Positive words: 'good' = 1
Negative words: 0
Neutral words: 0

Total Positive: 2 + 1 = 3
Total Negative: 0
Total Neutral: 0
```

### Example 2: Record with No Comments
**Record S No. 1:**
- All comment columns: empty/null

**Calculation:**
```
Positive: 0
Negative: 0
Neutral: 0
```

### Adjustment Logic
If any of the "empty" comment columns (RESOURCE_COMPETENCY_COMMENTS, TIMELY_RESOURCE_FULFILLMENT_StaffAug_COMMENTS) contain data, the word counts are reduced by 1:

```
if (emptyCommentCount < 2) {
  positiveWords = Math.max(0, positiveWords - 1);
  negativeWords = Math.max(0, negativeWords - 1);
  neutralWords = Math.max(0, neutralWords - 1);
}
```

---

## 3. Avg Sentiment Calculation

### Formula
```
Compound Sentiment Score = (Positive Words Count ÷ Total Words) - (Negative Words Count ÷ Total Words)
Average Compound Sentiment = Σ(Compound Sentiment Scores) ÷ Number of Comments
```

### Sentiment Classification
```
if (compoundValue >= 0.1) → "Positive"
if (compoundValue <= -0.1) → "Negative"
else → "Neutral"
```

### Example 1: Positive Sentiment
**Record S No. 136 (from above):**
```
Comment 1: "The service was excellent and outstanding"
Total words: 6
Positive words: 2
Negative words: 0
Compound score = (2/6) - (0/6) = 0.333

Comment 2: "Good delivery on time"
Total words: 4
Positive words: 1
Negative words: 0
Compound score = (1/4) - (0/4) = 0.25

Average compound sentiment = (0.333 + 0.25) ÷ 2 = 0.292
Result: "Positive" (0.292 >= 0.1)
```

### Example 2: Negative Sentiment
**Hypothetical Record:**
```
Comment: "The service was terrible and disappointing"
Total words: 6
Positive words: 0
Negative words: 2
Compound score = (0/6) - (2/6) = -0.333
Result: "Negative" (-0.333 <= -0.1)
```

### Example 3: Neutral Sentiment
**Hypothetical Record:**
```
Comment: "The service was okay and fine"
Total words: 5
Positive words: 0
Negative words: 0
Neutral words: 2
Compound score = (0/5) - (0/5) = 0.0
Result: "Neutral" (0.0 is between -0.1 and 0.1)
```

---

## 4. Complete Example - Record S No. 136

### Input Data
```
S No.: 136
C_id: Test_c_Id
P_id: Test_P_Id
RESOURCE_COMPETENCY: 5
TIMELY_RESOURCE_FULFILLMENT_StaffAug: 5
OVERALL_EXP_COMMENTS: "The service was excellent and outstanding"
TIMELINE_ADHERENCE_COMMENTS: "Good delivery on time"
Other columns: empty/null
```

### Calculations

**1. Avg Rating:**
```
Available scores: [5, 5]
Avg Rating = (5 + 5) ÷ 2 = 5.00
```

**2. Word Counts:**
```
Positive words: 3 (excellent, outstanding, good)
Negative words: 0
Neutral words: 0
```

**3. Avg Sentiment:**
```
Compound scores: [0.333, 0.25]
Average compound: 0.292
Result: "Positive"
```

### Final Output
```
S No.: 136
C_id: Test_c_Id
P_id: Test_P_Id
Avg Rating: 5.00
Positive: 3
Neutral: 0
Negative: 0
Avg Sentiment: Positive
```

---

## 5. Key Differences from First Dashboard

| Aspect | First Dashboard | Second Dashboard |
|--------|----------------|------------------|
| **Avg Rating** | Same calculation | Same calculation |
| **Positive/Neutral/Negative** | Yes/No indicators based on Avg Rating | Word counts from comments |
| **Avg Sentiment** | Based on Avg Rating | Based on compound sentiment analysis |
| **Data Source** | Score columns only | Comment columns + score columns |
| **Purpose** | Rating-based sentiment | Comment-based sentiment |

---

## 6. Data Availability Note

**Important:** Since your Excel file doesn't contain the comment columns (OVERALL_EXP_COMMENTS, etc.), the current implementation shows:
- **Positive/Neutral/Negative**: All 0 (no comments to analyze)
- **Avg Sentiment**: "Neutral" (default when no comments)

To see actual sentiment analysis, you would need to add comment columns to your Excel file with customer feedback text. 