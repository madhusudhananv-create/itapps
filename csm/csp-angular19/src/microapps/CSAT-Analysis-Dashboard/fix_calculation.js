const fs = require('fs');
const filePath = 'src/components/AccountWiseAvgDashboard.js';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the calculation lines
const oldCalc =       const totalAvgCSATScores = perspectiveAverages.length > 0 
        ? (perspectiveAverages.reduce((sum, avg) => sum + avg, 0) / perspectiveAverages.length).toFixed(2)
        : '0.00';;

const newCalc =       // Calculate Total Avg CSAT Scores: sum(Avg(Rating Value for "Overall Experience")) / count of "Overall Experience" with non-zero ratings
      const overallExperienceRatings = group.perspectives['Overall Experience'] || [];
      const nonZeroOverallRatings = overallExperienceRatings.filter(r => r > 0);
      const overallExperienceAvg = nonZeroOverallRatings.length > 0 
        ? nonZeroOverallRatings.reduce((sum, r) => sum + r, 0) / nonZeroOverallRatings.length
        : 0;
      
      const totalAvgCSATScores = overallExperienceAvg > 0 
        ? overallExperienceAvg.toFixed(2)
        : '0.00';;

content = content.replace(oldCalc, newCalc);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated Total Avg CSAT Scores calculation!');
