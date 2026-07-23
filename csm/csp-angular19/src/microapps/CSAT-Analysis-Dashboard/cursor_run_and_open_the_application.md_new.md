# Run and open the application
_Exported on 8/12/2025 at 20:03:46 GMT+5:30 from Cursor (1.2.2)_

---

**User**

pls run and open the application

---

**Cursor**

I'll first inspect the project's `package.json` to determine how to start the app and which port it uses, so I can run it correctly.

Installing dependencies, then starting the React dev server and opening it in your browser.

Starting the dev server in the background, then opening `http://localhost:3000` in your browser.

- Started CRA dev server in the background on port 3000.
- Opened the app in Edge at `http://localhost:3000`.

If the page doesn’t load after a few seconds, tell me and I’ll surface the server logs or try a different port.

---

**User**

Give option to Display Account wise avg rating for each questions in Upload Excel Data

Display coulmns S No.,C_id,avg of these columns for accounts should display in these columns.OVERALL_EXP,TIMELINE_ADHERENCE,QUALITY_OF_DELIVERY,TIMELY_RESOURCE_FULFILLMENT,RISK_MANAGEMENT,THOUGHT_LEADERSHIP,RESOURCE_COMPETENCY,TIMELY_RESOURCE_FULFILLMENT_StaffAug,using coulmns of "C:\Users\vidya.banayat\CSAT analysis dashboard\data\customer_feedback_analysis.xlsx"




---

**Cursor**

Scanning the UI components to see how Excel upload and table display are implemented, so I can add an option to show account-wise averages.

Adding a new dashboard to show account-wise averages per question and wiring it into the Upload Excel Data view, including a navigation button. Then I’ll run the app to verify.

```javascript
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Calculator, ChevronLeft } from 'lucide-react';

const DashboardContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin: 1.5rem 0;
  overflow: hidden;
`;

const DashboardHeader = styled.div`
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 1.25rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
  }
`;

const TableContainer = styled.div`
  overflow: auto;
  max-height: 70vh;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1400px;
`;

const TableHeader = styled.thead`
  background: #f8fafc;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const Th = styled.th`
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.8rem;
  border-bottom: 2px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;

  &:last-child {
    border-right: none;
  }
`;

const Td = styled.td`
  padding: 0.75rem;
  font-size: 0.8rem;
  color: #374151;
  border-right: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-right: none;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
`;

const columnsToAverage = [
  'OVERALL_EXP',
  'TIMELINE_ADHERENCE',
  'QUALITY_OF_DELIVERY',
  'TIMELY_RESOURCE_FULFILLMENT',
  'RISK_MANAGEMENT',
  'THOUGHT_LEADERSHIP',
  'RESOURCE_COMPETENCY',
  'TIMELY_RESOURCE_FULFILLMENT_StaffAug'
];

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === '' || value === 'N/A') return null;
  const n = Number(value);
  return isNaN(n) ? null : n;
}

const AccountWiseAvgDashboard = ({ data, onBack }) => {
  const grouped = useMemo(() => {
    if (!data || data.length === 0) return [];

    const groups = new Map(); // custId -> { counts: {}, sums: {} }

    data.forEach((row) => {
      const custId = row.C_id || row.cust_id || row.CID || row.CustomerID || row.Customer_Id || row.CusId || row.Test_C_Id;
      if (!custId) return;

      if (!groups.has(custId)) {
        const initCounts = {};
        const initSums = {};
        columnsToAverage.forEach((c) => { initCounts[c] = 0; initSums[c] = 0; });
        groups.set(custId, { counts: initCounts, sums: initSums });
      }

      const { counts, sums } = groups.get(custId);
      columnsToAverage.forEach((col) => {
        const num = toNumberOrNull(row[col]);
        if (num !== null) {
          sums[col] += num;
          counts[col] += 1;
        }
      });
    });

    const rows = Array.from(groups.entries()).map(([custId, { counts, sums }]) => {
      const averages = {};
      columnsToAverage.forEach((col) => {
        const count = counts[col];
        const sum = sums[col];
        averages[col] = count > 0 ? (sum / count).toFixed(2) : '0.00';
      });
      return { custId, ...averages };
    });

    // Sort by custId for stable display
    rows.sort((a, b) => String(a.custId).localeCompare(String(b.custId)));
    return rows;
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <DashboardContainer>
        <EmptyState>
          <Calculator size={48} style={{ marginBottom: '1rem', color: '#2563eb' }} />
          <h3>No Excel data available</h3>
          <p>Upload Excel data to view account-wise averages.</p>
        </EmptyState>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <HeaderTitle>
          <Calculator size={24} /> Account-wise Average by Question
        </HeaderTitle>
        {onBack && (
          <BackButton onClick={onBack} aria-label="Back to Upload Excel Data" title="Back to Upload Excel Data">
            <ChevronLeft size={16} /> Back
          </BackButton>
        )}
      </DashboardHeader>

      <TableContainer>
        <Table role="table" aria-label="Account-wise average ratings by question">
          <TableHeader>
            <tr>
              <Th>S No.</Th>
              <Th>C_id</Th>
              {columnsToAverage.map((c) => (
                <Th key={c}>{c}</Th>
              ))}
            </tr>
          </TableHeader>
          <tbody>
            {grouped.map((row, index) => (
              <tr key={row.custId}>
                <Td>{index + 1}</Td>
                <Td>{row.custId}</Td>
                {columnsToAverage.map((c) => (
                  <Td key={c}>{row[c]}</Td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </DashboardContainer>
  );
};

export default AccountWiseAvgDashboard;

```

```javascript
// ... existing code ...
import AvgRatingDashboard from './components/AvgRatingDashboard';
import SentimentsDashboard from './components/SentimentsDashboard';
import Golden5StarScoreDashboard from './components/Golden5StarScoreDashboard';
import Golden5StarSentimentsDashboard from './components/Golden5StarSentimentsDashboard';
import Perfect5RaterDashboard from './components/Perfect5RaterDashboard';
import LowScoreDashboard from './components/LowScoreDashboard';
import Top10AccountsDashboard from './components/Top10AccountsDashboard';
import Top10FiveRaterAccountsDashboard from './components/Top10FiveRaterAccountsDashboard';
import { csatData, accounts, projects, businessUnits } from './data/dummyData';
import AccountWiseAvgDashboard from './components/AccountWiseAvgDashboard';
// ... existing code ...
  const [showTop10FiveRaterAccounts, setShowTop10FiveRaterAccounts] = useState(false);
  const [showAccountWiseAvg, setShowAccountWiseAvg] = useState(false);
// ... existing code ...
  const switchToTop10FiveRaterAccounts = () => {
    console.log('switchToTop10FiveRaterAccounts called');
    setShowExcelData(false);
    setShowGoldenStar(false);
    setShowScoreBased(false);
    setShowAvgRating(false);
    setShowSentiments(false);
    setShowGolden5StarScore(false);
    setShowGolden5StarSentiments(false);
    setShowPerfect5Rater(false);
    setShowLowScore(false);
    setShowTop10Accounts(false);
    setShowTop10FiveRaterAccounts(true);
    console.log('showTop10FiveRaterAccounts set to true');
  };
  const switchToAccountWiseAvg = () => {
    setShowExcelData(false);
    setShowGoldenStar(false);
    setShowScoreBased(false);
    setShowAvgRating(false);
    setShowSentiments(false);
    setShowGolden5StarScore(false);
    setShowGolden5StarSentiments(false);
    setShowPerfect5Rater(false);
    setShowLowScore(false);
    setShowTop10Accounts(false);
    setShowTop10FiveRaterAccounts(false);
    setShowAccountWiseAvg(true);
  };
// ... existing code ...
              {!excelData ? (
                <FileUpload onDataUpload={handleExcelDataUpload} />
              ) : (
                <Golden5StarScoreDashboard 
                  data={excelData} 
                  onBackToDashboard={() => {
                    console.log('Back to Dashboard clicked - Golden 5 Star Score');
                    setShowGolden5StarScore(false);
                    setShowExcelData(true);
                  }}
                />
              )}
            </>
          ) : showGolden5StarSentiments ? (
// ... existing code ...
          ) : showTop10FiveRaterAccounts ? (
// ... existing code ...
          ) : showAccountWiseAvg ? (
            <>
              {!excelData ? (
                <FileUpload onDataUpload={handleExcelDataUpload} />
              ) : (
                <AccountWiseAvgDashboard 
                  data={excelData}
                  onBack={() => {
                    setShowAccountWiseAvg(false);
                    setShowExcelData(true);
                  }}
                />
              )}
            </>
          ) : (
// ... existing code ...
                  <ExcelDataTable 
                   data={excelData} 
                   headers={excelHeaders} 
                   onReload={reloadExcelData}
                   onSwitchToPerfect5Rater={switchToPerfect5Rater}
                   onSwitchToLowScore={() => {
                     setShowExcelData(false);
                     setShowLowScore(true);
                   }}
                    onSwitchToTop10Accounts={switchToTop10Accounts}
                    onSwitchToTop10FiveRaterAccounts={switchToTop10FiveRaterAccounts}
                    onSwitchToAccountWiseAvg={switchToAccountWiseAvg}
                 />
              )}
            </>
          )}
// ... existing code ...
```

```javascript
const ExcelDataTable = ({ data, headers, itemsPerPage = 10, onReload, onSwitchToPerfect5Rater, onSwitchToLowScore, onSwitchToTop10Accounts, onSwitchToTop10FiveRaterAccounts }) => {

->

const ExcelDataTable = ({ data, headers, itemsPerPage = 10, onReload, onSwitchToPerfect5Rater, onSwitchToLowScore, onSwitchToTop10Accounts, onSwitchToTop10FiveRaterAccounts, onSwitchToAccountWiseAvg }) => {
```

```javascript
        <h3 style={{ 
          margin: '0 0 1rem 0', 
          color: 'white', 
          fontSize: '1.2rem',
          fontWeight: '600',
          textAlign: 'right'
        }}>
          🏆 Golden 5 Star Analysis Options
        </h3>

->

        <h3 style={{ 
          margin: '0 0 1rem 0', 
          color: 'white', 
          fontSize: '1.2rem',
          fontWeight: '600',
          textAlign: 'right'
        }}>
          🏆 Analysis Options
        </h3>
```

```javascript
// ... existing code ...
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={onSwitchToPerfect5Rater}
              style={{
                padding: '0.75rem 1.5rem',
                border: '2px solid white',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'translateY(0)';
              }}
              aria-label="Switch to Perfect-5 Rater (Score-Based) Dashboard"
              title="Switch to Perfect-5 Rater (Score-Based) Dashboard"
            >
              <Star size={16} />
              Perfect-5 Rater (Score-Based)
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={onSwitchToLowScore}
              style={{
                padding: '0.75rem 1.5rem',
                border: '2px solid white',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'translateY(0)';
              }}
              aria-label="Switch to Low Score Dashboard"
              title="Switch to Low Score Dashboard"
            >
              <Star size={16} />
              Low Score Dashboard
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => {
                console.log('Top 10 Five Rater Accounts button clicked');
                onSwitchToTop10FiveRaterAccounts();
              }}
              style={{
                padding: '0.75rem 1.5rem',
                border: '2px solid white',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'translateY(0)';
              }}
              aria-label="Switch to Top 10 Five Rater Accounts Dashboard"
              title="Switch to Top 10 Five Rater Accounts Dashboard"
            >
              <Star size={16} />
              Top 10 Five Rater Accounts
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={onSwitchToAccountWiseAvg}
              style={{
                padding: '0.75rem 1.5rem',
                border: '2px solid white',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'translateY(0)';
              }}
              aria-label="Switch to Account-wise Averages"
              title="Switch to Account-wise Averages"
            >
              <Star size={16} />
              Account-wise Avg (Questions)
            </button>
          </div>
          {/* 5 Star Accounts navigation removed as requested */}
        </div>
       </div>
       {/* Inline preview removed; provide navigation button instead */}
// ... existing code ...
```

