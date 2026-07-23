const XLSX = require('xlsx');
const path = require('path');

// Read the sentiment analysis word bank Excel file
const filePath = path.join(__dirname, 'data', 'Sentiment_analysis_word_bank.xlsx');

try {
  const workbook = XLSX.readFile(filePath);
  const worksheet = workbook.Sheets['Qualitative analysis'];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  // Extract headers
  const headers = jsonData[0];
  console.log('Headers:', headers);
  
  // Process data rows (skip header row)
  const sentimentData = {
    positive: {},
    negative: {},
    neutral: {}
  };
  
  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (row.length < 5) continue; // Skip incomplete rows
    
    const perspective = row[0];
    const ratingDescription = row[1];
    const positiveCategory = row[2];
    const negativeCategory = row[3];
    const neutralCategory = row[4];
    
    // Skip if no feedback text
    if (!ratingDescription || ratingDescription === 'NA' || ratingDescription.trim() === '') continue;
    
    // Process positive sentiment
    if (positiveCategory && positiveCategory.trim() !== '') {
      if (!sentimentData.positive[positiveCategory]) {
        sentimentData.positive[positiveCategory] = [];
      }
      sentimentData.positive[positiveCategory].push(ratingDescription);
    }
    
    // Process negative sentiment
    if (negativeCategory && negativeCategory.trim() !== '') {
      if (!sentimentData.negative[negativeCategory]) {
        sentimentData.negative[negativeCategory] = [];
      }
      sentimentData.negative[negativeCategory].push(ratingDescription);
    }
    
    // Process neutral sentiment
    if (neutralCategory && neutralCategory.trim() !== '') {
      if (!sentimentData.neutral[neutralCategory]) {
        sentimentData.neutral[neutralCategory] = [];
      }
      sentimentData.neutral[neutralCategory].push(ratingDescription);
    }
  }
  
  // Display results
  console.log('\n=== POSITIVE SENTIMENT CATEGORIES ===');
  Object.keys(sentimentData.positive).forEach(category => {
    console.log(`\n${category}:`);
    console.log(`  Count: ${sentimentData.positive[category].length}`);
    console.log(`  Examples: ${sentimentData.positive[category].slice(0, 3).join(' | ')}`);
  });
  
  console.log('\n=== NEGATIVE SENTIMENT CATEGORIES ===');
  Object.keys(sentimentData.negative).forEach(category => {
    console.log(`\n${category}:`);
    console.log(`  Count: ${sentimentData.negative[category].length}`);
    console.log(`  Examples: ${sentimentData.negative[category].slice(0, 3).join(' | ')}`);
  });
  
  console.log('\n=== NEUTRAL SENTIMENT CATEGORIES ===');
  Object.keys(sentimentData.neutral).forEach(category => {
    console.log(`\n${category}:`);
    console.log(`  Count: ${sentimentData.neutral[category].length}`);
    console.log(`  Examples: ${sentimentData.neutral[category].slice(0, 3).join(' | ')}`);
  });
  
  // Save to JSON file for use in the application
  const fs = require('fs');
  fs.writeFileSync('sentiment_keywords.json', JSON.stringify(sentimentData, null, 2));
  console.log('\nSentiment data saved to sentiment_keywords.json');
  
} catch (error) {
  console.error('Error reading Excel file:', error);
}
