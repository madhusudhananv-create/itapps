const XLSX = require('xlsx');
const path = require('path');

// Load the Excel file
const filePath = path.join(__dirname, 'data', 'customer_feedback_analysis.xlsx');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('🔍 Analyzing Project ID: 202P001210');
console.log('=====================================\n');

// Find the specific project
const targetProject = data.find(row => row.proj_id === '202P001210');

if (!targetProject) {
  console.log('❌ Project ID "202P001210" not found in the data.');
  console.log('\n📋 Available Project IDs:');
  const uniqueProjects = [...new Set(data.map(row => row.proj_id).filter(id => id))];
  uniqueProjects.slice(0, 10).forEach(id => console.log(`  - ${id}`));
  if (uniqueProjects.length > 10) {
    console.log(`  ... and ${uniqueProjects.length - 10} more`);
  }
  process.exit(1);
}

console.log('✅ Found Project ID: 202P001210');
console.log('\n📊 Raw Data:');
console.log('============');
Object.entries(targetProject).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});

console.log('\n🧮 Calculation Breakdown:');
console.log('========================');

// Extract score columns
const scoreColumns = [
  'OVERALL_EXP',
  'TIMELY_RESOURCE_FULFILLMENT',
  'RESOURCE_COMPETENCY'
];

const scores = [];
const availableColumns = [];

console.log('\n1️⃣ **Avg Rating Calculation:**');
console.log('-----------------------------');
scoreColumns.forEach(column => {
  if (targetProject[column] !== undefined && targetProject[column] !== null && targetProject[column] !== '') {
    const score = Number(targetProject[column]);
    if (!isNaN(score)) {
      scores.push(score);
      availableColumns.push(column);
      console.log(`  ${column}: ${score}`);
    }
  }
});

const avgRating = scores.length > 0 ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2) : '0.00';
console.log(`  📊 Average Rating: ${avgRating} (from ${scores.length} scores)`);

console.log('\n2️⃣ **Avg Sentiment Calculation:**');
console.log('--------------------------------');
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

console.log(`  📊 Rating: ${numRating}`);
console.log(`  📊 Sentiment: ${avgSentiment}`);
console.log(`  📊 Is Positive: ${isPositive}`);
console.log(`  📊 Is Neutral: ${isNeutral}`);
console.log(`  📊 Is Negative: ${isNegative}`);

console.log('\n3️⃣ **Comment Analysis:**');
console.log('----------------------');
const commentColumns = [
  'TIMELY_RESOURCE_FULFILLMENT_COMMENTS',
  'RESOURCE_COMPETENCY_COMMENTS'
];

let positiveWords = 0;
let negativeWords = 0;
let neutralWords = 0;
let totalComments = 0;
let compoundScores = [];

const positiveKeywords = [
  'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'perfect', 
  'outstanding', 'superb', 'brilliant', 'satisfied', 'happy', 'pleased', 
  'impressed', 'delighted', 'thrilled', 'ecstatic', 'overjoyed', 'content', 'grateful'
];

const negativeKeywords = [
  'bad', 'terrible', 'awful', 'horrible', 'disappointing', 'poor', 'worst', 
  'frustrated', 'angry', 'upset', 'dissatisfied', 'unhappy', 'displeased', 
  'annoyed', 'irritated', 'furious', 'livid', 'disgusted', 'disappointed', 'let down'
];

const neutralKeywords = [
  'okay', 'fine', 'average', 'normal', 'standard', 'acceptable', 'satisfactory', 
  'adequate', 'decent', 'reasonable', 'moderate', 'fair', 'tolerable', 'passable', 'mediocre'
];

commentColumns.forEach(column => {
  const comment = targetProject[column];
  if (comment && comment !== '' && comment !== 'N/A') {
    totalComments++;
    console.log(`  📝 ${column}: "${comment}"`);
    
    const words = comment.toLowerCase().split(' ').filter(word => word.length > 0);
    const positiveWordCount = words.filter(word => positiveKeywords.includes(word)).length;
    const negativeWordCount = words.filter(word => negativeKeywords.includes(word)).length;
    const neutralWordCount = words.filter(word => neutralKeywords.includes(word)).length;
    
    positiveWords += positiveWordCount;
    negativeWords += negativeWordCount;
    neutralWords += neutralWordCount;
    
    console.log(`    ✅ Positive words: ${positiveWordCount}`);
    console.log(`    ❌ Negative words: ${negativeWordCount}`);
    console.log(`    ⚪ Neutral words: ${neutralWordCount}`);
    
    // Calculate compound sentiment score for this comment
    const totalMeaningfulWords = words.length;
    if (totalMeaningfulWords > 0) {
      const compoundScore = (positiveWordCount / totalMeaningfulWords) - (negativeWordCount / totalMeaningfulWords);
      compoundScores.push(compoundScore);
      console.log(`    📊 Compound Score: ${compoundScore.toFixed(3)}`);
    }
  }
});

