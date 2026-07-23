import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Calculator, ChevronLeft, Upload, Download } from 'lucide-react';

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
  &:nth-child(3) { width: 150px; min-width: 150px; max-width: 150px; } /* BUSINESS UNIT */
  &:nth-child(4) { width: 100px; min-width: 100px; max-width: 100px; } /* CATEGORY */
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
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.4;
  
  &:last-child {
    border-right: none;
  }
  
  /* First few columns can be narrower */
  &:nth-child(1) { width: 80px; min-width: 80px; max-width: 80px; } /* S No. */
  &:nth-child(2) { width: 150px; min-width: 150px; max-width: 150px; } /* CUSTOMER_ID */
  &:nth-child(3) { width: 150px; min-width: 150px; max-width: 150px; } /* BUSINESS UNIT */
  &:nth-child(4) { width: 100px; min-width: 100px; max-width: 100px; } /* CATEGORY */
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
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
          'CUST_ID', 'CUSTOMER_ID', 'C_id', 'cust_id', 'CID', 'CustomerID', 'Customer_Id', 'CusId', 'Test_C_Id',
    'C Id', 'Customer Id', 'Customer_ID', 'Customer Id ', 'CId', 'AccountID', 'Account_Id', 'Account Id', 'AccId', 'ACC_ID'
  ];
  for (const c of candidates) {
    const v = findValueByHeader(row, c);
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

function getBusinessUnit(row) {
  const candidates = [
    'BUSINESS UNIT', 'BUSSINESS UNIT', 'Business Unit', 'Business_Unit', 'BUSINESS-UNIT', 'BUSSINESS-UNIT',
    'BU', 'BusinessUnit', 'Business_Unit', 'Business Unit ', 'BU_NAME', 'Business Unit Name'
  ];
  for (const c of candidates) {
    const v = findValueByHeader(row, c);
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return 'N/A';
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

function getQuestionCategory(row) {
  const candidates = ['QUESTION_CATEGORY', 'Question Category', 'Question_Category', 'QUESTION-CATEGORY', 'QuestionCategory'];
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

function calculateCategory(perspective, rating) {
  const criticalPerspectives = [
    'Resource Competency', 'Resource_Competency', 'RESOURCE_COMPETENCY', 'Resource Competency ',
    'Timely Resource Fulfillment', 'Timely_Resource_Fulfillment', 'TIMELY_RESOURCE_FULFILLMENT', 'Timely Resource Fulfillment ',
    'Overall Experience', 'Overall_Experience', 'OVERALL_EXPERIENCE', 'Overall Experience '
  ];
  
  const isCriticalPerspective = criticalPerspectives.some(cp => 
    perspective && perspective.toLowerCase().replace(/[^a-z0-9]/g, '') === cp.toLowerCase().replace(/[^a-z0-9]/g, '')
  );
  
  if (isCriticalPerspective) {
    const numRating = toNumberOrNull(rating);
    if (numRating === null || numRating === 0) {
      return 1;
    }
  }
  
  return 2;
}

const CSATSurveyDashboard = ({ data, onBack }) => {
  const { rows: grouped, perspectives, grandAverages } = useMemo(() => {
    if (!data || data.length === 0) return { rows: [], perspectives: [], grandAverages: {} };

    // Filter out rows with QUESTION_CATEGORY = "Qualitative Feedback"
    const filteredData = data.filter(row => {
      const questionCategory = getQuestionCategory(row);
      return questionCategory !== 'Qualitative Feedback';
    });

    const groups = new Map(); // customerId -> { businessUnit: string, perspectives: Map, category: number }
    const allPerspectives = new Set();
    const totalRatings = new Map(); // perspective -> { sum: number, count: number }

    filteredData.forEach((row) => {
      const customerId = getCustomerId(row);
      if (!customerId) return;

      const businessUnit = getBusinessUnit(row);
      const rating = getRating(row);
      const perspective = getPerspective(row);

      if (!groups.has(customerId)) {
        groups.set(customerId, {
          businessUnit,
          perspectives: new Map(),
          category: 2 // Default category
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

        // Calculate category based on critical perspectives
        const calculatedCategory = calculateCategory(perspective, rating);
        if (calculatedCategory === 1) {
          group.category = 1; // If any critical perspective has rating 0/N/A/Blank, set category to 1
        }
      }
    });

    const perspectives = Array.from(allPerspectives).sort();
    
    const rows = Array.from(groups.entries()).map(([customerId, group]) => {
      const row = {
        customerId,
        businessUnit: group.businessUnit,
        category: group.category
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
    const headers = ['S No.', 'CUSTOMER_ID', 'BUSINESS UNIT', 'CATEGORY', ...perspectives];
    const csvRows = [headers];

    // Add data rows
    grouped.forEach((row, index) => {
      const csvRow = [
        index + 1,
        row.customerId,
        row.businessUnit,
        row.category,
        ...perspectives.map(p => row[p])
      ];
      csvRows.push(csvRow);
    });

    // Add grand total row
    const grandTotalRow = [
      '—',
      'Grand Total',
      '—',
      '—',
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
          <Calculator size={24} /> Account/BU wise Average CSAT Scores - Perspective Wise
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

      <TableInfo>
        <div>
          <strong>Total Accounts:</strong> {grouped.length} | 
          <strong>Total Perspectives:</strong> {perspectives.length}
        </div>
        <ScrollIndicator>
          ↕️ Scroll vertically • ↔️ Scroll horizontally
        </ScrollIndicator>
      </TableInfo>

      <TableContainer>
        <Table role="table" aria-label="Account-wise CSAT scores by perspective">
          <TableHeader>
            <tr>
              <Th>S No.</Th>
              <Th>CUSTOMER_ID</Th>
              <Th>BUSINESS UNIT</Th>
              <Th>CATEGORY</Th>
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
                <Td>{row.businessUnit}</Td>
                <Td>{row.category}</Td>
                {perspectives.map((p) => (
                  <Td key={p}>{row[p]}</Td>
                ))}
              </tr>
            ))}
            {grouped.length === 0 && (
              <tr>
                <Td colSpan={4 + perspectives.length}>
                  No matching records found. Ensure your Excel has CUSTOMER_ID, BUSINESS UNIT, RATING, and PERSPECTIVE columns.
                </Td>
              </tr>
            )}
            {grouped.length > 0 && (
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