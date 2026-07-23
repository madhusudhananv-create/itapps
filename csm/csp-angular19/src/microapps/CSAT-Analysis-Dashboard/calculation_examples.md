# Dashboard Calculation Examples

## Overview
This document explains how the calculated columns are computed in the CSAT Analysis Dashboard with real examples from your data.

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

### Example 2: Record with No Available Scores
**Record S No. 1:**
- RESOURCE_COMPETENCY: undefined
- TIMELY_RESOURCE_FULFILLMENT_StaffAug: undefined
- All other columns: undefined/null/empty

**Calculation:**
```
Available scores: []
Sum = 0
Count = 0
Avg Rating = 0.00 (default when no scores available)
```

### Example 3: Record with Mixed Data
**Record S No. 2:**
- RESOURCE_COMPETENCY: 3
- TIMELY_RESOURCE_FULFILLMENT_StaffAug: undefined
- All other columns: undefined/null/empty

**Calculation:**
```
Available scores: [3]
Sum = 3
Count = 1
Avg Rating = 3 ÷ 1 = 3.00
```

---

## 2. Avg Sentiment Calculation (Based on Avg Rating)

### Formula
```
If Avg Rating >= 4.0: Sentiment = "Positive"
If Avg Rating <= 2.0: Sentiment = "Negative"
Else: Sentiment = "Neutral"
```

### Examples

**Record S No. 136:**
- Avg Rating: 5.00
- Since 5.00 >= 4.0: **Avg Sentiment = "Positive"**

**Record S No. 1:**
- Avg Rating: 0.00
- Since 0.00 <= 2.0: **Avg Sentiment = "Negative"**

**Record S No. 2:**
- Avg Rating: 3.00
- Since 2.0 < 3.00 < 4.0: **Avg Sentiment = "Neutral"**

---

## 3. Positive, Neutral, Negative Indicators

### Formula
These are Yes/No indicators based on the Avg Sentiment:
```
If Avg Sentiment = "Positive": Positive = "Yes", Neutral = "No", Negative = "No"
If Avg Sentiment = "Neutral": Positive = "No", Neutral = "Yes", Negative = "No"
If Avg Sentiment = "Negative": Positive = "No", Neutral = "No", Negative = "Yes"
```

### Examples

**Record S No. 136:**
- Avg Sentiment: "Positive"
- **Positive = "Yes"**
- **Neutral = "No"**
- **Negative = "No"**

**Record S No. 1:**
- Avg Sentiment: "Negative"
- **Positive = "No"**
- **Neutral = "No"**
- **Negative = "Yes"**

**Record S No. 2:**
- Avg Sentiment: "Neutral"
- **Positive = "No"**
- **Neutral = "Yes"**
- **Negative = "No"**

---

## 4. Customer Sentiment Analysis (Second Dashboard)

### Comment Columns Analyzed
**Primary Comment Columns:**
- OVERALL_EXP_COMMENTS
- TIMELINE_ADHERENCE_COMMENTS
- QUALITY_OF_DELIVERY_COMMENTS
- TIMELY_RESOURCE_FULFILLMENT_COMMENTS
- RISK_MANAGEMENT_COMMENTS
- THOUGHT_LEADERSHIP_COMMENTS

**Empty Comment Columns (should be empty):**
- RESOURCE_COMPETENCY_COMMENTS
- TIMELY_RESOURCE_FULFILLMENT_StaffAug_COMMENTS

### Word Analysis

**Positive Words:**
- good, great, excellent, amazing, wonderful, fantastic, perfect, outstanding, superb, brilliant

**Negative Words:**
- bad, terrible, awful, horrible, disappointing, poor, worst, frustrated, angry, upset

**Neutral Words:**
- okay, fine, average, normal, standard, acceptable, satisfactory

### Example Calculation

**Record S No. 136:**
- OVERALL_EXP_COMMENTS: "The service was excellent and outstanding"
- TIMELINE_ADHERENCE_COMMENTS: "Good delivery on time"
- Other comment columns: empty/undefined

