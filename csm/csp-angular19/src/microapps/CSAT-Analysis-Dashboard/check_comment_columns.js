const XLSX = require('xlsx');

console.log('🔍 Checking for Comment Columns in Excel File...');
console.log('📁 File: C:\\Users\\vijaya.verma\\CSAT analysis dashboard\\data\\customer_feedback_analysis.xlsx');

try {
  const workbook = XLSX.readFile('data/customer_feedback_analysis.xlsx');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  console.log(`📋 Total Records: ${data.length}`);
  
  if (data.length === 0) {
    console.log('❌ No data found in Excel file');
    process.exit(1);
  }

  const firstRecord = data[0];
  const allColumns = Object.keys(firstRecord);
  
  console.log('\n📋 All Available Columns:');
  console.log('==================================================');
  allColumns.forEach((column, index) => {
    console.log(`${index + 1}. ${column}`);
  });

  // Check for comment columns
  const expectedCommentColumns = [
    'OVERALL_EXP_COMMENTS',
    'TIMELINE_ADHERENCE_COMMENTS',
    'QUALITY_OF_DELIVERY_COMMENTS',
    'TIMELY_RESOURCE_FULFILLMENT_COMMENTS',
    'RISK_MANAGEMENT_COMMENTS',
    'THOUGHT_LEADERSHIP_COMMENTS',
    'RESOURCE_COMPETENCY_COMMENTS',
    'TIMELY_RESOURCE_FULFILLMENT_StaffAug_COMMENTS'
  ];

  console.log('\n🔍 Checking for Expected Comment Columns:');
  console.log('==================================================');
  
  const foundCommentColumns = [];
  const missingCommentColumns = [];

  expectedCommentColumns.forEach(column => {
    if (allColumns.includes(column)) {
      foundCommentColumns.push(column);
      console.log(`✅ ${column}: Found`);
    } else {
      missingCommentColumns.push(column);
      console.log(`❌ ${column}: Missing`);
    }
  });

  console.log('\n📊 Comment Column Analysis:');
  console.log('==================================================');
  console.log(`✅ Found: ${foundCommentColumns.length} comment columns`);
  console.log(`❌ Missing: ${missingCommentColumns.length} comment columns`);

  if (foundCommentColumns.length > 0) {
    console.log('\n📋 Found Comment Columns:');
    foundCommentColumns.forEach(column => console.log(`  - ${column}`));
    
    console.log('\n📊 Sample Comment Data (First 3 records):');
    console.log('==================================================');
    
    data.slice(0, 3).forEach((record, index) => {
      console.log(`Record ${index + 1}:`);
      foundCommentColumns.forEach(column => {
        const value = record[column];
        const displayValue = value ? `"${value}"` : 'empty/null';
        console.log(`  ${column}: ${displayValue}`);
      });
      console.log('');
    });

    // Test sentiment calculation logic
    console.log('🧮 Testing Sentiment Calculation Logic:');
    console.log('==================================================');
    
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'perfect', 'outstanding', 'superb', 'brilliant'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disappointing', 'poor', 'worst', 'frustrated', 'angry', 'upset'];
    const neutralWords = ['okay', 'fine', 'average', 'normal', 'standard', 'acceptable', 'satisfactory'];

    data.slice(0, 3).forEach((record, index) => {
      console.log(`\nRecord ${index + 1} Sentiment Analysis:`);
      
      let totalPositive = 0;
      let totalNegative = 0;
      let totalNeutral = 0;
      let totalComments = 0;
      let compoundScores = [];

      // Primary comment columns (for word counting)
      const primaryCommentColumns = [
        'OVERALL_EXP_COMMENTS',
        'TIMELINE_ADHERENCE_COMMENTS',
        'QUALITY_OF_DELIVERY_COMMENTS',
        'TIMELY_RESOURCE_FULFILLMENT_COMMENTS',
        'RISK_MANAGEMENT_COMMENTS',
        'THOUGHT_LEADERSHIP_COMMENTS'
      ];

      // Empty comment columns (should be empty)
      const emptyCommentColumns = [
        'RESOURCE_COMPETENCY_COMMENTS',
        'TIMELY_RESOURCE_FULFILLMENT_StaffAug_COMMENTS'
      ];

      primaryCommentColumns.forEach(column => {
        const comment = record[column];
        if (comment && comment !== '' && comment !== 'N/A') {
          totalComments++;
          const words = comment.toLowerCase().split(' ');
          const positiveWordCount = words.filter(word => positiveWords.includes(word)).length;
          const negativeWordCount = words.filter(word => negativeWords.includes(word)).length;
          const neutralWordCount = words.filter(word => neutralWords.includes(word)).length;
          
          totalPositive += positiveWordCount;
          totalNegative += negativeWordCount;
          totalNeutral += neutralWordCount;
          
          const totalWords = words.length;
          if (totalWords > 0) {
            const compoundScore = (positiveWordCount / totalWords) - (negativeWordCount / totalWords);
            compoundScores.push(compoundScore);
          }
          
          console.log(`  ${column}: "${comment}"`);
          console.log(`    Words: ${words.length}, Positive: ${positiveWordCount}, Negative: ${negativeWordCount}, Neutral: ${neutralWordCount}`);
        }
      });

      // Check empty comment columns
      const emptyCommentCount = emptyCommentColumns.filter(column => 
        !record[column] || record[column] === '' || record[column] === 'N/A'
      ).length;
      
      if (emptyCommentCount < emptyCommentColumns.length) {
        console.log(`  ⚠️  Some empty comment columns have data, adjusting counts...`);
        totalPositive = Math.max(0, totalPositive - 1);
        totalNegative = Math.max(0, totalNegative - 1);
        totalNeutral = Math.max(0, totalNeutral - 1);
      }

      const avgCompoundSentiment = compoundScores.length > 0 
        ? (compoundScores.reduce((sum, score) => sum + score, 0) / compoundScores.length).toFixed(3)
        : '0.000';
      
      let customerAvgSentiment = 'Neutral';
      const compoundValue = parseFloat(avgCompoundSentiment);
      if (compoundValue >= 0.1) {
        customerAvgSentiment = 'Positive';
      } else if (compoundValue <= -0.1) {
        customerAvgSentiment = 'Negative';
      }

      console.log(`  📊 Results:`);
      console.log(`    Positive words: ${totalPositive}`);
      console.log(`    Negative words: ${totalNegative}`);
      console.log(`    Neutral words: ${totalNeutral}`);
      console.log(`    Compound scores: [${compoundScores.map(s => s.toFixed(3)).join(', ')}]`);
      console.log(`    Average compound: ${avgCompoundSentiment}`);
      console.log(`    Final sentiment: ${customerAvgSentiment}`);
    });

  } else {
    console.log('\n❌ No comment columns found in the Excel file');
    console.log('💡 Make sure the comment columns exist in your Excel file with the exact names:');
    expectedCommentColumns.forEach(column => console.log(`  - ${column}`));
  }

} catch (error) {
  console.error('❌ Error reading Excel file:', error.message);
  process.exit(1);
} 