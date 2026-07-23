const XLSX = require('xlsx');
const fs = require('fs');

console.log('🔧 Adding Comment Columns to Excel File...');
console.log('📁 File: C:\\Users\\vijaya.verma\\CSAT analysis dashboard\\data\\customer_feedback_analysis.xlsx');

try {
  const filePath = 'data/customer_feedback_analysis.xlsx';
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log('❌ File not found at:', filePath);
    process.exit(1);
  }
  
  console.log('✅ File found, reading existing data...');
  
  // Read existing Excel file
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  console.log(`📋 Existing records: ${data.length}`);
  console.log('📋 Existing columns:', Object.keys(data[0] || {}));
  
  // Define the comment columns to add
  const commentColumns = [
    'OVERALL_EXP_COMMENTS',
    'TIMELINE_ADHERENCE_COMMENTS',
    'QUALITY_OF_DELIVERY_COMMENTS',
    'TIMELY_RESOURCE_FULFILLMENT_COMMENTS',
    'RISK_MANAGEMENT_COMMENTS',
    'THOUGHT_LEADERSHIP_COMMENTS',
    'RESOURCE_COMPETENCY_COMMENTS',
    'TIMELY_RESOURCE_FULFILLMENT_StaffAug_COMMENTS'
  ];
  
  console.log('\n📝 Adding comment columns with sample data...');
  
  // Add comment columns to each record
  const enhancedData = data.map((record, index) => {
    const enhancedRecord = { ...record };
    
    // Add comment columns with sample data based on existing scores
    commentColumns.forEach(column => {
      // Generate sample comments based on existing data
      const resourceScore = record.RESOURCE_COMPETENCY || 0;
      const staffAugScore = record.TIMELY_RESOURCE_FULFILLMENT_StaffAug || 0;
      
      // Generate appropriate comments based on scores
      let sampleComment = '';
      
      if (column === 'RESOURCE_COMPETENCY_COMMENTS' || column === 'TIMELY_RESOURCE_FULFILLMENT_StaffAug_COMMENTS') {
        // These should be empty according to your requirements
        sampleComment = '';
      } else {
        // Generate sample comments for other columns
        const avgScore = (resourceScore + staffAugScore) / 2;
        
        if (avgScore >= 4) {
          sampleComment = 'Excellent service and outstanding performance. Very satisfied with the quality and delivery.';
        } else if (avgScore >= 3) {
          sampleComment = 'Good service overall. Satisfactory performance with room for improvement.';
        } else if (avgScore >= 2) {
          sampleComment = 'Average service. Some areas need attention and improvement.';
        } else if (avgScore >= 1) {
          sampleComment = 'Below average performance. Several issues need to be addressed.';
        } else {
          sampleComment = 'Poor service quality. Significant improvements required.';
        }
      }
      
      enhancedRecord[column] = sampleComment;
    });
    
    return enhancedRecord;
  });
  
  console.log('✅ Comment columns added successfully!');
  
  // Create new workbook with enhanced data
  const newWorkbook = XLSX.utils.book_new();
  const newWorksheet = XLSX.utils.json_to_sheet(enhancedData);
  XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, sheetName);
  
  // Save the enhanced file
  const outputPath = 'data/customer_feedback_analysis_with_comments.xlsx';
  XLSX.writeFile(newWorkbook, outputPath);
  
  console.log(`✅ Enhanced file saved as: ${outputPath}`);
  console.log(`📋 Total columns in new file: ${Object.keys(enhancedData[0]).length}`);
  
  // Show sample data
  console.log('\n📊 Sample Data (First 2 records):');
  console.log('==================================================');
  
  enhancedData.slice(0, 2).forEach((record, index) => {
    console.log(`Record ${index + 1}:`);
    console.log(`  S No.: ${record['S No.']}`);
    console.log(`  C_id: ${record.C_id}`);
    console.log(`  P_id: ${record.P_id}`);
    console.log(`  RESOURCE_COMPETENCY: ${record.RESOURCE_COMPETENCY}`);
    console.log(`  TIMELY_RESOURCE_FULFILLMENT_StaffAug: ${record.TIMELY_RESOURCE_FULFILLMENT_StaffAug}`);
    
    commentColumns.forEach(column => {
      const value = record[column];
      const displayValue = value ? `"${value}"` : 'empty';
      console.log(`  ${column}: ${displayValue}`);
    });
    console.log('');
  });
  
  console.log('🎯 Next Steps:');
  console.log('1. Use the new file: customer_feedback_analysis_with_comments.xlsx');
  console.log('2. Upload this file in the dashboard');
  console.log('3. The comment columns will now be available for sentiment analysis');
  
} catch (error) {
  console.error('❌ Error processing Excel file:', error.message);
  process.exit(1);
} 