- Added a new dashboard `Account-wise Average by Question` that groups by `C_id` and shows averages for: `OVERALL_EXP`, `TIMELINE_ADHERENCE`, `QUALITY_OF_DELIVERY`, `TIMELY_RESOURCE_FULFILLMENT`, `RISK_MANAGEMENT`, `THOUGHT_LEADERSHIP`, `RESOURCE_COMPETENCY`, `TIMELY_RESOURCE_FULFILLMENT_StaffAug`.
- Integrated it into the Upload Excel Data flow:
  - New button in `Upload Excel Data` → “Account-wise Avg (Questions)”.
  - Displays table with columns: `S No.`, `C_id`, and the averages above.
  - Includes a Back button to return to `Upload Excel Data`.

How to use:
- Go to Upload Excel Data, upload `data/customer_feedback_analysis.xlsx`.
- Click “Account-wise Avg (Questions)”.

- Build passed; dev server is running. Refresh `http://localhost:3000`.

- Files changed:
  - `src/components/AccountWiseAvgDashboard.js` (new)
  - `src/App.js` (wired state/routes and callback)
  - `src/components/ExcelDataTable.js` (added button and callback prop)

If you want S No. to reflect original sheet row numbers per account rather than sequential, say so and I’ll adjust.

---

**User**

move entire functionality of Account-wise Average by Question section on click of Account-wise Avg (Questions) button

---

**Cursor**

Done. Clicking “Account-wise Avg (Questions)” now opens a dedicated view that fully replaces the Upload Excel Data table and shows only the Account-wise Average by Question dashboard, with a Back button to return.

- How to use:
  - Go to Upload Excel Data, upload your Excel.
  - Click “Account-wise Avg (Questions)”.
  - Use Back to return to Upload Excel Data.

- Key edits:
  - Added `AccountWiseAvgDashboard` and routed it via `App.js`.
  - Added the button in `ExcelDataTable` to switch to this view.

If you want the view to open in a new tab or to include export (CSV/Excel) for the account-wise table, I can add that.

---

**User**

unable to view this section Account-wise Average by Question on click of the   Account-wise Avg (Questions)
also unable to view coulmns S No.,C_id,avg of these columns for accounts should display in these columns.OVERALL_EXP,TIMELINE_ADHERENCE,QUALITY_OF_DELIVERY,TIMELY_RESOURCE_FULFILLMENT,RISK_MANAGEMENT,THOUGHT_LEADERSHIP,RESOURCE_COMPETENCY,TIMELY_RESOURCE_FULFILLMENT_StaffAug,using coulmns of "C:\Users\vidya.banayat\CSAT analysis dashboard\data\customer_feedback_analysis.xlsx"

---

**Cursor**

Adding a dedicated navigation action and ensuring the button triggers the view correctly. Also clarifying that you must upload the Excel file via the UI (browsers can’t read `C:\...` paths directly). I’ll add a log to confirm the button click and the state switch, then you can try again.

```javascript
// ... existing code ...
  const switchToAccountWiseAvg = () => {
    console.log('Switching to Account-wise Avg (Questions) view');
    setShowExcelData(false);
    setShowGoldenStar(false);
    setShowScoreBased(false);
    setShowAvgRating(false);
    setShowSentiments(false);
    setShowGolden5StarScore(false);
    setShowGolden5StarSentiments(false);
    setShowPerfect5Rater(false);
    setShowLowScore(false);
    setShowTop10Accounts(false);
    setShowTop10FiveRaterAccounts(false);
    setShowAccountWiseAvg(true);
  };
// ... existing code ...
```

```javascript
              onClick={onSwitchToAccountWiseAvg}

->

              onClick={() => { console.log('Account-wise Avg button clicked'); onSwitchToAccountWiseAvg && onSwitchToAccountWiseAvg(); }}
```

I’m going to update the Excel parsing so all columns from the uploaded file are retained for calculations (not just A–T), while still limiting the table display to the first 20 columns. Then I’ll rebuild to ensure everything compiles.

```javascript
// ... existing code ...
          // Get headers (first row)
          const headers = jsonData[0];
          
          // Limit to first 20 columns (A to T) for display headers only
          const maxColumns = 20;
          const limitedHeaders = headers.slice(0, maxColumns);
          
          // Convert data rows to objects using ALL headers for full data access
          const processedData = jsonData.slice(1).map((row, index) => {
            const rowData = {};
            headers.forEach((header, colIndex) => {
              const columnName = header || `Column ${String.fromCharCode(65 + (colIndex % 26))}`;
              rowData[columnName] = row[colIndex] !== undefined ? row[colIndex] : '';
            });
            // Add a unique ID
            rowData.id = index + 1;
            return rowData;
          });

          // Store the display column headers (only A to T)
          const columnHeaders = limitedHeaders.map((header, index) => ({
            letter: String.fromCharCode(65 + index),
            name: header || `Column ${String.fromCharCode(65 + index)}`
          }));

          resolve({ 
            data: processedData, 
            headers: columnHeaders, 
            originalColumnCount: headers.length 
          });
// ... existing code ...
```

Thanks—two fixes applied so you can see the section and the expected columns:

- The “Account-wise Avg (Questions)” button now logs on click and switches to the dedicated view.
- Excel parsing now keeps all columns from your upload (not just A–T). The table still displays the first 20, but dashboards can access all required fields, including the ones you listed.

What to do:
- Refresh `http://localhost:3000`.
- Upload `data/customer_feedback_analysis.xlsx` via the Upload Excel Data UI.
- Click “Account-wise Avg (Questions)”.

You should then see:
- Columns: S No., C_id, OVERALL_EXP, TIMELINE_ADHERENCE, QUALITY_OF_DELIVERY, TIMELY_RESOURCE_FULFILLMENT, RISK_MANAGEMENT, THOUGHT_LEADERSHIP, RESOURCE_COMPETENCY, TIMELY_RESOURCE_FULFILLMENT_StaffAug.
- Each value is the account-wise average for that question.

If it still doesn’t show, check the browser console for:
- “Account-wise Avg button clicked”
- “Switching to Account-wise Avg (Questions) view”
and tell me what you see.

---

**User**

unable to view this data in section Account-wise Average by Question on click of the   Account-wise Avg (Questions)button after uploading the excel C:\Users\vidya.banayat\CSAT analysis dashboard\data\customer_feedback_analysis.xlsx.

---

**Cursor**

```javascript
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Calculator, ChevronLeft } from 'lucide-react';

const DashboardContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin: 1.5rem 0;
  overflow: hidden;
`;

const DashboardHeader = styled.div`
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 1.25rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
  }
`;

const TableContainer = styled.div`
  overflow: auto;
  max-height: 70vh;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1400px;
`;

const TableHeader = styled.thead`
  background: #f8fafc;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const Th = styled.th`
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.8rem;
  border-bottom: 2px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;

  &:last-child {
    border-right: none;
  }
`;

const Td = styled.td`
  padding: 0.75rem;
  font-size: 0.8rem;
  color: #374151;
  border-right: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-right: none;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
`;

const columnsToAverage = [
  'OVERALL_EXP',
  'TIMELINE_ADHERENCE',
  'QUALITY_OF_DELIVERY',
  'TIMELY_RESOURCE_FULFILLMENT',
  'RISK_MANAGEMENT',
  'THOUGHT_LEADERSHIP',
  'RESOURCE_COMPETENCY',
  'TIMELY_RESOURCE_FULFILLMENT_StaffAug'
];

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === '' || value === 'N/A') return null;
  const n = Number(value);
  return isNaN(n) ? null : n;
}

function normalizeKey(key) {
  return String(key).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function findValueByHeader(row, wantedHeader) {
  // try direct
  if (row[wantedHeader] !== undefined) return row[wantedHeader];

  // fuzzy: case/underscore/space insensitive
  const target = normalizeKey(wantedHeader);
  for (const k of Object.keys(row)) {
    if (normalizeKey(k) === target) return row[k];
  }
  return undefined;
}

function getCustomerId(row) {
  const candidates = [
    'C_id', 'cust_id', 'CID', 'CustomerID', 'Customer_Id', 'CusId', 'Test_C_Id',
    'C Id', 'Customer Id', 'Customer_ID', 'Customer Id ', 'CId'
  ];
  for (const c of candidates) {
    const v = findValueByHeader(row, c);
    if (v !== undefined && v !== null && v !== '') return v;
  }
  // last resort: try any column that looks like customer id
  const likely = Object.keys(row).find(k => /c(_|\s)?id/i.test(k));
  return likely ? row[likely] : undefined;
}

const AccountWiseAvgDashboard = ({ data, onBack }) => {
  const grouped = useMemo(() => {
    if (!data || data.length === 0) return [];

    const groups = new Map(); // custId -> { counts: {}, sums: {} }

    data.forEach((row) => {
      const custId = getCustomerId(row);
      if (custId === undefined || custId === null || custId === '') return;

      if (!groups.has(custId)) {
        const initCounts = {};
        const initSums = {};
        columnsToAverage.forEach((c) => { initCounts[c] = 0; initSums[c] = 0; });
        groups.set(custId, { counts: initCounts, sums: initSums });
      }

      const { counts, sums } = groups.get(custId);
      columnsToAverage.forEach((col) => {
        const raw = findValueByHeader(row, col);
        const num = toNumberOrNull(raw);
        if (num !== null) {
          sums[col] += num;
          counts[col] += 1;
        }
      });
    });

    const rows = Array.from(groups.entries()).map(([custId, { counts, sums }]) => {
      const averages = {};
      columnsToAverage.forEach((col) => {
        const count = counts[col];
        const sum = sums[col];
        averages[col] = count > 0 ? (sum / count).toFixed(2) : '0.00';
      });
      return { custId, ...averages };
    });

    rows.sort((a, b) => String(a.custId).localeCompare(String(b.custId)));
    return rows;
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <DashboardContainer>
        <EmptyState>
          <Calculator size={48} style={{ marginBottom: '1rem', color: '#2563eb' }} />
          <h3>No Excel data available</h3>
          <p>Upload Excel data to view account-wise averages.</p>
        </EmptyState>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <HeaderTitle>
          <Calculator size={24} /> Account-wise Average by Question
        </HeaderTitle>
        {onBack && (
          <BackButton onClick={onBack} aria-label="Back to Upload Excel Data" title="Back to Upload Excel Data">
            <ChevronLeft size={16} /> Back
          </BackButton>
        )}
      </DashboardHeader>

      <TableContainer>
        <Table role="table" aria-label="Account-wise average ratings by question">
          <TableHeader>
            <tr>
              <Th>S No.</Th>
              <Th>C_id</Th>
              {columnsToAverage.map((c) => (
                <Th key={c}>{c}</Th>
              ))}
            </tr>
          </TableHeader>
          <tbody>
            {grouped.map((row, index) => (
              <tr key={`${row.custId}-${index}`}>
                <Td>{index + 1}</Td>
                <Td>{row.custId}</Td>
                {columnsToAverage.map((c) => (
                  <Td key={c}>{row[c]}</Td>
                ))}
              </tr>
            ))}
            {grouped.length === 0 && (
              <tr>
                <Td colSpan={2 + columnsToAverage.length}>
                  No matching records found for the required headers. Ensure your Excel has the expected question columns and a customer/account id column (e.g., C_id).
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableContainer>
    </DashboardContainer>
  );
};

export default AccountWiseAvgDashboard;

```

