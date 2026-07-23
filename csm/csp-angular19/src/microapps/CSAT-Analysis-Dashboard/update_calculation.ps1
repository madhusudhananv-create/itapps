# PowerShell script to update the calculation logic to show counts instead of percentages
 = "src\components\AccountBUWiseOverallCSATScoreDistributionDashboard.js"
 = Get-Content  -Raw

# Replace percentage calculation with count display
 =  -replace 'const percentage = totalReceived > 0 \? \(\(count / totalReceived\) \* 100\)\.toFixed\(2\) : ''0\.00'';', 'const countValue = count;'
 =  -replace 'row\[ratingColumnMapping\[rating\]\] = percentage;', 'row[ratingColumnMapping[rating]] = countValue;'

# Update comments and logging
 =  -replace '// Add rating columns with new names - calculate percentages', '// Add rating columns with new names - display counts'
 =  -replace 'Rating percentage calculation: \(Count / Total Received\) \* 100', 'Rating count display: Show raw count values'
 =  -replace 'the "Highly Dissatisfied" column will show 25\.00%', 'the "Highly Dissatisfied" column will show the count (e.g., 3)'
 =  -replace 'percentage.*total.*=.*%', 'count values for each rating'

Set-Content  -Value  -Encoding UTF8
Write-Host "Successfully updated the calculation logic to show counts instead of percentages!"
