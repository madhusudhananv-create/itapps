const XLSX = require('xlsx');
const path = require('path');

// Load the Excel file
const filePath = path.join(__dirname, 'data', 'customer_feedback_analysis.xlsx');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

// Find the specific project
const targetProject = data.find(row => row.proj_id === '202P001210');

if (!targetProject) {
  console.log('Project ID "202P001210" not found in the data.');
  process.exit(1);
}

console.log('=== PROJECT 202P001210 ANALYSIS ===\n');

// 1. Raw Data
console.log('RAW DATA:');
console.log('S No.:', targetProject['S No.']);
console.log('cust_id:', targetProject['cust_id']);
console.log('proj_id:', targetProject['proj_id']);
console.log('OVERALL_EXP:', targetProject['OVERALL_EXP']);
console.log('TIMELY_RESOURCE_FULFILLMENT:', targetProject['TIMELY_RESOURCE_FULFILLMENT']);
console.log('RESOURCE_COMPETENCY:', targetProject['RESOURCE_COMPETENCY']);
console.log('');

// 2. Avg Rating Calculation
const scores = [];
if (targetProject['OVERALL_EXP']) scores.push(Number(targetProject['OVERALL_EXP']));
if (targetProject['TIMELY_RESOURCE_FULFILLMENT']) scores.push(Number(targetProject['TIMELY_RESOURCE_FULFILLMENT']));
if (targetProject['RESOURCE_COMPETENCY']) scores.push(Number(targetProject['RESOURCE_COMPETENCY']));

const avgRating = scores.length > 0 ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2) : '0.00';

console.log('AVG RATING CALCULATION:');
console.log('Scores found:', scores);
console.log('Average Rating:', avgRating);
console.log('');

// 3. Avg Sentiment Calculation
const numRating = parseFloat(avgRating);
let avgSentiment = 'Neutral';
let isPositive = false;
let isNeutral = false;
let isNegative = false;

if (numRating >= 4.0) {
  avgSentiment = 'Positive';
  isPositive = true;
} else if (numRating <= 2.0) {
  avgSentiment = 'Negative';
  isNegative = true;
} else {
  avgSentiment = 'Neutral';
  isNeutral = true;
}

console.log('AVG SENTIMENT CALCULATION:');
console.log('Rating:', numRating);
console.log('Sentiment:', avgSentiment);
console.log('Is Positive:', isPositive);
console.log('Is Neutral:', isNeutral);
console.log('Is Negative:', isNegative);
console.log('');

// 4. Comment Analysis
const positiveKeywords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'perfect', 'outstanding', 'superb', 'brilliant', 'satisfied', 'happy', 'pleased', 'impressed', 'delighted', 'thrilled', 'ecstatic', 'overjoyed', 'content', 'grateful'];
const negativeKeywords = ['bad', 'terrible', 'awful', 'horrible', 'disappointing', 'poor', 'worst', 'frustrated', 'angry', 'upset', 'dissatisfied', 'unhappy', 'displeased', 'annoyed', 'irritated', 'furious', 'livid', 'disgusted', 'disappointed', 'let down'];

let positiveWords = 0;
let negativeWords = 0;
let totalComments = 0;
let compoundScores = [];

// Check comment columns
const commentColumns = ['TIMELY_RESOURCE_FULFILLMENT_COMMENTS', 'RESOURCE_COMPETENCY_COMMENTS'];

commentColumns.forEach(column => {
  const comment = targetProject[column];
  if (comment && comment !== '' && comment !== 'N/A') {
    totalComments++;
    console.log(`COMMENT (${column}):`, comment);
    
    const words = comment.toLowerCase().split(' ').filter(word => word.length > 0);
    const positiveWordCount = words.filter(word => positiveKeywords.includes(word)).length;
    const negativeWordCount = words.filter(word => negativeKeywords.includes(word)).length;
    
    positiveWords += positiveWordCount;
    negativeWords += negativeWordCount;
    
    console.log(`  Positive words: ${positiveWordCount}`);
    console.log(`  Negative words: ${negativeWordCount}`);
    
    // Calculate compound sentiment score
    const totalMeaningfulWords = words.length;
    if (totalMeaningfulWords > 0) {
      const compoundScore = (positiveWordCount / totalMeaningfulWords) - (negativeWordCount / totalMeaningfulWords);
      compoundScores.push(compoundScore);
      console.log(`  Compound Score: ${compoundScore.toFixed(3)}`);
    }
    console.log('');
  }
});

// Calculate average compound sentiment
const avgCompoundSentiment = compoundScores.length > 0 
  ? (compoundScores.reduce((sum, score) => sum + score, 0) / compoundScores.length).toFixed(3)
  : '0.000';

console.log('COMMENT ANALYSIS SUMMARY:');
console.log('Total Comments:', totalComments);
console.log('Total Positive Words:', positiveWords);
console.log('Total Negative Words:', negativeWords);
console.log('Average Compound Sentiment:', avgCompoundSentiment);

// Determine customer sentiment
let customerAvgSentiment = 'Neutral';
const compoundValue = parseFloat(avgCompoundSentiment);
if (compoundValue >= 0.1) {
  customerAvgSentiment = 'Positive';
} else if (compoundValue <= -0.1) {
  customerAvgSentiment = 'Negative';
}

console.log('Customer Avg Sentiment:', customerAvgSentiment);
console.log('');

// 5. Status Calculation
const totalWords = positiveWords + negativeWords;
const positivePercentage = totalWords > 0 ? (positiveWords / totalWords) * 100 : 0;
const negativePercentage = totalWords > 0 ? (negativeWords / totalWords) * 100 : 0;
const hasNegativeComment = compoundScores.some(score => score < -0.1);

console.log('STATUS CALCULATION:');
console.log('Positive Percentage:', positivePercentage.toFixed(1) + '%');
console.log('Negative Percentage:', negativePercentage.toFixed(1) + '%');
console.log('Has Negative Comment:', hasNegativeComment);

let status = 'Monitor | Improve'; // Default

// Status 1: Healthy | Reference
if (compoundValue >= 0.3 && 
    parseFloat(avgRating) >= 4.5 && 
    positivePercentage >= 80 && 
    negativePercentage <= 10) {
  status = 'Healthy | Reference';
}
// Status 2: At Risk | Immediate
else if ((compoundValue <= 0.0 && parseFloat(avgRating) <= 3.0 && negativePercentage >= 30) || 
         hasNegativeComment) {
  status = 'At Risk | Immediate';
}
// Status 3: Monitor | Improve
else if (compoundValue >= 0.0 && compoundValue < 0.3 && 
         parseFloat(avgRating) >= 3.0 && parseFloat(avgRating) < 4.5) {
  status = 'Monitor | Improve';
}

console.log('Final Status:', status);
console.log('');

// 6. Final Results
console.log('=== FINAL RESULTS ===');
console.log('Avg Rating:', avgRating);
console.log('Avg Sentiment:', avgSentiment);
console.log('Positive:', isPositive ? 'Yes' : 'No');
console.log('Neutral:', isNeutral ? 'Yes' : 'No');
console.log('Negative:', isNegative ? 'Yes' : 'No');
console.log('Status:', status);
console.log('Customer Avg Sentiment:', customerAvgSentiment);
console.log('Compound Sentiment:', avgCompoundSentiment); 