Try again now:
- Refresh the app.
- Upload `customer_feedback_analysis.xlsx`.
- Click “Account-wise Avg (Questions)”.

I made the view tolerant to header variations:
- It now detects `C_id` even if the sheet uses variants like `cust_id`, `CID`, `CustomerID`, `Customer_Id`, etc.
- It finds the question columns even if case/spacing/underscores differ (e.g., `overall exp`, `OVERALL-EXP`).

You should see the table with:
- S No., C_id
- Averages for: OVERALL_EXP, TIMELINE_ADHERENCE, QUALITY_OF_DELIVERY, TIMELY_RESOURCE_FULFILLMENT, RISK_MANAGEMENT, THOUGHT_LEADERSHIP, RESOURCE_COMPETENCY, TIMELY_RESOURCE_FULFILLMENT_StaffAug.

If the section still appears empty, please check:
- In the browser console, confirm “Account-wise Avg button clicked” and “Switching to Account-wise Avg (Questions) view” are logged.
- Tell me the exact header names in your sheet for C_id and those question columns so I can add them to the matching list if needed.

---

**User**

unable to view this data in section Account-wise Average by Question on click of the   Account-wise Avg (Questions)button after uploading the excel C:\Users\vidya.banayat\CSAT analysis dashboard\data\customer_feedback_analysis.xlsx.


Display coulmns S No.,C_id,avg of these columns for accounts should display in these columns.OVERALL_EXP,TIMELINE_ADHERENCE,QUALITY_OF_DELIVERY,TIMELY_RESOURCE_FULFILLMENT,RISK_MANAGEMENT,THOUGHT_LEADERSHIP,RESOURCE_COMPETENCY,TIMELY_RESOURCE_FULFILLMENT_StaffAug,using coulmns of "C:\Users\vidya.banayat\CSAT analysis dashboard\data\customer_feedback_analysis.xlsx" on on click of the   Account-wise Avg (Questions)button after uploading the excel C:\Users\vidya.banayat\CSAT analysis dashboard\data\customer_feedback_analysis.xlsx

---

**Cursor**

```javascript
// ... existing code ...
const columnsToAverage = [
  'OVERALL_EXP',
  'TIMELINE_ADHERENCE',
  'QUALITY_OF_DELIVERY',
  'TIMELY_RESOURCE_FULFILLMENT',
  'RISK_MANAGEMENT',
  'THOUGHT_LEADERSHIP',
  'RESOURCE_COMPETENCY',
  'TIMELY_RESOURCE_FULFILLMENT_StaffAug'
];

const metricSynonyms = {
  OVERALL_EXP: ['OVERALL_EXP', 'Overall Exp', 'Overall_Exp', 'OVERALL-EXP', 'OVERALL EXPERIENCE', 'Overall Experience'],
  TIMELINE_ADHERENCE: ['TIMELINE_ADHERENCE', 'Timeline Adherence', 'Timeline_Adherence', 'TIMELINE-ADHERENCE', 'TIMELINE ADHERENCE'],
  QUALITY_OF_DELIVERY: ['QUALITY_OF_DELIVERY', 'Quality Of Delivery', 'Quality_of_Delivery', 'QUALITY-OF-DELIVERY', 'QUALITY OF DELIVERY'],
  TIMELY_RESOURCE_FULFILLMENT: ['TIMELY_RESOURCE_FULFILLMENT', 'Timely Resource Fulfillment', 'Timely_Resource_Fulfillment', 'TIMELY-RESOURCE-FULFILLMENT', 'TIMELY RESOURCE FULFILLMENT'],
  RISK_MANAGEMENT: ['RISK_MANAGEMENT', 'Risk Management', 'Risk_Management', 'RISK-MANAGEMENT', 'RISK MANAGEMENT'],
  THOUGHT_LEADERSHIP: ['THOUGHT_LEADERSHIP', 'Thought Leadership', 'Thought_Leadership', 'THOUGHT-LEADERSHIP', 'THOUGHT LEADERSHIP'],
  RESOURCE_COMPETENCY: ['RESOURCE_COMPETENCY', 'Resource Competency', 'Resource_Competency', 'RESOURCE-COMPETENCY', 'RESOURCE COMPETENCY'],
  TIMELY_RESOURCE_FULFILLMENT_StaffAug: ['TIMELY_RESOURCE_FULFILLMENT_StaffAug', 'Timely Resource Fulfillment StaffAug', 'TIMELY_RESOURCE_FULFILLMENT_STAFFAUG', 'StaffAug Timely Resource Fulfillment', 'TRF_StaffAug', 'TRF StaffAug']
};

function toNumberOrNull(value) {
// ... existing code ...
}

function getCustomerId(row) {
  // Common candidates
  const candidates = [
    'C_id', 'cust_id', 'CID', 'CustomerID', 'Customer_Id', 'CusId', 'Test_C_Id',
    'C Id', 'Customer Id', 'Customer_ID', 'Customer Id ', 'CId', 'AccountID', 'Account_Id', 'Account Id', 'AccId', 'ACC_ID'
  ];
  for (const c of candidates) {
    const v = findValueByHeader(row, c);
    if (v !== undefined && v !== null && v !== '') return v;
  }
  // broader heuristic: look for keys containing both 'cust' or 'account' and 'id'
  const keys = Object.keys(row);
  let foundKey = keys.find(k => /cust/i.test(k) && /id/i.test(k));
  if (foundKey) return row[foundKey];
  foundKey = keys.find(k => /account/i.test(k) && /id/i.test(k));
  if (foundKey) return row[foundKey];
  // last resort: any key that normalizes to ending with 'id'
  foundKey = keys.find(k => normalizeKey(k).endsWith('id'));
  return foundKey ? row[foundKey] : undefined;
}

const AccountWiseAvgDashboard = ({ data, onBack }) => {
  const grouped = useMemo(() => {
    if (!data || data.length === 0) return [];

    const groups = new Map(); // custId -> { counts: {}, sums: {} }

    data.forEach((row) => {
      const custId = getCustomerId(row);
      if (custId === undefined || custId === null || custId === '') return;

      if (!groups.has(custId)) {
        const initCounts = {};
        const initSums = {};
        columnsToAverage.forEach((c) => { initCounts[c] = 0; initSums[c] = 0; });
        groups.set(custId, { counts: initCounts, sums: initSums });
      }

      const { counts, sums } = groups.get(custId);
      columnsToAverage.forEach((canonical) => {
        const synonyms = metricSynonyms[canonical] || [canonical];
        let raw;
        for (const name of synonyms) {
          raw = findValueByHeader(row, name);
          if (raw !== undefined && raw !== null && raw !== '') break;
        }
        const num = toNumberOrNull(raw);
        if (num !== null) {
          sums[canonical] += num;
          counts[canonical] += 1;
        }
      });
    });

    // Warn if no data found for any metrics
    const sampleRow = data[0] || {};
    const presentHeaders = Object.keys(sampleRow);
    columnsToAverage.forEach((canonical) => {
      const synonyms = metricSynonyms[canonical] || [canonical];
      const hit = synonyms.some(s => presentHeaders.some(h => normalizeKey(h) === normalizeKey(s)));
      if (!hit) {
        // eslint-disable-next-line no-console
        console.warn(`[AccountWiseAvg] Metric header not found in sheet: ${canonical}. Checked synonyms: ${synonyms.join(', ')}`);
      }
    });

    const rows = Array.from(groups.entries()).map(([custId, { counts, sums }]) => {
      const averages = {};
      columnsToAverage.forEach((col) => {
        const count = counts[col];
        const sum = sums[col];
        averages[col] = count > 0 ? (sum / count).toFixed(2) : '0.00';
      });
      return { custId, ...averages };
    });

    rows.sort((a, b) => String(a.custId).localeCompare(String(b.custId)));
    return rows;
  }, [data]);

// ... existing code ...
```

Please refresh and try again:
- Upload your Excel via Upload Excel Data.
- Click “Account-wise Avg (Questions)”.

I added robust header detection:
- C_id detection now covers variants like `cust_id`, `CID`, `CustomerID`, `Customer_Id`, `AccountID`, etc.
- Each metric now supports common synonyms and spacing/case/underscore variations.

If it still shows empty:
- Open your browser console and look for warnings starting with “[AccountWiseAvg] Metric header not found in sheet: …”.
- Share the exact header names in your file for C_id and each metric; I’ll map them.

---

**User**

remove the button "CSAT Dashboard" from the tool

---

**Cursor**

```javascript
          <NavigationMenu>
            <NavButton 
              active={!showExcelData && !showGoldenStar && !showScoreBased && !showAvgRating && !showSentiments && !showGolden5StarScore && !showGolden5StarSentiments && !showPerfect5Rater && !showLowScore} 
              onClick={switchToDummyData}
             aria-label="Switch to CSAT dashboard"
             title="Switch to CSAT dashboard"
            >
              CSAT Dashboard
            </NavButton>
                       <NavButton 
              active={showExcelData && !showGoldenStar && !showScoreBased && !showAvgRating && !showSentiments && !showGolden5StarScore && !showGolden5StarSentiments && !showPerfect5Rater && !showLowScore && !showTop10Accounts && !showTop10FiveRaterAccounts} 
              onClick={() => setShowExcelData(true)}
              aria-label="Switch to Excel data upload"
              title="Switch to Excel data upload"
            >
              Upload Excel Data
            </NavButton>
         </NavigationMenu>

->

          <NavigationMenu>
            <NavButton 
              active={showExcelData && !showGoldenStar && !showScoreBased && !showAvgRating && !showSentiments && !showGolden5StarScore && !showGolden5StarSentiments && !showPerfect5Rater && !showLowScore && !showTop10Accounts && !showTop10FiveRaterAccounts} 
              onClick={() => setShowExcelData(true)}
              aria-label="Switch to Excel data upload"
              title="Switch to Excel data upload"
            >
              Upload Excel Data
            </NavButton>
         </NavigationMenu>
```

- Removed the “CSAT Dashboard” button from the navigation in `src/App.js`. Only “Upload Excel Data” remains.
- Build succeeded. Refresh `http://localhost:3000` to see the change.

---

**User**

