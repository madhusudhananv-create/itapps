import React, { useMemo } from 'react';
import styled from 'styled-components';
import { ArrowLeft, ListOrdered, Award, Download } from 'lucide-react';

const DashboardContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin: 1.5rem 0;
  overflow: hidden;
`;

const DashboardHeader = styled.div`
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: white;
  padding: 2rem;
`;

const HeaderTitle = styled.h2`
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const HeaderSubtitle = styled.p`
  margin: 0;
  font-size: 0.95rem;
  opacity: 0.95;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const BackButton = styled.button`
  padding: 0.6rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover { transform: translateY(-2px); }
`;

const DownloadButton = styled.button`
  padding: 0.6rem 1rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover { transform: translateY(-2px); }
`;

const InfoPanel = styled.div`
  background: #e0f2fe;
  border: 1px solid #7dd3fc;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem;
  font-size: 0.875rem;
  color: #075985;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;

  &::-webkit-scrollbar { height: 8px; }
  &::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  &::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1100px;
  table-layout: auto;
`;

const TableHeader = styled.thead`
  background: #f1f5f9;
  position: sticky;
  top: 0;
  z-index: 1;
`;

const TableHeaderCell = styled.th`
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: #0f172a;
  font-size: 0.85rem;
  border-bottom: 2px solid #e2e8f0;
  white-space: normal;
  word-wrap: break-word;
  min-width: 120px;
`;

const TableBody = styled.tbody``;

const GroupRow = styled.tr`
  background: #f8fafc;
`;

const GroupCell = styled.td`
  padding: 0.75rem 1rem;
  font-weight: 700;
  color: #0ea5e9;
  border-bottom: 1px solid #e2e8f0;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #f1f5f9;

  &:last-child { border-bottom: none; }
`;

const TableCell = styled.td`
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #334155;
  border-right: 1px solid #f8fafc;
  white-space: normal;
  word-wrap: break-word;
