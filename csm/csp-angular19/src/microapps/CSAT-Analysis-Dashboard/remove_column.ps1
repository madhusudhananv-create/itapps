 = "src/components/AccountWiseAvgDashboard.js"
 = Get-Content  -Raw

# Remove Total Avg CSAT Scores from headers array
 =  -replace ",\s*'Total Avg CSAT Scores',", ""

# Remove Total Avg CSAT Scores from data row
 =  -replace ",\s*row\['Total Avg CSAT Scores'\] \|\| '0\.00',", ""

# Remove Total Avg CSAT Scores column header
 =  -replace ",\s*'Total Avg CSAT Scores'", ""

# Remove Total Avg CSAT Scores table header
 =  -replace ",\s*<Th onClick=\{\(\) => handleSort\('Total Avg CSAT Scores'\)\}.*?</Th>", ""

# Remove Total Avg CSAT Scores table cell
 =  -replace ",\s*<Td.*?Total Avg CSAT Scores.*?</Td>", ""

# Remove calculation logic
 =  -replace "// Calculate Total Avg CSAT Scores.*?row\['Total Avg CSAT Scores'\] = totalAvgCSATScores;", ""

Set-Content   -NoNewline
Write-Host "Successfully removed Total Avg CSAT Scores column!"