reomove the graphs  Average CSAT Score by Account,Average CSAT Score by Business Unit,Score Distribution,Top Projects by CSAT Score  from the page which are coming on click of the button " Account-wise Avg (Questions)"

remove the Filter Data also

---

**Cursor**

```javascript
// ... existing code ...
          {!showExcelData && !showGoldenStar && !showScoreBased && !showAvgRating && !showSentiments && !showGolden5StarScore && !showGolden5StarSentiments && !showPerfect5Rater && !showLowScore && !showTop10Accounts && !showTop10FiveRaterAccounts && !showAccountWiseAvg && (
            <FilterPanel
              selectedAccount={selectedAccount}
              selectedProject={selectedProject}
              selectedBU={selectedBU}
              onAccountChange={handleAccountChange}
              onProjectChange={handleProjectChange}
              onBUChange={handleBUChange}
              onClearFilters={handleClearFilters}
              accounts={accounts}
              projects={projects}
              businessUnits={businessUnits}
            />
          )}
          
          {!showExcelData && !showGoldenStar && !showScoreBased && !showAvgRating && !showSentiments && !showGolden5StarScore && !showGolden5StarSentiments && !showPerfect5Rater && !showLowScore && !showTop10Accounts && !showTop10FiveRaterAccounts && !showAccountWiseAvg ? (
            <>
              <AnalyticsCharts data={filteredData} />
              <DataTable data={filteredData} />
            </>
          ) : showGoldenStar ? (
// ... existing code ...
```

- Hid the Filter panel and the graphs (`Average CSAT Score by Account`, `Average CSAT Score by Business Unit`, `Score Distribution`, `Top Projects by CSAT Score`) whenever the “Account-wise Avg (Questions)” view is active.
- Refresh `http://localhost:3000`, upload your file, click “Account-wise Avg (Questions)”; only that table should be visible.

---

**User**

display the grand total for all the columns

---

**Cursor**

```javascript
// ... existing code ...
const AccountWiseAvgDashboard = ({ data, onBack }) => {
  const { rows: grouped, grandAverages } = useMemo(() => {
    if (!data || data.length === 0) return { rows: [], grandAverages: {} };

    const groups = new Map(); // custId -> { counts: {}, sums: {} }
    // grand totals across all rows
    const totalCounts = {};
    const totalSums = {};
    columnsToAverage.forEach((c) => { totalCounts[c] = 0; totalSums[c] = 0; });

    data.forEach((row) => {
      const custId = getCustomerId(row);
      if (custId === undefined || custId === null || custId === '') return;

      if (!groups.has(custId)) {
        const initCounts = {};
        const initSums = {};
        columnsToAverage.forEach((c) => { initCounts[c] = 0; initSums[c] = 0; });
        groups.set(custId, { counts: initCounts, sums: initSums });
      }

      const { counts, sums } = groups.get(custId);
      columnsToAverage.forEach((canonical) => {
        const synonyms = metricSynonyms[canonical] || [canonical];
        let raw;
        for (const name of synonyms) {
          raw = findValueByHeader(row, name);
          if (raw !== undefined && raw !== null && raw !== '') break;
        }
        const num = toNumberOrNull(raw);
        if (num !== null) {
          sums[canonical] += num;
          counts[canonical] += 1;
          totalSums[canonical] += num;
          totalCounts[canonical] += 1;
        }
      });
    });

    // Warn if no data found for any metrics
    const sampleRow = data[0] || {};
    const presentHeaders = Object.keys(sampleRow);
    columnsToAverage.forEach((canonical) => {
      const synonyms = metricSynonyms[canonical] || [canonical];
      const hit = synonyms.some(s => presentHeaders.some(h => normalizeKey(h) === normalizeKey(s)));
      if (!hit) {
        // eslint-disable-next-line no-console
        console.warn(`[AccountWiseAvg] Metric header not found in sheet: ${canonical}. Checked synonyms: ${synonyms.join(', ')}`);
      }
    });

    const rows = Array.from(groups.entries()).map(([custId, { counts, sums }]) => {
      const averages = {};
      columnsToAverage.forEach((col) => {
        const count = counts[col];
        const sum = sums[col];
        averages[col] = count > 0 ? (sum / count).toFixed(2) : '0.00';
      });
      return { custId, ...averages };
    });

    rows.sort((a, b) => String(a.custId).localeCompare(String(b.custId)));

    const grandAverages = {};
    columnsToAverage.forEach((col) => {
      const count = totalCounts[col];
      const sum = totalSums[col];
      grandAverages[col] = count > 0 ? (sum / count).toFixed(2) : '0.00';
    });

    return { rows, grandAverages };
  }, [data]);

  if (!data || data.length === 0) {
// ... existing code ...
          <tbody>
            {grouped.map((row, index) => (
              <tr key={`${row.custId}-${index}`}>
                <Td>{index + 1}</Td>
                <Td>{row.custId}</Td>
                {columnsToAverage.map((c) => (
                  <Td key={c}>{row[c]}</Td>
                ))}
              </tr>
            ))}
            {grouped.length === 0 && (
              <tr>
                <Td colSpan={2 + columnsToAverage.length}>
                  No matching records found for the required headers. Ensure your Excel has the expected question columns and a customer/account id column (e.g., C_id).
                </Td>
              </tr>
            )}
            {grouped.length > 0 && (
              <tr>
                <Td style={{ fontWeight: 700 }}>—</Td>
                <Td style={{ fontWeight: 700 }}>Grand Total</Td>
                {columnsToAverage.map((c) => (
                  <Td key={`grand-${c}`} style={{ fontWeight: 700 }}>{grandAverages[c]}</Td>
                ))}
              </tr>
            )}
          </tbody>
// ... existing code ...
```

---

**User**

Give one new upload CSAT survey data option in menu .
On click of button option to upload the excel.then on click of upload CSAT survey data button
Give option to Display Account wise avg rating for each value of perspective column .

Dashboard for Account Level Average CSAT Scores - Perspective Wise:
Display columns S No.,CUSTOMER_ID,count(CSAT SENT DATE) as column name CSAT sent,count(CSAT RECEIVED DATE) as column name CSAT received,  Display perspective values as column name  and value for these columns will be avg rating for each value of RATING column for these perspective of "C:\Users\vijaya.verma\CSAT analysis dashboard\data\New_customer_feedback_analysis.xlsx"

---

**Cursor**

I'll create a new "Upload CSAT Survey Data" option with a dedicated dashboard for perspective-wise account averages. Let me implement this step by step.


```javascript
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Calculator, ChevronLeft, Upload } from 'lucide-react';

const DashboardContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin: 1.5rem 0;
  overflow: hidden;
`;

const DashboardHeader = styled.div`
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  padding: 1.25rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
  }
`;

const TableContainer = styled.div`
  overflow: auto;
  max-height: 70vh;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
`;

const TableHeader = styled.thead`
  background: #f8fafc;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const Th = styled.th`
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.8rem;
  border-bottom: 2px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;

  &:last-child {
    border-right: none;
  }
`;

const Td = styled.td`
  padding: 0.75rem;
  font-size: 0.8rem;
  color: #374151;
  border-right: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-right: none;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
`;

function normalizeKey(key) {
  return String(key).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function findValueByHeader(row, wantedHeader) {
  // try direct
  if (row[wantedHeader] !== undefined) return row[wantedHeader];

  // fuzzy: case/underscore/space insensitive
  const target = normalizeKey(wantedHeader);
  for (const k of Object.keys(row)) {
    if (normalizeKey(k) === target) return row[k];
  }
  return undefined;
}

function getCustomerId(row) {
  const candidates = [
    'CUSTOMER_ID', 'C_id', 'cust_id', 'CID', 'CustomerID', 'Customer_Id', 'CusId', 'Test_C_Id',
    'C Id', 'Customer Id', 'Customer_ID', 'Customer Id ', 'CId', 'AccountID', 'Account_Id', 'Account Id', 'AccId', 'ACC_ID'
  ];
  for (const c of candidates) {
    const v = findValueByHeader(row, c);
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

function getCSATSentDate(row) {
  const candidates = ['CSAT SENT DATE', 'CSAT_SENT_DATE', 'CSAT Sent Date', 'CSAT Sent', 'Sent Date', 'SENT_DATE'];
  for (const c of candidates) {
    const v = findValueByHeader(row, c);
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

function getCSATReceivedDate(row) {
  const candidates = ['CSAT RECEIVED DATE', 'CSAT_RECEIVED_DATE', 'CSAT Received Date', 'CSAT Received', 'Received Date', 'RECEIVED_DATE'];
  for (const c of candidates) {
    const v = findValueByHeader(row, c);
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

function getRating(row) {
  const candidates = ['RATING', 'Rating', 'rating', 'RATE', 'Rate', 'rate'];
  for (const c of candidates) {
    const v = findValueByHeader(row, c);
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

function getPerspective(row) {
  const candidates = ['PERSPECTIVE', 'Perspective', 'perspective', 'PERSP', 'Persp', 'persp'];
  for (const c of candidates) {
    const v = findValueByHeader(row, c);
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === '' || value === 'N/A') return null;
  const n = Number(value);
  return isNaN(n) ? null : n;
}

const CSATSurveyDashboard = ({ data, onBack }) => {
  const { groupedData, perspectives, grandAverages } = useMemo(() => {
    if (!data || data.length === 0) return { groupedData: [], perspectives: [], grandAverages: {} };

    const groups = new Map(); // customerId -> { csatSent: Set, csatReceived: Set, perspectives: Map }
    const allPerspectives = new Set();
    const totalRatings = new Map(); // perspective -> { sum: number, count: number }

    data.forEach((row) => {
      const customerId = getCustomerId(row);
      if (!customerId) return;

      const csatSent = getCSATSentDate(row);
      const csatReceived = getCSATReceivedDate(row);
      const rating = getRating(row);
      const perspective = getPerspective(row);

      if (!groups.has(customerId)) {
        groups.set(customerId, {
          csatSent: new Set(),
          csatReceived: new Set(),
          perspectives: new Map()
        });
      }

      const group = groups.get(customerId);

      if (csatSent) group.csatSent.add(csatSent);
      if (csatReceived) group.csatReceived.add(csatReceived);

      if (perspective && rating !== undefined) {
        allPerspectives.add(perspective);
        
        if (!group.perspectives.has(perspective)) {
          group.perspectives.set(perspective, []);
        }
        group.perspectives.get(perspective).push(toNumberOrNull(rating));

        // Update grand totals
        if (!totalRatings.has(perspective)) {
          totalRatings.set(perspective, { sum: 0, count: 0 });
        }
        const num = toNumberOrNull(rating);
        if (num !== null) {
          totalRatings.get(perspective).sum += num;
          totalRatings.get(perspective).count += 1;
        }
      }
    });

    const perspectives = Array.from(allPerspectives).sort();
    
    const groupedData = Array.from(groups.entries()).map(([customerId, group]) => {
      const row = {
        customerId,
        csatSent: group.csatSent.size,
        csatReceived: group.csatReceived.size
      };

      perspectives.forEach(perspective => {
        const ratings = group.perspectives.get(perspective) || [];
        const validRatings = ratings.filter(r => r !== null);
        row[perspective] = validRatings.length > 0 
          ? (validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length).toFixed(2)
          : '0.00';
      });

      return row;
    });

    groupedData.sort((a, b) => String(a.customerId).localeCompare(String(b.customerId)));

    const grandAverages = {};
    perspectives.forEach(perspective => {
      const totals = totalRatings.get(perspective);
      if (totals && totals.count > 0) {
        grandAverages[perspective] = (totals.sum / totals.count).toFixed(2);
      } else {
        grandAverages[perspective] = '0.00';
      }
    });

    return { groupedData, perspectives, grandAverages };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <DashboardContainer>
        <EmptyState>
          <Upload size={48} style={{ marginBottom: '1rem', color: '#8b5cf6' }} />
          <h3>No CSAT Survey data available</h3>
          <p>Upload Excel data to view perspective-wise account averages.</p>
        </EmptyState>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <HeaderTitle>
          <Calculator size={24} /> Account Level Average CSAT Scores - Perspective Wise
        </HeaderTitle>
        {onBack && (
          <BackButton onClick={onBack} aria-label="Back to Upload CSAT Survey Data" title="Back to Upload CSAT Survey Data">
            <ChevronLeft size={16} /> Back
          </BackButton>
        )}
      </DashboardHeader>

      <TableContainer>
        <Table role="table" aria-label="Account-wise CSAT scores by perspective">
          <TableHeader>
            <tr>
              <Th>S No.</Th>
              <Th>CUSTOMER_ID</Th>
              <Th>CSAT sent</Th>
              <Th>CSAT received</Th>
              {perspectives.map((p) => (
                <Th key={p}>{p}</Th>
              ))}
            </tr>
          </TableHeader>
          <tbody>
            {groupedData.map((row, index) => (
              <tr key={`${row.customerId}-${index}`}>
                <Td>{index + 1}</Td>
                <Td>{row.customerId}</Td>
                <Td>{row.csatSent}</Td>
                <Td>{row.csatReceived}</Td>
                {perspectives.map((p) => (
                  <Td key={p}>{row[p]}</Td>
                ))}
              </tr>
            ))}
            {groupedData.length === 0 && (
              <tr>
                <Td colSpan={4 + perspectives.length}>
                  No matching records found. Ensure your Excel has CUSTOMER_ID, CSAT SENT DATE, CSAT RECEIVED DATE, RATING, and PERSPECTIVE columns.
                </Td>
              </tr>
            )}
            {groupedData.length > 0 && (
              <tr>
                <Td style={{ fontWeight: 700 }}>—</Td>
                <Td style={{ fontWeight: 700 }}>Grand Total</Td>
                <Td style={{ fontWeight: 700 }}>—</Td>
                <Td style={{ fontWeight: 700 }}>—</Td>
                {perspectives.map((p) => (
                  <Td key={`grand-${p}`} style={{ fontWeight: 700 }}>{grandAverages[p]}</Td>
                ))}
              </tr>
            )}
          </tbody>
        </Table>
      </TableContainer>
    </DashboardContainer>
  );
};

export default CSATSurveyDashboard;
```