`;

const FiveStarAccountsDashboard = ({ data, onBackToDashboard }) => {
  // Download function
  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) return;
    
    const csvContent = [
      ['S No.', 'cust_id', 'proj_id', 'OVERALL_EXP', 'Number of 5 received'],
      ...groupOrder.flatMap(custId => 
        groupedRows[custId].rows.map(row => [
          row.sno,
          row.custId,
          row.projId,
          row.overallExp,
          row.numberOfFives
        ])
      )
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Build qualifying project rows and group by account
  const { groupedRows, groupOrder } = useMemo(() => {
    if (!data || data.length === 0) {
      console.log('No data provided to FiveStarAccountsDashboard');
      return { groupedRows: {}, groupOrder: [] };
    }
    
    console.log('Processing data in FiveStarAccountsDashboard:', data.length, 'rows');

    const scoreColumns = [
      'OVERALL_EXP',
      'TIMELINE_ADHERENCE',
      'QUALITY_OF_DELIVERY',
      'TIMELY_RESOURCE_FULFILLMENT',
      'RISK_MANAGEMENT',
      'THOUGHT_LEADERSHIP',
      'RESOURCE_COMPETENCY'
    ];

    const groups = new Map(); // custId -> { totalFives, rows: [] }

         data.forEach((row, index) => {
       const overallExp = parseFloat(row['OVERALL_EXP']) || 0;
       const timelineAdherence = parseFloat(row['TIMELINE_ADHERENCE']) || 0;
       const qualityOfDelivery = parseFloat(row['QUALITY_OF_DELIVERY']) || 0;
       const timelyResourceFulfillment = parseFloat(row['TIMELY_RESOURCE_FULFILLMENT']) || 0;
       const riskManagement = parseFloat(row['RISK_MANAGEMENT']) || 0;
       const thoughtLeadership = parseFloat(row['THOUGHT_LEADERSHIP']) || 0;
       const resourceCompetency = parseFloat(row['RESOURCE_COMPETENCY']) || 0;

       const custId = row.cust_id || 'N/A';
       const projId = row.proj_id || 'N/A';
       const sno = row['S No.'] || (index + 1);

             // Criteria 1: All 5s except RESOURCE_COMPETENCY (should be 0, empty, or N/A)
       const criteria1Met = overallExp === 5 &&
         timelineAdherence === 5 &&
         qualityOfDelivery === 5 &&
         timelyResourceFulfillment === 5 &&
         riskManagement === 5 &&
         thoughtLeadership === 5 &&
         (resourceCompetency === 0 || resourceCompetency === null || resourceCompetency === undefined || row['RESOURCE_COMPETENCY'] === '' || row['RESOURCE_COMPETENCY'] === 'N/A');

       // Criteria 2: RESOURCE_COMPETENCY, TIMELY_RESOURCE_FULFILLMENT, OVERALL_EXP are 5, others are 0, empty, or N/A
       const criteria2Met = (timelineAdherence === 0 || timelineAdherence === null || timelineAdherence === undefined || row['TIMELINE_ADHERENCE'] === '' || row['TIMELINE_ADHERENCE'] === 'N/A') &&
         (qualityOfDelivery === 0 || qualityOfDelivery === null || qualityOfDelivery === undefined || row['QUALITY_OF_DELIVERY'] === '' || row['QUALITY_OF_DELIVERY'] === 'N/A') &&
         (riskManagement === 0 || riskManagement === null || riskManagement === undefined || row['RISK_MANAGEMENT'] === '' || row['RISK_MANAGEMENT'] === 'N/A') &&
         (thoughtLeadership === 0 || thoughtLeadership === null || thoughtLeadership === undefined || row['THOUGHT_LEADERSHIP'] === '' || row['THOUGHT_LEADERSHIP'] === 'N/A') &&
         resourceCompetency === 5 &&
         timelyResourceFulfillment === 5 &&
         overallExp === 5;

      if (!criteria1Met && !criteria2Met) return;

      // Count number of 5s across all seven score columns for this row
      const numberOfFives = scoreColumns.reduce((count, col) => {
        const v = row[col];
        const n = v !== undefined && v !== null && v !== '' && v !== 'N/A' ? Number(v) : 0;
        return count + (n === 5 ? 1 : 0);
      }, 0);

      const projectRow = {
        sno,
        custId,
        projId,
        overallExp: row['OVERALL_EXP'] ?? 'N/A',
        numberOfFives
      };

      if (!groups.has(custId)) {
        groups.set(custId, { totalFives: 0, rows: [] });
      }
      const entry = groups.get(custId);
      entry.rows.push(projectRow);
      entry.totalFives += numberOfFives;
    });

    // Sort groups by totalFives desc, then custId
    const ordered = Array.from(groups.entries())
      .sort((a, b) => {
        if (b[1].totalFives !== a[1].totalFives) return b[1].totalFives - a[1].totalFives;
        return String(a[0]).localeCompare(String(b[0]));
      })
      .map(([custId, value]) => ({ custId, ...value }));

    // Within each group, sort rows by numberOfFives desc then projId
    ordered.forEach(group => {
      group.rows.sort((a, b) => {
        if (b.numberOfFives !== a.numberOfFives) return b.numberOfFives - a.numberOfFives;
        return String(a.projId).localeCompare(String(b.projId));
      });
    });

    const groupedRows = ordered.reduce((acc, g) => { acc[g.custId] = g; return acc; }, {});
    const groupOrder = ordered.map(g => g.custId);
    
    console.log('FiveStarAccountsDashboard results:', {
      totalGroups: groupOrder.length,
      groupOrder: groupOrder,
      sampleGroup: groupOrder.length > 0 ? groupedRows[groupOrder[0]] : null
    });
    
    return { groupedRows, groupOrder };
  }, [data]);

  return (
    <DashboardContainer>
      <DashboardHeader>
        <HeaderTitle>
          <ListOrdered size={28} /> 5 Star Accounts (Grouped by Number of 5s)
        </HeaderTitle>
        <HeaderSubtitle>
          Shows projects that match 5-star criteria, grouped by account and sorted by total number of 5s received.
        </HeaderSubtitle>
                 <HeaderActions>
           <DownloadButton
             onClick={() => downloadCSV(data, 'five_star_accounts_dashboard.csv')}
             title="Download 5 Star Accounts Dashboard as CSV"
           >
             <Download size={16} /> Download
           </DownloadButton>
           {onBackToDashboard && (
             <BackButton onClick={(e) => { e.preventDefault(); onBackToDashboard(); }}>
               <ArrowLeft size={16} /> Back to Dashboard
             </BackButton>
           )}
         </HeaderActions>
      </DashboardHeader>

      <InfoPanel>
        <strong>Inclusion Criteria:</strong>
        <div style={{ marginTop: '0.5rem' }}>
          <p>
            1) OVERALL_EXP, TIMELINE_ADHERENCE, QUALITY_OF_DELIVERY, TIMELY_RESOURCE_FULFILLMENT,
            RISK_MANAGEMENT, THOUGHT_LEADERSHIP must be 5; RESOURCE_COMPETENCY must be 0/empty/N/A.
          </p>
          <p>
            2) RESOURCE_COMPETENCY, TIMELY_RESOURCE_FULFILLMENT, OVERALL_EXP must be 5; TIMELINE_ADHERENCE,
            QUALITY_OF_DELIVERY, RISK_MANAGEMENT, THOUGHT_LEADERSHIP must be 0/empty/N/A.
          </p>
          <p>
            Number of 5 received = count of 5s across all seven rating columns for the row.
          </p>
        </div>
      </InfoPanel>

      <TableContainer>
        <Table role="table" aria-label="5 Star Accounts grouped by number of 5s">
          <TableHeader>
            <tr>
              <TableHeaderCell style={{ minWidth: 80, width: 80 }}>S No.</TableHeaderCell>
              <TableHeaderCell style={{ minWidth: 140 }}>cust_id</TableHeaderCell>
              <TableHeaderCell style={{ minWidth: 140 }}>proj_id</TableHeaderCell>
              <TableHeaderCell style={{ minWidth: 140 }}>OVERALL_EXP</TableHeaderCell>
              <TableHeaderCell style={{ minWidth: 180 }}>Number of 5 received</TableHeaderCell>
            </tr>
          </TableHeader>
          <TableBody>
            {groupOrder.length === 0 ? (
              <tr>
                <TableCell colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  <Award size={24} style={{ verticalAlign: 'middle', marginRight: 8, color: '#0ea5e9' }} />
                  No qualifying rows found. Upload data to see results.
                </TableCell>
              </tr>
            ) : (
              groupOrder.map((custId) => (
                <React.Fragment key={`group-${custId}`}>
                  <GroupRow>
                    <GroupCell colSpan={5}>
                      Account: {custId} • Total 5s across qualifying projects: {groupedRows[custId].totalFives}
                    </GroupCell>
                  </GroupRow>
                  {groupedRows[custId].rows.map((r, idx) => (
                    <TableRow key={`row-${custId}-${r.projId}-${idx}`}>
                      <TableCell>{r.sno}</TableCell>
                      <TableCell>{r.custId}</TableCell>
                      <TableCell>{r.projId}</TableCell>
                      <TableCell>{r.overallExp}</TableCell>
                      <TableCell>{r.numberOfFives}</TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </DashboardContainer>
  );
};

export default FiveStarAccountsDashboard;