console.log(`\n  📊 Total Comments: ${totalComments}`);
console.log(`  📊 Total Positive Words: ${positiveWords}`);
console.log(`  📊 Total Negative Words: ${negativeWords}`);
console.log(`  📊 Total Neutral Words: ${neutralWords}`);

// Calculate average compound sentiment
const avgCompoundSentiment = compoundScores.length > 0 
  ? (compoundScores.reduce((sum, score) => sum + score, 0) / compoundScores.length).toFixed(3)
  : '0.000';

console.log(`  📊 Average Compound Sentiment: ${avgCompoundSentiment}`);

// Determine overall sentiment based on compound score
let customerAvgSentiment = 'Neutral';
const compoundValue = parseFloat(avgCompoundSentiment);
if (compoundValue >= 0.1) {
  customerAvgSentiment = 'Positive';
} else if (compoundValue <= -0.1) {
  customerAvgSentiment = 'Negative';
}

console.log(`  📊 Customer Avg Sentiment: ${customerAvgSentiment}`);

console.log('\n4️⃣ **Status Calculation:**');
console.log('-------------------------');
// Calculate percentages for comment analysis
const totalWords = positiveWords + negativeWords + neutralWords;
const positivePercentage = totalWords > 0 ? (positiveWords / totalWords) * 100 : 0;
const negativePercentage = totalWords > 0 ? (negativeWords / totalWords) * 100 : 0;

console.log(`  📊 Positive Percentage: ${positivePercentage.toFixed(1)}%`);
console.log(`  📊 Negative Percentage: ${negativePercentage.toFixed(1)}%`);

// Check for any single negative sentiment comment
const hasNegativeComment = compoundScores.some(score => score < -0.1);
console.log(`  📊 Has Negative Comment: ${hasNegativeComment}`);

// Status calculation
let status = 'Monitor | Improve'; // Default status

// Status 1: Healthy | Reference
if (compoundValue >= 0.3 && 
    parseFloat(avgRating) >= 4.5 && 
    positivePercentage >= 80 && 
    negativePercentage <= 10) {
  status = 'Healthy | Reference';
  console.log(`  ✅ Status: ${status} (All criteria met)`);
}
// Status 2: At Risk | Immediate
else if ((compoundValue <= 0.0 && parseFloat(avgRating) <= 3.0 && negativePercentage >= 30) || 
         hasNegativeComment) {
  status = 'At Risk | Immediate';
  console.log(`  ❌ Status: ${status} (Risk criteria met)`);
}
// Status 3: Monitor | Improve (default case)
else if (compoundValue >= 0.0 && compoundValue < 0.3 && 
         parseFloat(avgRating) >= 3.0 && parseFloat(avgRating) < 4.5) {
  status = 'Monitor | Improve';
  console.log(`  ⚠️ Status: ${status} (Monitor criteria met)`);
}
else {
  console.log(`  ⚠️ Status: ${status} (Default case)`);
}

console.log('\n📋 **Final Results for Project 202P001210:**');
console.log('============================================');
console.log(`  📊 Avg Rating: ${avgRating}`);
console.log(`  📊 Avg Sentiment: ${avgSentiment}`);
console.log(`  📊 Positive: ${isPositive ? 'Yes' : 'No'}`);
console.log(`  📊 Neutral: ${isNeutral ? 'Yes' : 'No'}`);
console.log(`  📊 Negative: ${isNegative ? 'Yes' : 'No'}`);
console.log(`  📊 Status: ${status}`);
console.log(`  📊 Customer Avg Sentiment: ${customerAvgSentiment}`);
console.log(`  📊 Compound Sentiment: ${avgCompoundSentiment}`); 