Now I'll wire this new dashboard into the main App.js and add the navigation button:


```javascript
// ... existing code ...
import Top10FiveRaterAccountsDashboard from './components/Top10FiveRaterAccountsDashboard';
import { csatData, accounts, projects, businessUnits } from './data/dummyData';
import AccountWiseAvgDashboard from './components/AccountWiseAvgDashboard';
import CSATSurveyDashboard from './components/CSATSurveyDashboard';
// ... existing code ...
  const [showTop10FiveRaterAccounts, setShowTop10FiveRaterAccounts] = useState(false);
  const [showAccountWiseAvg, setShowAccountWiseAvg] = useState(false);
  const [showCSATSurvey, setShowCSATSurvey] = useState(false);
// ... existing code ...
  const switchToAccountWiseAvg = () => {
    console.log('Switching to Account-wise Avg (Questions) view');
    setShowExcelData(false);
    setShowGoldenStar(false);
    setShowScoreBased(false);
    setShowAvgRating(false);
    setShowSentiments(false);
    setShowGolden5StarScore(false);
    setShowGolden5StarSentiments(false);
    setShowPerfect5Rater(false);
    setShowLowScore(false);
    setShowTop10Accounts(false);
    setShowTop10FiveRaterAccounts(false);
    setShowAccountWiseAvg(true);
    setShowCSATSurvey(false);
  };
  const switchToCSATSurvey = () => {
    console.log('Switching to CSAT Survey Dashboard view');
    setShowExcelData(false);
    setShowGoldenStar(false);
    setShowScoreBased(false);
    setShowAvgRating(false);
    setShowSentiments(false);
    setShowGolden5StarScore(false);
    setShowGolden5StarSentiments(false);
    setShowPerfect5Rater(false);
    setShowLowScore(false);
    setShowTop10Accounts(false);
    setShowTop10FiveRaterAccounts(false);
    setShowAccountWiseAvg(false);
    setShowCSATSurvey(true);
  };
// ... existing code ...
          ) : showAccountWiseAvg ? (
            <>
              {!excelData ? (
                <FileUpload onDataUpload={handleExcelDataUpload} />
              ) : (
                <AccountWiseAvgDashboard 
                  data={excelData}
                  onBack={() => {
                    setShowAccountWiseAvg(false);
                    setShowExcelData(true);
                  }}
                />
              )}
            </>
          ) : showCSATSurvey ? (
            <>
              {!excelData ? (
                <FileUpload onDataUpload={handleExcelDataUpload} />
              ) : (
                <CSATSurveyDashboard 
                  data={excelData}
                  onBack={() => {
                    setShowCSATSurvey(false);
                    setShowExcelData(true);
                  }}
                />
              )}
            </>
          ) : (
// ... existing code ...
```

Now I need to add the navigation button to the ExcelDataTable component:


```javascript
// ... existing code ...
const ExcelDataTable = ({ data, headers, itemsPerPage = 10, onReload, onSwitchToPerfect5Rater, onSwitchToLowScore, onSwitchToTop10Accounts, onSwitchToTop10FiveRaterAccounts, onSwitchToAccountWiseAvg, onSwitchToCSATSurvey }) => {
// ... existing code ...
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={onSwitchToAccountWiseAvg}
              style={{
                padding: '0.75rem 1.5rem',
                border: '2px solid white',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'translateY(0)';
              }}
              aria-label="Switch to Account-wise Averages"
              title="Switch to Account-wise Averages"
            >
              <Star size={16} />
              Account-wise Avg (Questions)
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={onSwitchToCSATSurvey}
              style={{
                padding: '0.75rem 1.5rem',
                border: '2px solid white',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'translateY(0)';
              }}
              aria-label="Switch to CSAT Survey Data"
              title="Switch to CSAT Survey Data"
            >
              <Upload size={16} />
              Upload CSAT Survey Data
            </button>
          </div>
          {/* 5 Star Accounts navigation removed as requested */}
        </div>
       </div>
       {/* Inline preview removed; provide navigation button instead */}
// ... existing code ...
```

Now let me build to ensure everything compiles correctly:


Perfect! I've successfully added the new "Upload CSAT Survey Data" functionality. Here's what's been implemented:

## New Features Added:

1. **New Navigation Button**: "Upload CSAT Survey Data" button in the analysis options bar
2. **New Dashboard**: `CSATSurveyDashboard` component that shows:
   - **S No.** - Sequential numbering
   - **CUSTOMER_ID** - Customer/Account identifier
   - **CSAT sent** - Count of unique CSAT sent dates per customer
   - **CSAT received** - Count of unique CSAT received dates per customer
   - **Perspective columns** - Dynamic columns for each unique perspective value, showing average ratings

3. **Smart Column Detection**: The dashboard automatically detects:
   - `CUSTOMER_ID` (with fuzzy matching for variations)
   - `CSAT SENT DATE` (with fuzzy matching)
   - `CSAT RECEIVED DATE` (with fuzzy matching)
   - `RATING` (with fuzzy matching)
   - `PERSPECTIVE` (with fuzzy matching)

4. **Grand Total Row**: Shows overall averages for each perspective across all customers

## How to Use:

1. Refresh `http://localhost:3000`
2. Click "Upload Excel Data" 
3. Upload your `New_customer_feedback_analysis.xlsx` file
4. Click "Upload CSAT Survey Data" button
5. View the perspective-wise account averages with CSAT sent/received counts

The dashboard will automatically:
- Group data by customer ID
- Count unique CSAT sent/received dates
- Calculate average ratings for each perspective per customer
- Show grand totals for overall perspective averages

All columns are detected using fuzzy matching, so variations in header names (case, spacing, underscores) will be automatically handled.

---

**User**

move the button  "upload CSAT survey data" in main menu option

---

**Cursor**

I'll move the "Upload CSAT Survey Data" button from the analysis options bar to the main navigation menu alongside "Upload Excel Data".


```javascript
// ... existing code ...
          <NavigationMenu>
            <NavButton 
              active={showExcelData && !showGoldenStar && !showScoreBased && !showAvgRating && !showSentiments && !showGolden5StarScore && !showGolden5StarSentiments && !showPerfect5Rater && !showLowScore && !showTop10Accounts && !showTop10FiveRaterAccounts && !showAccountWiseAvg && !showCSATSurvey} 
              onClick={() => setShowExcelData(true)}
              aria-label="Switch to Excel data upload"
              title="Switch to Excel data upload"
            >
              Upload Excel Data
            </NavButton>
            <NavButton 
              active={showCSATSurvey && !showExcelData && !showGoldenStar && !showScoreBased && !showAvgRating && !showSentiments && !showGolden5StarScore && !showGolden5StarSentiments && !showPerfect5Rater && !showLowScore && !showTop10Accounts && !showTop10FiveRaterAccounts && !showAccountWiseAvg} 
              onClick={switchToCSATSurvey}
              aria-label="Switch to CSAT Survey Data upload"
              title="Switch to CSAT Survey Data upload"
            >
              Upload CSAT Survey Data
            </NavButton>
         </NavigationMenu>
// ... existing code ...
```

Now I'll remove the "Upload CSAT Survey Data" button from the analysis options bar in ExcelDataTable since it's now in the main menu:


```javascript
// ... existing code ...
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={onSwitchToAccountWiseAvg}
              style={{
                padding: '0.75rem 1.5rem',
                border: '2px solid white',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'translateY(0)';
              }}
              aria-label="Switch to Account-wise Averages"
              title="Switch to Account-wise Averages"
            >
              <Star size={16} />
              Account-wise Avg (Questions)
            </button>
          </div>
          {/* 5 Star Accounts navigation removed as requested */}
        </div>
       </div>
       {/* Inline preview removed; provide navigation button instead */}
// ... existing code ...
```

Now let me build to ensure the changes compile correctly:


---

**User**

add horizonal and vertical scorll bar for Account Level Average CSAT Scores - Perspective Wise dashboard 


---

**Cursor**

I'll add horizontal and vertical scroll bars to the CSAT Survey Dashboard to handle wide tables with many perspective columns.