**Word Analysis:**
```
OVERALL_EXP_COMMENTS: "The service was excellent and outstanding"
Words: ["the", "service", "was", "excellent", "and", "outstanding"]
Positive words: "excellent", "outstanding" (2 words)
Negative words: 0
Neutral words: 0

TIMELINE_ADHERENCE_COMMENTS: "Good delivery on time"
Words: ["good", "delivery", "on", "time"]
Positive words: "good" (1 word)
Negative words: 0
Neutral words: 0

Total Positive Words = 2 + 1 = 3
Total Negative Words = 0
Total Neutral Words = 0
```

**Final Values:**
- **Customer_Positive: "3"**
- **Customer_Neutral: "0"**
- **Customer_Negative: "0"**

### Compound Sentiment Score Calculation

**Formula:**
```
Compound Score = (Positive Words Count ÷ Total Words) - (Negative Words Count ÷ Total Words)
```

**Example for Record S No. 136:**
```
Total Words = 6 + 4 = 10
Positive Words = 3
Negative Words = 0

Compound Score = (3 ÷ 10) - (0 ÷ 10) = 0.3 - 0 = 0.3
```

**Avg Sentiment Determination:**
```
If Compound Score >= 0.1: "Positive"
If Compound Score <= -0.1: "Negative"
Else: "Neutral"

For 0.3: Since 0.3 >= 0.1, Customer_Avg_Sentiment = "Positive"
```

---

## 5. Complete Example Summary

### Record S No. 136 (Test Data)
```
Original Data:
- S No.: 136
- C_id: Test_c_Id
- P_id: Test_P_Id
- RESOURCE_COMPETENCY: 5
- TIMELY_RESOURCE_FULFILLMENT_StaffAug: 5
- OVERALL_EXP_COMMENTS: "The service was excellent and outstanding"
- TIMELINE_ADHERENCE_COMMENTS: "Good delivery on time"

Calculated Values:
- Avg Rating: 5.00 (from (5+5)/2)
- Avg Sentiment: "Positive" (from 5.00 >= 4.0)
- Positive: "Yes" (from Positive sentiment)
- Neutral: "No" (from Positive sentiment)
- Negative: "No" (from Positive sentiment)
- Customer_Positive: "3" (from word count)
- Customer_Neutral: "0" (from word count)
- Customer_Negative: "0" (from word count)
- Customer_Avg_Sentiment: "Positive" (from compound score 0.3)
```

### Record S No. 1 (Real Data)
```
Original Data:
- S No.: 1
- C_id: 202100129
- P_id: 202P001243
- RESOURCE_COMPETENCY: undefined
- TIMELY_RESOURCE_FULFILLMENT_StaffAug: undefined
- All comment columns: empty/undefined

Calculated Values:
- Avg Rating: 0.00 (no available scores)
- Avg Sentiment: "Negative" (from 0.00 <= 2.0)
- Positive: "No" (from Negative sentiment)
- Neutral: "No" (from Negative sentiment)
- Negative: "Yes" (from Negative sentiment)
- Customer_Positive: "0" (no comments)
- Customer_Neutral: "0" (no comments)
- Customer_Negative: "0" (no comments)
- Customer_Avg_Sentiment: "Neutral" (no compound score)
```

---

## Notes

1. **Missing Data Handling**: When columns are undefined, null, or empty, they are excluded from calculations.

2. **Default Values**: When no data is available, default values are used (e.g., 0.00 for Avg Rating).

3. **Comment Analysis**: Since your Excel file doesn't contain actual comment data, the comment analysis is currently showing zeros, but the calculation logic is in place for when comment data becomes available.

4. **Rounding**: Avg Rating is rounded to 2 decimal places, and compound sentiment scores are rounded to 3 decimal places.

5. **Color Coding**: 
   - Positive values are shown in green (#059669)
   - Negative values are shown in red (#dc2626)
   - Neutral values are shown in gray (#6b7280) 