import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Download, ChevronLeft } from 'lucide-react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { useCSATContext } from '../context/CSATContext';
import { formatDateToMMDDYYYY } from '../utils/dateUtils';
import { normalizeBusinessUnitDisplay } from '../utils/normalizeBusinessUnitDisplay';
import {
  TOP10_ACCOUNT_ORDER,
  TOP10_SURVEY_ACCOUNT_ORDER,
  isTop10AccountName,
  normalizeTop10AccountName,
  computeEffectiveTop10AccountNames,
  isEffectiveTop10AccountName,
} from '../utils/top10Accounts';

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding: 0.85rem 1.25rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  gap: 0.5rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeaderTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  max-height: 600px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`;

const Th = styled.th`
  background: #dbeafe; /* Light blue 1 */
  color: #374151;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 0.6rem 0.75rem;
  text-align: center;
  border-bottom: 2px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
  white-space: nowrap;
  text-align: center;
`;

const DownloadButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem auto;
  
  &:hover {
    background: #059669;
    transform: translateY(-1px);
  }
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

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    justify-content: center;
    margin-top: 1rem;
  }
`;

const AccountwisePercentageDataForLessThan4RaterDashboard = ({ excelData, onBack }) => {
  const [accountCustomerFilter, setAccountCustomerFilter] = useState('');
  const [customerNameSearch, setCustomerNameSearch] = useState('');
  const [showTop10, setShowTop10] = useState(false);
  const [showBuWise, setShowBuWise] = useState(false);
  const { csatCycleStartDateFormatted } = useCSATContext();
  
  // Utility function to compare dates (MM-DD-YYYY format)
  const isDateGreaterThanOrEqual = (date1, date2) => {
    if (!date1 || !date2) return false;
    
    const [month1, day1, year1] = date1.split('-').map(Number);
    const [month2, day2, year2] = date2.split('-').map(Number);
    
    if (year1 !== year2) return year1 > year2;
    if (month1 !== month2) return month1 > month2;
    return day1 >= day2;
  };
  
  // Process data to show ratings <4 counts for each perspective
  const processedData = useMemo(() => {
    if (!excelData || !excelData.data || excelData.data.length === 0) {
      console.log('No data available for processing');
      return { data: [], perspectives: [] };
    }

    const data = excelData.data;
    console.log('Processing data for <4 rater dashboard:', data.length, 'rows');

    // Column detection
    const customerIdColumn = Object.keys(data[0]).find(col => 
      col === 'CUSTOMER_ID' || col === 'CUST_ID' || col === 'Customer ID'
    ) || 'CUSTOMER_ID';

    const customerNameColumn = Object.keys(data[0]).find(col => 
      col === 'CUSTOMER NAME' || col === 'TYPE OF ACCOUNT' || col === 'Account Name'
    ) || 'CUSTOMER NAME';

    const businessUnitColumn = Object.keys(data[0]).find(col =>
      col === 'BUSSINESS UNIT' || col === 'BUSINESS UNIT' || col === 'Business Unit' || col === 'BU'
    ) || 'BUSSINESS UNIT';

    const perspectiveColumn = Object.keys(data[0]).find(col =>
      col === 'PERSPECTIVE' || col === 'Perspective'
    ) || 'PERSPECTIVE';

    const ratingColumn = Object.keys(data[0]).find(col =>
      col === 'RATING' || col === 'Rating'
    ) || 'RATING';

    // SP-fetched data uses "CSAT SENT/RECEIVED DATE"; legacy Excel uploads used "CSS_SENT/RECEIVED_DATE"
    const sentDateColumn = Object.keys(data[0]).find(col =>
      col === 'CSS_SENT_DATE' || col === 'CSAT SENT DATE'
    ) || 'CSS_SENT_DATE';

    const receivedDateColumn = Object.keys(data[0]).find(col =>
      col === 'CSS_RECEIVED_DATE' || col === 'CSAT RECEIVED DATE'
    ) || 'CSS_RECEIVED_DATE';

    console.log('Detected columns:', {
        customerIdColumn,
      customerNameColumn,
      businessUnitColumn,
      perspectiveColumn,
      ratingColumn,
      sentDateColumn,
      receivedDateColumn
    });

    // Get unique perspectives
    const perspectives = [...new Set(
      data.map(row => row[perspectiveColumn])
        .filter(p => p && p !== '' && p !== 'N/A')
    )];

    console.log('Found perspectives:', perspectives);

    // Calculate CSS counts from second sheet with date filtering
    const customerCSSCounts = {};
    const buCSSCounts = {}; // Track CSS counts by Business Unit
    const top10Customers = new Set(); // Track Top 10 customers
    const custIdToNormalizedTop10Name = {}; // custId -> normalized name, resolved to effective Top 10 after the loop

    if (excelData.secondSheetData && excelData.secondSheetData.length > 0) {
      console.log('Processing second sheet data for CSS counts...');
      console.log('CSAT cycle start date for filtering:', csatCycleStartDateFormatted);

      // Column names can differ between the second sheet and the detail sheet
      // (e.g. SP-fetched data vs legacy Excel upload), so resolve separately.
      const s2Keys = Object.keys(excelData.secondSheetData[0] || {});
      const s2SentDateColumn = s2Keys.find(col => col === 'CSS_SENT_DATE' || col === 'CSAT SENT DATE') || 'CSS_SENT_DATE';
      const s2ReceivedDateColumn = s2Keys.find(col => col === 'CSS_RECEIVED_DATE' || col === 'CSAT RECEIVED DATE') || 'CSS_RECEIVED_DATE';
      const s2BusinessUnitColumn = s2Keys.find(col => col === 'BUSSINESS UNIT' || col === 'BUSINESS UNIT') || 'BUSSINESS UNIT';

      excelData.secondSheetData.forEach(row => {
        const custId = row['CUST_ID'] || row['CUSTOMER_ID'];
        const businessUnit = normalizeBusinessUnitDisplay(row[s2BusinessUnitColumn] || 'N/A');

        if (custId) {
          // Top 10 membership is defined solely by the shared, curated account list — not by this
          // row's TYPE OF ACCOUNT / "Top 10" flag, which can go stale when the roster changes.
          const customerNameForTop10 = (row['CUSTOMER NAME'] ?? row['Customer Name'] ?? row['CUST_NM'] ?? '').toString().trim();
          if (isTop10AccountName(customerNameForTop10)) {
            const normalizedName = normalizeTop10AccountName(customerNameForTop10);
            if (normalizedName) {
              custIdToNormalizedTop10Name[custId] = normalizedName;
            }
          }

          if (!customerCSSCounts[custId]) {
            customerCSSCounts[custId] = {
              cssSentCount: 0,
              cssReceivedCount: 0,
              nonStaffingReceivedCount: 0,
              staffingReceivedCount: 0
            };
          }

          // Count sent date with date filtering
          if (row[s2SentDateColumn] && row[s2SentDateColumn] !== '' && row[s2SentDateColumn] !== 'N/A') {
            const sentDateFormatted = formatDateToMMDDYYYY(row[s2SentDateColumn]);
            if (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted)) {
              customerCSSCounts[custId].cssSentCount++;
            }
          }

          // Count received date with date filtering
          const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
          const isCompletedStatus = statusVal === 'completed';
          const hasReceivedDateValue = row[s2ReceivedDateColumn] && row[s2ReceivedDateColumn] !== '' && row[s2ReceivedDateColumn] !== 'N/A';
          const receivedDateFormatted = hasReceivedDateValue ? formatDateToMMDDYYYY(row[s2ReceivedDateColumn]) : null;
          const receivedDateWithinCycle = hasReceivedDateValue && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted));
          {
            if (isCompletedStatus && receivedDateWithinCycle) {
              customerCSSCounts[custId].cssReceivedCount++;
              
              // Count by REVENUE_TYPE for staffing/non-staffing
              const revenueType = row['REVENUE_TYPE'] || '';
              
              // Non-staffing: Time and Material, Fixed Bid, Managed Services
              if (revenueType === 'Time and Material' || 
                  revenueType === 'Fixed Bid' || 
                  revenueType === 'Managed Services') {
                customerCSSCounts[custId].nonStaffingReceivedCount++;
              }
              
              // Staffing: Fixed Monthly
              if (revenueType === 'Fixed Monthly') {
                customerCSSCounts[custId].staffingReceivedCount++;
              }
            }
          }
        }
        
        // Calculate CSS counts by Business Unit
        if (businessUnit && businessUnit !== 'N/A') {
          if (!buCSSCounts[businessUnit]) {
            buCSSCounts[businessUnit] = {
              cssSentCount: 0,
              cssReceivedCount: 0,
              nonStaffingReceivedCount: 0,
              staffingReceivedCount: 0
            };
          }
          
          // Count sent date with date filtering for BU
          if (row[s2SentDateColumn] && row[s2SentDateColumn] !== '' && row[s2SentDateColumn] !== 'N/A') {
            const sentDateFormatted = formatDateToMMDDYYYY(row[s2SentDateColumn]);
            if (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted)) {
              buCSSCounts[businessUnit].cssSentCount++;
            }
          }

          // Count received date with date filtering for BU
          const buStatusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
          const buIsCompletedStatus = buStatusVal === 'completed';
          const buHasReceivedDateValue = row[s2ReceivedDateColumn] && row[s2ReceivedDateColumn] !== '' && row[s2ReceivedDateColumn] !== 'N/A';
          const buReceivedDateFormatted = buHasReceivedDateValue ? formatDateToMMDDYYYY(row[s2ReceivedDateColumn]) : null;
          const buReceivedDateWithinCycle = buHasReceivedDateValue && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(buReceivedDateFormatted, csatCycleStartDateFormatted));
          {
            if (buIsCompletedStatus && buReceivedDateWithinCycle) {
              buCSSCounts[businessUnit].cssReceivedCount++;
              
              // Count by REVENUE_TYPE for staffing/non-staffing by Business Unit
              const revenueType = row['REVENUE_TYPE'] || '';
              
              // Non-staffing: Time and Material, Fixed Bid, Managed Services
              if (revenueType === 'Time and Material' || 
                  revenueType === 'Fixed Bid' || 
                  revenueType === 'Managed Services') {
                buCSSCounts[businessUnit].nonStaffingReceivedCount++;
              }
              
              // Staffing: Fixed Monthly
              if (revenueType === 'Fixed Monthly') {
                buCSSCounts[businessUnit].staffingReceivedCount++;
              }
            }
          }
        }
      });
      
      // Compute the effective Top 10 roster for this dataset (original 10, backfilled from the
      // fixed fallback order when an original account has zero Polled), keyed off each candidate
      // customer's own cssSentCount (Polled), then resolve custIds against that effective set.
      const polledByAccountName = {};
      Object.entries(custIdToNormalizedTop10Name).forEach(([custId, normalizedName]) => {
        const polled = customerCSSCounts[custId]?.cssSentCount || 0;
        polledByAccountName[normalizedName] = (polledByAccountName[normalizedName] || 0) + polled;
      });
      const effectiveTop10Set = computeEffectiveTop10AccountNames(polledByAccountName);
      Object.entries(custIdToNormalizedTop10Name).forEach(([custId, normalizedName]) => {
        if (isEffectiveTop10AccountName(normalizedName, effectiveTop10Set)) {
          top10Customers.add(custId);
        }
      });

      console.log('CSS counts calculated for customers:', Object.keys(customerCSSCounts).length);
      console.log('CSS counts calculated for business units:', Object.keys(buCSSCounts).length);
      console.log('Top 10 customers found:', top10Customers.size);
    }

    // Group by customer or business unit based on showBuWise
    const customerGroups = {};
    const buGroups = {};

    data.forEach(row => {
      const customerId = row[customerIdColumn] || 'N/A';
      const customerName = row[customerNameColumn] || 'N/A';
      const businessUnit = normalizeBusinessUnitDisplay(row[businessUnitColumn] || 'N/A');
      const perspective = row[perspectiveColumn];
      const rating = parseFloat(row[ratingColumn]) || 0;

      // Filter for Top 10 customers if showTop10 is true AND we're in account-wise view
      if (showTop10 && !showBuWise && !top10Customers.has(customerId)) {
        return; // Skip this customer if not in Top 10 (only for account-wise view)
      }

      if (showBuWise) {
        // Group by Business Unit for BU-wise view
        if (!buGroups[businessUnit]) {
          buGroups[businessUnit] = {
          businessUnit,
            perspectiveCounts: {}
          };
        }

        // Count ratings <4 for each perspective
        if (rating > 0 && rating < 4 && perspective) {
          if (!buGroups[businessUnit].perspectiveCounts[perspective]) {
            buGroups[businessUnit].perspectiveCounts[perspective] = 0;
          }
          buGroups[businessUnit].perspectiveCounts[perspective]++;
        }
      } else {
        // Group by Customer for account-wise view
        if (!customerGroups[customerId]) {
          customerGroups[customerId] = {
            customerId,
            customerName,
            businessUnit,
            perspectiveCounts: {},
            cssSentCount: customerCSSCounts[customerId]?.cssSentCount || 0,
            cssReceivedCount: customerCSSCounts[customerId]?.cssReceivedCount || 0,
            nonStaffingReceivedCount: customerCSSCounts[customerId]?.nonStaffingReceivedCount || 0,
            staffingReceivedCount: customerCSSCounts[customerId]?.staffingReceivedCount || 0
          };
        }

        // Count ratings <4 for each perspective
        if (rating > 0 && rating < 4 && perspective) {
          if (!customerGroups[customerId].perspectiveCounts[perspective]) {
            customerGroups[customerId].perspectiveCounts[perspective] = 0;
          }
          customerGroups[customerId].perspectiveCounts[perspective]++;
        }
      }
    });

    // Convert to array with percentage calculations
    let result = [];
    
        if (showBuWise) {
      // Process BU-wise data
      result = Object.values(buGroups)
        .filter(group => buCSSCounts[group.businessUnit]?.cssSentCount > 0) // Filter out rows with 0 surveys sent
        .map((group, index) => {
          const resultRow = {
        sNo: index + 1,
            businessUnit: group.businessUnit,
            cssSentCount: buCSSCounts[group.businessUnit]?.cssSentCount || 0,
            cssReceivedCount: buCSSCounts[group.businessUnit]?.cssReceivedCount || 0,
            nonStaffingReceivedCount: buCSSCounts[group.businessUnit]?.nonStaffingReceivedCount || 0,
            staffingReceivedCount: buCSSCounts[group.businessUnit]?.staffingReceivedCount || 0,
            ...group.perspectiveCounts
          };
          return resultRow;
        });
    } else {
      // Process customer-wise data
      result = Object.values(customerGroups)
        .filter(group => group.cssSentCount > 0) // Filter out rows with 0 surveys sent
        .map((group, index) => {
          const resultRow = {
            sNo: index + 1,
            customerId: group.customerId,
            customerName: group.customerName,
            businessUnit: group.businessUnit,
            cssSentCount: group.cssSentCount,
            cssReceivedCount: group.cssReceivedCount,
            nonStaffingReceivedCount: group.nonStaffingReceivedCount,
            staffingReceivedCount: group.staffingReceivedCount
          };

          // Calculate percentages for each perspective
          Object.keys(group.perspectiveCounts).forEach(perspective => {
            const count = group.perspectiveCounts[perspective];
            let percentage = 0;

            // Apply percentage calculation based on perspective type
            if (perspective === 'Timeline Adherence' || 
                perspective === 'Quality of Delivery' || 
                perspective === 'Risk Management & Responsiveness' || 
                perspective === 'Thought Leadership') {
              // Use Non Staffing count as denominator
              if (group.nonStaffingReceivedCount > 0) {
                percentage = (count / group.nonStaffingReceivedCount) * 100;
              }
            } else if (perspective === 'Overall Experience' || 
                       perspective === 'Timely Resource Fulfillment') {
              // Use Total CSAT Surveys Received as denominator
              if (group.cssReceivedCount > 0) {
                percentage = (count / group.cssReceivedCount) * 100;
              }
            } else if (perspective === 'Resource Competency') {
              // Use Staffing count as denominator
              if (group.staffingReceivedCount > 0) {
                percentage = (count / group.staffingReceivedCount) * 100;
              }
        } else {
              // Default: use Total CSAT Surveys Received as denominator
              if (group.cssReceivedCount > 0) {
                percentage = (count / group.cssReceivedCount) * 100;
              }
            }

            // Round to 2 decimal places
            resultRow[perspective] = Math.round(percentage * 100) / 100;
          });

          return resultRow;
        });
    }

    // Sort BU-wise data by business unit in specified order
    if (showBuWise) {
      const businessUnitOrder = ['Healthcare', 'CIT', 'Tech', 'India & GCC', 'SEAD'];
      
      result = result.sort((a, b) => {
        const indexA = businessUnitOrder.indexOf(a.businessUnit);
        const indexB = businessUnitOrder.indexOf(b.businessUnit);
        
        // If both are in the predefined order, sort by that order
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        // If only one is in the predefined order, prioritize it
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        // If neither is in the predefined order, sort alphabetically
        return a.businessUnit.localeCompare(b.businessUnit);
      });

      // Reassign Sr. No. after BU sorting so it reflects the displayed order
      result = result.map((row, index) => ({ ...row, sNo: index + 1 }));
    } else if (!showTop10) {
      // "Show All Customers" (default account-wise view): order accounts by Business Unit
      // (Healthcare, CIT, Tech, India & GCC, SEAD), then by account name within each BU.
      const businessUnitOrder = ['Healthcare', 'CIT', 'Tech', 'India & GCC', 'SEAD'];
      result = result.sort((a, b) => {
        const indexA = businessUnitOrder.indexOf(a.businessUnit);
        const indexB = businessUnitOrder.indexOf(b.businessUnit);
        if (indexA !== indexB) {
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
        }
        return (a.customerName || '').localeCompare(b.customerName || '');
      });
      result = result.map((row, index) => ({ ...row, sNo: index + 1 }));
    }

    console.log('Processed result:', result.length, showBuWise ? 'business units' : 'customers');
    return { data: result, perspectives };
  }, [excelData, csatCycleStartDateFormatted, showTop10, showBuWise]);

  // Get unique customers for filter dropdown
  const uniqueCustomers = useMemo(() => {
    if (!processedData.data || processedData.data.length === 0) return [];
    
    const customers = [...new Set(
      processedData.data.map(row => row.customerName)
        .filter(name => name && name !== 'N/A')
    )].sort();
    
    return customers;
  }, [processedData.data]);

  // Apply filters to processed data
  const filteredData = useMemo(() => {
    if (!processedData.data || processedData.data.length === 0) return [];
    
    let filtered = processedData.data;
    
    // Apply account/customer filter
    if (accountCustomerFilter) {
      filtered = filtered.filter(row => 
        row.customerName.toLowerCase().includes(accountCustomerFilter.toLowerCase())
      );
    }
    
    // Apply customer name search
    if (customerNameSearch) {
      filtered = filtered.filter(row => 
        row.customerName.toLowerCase().includes(customerNameSearch.toLowerCase())
      );
    }
    
    // Custom sorting for Top 10 accounts (fixed order, Premier first)
    if (showTop10) {
      const top10Order = TOP10_ACCOUNT_ORDER;
      const normalizeForOrder = (s) => (s || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');
      const orderByNormalized = new Map();
      top10Order.forEach((name, i) => { orderByNormalized.set(normalizeForOrder(name), i); });
      const getOrderIndex = (customerName) => {
        const n = normalizeForOrder(customerName);
        return orderByNormalized.has(n) ? orderByNormalized.get(n) : -1;
      };

      filtered.sort((a, b) => {
        const indexA = getOrderIndex(a.customerName);
        const indexB = getOrderIndex(b.customerName);

        // If both are in the predefined order, sort by that order
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        // If only one is in the predefined order, prioritize it
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        // If neither is in the predefined order, sort alphabetically
        return a.customerName.localeCompare(b.customerName);
      });
      // Reassign Sr. No. after Top10 sorting so it reflects the displayed order.
      filtered = filtered.map((row, index) => ({ ...row, sNo: index + 1 }));
    }

    return filtered;
  }, [processedData.data, accountCustomerFilter, customerNameSearch, showTop10]);

  // Short/nickname forms for the fixed Top 10 roster, used in the "not polled" footnote so the
  // caption stays readable instead of spelling out full legal account names.
  const TOP10_ACCOUNT_SHORT_NAME = {
    'bronxcare health system': 'BronxCare',
    'premier - horizon ii - covenant health': 'Covenant',
    'premier healthcare solutions inc': 'Premier Healthcare',
    'blue cross blue shield association bcbsa': 'BCBSA',
    'frontier airlines inc': 'Frontier Airlines',
    'tufts medicine': 'Tufts Medicine',
    'agfirst farm credit bank': 'AgFirst',
    'embecta medical ii llc': 'embecta',
    'jewish board of family and childrens services jbfcs': 'JBFCS',
    'healthfirst': 'Healthfirst',
    'the northern trust company': 'Northern Trust',
    'firstsource solutions limited': 'Firstsource',
    'ooma inc.': 'Ooma',
    'arista networks india private limited': 'Arista Networks',
    'infoblox inc.': 'Infoblox'
  };

  const getTop10AccountShortName = (fullName) => {
    const key = (fullName || '').toString().trim().toLowerCase();
    return TOP10_ACCOUNT_SHORT_NAME[key] || fullName;
  };

  // Builds the "X and Y were not polled and hence included other accounts." footnote text.
  const buildNotPolledCaption = (names) => {
    if (!names || names.length === 0) return '';
    if (names.length === 1) {
      return `${names[0]} was not polled and hence included other accounts.`;
    }
    if (names.length === 2) {
      return `${names[0]} and ${names[1]} were not polled and hence included other accounts.`;
    }
    const allButLast = names.slice(0, -1).join(', ');
    const last = names[names.length - 1];
    return `${allButLast} and ${last} were not polled and hence included other accounts.`;
  };

  // Footnote: which fixed-roster Top 10 accounts had zero "Polled" (cssSentCount) in the loaded
  // data (i.e. were effectively backfilled by other accounts in this Top 10 view).
  const top10NotPolledCaption = useMemo(() => {
    if (!showTop10 || !processedData.data) return '';
    const rows = processedData.data;
    const notPolled = TOP10_SURVEY_ACCOUNT_ORDER.filter((accountName) => {
      const norm = accountName.toLowerCase();
      const row = rows.find((r) => (r.customerName || '').toString().trim().toLowerCase() === norm);
      return !row || !(Number(row.cssSentCount) > 0);
    });
    return buildNotPolledCaption(notPolled.map(getTop10AccountShortName));
  }, [showTop10, processedData.data]);

  // Download function
  const downloadData = async () => {
    if (!filteredData || filteredData.length === 0) {
      alert('No data available for download');
      return;
    }

    try {
      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Percentage Data <4 Rater');
      
      // Get headers from the first row of data
      const headers = Object.keys(filteredData[0]);
      
      // Add headers
      worksheet.addRow(headers);
      
      // Style the header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE5E7EB' }
      };
      
      // Add data rows with color coding for percentage columns
      filteredData.forEach((row, index) => {
        const dataRow = worksheet.addRow(Object.values(row));
        
        // Apply color coding to percentage columns
        headers.forEach((header, colIndex) => {
          if (header.includes('%') || header.includes('Percentage')) {
            const percentage = parseFloat(row[header]);
            const cell = dataRow.getCell(colIndex + 1);
            
            if (percentage < 75) {
              // Dark Red
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFDC2626' }
              };
              cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
            } else if (percentage >= 75 && percentage < 90) {
              // Dark Amber
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD97706' }
              };
              cell.font = { color: { argb: 'FF000000' }, bold: true };
            } else {
              // Dark Green
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF16A34A' }
              };
              cell.font = { color: { argb: 'FF000000' }, bold: true };
            }
            
            cell.alignment = { horizontal: 'center' };
          }
        });
      });
      
      // Add legend
      const legendStartRow = filteredData.length + 3;
      const legendTitleRow = worksheet.addRow(['Legend:']);
      legendTitleRow.getCell(1).font = { bold: true, size: 12 };
      
      // Add legend items with colors
      const legendRow1 = worksheet.addRow(['Dark Red: <75%']);
      const legendRow2 = worksheet.addRow(['Dark Amber: 75% to 90%']);
      const legendRow3 = worksheet.addRow(['Dark Green: >=90%']);
      
      // Style legend cells with colors
      const redLegendCell = legendRow1.getCell(1);
      redLegendCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDC2626' }
      };
      redLegendCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      
      const amberLegendCell = legendRow2.getCell(1);
      amberLegendCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD97706' }
      };
      amberLegendCell.font = { color: { argb: 'FF000000' }, bold: true };
      
      const greenLegendCell = legendRow3.getCell(1);
      greenLegendCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF16A34A' }
      };
      greenLegendCell.font = { color: { argb: 'FF000000' }, bold: true };
      
      // Set column widths
      headers.forEach((header, index) => {
        if (header.includes('CUSTOMER NAME') || header.includes('BUSSINESS UNIT')) {
          worksheet.getColumn(index + 1).width = 20;
        } else if (header.includes('%') || header.includes('Percentage')) {
          worksheet.getColumn(index + 1).width = 18;
        } else {
          worksheet.getColumn(index + 1).width = 15;
        }
      });
      
      // Generate and download the file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Accountwise_Percentage_Data_Less_Than_4_Rater.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
      
      console.log('Data exported successfully with color coding');
    } catch (error) {
      console.error('Error downloading data:', error);
      alert('Error downloading data. Please try again.');
    }
  };

    return (
      <DashboardContainer>
                  <DashboardHeader>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <HeaderTitle>
            📊 Account/BU wise percentage for &lt;4 rater
          </HeaderTitle>
        </div>
        <ButtonContainer>
          <button
            onClick={() => {
              setShowTop10(!showTop10);
              // Reset BU-wise state when switching to Top 10 view
              if (showBuWise) {
                setShowBuWise(false);
              }
            }}
            style={{
              background: showTop10 ? '#ef4444' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.background = showTop10 ? '#dc2626' : '#2563eb';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.background = showTop10 ? '#ef4444' : '#3b82f6';
            }}
          >
            {showTop10 ? 'Show All Customers' : 'Top 10 account - percentage for <4 rater'}
          </button>
          
          <button
            onClick={() => {
              setShowBuWise(!showBuWise);
              // Reset Top 10 state when switching to BU-wise view
              if (showTop10) {
                setShowTop10(false);
              }
            }}
            style={{
              background: showBuWise ? '#10b981' : '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.background = showBuWise ? '#059669' : '#7c3aed';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.background = showBuWise ? '#10b981' : '#8b5cf6';
            }}
          >
            {showBuWise ? 'Show Account-wise View' : 'Display BU Wise percentage for <4 rater'}
          </button>

          <DownloadButton onClick={downloadData}>
            <Download size={16} />
            Download Data
          </DownloadButton>

          {onBack && (
            <BackButton onClick={onBack} aria-label="Back" title="Back">
              <ChevronLeft size={16} />
              Back
            </BackButton>
          )}
        </ButtonContainer>
      </DashboardHeader>

      {processedData.data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          <p>No data available.</p>
        </div>
             ) : (
         <>
                                 {/* Filter Section - Only visible for account-wise data */}
           {!showBuWise && (
            <div style={{ 
               marginBottom: '1.5rem', 
              padding: '1rem', 
               background: '#f8fafc', 
              borderRadius: '8px',
               border: '1px solid #e2e8f0'
             }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                 <label htmlFor="accountCustomerFilter" style={{ 
                   fontWeight: '500', 
                   color: '#374151',
                   minWidth: '120px'
                 }}>
                   Filter by Account/Customer:
          </label>
          <select
                   id="accountCustomerFilter"
                   value={accountCustomerFilter}
                   onChange={(e) => setAccountCustomerFilter(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem',
                     minWidth: '200px',
              background: 'white'
            }}
          >
                   <option value="">All Customers</option>
                   {uniqueCustomers.map(customer => (
                     <option key={customer} value={customer}>
                       {customer}
                  </option>
                   ))}
          </select>
                 {accountCustomerFilter && (
                   <button
                     onClick={() => setAccountCustomerFilter('')}
                     style={{
          padding: '0.5rem 1rem',
                       background: '#ef4444',
                       color: 'white',
                       border: 'none',
          borderRadius: '6px',
                       fontSize: '0.875rem',
                       cursor: 'pointer'
                     }}
                   >
                     Clear Filter
                   </button>
                 )}
        </div>
               
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                 <label htmlFor="customerNameSearch" style={{ 
                   fontWeight: '500', 
                   color: '#374151',
                   minWidth: '120px'
                 }}>
                   Search Customer:
                 </label>
                 <input
                   id="customerNameSearch"
                   type="text"
                   value={customerNameSearch}
                   onChange={(e) => setCustomerNameSearch(e.target.value)}
                   placeholder="Type customer name to search..."
                   style={{
                     padding: '0.5rem',
                     border: '1px solid #d1d5db',
                     borderRadius: '6px',
                     fontSize: '0.875rem',
                     minWidth: '250px',
                     background: 'white'
                   }}
                 />
                 {customerNameSearch && (
                   <button
                     onClick={() => setCustomerNameSearch('')}
            style={{
              padding: '0.5rem 1rem',
                       background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
                       cursor: 'pointer'
            }}
          >
                     Clear Search
          </button>
        )}
               </div>
               
               {(accountCustomerFilter || customerNameSearch) && (
                 <div style={{ 
                   marginTop: '0.5rem', 
                   fontSize: '0.875rem', 
                   color: '#6b7280' 
                 }}>
                   Showing {filteredData.length} of {processedData.data.length} customers
                   {accountCustomerFilter && ` (filtered by: ${accountCustomerFilter})`}
                   {customerNameSearch && ` (searched: ${customerNameSearch})`}
                 </div>
               )}
             </div>
           )}


      <TableContainer>
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>S No.</Th>
                {!showBuWise && <Th>CUSTOMER_ID</Th>}
                {!showBuWise && <Th>CUSTOMER NAME</Th>}
                <Th>BUSSINESS UNIT</Th>
                {!showBuWise && <Th>Total Number of CSAT Surveys Sent</Th>}
                {!showBuWise && <Th>Total Number of CSAT Surveys Received</Th>}
                {!showBuWise && <Th>Total Surveys Received in Non Staffing</Th>}
                {!showBuWise && <Th>Total Surveys Received in Staffing</Th>}
                {showBuWise && <Th>Total Number of CSAT Surveys Sent</Th>}
                {showBuWise && <Th>Total Number of CSAT Surveys Received</Th>}
                {showBuWise && <Th>Total Surveys Received in Non Staffing</Th>}
                {showBuWise && <Th>Total Surveys Received in Staffing</Th>}
                {processedData.perspectives.map(perspective => (
                  <Th key={perspective}>{perspective}</Th>
                ))}
              </tr>
            </thead>
            <tbody>
                    {filteredData.map((row, index) => (
                  <tr key={index}>
                    <Td>{row.sNo}</Td>
                    {!showBuWise && <Td style={{ textAlign: 'left' }}>{row.customerId}</Td>}
                    {!showBuWise && <Td style={{ textAlign: 'left' }}>{row.customerName}</Td>}
                    <Td style={{ textAlign: 'left' }}>{normalizeBusinessUnitDisplay(row.businessUnit)}</Td>
                    {!showBuWise && <Td>{row.cssSentCount}</Td>}
                    {!showBuWise && <Td>{row.cssReceivedCount}</Td>}
                    {!showBuWise && <Td>{row.nonStaffingReceivedCount}</Td>}
                    {!showBuWise && <Td>{row.staffingReceivedCount}</Td>}
                    {showBuWise && <Td>{row.cssSentCount}</Td>}
                    {showBuWise && <Td>{row.cssReceivedCount}</Td>}
                    {showBuWise && <Td>{row.nonStaffingReceivedCount}</Td>}
                    {showBuWise && <Td>{row.staffingReceivedCount}</Td>}
                    {processedData.perspectives.map(perspective => (
                      <Td key={perspective}>
                        {row[perspective] || 0}
                      </Td>
                    ))}
                  </tr>
                ))}
                {showTop10 && top10NotPolledCaption && (
                  <tr>
                    <Td
                      colSpan={6 + (!showBuWise ? 2 : 0) + processedData.perspectives.length}
                      style={{ fontStyle: 'italic', fontSize: '0.75rem', color: '#6b7280', textAlign: 'left', padding: '0.5rem 1rem', borderTop: '1px solid #e2e8f0' }}
                    >
                      {top10NotPolledCaption}
                    </Td>
                  </tr>
                )}
            </tbody>
          </Table>
        </TableWrapper>
      </TableContainer>

                     <div style={{ 
             marginTop: '1rem', 
             padding: '1rem', 
             background: '#f8fafc', 
             borderRadius: '8px',
             textAlign: 'center',
             color: '#6b7280',
             fontSize: '0.875rem'
           }}>
             Showing {filteredData.length} {showBuWise ? 'business units' : 'customers'} with ratings &lt;4 counts for each perspective
             {showTop10 && ' (Top 10 customers only)'}
             {showBuWise && ' (BU-wise view)'}
             {accountCustomerFilter && ` (filtered by: ${accountCustomerFilter})`}
             {customerNameSearch && ` (searched: ${customerNameSearch})`}
           </div>
        </>
      )}
    </DashboardContainer>
  );
};

export default AccountwisePercentageDataForLessThan4RaterDashboard;