```javascript
// ... existing code ...
const TableContainer = styled.div`
  overflow: auto;
  max-height: 70vh;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 6px;
    
    &:hover {
      background: #94a3b8;
    }
  }
  
  /* Firefox scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
  table-layout: fixed;
`;

const TableHeader = styled.thead`
  background: #f8fafc;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const Th = styled.th`
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.8rem;
  border-bottom: 2px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  width: 120px;
  min-width: 120px;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  &:last-child {
    border-right: none;
  }
  
  /* First few columns can be narrower */
  &:nth-child(1) { width: 80px; min-width: 80px; max-width: 80px; } /* S No. */
  &:nth-child(2) { width: 150px; min-width: 150px; max-width: 150px; } /* CUSTOMER_ID */
  &:nth-child(3) { width: 100px; min-width: 100px; max-width: 100px; } /* CSAT sent */
  &:nth-child(4) { width: 100px; min-width: 100px; max-width: 100px; } /* CSAT received */
`;

const Td = styled.td`
  padding: 0.75rem;
  font-size: 0.8rem;
  color: #374151;
  border-right: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  width: 120px;
  min-width: 120px;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  &:last-child {
    border-right: none;
  }
  
  /* First few columns can be narrower */
  &:nth-child(1) { width: 80px; min-width: 80px; max-width: 80px; } /* S No. */
  &:nth-child(2) { width: 150px; min-width: 150px; max-width: 150px; } /* CUSTOMER_ID */
  &:nth-child(3) { width: 100px; min-width: 100px; max-width: 100px; } /* CSAT sent */
  &:nth-child(4) { width: 100px; min-width: 100px; max-width: 100px; } /* CSAT received */
`;

const ScrollIndicator = styled.div`
  position: sticky;
  top: 0;
  left: 0;
  background: #8b5cf6;
  color: white;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  z-index: 20;
  display: inline-block;
`;

const TableInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.875rem;
  color: #6b7280;
`;
// ... existing code ...
      <TableInfo>
        <div>
          <strong>Total Accounts:</strong> {groupedData.length} | 
          <strong>Total Perspectives:</strong> {perspectives.length}
        </div>
        <ScrollIndicator>
          ↕️ Scroll vertically • ↔️ Scroll horizontally
        </ScrollIndicator>
      </TableInfo>

      <TableContainer>
        <Table role="table" aria-label="Account-wise CSAT scores by perspective">
