const fs = require('fs');
const filePath = 'src/components/AccountWiseAvgDashboard.js';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the specific calculation lines
const oldLines =       // Calculate Total Avg CSAT Scores: Avg(avg(rating column value for each perspective))
      // Only consider perspectives with non-zero averages
      const totalAvgCSATScores = perspectiveAverages.length > 0 
        ? (perspectiveAverages.reduce((sum, avg) => sum + avg, 0) / perspectiveAverages.length).toFixed(2)
        : '0.00';;

const newLines =       // Calculate Total Avg CSAT Scores: sum(Avg(Rating Value for "Overall Experience")) / count of perspective columns with non-zero ratings
      // Focus on "Overall Experience" perspective specifically
      const overallExperienceAvg = group.perspectives['Overall Experience'] ? 
        (group.perspectives['Overall Experience'].filter(r => r > 0).reduce((sum, r) => sum + r, 0) / group.perspectives['Overall Experience'].filter(r => r > 0).length) : 0;
      
      // Count perspective columns that have non-zero/non-N/A rating values
      const validPerspectiveCount = perspectives.filter(perspective => {
        const ratings = group.perspectives[perspective] || [];
        const nonZeroRatings = ratings.filter(r => r > 0);
        return nonZeroRatings.length > 0;
      }).length;
      
      // Calculate Total Avg CSAT Scores: sum(Overall Experience avg) / count of valid perspectives
      const totalAvgCSATScores = validPerspectiveCount > 0 && overallExperienceAvg > 0
        ? (overallExperienceAvg / validPerspectiveCount).toFixed(2)
        : '0.00';;

content = content.replace(oldLines, newLines);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated Total Avg CSAT Scores calculation logic!');
