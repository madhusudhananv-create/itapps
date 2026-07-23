const XLSX = require('xlsx');
const path = require('path');

console.log('🔍 Comprehensive Excel File Analysis...');
console.log('📁 File: C:\\Users\\vijaya.verma\\CSAT analysis dashboard\\data\\customer_feedback_analysis.xlsx');

try {
  const filePath = 'data/customer_feedback_analysis.xlsx';
  
  // Check if file exists
  const fs = require('fs');
  if (!fs.existsSync(filePath)) {
    console.log('❌ File not found at:', path.resolve(filePath));
    process.exit(1);
  }
  
  console.log('✅ File found at:', path.resolve(filePath));
  
  const workbook = XLSX.readFile(filePath);
  const sheetNames = workbook.SheetNames;
  
  console.log(`\n📋 Total Sheets: ${sheetNames.length}`);
  console.log('Sheet Names:', sheetNames);
  
  // Analyze each sheet
  sheetNames.forEach((sheetName, sheetIndex) => {
    console.log(`\n📊 Analyzing Sheet ${sheetIndex + 1}: "${sheetName}"`);
    console.log('==================================================');
    
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📋 Records in this sheet: ${data.length}`);
    
    if (data.length === 0) {
      console.log('❌ No data found in this sheet');
      return;
    }
    
    const firstRecord = data[0];
    const allColumns = Object.keys(firstRecord);
    
    console.log(`\n📋 All Columns in "${sheetName}" (${allColumns.length} columns):`);
    console.log('==================================================');
    allColumns.forEach((column, index) => {
      console.log(`${index + 1}. ${column}`);
    });
    
    // Look for comment-related columns (case insensitive)
    const commentKeywords = ['COMMENT', 'COMMENTS', 'FEEDBACK', 'REVIEW', 'NOTE', 'TEXT'];
    const foundCommentColumns = [];
    
    allColumns.forEach(column => {
      const upperColumn = column.toUpperCase();
      commentKeywords.forEach(keyword => {
        if (upperColumn.includes(keyword)) {
          foundCommentColumns.push(column);
        }
      });
    });
    
    if (foundCommentColumns.length > 0) {
      console.log(`\n🎯 Found ${foundCommentColumns.length} potential comment columns:`);
      foundCommentColumns.forEach(column => console.log(`  - ${column}`));
      
      // Show sample data for comment columns
      console.log('\n📊 Sample Comment Data (First 2 records):');
      console.log('==================================================');
      
      data.slice(0, 2).forEach((record, index) => {
        console.log(`Record ${index + 1}:`);
        foundCommentColumns.forEach(column => {
          const value = record[column];
          const displayValue = value ? `"${value}"` : 'empty/null';
          console.log(`  ${column}: ${displayValue}`);
        });
        console.log('');
      });
    } else {
      console.log('\n❌ No comment-related columns found in this sheet');
    }
    
    // Check for exact expected comment column names
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
    
    console.log('\n🔍 Checking for Exact Expected Comment Column Names:');
    console.log('==================================================');
    
    const exactMatches = [];
    const partialMatches = [];
    
    expectedCommentColumns.forEach(expectedColumn => {
      if (allColumns.includes(expectedColumn)) {
        exactMatches.push(expectedColumn);
        console.log(`✅ ${expectedColumn}: Exact match`);
      } else {
        // Check for partial matches
        const upperExpected = expectedColumn.toUpperCase();
        const partialMatch = allColumns.find(col => 
          col.toUpperCase().includes(upperExpected.replace('_COMMENTS', '')) ||
          col.toUpperCase().includes('COMMENTS')
        );
        
        if (partialMatch) {
          partialMatches.push({ expected: expectedColumn, found: partialMatch });
          console.log(`⚠️  ${expectedColumn}: Partial match found as "${partialMatch}"`);
        } else {
          console.log(`❌ ${expectedColumn}: Not found`);
        }
      }
    });
    
    if (exactMatches.length > 0) {
      console.log(`\n✅ Found ${exactMatches.length} exact matches!`);
      exactMatches.forEach(column => console.log(`  - ${column}`));
    }
    
    if (partialMatches.length > 0) {
      console.log(`\n⚠️  Found ${partialMatches.length} partial matches:`);
      partialMatches.forEach(match => {
        console.log(`  Expected: ${match.expected} → Found: ${match.found}`);
      });
    }
  });
  
  console.log('\n🎯 SUMMARY:');
  console.log('==================================================');
  console.log('If you have comment columns but they are not being detected, possible reasons:');
  console.log('1. Column names might be slightly different (check spelling, case, spaces)');
  console.log('2. Comment columns might be in a different sheet');
  console.log('3. Excel file might have formatting issues');
  console.log('4. File path might be incorrect');
  
} catch (error) {
  console.error('❌ Error reading Excel file:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
} 