// ... existing code ...
```

Now let me build to ensure the scroll bar enhancements compile correctly:


Perfect! I've successfully added horizontal and vertical scroll bars to the "Account Level Average CSAT Scores - Perspective Wise" dashboard. Here's what's been enhanced:

## New Scroll Features:

1. **Horizontal Scrolling**: 
   - Table now has a minimum width of 1200px to accommodate many perspective columns
   - Each column has fixed widths (S No.: 80px, CUSTOMER_ID: 150px, CSAT sent/received: 100px each, Perspectives: 120px each)
   - Horizontal scroll bar appears when table exceeds container width

2. **Vertical Scrolling**:
   - Table container has max-height of 70vh (70% of viewport height)
   - Vertical scroll bar appears when content exceeds container height
   - Table header remains sticky at the top during vertical scrolling

3. **Enhanced UI Elements**:
   - **Scroll Indicator**: Purple badge showing "↕️ Scroll vertically • ↔️ Scroll horizontally"
   - **Table Info Bar**: Shows total accounts and perspectives count
   - **Custom Scrollbars**: Styled scrollbars for both WebKit and Firefox browsers
   - **Column Widths**: Optimized column widths for better readability

4. **Responsive Design**:
   - Table maintains fixed layout for consistent column widths
   - Text overflow handling with ellipsis for long content
   - Proper border styling and rounded corners

## How It Works:

- **Many Perspective Columns**: When you have many different perspective values, the table will be wider than the screen, enabling horizontal scrolling
- **Many Accounts**: When you have many customer accounts, the table will be taller than the container, enabling vertical scrolling
- **Sticky Header**: The column headers remain visible during vertical scrolling
- **Scroll Indicators**: Clear visual cues about available scrolling directions

Refresh your browser and navigate to the "Upload CSAT Survey Data" section to see the enhanced scrolling functionality!

---

**User**

explain how  CSAT received calculated for the customer id "CUST0255"

---

**Cursor**

Based on the code in the `CSATSurveyDashboard` component, here's how the "CSAT received" count is calculated for customer ID "CUST0255":

## CSAT Received Calculation Logic:

### 1. **Data Collection Phase:**
```javascript
data.forEach((row) => {
  const customerId = getCustomerId(row);
  if (!customerId) return;

  const csatReceived = getCSATReceivedDate(row);
  // ... other processing
});
```

### 2. **CSAT Received Date Detection:**
The function `getCSATReceivedDate(row)` looks for the CSAT received date in multiple possible column names:
```javascript
function getCSATReceivedDate(row) {
  const candidates = [
    'CSAT RECEIVED DATE', 
    'CSAT_RECEIVED_DATE', 
    'CSAT Received Date', 
    'CSAT Received', 
    'Received Date', 
    'RECEIVED_DATE'
  ];
  
  for (const c of candidates) {
    const v = findValueByHeader(row, c);
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}
```

### 3. **Unique Date Counting:**
For customer "CUST0255", the system:
- Collects ALL rows where `CUSTOMER_ID = "CUST0255"`
- For each row, extracts the CSAT received date value
- Stores these dates in a **Set** (which automatically removes duplicates):
```javascript
if (!groups.has(customerId)) {
  groups.set(customerId, {
    csatSent: new Set(),
    csatReceived: new Set(),  // ← This Set stores unique dates
    perspectives: new Map()
  });
}

const group = groups.get(customerId);
if (csatReceived) group.csatReceived.add(csatReceived); // ← Adds unique dates only
```

### 4. **Final Count Calculation:**
```javascript
const groupedData = Array.from(groups.entries()).map(([customerId, group]) => {
  const row = {
    customerId,
    csatSent: group.csatSent.size,      // ← Count of unique sent dates
    csatReceived: group.csatReceived.size // ← Count of unique received dates
  };
  // ... rest of processing
});
```

## Example for CUST0255:

If your Excel has these rows for CUST0255:
```
Row 1: CUSTOMER_ID="CUST0255", CSAT RECEIVED DATE="2024-01-15"
Row 2: CUSTOMER_ID="CUST0255", CSAT RECEIVED DATE="2024-01-15"  ← Same date
Row 3: CUSTOMER_ID="CUST0255", CSAT RECEIVED DATE="2024-01-20"  ← Different date
Row 4: CUSTOMER_ID="CUST0255", CSAT RECEIVED DATE="2024-01-20"  ← Same date
Row 5: CUSTOMER_ID="CUST0255", CSAT RECEIVED DATE="2024-01-25"  ← Different date
```

**Result**: `CSAT received = 3` (unique dates: 2024-01-15, 2024-01-20, 2024-01-25)

## Key Points:

1. **Deduplication**: Multiple rows with the same date count as 1
2. **Null/Empty Handling**: Rows with empty/null CSAT received dates are ignored
3. **Flexible Column Names**: Works with various header formats (spaces, underscores, case variations)
4. **Real-time Calculation**: Counts are calculated fresh each time the data changes

This approach ensures that even if you have multiple survey responses on the same date, they're counted as a single "CSAT received" event for that customer.

```javascript
data.forEach((row) => {
  const customerId = getCustomerId(row);
  if (!customerId) return;

  const csatReceived = getCSATReceivedDate(row);
  // ... other processing
});
```

```javascript
function getCSATReceivedDate(row) {
  const candidates = [
    'CSAT RECEIVED DATE', 
    'CSAT_RECEIVED_DATE', 
    'CSAT Received Date', 
    'CSAT Received', 
    'Received Date', 
    'RECEIVED_DATE'
  ];
  
  for (const c of candidates) {
    const v = findValueByHeader(row, c);
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}
```

```javascript
if (!groups.has(customerId)) {
  groups.set(customerId, {
    csatSent: new Set(),
    csatReceived: new Set(),  // ← This Set stores unique dates
    perspectives: new Map()
  });
}

const group = groups.get(customerId);
if (csatReceived) group.csatReceived.add(csatReceived); // ← Adds unique dates only
```

```javascript
const groupedData = Array.from(groups.entries()).map(([customerId, group]) => {
  const row = {
    customerId,
    csatSent: group.csatSent.size,      // ← Count of unique sent dates
    csatReceived: group.csatReceived.size // ← Count of unique received dates
  };
  // ... rest of processing
});
```

```plaintext
Row 1: CUSTOMER_ID="CUST0255", CSAT RECEIVED DATE="2024-01-15"
Row 2: CUSTOMER_ID="CUST0255", CSAT RECEIVED DATE="2024-01-15"  ← Same date
Row 3: CUSTOMER_ID="CUST0255", CSAT RECEIVED DATE="2024-01-20"  ← Different date
Row 4: CUSTOMER_ID="CUST0255", CSAT RECEIVED DATE="2024-01-20"  ← Same date
Row 5: CUSTOMER_ID="CUST0255", CSAT RECEIVED DATE="2024-01-25"  ← Different date
```

---

**User**

remove these two columns count(CSAT SENT DATE) as column name CSAT sent,count(CSAT RECEIVED DATE) as column name CSAT received

---

**Cursor**

I'll remove the "CSAT sent" and "CSAT received" columns from the CSAT Survey Dashboard.


```javascript
// ... existing code ...
const Th = styled.th`
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.8rem;
  border-bottom: 2px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  width: 120px;
  min-width: 120px;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  &:last-child {
    border-right: none;
  }
  
  /* First few columns can be narrower */
  &:nth-child(1) { width: 80px; min-width: 80px; max-width: 80px; } /* S No. */
  &:nth-child(2) { width: 150px; min-width: 150px; max-width: 150px; } /* CUSTOMER_ID */
`;

const Td = styled.td`
  padding: 0.75rem;
  font-size: 0.8rem;
  color: #374151;
  border-right: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  width: 120px;
  min-width: 120px;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  &:last-child {
    border-right: none;
  }
  
  /* First few columns can be narrower */
  &:nth-child(1) { width: 80px; min-width: 80px; max-width: 80px; } /* S No. */
  &:nth-child(2) { width: 150px; min-width: 150px; max-width: 150px; } /* CUSTOMER_ID */
`;
// ... existing code ...
const CSATSurveyDashboard = ({ data, onBack }) => {
  const { rows: grouped, grandAverages } = useMemo(() => {
    if (!data || data.length === 0) return { rows: [], grandAverages: {} };

    const groups = new Map(); // customerId -> { perspectives: Map }
    const allPerspectives = new Set();
    const totalRatings = new Map(); // perspective -> { sum: number, count: number }

    data.forEach((row) => {
      const customerId = getCustomerId(row);
      if (!customerId) return;

      const rating = getRating(row);
      const perspective = getPerspective(row);

      if (!groups.has(customerId)) {
        groups.set(customerId, {
          perspectives: new Map()
        });
      }

      const group = groups.get(customerId);

      if (perspective && rating !== undefined) {
        allPerspectives.add(perspective);
        
        if (!group.perspectives.has(perspective)) {
          group.perspectives.set(perspective, []);
        }
        group.perspectives.get(perspective).push(toNumberOrNull(rating));

        // Update grand totals
        if (!totalRatings.has(perspective)) {
          totalRatings.set(perspective, { sum: 0, count: 0 });
        }
        const num = toNumberOrNull(rating);
        if (num !== null) {
          totalRatings.get(perspective).sum += num;
          totalRatings.get(perspective).count += 1;
        }
      }
    });

    // Warn if no data found for any metrics
    const sampleRow = data[0] || {};
    const presentHeaders = Object.keys(sampleRow);
    columnsToAverage.forEach((canonical) => {
      const synonyms = metricSynonyms[canonical] || [canonical];
      const hit = synonyms.some(s => presentHeaders.some(h => normalizeKey(h) === normalizeKey(s)));
      if (!hit) {
        // eslint-disable-next-line no-console
        console.warn(`[AccountWiseAvg] Metric header not found in sheet: ${canonical}. Checked synonyms: ${synonyms.join(', ')}`);
      }
    });

    const rows = Array.from(groups.entries()).map(([customerId, group]) => {
      const row = {
        customerId
      };

      perspectives.forEach(perspective => {
        const ratings = group.perspectives.get(perspective) || [];
        const validRatings = ratings.filter(r => r !== null);
        row[perspective] = validRatings.length > 0 
          ? (validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length).toFixed(2)
          : '0.00';
      });

      return row;
    });

    rows.sort((a, b) => String(a.customerId).localeCompare(String(b.customerId)));

    const grandAverages = {};
    perspectives.forEach(perspective => {
      const totals = totalRatings.get(perspective);
      if (totals && totals.count > 0) {
        grandAverages[perspective] = (totals.sum / totals.count).toFixed(2);
      } else {
        grandAverages[perspective] = '0.00';
      }
    });

    return { rows, grandAverages };
  }, [data]);
// ... existing code ...
          <Table role="table" aria-label="Account-wise CSAT scores by perspective">
            <TableHeader>
              <tr>
                <Th>S No.</Th>
                <Th>CUSTOMER_ID</Th>
                {perspectives.map((p) => (
                  <Th key={p}>{p}</Th>
                ))}
              </tr>
            </TableHeader>
            <tbody>
              {grouped.map((row, index) => (
                <tr key={`${row.customerId}-${index}`}>
                  <Td>{index + 1}</Td>
                  <Td>{row.customerId}</Td>
                  {perspectives.map((p) => (
                    <Td key={p}>{row[p]}</Td>
                  ))}
                </tr>
              ))}
              {grouped.length === 0 && (
                <tr>
                  <Td colSpan={2 + perspectives.length}>
                    No matching records found. Ensure your Excel has CUSTOMER_ID, RATING, and PERSPECTIVE columns.
                  </Td>
                </tr>
              )}
              {grouped.length > 0 && (
                <tr>
                  <Td style={{ fontWeight: 700 }}>—</Td>
                  <Td style={{ fontWeight: 700 }}>Grand Total</Td>
                  {perspectives.map((p) => (
                    <Td key={`grand-${p}`} style={{ fontWeight: 700 }}>{grandAverages[p]}</Td>
                  ))}
                </tr>
              )}
            </tbody>
          </Table>
// ... existing code ...
```

I need to fix some issues in the code. Let me clean it up properly:


```javascript
// ... existing code ...
function getCustomerId(row) {
  const candidates = [
    'CUSTOMER_ID', 'C_id', 'cust_id', 'CID', 'CustomerID', 'Customer_Id', 'CusId', 'Test_C_Id',
    'C Id', 'Customer Id', 'Customer_ID', 'Customer Id ', 'CId', 'AccountID', 'Account_Id', 'Account Id', 'AccId', 'ACC_ID'
  ];
  for (const c of candidates) {
    const v = findValueByHeader(row, c);
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

function getRating(row) {
  const candidates = ['RATING', 'Rating', 'rating', 'RATE', 'Rate', 'rate'];
  for (const c of candidates) {
    const v = findValueByHeader(row, c);
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

function getPerspective(row) {
  const candidates = ['PERSPECTIVE', 'Perspective', 'perspective', 'PERSP', 'Persp', 'persp'];
  for (const c of candidates) {
    const v = findValueByHeader(row, c);
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === '' || value === 'N/A') return null;
  const n = Number(value);
  return isNaN(n) ? null : n;
}

const CSATSurveyDashboard = ({ data, onBack }) => {
  const { rows: grouped, perspectives, grandAverages } = useMemo(() => {
    if (!data || data.length === 0) return { rows: [], perspectives: [], grandAverages: {} };

    const groups = new Map(); // customerId -> { perspectives: Map }
    const allPerspectives = new Set();
    const totalRatings = new Map(); // perspective -> { sum: number, count: number }

    data.forEach((row) => {
      const customerId = getCustomerId(row);
      if (!customerId) return;

      const rating = getRating(row);
      const perspective = getPerspective(row);

      if (!groups.has(customerId)) {
        groups.set(customerId, {
          perspectives: new Map()
        });
      }

      const group = groups.get(customerId);

      if (perspective && rating !== undefined) {
        allPerspectives.add(perspective);
        
        if (!group.perspectives.has(perspective)) {
          group.perspectives.set(perspective, []);
        }
        group.perspectives.get(perspective).push(toNumberOrNull(rating));

        // Update grand totals
        if (!totalRatings.has(perspective)) {
          totalRatings.set(perspective, { sum: 0, count: 0 });
        }
        const num = toNumberOrNull(rating);
        if (num !== null) {
          totalRatings.get(perspective).sum += num;
          totalRatings.get(perspective).count += 1;
        }
      }
    });

    const perspectives = Array.from(allPerspectives).sort();
    
    const rows = Array.from(groups.entries()).map(([customerId, group]) => {
      const row = {
        customerId
      };

      perspectives.forEach(perspective => {
        const ratings = group.perspectives.get(perspective) || [];
        const validRatings = ratings.filter(r => r !== null);
        row[perspective] = validRatings.length > 0 
          ? (validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length).toFixed(2)
          : '0.00';
      });

      return row;
    });

    rows.sort((a, b) => String(a.customerId).localeCompare(String(b.customerId)));

    const grandAverages = {};
    perspectives.forEach(perspective => {
      const totals = totalRatings.get(perspective);
      if (totals && totals.count > 0) {
        grandAverages[perspective] = (totals.sum / totals.count).toFixed(2);
      } else {
        grandAverages[perspective] = '0.00';
      }
    });

    return { rows, perspectives, grandAverages };
  }, [data]);
// ... existing code ...
```

Now let me build to ensure the changes compile correctly:


Perfect! I've successfully removed the "CSAT sent" and "CSAT received" columns from the CSAT Survey Dashboard. Here's what's been changed:

## Removed Features:

1. **CSAT Sent Column**: No longer shows count of unique CSAT sent dates
2. **CSAT Received Column**: No longer shows count of unique CSAT received dates
3. **Related Functions**: Removed `getCSATSentDate()` and `getCSATReceivedDate()` functions
4. **Data Processing**: Simplified data grouping to only handle perspectives and ratings

## Current Dashboard Structure:

The dashboard now shows:
- **S No.** - Sequential numbering
- **CUSTOMER_ID** - Customer/Account identifier  
- **Perspective Columns** - Dynamic columns for each unique perspective value, showing average ratings

## Benefits of Removal:

1. **Cleaner Interface**: Focuses on the core data (customer ratings by perspective)
2. **Simplified Logic**: Removes complexity around date counting and deduplication
3. **Better Performance**: Less data processing and memory usage
4. **Streamlined Table**: Easier to read and navigate

## Updated Error Messages:

The "No matching records found" message now correctly states:
> "Ensure your Excel has CUSTOMER_ID, RATING, and PERSPECTIVE columns"

The dashboard is now more focused on its primary purpose: showing account-level average CSAT scores organized by different perspectives, without the additional complexity of tracking CSAT survey send/receive counts.

Refresh your browser and navigate to the "Upload CSAT Survey Data" section to see the simplified table structure!

---

**User**

give download option in page

---

**Cursor**

I'll add a download option to the CSAT Survey Dashboard so users can export the data as CSV or Excel.


```javascript
// ... existing code ...
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Calculator, ChevronLeft, Download } from 'lucide-react';
// ... existing code ...
const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
  }
`;

const DownloadButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: 0.5rem;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
  }
`;
// ... existing code ...
const CSATSurveyDashboard = ({ data, onBack }) => {
  const { rows: grouped, perspectives, grandAverages } = useMemo(() => {
    if (!data || data.length === 0) return { rows: [], perspectives: [], grandAverages: {} };

    const groups = new Map(); // customerId -> { perspectives: Map }
    const allPerspectives = new Set();
    const totalRatings = new Map(); // perspective -> { sum: number, count: number }

    data.forEach((row) => {
      const customerId = getCustomerId(row);
      if (!customerId) return;

      const rating = getRating(row);
      const perspective = getPerspective(row);

      if (!groups.has(customerId)) {
        groups.set(customerId, {
          perspectives: new Map()
        });
      }

      const group = groups.get(customerId);

      if (perspective && rating !== undefined) {
        allPerspectives.add(perspective);
        
        if (!group.perspectives.has(perspective)) {
          group.perspectives.set(perspective, []);
        }
        group.perspectives.get(perspective).push(toNumberOrNull(rating));

        // Update grand totals
        if (!totalRatings.has(perspective)) {
          totalRatings.set(perspective, { sum: 0, count: 0 });
        }
        const num = toNumberOrNull(rating);
        if (num !== null) {
          totalRatings.get(perspective).sum += num;
          totalRatings.get(perspective).count += 1;
        }
      }
    });

    const perspectives = Array.from(allPerspectives).sort();
    
    const rows = Array.from(groups.entries()).map(([customerId, group]) => {
      const row = {
        customerId
      };

      perspectives.forEach(perspective => {
        const ratings = group.perspectives.get(perspective) || [];
        const validRatings = ratings.filter(r => r !== null);
        row[perspective] = validRatings.length > 0 
          ? (validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length).toFixed(2)
          : '0.00';
      });

      return row;
    });

    rows.sort((a, b) => String(a.customerId).localeCompare(String(b.customerId)));

    const grandAverages = {};
    perspectives.forEach(perspective => {
      const totals = totalRatings.get(perspective);
      if (totals && totals.count > 0) {
        grandAverages[perspective] = (totals.sum / totals.count).toFixed(2);
      } else {
        grandAverages[perspective] = '0.00';
      }
    });

    return { rows, perspectives, grandAverages };
  }, [data]);

  const downloadCSV = () => {
    if (!grouped || grouped.length === 0) return;

    // Create CSV content
    const headers = ['S No.', 'CUSTOMER_ID', ...perspectives];
    const csvRows = [headers];

    // Add data rows
    grouped.forEach((row, index) => {
      const csvRow = [
        index + 1,
        row.customerId,
        ...perspectives.map(p => row[p])
      ];
      csvRows.push(csvRow);
    });

    // Add grand total row
    const grandTotalRow = [
      '—',
      'Grand Total',
      ...perspectives.map(p => grandAverages[p])
    ];
    csvRows.push(grandTotalRow);

    // Convert to CSV string
    const csvContent = csvRows.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'csat_survey_dashboard.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!data || data.length === 0) {
    return (
      <DashboardContainer>
        <EmptyState>
          <Upload size={48} style={{ marginBottom: '1rem', color: '#8b5cf6' }} />
          <h3>No CSAT Survey data available</h3>
          <p>Upload Excel data to view perspective-wise account averages.</p>
        </EmptyState>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <HeaderTitle>
          <Calculator size={24} /> Account Level Average CSAT Scores - Perspective Wise
        </HeaderTitle>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <DownloadButton 
            onClick={downloadCSV}
            aria-label="Download CSV"
            title="Download CSV"
            disabled={!grouped || grouped.length === 0}
          >
            <Download size={16} />
            Download CSV
          </DownloadButton>
          {onBack && (
            <BackButton onClick={onBack} aria-label="Back to Upload CSAT Survey Data" title="Back to Upload CSAT Survey Data">
              <ChevronLeft size={16} /> Back
            </BackButton>
          )}
        </div>
      </DashboardHeader>
// ... existing code ...
```

Now let me build to ensure the download functionality compiles correctly:


Perfect! I've successfully added a download option to the CSAT Survey Dashboard. Here's what's been implemented:

## New Download Features:

1. **Download Button**: 
   - Positioned in the header next to the Back button
   - Styled with a download icon and hover effects
   - Disabled when no data is available

2. **CSV Export Functionality**:
   - Downloads all table data including:
     - S No.
     - CUSTOMER_ID
     - All perspective columns with their average ratings
     - Grand Total row with overall averages
   - File name: `csat_survey_dashboard.csv`
   - Proper CSV formatting with quoted values and comma separation

3. **Smart Download Logic**:
   - Only enables when data is present
   - Includes all perspective columns dynamically
   - Preserves the exact data structure shown in the table
   - Handles special characters and formatting properly

## How It Works:

1. **Click Download**: Users click the "Download CSV" button in the header
2. **Data Processing**: The system creates a CSV with all current table data
3. **File Generation**: A CSV file is generated and automatically downloaded
4. **File Content**: The CSV contains the exact same data shown in the table

## Benefits:

- **Data Portability**: Users can export data for further analysis in Excel, Google Sheets, or other tools
- **Reporting**: Easy to create reports or share data with stakeholders
- **Backup**: Users can save their analysis results locally
- **Integration**: CSV format is universally compatible with data analysis tools

## Usage:

1. Navigate to "Upload CSAT Survey Data"
2. Upload your Excel file
3. View the perspective-wise averages
4. Click "Download CSV" to export the data
5. Open the downloaded CSV in Excel or any spreadsheet application

The download button is positioned prominently in the header for easy access, and the CSV format ensures maximum compatibility across different platforms and applications.

Refresh your browser and test the new download functionality!

---

**User**

on click of Load Data button ,pls don't directly  dispaly the data for the section"Account Level Average CSAT Scores - Perspective Wise",give button "Account Level Average CSAT Scores - Perspective Wise" to display the data

---

**Cursor**

I understand you want to add a button specifically for "Account Level Average CSAT Scores - Perspective Wise" instead of directly displaying the data when clicking "Load Data". I'll modify the FileUpload component to show this button after data is loaded.


```javascript
// ... existing code ...
const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  margin-top: 1rem;
  color: #166534;
  font-weight: 500;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #7c3aed;
    transform: translateY(-1px);
  }
`;

const FileUpload = ({ onDataUpload, onCSATSurveyRequest }) => {
// ... existing code ...
      {uploadStatus && uploadStatus.type === 'success' && (
        <>
          <SuccessMessage>
            <CheckCircle size={20} />
            {uploadStatus.message}
          </SuccessMessage>
          
          <ActionButtonsContainer>
            <ActionButton
              onClick={() => onDataUpload(selectedFile, null, null)}
              aria-label="View Excel data in table format"
              title="View Excel data in table format"
            >
              <FileSpreadsheet size={16} />
              View Excel Data
            </ActionButton>
            
            {onCSATSurveyRequest && (
              <ActionButton
                onClick={onCSATSurveyRequest}
                aria-label="View Account Level Average CSAT Scores - Perspective Wise"
                title="View Account Level Average CSAT Scores - Perspective Wise"
              >
                <Calculator size={16} />
                Account Level Average CSAT Scores - Perspective Wise
              </ActionButton>
            )}
          </ActionButtonsContainer>
        </>
      )}
// ... existing code ...
```

Now I need to update the App.js to pass the onCSATSurveyRequest prop to FileUpload when it's used in the CSAT Survey context:


```javascript
// ... existing code ...
          ) : showCSATSurvey ? (
            <>
              {!excelData ? (
                <FileUpload 
                  onDataUpload={handleExcelDataUpload}
                  onCSATSurveyRequest={() => {
                    // This will be called after data is loaded to switch to CSAT Survey Dashboard
                    // The data is already loaded, so we just need to show the dashboard
                  }}
                />
              ) : (
                <CSATSurveyDashboard 
                  data={excelData}
                  onBack={() => {
                    setShowCSATSurvey(false);
                    setShowExcelData(true);
                  }}
                />
              )}
            </>
          ) : (
// ... existing code ...
```

Actually, let me fix this properly. The issue is that we need to handle the data loading flow correctly. Let me update the FileUpload component to handle the CSAT Survey request properly:


```javascript
// ... existing code ...
const FileUpload = ({ onDataUpload, onCSATSurveyRequest }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadedData, setLoadedData] = useState(null);

  const handleFileSelect = (file) => {
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setSelectedFile(file);
      setUploadStatus(null);
      setLoadedData(null);
    } else {
      setUploadStatus({ type: 'error', message: 'Please select a valid Excel file (.xlsx)' });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadStatus(null);
    setLoadedData(null);
  };

  const processFile = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setUploadStatus(null);

    try {
      const result = await readExcelFile(selectedFile);
      if (result && result.data && result.data.length > 0) {
        setLoadedData(result.data);
        const originalColumnCount = result.originalColumnCount || 20;
        const message = originalColumnCount > 20 
          ? `Successfully loaded ${result.data.length} records from Excel file (showing first 20 columns A to T, ${originalColumnCount - 20} additional columns ignored)`
          : `Successfully loaded ${result.data.length} records from Excel file`;
        setUploadStatus({ type: 'success', message });
      } else {
        setUploadStatus({ type: 'error', message: 'No data found in the Excel file' });
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setUploadStatus({ type: 'error', message: 'Error processing Excel file. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewExcelData = () => {
    if (loadedData) {
      onDataUpload(loadedData, null, loadedData.length);
    }
  };

  const handleCSATSurveyRequest = () => {
    if (loadedData) {
      onCSATSurveyRequest(loadedData);
    }
  };
// ... existing code ...
          <ActionButtonsContainer>
            <ActionButton
              onClick={handleViewExcelData}
              aria-label="View Excel data in table format"
              title="View Excel data in table format"
            >
              <FileSpreadsheet size={16} />
              View Excel Data
            </ActionButton>
            
            {onCSATSurveyRequest && (
              <ActionButton
                onClick={handleCSATSurveyRequest}
                aria-label="View Account Level Average CSAT Scores - Perspective Wise"
                title="View Account Level Average CSAT Scores - Perspective Wise"
              >
                <Calculator size={16} />
                Account Level Average CSAT Scores - Perspective Wise
              </ActionButton>
            )}
          </ActionButtonsContainer>
// ... existing code ...
```

Now I need to update the App.js to properly handle the CSAT Survey request:


```javascript
// ... existing code ...
          ) : showCSATSurvey ? (
            <>
              {!excelData ? (
                <FileUpload 
                  onDataUpload={handleExcelDataUpload}
                  onCSATSurveyRequest={(data) => {
                    setExcelData(data);
                    setExcelHeaders(null);
                    // Now the dashboard will show since excelData is set
                  }}
                />
              ) : (
                <CSATSurveyDashboard 
                  data={excelData}
                  onBack={() => {
                    setShowCSATSurvey(false);
                    setShowExcelData(true);
                  }}
                />
              )}
            </>
          ) : (
// ... existing code ...
```

Now let me build to ensure the changes compile correctly:


Perfect! I've successfully implemented the requested change. Now when you click "Load Data", instead of directly displaying the data, you'll see two action buttons:

## New Flow:

1. **Upload Excel File** → Click "Load Data"
2. **Data Processing** → Shows success message
3. **Action Buttons Appear**:
   - **"View Excel Data"** - Shows the data in the regular Excel table format
   - **"Account Level Average CSAT Scores - Perspective Wise"** - Takes you directly to the CSAT Survey Dashboard

## What Changed:

1. **FileUpload Component**:
   - Now stores loaded data internally instead of immediately calling `onDataUpload`
   - Shows action buttons after successful data loading
   - Each button triggers different actions with the loaded data

2. **CSAT Survey Flow**:
   - When you click "Account Level Average CSAT Scores - Perspective Wise", it sets the data and shows the dashboard
   - The dashboard appears immediately since the data is already loaded

3. **User Experience**:
   - More control over what view to see after loading data
   - Clear separation between regular Excel view and CSAT Survey analysis
   - Both options available after data is loaded

## Benefits:

- **User Choice**: Users can decide which view they want to see
- **Better Workflow**: Clear progression from data loading to analysis
- **Consistent Interface**: Both options are presented as equal choices
- **Efficient**: Data is loaded once and can be viewed in different formats

Now when you:
1. Go to "Upload CSAT Survey Data"
2. Upload your Excel file
3. Click "Load Data"
4. You'll see both buttons and can choose which view you want

Refresh your browser to test the new flow!

---

**User**

remove the button "Account Level Average CSAT Scores - Perspective Wise" and rename the button "View Excel data" to " Account Level Average CSAT Scores - Perspective Wise:"

---

**Cursor**

I'll remove the "Account Level Average CSAT Scores - Perspective Wise" button and rename the "View Excel Data" button to "Account Level Average CSAT Scores - Perspective Wise".


```javascript
// ... existing code ...
          <ActionButtonsContainer>
            <ActionButton
              onClick={handleCSATSurveyRequest}
              aria-label="View Account Level Average CSAT Scores - Perspective Wise"
              title="View Account Level Average CSAT Scores - Perspective Wise"
            >
              <Calculator size={16} />
              Account Level Average CSAT Scores - Perspective Wise
            </ActionButton>
          </ActionButtonsContainer>
// ... existing code ...
```

Now I need to update the App.js to ensure the CSAT Survey section properly handles the data flow:


```javascript
// ... existing code ...
          ) : showCSATSurvey ? (
            <>
              {!excelData ? (
                <FileUpload 
                  onDataUpload={handleExcelDataUpload}
                  onCSATSurveyRequest={(data) => {
                    setExcelData(data);
                    setExcelHeaders(null);
                    // Now the dashboard will show since excelData is set
                  }}
                />
              ) : (
                <CSATSurveyDashboard 
                  data={excelData}
                  onBack={() => {
                    setShowCSATSurvey(false);
                    setShowExcelData(true);
                  }}
                />
              )}
            </>
          ) : (
// ... existing code ...
```

The App.js is already correct. Now let me build to ensure the changes compile correctly:


