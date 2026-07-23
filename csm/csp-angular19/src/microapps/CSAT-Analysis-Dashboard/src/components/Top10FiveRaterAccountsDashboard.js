import React, { useMemo } from 'react';
import styled from 'styled-components';
import { ListOrdered, ArrowLeft, Trophy, Download } from 'lucide-react';

const DashboardContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin: 1.5rem 0;
  overflow: hidden;
`;

const DashboardHeader = styled.div`
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
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
  background: #dbeafe;
  border: 1px solid #93c5fd;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem;
  font-size: 0.875rem;
  color: #1e3a8a;
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
  min-width: 1000px;
  table-layout: auto;
`;

const TableHeader = styled.thead`
  background: #eff6ff;
  position: sticky;
  top: 0;
  z-index: 1;
`;

const TableHeaderCell = styled.th`
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: #1e3a8a;
  font-size: 0.85rem;
  border-bottom: 2px solid #e2e8f0;
  white-space: normal;
  word-wrap: break-word;
  cursor: pointer;
  user-select: none;

  &:hover {
    background: #dbeafe;
  }
`;

const TableBody = styled.tbody``;

const GroupRow = styled.tr`
  background: #f8fafc;
`;

const GroupCell = styled.td`
  padding: 0.75rem 1rem;
  font-weight: 700;
  color: #1d4ed8;
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
`;

const Top10FiveRaterAccountsDashboard = ({ data, onBackToDashboard }) => {
  const { topGroups, groupedRows } = useMemo(() => {
    if (!data || data.length === 0) return { topGroups: [], groupedRows: {} };

    const scoreColumns = [
      'OVERALL_EXP',
      'TIMELINE_ADHERENCE',
      'QUALITY_OF_DELIVERY',
      'TIMELY_RESOURCE_FULFILLMENT',
      'RISK_MANAGEMENT',
      'THOUGHT_LEADERSHIP',
      'RESOURCE_COMPETENCY'
    ];

    const isZeroEmptyNA = (v) => v === 0 || v === null || v === undefined || v === '' || v === 'N/A';
    const toNum = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    // Build qualifying project rows
    const groups = new Map(); // custId -> { totalFives, rows: [] }
    data.forEach((row, index) => {
      // Check if required columns exist, use 0 as fallback for missing columns
      const overallExp = toNum(row['OVERALL_EXP'] || 0);
      const timelineAdherence = toNum(row['TIMELINE_ADHERENCE'] || 0);
      const qualityOfDelivery = toNum(row['QUALITY_OF_DELIVERY'] || 0);
      const timelyResourceFulfillment = toNum(row['TIMELY_RESOURCE_FULFILLMENT'] || 0);
      const riskManagement = toNum(row['RISK_MANAGEMENT'] || 0);
      const thoughtLeadership = toNum(row['THOUGHT_LEADERSHIP'] || 0);
      const resourceCompetency = toNum(row['RESOURCE_COMPETENCY'] || 0);

      const rawRC = row['RESOURCE_COMPETENCY'];
      const rawTA = row['TIMELINE_ADHERENCE'];
      const rawQD = row['QUALITY_OF_DELIVERY'];
      const rawRM = row['RISK_MANAGEMENT'];
      const rawTL = row['THOUGHT_LEADERSHIP'];

      // Criteria 1: ALL conditions must be met:
      // OVERALL_EXP = 5 AND TIMELINE_ADHERENCE = 5 AND QUALITY_OF_DELIVERY = 5 AND TIMELY_RESOURCE_FULFILLMENT = 5 AND RISK_MANAGEMENT = 5 AND THOUGHT_LEADERSHIP = 5 AND RESOURCE_COMPETENCY = 0/empty/N/A
      const criteria1Met = overallExp === 5 &&
        timelineAdherence === 5 &&
        qualityOfDelivery === 5 &&
        timelyResourceFulfillment === 5 &&
        riskManagement === 5 &&
        thoughtLeadership === 5 &&
        (resourceCompetency === 0 || isZeroEmptyNA(rawRC));

      // Criteria 2: ALL conditions must be met:
      // RESOURCE_COMPETENCY = 5 AND TIMELY_RESOURCE_FULFILLMENT = 5 AND OVERALL_EXP = 5 AND TIMELINE_ADHERENCE = 0/empty/N/A AND QUALITY_OF_DELIVERY = 0/empty/N/A AND RISK_MANAGEMENT = 0/empty/N/A AND THOUGHT_LEADERSHIP = 0/empty/N/A
      const criteria2Met = resourceCompetency === 5 &&
        timelyResourceFulfillment === 5 &&
        overallExp === 5 &&
        (timelineAdherence === 0 || isZeroEmptyNA(rawTA)) &&
        (qualityOfDelivery === 0 || isZeroEmptyNA(rawQD)) &&
        (riskManagement === 0 || isZeroEmptyNA(rawRM)) &&
        (thoughtLeadership === 0 || isZeroEmptyNA(rawTL));

      // Include project if EITHER Criteria 1 OR Criteria 2 is met (but ALL conditions within the chosen criteria must be met)
      if (!criteria1Met && !criteria2Met) return;

      const custId = row.cust_id || row.C_id || 'N/A';
      const projId = row.proj_id || row.P_id || 'N/A';
      const sno = row['S No.'] || (index + 1);

      // Calculate number of 5s for this project
      const numberOfFives = scoreColumns.reduce((count, col) => {
        const v = row[col];
        const n = v !== undefined && v !== null && v !== '' && v !== 'N/A' ? Number(v) : 0;
        return count + (n === 5 ? 1 : 0);
      }, 0);

      if (!groups.has(custId)) {
        groups.set(custId, { totalFives: 0, rows: [] });
      }
      const entry = groups.get(custId);
      entry.rows.push({ sno, custId, projId, numberOfFives });
      entry.totalFives += numberOfFives; // Sum of all 5s across qualifying projects
    });

    // Order groups by total 5s received desc and take top 10
    const ordered = Array.from(groups.entries())
      .sort((a, b) => {
        if (b[1].totalFives !== a[1].totalFives) return b[1].totalFives - a[1].totalFives;
        return String(a[0]).localeCompare(String(b[0]));
      })
      .slice(0, 20)
      .map(([custId, value]) => ({ custId, ...value }));

    // Calculate ranks with ties
    let currentRank = 1;
    let currentTotalFives = null;
    const rankedGroups = ordered.map((group, index) => {
      if (currentTotalFives !== null && group.totalFives < currentTotalFives) {
        currentRank = index + 1;
      }
      currentTotalFives = group.totalFives;
      return { ...group, rank: currentRank };
    });

    console.log('Top 10 Accounts by Total 5s:', rankedGroups.map((g) => ({
      rank: g.rank,
      custId: g.custId,
      totalFives: g.totalFives,
      projectCount: g.rows.length
    })));

    // Within each group, sort rows by numberOfFives desc then projId
    rankedGroups.forEach(group => {
      group.rows.sort((a, b) => {
        if (b.numberOfFives !== a.numberOfFives) return b.numberOfFives - a.numberOfFives;
        return String(a.projId).localeCompare(String(b.projId));
      });
    });

    const groupedRows = rankedGroups.reduce((acc, g) => { acc[g.custId] = g; return acc; }, {});
    const topGroups = rankedGroups.map(g => g.custId);
    return { topGroups, groupedRows };
  }, [data]);

  const downloadCSV = (data, filename) => {
    const csvContent = [
      ['S No.', 'cust_id', 'proj_id', 'Number of 5s'],
      ...data.flatMap(group => 
        group.rows.map(row => [
          row.sno,
          row.custId,
          row.projId,
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

  return (
    <DashboardContainer>
      <DashboardHeader>
        <HeaderTitle>
          <ListOrdered size={28} /> Top 10 - 5 Rater Accounts
        </HeaderTitle>
        <HeaderSubtitle>
          Shows only the top 10 accounts with projects meeting strict 5-star criteria, ranked in decreasing order by total number of 5s received across all projects.
        </HeaderSubtitle>
        <HeaderActions>
          <DownloadButton
            onClick={() => downloadCSV(topGroups.map(custId => groupedRows[custId]), 'top_10_five_rater_accounts.csv')}
            title="Download Top 10 - 5 Rater Accounts as CSV"
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
            <strong>Top 10 Accounts Only:</strong> This dashboard displays only the top 10 accounts ranked by total number of 5s received.
          </p>
          <p>
            <strong>Ranking Criteria:</strong> Accounts are sorted in decreasing order based on total number of 5s received across all their qualifying projects. Accounts with equal total 5s receive the same rank.
          </p>
          <p>
            <strong>Tie-Breaking:</strong> When multiple accounts have the same total 5s, they receive the same rank, and the next rank is skipped accordingly.
          </p>
          <p>
            <strong>Project Inclusion Rules:</strong> Projects are included if EITHER Criteria 1 OR Criteria 2 is met (ALL conditions within the chosen criteria must be met):
          </p>
          <div style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
            <p><strong>Criteria 1 (ALL conditions must be met):</strong></p>
            <ul style={{ marginLeft: '1rem', marginTop: '0.25rem' }}>
              <li>OVERALL_EXP = 5, AND</li>
              <li>TIMELINE_ADHERENCE = 5, AND</li>
              <li>QUALITY_OF_DELIVERY = 5, AND</li>
              <li>TIMELY_RESOURCE_FULFILLMENT = 5, AND</li>
              <li>RISK_MANAGEMENT = 5, AND</li>
              <li>THOUGHT_LEADERSHIP = 5, AND</li>
              <li>RESOURCE_COMPETENCY = 0/empty/N/A</li>
            </ul>
            <p><strong>Criteria 2 (ALL conditions must be met):</strong></p>
            <ul style={{ marginLeft: '1rem', marginTop: '0.25rem' }}>
              <li>RESOURCE_COMPETENCY = 5, AND</li>
              <li>TIMELY_RESOURCE_FULFILLMENT = 5, AND</li>
              <li>OVERALL_EXP = 5, AND</li>
              <li>TIMELINE_ADHERENCE = 0/empty/N/A, AND</li>
              <li>QUALITY_OF_DELIVERY = 0/empty/N/A, AND</li>
              <li>RISK_MANAGEMENT = 0/empty/N/A, AND</li>
              <li>THOUGHT_LEADERSHIP = 0/empty/N/A</li>
            </ul>
          </div>
          <p>
            <strong>Total 5s:</strong> Sum of all 5-star ratings across all qualifying projects for each account.
          </p>
          <p>
            <strong>Number of 5s:</strong> Count of 5-star ratings for each individual qualifying project.
          </p>
        </div>
      </InfoPanel>

      <TableContainer>
        <Table role="table" aria-label="Top 10 - 5 Rater Accounts">
          <TableHeader>
            <tr>
              <TableHeaderCell style={{ minWidth: 80, width: 80 }}>S No.</TableHeaderCell>
              <TableHeaderCell style={{ minWidth: 140 }}>cust_id</TableHeaderCell>
              <TableHeaderCell style={{ minWidth: 140 }}>proj_id</TableHeaderCell>
              <TableHeaderCell style={{ minWidth: 140 }}>Number of 5s</TableHeaderCell>
            </tr>
          </TableHeader>
          <TableBody>
            {topGroups.length === 0 ? (
              <tr>
                <TableCell colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  <Trophy size={24} style={{ verticalAlign: 'middle', marginRight: 8, color: '#1d4ed8' }} />
                  No qualifying accounts found. Upload data to see results.
                </TableCell>
              </tr>
            ) : (
              topGroups.map((custId, index) => (
                <React.Fragment key={`group-${custId}`}>
                  <GroupRow>
                    <GroupCell colSpan={4}>
                      Rank #{groupedRows[custId].rank} • Account: {custId} • Total 5s: {groupedRows[custId].totalFives} • Projects: {groupedRows[custId].rows.length}
                    </GroupCell>
                  </GroupRow>
                  {groupedRows[custId].rows.map((r, idx) => (
                    <TableRow key={`row-${custId}-${r.projId}-${idx}`}>
                      <TableCell>{r.sno}</TableCell>
                      <TableCell>{r.custId}</TableCell>
                      <TableCell>{r.projId}</TableCell>
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

export default Top10FiveRaterAccountsDashboard;


