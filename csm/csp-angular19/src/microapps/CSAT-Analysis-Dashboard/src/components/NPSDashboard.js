import React, { useState, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { TrendingUp, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useCSATContext } from '../context/CSATContext';
import { normalizeBusinessUnitDisplay, getBusinessUnitFromRow } from '../utils/normalizeBusinessUnitDisplay';
import { isDateGreaterThanOrEqual } from '../utils/dateUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList, PieChart, Pie } from 'recharts';
import html2canvas from 'html2canvas';

// Custom label component that directly accesses chart data
const CustomLabelWithData = ({ dataKey, chartData, index, ...props }) => {
  const { x, y, width, height, value } = props;
  
  console.log('CustomLabelWithData props:', { 
    dataKey, 
    index, 
    chartDataLength: chartData?.length,
    chartDataAtIndex: chartData?.[index],
    value,
    props 
  });
  
  // Get the chart data item for this specific bar
  const chartItem = chartData?.[index];
  
  if (!chartItem) {
    console.log('CustomLabelWithData - No chart item found for index:', index);
    return null;
  }
  
  // Extract the percentage based on the dataKey
  let segmentPercentage = chartItem[dataKey];
  
  console.log('CustomLabelWithData - Extracted percentage:', {
    dataKey,
    segmentPercentage,
    chartItem,
    allKeys: Object.keys(chartItem)
  });
  
  // Validate the percentage
  if (segmentPercentage === undefined || segmentPercentage === null || isNaN(segmentPercentage)) {
    console.log('CustomLabelWithData - Invalid percentage, returning null:', { segmentPercentage });
    return null;
  }
  
  // Convert to number if it's a string
  segmentPercentage = Number(segmentPercentage);
  
  // Round to 1 decimal place
  const displayValue = Math.round(segmentPercentage * 10) / 10;
  
  // SPECIAL CASES: Always show Passives % and Detractors % labels (if > 0), bypass height/small filters
  if (dataKey === 'passivesPercent' || dataKey === 'detractorsPercent') {
    if (displayValue === 0) return null; // hide only exact 0
    console.log('🔍 FORCING RENDER FOR', dataKey, { segmentPercentage, displayValue, height });
  } else {
    // For other segments, hide very small/zero or too-small heights
    if (displayValue === 0 || displayValue < 0.1) {
      console.log('CustomLabelWithData - Zero or very small percentage, not displaying:', { displayValue, dataKey });
      return null;
    }
    if (!height || height < 15) {
      return null;
    }
  }
  
  // For stacked bars, position the label at the center of the segment
  const labelY = y + height / 2;
  
  // Special debug for segments
  console.log(`🔍 CustomLabelWithData Debug (${dataKey}):`, {
    dataKey,
    value,
    chartItem,
    segmentPercentage,
    displayValue,
    y,
    height,
    labelY,
    isNonZero: displayValue > 0
  });
  
  // Determine text color based on the segment type
  // For Respondent Category-wise NPS Distribution:
  // Promoters % (Light Green 2) - #C6EFCE: black text
  // Passives % (Orange) - #FFA500: black text
  // Detractors % (Red) - #FF0000: white text
  let textColor = "#000000"; // default black
  let fontSize = 16;
  
  if (dataKey === 'promotersPercent') {
    // Light Green 2 sections (Promoters): black text
    textColor = "#000000";
    fontSize = 16;
  } else if (dataKey === 'passivesPercent') {
    // Orange sections (Passives): black text
    textColor = "#000000";
    fontSize = 16;
  } else if (dataKey === 'detractorsPercent') {
    // Red sections (Detractors): white text
    textColor = "#ffffff";
    fontSize = 16;
  }
  
  return (
    <text 
      x={x + width / 2} 
      y={labelY} 
      fill={textColor} 
      textAnchor="middle" 
      dominantBaseline="middle"
      fontSize={fontSize}
      fontWeight="700"
      fontFamily="Arial, sans-serif"
      style={{ pointerEvents: 'none' }}
    >
      {displayValue}%
    </text>
  );
};

// Custom label component for bar chart - display percentage
const CustomLabel = (props) => {
  const { x, y, width, height, value, index, payload, dataKey } = props;
  
  // Extract the correct segment percentage first
  let segmentPercentage;
  if (payload && typeof payload === 'object') {
    segmentPercentage = payload[dataKey];
  } else {
    segmentPercentage = value;
  }
  
  console.log('CustomLabel - All props:', { 
    x, y, width, height, value, index, payload, dataKey,
    payloadType: typeof payload,
    payloadKeys: payload ? Object.keys(payload) : 'no payload',
    valueType: typeof value,
    valueValue: value,
    correctedSegmentPercentage: segmentPercentage,
    note: 'value parameter is cumulative in stacked bars, correctedSegmentPercentage is the actual segment percentage used for rendering'
  });
  
  // Check if this is a valid segment - only check for zero height, no minimum height filtering
  if (!height || height === 0) {
    return null;
  }
  
  // segmentPercentage is already extracted above
  
  // Validate the percentage
  if (segmentPercentage === undefined || segmentPercentage === null || isNaN(segmentPercentage)) {
    console.log('CustomLabel - Invalid percentage, returning null:', { segmentPercentage });
    return null;
  }
  
  // Convert to number if it's a string
  segmentPercentage = Number(segmentPercentage);
  
  // Round to 1 decimal place
  const displayValue = Math.round(segmentPercentage * 10) / 10;
  
  // Show all labels - no filtering based on size
  // Only hide if the percentage is exactly 0
  // SPECIAL CASE: Always show Passives % labels regardless of value
  if (segmentPercentage === 0 && dataKey !== 'passivesPercent') {
    console.log('CustomLabel - Zero percentage, not displaying:', { segmentPercentage, dataKey });
    return null;
  }
  
  // Force Passives % to always render
  if (dataKey === 'passivesPercent') {
    console.log('🔍 FORCING PASSIVES RENDER:', { segmentPercentage, displayValue, height });
  }
  
  // For stacked bars, position the label at the center of the segment
  // The y coordinate and height are already correctly calculated by recharts
  let labelY = y + height / 2;
  
  // SPECIAL FIX for Passives % - ensure it's positioned correctly in middle segment
  if (dataKey === 'passivesPercent') {
    // Use the original recharts positioning but ensure it's visible
    // The issue might be that the label is being rendered outside the visible area
    console.log('🔍 PASSIVES POSITIONING DEBUG:', {
      index,
      originalY: y,
      originalHeight: height,
      calculatedLabelY: labelY,
      segmentPercentage,
      displayValue,
      chartDataItem: chartData[index]
    });
    
    // Force a minimum height to ensure visibility
    if (height < 10) {
      labelY = y + 5; // Center in a minimum 10px height
      console.log('🔍 PASSIVES MIN HEIGHT FIX:', { originalY: y, originalHeight: height, newLabelY: labelY });
    }
  }
  
  // Special debug for bottom segment (promoters)
  if (dataKey === 'promotersPercent') {
    console.log('🔍 Bottom Segment Debug:', {
      dataKey,
      value,
      payload,
      segmentPercentage,
      displayValue,
      y,
      height,
      labelY,
      isNonZero: displayValue > 0
    });
  }
  
  // Special debug for Passives % segment
  if (dataKey === 'passivesPercent') {
    console.log('🔍 PASSIVES DEBUG - All conditions:', {
      dataKey,
      segmentPercentage,
      displayValue,
      height,
      y,
      labelY,
      payload,
      value,
      willRender: segmentPercentage !== 0 && height > 0,
      textColor: dataKey === 'promotersPercent' || dataKey === 'passivesPercent' ? "#1f2937" : "white"
    });
  }
  
  console.log('CustomLabel rendering:', { 
    displayValue, 
    labelY, 
    dataKey,
    originalY: y,
    originalHeight: height,
    originalValue: value,
    finalPercentage: segmentPercentage 
  });
  
  // Determine text color based on the segment type
  // Promoters % and Passives % use black text, Detractors % uses white text
  let textColor = "white"; // default
  let strokeColor = "rgba(0, 0, 0, 0.5)"; // default stroke
  if (dataKey === 'promotersPercent' || dataKey === 'passivesPercent') {
    textColor = "#1f2937"; // black color
    strokeColor = "rgba(255, 255, 255, 0.5)"; // white stroke for better visibility on colored backgrounds
  }
  
  // Final debug for Passives % before rendering
  if (dataKey === 'passivesPercent') {
    console.log('🔍 PASSIVES FINAL RENDER:', {
      dataKey,
      segmentPercentage,
      displayValue,
      height,
      textColor,
      strokeColor,
      willRender: true,
      labelText: `${displayValue}%`
    });
  }
  
  // SPECIAL STYLING for Passives % to ensure visibility
  let finalTextColor = textColor;
  let finalStrokeColor = strokeColor;
  let finalFontSize = 12;
  
  if (dataKey === 'passivesPercent') {
    // Make Passives % labels more prominent
    finalTextColor = "#1f2937"; // Force black color
    finalStrokeColor = "rgba(255, 255, 255, 0.8)"; // Stronger white stroke
    finalFontSize = 14; // Slightly larger font
    console.log('🔍 PASSIVES FINAL STYLING:', {
      finalTextColor,
      finalStrokeColor,
      finalFontSize,
      labelY,
      displayValue
    });
  }
  
  return (
    <text 
      x={x + width / 2} 
      y={labelY} 
      fill={finalTextColor} 
      stroke={finalStrokeColor}
      strokeWidth="0.5"
      textAnchor="middle" 
      dominantBaseline="middle"
      fontSize={finalFontSize}
      fontWeight="900"
      style={{ pointerEvents: 'none' }}
    >
      {displayValue}%
    </text>
  );
};

// Custom NPS label component that directly accesses chart data
const NPSLabelWithData = ({ chartData, index, ...props }) => {
  const { x, y, width } = props;
  
  console.log('NPSLabelWithData props:', { 
    index, 
    chartDataLength: chartData?.length,
    chartDataAtIndex: chartData?.[index],
    props 
  });
  
  // Get the chart data item for this specific bar
  const chartItem = chartData?.[index];
  
  if (!chartItem) {
    console.log('NPSLabelWithData - No chart item found for index:', index);
    return null;
  }
  
  // Extract the NPS value from the chart data
  const npsValue = chartItem.nps || 0;
  
  console.log('NPSLabelWithData - Extracted NPS:', {
    index,
    chartItem,
    npsValue,
    allKeys: Object.keys(chartItem)
  });
  
  // Determine background color and text color based on NPS value
  // Green: ≥75%, Orange: 0% to 74.99%, Red: <0%
  let backgroundColor = "#C6EFCE"; // Light Green 2 (default for ≥75%)
  let textColor = "#000000"; // Black text (default for green/orange)
  
  if (npsValue >= 75) {
    backgroundColor = "#C6EFCE"; // Light Green 2 for ≥75%
    textColor = "#000000"; // Black text
  } else if (npsValue >= 0 && npsValue < 75) {
    backgroundColor = "#FFA500"; // Orange for 0% to 74.99% (Excel standard)
    textColor = "#000000"; // Black text
  } else if (npsValue < 0) {
    backgroundColor = "#FF0000"; // Red for <0% (Excel standard)
    textColor = "#ffffff"; // White text
  }
  
  // Calculate text width for background rectangle (approximate)
  const npsText = `NPS: ${(Math.round(npsValue * 100) / 100).toFixed(2)}`;
  const textWidth = npsText.length * 10; // Approximate width per character (increased for larger font)
  const padding = 12;
  const rectWidth = textWidth + (padding * 2);
  const rectHeight = 32; // Increased height for larger font
  const rectX = (x + width / 2) - (rectWidth / 2);
  // Position directly below the bar on X axis
  // When position="bottom" is used in Recharts, y represents the bottom edge of the bar
  // In SVG coordinates, y increases downward, so we add a gap to position the label below the bar
  const gap = 15; // Gap between bar bottom and label top
  const rectY = y + gap; // Position label below the bar
  
  return (
    <g>
      {/* Background rectangle with color coding */}
      <rect
        x={rectX}
        y={rectY}
        width={rectWidth}
        height={rectHeight}
        fill={backgroundColor}
        stroke="#6b7280"
        strokeWidth="1"
        rx="4"
        ry="4"
      />
      {/* NPS text - positioned directly below the bar on X axis, centered in rectangle */}
    <text 
      x={x + width / 2} 
      y={rectY + (rectHeight / 2)} 
        fill={textColor} 
      textAnchor="middle" 
      dominantBaseline="middle"
      fontSize="20"
      fontWeight="900"
    >
        {npsText}
    </text>
    </g>
  );
};

// Custom label component for NPS above bar
const NPSLabel = (props) => {
  const { x, y, width, value, payload } = props;
  const npsValue = payload?.nps || 0;
  
  // Debug logging
  if (payload) {
    console.log('NPSLabel payload:', {
      name: payload.name,
      nps: payload.nps,
      npsValue,
      promoters: payload.promoters,
      detractors: payload.detractors,
      totalResponses: payload.totalResponses
    });
  }
  
  return (
    <text 
      x={x + width / 2} 
      y={y - 10} 
      fill="#1f2937" 
      textAnchor="middle" 
      dominantBaseline="middle"
      fontSize="12"
      fontWeight="bold"
    >
      NPS: {(Math.round(npsValue * 100) / 100).toFixed(2)}
    </text>
  );
};

const DashboardContainer = styled.div`
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Header = styled.div`
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
`;

const Title = styled.h1`
  color: #2d3748;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const BackButton = styled.button`
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
  }
`;

const TrendAnalysisButton = styled.button`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
  width: 100%;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(13, 148, 136, 0.35);
  }
`;

const ToggleButton = styled.button`
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' 
    : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
  };
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 0.5rem;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  }
`;

const DownloadButton = styled.button`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 0.5rem;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }
`;

const TableContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  overflow: auto;
  max-height: 80vh;
  max-width: 100%;
  position: relative;

  /* Enhanced scrollbar styling */
  &::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
    border: 2px solid #f1f5f9;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
    border: 2px solid #e2e8f0;
  }

  &::-webkit-scrollbar-corner {
    background: #f1f5f9;
  }

  /* Firefox scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: #667eea #f1f5f9;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  table-layout: fixed;
`;

const TableHeader = styled.thead`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: sticky;
  top: 0;
  left: 0;
  z-index: 10;
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: center;
  vertical-align: middle;
  font-weight: 700;
  color: white;
  font-size: 1rem;
  text-transform: none;
  letter-spacing: 0.5px;
  border: 1px solid #ffffff;
  position: ${props => props.isFirstColumn ? 'sticky' : 'static'};
  left: ${props => props.isFirstColumn ? '0' : 'auto'};
  background: ${props => props.isFirstColumn && !props.style?.backgroundColor ? 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)' : 'transparent'};
  z-index: ${props => props.isFirstColumn ? '11' : '10'};
  
  &:hover {
    background: ${props => props.isFirstColumn ? 'linear-gradient(135deg, #4c51bf 0%, #553c9a 100%)' : '#1e40af'} !important;
    cursor: pointer;
  }
`;

const TableBody = styled.tbody`
  background: white;
`;

const TableRow = styled.tr`
  transition: all 0.3s ease;
  border-bottom: 1px solid #e2e8f0;

  &:hover {
    background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
    transform: scale(1.01);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  color: #2d3748;
  font-size: 0.95rem;
  border: 1px solid #6b7280;
  position: ${props => props.isFirstColumn ? 'sticky' : 'static'};
  left: ${props => props.isFirstColumn ? '0' : 'auto'};
  background: ${props => props.isFirstColumn ? 'white' : 'transparent'};
  z-index: ${props => props.isFirstColumn ? '1' : '0'};
  font-weight: ${props => props.isFirstColumn ? '600' : '400'};
  text-align: ${props => props.isNumeric ? 'center' : 'left'};
  vertical-align: middle;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #4a5568;
  font-size: 1.2rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  margin: 2rem 0;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #e53e3e;
  font-size: 1.2rem;
  background: rgba(254, 226, 226, 0.9);
  border-radius: 15px;
  margin: 2rem 0;
  border: 2px solid #feb2b2;
`;

const NPSFormulaContainer = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 2px solid #cbd5e0;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const FormulaTitle = styled.h3`
  color: #2d3748;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const FormulaText = styled.div`
  color: #4a5568;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 0.5rem;
`;

const FormulaBreakdown = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const FormulaItem = styled.div`
  background: white;
  padding: 0.75rem;
  border-radius: 8px;
  border-left: 4px solid #667eea;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FormulaItemTitle = styled.div`
  font-weight: 700;
  color: #2d3748;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
`;

const FormulaItemText = styled.div`
  font-size: 0.85rem;
  color: #6b7280;
  line-height: 1.4;
`;

const LegendContainer = styled.div`
  background: #f8f9fa;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
`;

const LegendTitle = styled.div`
  font-weight: 700;
  color: #2d3748;
  font-size: 1rem;
  margin-bottom: 0.75rem;
  text-align: center;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const LegendColor = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: ${props => props.color};
  border: 1px solid #6b7280;
`;

const LegendText = styled.div`
  font-size: 0.9rem;
  color: #4a5568;
  font-weight: 500;
`;

const ChartContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 2rem;
  margin: 2rem 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
`;

const ChartTitle = styled.h2`
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-align: center;
`;

const ChartLegend = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const ChartLegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ChartLegendColor = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: ${props => props.color};
`;

const ChartLegendText = styled.span`
  font-size: 0.875rem;
  color: #4a5568;
  font-weight: 500;
`;

const SummaryTableContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 2rem 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
`;

const SummaryTableTitle = styled.h3`
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
`;

const SummaryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const SummaryTableHeader = styled.thead`
  background: #1e3a8a;
  color: white;
`;

const SummaryTableHeaderCell = styled.th`
  padding: 1rem;
  text-align: center;
  font-weight: 700;
  border: 1px solid #ffffff;
  font-size: 1rem;
  letter-spacing: 0.5px;
`;

const SummaryTableBody = styled.tbody``;

const SummaryTableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9fafb;
  }
  
  &:hover {
    background-color: #f3f4f6;
  }
`;

const SummaryTableCell = styled.td`
  padding: 1rem;
  text-align: center;
  border: 1px solid #6b7280;
  font-size: 1rem;
  color: #374151;
  font-weight: ${props => props.fontWeight || '600'};
`;

const SummaryTableCellPercentage = styled.td`
  padding: 1rem;
  text-align: center;
  border: 1px solid #6b7280;
  font-size: 1rem;
  font-weight: 600;
  color: #000000; // Black text for all percentage columns in table
`;

const SummaryNPSCell = styled.td`
  padding: 1rem;
  text-align: center;
  border: 1px solid #6b7280;
  font-size: 1rem;
  font-weight: 700;
  background-color: ${props => {
    if (props.score >= 75) return '#C6EFCE'; // Light Green 2 >=75% (Great) - Excel standard
    if (props.score >= 0 && props.score < 75) return '#FFA500'; // Orange 0% to 75% (Good) - Excel standard
    return '#FF0000'; // Red <0% (Needs Attention) - Excel standard
  }};
  color: ${props => {
    if (props.score >= 75) return '#000000'; // Black text for Light Green 2
    if (props.score >= 0 && props.score < 75) return '#000000'; // Black text for Amber
    return '#ffffff'; // White text for Red
  }};
`;

const SuccessMessage = styled.div`
  text-align: center;
  padding: 1rem;
  color: #38a169;
  font-size: 1rem;
  background: rgba(240, 253, 244, 0.9);
  border-radius: 10px;
  margin: 1rem 0;
  border: 2px solid #9ae6b4;
`;

const ResponseRateCell = styled.td`
  padding: 1rem;
  font-size: 0.95rem;
  border: 1px solid #6b7280;
  font-weight: 600;
  text-align: center;
  vertical-align: middle;
  background-color: ${props => {
    if (props.surveysReceived === 0 || props.rate === 0) return '#FF0000'; // Red for zero Response %
    if (props.rate >= 75) return '#C6EFCE'; // Light Green 2 >=75% (Excel standard)
    if (props.rate >= 50 && props.rate < 75) return '#FFA500'; // Orange 50%-75% (Excel standard)
    return '#FF0000'; // Red <50% (Excel standard)
  }};
  color: ${props => {
    if (props.surveysReceived === 0 || props.rate === 0) return '#ffffff'; // White text for zero Response %
    if (props.rate >= 75) return '#000000'; // Black text for Green >=75%
    if (props.rate >= 50 && props.rate < 75) return '#000000'; // Black text for Orange 50%-75%
    return '#ffffff'; // White text for Red <50%
  }};
`;

const NPSCell = styled.td`
  padding: 1rem;
  font-size: 0.95rem;
  border: 1px solid #6b7280;
  font-weight: 700;
  text-align: center;
  vertical-align: middle;
  background-color: ${props => {
    // If score is '-' or null/undefined, return default (white) background
    if (props.score === '-' || props.score === null || props.score === undefined) return '#ffffff';
    // Convert to number if it's a string
    const score = typeof props.score === 'string' && props.score !== '-' ? parseFloat(props.score) : props.score;
    // If score is NaN after conversion, return default background
    if (isNaN(score)) return '#ffffff';
    if (score >= 75) return '#C6EFCE'; // Light Green 2 >=75% (Great) - Excel standard
    if (score >= 0 && score < 75) return '#FFA500'; // Orange 0% to 75% (Good) - Excel standard
    return '#FF0000'; // Red <0% (Needs Attention) - Excel standard
  }};
  color: ${props => {
    // If score is '-' or null/undefined, return default (black) text color
    if (props.score === '-' || props.score === null || props.score === undefined) return '#000000';
    // Convert to number if it's a string
    const score = typeof props.score === 'string' && props.score !== '-' ? parseFloat(props.score) : props.score;
    // If score is NaN after conversion, return default text color
    if (isNaN(score)) return '#000000';
    if (score >= 75) return '#000000'; // Black text for Light Green 2
    if (score >= 0 && score < 75) return '#000000'; // Black text for Amber
    return '#ffffff'; // White text for Red
  }};
`;

const NpsTrendDiffCell = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
  border: 1px solid #6b7280;
  font-weight: 600;
  text-align: center;
  vertical-align: middle;
  color: ${(props) => props.diffColor || '#374151'};
  background: ${(props) => props.cellBackground || '#f0fdf4'};
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  height: 36px;
  background: white;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const SearchInputContainer = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
`;

const InlineClearButton = styled.button`
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  font-size: 1rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f3f4f6;
    color: #374151;
  }

  &:active {
    background-color: #e5e7eb;
  }
`;

const SearchLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
`;

const ClearButton = styled.button`
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  height: 36px;
  min-width: 60px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;

  &:hover {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SummaryContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
`;

const SummaryTitle = styled.h2`
  color: #2d3748;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCard = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 2px solid #cbd5e0;
  border-radius: 12px;
  padding: 1.5rem;
`;

const SummaryCardTitle = styled.h3`
  color: #2d3748;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
`;

const TopAccountsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const TopAccountItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

const AccountName = styled.span`
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
`;

const AccountNPS = styled.span`
  font-weight: 700;
  color: #059669;
  font-size: 0.9rem;
`;

const AchievedNPSContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const AchievedNPSValue = styled.div`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  /* Color coding based on NPS score */
  color: ${props => {
    if (props.npsScore >= 75) return '#000000'; // Black text for Dark Green (≥75%)
    if (props.npsScore >= 0 && props.npsScore < 75) return '#000000'; // Black text for Dark Amber (0% to 75%)
    return '#ffffff'; // White text for Dark Red (<0%)
  }};
  background-color: ${props => {
    if (props.npsScore >= 75) return '#C6EFCE'; // Light Green 2 (≥75%) - Excel standard
    if (props.npsScore >= 0 && props.npsScore < 75) return '#FFA500'; // Orange (0% to 75%) - Excel standard
    return '#FF0000'; // Red (<0%) - Excel standard
  }};
  padding: 1rem 2rem;
  border-radius: 8px;
  display: inline-block;
`;

const AchievedNPSLabel = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
`;

const AchievedNPSDescription = styled.div`
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.4;
`;

const NPS_DEBUG_PREFIX = '[NPS Dashboard]';
const npsLog = (...args) => console.log(NPS_DEBUG_PREFIX, ...args);
const npsWarn = (...args) => console.warn(NPS_DEBUG_PREFIX, ...args);
const npsError = (...args) => console.error(NPS_DEBUG_PREFIX, ...args);

const FIRST_SHEET_PATTERNS = ['csat received', 'received report'];
const SECOND_SHEET_PATTERNS = ['csat sent and received', 'sent and received report'];

const normalizeCustomerIdKey = (value) => {
  if (value == null) return '';
  const raw = String(value).trim();
  if (!raw) return '';
  if (/^-?\d+(\.\d+)?$/.test(raw)) {
    const num = Number(raw);
    if (!Number.isNaN(num) && Number.isInteger(num)) return String(num);
  }
  return raw;
};

const normalizeHeaderKey = (key) => (
  key == null ? '' : String(key).trim().toLowerCase().replace(/\s+/g, ' ').replace(/_/g, ' ')
);

const isCustomerIdHeader = (norm) => (
  norm === 'customer id' || norm === 'cust id' || norm === 'customerid' || norm === 'custid'
);

const isCustomerNameHeader = (norm) => (
  norm === 'customer name' || norm === 'cust nm' || norm === 'cust name' ||
  norm === 'account name' || norm === 'customer' ||
  (norm.includes('customer') && norm.includes('name') && !norm.includes('respondent')) ||
  (norm.includes('account') && norm.includes('name') && !norm.includes('respondent')) ||
  (norm.includes('cust') && (norm.includes('nm') || norm.includes('name')) && !norm.includes('respondent'))
);

const getRowValueByExactKeys = (row, keys) => {
  for (const key of keys) {
    const value = row[key];
    if (value != null && String(value).trim() !== '') return value;
  }
  return undefined;
};

const findRowKeyByHeaderMatcher = (row, matcher) => {
  if (!row) return null;
  return Object.keys(row).find((key) => {
    const norm = normalizeHeaderKey(key);
    return norm && matcher(norm);
  }) || null;
};

const getCustomerIdFromRow = (row) => {
  const exact = getRowValueByExactKeys(row, [
    'CUSTOMER_ID', 'CUST_ID', 'Customer ID', 'Customer Id', 'Cust ID', 'Cust Id',
  ]);
  if (exact !== undefined) return normalizeCustomerIdKey(exact);
  const fuzzyKey = findRowKeyByHeaderMatcher(row, isCustomerIdHeader);
  if (fuzzyKey) return normalizeCustomerIdKey(row[fuzzyKey]);
  return '';
};

const getCustomerNameFromRow = (row, customerId = '') => {
  const exact = getRowValueByExactKeys(row, [
    'CUSTOMER NAME', 'CUSTOMER_NAME', 'Customer Name', 'CUST_NM', 'CUST_NAME',
    'CUSTOMER_NM', 'Customer_Name', 'CUSTOMER', 'Customer', 'CLIENT NAME',
    'CLIENT_NAME', 'Client Name', 'CLIENT_NM', 'Account Name', 'ACCOUNT_NAME', 'account_name',
  ]);
  if (exact !== undefined) return String(exact).trim();
  const fuzzyKey = findRowKeyByHeaderMatcher(row, isCustomerNameHeader);
  if (fuzzyKey) return String(row[fuzzyKey]).trim();
  return customerId ? String(customerId) : '';
};

const getCustomerKeyFromRow = (row) => {
  const customerId = getCustomerIdFromRow(row);
  const customerName = getCustomerNameFromRow(row, '');
  return customerId || customerName;
};

const normalizeYearQuarterValue = (value) => {
  if (value == null) return '';
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, ' ');
};

const yearQuarterMatchesCycle = (rowYearQuarter, acsatCycle) => {
  if (!acsatCycle) return true;
  const rowNorm = normalizeYearQuarterValue(rowYearQuarter);
  if (!rowNorm) return true;
  return normalizeYearQuarterValue(acsatCycle) === rowNorm;
};

const isYearQuarterHeader = (norm) => (
  norm === 'year - quarter' || norm === 'year quarter' || norm === 'year-quarter'
);

const getYearQuarterFromRow = (row) => {
  const exact = getRowValueByExactKeys(row, ['YEAR - QUARTER', 'YEAR_QUARTER', 'Year Quarter']);
  if (exact !== undefined) return String(exact).trim();
  const fuzzyKey = findRowKeyByHeaderMatcher(row, isYearQuarterHeader);
  if (fuzzyKey) return String(row[fuzzyKey]).trim();
  return '';
};

const isCsatSentDateHeader = (norm) => (
  norm === 'csat sent date' || norm === 'css sent date' ||
  norm === 'csat sent' || norm === 'css sent' ||
  norm === 'sent date' ||
  (norm.includes('sent') && norm.includes('date') && !norm.includes('received'))
);

const isCsatReceivedDateHeader = (norm) => (
  norm === 'csat received date' || norm === 'css received date' ||
  norm === 'csat received' || norm === 'css received' ||
  norm === 'received date' ||
  (norm.includes('received') && norm.includes('date'))
);

const getCsatSentDateFromRow = (row) => {
  const exact = getRowValueByExactKeys(row, [
    'CSAT SENT DATE', 'CSAT_SENT_DATE', 'CSS SENT DATE', 'CSS_SENT_DATE',
    'CSAT SENT', 'CSAT_SENT', 'SENT DATE', 'SENT_DATE',
  ]);
  if (exact !== undefined) return exact;
  const fuzzyKey = findRowKeyByHeaderMatcher(row, isCsatSentDateHeader);
  return fuzzyKey ? row[fuzzyKey] : undefined;
};

const getCsatReceivedDateFromRow = (row) => {
  const exact = getRowValueByExactKeys(row, [
    'CSAT RECEIVED DATE', 'CSAT_RECEIVED_DATE', 'CSS RECEIVED DATE', 'CSS_RECEIVED_DATE',
    'CSAT RECEIVED', 'CSAT_RECEIVED', 'CSS RECEIVED', 'CSS_RECEIVED',
    'RECEIVED DATE', 'RECEIVED_DATE',
  ]);
  if (exact !== undefined) return exact;
  const fuzzyKey = findRowKeyByHeaderMatcher(row, isCsatReceivedDateHeader);
  return fuzzyKey ? row[fuzzyKey] : undefined;
};

const rowsFromSheetJson = (jsonData) => {
  if (!jsonData?.length) return [];
  const headers = jsonData[0];
  return jsonData.slice(1).map((row) => {
    const obj = {};
    headers.forEach((header, index) => {
      const trimmedHeader = header != null ? String(header).trim() : '';
      if (trimmedHeader) obj[trimmedHeader] = row[index];
    });
    return obj;
  });
};

// Normalize Excel date values to MM-DD-YYYY, then compare >= cycle start (also MM-DD-YYYY).
// Empty or unparseable dates return false — they must not count toward Polled/Responded.
const isDateOnOrAfterCsatStart = (dateValue, cycleStartDate) => {
  if (dateValue == null || dateValue === '' || String(dateValue).trim() === '' || dateValue === 'N/A') {
    return false;
  }
  const parsed = parseExcelDateToMMDDYYYY(dateValue);
  if (!parsed) return false;
  if (!cycleStartDate) return true;
  return isDateGreaterThanOrEqual(parsed, cycleStartDate);
};

const rowPassesBothCsatCycleDates = (row, cycleStartDate) => {
  return isDateOnOrAfterCsatStart(getCsatSentDateFromRow(row), cycleStartDate) &&
    isDateOnOrAfterCsatStart(getCsatReceivedDateFromRow(row), cycleStartDate);
};

const parseExcelDateToMMDDYYYY = (dateValue) => {
  if (!dateValue || dateValue === '' || dateValue === 'N/A') return '';
  try {
    let date;
    if (typeof dateValue === 'number') {
      date = new Date((dateValue - 25569) * 86400 * 1000);
    } else if (typeof dateValue === 'string') {
      const dv = dateValue.trim();
      if (dv.includes('/')) {
        const parts = dv.split('/');
        if (parts.length === 3) {
          date = new Date(`${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`);
        } else {
          date = new Date(dv);
        }
      } else if (dv.includes('-')) {
        const parts = dv.split('-');
        if (parts.length === 3 && parts[0].length === 4) {
          date = new Date(`${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`);
        } else if (parts.length === 3) {
          const monthNames = {
            Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
            Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
          };
          if (parts[1] in monthNames) {
            date = new Date(parseInt(parts[2], 10), monthNames[parts[1]], parseInt(parts[0], 10));
          } else {
            date = new Date(`${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`);
          }
        } else {
          date = new Date(dv);
        }
      } else {
        date = new Date(dv);
      }
    } else {
      date = new Date(dateValue);
    }
    if (isNaN(date.getTime())) return '';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  } catch {
    return '';
  }
};

const isTop10TypeOfAccount = (value) => {
  const normalized = (value ?? '').toString().trim().toLowerCase().replace(/\s+/g, ' ');
  return normalized === 'top 10' || normalized === 'top10';
};

const getTypeOfAccountFromRow = (row) =>
  row?.['TYPE OF ACCOUNT'] ?? row?.['Type of Account'] ?? row?.['TYPE_OF_ACCOUNT'] ?? row?.['TYPEOFACCOUNT'] ?? '';

const isBlankOrEmptyTypeOfAccount = (value) => {
  const normalized = (value ?? '').toString().trim().toLowerCase().replace(/\s+/g, ' ');
  return normalized === '' || normalized === 'n/a' || normalized === 'na';
};

const sheetHasTypeOfAccountColumn = (data) => {
  if (!Array.isArray(data) || data.length === 0) return false;
  const row = data[0] || {};
  return ['TYPE OF ACCOUNT', 'Type of Account', 'TYPE_OF_ACCOUNT', 'TYPEOFACCOUNT'].some((key) => key in row);
};

const parseNpsRatingFromRow = (row) => {
  let rating = null;
  if (row['RATING'] !== undefined && row['RATING'] !== null && row['RATING'] !== '') {
    rating = row['RATING'];
  } else {
    const rowKeys = Object.keys(row);
    for (const key of rowKeys) {
      const keyLower = key ? key.toString().toLowerCase().trim() : '';
      if (keyLower === 'rating' && !keyLower.includes('predicted')) {
        rating = row[key];
        break;
      }
    }
    if (rating === null || rating === undefined || rating === '') {
      for (const key of rowKeys) {
        const keyLower = key ? key.toString().toLowerCase().trim() : '';
        if (
          keyLower === 'rating_score' ||
          keyLower === 'rating score' ||
          keyLower === 'nps rating' ||
          keyLower === 'nps_rating' ||
          (keyLower.includes('rating') && !keyLower.includes('predicted'))
        ) {
          rating = row[key];
          break;
        }
      }
    }
    if (rating === null || rating === undefined || rating === '') {
      rating =
        row['Rating'] ||
        row['RATING_SCORE'] ||
        row['Rating Score'] ||
        row['NPS RATING'] ||
        row['NPS Rating'] ||
        row['NPS_RATING'] ||
        row['Nps Rating'];
    }
  }

  if (rating === null || rating === undefined || rating === '') return NaN;

  let ratingNum = parseFloat(rating);
  if (isNaN(ratingNum)) {
    const cleanedRating = rating.toString().trim().replace(/[^\d.-]/g, '');
    if (cleanedRating) ratingNum = parseFloat(cleanedRating);
  }
  if (isNaN(ratingNum)) {
    const cleanedRating = rating.toString().trim().replace(/[^\d-]/g, '');
    if (cleanedRating) ratingNum = parseInt(cleanedRating, 10);
  }
  return ratingNum;
};

const computeOtherAccountTotalsFromSheets = (
  secondSheetData,
  firstSheetData,
  acsatCycleStartDateFormatted,
  blankTypeCustomerIds,
  otherNpsScoreSum,
  otherNpsScoreCount
) => {
  let polled = 0;
  let responded = 0;
  let predictedPromoters = 0;
  let predictedDetractors = 0;
  let predictedPassives = 0;
  let secondSheetRespondedCount = 0;
  let actualPromoters = 0;
  let actualDetractors = 0;
  let actualPassives = 0;
  let firstSheetRespondedCount = 0;

  const firstSheetHasTypeCol = sheetHasTypeOfAccountColumn(firstSheetData);

  const isOtherFirstSheetRow = (row) => {
    if (firstSheetHasTypeCol) {
      return isBlankOrEmptyTypeOfAccount(getTypeOfAccountFromRow(row));
    }
    const idKey = getCustomerIdFromRow(row);
    return idKey ? blankTypeCustomerIds.has(String(idKey).trim()) : false;
  };

  if (Array.isArray(secondSheetData)) {
    secondSheetData.forEach((row) => {
      if (!isBlankOrEmptyTypeOfAccount(getTypeOfAccountFromRow(row))) return;

      const sentDate = getCsatSentDateFromRow(row);
      const receivedDate = getCsatReceivedDateFromRow(row);
      const predictedScore = row['PREDICTED SCORE'] || row['PREDICTED_SCORE'];
      const sentDateValid = isDateOnOrAfterCsatStart(sentDate, acsatCycleStartDateFormatted);
      const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
      const isCompletedStatus = statusVal === 'completed';
      const receivedDateValid = isCompletedStatus && isDateOnOrAfterCsatStart(receivedDate, acsatCycleStartDateFormatted);

      if (sentDateValid) polled++;
      if (receivedDateValid) {
        responded++;
        secondSheetRespondedCount++;
        const predictedScoreNum = parseFloat(predictedScore);
        if (!isNaN(predictedScoreNum)) {
          if (predictedScoreNum >= 9 && predictedScoreNum <= 10) predictedPromoters++;
          else if (predictedScoreNum < 7) predictedDetractors++;
          else if (predictedScoreNum >= 7 && predictedScoreNum <= 8) predictedPassives++;
        }
      }
    });
  }

  if (Array.isArray(firstSheetData)) {
    firstSheetData.forEach((row) => {
      if (!isOtherFirstSheetRow(row)) return;

      const perspective = row['PERSPECTIVE'] || row['Perspective'] || '';
      if (!perspective || perspective.toString().toLowerCase().trim() !== 'nps') return;

      const sentDate = getCsatSentDateFromRow(row);
      const receivedDate = getCsatReceivedDateFromRow(row);
      const sentDateValid = isDateOnOrAfterCsatStart(sentDate, acsatCycleStartDateFormatted);
      const receivedDateValid = isDateOnOrAfterCsatStart(receivedDate, acsatCycleStartDateFormatted);
      if (!sentDateValid || !receivedDateValid) return;

      firstSheetRespondedCount++;
      const ratingNum = parseNpsRatingFromRow(row);
      if (!isNaN(ratingNum) && isFinite(ratingNum)) {
        if (ratingNum >= 9 && ratingNum <= 10) actualPromoters++;
        else if (ratingNum < 7) actualDetractors++;
        else if (ratingNum >= 7 && ratingNum <= 8) actualPassives++;
      }
    });
  }

  const responseRate = polled > 0 ? (responded / polled) * 100 : 0;
  const predictedNpsScore =
    secondSheetRespondedCount > 0
      ? ((predictedPromoters - predictedDetractors) / secondSheetRespondedCount) * 100
      : 0;
  const npsScore =
    firstSheetRespondedCount > 0
      ? ((actualPromoters - actualDetractors) / firstSheetRespondedCount) * 100
      : 0;

  return {
    businessUnit: '',
    customerName: 'Other Accounts',
    sentCount: polled,
    receivedCount: responded,
    promotersCount: actualPromoters,
    passivesCount: actualPassives,
    detractorsCount: actualDetractors,
    predictedPromotersCount: predictedPromoters,
    predictedPassivesCount: predictedPassives,
    predictedDetractorsCount: predictedDetractors,
    predictedNeutralCount: 0,
    responseRate,
    npsScore,
    predictedNpsScore,
    npsAvgRating: otherNpsScoreCount > 0 ? otherNpsScoreSum / otherNpsScoreCount : null,
    isOtherAccount: true,
  };
};

const findAcsatSentReceivedSheetName = (sheetNames) => {
  if (!sheetNames?.length) return null;
  const exact = sheetNames.find((n) => String(n).toLowerCase().trim() === 'csat sent and received report');
  if (exact) return exact;
  return (
    sheetNames.find((n) => {
      const t = String(n).toLowerCase().trim();
      return t.includes('csat sent and received') || t.includes('sent and received');
    }) ||
    (sheetNames.length >= 2 ? sheetNames[1] : null)
  );
};

const findAcsatReceivedReportSheetName = (sheetNames) => {
  if (!sheetNames?.length) return null;
  const exact = sheetNames.find((n) => String(n).toLowerCase().trim() === 'csat received report');
  if (exact) return exact;
  return (
    sheetNames.find((n) => {
      const t = String(n).toLowerCase().trim();
      if (t.includes('sent and received') || t.includes('sent & received')) return false;
      return t.includes('csat received') || (t.includes('received') && !t.includes('sent'));
    }) || null
  );
};

const isNpsPerspectiveValue = (value) =>
  String(value ?? '').trim().toLowerCase() === 'nps';

const buildNpsRatingAvgLookupFromTrendReceivedReport = (file) => {
  const sheetNames = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
  const receivedSheetName = findAcsatReceivedReportSheetName(sheetNames);
  const receivedData = receivedSheetName ? (file.sheets?.[receivedSheetName] || []) : [];
  const lookup = new Map();

  if (!receivedData.length) return lookup;

  const firstRow = receivedData[0] || {};
  const custIdCol = findNpsTrendSheetColumn(
    firstRow,
    [
      (k) => k.toLowerCase().replace(/[\s_]/g, '') === 'customerid',
      (k) => k.toLowerCase().replace(/[\s_]/g, '') === 'custid',
    ],
    'CUSTOMER_ID'
  );
  const custNameCol = findNpsTrendSheetColumn(
    firstRow,
    [
      (k) => k.toLowerCase().replace(/[\s_]/g, '') === 'customername',
      (k) => k.toLowerCase().replace(/[\s_]/g, '') === 'custnm',
      (k) => k.toLowerCase() === 'cust_nm',
    ],
    'CUSTOMER NAME'
  );
  const perspectiveCol = findNpsTrendSheetColumn(
    firstRow,
    [(k) => k.toLowerCase().includes('perspective')],
    'PERSPECTIVE'
  );
  const ratingCol = findNpsTrendSheetColumn(
    firstRow,
    [
      (k) => k.toLowerCase() === 'rating',
      (k) => k.toLowerCase().includes('rating'),
    ],
    'RATING'
  );

  const ensureStats = (key) => {
    if (!lookup.has(key)) {
      lookup.set(key, { npsRatingSum: 0, npsRatingCount: 0 });
    }
    return lookup.get(key);
  };

  receivedData.forEach((row) => {
    const perspective = getNpsTrendRowValue(row, perspectiveCol, 'PERSPECTIVE').toString().trim();
    if (!isNpsPerspectiveValue(perspective)) return;

    const rating = parseNpsTrendScoreValue(row, ratingCol, 'RATING');
    if (rating === null) return;

    const customerId = normalizeNpsTrendCustomerIdKey(
      getNpsTrendRowValue(row, custIdCol, 'CUSTOMER_ID', 'CUST_ID').toString().trim()
    );
    const customerName = getNpsTrendRowValue(row, custNameCol, 'CUSTOMER NAME', 'CUST_NM').toString().trim();
    const groupKey = customerId || customerName;
    if (!groupKey) return;

    const stats = ensureStats(groupKey);
    stats.npsRatingSum += rating;
    stats.npsRatingCount += 1;
  });

  return lookup;
};

const getNpsRatingStatsForTrendGroup = (group, lookup) => {
  if (!lookup?.size) return { npsRatingSum: 0, npsRatingCount: 0 };
  const idKey = normalizeNpsTrendCustomerIdKey(group.customerId);
  const nameKey = (group.customerName || '').toString().trim();
  if (idKey && lookup.has(idKey)) return lookup.get(idKey);
  if (nameKey && lookup.has(nameKey)) return lookup.get(nameKey);
  return { npsRatingSum: 0, npsRatingCount: 0 };
};

const buildNpsRatingAvgLookupByBuFromTrendReceivedReport = (file) => {
  const sheetNames = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
  const receivedSheetName = findAcsatReceivedReportSheetName(sheetNames);
  const receivedData = receivedSheetName ? (file.sheets?.[receivedSheetName] || []) : [];
  const lookup = new Map();

  if (!receivedData.length) return lookup;

  const firstRow = receivedData[0] || {};
  const buCol = findNpsTrendSheetColumn(
    firstRow,
    [
      (k) => k.toLowerCase().replace(/[\s_]/g, '') === 'businessunit',
      (k) => k.toLowerCase().includes('business unit'),
    ],
    'BUSINESS UNIT'
  );
  const perspectiveCol = findNpsTrendSheetColumn(
    firstRow,
    [(k) => k.toLowerCase().includes('perspective')],
    'PERSPECTIVE'
  );
  const ratingCol = findNpsTrendSheetColumn(
    firstRow,
    [
      (k) => k.toLowerCase() === 'rating',
      (k) => k.toLowerCase().includes('rating'),
    ],
    'RATING'
  );

  const ensureStats = (key) => {
    if (!lookup.has(key)) {
      lookup.set(key, { npsRatingSum: 0, npsRatingCount: 0 });
    }
    return lookup.get(key);
  };

  receivedData.forEach((row) => {
    const perspective = getNpsTrendRowValue(row, perspectiveCol, 'PERSPECTIVE').toString().trim();
    if (!isNpsPerspectiveValue(perspective)) return;

    const rating = parseNpsTrendScoreValue(row, ratingCol, 'RATING');
    if (rating === null) return;

    const businessUnit = normalizeBusinessUnitDisplay(
      getNpsTrendRowValue(row, buCol, 'BUSINESS UNIT').toString().trim() || 'N/A'
    );
    const buKey = normalizeNpsTrendBuKey(businessUnit);
    if (!buKey) return;

    const stats = ensureStats(buKey);
    stats.npsRatingSum += rating;
    stats.npsRatingCount += 1;
  });

  return lookup;
};

const getNpsRatingStatsForBuTrendGroup = (group, lookup) => {
  if (!lookup?.size) return { npsRatingSum: 0, npsRatingCount: 0 };
  const buKey = normalizeNpsTrendBuKey(group.businessUnit);
  if (buKey && lookup.has(buKey)) return lookup.get(buKey);
  return { npsRatingSum: 0, npsRatingCount: 0 };
};

const findNpsTrendSheetColumn = (firstRow, matchers, fallback) => {
  const keys = Object.keys(firstRow || {});
  for (const matcher of matchers) {
    const found = keys.find((k) => matcher((k || '').trim()));
    if (found) return found;
  }
  const fallbackNorm = String(fallback).toLowerCase().replace(/[\s_]/g, '');
  const trimmedMatch = keys.find(
    (k) => (k || '').trim().toLowerCase().replace(/[\s_]/g, '') === fallbackNorm
  );
  return trimmedMatch || fallback;
};

const getNpsTrendRowValue = (row, columnKey, ...fallbackNames) => {
  if (!row) return '';
  if (columnKey && row[columnKey] !== undefined && row[columnKey] !== '') return row[columnKey];
  const keys = Object.keys(row);
  const names = [columnKey, ...fallbackNames].filter(Boolean);
  for (const name of names) {
    const norm = String(name).toLowerCase().replace(/[\s_]/g, '');
    const key = keys.find((k) => (k || '').trim().toLowerCase().replace(/[\s_]/g, '') === norm);
    if (key !== undefined) return row[key];
  }
  return '';
};

const normalizeNpsTrendCustomerIdKey = (value) => {
  if (value == null) return '';
  const raw = String(value).trim();
  if (!raw) return '';
  if (/^-?\d+(\.\d+)?$/.test(raw)) {
    const num = Number(raw);
    if (!Number.isNaN(num) && Number.isInteger(num)) return String(num);
  }
  return raw;
};

const hasNpsTrendSheetDateValue = (row, columnKey, ...fallbackNames) => {
  const val = getNpsTrendRowValue(row, columnKey, ...fallbackNames);
  if (val == null || val === '') return false;
  const parsed = parseExcelDateToMMDDYYYY(val);
  return !!parsed && parsed !== 'N/A';
};

const parseNpsTrendScoreValue = (row, columnKey, ...fallbackNames) => {
  const val = getNpsTrendRowValue(row, columnKey, ...fallbackNames);
  if (val === '' || val == null) return null;
  const n = parseFloat(val);
  return Number.isNaN(n) ? null : n;
};

const roundNpsTrendRate = (value) => Math.round((value ?? 0) * 10) / 10;

const roundNpsTrendScore = (value) => Math.round((value ?? 0) * 100) / 100;

const mapNpsAccountTrendGroupToRow = (group) => {
  const polled = group.polled || 0;
  const responded = group.responded || 0;
  const responseRatePct = polled > 0 ? (responded / polled) * 100 : 0;

  const predictedPromoters = group.predictedPromoters || 0;
  const predictedDetractors = group.predictedDetractors || 0;
  const predictedPassives = group.predictedPassives || 0;
  const predictedTotal = predictedPromoters + predictedDetractors + predictedPassives;
  const predictedNps =
    predictedTotal > 0
      ? ((predictedPromoters / predictedTotal) * 100) - ((predictedDetractors / predictedTotal) * 100)
      : 0;

  const actualPromoters = group.actualPromoters || 0;
  const actualDetractors = group.actualDetractors || 0;
  const actualNps = responded > 0 ? ((actualPromoters - actualDetractors) / responded) * 100 : 0;

  const npsRatingSum = group.npsRatingSum || 0;
  const npsRatingCount = group.npsRatingCount || 0;
  const npsScore = npsRatingCount > 0 ? roundNpsTrendScore(npsRatingSum / npsRatingCount) : null;

  return {
    businessUnit: group.businessUnit,
    customerId: group.customerId,
    customerName: group.customerName,
    polled,
    responded,
    responseRatePct: roundNpsTrendRate(responseRatePct),
    predictedPromoters,
    predictedDetractors,
    predictedPassives,
    predictedNps: roundNpsTrendScore(predictedNps),
    actualPromoters,
    actualDetractors,
    actualPassives: group.actualPassives || 0,
    actualNps: roundNpsTrendScore(actualNps),
    npsRatingSum,
    npsRatingCount,
    npsScore,
  };
};

const aggregateNpsAccountTrendGrandTotal = (rows) => {
  if (!rows.length) return null;
  const npsRatingSum = rows.reduce((sum, r) => sum + (r.npsRatingSum || 0), 0);
  const npsRatingCount = rows.reduce((sum, r) => sum + (r.npsRatingCount || 0), 0);
  return mapNpsAccountTrendGroupToRow({
    businessUnit: '',
    customerId: '',
    customerName: 'Grand Total',
    polled: rows.reduce((sum, r) => sum + (r.polled || 0), 0),
    responded: rows.reduce((sum, r) => sum + (r.responded || 0), 0),
    predictedPromoters: rows.reduce((sum, r) => sum + (r.predictedPromoters || 0), 0),
    predictedDetractors: rows.reduce((sum, r) => sum + (r.predictedDetractors || 0), 0),
    predictedPassives: rows.reduce((sum, r) => sum + (r.predictedPassives || 0), 0),
    actualPromoters: rows.reduce((sum, r) => sum + (r.actualPromoters || 0), 0),
    actualDetractors: rows.reduce((sum, r) => sum + (r.actualDetractors || 0), 0),
    actualPassives: rows.reduce((sum, r) => sum + (r.actualPassives || 0), 0),
    npsRatingSum,
    npsRatingCount,
  });
};

const buildNpsTrendFromSentReceivedFile = (file, { mode = 'account' } = {}) => {
  const top10Only = mode === 'top10';
  const buOnly = mode === 'bu';
  const sheetNames = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
  const sheetName = findAcsatSentReceivedSheetName(sheetNames);
  const data = sheetName ? (file.sheets?.[sheetName] || []) : [];

  if (!data.length) {
    return {
      saveName: file.saveName || file.originalName || 'Trend file',
      rows: [],
      grandTotal: null,
      hasData: false,
      error: 'CSAT sent and received Report sheet not found or empty in uploaded trend file.',
    };
  }

  const firstRow = data[0] || {};
  const typeOfAccountCol = findNpsTrendSheetColumn(
    firstRow,
    [
      (k) => k.toLowerCase().replace(/[\s_]/g, '') === 'typeofaccount',
      (k) => k.toLowerCase().includes('type') && k.toLowerCase().includes('account'),
    ],
    'TYPE OF ACCOUNT'
  );
  const buCol = findNpsTrendSheetColumn(
    firstRow,
    [
      (k) => k.toLowerCase().replace(/[\s_]/g, '') === 'businessunit',
      (k) => k.toLowerCase().includes('business unit'),
    ],
    'BUSINESS UNIT'
  );
  const custNameCol = findNpsTrendSheetColumn(
    firstRow,
    [
      (k) => k.toLowerCase().replace(/[\s_]/g, '') === 'customername',
      (k) => k.toLowerCase().replace(/[\s_]/g, '') === 'custnm',
      (k) => k.toLowerCase() === 'cust_nm',
    ],
    'CUSTOMER NAME'
  );
  const custIdCol = findNpsTrendSheetColumn(
    firstRow,
    [
      (k) => k.toLowerCase().replace(/[\s_]/g, '') === 'customerid',
      (k) => k.toLowerCase().replace(/[\s_]/g, '') === 'custid',
    ],
    'CUSTOMER_ID'
  );
  const sentDateCol = findNpsTrendSheetColumn(
    firstRow,
    [
      (k) => {
        const kn = k.toLowerCase().replace(/[\s_]/g, '');
        return kn.includes('csatsentdate') || (kn.includes('sent') && kn.includes('date') && !kn.includes('received'));
      },
    ],
    'CSAT SENT DATE'
  );
  const receivedDateCol = findNpsTrendSheetColumn(
    firstRow,
    [
      (k) => {
        const kn = k.toLowerCase().replace(/[\s_]/g, '');
        return kn.includes('csatreceiveddate') || (kn.includes('received') && kn.includes('date'));
      },
    ],
    'CSAT RECEIVED DATE'
  );
  const predictedScoreCol = findNpsTrendSheetColumn(
    firstRow,
    [
      (k) => k.toLowerCase().replace(/[\s_]/g, '') === 'predictedscore',
      (k) => k.toLowerCase().includes('predicted') && k.toLowerCase().includes('score'),
    ],
    'PREDICTED SCORE'
  );
  const actualScoreCol = findNpsTrendSheetColumn(
    firstRow,
    [
      (k) => k.toLowerCase().replace(/[\s_]/g, '') === 'actualscore',
      (k) => k.toLowerCase().includes('actual') && k.toLowerCase().includes('score'),
    ],
    'ACTUAL SCORE'
  );

  const groups = new Map();

  const ensureGroup = (key, meta) => {
    if (!groups.has(key)) {
      groups.set(key, {
        businessUnit: meta.businessUnit,
        customerId: meta.customerId || '',
        customerName: meta.customerName,
        polled: 0,
        responded: 0,
        predictedPromoters: 0,
        predictedDetractors: 0,
        predictedPassives: 0,
        actualPromoters: 0,
        actualDetractors: 0,
        actualPassives: 0,
      });
    }
    return groups.get(key);
  };

  data.forEach((row) => {
    if (top10Only) {
      const typeOfAccount = getNpsTrendRowValue(
        row,
        typeOfAccountCol,
        'TYPE OF ACCOUNT',
        'TYPE_OF_ACCOUNT',
        'Type of Account'
      );
      if (!isTop10TypeOfAccount(typeOfAccount)) return;
    }

    const businessUnit = normalizeBusinessUnitDisplay(
      getNpsTrendRowValue(row, buCol, 'BUSINESS UNIT').toString().trim() || 'N/A'
    );

    let groupKey;
    let groupMeta;
    if (buOnly) {
      groupKey = normalizeNpsTrendBuKey(businessUnit);
      if (!groupKey) return;
      groupMeta = {
        businessUnit: businessUnit && businessUnit !== 'N/A' ? businessUnit : 'N/A',
        customerId: '',
        customerName: businessUnit && businessUnit !== 'N/A' ? businessUnit : 'N/A',
      };
    } else {
      const customerId = normalizeNpsTrendCustomerIdKey(
        getNpsTrendRowValue(row, custIdCol, 'CUSTOMER_ID', 'CUST_ID').toString().trim()
      );
      const customerName = getNpsTrendRowValue(row, custNameCol, 'CUSTOMER NAME', 'CUST_NM').toString().trim();
      groupKey = customerId || customerName;
      if (!groupKey) return;
      groupMeta = {
        businessUnit: businessUnit && businessUnit !== 'N/A' ? businessUnit : 'N/A',
        customerId,
        customerName: customerName || groupKey,
      };
    }

    const agg = ensureGroup(groupKey, groupMeta);

    if (hasNpsTrendSheetDateValue(row, sentDateCol, 'CSAT SENT DATE')) {
      agg.polled += 1;
    }

    const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
    const isCompletedStatus = statusVal === 'completed';
    const hasReceived = isCompletedStatus && hasNpsTrendSheetDateValue(row, receivedDateCol, 'CSAT RECEIVED DATE');
    if (hasReceived) {
      agg.responded += 1;
    }

    if (hasReceived) {
      const predictedScore = parseNpsTrendScoreValue(row, predictedScoreCol, 'PREDICTED SCORE', 'PREDICTED_SCORE');
      if (predictedScore !== null) {
        if (predictedScore === 9 || predictedScore === 10) {
          agg.predictedPromoters += 1;
        } else if (predictedScore < 7) {
          agg.predictedDetractors += 1;
        } else if (predictedScore === 7 || predictedScore === 8) {
          agg.predictedPassives += 1;
        }
      }

      const actualScore = parseNpsTrendScoreValue(row, actualScoreCol, 'ACTUAL SCORE', 'ACTUAL_SCORE');
      if (actualScore !== null) {
        if (actualScore === 9 || actualScore === 10) {
          agg.actualPromoters += 1;
        } else if (actualScore < 7) {
          agg.actualDetractors += 1;
        } else if (actualScore === 7 || actualScore === 8) {
          agg.actualPassives += 1;
        }
      }
    }
  });

  const npsRatingLookup = top10Only
    ? null
    : buOnly
      ? buildNpsRatingAvgLookupByBuFromTrendReceivedReport(file)
      : buildNpsRatingAvgLookupFromTrendReceivedReport(file);

  const rows = Array.from(groups.values())
    .map((g) => {
      const npsStats = top10Only
        ? { npsRatingSum: 0, npsRatingCount: 0 }
        : buOnly
          ? getNpsRatingStatsForBuTrendGroup(g, npsRatingLookup)
          : getNpsRatingStatsForTrendGroup(g, npsRatingLookup);
      return mapNpsAccountTrendGroupToRow({
        ...g,
        npsRatingSum: npsStats.npsRatingSum,
        npsRatingCount: npsStats.npsRatingCount,
      });
    })
    .sort((a, b) => {
      if (buOnly) return (a.businessUnit || '').localeCompare(b.businessUnit || '');
      return (a.customerName || '').localeCompare(b.customerName || '');
    });

  const grandTotal = aggregateNpsAccountTrendGrandTotal(rows);

  return {
    saveName: file.saveName || file.originalName || 'Trend file',
    rows,
    grandTotal,
    hasData: rows.length > 0,
    error: rows.length === 0
      ? top10Only
        ? 'No Top 10 account rows found in CSAT sent and received Report (TYPE OF ACCOUNT = Top 10).'
        : buOnly
          ? 'No BU-wise rows found in CSAT sent and received Report.'
          : 'No account-wise rows found in CSAT sent and received Report.'
      : null,
  };
};

const buildAccountWiseNpsTrendFromFile = (file) => buildNpsTrendFromSentReceivedFile(file, { mode: 'account' });

const buildTop10NpsTrendFromFile = (file) => buildNpsTrendFromSentReceivedFile(file, { mode: 'top10' });

const buildBuWiseNpsTrendFromFile = (file) => buildNpsTrendFromSentReceivedFile(file, { mode: 'bu' });

const sortNpsAccountTrendRows = (rows, accountOrder = []) =>
  [...rows].sort((a, b) => {
    const aName = (a.customerName || '').toString().trim();
    const bName = (b.customerName || '').toString().trim();
    const aIndex = accountOrder.findIndex(
      (name) =>
        aName.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(aName.toLowerCase())
    );
    const bIndex = accountOrder.findIndex(
      (name) =>
        bName.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(bName.toLowerCase())
    );
    const aPos = aIndex === -1 ? 999 : aIndex;
    const bPos = bIndex === -1 ? 999 : bIndex;
    if (aPos !== bPos) return aPos - bPos;
    return aName.localeCompare(bName);
  });

const sortTop10NpsTrendRows = (rows, top10AccountNames = []) =>
  [...rows].sort((a, b) => {
    const aIndex = getTop10AccountSortIndex(a.customerName, top10AccountNames);
    const bIndex = getTop10AccountSortIndex(b.customerName, top10AccountNames);
    if (aIndex !== bIndex) return aIndex - bIndex;
    const buDiff = (a.businessUnit || '').localeCompare(b.businessUnit || '');
    if (buDiff !== 0) return buDiff;
    return (a.customerName || '').localeCompare(b.customerName || '');
  });

const addNpsTop10TrendSheetToWorkbook = (workbook, fileData, sheetIndex) => {
  if (!fileData?.hasData || !fileData.rows?.length) return;
  const safeName = `NPS_Top10_Trend_${sheetIndex + 1}`.slice(0, 31);
  const trendSheet = workbook.addWorksheet(safeName);

  const headerRow1 = trendSheet.addRow([
    '',
    '',
    '',
    'Response Rate',
    '',
    '',
    'Predicted NPS for the surveys received',
    '',
    '',
    '',
    'Actual NPS',
    '',
    '',
    '',
  ]);
  const headerRow2 = trendSheet.addRow([
    'Sr. No.',
    'Business Unit',
    'Account Name',
    'Polled',
    'Responded',
    'Response Rate %',
    'Number of Promoters',
    'Number of Detractors',
    'Number of Passives',
    'NPS',
    'Number of Promoters',
    'Number of Detractors',
    'Number of Passives',
    'NPS',
  ]);

  [headerRow1, headerRow2].forEach((row, rowIdx) => {
    row.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowIdx === 0 ? 'FF9FC5E8' : 'FF0F766E' },
      };
      cell.font = { bold: true, color: { argb: rowIdx === 0 ? 'FF000000' : 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
    row.height = rowIdx === 0 ? 28 : 40;
  });

  const appendTrendDataRow = (rowData, { bold = false, fill = null } = {}) => {
    const addedRow = trendSheet.addRow(rowData);
    addedRow.height = 28;
    addedRow.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
      if (fill) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
      }
      cell.font = { bold, color: { argb: 'FF000000' } };
      if (colNumber === 1) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber === 2 || colNumber === 3) {
        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      } else if (colNumber === 6) {
        cell.value = `${Number(rowData[5] ?? 0).toFixed(1)}%`;
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber === 10) {
        cell.value = Number(rowData[9] ?? 0).toFixed(2);
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber === 14) {
        cell.value = Number(rowData[13] ?? 0).toFixed(2);
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber >= 4) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        if ([4, 5, 7, 8, 9, 11, 12, 13].includes(colNumber)) {
          cell.numFmt = '0';
        }
      }
    });
  };

  fileData.rows.forEach((row, rowIndex) => {
    appendTrendDataRow([
      rowIndex + 1,
      normalizeBusinessUnitDisplay(row.businessUnit) || '',
      row.customerName || '',
      row.polled ?? 0,
      row.responded ?? 0,
      row.responseRatePct ?? 0,
      row.predictedPromoters ?? 0,
      row.predictedDetractors ?? 0,
      row.predictedPassives ?? 0,
      row.predictedNps ?? 0,
      row.actualPromoters ?? 0,
      row.actualDetractors ?? 0,
      row.actualPassives ?? 0,
      row.actualNps ?? 0,
    ]);
  });

  if (fileData.grandTotal) {
    const gt = fileData.grandTotal;
    appendTrendDataRow(
      [
        '',
        '',
        gt.customerName || 'Grand Total',
        gt.polled ?? 0,
        gt.responded ?? 0,
        gt.responseRatePct ?? 0,
        gt.predictedPromoters ?? 0,
        gt.predictedDetractors ?? 0,
        gt.predictedPassives ?? 0,
        gt.predictedNps ?? 0,
        gt.actualPromoters ?? 0,
        gt.actualDetractors ?? 0,
        gt.actualPassives ?? 0,
        gt.actualNps ?? 0,
      ],
      { bold: true, fill: 'FFE2E8F0' }
    );
  }

  trendSheet.columns = [
    { width: 8 },
    { width: 22 },
    { width: 34 },
    { width: 10 },
    { width: 12 },
    { width: 14 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 10 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 10 },
  ];
};

const addNpsBuWiseTrendSheetToWorkbook = (workbook, fileData, sheetIndex) => {
  if (!fileData?.hasData || !fileData.rows?.length) return;
  const safeName = `NPS_BU_Trend_${sheetIndex + 1}`.slice(0, 31);
  const trendSheet = workbook.addWorksheet(safeName);

  const headerRow1 = trendSheet.addRow([
    '',
    '',
    'Response Rate',
    '',
    '',
    'Predicted NPS for the surveys received',
    '',
    '',
    '',
    'Actual NPS',
    '',
    '',
    '',
    '',
  ]);
  const headerRow2 = trendSheet.addRow([
    'Sr. No.',
    'Business Unit',
    'Polled',
    'Responded',
    'Response Rate %',
    'Number of Promoters',
    'Number of Detractors',
    'Number of Passives',
    'NPS',
    'Number of Promoters',
    'Number of Detractors',
    'Number of Passives',
    'NPS',
    'NPS score',
  ]);

  [headerRow1, headerRow2].forEach((row, rowIdx) => {
    row.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowIdx === 0 ? 'FF9FC5E8' : 'FF4338CA' },
      };
      cell.font = { bold: true, color: { argb: rowIdx === 0 ? 'FF000000' : 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
    row.height = rowIdx === 0 ? 28 : 40;
  });

  const appendTrendDataRow = (rowData, { bold = false, fill = null } = {}) => {
    const addedRow = trendSheet.addRow(rowData);
    addedRow.height = 28;
    addedRow.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
      if (fill) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
      }
      cell.font = { bold, color: { argb: 'FF000000' } };
      if (colNumber === 1) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber === 2) {
        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      } else if (colNumber === 5) {
        cell.value = `${Number(rowData[4] ?? 0).toFixed(1)}%`;
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber === 9) {
        cell.value = Number(rowData[8] ?? 0).toFixed(2);
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber === 13) {
        cell.value = Number(rowData[12] ?? 0).toFixed(2);
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber === 14) {
        const npsScoreVal = rowData[13];
        cell.value = npsScoreVal == null || npsScoreVal === '' ? '-' : Number(npsScoreVal).toFixed(2);
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber >= 3) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        if ([3, 4, 6, 7, 8, 10, 11, 12].includes(colNumber)) {
          cell.numFmt = '0';
        }
      }
    });
  };

  fileData.rows.forEach((row, rowIndex) => {
    appendTrendDataRow([
      rowIndex + 1,
      normalizeBusinessUnitDisplay(row.businessUnit) || '',
      row.polled ?? 0,
      row.responded ?? 0,
      row.responseRatePct ?? 0,
      row.predictedPromoters ?? 0,
      row.predictedDetractors ?? 0,
      row.predictedPassives ?? 0,
      row.predictedNps ?? 0,
      row.actualPromoters ?? 0,
      row.actualDetractors ?? 0,
      row.actualPassives ?? 0,
      row.actualNps ?? 0,
      row.npsScore ?? '',
    ]);
  });

  if (fileData.grandTotal) {
    const gt = fileData.grandTotal;
    appendTrendDataRow(
      [
        '',
        gt.customerName || 'Org Level',
        gt.polled ?? 0,
        gt.responded ?? 0,
        gt.responseRatePct ?? 0,
        gt.predictedPromoters ?? 0,
        gt.predictedDetractors ?? 0,
        gt.predictedPassives ?? 0,
        gt.predictedNps ?? 0,
        gt.actualPromoters ?? 0,
        gt.actualDetractors ?? 0,
        gt.actualPassives ?? 0,
        gt.actualNps ?? 0,
        gt.npsScore ?? '',
      ],
      { bold: true, fill: 'FFE2E8F0' }
    );
  }

  trendSheet.columns = [
    { width: 8 },
    { width: 28 },
    { width: 10 },
    { width: 12 },
    { width: 14 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 10 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 10 },
    { width: 12 },
  ];
};

const addNpsAccountWiseTrendSheetToWorkbook = (workbook, fileData, sheetIndex) => {
  if (!fileData?.hasData || !fileData.rows?.length) return;
  const safeName = `NPS_Account_Trend_${sheetIndex + 1}`.slice(0, 31);
  const trendSheet = workbook.addWorksheet(safeName);

  const headerRow1 = trendSheet.addRow([
    '',
    '',
    '',
    'Response Rate',
    '',
    '',
    'Predicted NPS for the surveys received',
    '',
    '',
    '',
    'Actual NPS',
    '',
    '',
    '',
    '',
  ]);
  const headerRow2 = trendSheet.addRow([
    'Sr. No.',
    'Business Unit',
    'Account Name',
    'Polled',
    'Responded',
    'Response Rate %',
    'Number of Promoters',
    'Number of Detractors',
    'Number of Passives',
    'NPS',
    'Number of Promoters',
    'Number of Detractors',
    'Number of Passives',
    'NPS',
    'NPS score',
  ]);

  [headerRow1, headerRow2].forEach((row, rowIdx) => {
    row.eachCell((cell, colNumber) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowIdx === 0 ? 'FF9FC5E8' : 'FF0F766E' },
      };
      cell.font = { bold: true, color: { argb: rowIdx === 0 ? 'FF000000' : 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
    row.height = rowIdx === 0 ? 28 : 40;
  });

  const appendTrendDataRow = (rowData, { bold = false, fill = null } = {}) => {
    const addedRow = trendSheet.addRow(rowData);
    addedRow.height = 28;
    addedRow.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
      if (fill) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
      }
      cell.font = { bold, color: { argb: 'FF000000' } };
      if (colNumber === 1) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber === 2 || colNumber === 3) {
        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      } else if (colNumber === 6) {
        cell.value = `${Number(rowData[5] ?? 0).toFixed(1)}%`;
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber === 10) {
        cell.value = Number(rowData[9] ?? 0).toFixed(2);
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber === 14) {
        cell.value = Number(rowData[13] ?? 0).toFixed(2);
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber === 15) {
        const npsScoreVal = rowData[14];
        cell.value = npsScoreVal == null || npsScoreVal === '' ? '-' : Number(npsScoreVal).toFixed(2);
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber >= 4) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        if ([4, 5, 7, 8, 9, 11, 12, 13].includes(colNumber)) {
          cell.numFmt = '0';
        }
      }
    });
  };

  fileData.rows.forEach((row, rowIndex) => {
    appendTrendDataRow([
      rowIndex + 1,
      normalizeBusinessUnitDisplay(row.businessUnit) || '',
      row.customerName || '',
      row.polled ?? 0,
      row.responded ?? 0,
      row.responseRatePct ?? 0,
      row.predictedPromoters ?? 0,
      row.predictedDetractors ?? 0,
      row.predictedPassives ?? 0,
      row.predictedNps ?? 0,
      row.actualPromoters ?? 0,
      row.actualDetractors ?? 0,
      row.actualPassives ?? 0,
      row.actualNps ?? 0,
      row.npsScore ?? '',
    ]);
  });

  if (fileData.grandTotal) {
    const gt = fileData.grandTotal;
    appendTrendDataRow(
      [
        '',
        '',
        gt.customerName || 'Grand Total',
        gt.polled ?? 0,
        gt.responded ?? 0,
        gt.responseRatePct ?? 0,
        gt.predictedPromoters ?? 0,
        gt.predictedDetractors ?? 0,
        gt.predictedPassives ?? 0,
        gt.predictedNps ?? 0,
        gt.actualPromoters ?? 0,
        gt.actualDetractors ?? 0,
        gt.actualPassives ?? 0,
        gt.actualNps ?? 0,
        gt.npsScore ?? '',
      ],
      { bold: true, fill: 'FFE2E8F0' }
    );
  }

  trendSheet.columns = [
    { width: 8 },
    { width: 22 },
    { width: 34 },
    { width: 10 },
    { width: 12 },
    { width: 14 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 10 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 10 },
    { width: 12 },
  ];
};

const normalizeNpsTrendBuKey = (businessUnit) =>
  normalizeBusinessUnitDisplay(businessUnit)?.toString().trim().toLowerCase() || '';

const normalizeNpsTrendAccountNameKey = (value) =>
  (value ?? '').toString().trim().toLowerCase().replace(/\s+/g, ' ');

const findNpsAccountMainTrendRowForCustomer = (businessUnit, customerId, customerName, trendRows) => {
  if (!trendRows?.length) return null;
  const buKey = normalizeNpsTrendBuKey(businessUnit);
  if (!buKey) return null;

  const idKey = normalizeNpsTrendCustomerIdKey(customerId)?.toString().trim().toLowerCase() || '';
  const nameKey = normalizeNpsTrendAccountNameKey(customerName);

  if (idKey) {
    const byId = trendRows.find((tr) => {
      const trBu = normalizeNpsTrendBuKey(tr.businessUnit);
      if (trBu !== buKey && !trBu.includes(buKey) && !buKey.includes(trBu)) return false;
      const trId = normalizeNpsTrendCustomerIdKey(tr.customerId)?.toString().trim().toLowerCase() || '';
      const trName = normalizeNpsTrendAccountNameKey(tr.customerName);
      return trId === idKey || trName === idKey;
    });
    if (byId) return byId;
  }

  if (nameKey) {
    const key = `${buKey}|||${nameKey}`;
    const exact = trendRows.find(
      (tr) => `${normalizeNpsTrendBuKey(tr.businessUnit)}|||${normalizeNpsTrendAccountNameKey(tr.customerName)}` === key
    );
    if (exact) return exact;
    return (
      trendRows.find((tr) => {
        const tk = `${normalizeNpsTrendBuKey(tr.businessUnit)}|||${normalizeNpsTrendAccountNameKey(tr.customerName)}`;
        return tk.includes(key) || key.includes(tk);
      }) || null
    );
  }

  return null;
};

const buildNpsMainTrendLookup = (rows) => {
  const lookup = {};
  (rows || []).forEach((tr) => {
    const buKey = normalizeNpsTrendBuKey(tr.businessUnit);
    const idKey = normalizeNpsTrendCustomerIdKey(tr.customerId)?.toString().trim().toLowerCase() || '';
    const nameKey = normalizeNpsTrendAccountNameKey(tr.customerName);
    if (idKey) lookup[`id|||${idKey}|||${buKey}`] = tr;
    if (nameKey) lookup[`name|||${nameKey}|||${buKey}`] = tr;
  });
  return lookup;
};

const findNpsMainTrendRow = (group, fileData, lookup) => {
  if (!fileData?.rows?.length) return null;
  const buKey = normalizeNpsTrendBuKey(group.businessUnit);
  const idKey = normalizeNpsTrendCustomerIdKey(group.customerId)?.toString().trim().toLowerCase() || '';
  const nameKey = normalizeNpsTrendAccountNameKey(group.customerName);
  if (idKey && lookup[`id|||${idKey}|||${buKey}`]) return lookup[`id|||${idKey}|||${buKey}`];
  if (nameKey && lookup[`name|||${nameKey}|||${buKey}`]) return lookup[`name|||${nameKey}|||${buKey}`];
  return findNpsAccountMainTrendRowForCustomer(
    group.businessUnit,
    group.customerId,
    group.customerName,
    fileData.rows
  );
};

const buildNpsBuMainTrendLookup = (rows, grandTotal) => {
  const lookup = {};
  (rows || []).forEach((tr) => {
    const buKey = normalizeNpsTrendBuKey(tr.businessUnit);
    if (buKey) lookup[buKey] = tr;
  });
  if (grandTotal) {
    const orgLevelKey = normalizeNpsTrendBuKey('Org Level');
    if (orgLevelKey) lookup[orgLevelKey] = grandTotal;
  }
  return lookup;
};

const findNpsBuMainTrendRow = (group, fileData, lookup) => {
  const buKey = normalizeNpsTrendBuKey(group.businessUnit);
  if (buKey && lookup?.[buKey]) return lookup[buKey];
  if (!fileData?.rows?.length) return null;
  return (
    fileData.rows.find((tr) => {
      const trBu = normalizeNpsTrendBuKey(tr.businessUnit);
      return trBu === buKey || trBu.includes(buKey) || buKey.includes(trBu);
    }) || null
  );
};

const computeNpsResponseRateTrendDiff = (dashboardRate, trendRow) => {
  if (!trendRow) return null;
  const dashRate = roundNpsTrendRate(dashboardRate);
  const trendRate = roundNpsTrendRate(trendRow.responseRatePct);
  return roundNpsTrendRate(dashRate - trendRate);
};

const computeNpsCountTrendDiff = (dashboardCount, trendRow, trendField) => {
  if (!trendRow) return null;
  const dash = Number(dashboardCount);
  if (Number.isNaN(dash)) return null;
  return dash - Number(trendRow[trendField] ?? 0);
};

const computeNpsActualNpsTrendDiff = (dashboardNps, trendRow) => {
  if (!trendRow) return null;
  const dash = roundNpsTrendScore(dashboardNps);
  const trend = roundNpsTrendScore(trendRow.actualNps);
  return roundNpsTrendScore(dash - trend);
};

const formatNpsResponseRateTrendDiffDisplay = (diff) => {
  if (diff == null) {
    return { diffText: '-', arrow: '', diffColor: '#6b7280', arrowColor: '#6b7280' };
  }
  if (diff > 0) {
    return {
      diffText: `+${diff.toFixed(1)}%`,
      arrow: '↑',
      diffColor: '#1f2937',
      arrowColor: '#16a34a',
    };
  }
  if (diff < 0) {
    return {
      diffText: `${diff.toFixed(1)}%`,
      arrow: '↓',
      diffColor: '#1f2937',
      arrowColor: '#dc2626',
    };
  }
  return { diffText: '0%', arrow: '', diffColor: '#374151', arrowColor: '#374151' };
};

const formatNpsCountTrendDiffDisplay = (diff) => {
  if (diff == null) {
    return { diffText: '-', arrow: '', diffColor: '#6b7280', arrowColor: '#6b7280' };
  }
  if (diff > 0) {
    return {
      diffText: `+${diff}`,
      arrow: '↑',
      diffColor: '#1f2937',
      arrowColor: '#16a34a',
    };
  }
  if (diff < 0) {
    return {
      diffText: `${diff}`,
      arrow: '↓',
      diffColor: '#1f2937',
      arrowColor: '#dc2626',
    };
  }
  return { diffText: '0', arrow: '', diffColor: '#374151', arrowColor: '#374151' };
};

const formatNpsActualNpsTrendDiffDisplay = (diff) => {
  if (diff == null) {
    return { diffText: '-', arrow: '', diffColor: '#6b7280', arrowColor: '#6b7280' };
  }
  if (diff > 0) {
    return {
      diffText: `+${diff.toFixed(2)}`,
      arrow: '↑',
      diffColor: '#1f2937',
      arrowColor: '#16a34a',
    };
  }
  if (diff < 0) {
    return {
      diffText: diff.toFixed(2),
      arrow: '↓',
      diffColor: '#1f2937',
      arrowColor: '#dc2626',
    };
  }
  return { diffText: '0.00', arrow: '', diffColor: '#374151', arrowColor: '#374151' };
};

const renderNpsTrendDiffContent = (display) => {
  if (display.diffText === '-') {
    return <span style={{ color: display.diffColor }}>-</span>;
  }
  return (
    <>
      <span style={{ color: display.diffColor }}>{display.diffText}</span>
      {display.arrow ? (
        <span style={{ color: display.arrowColor, marginLeft: '0.35rem', fontWeight: 700 }}>
          {display.arrow}
        </span>
      ) : null}
    </>
  );
};

const npsTrendDisplayToExcelValue = (display) => {
  if (display.arrow && display.diffText && display.diffText !== '-') {
    const arrowArgb = display.arrowColor === '#16a34a' ? 'FF16A34A' : 'FFDC2626';
    return {
      richText: [
        { font: { bold: true, color: { argb: 'FF1F2937' } }, text: display.diffText },
        { font: { bold: true, color: { argb: arrowArgb } }, text: ` ${display.arrow}` },
      ],
    };
  }
  return display.diffText;
};

const npsMainTrendHeaderLabel = (baseLabel, fileData, fileCount) => {
  if (fileCount <= 1) return baseLabel;
  const name = (fileData?.saveName || fileData?.originalName || 'Trend file').replace(/\.[^.]+$/, '');
  return `${baseLabel} (${name})`;
};

const applyNpsTrendDiffExcelCellStyle = (cell, display) => {
  cell.value = npsTrendDisplayToExcelValue(display);
  cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  if (!display.arrow || display.diffText === '-') {
    cell.font = {
      bold: true,
      color: { argb: display.diffText === '-' ? 'FF6B7280' : 'FF374151' },
    };
  }
};

const NPS_MAIN_TREND_COLUMNS_PER_FILE = 5;

const getNpsMainTrendComparisonSubHeaders = (trendFiles, fileCount) =>
  trendFiles.flatMap((fileData) => [
    npsMainTrendHeaderLabel('Trend for Response Rate %', fileData, fileCount),
    npsMainTrendHeaderLabel('Trend #Promoters', fileData, fileCount),
    npsMainTrendHeaderLabel('Trend # Passives', fileData, fileCount),
    npsMainTrendHeaderLabel('Trend # Detractors', fileData, fileCount),
    npsMainTrendHeaderLabel('Trend NPS', fileData, fileCount),
  ]);

const getNpsDashboardExcelColumnIndices = (groupByBU, trendFileCount = 0) => {
  const identityCols = groupByBU ? 2 : 3;
  const responseRateCol = identityCols + 3;
  const predictedNpsCol = responseRateCol + 4;
  const actualNpsCol = predictedNpsCol + 4;
  const npsScoreCol = actualNpsCol + 1;
  const trendComparisonStartCol = npsScoreCol + 1;
  return {
    responseRateCol,
    predictedNpsCol,
    actualNpsCol,
    npsScoreCol,
    trendComparisonStartCol,
    trendComparisonColCount: trendFileCount * NPS_MAIN_TREND_COLUMNS_PER_FILE,
  };
};

const buildNpsMainTrendComparisonValues = (group, trendFiles, options = {}) => {
  const { useGrandTotalTrend = false, dashOnly = false, getTrendRow } = options;
  if (!trendFiles?.length) return [];

  return trendFiles.flatMap((fileData, fileIdx) => {
    if (dashOnly) return ['-', '-', '-', '-', '-'];

    const trendRow = useGrandTotalTrend
      ? fileData.grandTotal
      : getTrendRow
        ? getTrendRow(group, fileData, fileIdx)
        : null;
    const dashRate = group.sentCount === 0 ? 0 : roundNpsTrendRate(group.responseRate);
    const responseTrend = npsTrendDisplayToExcelValue(
      formatNpsResponseRateTrendDiffDisplay(computeNpsResponseRateTrendDiff(dashRate, trendRow))
    );

    if ((group.receivedCount || 0) === 0) {
      return [responseTrend, '-', '-', '-', '-'];
    }

    return [
      responseTrend,
      npsTrendDisplayToExcelValue(
        formatNpsCountTrendDiffDisplay(computeNpsCountTrendDiff(group.promotersCount, trendRow, 'actualPromoters'))
      ),
      npsTrendDisplayToExcelValue(
        formatNpsCountTrendDiffDisplay(computeNpsCountTrendDiff(group.passivesCount, trendRow, 'actualPassives'))
      ),
      npsTrendDisplayToExcelValue(
        formatNpsCountTrendDiffDisplay(computeNpsCountTrendDiff(group.detractorsCount, trendRow, 'actualDetractors'))
      ),
      npsTrendDisplayToExcelValue(
        formatNpsActualNpsTrendDiffDisplay(computeNpsActualNpsTrendDiff(group.npsScore, trendRow))
      ),
    ];
  });
};

const injectNpsMainTrendExcelColumns = (baseRow, group, trendFiles, options = {}) => {
  if (!trendFiles?.length) return baseRow;
  return [...baseRow, ...buildNpsMainTrendComparisonValues(group, trendFiles, options)];
};

const styleNpsExcelTrendDiffCells = (row, trendFiles, cols) => {
  if (!trendFiles?.length || !cols.trendComparisonColCount) return;
  const styleTrendCell = (cell) => {
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    if (cell.value === '-' || cell.value == null) {
      cell.font = { bold: true, color: { argb: 'FF6B7280' } };
    }
  };
  for (let offset = 0; offset < cols.trendComparisonColCount; offset += 1) {
    styleTrendCell(row.getCell(cols.trendComparisonStartCol + offset));
  }
};

const matchesTop10AccountName = (customerName, top10Name) => {
  const customer = (customerName ?? '').toString().trim().toLowerCase();
  const target = (top10Name ?? '').toString().trim().toLowerCase();
  if (!customer || !target) return false;
  return customer === target || customer.includes(target) || target.includes(customer);
};

const getTop10AccountSortIndex = (customerName, top10AccountNames) => {
  const index = top10AccountNames.findIndex((name) => matchesTop10AccountName(customerName, name));
  return index === -1 ? 999 : index;
};

const isTop10NpsAccount = (customerName, customerId, top10AccountNames, top10CustomerIds = new Set()) => {
  const name = (customerName ?? '').toString().trim();
  const idKey = customerId ? String(customerId).trim() : '';
  if (top10CustomerIds.size > 0 && idKey && top10CustomerIds.has(idKey)) {
    return true;
  }
  return top10AccountNames.some((top10Name) => matchesTop10AccountName(name, top10Name));
};

const NPSDashboard = ({ excelData, acsatCycleStartDate, acsatCycleStartDateFormatted, trendAnalysisFiles = [], onBack }) => {
  const [secondSheetData, setSecondSheetData] = useState([]);
  const [firstSheetData, setFirstSheetData] = useState([]);
  const [sheetLoadDebug, setSheetLoadDebug] = useState({
    firstSheet: { status: 'pending', reason: '', rowsBeforeFilter: 0, rowsAfterFilter: 0, sheetName: null },
    secondSheet: { status: 'pending', reason: '', rowsBeforeFilter: 0, rowsAfterFilter: 0, sheetName: null },
  });
  const [groupByBU, setGroupByBU] = useState(false);
  const [showScrollable, setShowScrollable] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showTop10, setShowTop10] = useState(false);
  const [showRespondedComparison, setShowRespondedComparison] = useState(false);
  const [showVerticalGraph, setShowVerticalGraph] = useState(false);
  const [showTop10Chart, setShowTop10Chart] = useState(false);
  const chartRef = useRef(null);
  const orgLevelChartRef = useRef(null);
  const top10ChartRef = useRef(null);
  const otherAccountChartRef = useRef(null);
  const respondentChartRef = useRef(null);
  const donutChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const acsatTrendSectionRef = useRef(null);
  const acsatTop10TrendSectionRef = useRef(null);
  const acsatBuTrendSectionRef = useRef(null);
  const [showAcsatTrendAnalysis, setShowAcsatTrendAnalysis] = useState(false);

  const isAccountWiseNpsView = !groupByBU && !showTop10 && !showRespondedComparison && !showVerticalGraph;
  const isTop10NpsView = !groupByBU && showTop10 && !showRespondedComparison && !showVerticalGraph;
  const isBuWiseNpsView = groupByBU && !showTop10 && !showRespondedComparison && !showVerticalGraph;
  const acsatNpsTrendViewMode = isBuWiseNpsView
    ? 'bu'
    : isTop10NpsView
      ? 'top10'
      : isAccountWiseNpsView
        ? 'account'
        : null;

  const scrollToAcsatTrendSection = () => {
    requestAnimationFrame(() => {
      const targetRef = isBuWiseNpsView
        ? acsatBuTrendSectionRef
        : isTop10NpsView
          ? acsatTop10TrendSectionRef
          : acsatTrendSectionRef;
      targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleViewAcsatTrendAnalysis = () => {
    if (!acsatNpsTrendViewMode) {
      alert('ACSAT trend analysis is available only in Account-wise, Top 10, or BU-wise NPS view on this dashboard.');
      return;
    }
    if (!trendAnalysisFiles?.length) {
      alert('Please upload ACSAT trend files using "Upload data for ACSAT trend analysis" on the Upload ACSAT Data page.');
      return;
    }
    const shouldDelayScroll = !showAcsatTrendAnalysis;
    setShowAcsatTrendAnalysis(true);
    setTimeout(scrollToAcsatTrendSection, shouldDelayScroll ? 150 : 0);
  };

  // Top 10 account names in order (aligned with Account/BU wise Response Rate dashboard)
  const top10AccountNames = [
    'Premier Healthcare Solutions Inc (L80)',
    'Blue Cross Blue Shield Association BCBSA',
    'Frontier Airlines INC',
    'Premier - Horizon II - Covenant Health',
    'Tufts Medicine',
    'BronxCare Health System',
    'AgFirst Farm Credit Bank',
    'embecta MEDICAL II LLC',
    'Northern Trust Company',
    'Jewish Board of Family and Childrens Services JBFCS',
    'Healthfirst',
    'AgileOne',
  ];
  
  // Account order for account-wise dashboard (only for account-wise view, not Top 10)
  const accountOrder = [
    'Premier Healthcare Solutions Inc (L80)',
    'Blue Cross Blue Shield Association BCBSA',
    'Frontier Airlines INC',
    'Tufts Medicine',
    'Premier - Horizon II - Covenant Health',
    'BronxCare Health System',
    'AgFirst Farm Credit Bank',
    'embecta MEDICAL II LLC',
    'Avaya LLC',
    'Northern Trust Company',
    'Jewish Board of Family and Childrens Services JBFCS',
    'Apollo Hospitals',
    'Aditya Birla Capital Digital Limited',
    'Healthfirst',
    'Firstsource Solutions Ltd',
    'Ooma Inc.',
    'Palo Alto Networks',
    'Hachette Book Group',
    'INFOBLOX INC.',
    'Arista Networks India Private Limited',
    'AthenaHealth',
    'VOCERA COMMUNICATIONS INDIA PRIVATE LIMITED',
    'Zoll Data Systems',
    'Foundation Building Materials, LLC',
    'CINQ CONNECT LLC',
    'ESSEN CARE MANAGEMENT LLC',
    'AgileOne',
    'Resonetics',
    'General Mills Private Limited',
    'Computer Data Source LLC',
    'Aditya Birla Sunlife AMC Limited',
    'Nerdio, Inc.',
    'CloudCall Ltd'
  ];

  const acsatNpsTrendAnalysisData = useMemo(() => {
    if (!showAcsatTrendAnalysis || !trendAnalysisFiles?.length || !isAccountWiseNpsView) return [];
    return trendAnalysisFiles.map((file) => {
      const built = buildAccountWiseNpsTrendFromFile(file);
      const rows = sortNpsAccountTrendRows(built.rows, accountOrder);
      return {
        ...built,
        rows,
        grandTotal: aggregateNpsAccountTrendGrandTotal(rows),
      };
    });
  }, [
    showAcsatTrendAnalysis,
    trendAnalysisFiles,
    isAccountWiseNpsView,
    accountOrder,
  ]);

  const acsatTop10NpsTrendAnalysisData = useMemo(() => {
    if (!showAcsatTrendAnalysis || !trendAnalysisFiles?.length || !isTop10NpsView) return [];
    return trendAnalysisFiles.map((file) => {
      const built = buildTop10NpsTrendFromFile(file);
      const rows = sortTop10NpsTrendRows(built.rows, top10AccountNames);
      const grandTotal = aggregateNpsAccountTrendGrandTotal(rows);
      return {
        ...built,
        rows,
        grandTotal: grandTotal
          ? { ...grandTotal, customerName: 'Top 10 Accounts' }
          : null,
      };
    });
  }, [
    showAcsatTrendAnalysis,
    trendAnalysisFiles,
    isTop10NpsView,
    top10AccountNames,
  ]);

  const acsatBuNpsTrendAnalysisData = useMemo(() => {
    if (!showAcsatTrendAnalysis || !trendAnalysisFiles?.length || !isBuWiseNpsView) return [];
    return trendAnalysisFiles.map((file) => {
      const built = buildBuWiseNpsTrendFromFile(file);
      const rows = [...built.rows].sort((a, b) => (a.businessUnit || '').localeCompare(b.businessUnit || ''));
      const grandTotal = aggregateNpsAccountTrendGrandTotal(rows);
      return {
        ...built,
        rows,
        grandTotal: grandTotal ? { ...grandTotal, customerName: 'Org Level' } : null,
      };
    });
  }, [showAcsatTrendAnalysis, trendAnalysisFiles, isBuWiseNpsView]);

  const downloadNpsBuWiseTrendExcel = async (singleFileData = null, singleFileIndex = 0) => {
    const trendFiles = singleFileData
      ? [singleFileData].filter((f) => f?.hasData && f.rows?.length)
      : acsatBuNpsTrendAnalysisData.filter((f) => f.hasData && f.rows?.length);
    if (!trendFiles.length) {
      alert('No BU-wise NPS trend data available to download.');
      return;
    }
    try {
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      trendFiles.forEach((fileData, idx) =>
        addNpsBuWiseTrendSheetToWorkbook(workbook, fileData, singleFileData ? singleFileIndex : idx)
      );
      const todayStr = new Date().toISOString().split('T')[0];
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeFileName = singleFileData
        ? (singleFileData.saveName || `BU_Trend_File_${singleFileIndex + 1}`).replace(/\.[^.]+$/, '')
        : 'ACSAT_NPS_BU_Wise_Trend_Analysis';
      link.download = `${safeFileName}_${todayStr}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading BU NPS trend Excel:', error);
      alert('Error downloading Excel file');
    }
  };

  const showAccountMainNpsTrendColumns =
    isAccountWiseNpsView && showAcsatTrendAnalysis && !!trendAnalysisFiles?.length;

  const showBuMainNpsTrendColumns =
    isBuWiseNpsView && showAcsatTrendAnalysis && !!trendAnalysisFiles?.length;

  const showMainNpsTrendColumns = showAccountMainNpsTrendColumns || showBuMainNpsTrendColumns;

  const mainNpsTrendAnalysisData = showBuMainNpsTrendColumns
    ? acsatBuNpsTrendAnalysisData
    : showAccountMainNpsTrendColumns
      ? acsatNpsTrendAnalysisData
      : [];

  const npsMainTrendLookups = useMemo(
    () => acsatNpsTrendAnalysisData.map((fileData) => buildNpsMainTrendLookup(fileData.rows || [])),
    [acsatNpsTrendAnalysisData]
  );

  const npsBuMainTrendLookups = useMemo(
    () =>
      acsatBuNpsTrendAnalysisData.map((fileData) =>
        buildNpsBuMainTrendLookup(fileData.rows || [], fileData.grandTotal)
      ),
    [acsatBuNpsTrendAnalysisData]
  );

  const npsMainTrendFileCount = showMainNpsTrendColumns ? mainNpsTrendAnalysisData.length : 0;

  const getNpsMainTrendRowForGroup = (group, fileData, fileIdx, useGrandTotalTrend = false) => {
    if (showBuMainNpsTrendColumns) {
      return findNpsBuMainTrendRow(group, fileData, npsBuMainTrendLookups[fileIdx] || {});
    }
    if (useGrandTotalTrend || group.isGrandTotal) return fileData.grandTotal;
    return findNpsMainTrendRow(group, fileData, npsMainTrendLookups[fileIdx] || {});
  };

  const getNpsMainTrendRowForExcel = (group, fileData, fileIdx, lookups, isBuTrend) => {
    if (isBuTrend) {
      return findNpsBuMainTrendRow(group, fileData, lookups[fileIdx] || {});
    }
    if (group.isGrandTotal) return fileData.grandTotal;
    return findNpsMainTrendRow(group, fileData, lookups[fileIdx] || {});
  };

  const renderMainNpsTrendComparisonCells = (group, options = {}) => {
    if (!showMainNpsTrendColumns) return null;
    const { bold = false, dashOnly = false, useGrandTotalTrend = false, cellBackground = '#f0fdf4' } = options;

    return mainNpsTrendAnalysisData.flatMap((fileData, fileIdx) => {
      const cellProps = { cellBackground, style: bold ? { fontWeight: 'bold' } : undefined };
      const suffixes = ['rr', 'promoters', 'passives', 'detractors', 'nps'];

      if (dashOnly) {
        return suffixes.map((suffix) => (
          <NpsTrendDiffCell key={`trend-comp-${fileIdx}-${suffix}`} {...cellProps}>
            -
          </NpsTrendDiffCell>
        ));
      }

      const trendRow = getNpsMainTrendRowForGroup(group, fileData, fileIdx, useGrandTotalTrend);
      const dashRate = group.sentCount === 0 ? 0 : roundNpsTrendRate(group.responseRate);
      const displays = [
        formatNpsResponseRateTrendDiffDisplay(computeNpsResponseRateTrendDiff(dashRate, trendRow)),
        (group.receivedCount || 0) === 0
          ? { diffText: '-', arrow: '', diffColor: '#6b7280', arrowColor: '#6b7280' }
          : formatNpsCountTrendDiffDisplay(computeNpsCountTrendDiff(group.promotersCount, trendRow, 'actualPromoters')),
        (group.receivedCount || 0) === 0
          ? { diffText: '-', arrow: '', diffColor: '#6b7280', arrowColor: '#6b7280' }
          : formatNpsCountTrendDiffDisplay(computeNpsCountTrendDiff(group.passivesCount, trendRow, 'actualPassives')),
        (group.receivedCount || 0) === 0
          ? { diffText: '-', arrow: '', diffColor: '#6b7280', arrowColor: '#6b7280' }
          : formatNpsCountTrendDiffDisplay(computeNpsCountTrendDiff(group.detractorsCount, trendRow, 'actualDetractors')),
        (group.receivedCount || 0) === 0
          ? { diffText: '-', arrow: '', diffColor: '#6b7280', arrowColor: '#6b7280' }
          : formatNpsActualNpsTrendDiffDisplay(computeNpsActualNpsTrendDiff(group.npsScore, trendRow)),
      ];

      return displays.map((display, diffIdx) => (
        <NpsTrendDiffCell key={`trend-comp-${fileIdx}-${suffixes[diffIdx]}`} {...cellProps}>
          {renderNpsTrendDiffContent(display)}
        </NpsTrendDiffCell>
      ));
    });
  };

  const downloadNpsTop10TrendExcel = async (singleFileData = null, singleFileIndex = 0) => {
    const trendFiles = singleFileData
      ? [singleFileData].filter((f) => f?.hasData && f.rows?.length)
      : acsatTop10NpsTrendAnalysisData.filter((f) => f.hasData && f.rows?.length);
    if (!trendFiles.length) {
      alert('No Top 10 account-wise NPS trend data available to download.');
      return;
    }
    try {
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      trendFiles.forEach((fileData, idx) =>
        addNpsTop10TrendSheetToWorkbook(workbook, fileData, singleFileData ? singleFileIndex : idx)
      );
      const todayStr = new Date().toISOString().split('T')[0];
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeFileName = singleFileData
        ? (singleFileData.saveName || `Top10_Trend_File_${singleFileIndex + 1}`).replace(/\.[^.]+$/, '')
        : 'ACSAT_NPS_Top10_Account_Wise_Trend_Analysis';
      link.download = `${safeFileName}_${todayStr}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Top 10 NPS trend Excel:', error);
      alert('Error downloading Excel file');
    }
  };

  const downloadNpsAccountWiseTrendExcel = async (singleFileData = null, singleFileIndex = 0) => {
    const trendFiles = singleFileData
      ? [singleFileData].filter((f) => f?.hasData && f.rows?.length)
      : acsatNpsTrendAnalysisData.filter((f) => f.hasData && f.rows?.length);
    if (!trendFiles.length) {
      alert('No account-wise NPS trend data available to download.');
      return;
    }
    try {
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      trendFiles.forEach((fileData, idx) =>
        addNpsAccountWiseTrendSheetToWorkbook(workbook, fileData, singleFileData ? singleFileIndex : idx)
      );
      const todayStr = new Date().toISOString().split('T')[0];
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeFileName = singleFileData
        ? (singleFileData.saveName || `Trend_File_${singleFileIndex + 1}`).replace(/\.[^.]+$/, '')
        : 'ACSAT_NPS_Account_Wise_Trend_Analysis';
      link.download = `${safeFileName}_${todayStr}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading NPS trend Excel:', error);
      alert('Error downloading Excel file');
    }
  };
  
  // Get ACSAT cycle from global context
  const { acsatCycle } = useCSATContext();

  // Load first sheet data (CSAT received Report) for NPS ratings
  useEffect(() => {
    if (!excelData) {
      npsWarn('excelData is missing or null — upload an ACSAT Excel file first');
      setFirstSheetData([]);
      setSheetLoadDebug(prev => ({
        ...prev,
        firstSheet: { status: 'error', reason: 'No Excel data uploaded', rowsBeforeFilter: 0, rowsAfterFilter: 0, sheetName: null },
      }));
      return;
    }

    npsLog('Loading first sheet (CSAT received Report)', {
      sheetNames: excelData.SheetNames,
      acsatCycle,
      acsatCycleStartDateFormatted,
    });

    try {
      const firstSheetName = excelData.SheetNames.find(name =>
        FIRST_SHEET_PATTERNS.some(p => name.toLowerCase().includes(p)) ||
        name.toLowerCase() === 'csat received report'
      );

      if (!firstSheetName) {
        const reason = `CSAT received Report sheet not found (expected name containing: ${FIRST_SHEET_PATTERNS.join(' or ')})`;
        npsWarn(reason, { availableSheets: excelData.SheetNames });
        setFirstSheetData([]);
        setSheetLoadDebug(prev => ({
          ...prev,
          firstSheet: { status: 'error', reason, rowsBeforeFilter: 0, rowsAfterFilter: 0, sheetName: null },
        }));
        return;
      }

      npsLog('Found first sheet:', firstSheetName);
      const worksheet = excelData.Sheets[firstSheetName];

      let headerRow = 1;
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      for (let row = 1; row <= range.e.r; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
        const cell = worksheet[cellAddress];
        if (cell && cell.v && typeof cell.v === 'string') {
          if (cell.v.toLowerCase().includes('customer') ||
              cell.v.toLowerCase().includes('cust_id') ||
              cell.v.toLowerCase().includes('rating') ||
              cell.v.toLowerCase().includes('perspective')) {
            headerRow = row;
            break;
          }
        }
      }

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: headerRow - 1 });

      if (jsonData.length === 0) {
        const reason = `CSAT received Report sheet "${firstSheetName}" has no rows`;
        npsWarn(reason);
        setFirstSheetData([]);
        setSheetLoadDebug(prev => ({
          ...prev,
          firstSheet: { status: 'empty', reason, rowsBeforeFilter: 0, rowsAfterFilter: 0, sheetName: firstSheetName },
        }));
        return;
      }

      const processedData = rowsFromSheetJson(jsonData);

      const yearQuarterValues = [...new Set(processedData.map((row) => getYearQuarterFromRow(row)).filter(Boolean))];
      npsLog('First sheet parsed', {
        sheetName: firstSheetName,
        rowsBeforeFilter: processedData.length,
        headers: Object.keys(processedData[0] || {}).slice(0, 10),
        yearQuarterValues,
        acsatCycle,
      });

      const filteredData = processedData.filter((row) => yearQuarterMatchesCycle(getYearQuarterFromRow(row), acsatCycle));

      const filteredOut = processedData.length - filteredData.length;
      npsLog('First sheet YEAR-QUARTER filter', {
        rowsBefore: processedData.length,
        rowsAfter: filteredData.length,
        filteredOut,
        acsatCycle: acsatCycle || '(none — all rows kept)',
      });

      setFirstSheetData(filteredData);

      if (filteredData.length === 0) {
        const reason = acsatCycle
          ? `No rows after YEAR-QUARTER filter on CSAT received Report (expected "${acsatCycle}", found: ${yearQuarterValues.join(', ') || 'none'})`
          : 'No rows in CSAT received Report after parsing';
        npsWarn(reason);
        setSheetLoadDebug(prev => ({
          ...prev,
          firstSheet: { status: 'empty', reason, rowsBeforeFilter: processedData.length, rowsAfterFilter: 0, sheetName: firstSheetName },
        }));
      } else {
        setSheetLoadDebug(prev => ({
          ...prev,
          firstSheet: { status: 'ok', reason: '', rowsBeforeFilter: processedData.length, rowsAfterFilter: filteredData.length, sheetName: firstSheetName },
        }));
      }
    } catch (error) {
      const reason = `Error loading CSAT received Report: ${error.message}`;
      npsError(reason, { stack: error.stack, acsatCycle });
      setFirstSheetData([]);
      setSheetLoadDebug(prev => ({
        ...prev,
        firstSheet: { status: 'error', reason, rowsBeforeFilter: 0, rowsAfterFilter: 0, sheetName: null },
      }));
    }
  }, [excelData, acsatCycle, acsatCycleStartDateFormatted]);

  // Load second sheet data
  useEffect(() => {
    if (!excelData) {
      npsWarn('excelData is missing or null for second sheet load');
      setSecondSheetData([]);
      setSheetLoadDebug(prev => ({
        ...prev,
        secondSheet: { status: 'error', reason: 'No Excel data uploaded', rowsBeforeFilter: 0, rowsAfterFilter: 0, sheetName: null },
      }));
      return;
    }

    npsLog('Loading second sheet (CSAT sent and received Report)', {
      sheetNames: excelData.SheetNames,
      acsatCycle,
    });

    try {
      const secondSheetName = excelData.SheetNames.find(name =>
        SECOND_SHEET_PATTERNS.some(p => name.toLowerCase().includes(p)) ||
        name.toLowerCase() === 'csat sent and received report'
      );

      if (!secondSheetName) {
        const reason = `CSAT sent and received Report sheet not found (expected name containing: ${SECOND_SHEET_PATTERNS.join(' or ')})`;
        npsWarn(reason, { availableSheets: excelData.SheetNames });
        setSecondSheetData([]);
        setSheetLoadDebug(prev => ({
          ...prev,
          secondSheet: { status: 'error', reason, rowsBeforeFilter: 0, rowsAfterFilter: 0, sheetName: null },
        }));
        return;
      }

      npsLog('Found second sheet:', secondSheetName);
      const worksheet = excelData.Sheets[secondSheetName];

      let headerRow = 1;
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      for (let row = 1; row <= range.e.r; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
        const cell = worksheet[cellAddress];
        if (cell && cell.v && typeof cell.v === 'string') {
          if (cell.v.toLowerCase().includes('customer') ||
              cell.v.toLowerCase().includes('cust_id') ||
              cell.v.toLowerCase().includes('css_sent') ||
              cell.v.toLowerCase().includes('css_received')) {
            headerRow = row;
            break;
          }
        }
      }

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: headerRow - 1 });

      if (jsonData.length === 0) {
        const reason = `CSAT sent and received Report sheet "${secondSheetName}" has no rows`;
        npsWarn(reason);
        setSecondSheetData([]);
        setSheetLoadDebug(prev => ({
          ...prev,
          secondSheet: { status: 'empty', reason, rowsBeforeFilter: 0, rowsAfterFilter: 0, sheetName: secondSheetName },
        }));
        return;
      }

      const processedData = rowsFromSheetJson(jsonData);

      const yearQuarterValues = [...new Set(processedData.map((row) => getYearQuarterFromRow(row)).filter(Boolean))];
      npsLog('Second sheet parsed', {
        sheetName: secondSheetName,
        rowsBeforeFilter: processedData.length,
        headers: Object.keys(processedData[0] || {}).slice(0, 10),
        yearQuarterValues,
        acsatCycle,
      });

      const filteredData = processedData.filter((row) => yearQuarterMatchesCycle(getYearQuarterFromRow(row), acsatCycle));

      const filteredOut = processedData.length - filteredData.length;
      npsLog('Second sheet YEAR-QUARTER filter', {
        rowsBefore: processedData.length,
        rowsAfter: filteredData.length,
        filteredOut,
        acsatCycle: acsatCycle || '(none — all rows kept)',
      });

      const normalizedSecond = filteredData.map(row => {
        if (!row) return row;
        if (row['PREDICTED SCORE'] === undefined && row['PREDICTED_SCORE'] !== undefined) {
          row['PREDICTED SCORE'] = row['PREDICTED_SCORE'];
        }
        const customerIdVal = getCustomerIdFromRow(row);
        if (customerIdVal) {
          row['CUSTOMER_ID'] = customerIdVal;
          row['CUST_ID'] = customerIdVal;
        }
        const customerNameVal = getCustomerNameFromRow(row, customerIdVal);
        if (customerNameVal) {
          row['CUSTOMER NAME'] = customerNameVal;
        }
        const received = getCsatReceivedDateFromRow(row);
        if (received !== undefined) row['CSAT RECEIVED DATE'] = received;
        const sent = getCsatSentDateFromRow(row);
        if (sent !== undefined) row['CSAT SENT DATE'] = sent;
        const yearQuarter = getYearQuarterFromRow(row);
        if (yearQuarter) row['YEAR - QUARTER'] = yearQuarter;
        return row;
      });

      setSecondSheetData(normalizedSecond);

      if (filteredData.length === 0) {
        const reason = acsatCycle
          ? `No rows after YEAR-QUARTER filter on CSAT sent and received Report (expected "${acsatCycle}", found: ${yearQuarterValues.join(', ') || 'none'})`
          : 'No rows in CSAT sent and received Report after parsing';
        npsWarn(reason);
        setSheetLoadDebug(prev => ({
          ...prev,
          secondSheet: { status: 'empty', reason, rowsBeforeFilter: processedData.length, rowsAfterFilter: 0, sheetName: secondSheetName },
        }));
      } else {
        setSheetLoadDebug(prev => ({
          ...prev,
          secondSheet: { status: 'ok', reason: '', rowsBeforeFilter: processedData.length, rowsAfterFilter: filteredData.length, sheetName: secondSheetName },
        }));
      }
    } catch (error) {
      const reason = `Error loading CSAT sent and received Report: ${error.message}`;
      npsError(reason, { stack: error.stack, acsatCycle });
      setSecondSheetData([]);
      setSheetLoadDebug(prev => ({
        ...prev,
        secondSheet: { status: 'error', reason, rowsBeforeFilter: 0, rowsAfterFilter: 0, sheetName: null },
      }));
    }
  }, [excelData, acsatCycle]);

  // Process data for display
  const processedData = useMemo(() => {
    const emptySummary = { top5Accounts: [], achievedNPSScore: 0, responseRate: 0, totalSent: 0, totalReceived: 0 };
    let emptyReason = '';

    npsLog('Processing data for display', {
      secondSheetRows: secondSheetData?.length || 0,
      firstSheetRows: firstSheetData?.length || 0,
      groupByBU,
      showTop10,
      searchTerm: searchTerm || '(none)',
      acsatCycleStartDateFormatted: acsatCycleStartDateFormatted || '(none)',
    });

    if (!secondSheetData || secondSheetData.length === 0) {
      emptyReason = sheetLoadDebug.secondSheet.reason
        || sheetLoadDebug.firstSheet.reason
        || 'Second sheet (CSAT sent and received Report) has no data — check sheet name and YEAR-QUARTER filter';
      npsWarn('No second sheet data for processing', { emptyReason, sheetLoadDebug });
      return { data: [], summary: emptySummary, emptyReason };
    }

    console.log('Processing NPS data...');
    console.log('Second sheet data length:', secondSheetData.length);
    console.log('First sheet data length:', firstSheetData.length);
    console.log('CSAT Cycle Start Date:', acsatCycleStartDateFormatted);
    
    if (acsatCycleStartDateFormatted) {
      console.log('📅 Date Filtering Configuration:');
      console.log('  - CSAT Cycle Start Date (MM-DD-YYYY):', acsatCycleStartDateFormatted);
      console.log('  - CSAT SENT DATE: Only dates >= cycle start date will be counted');
      console.log('  - CSAT RECEIVED DATE: Only dates >= cycle start date will be counted');
      console.log('  - NPS Ratings: Only from surveys sent >= cycle start date will be processed');
    } else {
      console.log('⚠️ No CSAT cycle start date provided - processing all data without date filtering');
    }

    try {
      // Group data by Business Unit or Customer
      const groupedData = {};
      
      // For Top 10 view aggregated rows: compute "NPS score" (avg NPS rating) using Sheet1,
      // segmented by Sheet2 TYPE OF ACCOUNT.
      // - Top 10 Accounts row: TYPE OF ACCOUNT = "Top 10"
      // - Other Accounts row: TYPE OF ACCOUNT is blank/empty (or N/A)
      // - Overall row: all NPS perspective ratings (no TYPE filter)
      let top10NpsScoreSum = 0;
      let top10NpsScoreCount = 0;
      let otherNpsScoreSum = 0;
      let otherNpsScoreCount = 0;
      let overallNpsScoreSum = 0;
      let overallNpsScoreCount = 0;
      const top10CustomerIds = new Set();
      const blankTypeCustomerIds = new Set();
      
      let rowsSkippedNoCustomerKey = 0;
      let rowsSkippedNoBusinessUnit = 0;
      let secondSheetPolledIncluded = 0;
      let secondSheetRespondedIncluded = 0;

      secondSheetData.forEach(row => {
        const businessUnit = getBusinessUnitFromRow(row);
        const customerId = getCustomerIdFromRow(row);
        const customerKey = getCustomerKeyFromRow(row);
        const customerName = groupByBU
          ? (getCustomerNameFromRow(row, customerId) || 'N/A')
          : getCustomerNameFromRow(row, customerId);

        if (groupByBU) {
          if (!businessUnit) {
            rowsSkippedNoBusinessUnit++;
            return;
          }
        } else if (!customerKey) {
          rowsSkippedNoCustomerKey++;
          return;
        }

        const key = groupByBU ? businessUnit : customerKey;
        
        if (!groupedData[key]) {
          groupedData[key] = {
            businessUnit: businessUnit,
            customerId: customerId || (groupByBU ? null : customerKey),
            customerName: groupByBU ? (customerName || 'N/A') : (customerName || 'Unknown'),
            sentCount: 0,
            receivedCount: 0,
            promotersCount: 0,
            passivesCount: 0,
            detractorsCount: 0,
            // NPS score (Avg rating for PERSPECTIVE="NPS") from "CSAT received Report"
            npsRatingSum: 0,
            npsRatingCount: 0,
            predictedPromotersCount: 0,
            predictedPassivesCount: 0,
            predictedDetractorsCount: 0,
            predictedNeutralCount: 0
          };
        }
        
        // Polled: CSAT SENT DATE must be present and >= cycle start (MM-DD-YYYY)
        const sentDate = getCsatSentDateFromRow(row);
        if (isDateOnOrAfterCsatStart(sentDate, acsatCycleStartDateFormatted)) {
          groupedData[key].sentCount++;
          secondSheetPolledIncluded++;
        }

        // Responded: CSAT RECEIVED DATE must be present and >= cycle start (MM-DD-YYYY)
        const receivedDate = getCsatReceivedDateFromRow(row);
        const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
        const isCompletedStatus = statusVal === 'completed';
        if (isCompletedStatus && isDateOnOrAfterCsatStart(receivedDate, acsatCycleStartDateFormatted)) {
          groupedData[key].receivedCount++;
          secondSheetRespondedIncluded++;
        }
      });

      if (acsatCycleStartDateFormatted) {
        console.log(`[NPS] Second sheet date filter (>= ${acsatCycleStartDateFormatted}): Polled=${secondSheetPolledIncluded}, Responded=${secondSheetRespondedIncluded} of ${secondSheetData.length} rows`);
      }

      if (!groupByBU && rowsSkippedNoCustomerKey > 0) {
        npsWarn(`Second sheet: skipped ${rowsSkippedNoCustomerKey} row(s) without CUSTOMER_ID/CUST_ID or customer name`, {
          sampleHeaders: Object.keys(secondSheetData[0] || {}).slice(0, 15),
        });
      }
      if (groupByBU && rowsSkippedNoBusinessUnit > 0) {
        npsWarn(`Second sheet: skipped ${rowsSkippedNoBusinessUnit} row(s) without BUSINESS UNIT`);
      }

      // Process NPS ratings from first sheet
      if (firstSheetData && firstSheetData.length > 0) {
        // Build sets from sheet2 TYPE OF ACCOUNT for Top10/Other segmentation
        if (showTop10 && Array.isArray(secondSheetData) && secondSheetData.length > 0) {
          secondSheetData.forEach((r) => {
            const typeRaw = getTypeOfAccountFromRow(r);
            const id = getCustomerIdFromRow(r);
            const idKey = id ? String(id).trim() : '';
            if (!idKey) return;
            if (isTop10TypeOfAccount(typeRaw)) {
              top10CustomerIds.add(idKey);
            } else if (isBlankOrEmptyTypeOfAccount(typeRaw)) {
              blankTypeCustomerIds.add(idKey);
            }
          });
        }

        console.log('Processing NPS ratings from first sheet...');
        console.log('First sheet sample data:', firstSheetData[0]);
        console.log('Available columns in first sheet:', Object.keys(firstSheetData[0] || {}));
        
        // First, let's find all customers with NPS data
        const customersWithNPSData = new Set();
        const npsRecordsByCustomer = {};
        
        firstSheetData.forEach((row) => {
          const customerId = getCustomerIdFromRow(row);
          const customerKey = getCustomerKeyFromRow(row);
          const customerName = getCustomerNameFromRow(row, customerId);
          const perspective = row['PERSPECTIVE'] || row['Perspective'] || '';
          const rating = row['RATING'] || row['Rating'];

          if (customerKey && perspective && rating !== undefined && rating !== null) {
            if (perspective.toString().toLowerCase().includes('nps')) {
              // NPS score averages: both CSAT SENT DATE and CSAT RECEIVED DATE >= cycle start (MM-DD-YYYY)
              if (!rowPassesBothCsatCycleDates(row, acsatCycleStartDateFormatted)) {
                return;
              }
              const ratingNumForAvg = parseFloat(rating);
              if (!isNaN(ratingNumForAvg)) {
                overallNpsScoreSum += ratingNumForAvg;
                overallNpsScoreCount += 1;
                if (showTop10) {
                  const idKey = String(customerId).trim();
                  const isBlankTypeById = blankTypeCustomerIds.size > 0 ? blankTypeCustomerIds.has(idKey) : false;
                  if (isTop10NpsAccount(customerName, customerId, top10AccountNames, top10CustomerIds)) {
                    top10NpsScoreSum += ratingNumForAvg;
                    top10NpsScoreCount += 1;
                  } else if (isBlankTypeById) {
                    otherNpsScoreSum += ratingNumForAvg;
                    otherNpsScoreCount += 1;
                  }
                }
              }

              // Top 10 view: individual rows should include only Top 10 accounts
              if (showTop10) {
                if (!isTop10NpsAccount(customerName, customerId, top10AccountNames, top10CustomerIds)) return;
              }
              customersWithNPSData.add(customerKey);
              if (!npsRecordsByCustomer[customerKey]) {
                npsRecordsByCustomer[customerKey] = [];
              }
              npsRecordsByCustomer[customerKey].push({
                customerName,
                perspective,
                rating,
                row
              });
            }
          }
        });
        
        console.log('Customers with NPS data:', Array.from(customersWithNPSData));
        console.log('Northern Trust NPS records:', npsRecordsByCustomer[Object.keys(npsRecordsByCustomer).find(key => 
          npsRecordsByCustomer[key].some(record => 
            record.customerName.toLowerCase().includes('northern trust')
          )
        )]);
        
        // Now process each customer with NPS data
        Object.keys(npsRecordsByCustomer).forEach(customerId => {
          const npsRecords = npsRecordsByCustomer[customerId];
          const firstRecord = npsRecords[0];
          const customerName = firstRecord.customerName;
          const businessUnit = getBusinessUnitFromRow(firstRecord.row);
          
          // Debug for Northern Trust Company
          if (customerName.toLowerCase().includes('northern trust')) {
            console.log('🔍 Processing Northern Trust Company NPS Records:');
            console.log('  Customer ID:', customerId);
            console.log('  Customer Name:', customerName);
            console.log('  Business Unit:', businessUnit);
            console.log('  NPS Records Count:', npsRecords.length);
            console.log('  Sample NPS Record:', firstRecord);
          }
          
          // Try to find existing group by customer name if ID doesn't match
          let key = groupByBU ? businessUnit : customerId;
          let existingGroup = groupedData[key];
          
          // If no group found by ID, try to find by customer name
          if (!existingGroup && !groupByBU) {
            const matchingKey = Object.keys(groupedData).find(k => {
              const group = groupedData[k];
              return group.customerName && group.customerName.toLowerCase() === customerName.toLowerCase();
            });
            
            if (matchingKey) {
              key = matchingKey;
              existingGroup = groupedData[key];
              console.log('Found existing group by name for:', customerName, 'using key:', key);
            }
          }
          
          // Create group if it doesn't exist
          if (!existingGroup) {
            console.log('Creating new group for customer:', customerName, 'with key:', key);
            groupedData[key] = {
              businessUnit: businessUnit,
              customerId: customerId,
              customerName: customerName,
              sentCount: 0,
              receivedCount: 0,
              promotersCount: 0,
              passivesCount: 0,
              detractorsCount: 0,
              // NPS score (Avg rating for PERSPECTIVE="NPS") from "CSAT received Report"
              npsRatingSum: 0,
              npsRatingCount: 0
            };
          } else {
            // Update customer name from first sheet data if it's currently 'Unknown' or empty
            if (existingGroup.customerName === 'Unknown' || !existingGroup.customerName || existingGroup.customerName === '') {
              existingGroup.customerName = customerName;
              console.log('Updated customer name from first sheet:', customerName, 'for key:', key, 'customerId:', customerId);
            }
            
            // Debug for group updates
            console.log('Group update:', {
              'key': key,
              'customerId': customerId,
              'customerName': customerName,
              'existingGroupCustomerName': existingGroup.customerName,
              'wasUpdated': existingGroup.customerName === 'Unknown' || !existingGroup.customerName
            });
          }
          
          // Debug: Log the first few customer names being stored
          if (Object.keys(groupedData).length <= 3) {
            console.log('Stored customer name:', customerName, 'for key:', key);
          }
          
          // Process each NPS record for this customer
          npsRecords.forEach(record => {
            const rating = record.rating;

            if (!rowPassesBothCsatCycleDates(record.row, acsatCycleStartDateFormatted)) {
              if (customerName.toLowerCase().includes('northern trust')) {
                console.log('  ⏰ Skipping record due to date filter');
              }
              return;
            }
            
            const ratingValue = parseFloat(rating);
            
            if (!isNaN(ratingValue)) {
              // Track average rating for PERSPECTIVE="NPS" (NPS score column request)
              groupedData[key].npsRatingSum += ratingValue;
              groupedData[key].npsRatingCount += 1;

              if (customerName.toLowerCase().includes('northern trust')) {
                console.log('  Processing rating:', ratingValue, 'for Northern Trust');
              }
              
              // Count promoters (rating exactly 9 or 10)
              if (ratingValue === 9 || ratingValue === 10) {
                groupedData[key].promotersCount++;
                if (customerName.toLowerCase().includes('northern trust')) {
                  console.log('  ✅ Added promoter! New count:', groupedData[key].promotersCount);
                }
              }
              // Count passives (rating exactly 7 or 8)
              else if (ratingValue === 7 || ratingValue === 8) {
                groupedData[key].passivesCount++;
                if (customerName.toLowerCase().includes('northern trust')) {
                  console.log('  ✅ Added passive! New count:', groupedData[key].passivesCount);
                }
              }
              // Count detractors (rating less than 7)
              else if (ratingValue < 7) {
                groupedData[key].detractorsCount++;
                if (customerName.toLowerCase().includes('northern trust')) {
                  console.log('  ✅ Added detractor! New count:', groupedData[key].detractorsCount);
                }
              }
            } else {
              if (customerName.toLowerCase().includes('northern trust')) {
                console.log('  ❌ Invalid rating value:', rating);
              }
            }
          });
          
          if (customerName.toLowerCase().includes('northern trust')) {
            console.log('  Final counts for Northern Trust:');
            console.log('    Promoters:', groupedData[key].promotersCount);
            console.log('    Passives:', groupedData[key].passivesCount);
            console.log('    Detractors:', groupedData[key].detractorsCount);
          }
        });
        
        console.log('NPS ratings processed with date filtering. Sample data:', Object.values(groupedData)[0]);
        
        // Debug: Show all NPS records for Northern Trust Company
        const northernTrustNPSRecords = firstSheetData.filter(row => {
          const customerName = getCustomerNameFromRow(row);
          const customerId = getCustomerIdFromRow(row);
          const perspective = row['PERSPECTIVE'] || row['Perspective'] || '';
          return (customerName.toLowerCase().includes('northern trust') ||
                  String(customerId).toLowerCase().includes('northern')) &&
                 perspective.toString().toLowerCase().includes('nps');
        });
        
        console.log('🔍 Northern Trust Company NPS Records in first sheet:', northernTrustNPSRecords.length);
        if (northernTrustNPSRecords.length > 0) {
          console.log('Sample Northern Trust NPS record:', northernTrustNPSRecords[0]);
        }
        
        // Log filtering summary
        const totalNPSRecords = firstSheetData.filter(row => {
          const perspective = row['PERSPECTIVE'] || row['Perspective'] || '';
          return perspective.toString().toLowerCase().includes('nps');
        }).length;
        
        const filteredNPSRecords = firstSheetData.filter(row => {
          const perspective = row['PERSPECTIVE'] || row['Perspective'] || '';
          return perspective.toString().toLowerCase().includes('nps') &&
                 rowPassesBothCsatCycleDates(row, acsatCycleStartDateFormatted);
        }).length;
        
        console.log(`NPS records: ${filteredNPSRecords} of ${totalNPSRecords} passed date filter`);
      }
      
      // Summary of date filtering results
      console.log('📊 Date Filtering Summary:');
      console.log('CSAT Cycle Start Date:', acsatCycleStartDateFormatted);
      console.log('Total groups processed:', Object.keys(groupedData).length);
      
      // Show sample of processed data
      const sampleGroups = Object.values(groupedData).slice(0, 3);
      sampleGroups.forEach((group, index) => {
        console.log(`Group ${index + 1}:`, {
          customerName: group.customerName,
          sentCount: group.sentCount,
          receivedCount: group.receivedCount,
          promotersCount: group.promotersCount,
          passivesCount: group.passivesCount,
          detractorsCount: group.detractorsCount
        });
      });

      // Process predicted NPS from second sheet (CSAT sent and received Report)
      console.log('Processing predicted NPS from second sheet...');
      console.log(`Grouped data keys: ${Object.keys(groupedData)}`);
      console.log(`GroupByBU: ${groupByBU}`);
      
      secondSheetData.forEach((row, index) => {
        const customerId = getCustomerIdFromRow(row);
        const customerKey = getCustomerKeyFromRow(row);
        const predictedScore = row['PREDICTED SCORE'] || row['PREDICTED_SCORE'];
        const businessUnit = getBusinessUnitFromRow(row);
        const csatReceivedDate = getCsatReceivedDateFromRow(row);
        const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
        const isCompletedStatus = statusVal === 'completed';
        const receivedDateValid = isCompletedStatus && isDateOnOrAfterCsatStart(csatReceivedDate, acsatCycleStartDateFormatted);

        // Targeted debug for customer id 212100001
        if ((customerId || '').toString().trim() === '212100001' || (customerId || '').toString().trim() === '202100007') {
          console.log('🔎 [Predicted NPS Debug] Row for 212100001:', {
            rowIndex: index + 1,
            customerId,
            businessUnit,
            predictedScore,
            csatReceivedDate,
            receivedDateValid
          });
          if (!receivedDateValid) {
            console.log('🧭 [Predicted NPS Debug] 212100001 available keys:', Object.keys(row));
          }
        }
        
        const rowHasKey = groupByBU ? !!businessUnit : !!customerKey;
        if (rowHasKey && predictedScore !== undefined && predictedScore !== null && receivedDateValid) {
          const key = groupByBU ? (businessUnit || 'Unknown') : customerKey;
          const group = groupedData[key];
          
          if (index < 3) {
            console.log(`Row ${index + 1}: CustomerId=${customerId}, BusinessUnit=${businessUnit}, PredictedScore=${predictedScore}, CsatReceivedDate=${csatReceivedDate}, ReceivedDateValid=${receivedDateValid}, Key=${key}, GroupExists=${!!group}`);
          }
          
          if (group) {
            const predictedScoreValue = parseFloat(predictedScore);
            
            if (!isNaN(predictedScoreValue)) {
              // Count predicted promoters (score exactly 9 or 10)
              if (predictedScoreValue === 9 || predictedScoreValue === 10) {
                group.predictedPromotersCount++;
                if (index < 3) console.log(`  -> Added predicted promoter for ${key}`);
                if ((customerId || '').toString().trim() === '212100001' || (customerId || '').toString().trim() === '202100007') {
                  console.log('✅ [Predicted NPS Debug] Predicted Promoter counted', {
                    predictedScoreValue,
                    currentPredictedPromotersCount: group.predictedPromotersCount
                  });
                }
              }
              // Count predicted detractors (score less than 7)
              else if (predictedScoreValue < 7) {
                group.predictedDetractorsCount++;
                if (index < 3) console.log(`  -> Added predicted detractor for ${key}`);
                if ((customerId || '').toString().trim() === '212100001' || (customerId || '').toString().trim() === '202100007') {
                  console.log('⚠️ [Predicted NPS Debug] Predicted Detractor counted', {
                    predictedScoreValue,
                    currentPredictedDetractorsCount: group.predictedDetractorsCount
                  });
                }
              }
              // Count passives records (score 7-8) for total count
              else if (predictedScoreValue === 7 || predictedScoreValue === 8) {
                group.predictedPassivesCount = (group.predictedPassivesCount || 0) + 1;
                group.predictedNeutralCount = (group.predictedNeutralCount || 0) + 1;
                if (index < 3) console.log(`  -> Added predicted neutral for ${key}`);
                if ((customerId || '').toString().trim() === '212100001' || (customerId || '').toString().trim() === '202100007') {
                  console.log('ℹ️ [Predicted NPS Debug] Predicted Neutral counted', {
                    predictedScoreValue,
                    currentPredictedNeutralCount: group.predictedNeutralCount
                  });
                }
              }
            }
          }
        }
      });

      // Final validation: ensure account-wise rows have a display name; BU-wise may use N/A
      Object.values(groupedData).forEach(group => {
        if (groupByBU) {
          if (!group.customerName) group.customerName = 'N/A';
          return;
        }
        if (!group.customerName || group.customerName === 'Unknown' || group.customerName === '') {
          group.customerName = group.customerId ? String(group.customerId) : 'Unknown';
        }
      });

      // Convert to array and calculate response rate and NPS score
      let result = Object.values(groupedData).map(group => {
        const responseRate = group.sentCount > 0 ? (group.receivedCount / group.sentCount) * 100 : 0;
        const npsScore = group.receivedCount > 0 ? ((group.promotersCount - group.detractorsCount) / group.receivedCount) * 100 : 0;
        const npsAvgRating = (group.npsRatingCount && Number(group.npsRatingCount) > 0)
          ? (Number(group.npsRatingSum || 0) / Number(group.npsRatingCount))
          : null;
        // Calculate predicted NPS as (% Promoters - % Detractors)
        const totalPredictedRecords = group.predictedPromotersCount + group.predictedDetractorsCount + (group.predictedNeutralCount || 0);
        const predictedPromotersPercent = totalPredictedRecords > 0 ? (group.predictedPromotersCount / totalPredictedRecords) * 100 : 0;
        const predictedDetractorsPercent = totalPredictedRecords > 0 ? (group.predictedDetractorsCount / totalPredictedRecords) * 100 : 0;
        const predictedNpsScore = predictedPromotersPercent - predictedDetractorsPercent;
        
        return {
          ...group,
          responseRate: responseRate,
          npsScore: npsScore,
          predictedNpsScore: predictedNpsScore,
          npsAvgRating
        };
      });
      
      // Debug: Log all business units found
      console.log('🔍 NPS Dashboard Business Units Found:');
      const uniqueBusinessUnits = [...new Set(result.map(item => item.businessUnit))];
      console.log('  Unique Business Units:', uniqueBusinessUnits);
      console.log('  Total records:', result.length);
      console.log('  Sample records:', result.slice(0, 3));

      // Filter out rows where Polled = 0
      const beforeSentFilter = result.length;
      result = result.filter(group => group.sentCount > 0);
      if (result.length === 0 && beforeSentFilter > 0) {
        emptyReason = `No rows after Polled>0 filter (${beforeSentFilter} groups had sentCount=0 — CSAT SENT DATE may be before cycle start ${acsatCycleStartDateFormatted || 'N/A'})`;
        npsWarn(emptyReason, { beforeSentFilter, acsatCycleStartDateFormatted });
      }

      // Apply search filter for customer name (only when not grouping by BU)
      if (!groupByBU && searchTerm.trim()) {
        const beforeSearch = result.length;
        result = result.filter(group => {
          const customerName = (group.customerName || '').toLowerCase();
          const customerId = (group.customerId || '').toLowerCase();
          const searchLower = searchTerm.toLowerCase();
          return customerName.includes(searchLower) || customerId.includes(searchLower);
        });
        if (result.length === 0 && beforeSearch > 0) {
          emptyReason = `No accounts match search filter "${searchTerm}" (${beforeSearch} rows before filter)`;
          npsWarn(emptyReason);
        }
      }

      // Sort by account order for account-wise data (when not Top 10 and no manual sorting)
      // Otherwise sort by response rate (descending)
      if (!groupByBU && !showTop10 && !sortConfig.key) {
        // Account-wise (not Top 10) and no manual sorting: sort by accountOrder
        result.sort((a, b) => {
          const aCustomerName = (a.customerName || '').toString().trim();
          const bCustomerName = (b.customerName || '').toString().trim();
          
          const aIndex = accountOrder.findIndex(name => 
            aCustomerName.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(aCustomerName.toLowerCase())
          );
          const bIndex = accountOrder.findIndex(name => 
            bCustomerName.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(bCustomerName.toLowerCase())
          );
          
          // If not found in predefined list, put at the end
          const aPos = aIndex === -1 ? 999 : aIndex;
          const bPos = bIndex === -1 ? 999 : bIndex;
          return aPos - bPos;
        });
      } else {
        // Sort by response rate (descending) for BU-wise or when manual sorting is active
      result.sort((a, b) => b.responseRate - a.responseRate);
      }

      // Calculate grand total
      let grandTotal = null;
      if (result.length > 0) {
        // Debug: Log result array for BU-wise view
        if (groupByBU) {
          console.log('🔍 BU-wise Grand Total Calculation - Result Array:', {
            resultLength: result.length,
            resultItems: result.map(r => ({
              businessUnit: r.businessUnit,
              sentCount: r.sentCount,
              receivedCount: r.receivedCount,
              promotersCount: r.promotersCount,
              passivesCount: r.passivesCount,
              detractorsCount: r.detractorsCount,
              predictedPromotersCount: r.predictedPromotersCount,
              predictedPassivesCount: r.predictedPassivesCount,
              predictedDetractorsCount: r.predictedDetractorsCount
            }))
          });
        }
        
        grandTotal = {
          businessUnit: groupByBU ? 'Org Level' : (showTop10 ? 'Top 10 Accounts' : ''),
          customerId: '',
          customerName: groupByBU ? '' : (showTop10 ? '' : 'GRAND TOTAL'),
          sentCount: result.reduce((sum, group) => sum + (Number(group.sentCount) || 0), 0),
          receivedCount: result.reduce((sum, group) => sum + (Number(group.receivedCount) || 0), 0),
          promotersCount: result.reduce((sum, group) => sum + (Number(group.promotersCount) || 0), 0),
          passivesCount: result.reduce((sum, group) => sum + (Number(group.passivesCount) || 0), 0),
          detractorsCount: result.reduce((sum, group) => sum + (Number(group.detractorsCount) || 0), 0),
          npsRatingSum: result.reduce((sum, group) => sum + (Number(group.npsRatingSum) || 0), 0),
          npsRatingCount: result.reduce((sum, group) => sum + (Number(group.npsRatingCount) || 0), 0),
          predictedPromotersCount: result.reduce((sum, group) => sum + (Number(group.predictedPromotersCount) || 0), 0),
          predictedPassivesCount: result.reduce((sum, group) => sum + (Number(group.predictedPassivesCount) || 0), 0),
          predictedDetractorsCount: result.reduce((sum, group) => sum + (Number(group.predictedDetractorsCount) || 0), 0),
          predictedNeutralCount: result.reduce((sum, group) => sum + (Number(group.predictedNeutralCount) || 0), 0),
          responseRate: 0, // Will be calculated below
          npsScore: 0, // Will be calculated below
          predictedNpsScore: 0, // Will be calculated below
          isGrandTotal: true
        };

        grandTotal.npsAvgRating = (grandTotal.npsRatingCount && Number(grandTotal.npsRatingCount) > 0)
          ? (Number(grandTotal.npsRatingSum || 0) / Number(grandTotal.npsRatingCount))
          : null;
        
        // Debug: Log calculated grand total for BU-wise view
        if (groupByBU) {
          console.log('✅ BU-wise Grand Total Calculated:', grandTotal);
        }

        // Calculate grand total response rate
        if (grandTotal.sentCount > 0) {
          grandTotal.responseRate = (grandTotal.receivedCount / grandTotal.sentCount) * 100;
        }

        // Calculate grand total NPS score
        if (grandTotal.receivedCount > 0) {
          const totalPromoters = grandTotal.promotersCount;
          const totalDetractors = grandTotal.detractorsCount;
          grandTotal.npsScore = ((totalPromoters - totalDetractors) / grandTotal.receivedCount) * 100;
        }

        // Calculate grand total predicted NPS score using percentage formula
        const totalPredictedRecords = grandTotal.predictedPromotersCount + grandTotal.predictedPassivesCount + grandTotal.predictedDetractorsCount;
        if (totalPredictedRecords > 0) {
          const predictedPromotersPercent = (grandTotal.predictedPromotersCount / totalPredictedRecords) * 100;
          const predictedDetractorsPercent = (grandTotal.predictedDetractorsCount / totalPredictedRecords) * 100;
          grandTotal.predictedNpsScore = predictedPromotersPercent - predictedDetractorsPercent;
        }

        // Add grand total to result
        result.push(grandTotal);
        
        // Add percentage calculation row for Org Level (only for BU-wise dashboard)
        // Use data from CSAT received Report sheet, grouped by BUSINESS UNIT
        if (groupByBU && grandTotal.receivedCount > 0) {
          // Calculate counts from firstSheetData (CSAT received Report) grouped by BUSINESS UNIT
          let orgLevelPromotersCount = 0;
          let orgLevelPassivesCount = 0;
          let orgLevelDetractorsCount = 0;
          let orgLevelReceivedCount = 0;
          
          if (firstSheetData && firstSheetData.length > 0) {
            firstSheetData.forEach(row => {
              const perspective = row['PERSPECTIVE'] || row['Perspective'] || '';
              const rating = row['RATING'] || row['Rating'];

              // Only process NPS perspective records
              if (!perspective.toString().toLowerCase().includes('nps')) {
                return;
              }

              if (!rowPassesBothCsatCycleDates(row, acsatCycleStartDateFormatted)) {
                return;
              }
              
              const ratingValue = parseFloat(rating);
              
              if (!isNaN(ratingValue)) {
                orgLevelReceivedCount++;
                
                // Count promoters (rating equal to 9 or 10)
                if (ratingValue === 9 || ratingValue === 10) {
                  orgLevelPromotersCount++;
                }
                // Count passives (rating equal to 7 or 8)
                else if (ratingValue === 7 || ratingValue === 8) {
                  orgLevelPassivesCount++;
                }
                // Count detractors (rating less than 7)
                else if (ratingValue < 7) {
                  orgLevelDetractorsCount++;
                }
              }
            });
          }
          
          // Use calculated counts from CSAT received Report, or fallback to grandTotal if firstSheetData is not available
          // Always prefer counts from CSAT received Report if available, even if they are 0
          const receivedCount = orgLevelReceivedCount > 0 || (firstSheetData && firstSheetData.length > 0) ? orgLevelReceivedCount : (Number(grandTotal.receivedCount) || 0);
          const sentCount = Number(grandTotal.sentCount) || 0;
          const promotersCount = (orgLevelReceivedCount > 0 || (firstSheetData && firstSheetData.length > 0)) ? orgLevelPromotersCount : (Number(grandTotal.promotersCount) || 0);
          const passivesCount = (orgLevelReceivedCount > 0 || (firstSheetData && firstSheetData.length > 0)) ? orgLevelPassivesCount : (Number(grandTotal.passivesCount) || 0);
          const detractorsCount = (orgLevelReceivedCount > 0 || (firstSheetData && firstSheetData.length > 0)) ? orgLevelDetractorsCount : (Number(grandTotal.detractorsCount) || 0);
          const predictedPromotersCount = Number(grandTotal.predictedPromotersCount) || 0;
          const predictedPassivesCount = Number(grandTotal.predictedPassivesCount) || 0;
          const predictedDetractorsCount = Number(grandTotal.predictedDetractorsCount) || 0;
          
          // Debug log to help diagnose issues
          console.log('🔍 Org Level Percentage Row Calculation (from CSAT received Report):', {
            receivedCount,
            sentCount,
            promotersCount,
            passivesCount,
            detractorsCount,
            predictedPromotersCount,
            predictedPassivesCount,
            predictedDetractorsCount,
            orgLevelPromotersCount,
            orgLevelPassivesCount,
            orgLevelDetractorsCount,
            orgLevelReceivedCount
          });
          
          const orgLevelPercentageRow = {
            businessUnit: 'Org Level %',
            customerId: '',
            customerName: '',
            sentCount: '-', // Don't display Polled for percentage row
            receivedCount: '-', // Don't display Responded for percentage row
            responseRate: sentCount > 0 ? ((receivedCount / sentCount) * 100).toFixed(1) + '%' : '-', // % of grand total: Responded/Polled*100
            // Predicted NPS section: % = value / Responded * 100
            predictedPromotersCount: receivedCount > 0 ? ((predictedPromotersCount / receivedCount) * 100).toFixed(1) + '%' : '0.0%',
            predictedPassivesCount: receivedCount > 0 ? ((predictedPassivesCount / receivedCount) * 100).toFixed(1) + '%' : '0.0%',
            predictedDetractorsCount: receivedCount > 0 ? ((predictedDetractorsCount / receivedCount) * 100).toFixed(1) + '%' : '0.0%',
            predictedNpsScore: receivedCount > 0 ? (((predictedPromotersCount - predictedDetractorsCount) / receivedCount) * 100).toFixed(2) : '0.00',
            // Actual NPS section: % = value / Responded * 100
            // Grand total Promoters % = #Promoters/Responded*100
            promotersCount: receivedCount > 0 ? ((promotersCount / receivedCount) * 100).toFixed(1) + '%' : '0.0%',
            // Grand total Passives % = #Passives/Responded*100
            passivesCount: receivedCount > 0 ? ((passivesCount / receivedCount) * 100).toFixed(1) + '%' : '0.0%',
            // Grand total Detractors % = #Detractors/Responded*100
            detractorsCount: receivedCount > 0 ? ((detractorsCount / receivedCount) * 100).toFixed(1) + '%' : '0.0%',
            // Grand total NPS = Grand total Promoters % - Grand total Detractors %
            npsScore: receivedCount > 0 ? (((promotersCount / receivedCount) * 100) - ((detractorsCount / receivedCount) * 100)).toFixed(2) : '0.00',
            isOrgLevelPercentageRow: true
          };
          
          console.log('✅ Org Level Percentage Row Result:', orgLevelPercentageRow);
          result.push(orgLevelPercentageRow);
        }
        
        // Add percentage calculation row for GRAND TOTAL (only for account-wise dashboard, not Top 10)
        if (!groupByBU && !showTop10 && grandTotal.receivedCount > 0) {
          const grandTotalPercentageRow = {
            businessUnit: '',
            customerId: '',
            customerName: 'GRAND TOTAL %',
            sentCount: '-', // Don't display Polled for percentage row
            receivedCount: '-', // Don't display Responded for percentage row
            responseRate: grandTotal.sentCount > 0 ? ((grandTotal.receivedCount / grandTotal.sentCount) * 100).toFixed(1) + '%' : '-', // % of grand total: Responded/Polled*100
            // Predicted NPS section: % = value / Responded * 100
            predictedPromotersCount: ((grandTotal.predictedPromotersCount / grandTotal.receivedCount) * 100).toFixed(1) + '%',
            predictedPassivesCount: ((grandTotal.predictedPassivesCount / grandTotal.receivedCount) * 100).toFixed(1) + '%',
            predictedDetractorsCount: ((grandTotal.predictedDetractorsCount / grandTotal.receivedCount) * 100).toFixed(1) + '%',
            predictedNpsScore: (((grandTotal.predictedPromotersCount - grandTotal.predictedDetractorsCount) / grandTotal.receivedCount) * 100).toFixed(2),
            // Actual NPS section: % = value / Responded * 100
            promotersCount: ((grandTotal.promotersCount / grandTotal.receivedCount) * 100).toFixed(1) + '%',
            passivesCount: ((grandTotal.passivesCount / grandTotal.receivedCount) * 100).toFixed(1) + '%',
            detractorsCount: ((grandTotal.detractorsCount / grandTotal.receivedCount) * 100).toFixed(1) + '%',
            npsScore: (((grandTotal.promotersCount - grandTotal.detractorsCount) / grandTotal.receivedCount) * 100).toFixed(2),
            isGrandTotalPercentageRow: true
          };
          result.push(grandTotalPercentageRow);
        }
      }

      // Calculate summary data
      const summaryData = {
        top5Accounts: [],
        achievedNPSScore: 0,
        responseRate: 0,
        totalSent: 0,
        totalReceived: 0
      };

      // Get top 5 accounts with highest NPS scores (only for account-wise data)
      if (!groupByBU && result.length > 0) {
        const nonGrandTotalData = result.filter(group => !group.isGrandTotal);
        const sortedByNPS = [...nonGrandTotalData].sort((a, b) => b.npsScore - a.npsScore);
        summaryData.top5Accounts = sortedByNPS.slice(0, 5).map((group, index) => ({
          rank: index + 1,
          customerName: group.customerName || group.customerId || 'Unknown',
          npsScore: Math.round(group.npsScore * 100) / 100
        }));
      }

      // Get achieved NPS score and response rate from grand total
      if (grandTotal) {
        summaryData.achievedNPSScore = Math.round(grandTotal.npsScore * 100) / 100; // Keep as number for calculations, will format in display
        summaryData.responseRate = grandTotal.responseRate;
        summaryData.totalSent = grandTotal.sentCount;
        summaryData.totalReceived = grandTotal.receivedCount;
      }

      console.log('Processed NPS data:', result.length, 'groups');
      console.log('Sample processed data:', result[0]);
      console.log('Grand total:', grandTotal);
      console.log('Summary data:', summaryData);

      // Filter for Top 10 accounts if showTop10 is true
      let finalResult = result;
      if (showTop10) {
        console.log('Filtering for Top 10 accounts:', top10AccountNames);
        
        // Separate grand total row from regular data
        const grandTotalRow = result.find(row => row.isGrandTotal);
        const regularData = result.filter(row => !row.isGrandTotal);
        
        // Filter regular data by predefined list + TYPE OF ACCOUNT = Top 10 from upload
        const filteredRegularData = regularData.filter((row) =>
          isTop10NpsAccount(row.customerName, row.customerId, top10AccountNames, top10CustomerIds)
        );

        filteredRegularData.sort((a, b) => {
          const aIndex = getTop10AccountSortIndex(a.customerName, top10AccountNames);
          const bIndex = getTop10AccountSortIndex(b.customerName, top10AccountNames);
          if (aIndex !== bIndex) return aIndex - bIndex;
          return (a.customerName || '').localeCompare(b.customerName || '');
        });
        
        // Recalculate grand total for Top 10 data
        let top10GrandTotal = null;
        if (filteredRegularData.length > 0) {
          top10GrandTotal = {
            businessUnit: '', // Empty Business Unit for Top 10 dashboard
            customerName: showTop10 ? 'Top 10 Accounts' : 'TOTAL',
            sentCount: filteredRegularData.reduce((sum, row) => sum + (row.sentCount || 0), 0),
            receivedCount: filteredRegularData.reduce((sum, row) => sum + (row.receivedCount || 0), 0),
            promotersCount: filteredRegularData.reduce((sum, row) => sum + (row.promotersCount || 0), 0),
            passivesCount: filteredRegularData.reduce((sum, row) => sum + (row.passivesCount || 0), 0),
            detractorsCount: filteredRegularData.reduce((sum, row) => sum + (row.detractorsCount || 0), 0),
            predictedPromotersCount: filteredRegularData.reduce((sum, row) => sum + (row.predictedPromotersCount || 0), 0),
            predictedPassivesCount: filteredRegularData.reduce((sum, row) => sum + (row.predictedPassivesCount || 0), 0),
            predictedDetractorsCount: filteredRegularData.reduce((sum, row) => sum + (row.predictedDetractorsCount || 0), 0),
            predictedNeutralCount: filteredRegularData.reduce((sum, row) => sum + (row.predictedNeutralCount || 0), 0),
            isGrandTotal: true
          };
          
          // Calculate response rate
          if (top10GrandTotal.sentCount > 0) {
            top10GrandTotal.responseRate = (top10GrandTotal.receivedCount / top10GrandTotal.sentCount) * 100;
          }
          
          // Calculate NPS score
          if (top10GrandTotal.receivedCount > 0) {
            const totalPromoters = top10GrandTotal.promotersCount;
            const totalDetractors = top10GrandTotal.detractorsCount;
            top10GrandTotal.npsScore = ((totalPromoters - totalDetractors) / top10GrandTotal.receivedCount) * 100;
          }
          
          // Calculate predicted NPS score
          const totalPredictedRecords = top10GrandTotal.predictedPromotersCount + top10GrandTotal.predictedPassivesCount + top10GrandTotal.predictedDetractorsCount;
          if (totalPredictedRecords > 0) {
            const predictedPromotersPercent = (top10GrandTotal.predictedPromotersCount / totalPredictedRecords) * 100;
            const predictedDetractorsPercent = (top10GrandTotal.predictedDetractorsCount / totalPredictedRecords) * 100;
            top10GrandTotal.predictedNpsScore = predictedPromotersPercent - predictedDetractorsPercent;
          }

          // NPS score (avg NPS rating) for Top 10 Accounts row: from CSAT received Report where TYPE OF ACCOUNT = Top 10
          top10GrandTotal.npsAvgRating = top10NpsScoreCount > 0 ? (top10NpsScoreSum / top10NpsScoreCount) : null;
        }
        
        // Calculate Other Account totals: TYPE OF ACCOUNT is blank, empty, or N/A (from raw sheets)
        const otherTotals = computeOtherAccountTotalsFromSheets(
          secondSheetData,
          firstSheetData,
          acsatCycleStartDateFormatted,
          blankTypeCustomerIds,
          otherNpsScoreSum,
          otherNpsScoreCount
        );

        // Calculate percentage row for Top10 (relative to Top10 + Other Account totals)
        let top10PercentageRow = null;
        let otherAccountPercentageRow = null;
        if (top10GrandTotal && otherTotals) {
          const combinedTotal = {
            sentCount: top10GrandTotal.sentCount + otherTotals.sentCount,
            receivedCount: top10GrandTotal.receivedCount + otherTotals.receivedCount,
            predictedPromotersCount: top10GrandTotal.predictedPromotersCount + otherTotals.predictedPromotersCount,
            predictedPassivesCount: top10GrandTotal.predictedPassivesCount + otherTotals.predictedPassivesCount,
            predictedDetractorsCount: top10GrandTotal.predictedDetractorsCount + otherTotals.predictedDetractorsCount,
            promotersCount: top10GrandTotal.promotersCount + otherTotals.promotersCount,
            passivesCount: top10GrandTotal.passivesCount + otherTotals.passivesCount,
            detractorsCount: top10GrandTotal.detractorsCount + otherTotals.detractorsCount
          };
          
          top10PercentageRow = {
            businessUnit: '',
            customerName: '%',
            sentCount: '-', // Don't display Polled for percentage row
            receivedCount: '-', // Don't display Responded for percentage row
            responseRate: '-', // Don't display Response % for percentage row
            // Predicted NPS section: % = value / Responded * 100
            predictedPromotersCount: top10GrandTotal.receivedCount > 0 ? ((top10GrandTotal.predictedPromotersCount / top10GrandTotal.receivedCount) * 100).toFixed(1) + '%' : '-',
            predictedPassivesCount: top10GrandTotal.receivedCount > 0 ? ((top10GrandTotal.predictedPassivesCount / top10GrandTotal.receivedCount) * 100).toFixed(1) + '%' : '-',
            predictedDetractorsCount: top10GrandTotal.receivedCount > 0 ? ((top10GrandTotal.predictedDetractorsCount / top10GrandTotal.receivedCount) * 100).toFixed(1) + '%' : '-',
            predictedNpsScore: '-', // Don't display NPS for percentage row
            // Actual NPS section: % = value / Responded * 100
            promotersCount: top10GrandTotal.receivedCount > 0 ? ((top10GrandTotal.promotersCount / top10GrandTotal.receivedCount) * 100).toFixed(1) + '%' : '-',
            passivesCount: top10GrandTotal.receivedCount > 0 ? ((top10GrandTotal.passivesCount / top10GrandTotal.receivedCount) * 100).toFixed(1) + '%' : '-',
            detractorsCount: top10GrandTotal.receivedCount > 0 ? ((top10GrandTotal.detractorsCount / top10GrandTotal.receivedCount) * 100).toFixed(1) + '%' : '-',
            npsScore: '-', // Don't display NPS for percentage row
            isPercentageRow: true
          };
          
          // Calculate percentage row for Other Account (relative to Other Account totals)
          otherAccountPercentageRow = {
            businessUnit: '',
            customerName: '%',
            sentCount: '-', // Don't display Polled for percentage row
            receivedCount: '-', // Don't display Responded for percentage row
            responseRate: '-', // Don't display Response % for percentage row
            // Predicted NPS section: % = value / Responded * 100
            predictedPromotersCount: otherTotals.receivedCount > 0 ? ((otherTotals.predictedPromotersCount / otherTotals.receivedCount) * 100).toFixed(1) + '%' : '-',
            predictedPassivesCount: otherTotals.receivedCount > 0 ? ((otherTotals.predictedPassivesCount / otherTotals.receivedCount) * 100).toFixed(1) + '%' : '-',
            predictedDetractorsCount: otherTotals.receivedCount > 0 ? ((otherTotals.predictedDetractorsCount / otherTotals.receivedCount) * 100).toFixed(1) + '%' : '-',
            predictedNpsScore: '-', // Don't display NPS for percentage row
            // Actual NPS section: % = value / Responded * 100
            promotersCount: otherTotals.receivedCount > 0 ? ((otherTotals.promotersCount / otherTotals.receivedCount) * 100).toFixed(1) + '%' : '-',
            passivesCount: otherTotals.receivedCount > 0 ? ((otherTotals.passivesCount / otherTotals.receivedCount) * 100).toFixed(1) + '%' : '-',
            detractorsCount: otherTotals.receivedCount > 0 ? ((otherTotals.detractorsCount / otherTotals.receivedCount) * 100).toFixed(1) + '%' : '-',
            npsScore: '-', // Don't display NPS for percentage row
            isOtherAccountPercentageRow: true
          };
        }
        
        // Calculate Overall row
        // Polled, Responded, and Predicted NPS from 2nd sheet "CSAT sent and received Report"
        // Actual NPS from 1st sheet "CSAT received Report"
        let overallRow = null;
        let overallPercentageRow = null;
        
        if (showTop10 && secondSheetData && secondSheetData.length > 0 && firstSheetData && firstSheetData.length > 0) {
          let polled = 0;
          let responded = 0;
          let predictedPromoters = 0;
          let predictedDetractors = 0;
          let predictedPassives = 0;
          let secondSheetRespondedCount = 0; // count(CSAT RECEIVED DATE) from 2nd sheet for Predicted NPS denominator
          let actualPromoters = 0;
          let actualDetractors = 0;
          let actualPassives = 0;
          let firstSheetRespondedCount = 0; // count(CSAT RECEIVED DATE) from 1st sheet for Actual NPS denominator
          
          // Calculate Polled, Responded, and Predicted NPS from 2nd sheet "CSAT sent and received Report"
          secondSheetData.forEach(row => {
            // Get date columns - use CSAT SENT DATE and CSAT RECEIVED DATE (with CSS fallbacks for backward compatibility)
            // Date format should be MM-DD-YYYY for CSAT SENT DATE and CSAT RECEIVED DATE
            const sentDate = getCsatSentDateFromRow(row);
            const receivedDate = getCsatReceivedDateFromRow(row);
            const predictedScore = row['PREDICTED SCORE'] || row['PREDICTED_SCORE'];
            
            // Check if both CSAT SENT DATE and CSAT RECEIVED DATE are >= cycle start date (MM-DD-YYYY format)
            const sentDateValid = isDateOnOrAfterCsatStart(sentDate, acsatCycleStartDateFormatted);
            const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
            const isCompletedStatus = statusVal === 'completed';
            const receivedDateValid = isCompletedStatus && isDateOnOrAfterCsatStart(receivedDate, acsatCycleStartDateFormatted);

            if (sentDateValid) {
              polled++;
            }

            if (receivedDateValid) {
              responded++;
              secondSheetRespondedCount++; // Count for Predicted NPS denominator
              
              // Count Predicted NPS categories for "Predicted NPS for the surveys responses received" section
              // Only count for rows where CSAT RECEIVED DATE >= cycle start date
              const predictedScoreNum = parseFloat(predictedScore);
              if (!isNaN(predictedScoreNum)) {
                if (predictedScoreNum >= 9 && predictedScoreNum <= 10) {
                  predictedPromoters++; // Count PREDICTED SCORE equal to 9 or 10
                } else if (predictedScoreNum < 7) {
                  predictedDetractors++; // Count PREDICTED SCORE equal to less than 7
                } else if (predictedScoreNum >= 7 && predictedScoreNum <= 8) {
                  predictedPassives++; // Count PREDICTED SCORE equal to 7 or 8
                }
              }
            }
          });
          
          // Calculate Actual NPS from 1st sheet "CSAT received Report"
          const allDetractors = []; // Track all detractors for debugging
          
          // Log first row to see available columns (for debugging)
          if (firstSheetData.length > 0) {
            console.log('Overall Row - First sheet sample row:', {
              rowKeys: Object.keys(firstSheetData[0]),
              PERSPECTIVE: firstSheetData[0]['PERSPECTIVE'],
              RATING: firstSheetData[0]['RATING'],
              'CSAT SENT DATE': firstSheetData[0]['CSAT SENT DATE'],
              'CSAT RECEIVED DATE': firstSheetData[0]['CSAT RECEIVED DATE'],
              cycleStartDate: acsatCycleStartDateFormatted
            });
          }
          
          firstSheetData.forEach((row, index) => {
            // Get PERSPECTIVE column - filter by PERSPECTIVE=NPS for Actual NPS section
            const perspective = row['PERSPECTIVE'] || row['Perspective'] || '';
            const isNpsPerspective = perspective && perspective.toString().toLowerCase().trim() === 'nps';
            
            // Skip rows that don't have PERSPECTIVE=NPS
            if (!isNpsPerspective) {
              return; // Skip this row
            }
            
            // Get date columns - use both CSAT SENT DATE and CSAT RECEIVED DATE (for Actual NPS calculations)
            // Date format should be MM-DD-YYYY for CSAT SENT DATE and CSAT RECEIVED DATE
            const sentDate = getCsatSentDateFromRow(row);
            const receivedDate = getCsatReceivedDateFromRow(row);
            
            // Get RATING column - prioritize exact "RATING" match first (as specified by user)
            // Then try other variations
            let rating = null;
            const rowKeys = Object.keys(row);
            
            // Priority 1: Try exact "RATING" match first (all caps, as user specified)
            if (row['RATING'] !== undefined && row['RATING'] !== null && row['RATING'] !== '') {
              rating = row['RATING'];
            }
            // Priority 2: Try other common variations
            else {
              // Try case-insensitive exact matches
              for (const key of rowKeys) {
                const keyLower = key ? key.toString().toLowerCase().trim() : '';
                if (keyLower === 'rating' && !keyLower.includes('predicted')) {
                  rating = row[key];
                  break;
                }
              }
              
              // Priority 3: Try other variations if still not found
              if (rating === null || rating === undefined || rating === '') {
                for (const key of rowKeys) {
                  const keyLower = key ? key.toString().toLowerCase().trim() : '';
                  if (keyLower === 'rating_score' || 
                      keyLower === 'rating score' ||
                      keyLower === 'nps rating' ||
                      keyLower === 'nps_rating' ||
                      (keyLower.includes('rating') && !keyLower.includes('predicted'))) {
                    rating = row[key];
                    break;
                  }
                }
              }
              
              // Priority 4: Fallback to direct property access
              if (rating === null || rating === undefined || rating === '') {
                rating = row['Rating'] || row['RATING_SCORE'] || row['Rating Score'] || 
                         row['NPS RATING'] || row['NPS Rating'] || row['NPS_RATING'] || row['Nps Rating'];
              }
            }
            
            // Check if both CSAT SENT DATE and CSAT RECEIVED DATE are >= cycle start date (MM-DD-YYYY format)
            const sentDateValid = isDateOnOrAfterCsatStart(sentDate, acsatCycleStartDateFormatted);
            const receivedDateValid = isDateOnOrAfterCsatStart(receivedDate, acsatCycleStartDateFormatted);

            if (sentDateValid && receivedDateValid) {
              firstSheetRespondedCount++;
              
              // Count Actual NPS categories for "Actual NPS" section
              // Only count for rows where both CSAT SENT DATE and CSAT RECEIVED DATE >= cycle start date
              
              // Parse rating - handle various formats (number, string, etc.)
              let ratingNum = NaN;
              if (rating !== null && rating !== undefined && rating !== '') {
                // Try direct parse first
                ratingNum = parseFloat(rating);
                
                // If parseFloat fails, try converting to string and removing non-numeric characters (except decimal point and minus)
                if (isNaN(ratingNum)) {
                  const ratingStr = rating.toString().trim();
                  // Remove any non-numeric characters except decimal point and minus sign
                  const cleanedRating = ratingStr.replace(/[^\d.-]/g, '');
                  if (cleanedRating) {
                    ratingNum = parseFloat(cleanedRating);
                  }
                }
                
                // If still NaN, try parseInt as fallback
                if (isNaN(ratingNum)) {
                  const ratingStr = rating.toString().trim();
                  const cleanedRating = ratingStr.replace(/[^\d-]/g, '');
                  if (cleanedRating) {
                    ratingNum = parseInt(cleanedRating, 10);
                  }
                }
              }
              
              // Track all potential detractors for debugging
              if (!isNaN(ratingNum) && ratingNum < 7) {
                allDetractors.push({
                  rowIndex: index + 1,
                  perspective: perspective,
                  rating: rating,
                  ratingNum: ratingNum,
                  sentDate: sentDate,
                  receivedDate: receivedDate,
                  rowKeys: rowKeys.slice(0, 15)
                });
              }
              
              if (!isNaN(ratingNum) && isFinite(ratingNum)) {
                if (ratingNum >= 9 && ratingNum <= 10) {
                  actualPromoters++; // Count Rating equal to 9 or 10
                } else if (ratingNum < 7) {
                  actualDetractors++; // Count Rating equal to less than 7
                } else if (ratingNum >= 7 && ratingNum <= 8) {
                  actualPassives++; // Count Rating equal to 7 or 8
                }
              } else if (rating !== null && rating !== undefined && rating !== '') {
                // Log rows where rating exists but couldn't be parsed
                console.log(`Overall Row - Rating parse failed (row ${index + 1}):`, {
                  rating: rating,
                  ratingType: typeof rating,
                  sentDate: sentDate,
                  receivedDate: receivedDate,
                  rowKeys: rowKeys.slice(0, 10)
                });
              }
            } else {
              // Log rows that were filtered out due to date validation
              const ratingNum = parseFloat(rating);
              if (!isNaN(ratingNum) && ratingNum < 7) {
                console.log(`Overall Row - Detractor filtered out by date (row ${index + 1}):`, {
                  rating: rating,
                  ratingNum: ratingNum,
                  sentDate: sentDate,
                  receivedDate: receivedDate,
                  sentDateValid: sentDateValid,
                  receivedDateValid: receivedDateValid,
                  cycleStartDate: acsatCycleStartDateFormatted
                });
              }
            }
          });
          
          // Debug: Log all detractors found and final counts
          console.log('Overall Row - All Detractors Found (PERSPECTIVE=NPS, should be 3):', allDetractors);
          console.log('Overall Row - Detractors Summary:', {
            totalDetractorsCounted: actualDetractors,
            totalDetractorsFound: allDetractors.length,
            expectedCount: 3,
            matches: actualDetractors === 3 ? '✅ CORRECT' : '❌ INCORRECT',
            filterApplied: 'PERSPECTIVE=NPS'
          });
          console.log('Overall Row - Actual NPS counts (PERSPECTIVE=NPS only):', {
            actualPromoters,
            actualPassives,
            actualDetractors,
            firstSheetRespondedCount,
            totalRowsProcessed: firstSheetData.length
          });
          
          // Log each detractor with full details
          if (allDetractors.length > 0) {
            console.log('Overall Row - Detailed Detractor List (PERSPECTIVE=NPS):');
            allDetractors.forEach((detractor, idx) => {
              console.log(`  Detractor ${idx + 1}:`, {
                rowIndex: detractor.rowIndex,
                perspective: detractor.perspective,
                rating: detractor.rating,
                ratingNum: detractor.ratingNum,
                sentDate: detractor.sentDate,
                receivedDate: detractor.receivedDate
              });
            });
          }
          
          // Calculate Response % = Responded/Polled*100 (from 2nd sheet)
          const responseRate = polled > 0 ? (responded / polled) * 100 : 0;
          
          // Calculate Predicted NPS = (#Promoters - #Detractors) / count(CSAT RECEIVED DATE from 2nd sheet) * 100
          const predictedNps = secondSheetRespondedCount > 0 ? ((predictedPromoters - predictedDetractors) / secondSheetRespondedCount) * 100 : 0;
          
          // Calculate Actual NPS = (#Promoters - #Detractors) / count(CSAT RECEIVED DATE from 1st sheet) * 100
          const actualNps = firstSheetRespondedCount > 0 ? ((actualPromoters - actualDetractors) / firstSheetRespondedCount) * 100 : 0;
          
          overallRow = {
            businessUnit: '',
            customerName: 'Overall',
            sentCount: polled,
            receivedCount: responded,
            responseRate: responseRate,
            predictedPromotersCount: predictedPromoters,
            predictedPassivesCount: predictedPassives,
            predictedDetractorsCount: predictedDetractors,
            predictedNpsScore: predictedNps,
            promotersCount: actualPromoters,
            passivesCount: actualPassives,
            detractorsCount: actualDetractors,
            npsScore: actualNps,
            isOverallRow: true
          };

          // NPS score (avg NPS rating) for Overall row: from CSAT received Report (no TYPE filter)
          overallRow.npsAvgRating = overallNpsScoreCount > 0 ? (overallNpsScoreSum / overallNpsScoreCount) : null;
          
          // Calculate Overall percentage row
          // Predicted NPS percentages from 2nd sheet
          const predictedPromotersPercent = secondSheetRespondedCount > 0 ? ((predictedPromoters / secondSheetRespondedCount) * 100).toFixed(1) + '%' : '-';
          const predictedPassivesPercent = secondSheetRespondedCount > 0 ? ((predictedPassives / secondSheetRespondedCount) * 100).toFixed(1) + '%' : '-';
          const predictedDetractorsPercent = secondSheetRespondedCount > 0 ? ((predictedDetractors / secondSheetRespondedCount) * 100).toFixed(1) + '%' : '-';
          
          // Actual NPS percentages from 1st sheet (PERSPECTIVE=NPS)
          const actualPromotersPercent = firstSheetRespondedCount > 0 ? ((actualPromoters / firstSheetRespondedCount) * 100).toFixed(1) + '%' : '-';
          const actualPassivesPercent = firstSheetRespondedCount > 0 ? ((actualPassives / firstSheetRespondedCount) * 100).toFixed(1) + '%' : '-';
          const actualDetractorsPercent = firstSheetRespondedCount > 0 ? ((actualDetractors / firstSheetRespondedCount) * 100).toFixed(1) + '%' : '-';
          
          overallPercentageRow = {
            businessUnit: '',
            customerName: '%',
            sentCount: '-', // Don't display Polled for percentage row
            receivedCount: '-', // Don't display Responded for percentage row
            responseRate: '-', // Don't display Response % for percentage row
            predictedPromotersCount: predictedPromotersPercent,
            predictedPassivesCount: predictedPassivesPercent,
            predictedDetractorsCount: predictedDetractorsPercent,
            predictedNpsScore: '-', // Don't display NPS for percentage row
            promotersCount: actualPromotersPercent,
            passivesCount: actualPassivesPercent,
            detractorsCount: actualDetractorsPercent,
            npsScore: '-', // Don't display NPS for percentage row
            isOverallPercentageRow: true
          };
        }
        
        // Combine filtered data with grand total, Other Account, percentage rows, Overall row, and Overall percentage row
        finalResult = [...filteredRegularData];
        if (top10GrandTotal) finalResult.push(top10GrandTotal);
        finalResult.push(otherTotals);
        if (top10PercentageRow) finalResult.push(top10PercentageRow);
        if (otherAccountPercentageRow) finalResult.push(otherAccountPercentageRow);
        if (overallRow) finalResult.push(overallRow);
        if (overallPercentageRow) finalResult.push(overallPercentageRow);

        if (filteredRegularData.length === 0) {
          emptyReason = `No Top 10 accounts matched in data (checked ${regularData.length} accounts against predefined Top 10 list)`;
          npsWarn(emptyReason, { regularDataCount: regularData.length });
        }

        npsLog('Top 10 filter complete', { resultRows: finalResult.length });
      }

      if (!emptyReason && finalResult.length === 0) {
        emptyReason = 'Processing completed but produced zero display rows';
        npsWarn(emptyReason, { groupCount: Object.keys(groupedData).length });
      }

      npsLog('Processing complete', { displayRows: finalResult.length, emptyReason: emptyReason || '(none)' });
      return { data: finalResult, summary: summaryData, emptyReason };
    } catch (error) {
      const reason = `Error processing NPS data: ${error.message}`;
      npsError(reason, {
        stack: error.stack,
        secondSheetDataLength: secondSheetData?.length,
        firstSheetDataLength: firstSheetData?.length,
        groupByBU,
        acsatCycleStartDateFormatted,
      });
      return { data: [], summary: emptySummary, emptyReason: reason };
    }
  }, [secondSheetData, firstSheetData, groupByBU, acsatCycleStartDateFormatted, searchTerm, showTop10, sortConfig, accountOrder, sheetLoadDebug]);

  const emptyDisplayMessage = useMemo(() => {
    if (!excelData) {
      return 'No Excel file data — upload an ACSAT Excel file first.';
    }
    if (sheetLoadDebug.secondSheet.status === 'pending' && sheetLoadDebug.firstSheet.status === 'pending') {
      return 'Loading data...';
    }
    if (sheetLoadDebug.secondSheet.reason) {
      return sheetLoadDebug.secondSheet.reason;
    }
    if (sheetLoadDebug.firstSheet.reason && secondSheetData.length === 0) {
      return sheetLoadDebug.firstSheet.reason;
    }
    if (secondSheetData.length === 0) {
      return 'Loading data...';
    }
    if (processedData.emptyReason) {
      return processedData.emptyReason;
    }
    return 'No data available after processing';
  }, [excelData, sheetLoadDebug, secondSheetData.length, processedData.emptyReason]);

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Sort data based on sort configuration
  const sortedData = useMemo(() => {
    if (!processedData?.data) return [];
    if (!sortConfig.key) {
      // Default ordering: if BU view, enforce BU order
      if (groupByBU) {
        const BU_ORDER = ['Healthcare', 'CIT', 'Tech', 'India & UK'];
        return [...processedData.data].sort((a, b) => {
          const aBU = (a.businessUnit || '').toString().trim();
          const bBU = (b.businessUnit || '').toString().trim();
          const aIndex = BU_ORDER.findIndex(bu => bu.toLowerCase() === aBU.toLowerCase());
          const bIndex = BU_ORDER.findIndex(bu => bu.toLowerCase() === bBU.toLowerCase());
          // If both found, sort by order; if only one found, prioritize it; if neither found, maintain original order
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return 0;
        });
      } else if (!showTop10) {
        // Account-wise (not Top 10): sort by accountOrder (already applied in processedData, but ensure it's maintained)
        return [...processedData.data].sort((a, b) => {
          const aCustomerName = (a.customerName || '').toString().trim();
          const bCustomerName = (b.customerName || '').toString().trim();
          
          const aIndex = accountOrder.findIndex(name => 
            aCustomerName.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(aCustomerName.toLowerCase())
          );
          const bIndex = accountOrder.findIndex(name => 
            bCustomerName.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(bCustomerName.toLowerCase())
          );
          
          // If not found in predefined list, put at the end
          const aPos = aIndex === -1 ? 999 : aIndex;
          const bPos = bIndex === -1 ? 999 : bIndex;
          return aPos - bPos;
        });
      }
      return processedData.data;
    }
    
    const sorted = [...processedData.data].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Handle different data types for sorting
      if (sortConfig.key === 'businessUnit' || sortConfig.key === 'customerName') {
        // String sorting (case-insensitive)
        aValue = aValue?.toLowerCase() || '';
        bValue = bValue?.toLowerCase() || '';
      } else if (sortConfig.key === 'sentCount' || sortConfig.key === 'receivedCount' || 
                 sortConfig.key === 'predictedPromotersCount' || sortConfig.key === 'predictedDetractorsCount' ||
                 sortConfig.key === 'predictedNPSScore' || sortConfig.key === 'promotersCount' || 
                 sortConfig.key === 'detractorsCount' || sortConfig.key === 'npsScore') {
        // Numeric sorting
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else {
        // Default string sorting
        aValue = aValue?.toString().toLowerCase() || '';
        bValue = bValue?.toString().toLowerCase() || '';
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    // If BU view and sorting not on businessUnit explicitly, apply BU order after sort for tie-breaker
    if (groupByBU && sortConfig.key !== 'businessUnit') {
      const BU_ORDER = ['Healthcare', 'CIT', 'Tech', 'India & UK'];
      sorted.sort((a, b) => {
        const aBU = (a.businessUnit || '').toString().trim();
        const bBU = (b.businessUnit || '').toString().trim();
        const aIndex = BU_ORDER.findIndex(bu => bu.toLowerCase() === aBU.toLowerCase());
        const bIndex = BU_ORDER.findIndex(bu => bu.toLowerCase() === bBU.toLowerCase());
        // If both found, sort by order; if only one found, prioritize it; if neither found, maintain original order
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return 0;
      });
    }
    
    // Re-number the SNO after sorting (but preserve grand total, org level percentage row, and grand total percentage row at the end)
    const grandTotalIndex = sorted.findIndex(item => item.isGrandTotal);
    const orgLevelPercentageRowIndex = sorted.findIndex(item => item.isOrgLevelPercentageRow);
    const grandTotalPercentageRowIndex = sorted.findIndex(item => item.isGrandTotalPercentageRow);
    
    if (grandTotalIndex !== -1 || orgLevelPercentageRowIndex !== -1 || grandTotalPercentageRowIndex !== -1) {
      const grandTotal = grandTotalIndex !== -1 ? sorted.splice(grandTotalIndex, 1)[0] : null;
      let orgLevelPercentageRow = null;
      let grandTotalPercentageRow = null;
      
      // Handle org level percentage row
      if (orgLevelPercentageRowIndex !== -1) {
        const adjustedIndex = orgLevelPercentageRowIndex > grandTotalIndex ? orgLevelPercentageRowIndex - 1 : orgLevelPercentageRowIndex;
        orgLevelPercentageRow = sorted.splice(adjustedIndex, 1)[0];
      }
      
      // Handle grand total percentage row
      if (grandTotalPercentageRowIndex !== -1) {
        let adjustedIndex = grandTotalPercentageRowIndex;
        if (grandTotalIndex !== -1 && grandTotalPercentageRowIndex > grandTotalIndex) adjustedIndex--;
        if (orgLevelPercentageRowIndex !== -1 && grandTotalPercentageRowIndex > orgLevelPercentageRowIndex) adjustedIndex--;
        grandTotalPercentageRow = sorted.splice(adjustedIndex, 1)[0];
      }
      
      const regularData = sorted.map((item, index) => ({
        ...item,
        displayIndex: index + 1
      }));
      // Assign proper Sr. No. to grand total (should be after all regular rows)
      if (grandTotal) {
      grandTotal.displayIndex = regularData.length + 1;
      }
      const result = [...regularData];
      if (grandTotal) result.push(grandTotal);
      if (orgLevelPercentageRow) result.push(orgLevelPercentageRow);
      if (grandTotalPercentageRow) result.push(grandTotalPercentageRow);
      return result;
    }
    
    return sorted.map((item, index) => ({
      ...item,
      displayIndex: index + 1
    }));
  }, [processedData?.data, sortConfig, groupByBU, showTop10, accountOrder]);

  // Calculate grand totals for BU-wise NPS Summary
  // Use data directly from "CSAT received Report" sheet, grouped by BUSINESS UNIT
  const buWiseGrandTotals = useMemo(() => {
    if (!firstSheetData || firstSheetData.length === 0 || !groupByBU) {
      return {
        totalPromoters: 0,
        totalPassives: 0,
        totalDetractors: 0,
        totalReceivedCount: 0,
        overallPromotersPercent: 0,
        overallPassivesPercent: 0,
        overallDetractorsPercent: 0,
        overallNPS: 0
      };
    }

    // Group data by BUSINESS UNIT and count ratings from CSAT received Report
    const buGroupedData = {};
    
    firstSheetData.forEach(row => {
      const perspective = row['PERSPECTIVE'] || row['Perspective'] || '';
      const rating = row['RATING'] || row['Rating'];
      const businessUnit = getBusinessUnitFromRow(row);

      // Only process NPS perspective records
      if (!perspective.toString().toLowerCase().includes('nps')) {
        return;
      }

      if (!rowPassesBothCsatCycleDates(row, acsatCycleStartDateFormatted)) {
        return;
      }
      
      // Initialize BU group if not exists
      if (!buGroupedData[businessUnit]) {
        buGroupedData[businessUnit] = {
          promotersCount: 0,
          passivesCount: 0,
          detractorsCount: 0,
          receivedCount: 0
        };
      }
      
      const ratingValue = parseFloat(rating);
      
      if (!isNaN(ratingValue)) {
        buGroupedData[businessUnit].receivedCount++;
        
        // Count promoters (rating equal to 9 or 10)
        if (ratingValue === 9 || ratingValue === 10) {
          buGroupedData[businessUnit].promotersCount++;
        }
        // Count passives (rating equal to 7 or 8)
        else if (ratingValue === 7 || ratingValue === 8) {
          buGroupedData[businessUnit].passivesCount++;
        }
        // Count detractors (rating less than 7)
        else if (ratingValue < 7) {
          buGroupedData[businessUnit].detractorsCount++;
        }
      }
    });
    
    // Calculate grand totals across all BUs
    const totals = Object.values(buGroupedData).reduce((acc, buData) => {
      acc.totalPromoters += buData.promotersCount || 0;
      acc.totalPassives += buData.passivesCount || 0;
      acc.totalDetractors += buData.detractorsCount || 0;
      acc.totalReceivedCount += buData.receivedCount || 0;
      return acc;
    }, {
      totalPromoters: 0,
      totalPassives: 0,
      totalDetractors: 0,
      totalReceivedCount: 0
    });
    
    // Calculate percentages: % = value / Responded * 100
    const overallPromotersPercent = totals.totalReceivedCount > 0 
      ? (totals.totalPromoters / totals.totalReceivedCount) * 100 
      : 0;
    const overallPassivesPercent = totals.totalReceivedCount > 0 
      ? (totals.totalPassives / totals.totalReceivedCount) * 100 
      : 0;
    const overallDetractorsPercent = totals.totalReceivedCount > 0 
      ? (totals.totalDetractors / totals.totalReceivedCount) * 100 
      : 0;
    
    // Calculate NPS: Grand total Promoters % - Grand total Detractors %
    const overallNPS = overallPromotersPercent - overallDetractorsPercent;
    
    console.log('🔍 BU-wise Grand Totals from CSAT received Report:', {
      totals,
      overallPromotersPercent,
      overallPassivesPercent,
      overallDetractorsPercent,
      overallNPS,
      buGroupedData
    });

    return {
      ...totals,
      overallPromotersPercent,
      overallPassivesPercent,
      overallDetractorsPercent,
      overallNPS
    };
  }, [firstSheetData, groupByBU, acsatCycleStartDateFormatted]);

  // Process chart data for BU-wise vertical graph
  // NOTE: Percentages are calculated ONLY for the chart view and do NOT affect the main dashboard data
  const chartData = useMemo(() => {
    if (!processedData?.data || !groupByBU || !showVerticalGraph) return [];
    
    const chartDataResult = processedData.data
      .filter(item => !item.isGrandTotal && !item.isOrgLevelPercentageRow)
      .map(item => {
        const receivedCount = item.receivedCount || 0;
        
        // Calculate percentages ONLY for chart display (main dashboard data remains unchanged)
        const promotersPercent = receivedCount > 0 ? ((item.promotersCount || 0) / receivedCount) * 100 : 0;
        const passivesPercent = receivedCount > 0 ? ((item.passivesCount || 0) / receivedCount) * 100 : 0;
        const detractorsPercent = receivedCount > 0 ? ((item.detractorsCount || 0) / receivedCount) * 100 : 0;
        
        // Debug logging for all business units
        console.log(`Chart data for ${item.businessUnit}:`, {
          receivedCount,
          passivesCount: item.passivesCount,
          passivesPercent: passivesPercent.toFixed(2),
          promotersCount: item.promotersCount,
          detractorsCount: item.detractorsCount,
          promotersPercent: promotersPercent.toFixed(2),
          detractorsPercent: detractorsPercent.toFixed(2),
          totalPercent: (promotersPercent + passivesPercent + detractorsPercent).toFixed(2)
        });
        
        return {
          name: item.businessUnit || 'Unknown',
          promoters: item.promotersCount || 0,
          passives: item.passivesCount || 0,
          detractors: item.detractorsCount || 0,
          promotersPercent,
          passivesPercent,
          detractorsPercent,
          nps: item.npsScore || 0,
          receivedCount
        };
      });
    
    // Add Org Level % bar from BU-wise NPS Summary
    if (buWiseGrandTotals && buWiseGrandTotals.totalReceivedCount > 0) {
      chartDataResult.push({
        name: 'Org Level',
        promoters: buWiseGrandTotals.totalPromoters || 0,
        passives: buWiseGrandTotals.totalPassives || 0,
        detractors: buWiseGrandTotals.totalDetractors || 0,
        promotersPercent: buWiseGrandTotals.overallPromotersPercent || 0,
        passivesPercent: buWiseGrandTotals.overallPassivesPercent || 0,
        detractorsPercent: buWiseGrandTotals.overallDetractorsPercent || 0,
        nps: buWiseGrandTotals.overallNPS || 0,
        receivedCount: buWiseGrandTotals.totalReceivedCount || 0
      });
    }
    
    // Log all chart data to debug the 100% issue
    console.log('📊 Final chart data (including Org Level):', chartDataResult.map(item => ({
      name: item.name,
      promotersPercent: item.promotersPercent.toFixed(1),
      passivesPercent: item.passivesPercent.toFixed(1),
      detractorsPercent: item.detractorsPercent.toFixed(1),
      total: (item.promotersPercent + item.passivesPercent + item.detractorsPercent).toFixed(1)
    })));
    
    // Check for duplicate business units
    const businessUnits = chartDataResult.map(item => item.name);
    const uniqueBusinessUnits = [...new Set(businessUnits)];
    if (businessUnits.length !== uniqueBusinessUnits.length) {
      console.warn('🚨 Duplicate business units found in chart data:', {
        total: businessUnits.length,
        unique: uniqueBusinessUnits.length,
        duplicates: businessUnits.filter((item, index) => businessUnits.indexOf(item) !== index)
      });
    }
    
    const BU_ORDER = ['Org Level', 'Healthcare', 'CIT', 'Tech', 'India & UK'];
    return chartDataResult.sort((a, b) => {
      const aName = (a.name || '').toString().trim();
      const bName = (b.name || '').toString().trim();
      const aIndex = BU_ORDER.findIndex(bu => bu.toLowerCase() === aName.toLowerCase());
      const bIndex = BU_ORDER.findIndex(bu => bu.toLowerCase() === bName.toLowerCase());
      // If not found in order, put at the end
      const aPos = aIndex === -1 ? 999 : aIndex;
      const bPos = bIndex === -1 ? 999 : bIndex;
      return aPos - bPos;
    });
  }, [processedData?.data, groupByBU, showVerticalGraph, buWiseGrandTotals]);

  // Create chart data for Org Level - NPS Distribution
  const orgLevelChartData = useMemo(() => {
    if (!buWiseGrandTotals || buWiseGrandTotals.totalReceivedCount === 0) {
      return [];
    }

    return [{
      name: 'Org Level',
      promoters: buWiseGrandTotals.totalPromoters || 0,
      passives: buWiseGrandTotals.totalPassives || 0,
      detractors: buWiseGrandTotals.totalDetractors || 0,
      promotersPercent: buWiseGrandTotals.overallPromotersPercent || 0,
      passivesPercent: buWiseGrandTotals.overallPassivesPercent || 0,
      detractorsPercent: buWiseGrandTotals.overallDetractorsPercent || 0,
      nps: buWiseGrandTotals.overallNPS || 0,
      receivedCount: buWiseGrandTotals.totalReceivedCount || 0
    }];
  }, [buWiseGrandTotals]);

  // Create chart data for Top 10 - NPS Distribution
  const top10ChartData = useMemo(() => {
    if (!processedData?.data || !showTop10) return [];
    
    // Find the Top10 Grand Total row
    const top10GrandTotal = processedData.data.find(item => item.isGrandTotal && showTop10);
    
    if (!top10GrandTotal || !top10GrandTotal.receivedCount || top10GrandTotal.receivedCount === 0) {
      return [];
    }

    const receivedCount = top10GrandTotal.receivedCount || 0;
    
    // Calculate percentages for chart display
    const promotersPercent = receivedCount > 0 ? ((top10GrandTotal.promotersCount || 0) / receivedCount) * 100 : 0;
    const passivesPercent = receivedCount > 0 ? ((top10GrandTotal.passivesCount || 0) / receivedCount) * 100 : 0;
    const detractorsPercent = receivedCount > 0 ? ((top10GrandTotal.detractorsCount || 0) / receivedCount) * 100 : 0;
    
    return [{
      name: 'Top 10',
      promoters: top10GrandTotal.promotersCount || 0,
      passives: top10GrandTotal.passivesCount || 0,
      detractors: top10GrandTotal.detractorsCount || 0,
      promotersPercent,
      passivesPercent,
      detractorsPercent,
      nps: top10GrandTotal.npsScore || 0,
      receivedCount
    }];
  }, [processedData, showTop10]);

  // Create chart data for Other Account - NPS Distribution
  const otherAccountChartData = useMemo(() => {
    if (!processedData?.data || !showTop10) return [];
    
    // Find the Other Account row
    const otherAccount = processedData.data.find(item => item.isOtherAccount);
    
    if (!otherAccount || !otherAccount.receivedCount || otherAccount.receivedCount === 0) {
      return [];
    }

    const receivedCount = otherAccount.receivedCount || 0;
    
    // Calculate percentages for chart display
    const promotersPercent = receivedCount > 0 ? ((otherAccount.promotersCount || 0) / receivedCount) * 100 : 0;
    const passivesPercent = receivedCount > 0 ? ((otherAccount.passivesCount || 0) / receivedCount) * 100 : 0;
    const detractorsPercent = receivedCount > 0 ? ((otherAccount.detractorsCount || 0) / receivedCount) * 100 : 0;
    
    return [{
      name: 'Other Accounts',
      promoters: otherAccount.promotersCount || 0,
      passives: otherAccount.passivesCount || 0,
      detractors: otherAccount.detractorsCount || 0,
      promotersPercent,
      passivesPercent,
      detractorsPercent,
      nps: otherAccount.npsScore || 0,
      receivedCount
    }];
  }, [processedData, showTop10]);

  // Create chart data for Overall - NPS Distribution
  const overallChartData = useMemo(() => {
    if (!processedData?.data || !showTop10) return [];
    
    // Find the Overall row
    const overallRow = processedData.data.find(item => item.isOverallRow);
    
    if (!overallRow) {
      console.log('Overall row not found in processedData');
      return [];
    }

    // The Overall row has promotersCount, passivesCount, detractorsCount from Actual NPS (1st sheet with PERSPECTIVE=NPS)
    // Calculate total responded from Actual NPS categories (promoters + passives + detractors)
    const actualNpsResponded = (overallRow.promotersCount || 0) + (overallRow.passivesCount || 0) + (overallRow.detractorsCount || 0);
    
    // Check if we have Actual NPS data (at least one category should have data)
    if (actualNpsResponded === 0) {
      console.log('Overall row: No Actual NPS data found (actualNpsResponded = 0)');
      return [];
    }
    
    // Use actualNpsResponded as denominator for percentage calculation
    const receivedCount = actualNpsResponded;
    
    // Calculate percentages for chart display based on Actual NPS data
    const promotersPercent = receivedCount > 0 ? ((overallRow.promotersCount || 0) / receivedCount) * 100 : 0;
    const passivesPercent = receivedCount > 0 ? ((overallRow.passivesCount || 0) / receivedCount) * 100 : 0;
    const detractorsPercent = receivedCount > 0 ? ((overallRow.detractorsCount || 0) / receivedCount) * 100 : 0;
    
    console.log('Overall Chart Data:', {
      name: 'Overall',
      promoters: overallRow.promotersCount || 0,
      passives: overallRow.passivesCount || 0,
      detractors: overallRow.detractorsCount || 0,
      actualNpsResponded,
      promotersPercent,
      passivesPercent,
      detractorsPercent,
      nps: overallRow.npsScore || 0
    });
    
    return [{
      name: 'Overall',
      promoters: overallRow.promotersCount || 0,
      passives: overallRow.passivesCount || 0,
      detractors: overallRow.detractorsCount || 0,
      promotersPercent,
      passivesPercent,
      detractorsPercent,
      nps: overallRow.npsScore || 0,
      receivedCount
    }];
  }, [processedData, showTop10]);

  // Create pie chart data for Top 10 - NPS Distribution
  const top10PieChartData = useMemo(() => {
    if (!top10ChartData || top10ChartData.length === 0) return [];
    
    return [
      { name: 'Promoters %', value: top10ChartData[0].promotersPercent, color: '#C6EFCE' },
      { name: 'Passives %', value: top10ChartData[0].passivesPercent, color: '#FFA500' },
      { name: 'Detractors %', value: top10ChartData[0].detractorsPercent, color: '#FF0000' }
    ].filter(d => d.value > 0);
  }, [top10ChartData]);

  // Create pie chart data for Other Account - NPS Distribution
  const otherAccountPieChartData = useMemo(() => {
    if (!otherAccountChartData || otherAccountChartData.length === 0) return [];
    
    return [
      { name: 'Promoters %', value: otherAccountChartData[0].promotersPercent, color: '#C6EFCE' },
      { name: 'Passives %', value: otherAccountChartData[0].passivesPercent, color: '#FFA500' },
      { name: 'Detractors %', value: otherAccountChartData[0].detractorsPercent, color: '#FF0000' }
    ].filter(d => d.value > 0);
  }, [otherAccountChartData]);

  // Create pie chart data for Overall - NPS Distribution
  const overallPieChartData = useMemo(() => {
    if (!overallChartData || overallChartData.length === 0) return [];
    
    return [
      { name: 'Promoters %', value: overallChartData[0].promotersPercent, color: '#C6EFCE' },
      { name: 'Passives %', value: overallChartData[0].passivesPercent, color: '#FFA500' },
      { name: 'Detractors %', value: overallChartData[0].detractorsPercent, color: '#FF0000' }
    ].filter(d => d.value > 0);
  }, [overallChartData]);

  // Create combined chart data for Overall, Top 10, and Other Accounts in one chart
  const combinedTop10AndOtherChartData = useMemo(() => {
    const combined = [];
    
    // Add Overall row data first (1st position)
    if (overallChartData && overallChartData.length > 0) {
      combined.push(...overallChartData);
    }
    
    // Add Top 10 data
    if (top10ChartData && top10ChartData.length > 0) {
      combined.push(...top10ChartData);
    }
    
    // Add Other Accounts data
    if (otherAccountChartData && otherAccountChartData.length > 0) {
      combined.push(...otherAccountChartData);
    }
    
    return combined;
  }, [overallChartData, top10ChartData, otherAccountChartData]);

  // Helper function to render pie chart custom label
  const renderPieChartLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, payload }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 0.7;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    if (percent < 0.03) return null;

    const segmentColor = payload?.color || '#8884d8';
    const isRed = segmentColor === '#FF0000' || segmentColor.toLowerCase() === '#ff0000';
    const textColor = isRed ? '#ffffff' : '#000000';

    return (
      <text 
        x={x} 
        y={y} 
        fill={textColor}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="18"
        fontWeight="700"
        fontFamily="Arial, sans-serif"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  // Process respondent-level data for Responded Level Comparison
  const respondentLevelData = useMemo(() => {
    if (!firstSheetData || firstSheetData.length === 0) {
      console.log('No first sheet data available for respondent-level comparison');
      return [];
    }

    console.log('📊 Processing respondent-level data for Responded Level Comparison...');
    console.log('Total rows in first sheet:', firstSheetData.length);
    console.log('Cycle start date:', acsatCycleStartDateFormatted);

    // Group data by respondent category
    const respondentGroups = {};

    firstSheetData.forEach((row, index) => {
      // Extract respondent name
      const respondentName = row['RESPONDENT NAME'] || row['RESPONDENT_NAME'] || row['Respondent Name'] || 'Unknown';
      const customerId = getCustomerIdFromRow(row);
      const perspective = row['PERSPECTIVE'] || row['Perspective'] || '';
      const rating = row['RATING'] || row['Rating'];
      const respondentCategory = row['RESPONDENT CATEGORY'] || row['RESPONDENT_CATEGORY'] || row['Respondent Category'] || 'Unknown';
      
      // Only process NPS perspective
      if (!perspective.toString().toLowerCase().includes('nps')) return;
      
      // Get CSAT SENT DATE and CSAT RECEIVED DATE
      const csatSentDate = getCsatSentDateFromRow(row);
      const csatReceivedDate = getCsatReceivedDateFromRow(row);
      
      // Debug first few rows
      if (index < 3) {
        console.log(`Row ${index + 1} - Respondent Data:`, {
          respondentName,
          customerId,
          perspective,
          rating,
          csatSentDate,
          csatReceivedDate,
          cycleStartDate: acsatCycleStartDateFormatted
        });
      }
      
      // Check if dates are valid and on or after cycle start date
      const sentDateValid = isDateOnOrAfterCsatStart(csatSentDate, acsatCycleStartDateFormatted);
      const receivedDateValid = isDateOnOrAfterCsatStart(csatReceivedDate, acsatCycleStartDateFormatted);

      // Debug date validation
      if (index < 3) {
        console.log(`Row ${index + 1} - Date Validation:`, {
          csatSentDate,
          sentDateValid,
          csatReceivedDate,
          receivedDateValid
        });
      }
      
      // Only include if both dates are valid and on or after cycle start
      if (!sentDateValid || !receivedDateValid) {
        if (index < 3) {
          console.log(`❌ Row ${index + 1} filtered out - dates not valid or before cycle start`);
        }
        return;
      }
      
      // Group by respondent category
      const groupKey = respondentCategory;
      
      // Initialize respondent group if not exists
      if (!respondentGroups[groupKey]) {
        respondentGroups[groupKey] = {
          respondentName: respondentCategory, // Display category as the name
          respondentCategory: respondentCategory,
          promotersCount: 0,
          passivesCount: 0,
          detractorsCount: 0,
          csatSentDateCount: 0,  // Count of CSAT SENT DATE for this category
          csatReceivedDateCount: 0,  // Count of CSAT RECEIVED DATE for this category
          customerId: customerId
        };
      }
      
      // Count CSAT SENT DATE for denominator
      if (csatSentDate && sentDateValid) {
        respondentGroups[groupKey].csatSentDateCount++;
      }
      
      // Count CSAT RECEIVED DATE for denominator
      if (csatReceivedDate && receivedDateValid) {
        respondentGroups[groupKey].csatReceivedDateCount++;
      }
      
      // Count based on rating
      const ratingValue = parseFloat(rating);
      if (!isNaN(ratingValue)) {
        // Count promoters (rating exactly 9 or 10)
        if (ratingValue === 9 || ratingValue === 10) {
          respondentGroups[groupKey].promotersCount++;
          if (index < 3) {
            console.log(`✅ Promoter for ${respondentCategory}: rating = ${ratingValue}`);
          }
        }
        // Count passives (rating exactly 7 or 8)
        else if (ratingValue === 7 || ratingValue === 8) {
          respondentGroups[groupKey].passivesCount++;
          if (index < 3) {
            console.log(`😐 Passive for ${respondentCategory}: rating = ${ratingValue}`);
          }
        }
        // Count detractors (rating less than 7)
        else if (ratingValue < 7) {
          respondentGroups[groupKey].detractorsCount++;
          if (index < 3) {
            console.log(`❌ Detractor for ${respondentCategory}: rating = ${ratingValue}`);
          }
        }
      }
    });
    
    console.log(`Total respondent groups created: ${Object.keys(respondentGroups).length}`);
    
    // Convert to array and calculate NPS for each respondent
    const result = Object.values(respondentGroups).map((respondent, index) => {
      const csatReceivedDateCount = respondent.csatReceivedDateCount || 0; // count(CSAT RECEIVED DATE)
      const csatSentDateCount = respondent.csatSentDateCount; // Keep for reference
      const promoters = respondent.promotersCount;
      const passives = respondent.passivesCount;
      const detractors = respondent.detractorsCount;
      
      // Calculate NPS: (Promoters - Detractors) / Responded × 100
      const nps = csatReceivedDateCount > 0 ? ((promoters - detractors) / csatReceivedDateCount) * 100 : 0;
      
      if (index < 3) {
        console.log(`Respondent ${respondent.respondentName} NPS calculation:`, {
          promoters,
          passives,
          detractors,
          csatReceivedDateCount,
          csatSentDateCount,
          nps
        });
      }
      
      // Calculate percentages based on received count
      const promotersPercent = csatReceivedDateCount > 0 ? (promoters / csatReceivedDateCount) * 100 : 0;
      const passivesPercent = csatReceivedDateCount > 0 ? (passives / csatReceivedDateCount) * 100 : 0;
      const detractorsPercent = csatReceivedDateCount > 0 ? (detractors / csatReceivedDateCount) * 100 : 0;
      
      return {
        sno: index + 1,
        respondentName: respondent.respondentName,
        respondentCategory: respondent.respondentCategory || '',
        promotersCount: promoters,
        passivesCount: passives,
        detractorsCount: detractors,
        csatSentDateCount: csatSentDateCount,
        csatReceivedDateCount: csatReceivedDateCount,
        promotersPercent,
        passivesPercent,
        detractorsPercent,
        npsScore: nps,
        customerId: respondent.customerId
      };
    });
    
    // Calculate grand totals
    const grandTotal = {
      sno: '',
      respondentName: 'Overall',
      respondentCategory: 'Overall',
      promotersCount: result.reduce((sum, item) => sum + (item.promotersCount || 0), 0),
      passivesCount: result.reduce((sum, item) => sum + (item.passivesCount || 0), 0),
      detractorsCount: result.reduce((sum, item) => sum + (item.detractorsCount || 0), 0),
      csatSentDateCount: result.reduce((sum, item) => sum + (item.csatSentDateCount || 0), 0),
      csatReceivedDateCount: result.reduce((sum, item) => sum + (item.csatReceivedDateCount || 0), 0),
      npsScore: 0,
      customerId: '',
      isGrandTotal: true
    };
    
    // Calculate grand total NPS and percentages using received count
    const totalPromoters = grandTotal.promotersCount;
    const totalDetractors = grandTotal.detractorsCount;
    const totalPassives = grandTotal.passivesCount;
    const totalReceivedCount = grandTotal.csatReceivedDateCount;
    
    grandTotal.npsScore = totalReceivedCount > 0 
      ? ((totalPromoters - totalDetractors) / totalReceivedCount) * 100 
      : 0;
    
    grandTotal.promotersPercent = totalReceivedCount > 0 ? (totalPromoters / totalReceivedCount) * 100 : 0;
    grandTotal.passivesPercent = totalReceivedCount > 0 ? (totalPassives / totalReceivedCount) * 100 : 0;
    grandTotal.detractorsPercent = totalReceivedCount > 0 ? (totalDetractors / totalReceivedCount) * 100 : 0;
    
    // Sort by NPS score (descending)
    result.sort((a, b) => b.npsScore - a.npsScore);
    
    // Re-number SNO after sorting
    const sortedResult = result.map((item, index) => ({
      ...item,
      sno: index + 1
    }));
    
    // Add grand total at the end
    return [...sortedResult, grandTotal];
  }, [firstSheetData, acsatCycleStartDateFormatted]);

  // Process chart data for Respondent Category bar chart
  const respondentChartData = useMemo(() => {
    if (!respondentLevelData || !showRespondedComparison) return [];
    
    console.log('📊 Building chart data from respondentLevelData:', JSON.stringify(respondentLevelData, null, 2));
    
    const nonGrandRows = respondentLevelData.filter(item => !item.isGrandTotal);

    // Compute Overall stacked percentages from non-grand rows
    const overallAgg = nonGrandRows.reduce((acc, item) => {
      acc.promoters += item.promotersCount || 0;
      acc.passives += item.passivesCount || 0;
      acc.detractors += item.detractorsCount || 0;
      acc.received += item.csatReceivedDateCount || 0;
      return acc;
    }, { promoters: 0, passives: 0, detractors: 0, received: 0 });

    let overallPromotersPercent = 0, overallPassivesPercent = 0, overallDetractorsPercent = 0, overallNps = 0;
    if (overallAgg.received > 0) {
      overallPromotersPercent = (overallAgg.promoters / overallAgg.received) * 100;
      overallPassivesPercent = (overallAgg.passives / overallAgg.received) * 100;
      overallDetractorsPercent = (overallAgg.detractors / overallAgg.received) * 100;
      overallNps = ((overallAgg.promoters - overallAgg.detractors) / overallAgg.received) * 100;
    }

    const overallItem = {
      name: 'Overall',
      promoters: overallAgg.promoters,
      passives: overallAgg.passives,
      detractors: overallAgg.detractors,
      promotersPercent: overallPromotersPercent,
      passivesPercent: overallPassivesPercent,
      detractorsPercent: overallDetractorsPercent,
      nps: overallNps,
      totalResponses: overallAgg.received
    };

    const chartData = nonGrandRows
      .filter(item => !item.isGrandTotal)
      .map(item => {
        // DIRECTLY use the already calculated percentages from respondentLevelData
        // These are already calculated correctly based on csatReceivedDateCount
        // Ensure values are numbers, not strings
        let promotersPercent = item.promotersPercent;
        let passivesPercent = item.passivesPercent;
        let detractorsPercent = item.detractorsPercent;
        
        // Convert to number if needed
        if (typeof promotersPercent === 'string') promotersPercent = parseFloat(promotersPercent) || 0;
        if (typeof passivesPercent === 'string') passivesPercent = parseFloat(passivesPercent) || 0;
        if (typeof detractorsPercent === 'string') detractorsPercent = parseFloat(detractorsPercent) || 0;
        
        // Ensure they are numbers
        promotersPercent = Number(promotersPercent) || 0;
        passivesPercent = Number(passivesPercent) || 0;
        detractorsPercent = Number(detractorsPercent) || 0;
        
        console.log(`📊 Processing chart data for ${item.respondentCategory}:`, {
          rawItem: item,
          promotersCount: item.promotersCount,
          passivesCount: item.passivesCount,
          detractorsCount: item.detractorsCount,
          csatReceivedDateCount: item.csatReceivedDateCount,
          npsScore: item.npsScore,
          promotersPercent_RAW: item.promotersPercent,
          passivesPercent_RAW: item.passivesPercent,
          detractorsPercent_RAW: item.detractorsPercent,
          promotersPercent_CONVERTED: promotersPercent.toFixed(1) + '%',
          passivesPercent_CONVERTED: passivesPercent.toFixed(1) + '%',
          detractorsPercent_CONVERTED: detractorsPercent.toFixed(1) + '%',
          totalPercent: (promotersPercent + passivesPercent + detractorsPercent).toFixed(2)
        });
        
        // Special debug for CXO
        if (item.respondentCategory === 'CXO') {
          console.log('🔍 CXO Debug - Chart Data:', {
            name: item.respondentCategory,
            promotersPercent,
            passivesPercent,
            detractorsPercent,
            promotersCount: item.promotersCount,
            passivesCount: item.passivesCount,
            detractorsCount: item.detractorsCount,
            totalResponses: item.csatReceivedDateCount,
            calculatedPromotersPercent: item.csatReceivedDateCount > 0 ? (item.promotersCount / item.csatReceivedDateCount * 100).toFixed(1) : '0.0'
          });
        }
        
        const displayName = (() => {
          const cat = (item.respondentCategory || '').toString().trim();
          if (cat.toLowerCase() === 'cxo') return 'CXO strata';
          if (cat.toLowerCase() === 'non cxo' || cat.toLowerCase() === 'non-cxo' || cat.toLowerCase() === 'noncxo') return 'Non CXO strata';
          return cat || 'Unknown';
        })();

        const chartItem = {
          name: displayName,
          promoters: item.promotersCount || 0,
          passives: item.passivesCount || 0,
          detractors: item.detractorsCount || 0,
          promotersPercent,
          passivesPercent,
          detractorsPercent,
          nps: item.npsScore || 0,
          totalResponses: item.csatReceivedDateCount || 0
        };
        
        console.log(`✅ Final chart item for ${chartItem.name}:`, chartItem);
        
        return chartItem;
      });
    
    console.log('📊 Final Respondent chart data for bars (complete array):');
    chartData.forEach((item, idx) => {
      console.log(`Bar ${idx}: ${item.name}: Promoters=${item.promotersPercent.toFixed(1)}%, Passives=${item.passivesPercent.toFixed(1)}%, Detractors=${item.detractorsPercent.toFixed(1)}%, NPS=${item.nps.toFixed(1)}`);
    });
    
    // Place Overall as the first bar
    return [overallItem, ...chartData];
  }, [respondentLevelData, showRespondedComparison]);

  // Download Excel
  const downloadExcel = async () => {
    if (!processedData.data || processedData.data.length === 0) {
      alert('No data to download');
      return;
    }

    try {
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('NPS Dashboard');

      // Helper function to get NPS color
      const getNPSColor = (score) => {
        if (score >= 75) return { bg: 'FFC6EFCE', fg: 'FF000000' }; // Light Green 2 >=75% (Great) - Black text - Excel standard
        if (score >= 0 && score < 75) return { bg: 'FFFFA500', fg: 'FF000000' }; // Orange 0% to 75% (Good) - Black text - Excel standard
        return { bg: 'FFFF0000', fg: 'FFFFFFFF' }; // Red <0% (Needs Attention) - White text - Excel standard
      };

      const includeMainNpsTrendColumns = showMainNpsTrendColumns;
      const mainTrendFiles = includeMainNpsTrendColumns
        ? mainNpsTrendAnalysisData.filter((f) => f.hasData)
        : [];
      const mainTrendFileCount = mainTrendFiles.length;
      const excelTrendCols = getNpsDashboardExcelColumnIndices(groupByBU, mainTrendFileCount);

      const trendComparisonHeaders = includeMainNpsTrendColumns
        ? getNpsMainTrendComparisonSubHeaders(mainTrendFiles, mainTrendFileCount)
        : [];

      // Add grouped headers with proper colSpan
      const baseHeaders = groupByBU
        ? [
            '', '',
            'Response Rate', '', '',
            'Predicted NPS for the surveys responses received', '', '', '',
            'Actual NPS', '', '', '', '',
            ...(includeMainNpsTrendColumns
              ? ['Trend Comparison', ...Array(mainTrendFileCount * NPS_MAIN_TREND_COLUMNS_PER_FILE - 1).fill('')]
              : []),
          ]
        : [
            '', '', '',
            'Response Rate', '', '',
            'Predicted NPS for the surveys responses received', '', '', '',
            'Actual NPS', '', '', '', '',
            ...(includeMainNpsTrendColumns
              ? ['Trend Comparison', ...Array(mainTrendFileCount * NPS_MAIN_TREND_COLUMNS_PER_FILE - 1).fill('')]
              : []),
          ];

      const subHeaders = groupByBU
        ? [
            'Sr. No.', 'Business Unit', 'Polled', 'Responded', 'Response %',
            '#Promoters', '# Passives', '# Detractors', 'NPS',
            '#Promoters', '# Passives', '# Detractors', 'NPS', 'NPS score',
            ...trendComparisonHeaders,
          ]
        : [
            'Sr. No.', 'Business Unit', 'Account Name', 'Polled', 'Responded', 'Response %',
            '#Promoters', '# Passives', '# Detractors', 'NPS',
            '#Promoters', '# Passives', '# Detractors', 'NPS', 'NPS score',
            ...trendComparisonHeaders,
          ];

      // Add first row with individual headers and grouped headers
      const firstRow = worksheet.addRow(baseHeaders);
      
      // Style the first row
      firstRow.eachCell((cell, colNumber) => {
        const headerValue = cell.value;
        // Empty cells for Sr. No., Business Unit, Account Name positions should be dark blue
        if (headerValue === '' || headerValue === null) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        } else {
        cell.font = { bold: true, color: { argb: (headerValue === 'Response Rate' || headerValue === 'Predicted NPS for the surveys responses received' || headerValue === 'Actual NPS') ? 'FF000000' : 'FFFFFFFF' } };
        
        // Style based on header type
        if (headerValue === 'Response Rate') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9FC5E8' } }; // Light Blue 3 - Excel standard
        } else if (headerValue === 'Predicted NPS for the surveys responses received') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9FC5E8' } }; // Light Blue 3 - Excel standard
        } else if (headerValue === 'Actual NPS') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9FC5E8' } }; // Light Blue 3 - Excel standard
        } else if (headerValue === 'Trend Comparison') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D9488' } };
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
          }
        }
        
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
      });

      // Merge cells for grouped headers
      // Column positions: Sr. No. (1), Business Unit (2), Account Name (3 if not groupByBU)
      // Response Rate starts after these columns
      const responseRateStartCol = groupByBU ? 3 : 4;
      const responseRateEndCol = responseRateStartCol + 2;
      const predictedStartCol = responseRateEndCol + 1;
      const predictedEndCol = predictedStartCol + 3;
      const actualStartCol = predictedEndCol + 1;
      const actualEndCol = actualStartCol + 4;
      const trendComparisonStartCol = actualEndCol + 1;
      const trendComparisonEndCol = trendComparisonStartCol + (includeMainNpsTrendColumns ? mainTrendFileCount * NPS_MAIN_TREND_COLUMNS_PER_FILE - 1 : 0);
      
      // Merge empty cells in first row for Sr. No., Business Unit, Account Name positions
      if (groupByBU) {
        // Merge columns 1-2 for BU-wise
        worksheet.mergeCells(1, 1, 1, 2);
      } else {
        // Merge columns 1-3 for account-wise
        worksheet.mergeCells(1, 1, 1, 3);
      }

      // Merge Response Rate header
      worksheet.mergeCells(1, responseRateStartCol, 1, responseRateEndCol);
      // Merge Predicted NPS header
      worksheet.mergeCells(1, predictedStartCol, 1, predictedEndCol);
      // Merge Actual NPS header  
      worksheet.mergeCells(1, actualStartCol, 1, actualEndCol);
      if (includeMainNpsTrendColumns && mainTrendFileCount > 0) {
        worksheet.mergeCells(1, trendComparisonStartCol, 1, trendComparisonEndCol);
      }
      
      // Ensure the merged cells have the correct text
      const responseRateCell = worksheet.getCell(1, responseRateStartCol);
      responseRateCell.value = 'Response Rate';
      responseRateCell.font = { bold: true, color: { argb: 'FF000000' } };
      responseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9FC5E8' } }; // Light Blue 3 - Excel standard
      responseRateCell.alignment = { horizontal: 'center', vertical: 'middle' };
      
      const predictedCell = worksheet.getCell(1, predictedStartCol);
      predictedCell.value = 'Predicted NPS for the surveys responses received';
      predictedCell.font = { bold: true, color: { argb: 'FF000000' } };
      predictedCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9FC5E8' } }; // Light Blue 3 - Excel standard
      predictedCell.alignment = { horizontal: 'center', vertical: 'middle' };
      
      const actualCell = worksheet.getCell(1, actualStartCol);
      actualCell.value = 'Actual NPS';
      actualCell.font = { bold: true, color: { argb: 'FF000000' } };
      actualCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9FC5E8' } }; // Light Blue 3 - Excel standard
      actualCell.alignment = { horizontal: 'center', vertical: 'middle' };

      if (includeMainNpsTrendColumns && mainTrendFileCount > 0) {
        const trendComparisonCell = worksheet.getCell(1, trendComparisonStartCol);
        trendComparisonCell.value = 'Trend Comparison';
        trendComparisonCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        trendComparisonCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D9488' } };
        trendComparisonCell.alignment = { horizontal: 'center', vertical: 'middle' };
      }

      // Add second row with sub-headers
      const secondRow = worksheet.addRow(subHeaders);
      secondRow.eachCell((cell, colNumber) => {
        const headerValue = cell.value;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        
        // Style based on header type - use dark blue for main headers and specific NPS sub-headers
        const isTrendSubHeader = String(headerValue || '').startsWith('Trend ');
        if (isTrendSubHeader) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D9488' } };
        } else if (headerValue === 'Polled' || headerValue === 'Responded' || headerValue === 'Response %' || headerValue === '#Promoters' || headerValue === '# Passives' || headerValue === '# Detractors' || headerValue === 'NPS' || headerValue === 'NPS score') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
        }
        
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
      });
      
      // Set header row heights for better text wrapping
      firstRow.height = 40;
      secondRow.height = 40;

      // Separate regular data from grand total, percentage row, Other Account, Other Account percentage row, Overall row, Overall percentage row, Org Level percentage row, and Grand Total percentage row
      const regularData = sortedData.filter(group => !group.isGrandTotal && !group.isOtherAccount && !group.isPercentageRow && !group.isOtherAccountPercentageRow && !group.isOverallRow && !group.isOverallPercentageRow && !group.isOrgLevelPercentageRow && !group.isGrandTotalPercentageRow);
      const grandTotal = sortedData.find(group => group.isGrandTotal);
      const percentageRow = sortedData.find(group => group.isPercentageRow);
      const otherAccount = sortedData.find(group => group.isOtherAccount);
      const otherAccountPercentageRow = sortedData.find(group => group.isOtherAccountPercentageRow);
      const overallRow = sortedData.find(group => group.isOverallRow);
      const overallPercentageRow = sortedData.find(group => group.isOverallPercentageRow);
      const orgLevelPercentageRow = sortedData.find(group => group.isOrgLevelPercentageRow);
      const grandTotalPercentageRow = sortedData.find(group => group.isGrandTotalPercentageRow);

      const mainTrendLookupsForExcel = mainTrendFiles.map((fileData) =>
        groupByBU
          ? buildNpsBuMainTrendLookup(fileData.rows || [], fileData.grandTotal)
          : buildNpsMainTrendLookup(fileData.rows || [])
      );
      const mainTrendExcelOptions = (extra = {}) => ({
        ...extra,
        getTrendRow: (group, fileData, fileIdx) =>
          getNpsMainTrendRowForExcel(group, fileData, fileIdx, mainTrendLookupsForExcel, groupByBU),
      });

      // Add regular data rows first
      regularData.forEach((group, index) => {
        const baseRowData = groupByBU
          ? [
              group.displayIndex || index + 1,
              group.businessUnit,
              group.sentCount,
              group.receivedCount,
              group.sentCount === 0 ? '-' : (Math.round((group.responseRate || 0) * 10) / 10).toFixed(1) + '%',
              group.receivedCount === 0 ? '-' : (group.predictedPromotersCount || 0),
              group.receivedCount === 0 ? '-' : (group.predictedPassivesCount || 0),
              group.receivedCount === 0 ? '-' : (group.predictedDetractorsCount || 0),
              group.receivedCount === 0 ? '-' : parseFloat((Math.round((group.predictedNpsScore || 0) * 100) / 100).toFixed(2)),
              group.receivedCount === 0 ? '-' : (group.promotersCount || 0),
              group.receivedCount === 0 ? '-' : (group.passivesCount || 0),
              group.receivedCount === 0 ? '-' : (group.detractorsCount || 0),
              group.receivedCount === 0 ? '-' : parseFloat((Math.round((group.npsScore || 0) * 100) / 100).toFixed(2)),
              group.receivedCount === 0 ? '-' : (group.npsAvgRating == null ? '-' : parseFloat((Math.round(Number(group.npsAvgRating) * 100) / 100).toFixed(2)))
            ]
          : [
              group.displayIndex || index + 1,
              group.businessUnit,
              group.customerName,
              group.sentCount,
              group.receivedCount,
              group.sentCount === 0 ? '-' : (Math.round((group.responseRate || 0) * 10) / 10).toFixed(1) + '%',
              group.receivedCount === 0 ? '-' : (group.predictedPromotersCount || 0),
              group.receivedCount === 0 ? '-' : (group.predictedPassivesCount || 0),
              group.receivedCount === 0 ? '-' : (group.predictedDetractorsCount || 0),
              group.receivedCount === 0 ? '-' : parseFloat((Math.round((group.predictedNpsScore || 0) * 100) / 100).toFixed(2)),
              group.receivedCount === 0 ? '-' : (group.promotersCount || 0),
              group.receivedCount === 0 ? '-' : (group.passivesCount || 0),
              group.receivedCount === 0 ? '-' : (group.detractorsCount || 0),
              group.receivedCount === 0 ? '-' : parseFloat((Math.round((group.npsScore || 0) * 100) / 100).toFixed(2)),
              group.receivedCount === 0 ? '-' : (group.npsAvgRating == null ? '-' : parseFloat((Math.round(Number(group.npsAvgRating) * 100) / 100).toFixed(2)))
            ];
        const rowData = includeMainNpsTrendColumns
          ? injectNpsMainTrendExcelColumns(baseRowData, group, mainTrendFiles, mainTrendExcelOptions())
          : baseRowData;

        const row = worksheet.addRow(rowData);
        
        // Apply word wrapping and alignment to all cells in the data row
        // Text columns (Sr. No., Business Unit, Customer Name) - left align
        // Numeric columns - center align
        row.eachCell((cell, colNumber) => {
          const isTextColumn = colNumber === 1 || colNumber === 2 || (!groupByBU && colNumber === 3);
          cell.alignment = {
            horizontal: isTextColumn ? 'left' : 'center',
            vertical: 'middle',
            wrapText: true // Enable word wrapping for all data cells
          };
        });
        
        // Set row height for better text wrapping
        row.height = 30;
        
        // Style Other Account row
        if (group.isOtherAccount) {
          row.eachCell((cell, colNumber) => {
            const isTextColumn = colNumber === 1 || colNumber === 2 || (!groupByBU && colNumber === 3);
            cell.alignment = {
              horizontal: isTextColumn ? 'left' : 'center',
              vertical: 'middle',
              wrapText: true
            };
            cell.font = { bold: true };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB4C6E7' } };
            cell.border = {
              top: { style: 'medium', color: { argb: 'FF3B82F6' } },
              left: { style: 'thin', color: { argb: 'FF000000' } },
              bottom: { style: 'thin', color: { argb: 'FF000000' } },
              right: { style: 'thin', color: { argb: 'FF000000' } }
            };
          });
        }
        
        const responseRateColumnNumber = excelTrendCols.responseRateCol;
        const responseRateCell = row.getCell(responseRateColumnNumber);
        const responseRate = group.responseRate || 0;
        const surveysReceived = group.receivedCount || 0;
        
        if (surveysReceived === 0 || responseRate === 0) {
          // For zero Response %, use Red color
          responseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red for zero Response %
          responseRateCell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; // White text
        } else if (responseRate >= 75) {
          responseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; // Light Green 2 >=75% (Excel standard)
          responseRateCell.font = { color: { argb: 'FF000000' }, bold: true }; // Black text
        } else if (responseRate >= 50 && responseRate < 75) {
          responseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Orange 50%-75% (Excel standard)
          responseRateCell.font = { color: { argb: 'FF000000' }, bold: true }; // Black text
        } else {
          responseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red <50% (Excel standard)
          responseRateCell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; // White text
        }
        // Ensure center alignment for Response Rate cell (numeric column)
        responseRateCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        
        const npsScore = group.receivedCount === 0 ? '-' : group.npsScore;
        const predictedNpsScore = group.receivedCount === 0 ? '-' : group.predictedNpsScore;
        
        const predictedNpsCellIndex = excelTrendCols.predictedNpsCol;
        const predictedNpsCell = row.getCell(predictedNpsCellIndex);
        // Check if predictedNpsScore is '-' or null/undefined before applying color
        if (predictedNpsScore !== '-' && predictedNpsScore !== null && predictedNpsScore !== undefined && !isNaN(parseFloat(predictedNpsScore))) {
          const score = parseFloat(predictedNpsScore);
          if (score >= 75) {
            predictedNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; // Light Green 2 >=75% (Great) - Excel standard
            predictedNpsCell.font = { color: { argb: 'FF000000' }, bold: true }; // Black text for Light Green 2
          } else if (score >= 0 && score < 75) {
            predictedNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Orange 0% to 74.99% (Good) - Excel standard
            predictedNpsCell.font = { color: { argb: 'FF000000' }, bold: true }; // Black text for Orange
          } else {
            predictedNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red <0% (Needs Attention) - Excel standard
            predictedNpsCell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; // White text for Red
          }
          // Set number format for Predicted NPS cell to show 2 decimal places
          predictedNpsCell.numFmt = '0.00';
        } else {
          // No color for '-' or null/undefined values
          predictedNpsCell.font = { color: { argb: 'FF000000' }, bold: true }; // Default black text
        }
        // Ensure center alignment for NPS cell (numeric column)
        predictedNpsCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        
        const actualNpsCellIndex = excelTrendCols.actualNpsCol;
        const actualNpsCell = row.getCell(actualNpsCellIndex);
        if (npsScore !== '-' && npsScore !== null && npsScore !== undefined && !isNaN(parseFloat(npsScore))) {
          const score = parseFloat(npsScore);
          if (score >= 75) {
            actualNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
            actualNpsCell.font = { color: { argb: 'FF000000' }, bold: true };
          } else if (score >= 0 && score < 75) {
            actualNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
            actualNpsCell.font = { color: { argb: 'FF000000' }, bold: true };
          } else {
            actualNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
            actualNpsCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
          }
          actualNpsCell.numFmt = '0.00';
        } else {
          actualNpsCell.font = { color: { argb: 'FF000000' }, bold: true };
        }
        actualNpsCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

        if (includeMainNpsTrendColumns) {
          styleNpsExcelTrendDiffCells(row, mainTrendFiles, excelTrendCols);
        }

        row.eachCell((cell, colNumber) => {
          const isTextColumn = colNumber === 1 || colNumber === 2 || (!groupByBU && colNumber === 3);
          cell.alignment = {
            horizontal: isTextColumn ? 'left' : 'center',
            vertical: 'middle',
            wrapText: true
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
        });
      });

      // Add Grand Total row at the end (below all data rows)
      if (grandTotal) {
        const baseGrandTotalRowData = groupByBU
          ? [
              '',
              grandTotal.businessUnit,
              grandTotal.sentCount,
              grandTotal.receivedCount,
              grandTotal.sentCount === 0 ? '-' : (Math.round((grandTotal.responseRate || 0) * 10) / 10).toFixed(1) + '%',
              grandTotal.receivedCount === 0 ? '-' : (grandTotal.predictedPromotersCount || 0),
              grandTotal.receivedCount === 0 ? '-' : (grandTotal.predictedPassivesCount || 0),
              grandTotal.receivedCount === 0 ? '-' : (grandTotal.predictedDetractorsCount || 0),
              grandTotal.receivedCount === 0 ? '-' : parseFloat((Math.round((grandTotal.predictedNpsScore || 0) * 100) / 100).toFixed(2)),
              grandTotal.receivedCount === 0 ? '-' : (grandTotal.promotersCount || 0),
              grandTotal.receivedCount === 0 ? '-' : (grandTotal.passivesCount || 0),
              grandTotal.receivedCount === 0 ? '-' : (grandTotal.detractorsCount || 0),
              grandTotal.receivedCount === 0 ? '-' : parseFloat((Math.round((grandTotal.npsScore || 0) * 100) / 100).toFixed(2)),
              grandTotal.receivedCount === 0 ? '-' : (grandTotal.npsAvgRating == null ? '-' : parseFloat((Math.round(Number(grandTotal.npsAvgRating) * 100) / 100).toFixed(2)))
            ]
          : [
              '',
              grandTotal.businessUnit,
              grandTotal.customerName,
              grandTotal.sentCount,
              grandTotal.receivedCount,
              grandTotal.sentCount === 0 ? '-' : (Math.round((grandTotal.responseRate || 0) * 10) / 10).toFixed(1) + '%',
              grandTotal.receivedCount === 0 ? '-' : (grandTotal.predictedPromotersCount || 0),
              grandTotal.receivedCount === 0 ? '-' : (grandTotal.predictedPassivesCount || 0),
              grandTotal.receivedCount === 0 ? '-' : (grandTotal.predictedDetractorsCount || 0),
              grandTotal.receivedCount === 0 ? '-' : parseFloat((Math.round((grandTotal.predictedNpsScore || 0) * 100) / 100).toFixed(2)),
              grandTotal.receivedCount === 0 ? '-' : (grandTotal.promotersCount || 0),
              grandTotal.receivedCount === 0 ? '-' : (grandTotal.passivesCount || 0),
              grandTotal.receivedCount === 0 ? '-' : (grandTotal.detractorsCount || 0),
              grandTotal.receivedCount === 0 ? '-' : parseFloat((Math.round((grandTotal.npsScore || 0) * 100) / 100).toFixed(2)),
              grandTotal.receivedCount === 0 ? '-' : (grandTotal.npsAvgRating == null ? '-' : parseFloat((Math.round(Number(grandTotal.npsAvgRating) * 100) / 100).toFixed(2)))
            ];
        const grandTotalRowData = includeMainNpsTrendColumns
          ? injectNpsMainTrendExcelColumns(
              baseGrandTotalRowData,
              grandTotal,
              mainTrendFiles,
              mainTrendExcelOptions(groupByBU ? {} : { useGrandTotalTrend: true })
            )
          : baseGrandTotalRowData;

        const grandTotalRow = worksheet.addRow(grandTotalRowData);
        
        // Apply word wrapping and alignment to all cells in the grand total row
        grandTotalRow.eachCell((cell, colNumber) => {
          // Text columns (Sr. No., Business Unit, Customer Name) - left align
          // Numeric columns - center align
          const isTextColumn = colNumber === 1 || colNumber === 2 || (!groupByBU && colNumber === 3);
          cell.alignment = {
            horizontal: isTextColumn ? 'left' : 'center',
            vertical: 'middle',
            wrapText: true
          };
          cell.font = { bold: true };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: (showTop10 === true) ? 'FFFFE699' : 'FFF8FAFC' } };
          cell.border = {
            top: { style: 'medium', color: { argb: 'FF3B82F6' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
        });
        
        // Set row height for grand total
        grandTotalRow.height = 30;
        
        const grandTotalResponseRateColumnNumber = excelTrendCols.responseRateCol;
        const grandTotalResponseRateCell = grandTotalRow.getCell(grandTotalResponseRateColumnNumber);
        const grandTotalResponseRate = grandTotal.responseRate || 0;
        const grandTotalSurveysReceived = grandTotal.receivedCount || 0;
        
        if (grandTotalSurveysReceived === 0 || grandTotalResponseRate === 0) {
          // For zero Response %, use Red color
          grandTotalResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red for zero Response %
          grandTotalResponseRateCell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; // White text
        } else if (grandTotalResponseRate >= 75) {
          grandTotalResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; // Light Green 2 >=75% (Excel standard)
          grandTotalResponseRateCell.font = { color: { argb: 'FF000000' }, bold: true }; // Black text
        } else if (grandTotalResponseRate >= 50 && grandTotalResponseRate < 75) {
          grandTotalResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Orange 50%-75% (Excel standard)
          grandTotalResponseRateCell.font = { color: { argb: 'FF000000' }, bold: true }; // Black text
        } else {
          grandTotalResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red <50% (Excel standard)
          grandTotalResponseRateCell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; // White text
        }
        // Ensure center alignment for Response Rate cell (numeric column)
        grandTotalResponseRateCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        
        // Style NPS cells for grand total
        // Column structure for groupByBU: Sr.No(1), BU(2), Polled(3), Responded(4), Response%(5), 
        //   Predicted: #Promoters(6), #Passives(7), #Detractors(8), NPS(9),
        //   Actual: #Promoters(10), #Passives(11), #Detractors(12), NPS(13)
        // Column structure for !groupByBU: Sr.No(1), BU(2), Account(3), Polled(4), Responded(5), Response%(6),
        //   Predicted: #Promoters(7), #Passives(8), #Detractors(9), NPS(10),
        //   Actual: #Promoters(11), #Passives(12), #Detractors(13), NPS(14)
        // Check if values should be '-' based on receivedCount
        const grandTotalNpsScore = grandTotal.receivedCount === 0 ? '-' : grandTotal.npsScore;
        const grandTotalPredictedNpsScore = grandTotal.receivedCount === 0 ? '-' : grandTotal.predictedNpsScore;
        
        // Style Predicted NPS cell
        const grandTotalPredictedNpsCellIndex = excelTrendCols.predictedNpsCol;
        const grandTotalPredictedNpsCell = grandTotalRow.getCell(grandTotalPredictedNpsCellIndex);
        // Check if grandTotalPredictedNpsScore is '-' or null/undefined before applying color
        if (grandTotalPredictedNpsScore !== '-' && grandTotalPredictedNpsScore !== null && grandTotalPredictedNpsScore !== undefined && !isNaN(parseFloat(grandTotalPredictedNpsScore))) {
          const score = parseFloat(grandTotalPredictedNpsScore);
          if (score >= 75) {
            grandTotalPredictedNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; // Light Green 2 >=75% (Great) - Excel standard
            grandTotalPredictedNpsCell.font = { color: { argb: 'FF000000' }, bold: true }; // Black text for Light Green 2
          } else if (score >= 0 && score < 75) {
            grandTotalPredictedNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Orange 0% to 74.99% (Good) - Excel standard
            grandTotalPredictedNpsCell.font = { color: { argb: 'FF000000' }, bold: true }; // Black text for Orange
          } else {
            grandTotalPredictedNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red <0% (Needs Attention) - Excel standard
            grandTotalPredictedNpsCell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; // White text for Red
          }
          // Set number format for Grand Total Predicted NPS cell to show 2 decimal places
          grandTotalPredictedNpsCell.numFmt = '0.00';
        } else {
          // No color for '-' or null/undefined values
          grandTotalPredictedNpsCell.font = { color: { argb: 'FF000000' }, bold: true }; // Default black text
        }
        // Ensure center alignment for NPS cell (numeric column)
        grandTotalPredictedNpsCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        
        // Style Actual NPS cell
        const grandTotalActualNpsCellIndex = excelTrendCols.actualNpsCol;
        const grandTotalActualNpsCell = grandTotalRow.getCell(grandTotalActualNpsCellIndex);
        // Check if grandTotalNpsScore is '-' or null/undefined before applying color
        if (grandTotalNpsScore !== '-' && grandTotalNpsScore !== null && grandTotalNpsScore !== undefined && !isNaN(parseFloat(grandTotalNpsScore))) {
          const score = parseFloat(grandTotalNpsScore);
          if (score >= 75) {
            grandTotalActualNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; // Light Green 2 >=75% (Great) - Excel standard
            grandTotalActualNpsCell.font = { color: { argb: 'FF000000' }, bold: true }; // Black text for Light Green 2
          } else if (score >= 0 && score < 75) {
            grandTotalActualNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Orange 0% to 74.99% (Good) - Excel standard
            grandTotalActualNpsCell.font = { color: { argb: 'FF000000' }, bold: true }; // Black text for Orange
          } else {
            grandTotalActualNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red <0% (Needs Attention) - Excel standard
            grandTotalActualNpsCell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; // White text for Red
          }
          // Set number format for Grand Total Actual NPS cell to show 2 decimal places
          grandTotalActualNpsCell.numFmt = '0.00';
        } else {
          // No color for '-' or null/undefined values
          grandTotalActualNpsCell.font = { color: { argb: 'FF000000' }, bold: true }; // Default black text
        }
        // Ensure center alignment for NPS cell (numeric column)
        grandTotalActualNpsCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

        if (includeMainNpsTrendColumns) {
          styleNpsExcelTrendDiffCells(grandTotalRow, mainTrendFiles, excelTrendCols);
        }
      }

      // Add Other Account row below Grand Total (only for Top 10 view)
      if (otherAccount) {
        const otherAccountRowData = groupByBU
          ? [
              '', // Empty Sr. No. for Other Account row
              otherAccount.businessUnit || '',
              otherAccount.sentCount,
              otherAccount.receivedCount,
              otherAccount.sentCount === 0 ? '-' : (Math.round((otherAccount.responseRate || 0) * 10) / 10).toFixed(1) + '%',
              otherAccount.receivedCount === 0 ? '-' : (otherAccount.predictedPromotersCount || 0),
              otherAccount.receivedCount === 0 ? '-' : (otherAccount.predictedPassivesCount || 0),
              otherAccount.receivedCount === 0 ? '-' : (otherAccount.predictedDetractorsCount || 0),
              otherAccount.receivedCount === 0 ? '-' : parseFloat((Math.round((otherAccount.predictedNpsScore || 0) * 100) / 100).toFixed(2)),
              otherAccount.receivedCount === 0 ? '-' : (otherAccount.promotersCount || 0),
              otherAccount.receivedCount === 0 ? '-' : (otherAccount.passivesCount || 0),
              otherAccount.receivedCount === 0 ? '-' : (otherAccount.detractorsCount || 0),
              otherAccount.receivedCount === 0 ? '-' : parseFloat((Math.round((otherAccount.npsScore || 0) * 100) / 100).toFixed(2)),
              otherAccount.receivedCount === 0 ? '-' : (otherAccount.npsAvgRating == null ? '-' : parseFloat((Math.round(Number(otherAccount.npsAvgRating) * 100) / 100).toFixed(2)))
            ]
          : [
              '', // Empty Sr. No. for Other Account row
              otherAccount.businessUnit || '',
              otherAccount.customerName || 'Other Accounts',
              otherAccount.sentCount,
              otherAccount.receivedCount,
              otherAccount.sentCount === 0 ? '-' : (Math.round((otherAccount.responseRate || 0) * 10) / 10).toFixed(1) + '%',
              otherAccount.receivedCount === 0 ? '-' : (otherAccount.predictedPromotersCount || 0),
              otherAccount.receivedCount === 0 ? '-' : (otherAccount.predictedPassivesCount || 0),
              otherAccount.receivedCount === 0 ? '-' : (otherAccount.predictedDetractorsCount || 0),
              otherAccount.receivedCount === 0 ? '-' : parseFloat((Math.round((otherAccount.predictedNpsScore || 0) * 100) / 100).toFixed(2)),
              otherAccount.receivedCount === 0 ? '-' : (otherAccount.promotersCount || 0),
              otherAccount.receivedCount === 0 ? '-' : (otherAccount.passivesCount || 0),
              otherAccount.receivedCount === 0 ? '-' : (otherAccount.detractorsCount || 0),
              otherAccount.receivedCount === 0 ? '-' : parseFloat((Math.round((otherAccount.npsScore || 0) * 100) / 100).toFixed(2)),
              otherAccount.receivedCount === 0 ? '-' : (otherAccount.npsAvgRating == null ? '-' : parseFloat((Math.round(Number(otherAccount.npsAvgRating) * 100) / 100).toFixed(2)))
            ];

        const otherAccountRow = worksheet.addRow(otherAccountRowData);
        
        // Apply word wrapping and alignment to all cells in the Other Account row
        // Text columns (Sr. No., Business Unit, Customer Name) - left align
        // Numeric columns - center align
        otherAccountRow.eachCell((cell, colNumber) => {
          const isTextColumn = colNumber === 1 || colNumber === 2 || (!groupByBU && colNumber === 3);
          cell.alignment = {
            horizontal: isTextColumn ? 'left' : 'center',
            vertical: 'middle',
            wrapText: true
          };
          cell.font = { bold: true };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB4C6E7' } };
          cell.border = {
            top: { style: 'medium', color: { argb: 'FFF59E0B' } }, // Orange border
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
        });
        
        // Set row height for Other Account row
        otherAccountRow.height = 30;
        
        // Style Response Rate cell for Other Account row
        // Column structure for groupByBU: Sr.No(1), BU(2), Polled(3), Responded(4), Response%(5), 
        // Column structure for !groupByBU: Sr.No(1), BU(2), Account(3), Polled(4), Responded(5), Response%(6),
        const otherAccountResponseRateColumnNumber = groupByBU ? 5 : 6; // Column 5 for BU view, 6 for account view
        const otherAccountResponseRateCell = otherAccountRow.getCell(otherAccountResponseRateColumnNumber);
        const otherAccountResponseRate = otherAccount.responseRate || 0;
        const otherAccountSurveysReceived = otherAccount.receivedCount || 0;
        
        if (otherAccountSurveysReceived === 0 || otherAccountResponseRate === 0) {
          // For zero Response %, use Red color
          otherAccountResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red for zero Response %
          otherAccountResponseRateCell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; // White text
        } else if (otherAccountResponseRate >= 75) {
          otherAccountResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; // Light Green 2 >=75% (Excel standard)
          otherAccountResponseRateCell.font = { color: { argb: 'FF000000' }, bold: true }; // Black text
        } else if (otherAccountResponseRate >= 50 && otherAccountResponseRate < 75) {
          otherAccountResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Orange 50%-75% (Excel standard)
          otherAccountResponseRateCell.font = { color: { argb: 'FF000000' }, bold: true }; // Black text
        } else {
          otherAccountResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red <50% (Excel standard)
          otherAccountResponseRateCell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; // White text
        }
        // Ensure center alignment for Response Rate cell (numeric column)
        otherAccountResponseRateCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        
        // Style NPS cells for Other Account row
        // Column structure for groupByBU: Sr.No(1), BU(2), Polled(3), Responded(4), Response%(5), 
        //   Predicted: #Promoters(6), #Passives(7), #Detractors(8), NPS(9),
        //   Actual: #Promoters(10), #Passives(11), #Detractors(12), NPS(13)
        // Column structure for !groupByBU: Sr.No(1), BU(2), Account(3), Polled(4), Responded(5), Response%(6),
        //   Predicted: #Promoters(7), #Passives(8), #Detractors(9), NPS(10),
        //   Actual: #Promoters(11), #Passives(12), #Detractors(13), NPS(14)
        // Check if values should be '-' based on receivedCount
        const otherAccountNpsScore = otherAccount.receivedCount === 0 ? '-' : otherAccount.npsScore;
        const otherAccountPredictedNpsScore = otherAccount.receivedCount === 0 ? '-' : otherAccount.predictedNpsScore;
        
        // Style Predicted NPS cell
        const otherAccountPredictedNpsCellIndex = groupByBU ? 9 : 10;
        const otherAccountPredictedNpsCell = otherAccountRow.getCell(otherAccountPredictedNpsCellIndex);
        // Check if otherAccountPredictedNpsScore is '-' or null/undefined before applying color
        if (otherAccountPredictedNpsScore !== '-' && otherAccountPredictedNpsScore !== null && otherAccountPredictedNpsScore !== undefined && !isNaN(parseFloat(otherAccountPredictedNpsScore))) {
          const score = parseFloat(otherAccountPredictedNpsScore);
          if (score >= 75) {
            otherAccountPredictedNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; // Light Green 2 >=75% (Great) - Excel standard
            otherAccountPredictedNpsCell.font = { color: { argb: 'FF000000' }, bold: true }; // Black text for Light Green 2
          } else if (score >= 0 && score < 75) {
            otherAccountPredictedNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Orange 0% to 74.99% (Good) - Excel standard
            otherAccountPredictedNpsCell.font = { color: { argb: 'FF000000' }, bold: true }; // Black text for Orange
          } else {
            otherAccountPredictedNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red <0% (Needs Attention) - Excel standard
            otherAccountPredictedNpsCell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; // White text for Red
          }
          // Set number format for Other Account Predicted NPS cell to show 2 decimal places
          otherAccountPredictedNpsCell.numFmt = '0.00';
        } else {
          // No color for '-' or null/undefined values
          otherAccountPredictedNpsCell.font = { color: { argb: 'FF000000' }, bold: true }; // Default black text
        }
        // Ensure center alignment for NPS cell (numeric column)
        otherAccountPredictedNpsCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        
        // Style Actual NPS cell
        const otherAccountActualNpsCellIndex = groupByBU ? 13 : 14;
        const otherAccountActualNpsCell = otherAccountRow.getCell(otherAccountActualNpsCellIndex);
        // Check if otherAccountNpsScore is '-' or null/undefined before applying color
        if (otherAccountNpsScore !== '-' && otherAccountNpsScore !== null && otherAccountNpsScore !== undefined && !isNaN(parseFloat(otherAccountNpsScore))) {
          const score = parseFloat(otherAccountNpsScore);
          if (score >= 75) {
            otherAccountActualNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; // Light Green 2 >=75% (Great) - Excel standard
            otherAccountActualNpsCell.font = { color: { argb: 'FF000000' }, bold: true }; // Black text for Light Green 2
          } else if (score >= 0 && score < 75) {
            otherAccountActualNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Orange 0% to 74.99% (Good) - Excel standard
            otherAccountActualNpsCell.font = { color: { argb: 'FF000000' }, bold: true }; // Black text for Orange
          } else {
            otherAccountActualNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red <0% (Needs Attention) - Excel standard
            otherAccountActualNpsCell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; // White text for Red
          }
          // Set number format for Other Account Actual NPS cell to show 2 decimal places
          otherAccountActualNpsCell.numFmt = '0.00';
        } else {
          // No color for '-' or null/undefined values
          otherAccountActualNpsCell.font = { color: { argb: 'FF000000' }, bold: true }; // Default black text
        }
        // Ensure center alignment for NPS cell (numeric column)
        otherAccountActualNpsCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      }

      // Add Org Level percentage row below Grand Total (only for BU-wise dashboard)
      if (orgLevelPercentageRow && groupByBU) {
        const baseOrgLevelPercentageRowData = groupByBU
          ? [
              '', // Empty Sr. No. for percentage row
              orgLevelPercentageRow.businessUnit || 'Org Level %',
              '-', // Don't display Polled
              '-', // Don't display Responded
              orgLevelPercentageRow.responseRate, // % of grand total: Responded/Polled*100
              orgLevelPercentageRow.predictedPromotersCount,
              orgLevelPercentageRow.predictedPassivesCount,
              orgLevelPercentageRow.predictedDetractorsCount,
              orgLevelPercentageRow.predictedNpsScore, // No % sign for NPS
              orgLevelPercentageRow.promotersCount,
              orgLevelPercentageRow.passivesCount,
              orgLevelPercentageRow.detractorsCount,
              orgLevelPercentageRow.npsScore, // No % sign for NPS
              '-',
            ]
          : [
              '', // Empty Sr. No. for percentage row
              orgLevelPercentageRow.businessUnit || '',
              orgLevelPercentageRow.customerName || 'Org Level %',
              '-', // Don't display Polled
              '-', // Don't display Responded
              orgLevelPercentageRow.responseRate, // % of grand total: Responded/Polled*100
              orgLevelPercentageRow.predictedPromotersCount,
              orgLevelPercentageRow.predictedPassivesCount,
              orgLevelPercentageRow.predictedDetractorsCount,
              orgLevelPercentageRow.predictedNpsScore, // No % sign for NPS
              orgLevelPercentageRow.promotersCount,
              orgLevelPercentageRow.passivesCount,
              orgLevelPercentageRow.detractorsCount,
              orgLevelPercentageRow.npsScore, // No % sign for NPS
              '-',
            ];
        const orgLevelPercentageRowData = includeMainNpsTrendColumns
          ? injectNpsMainTrendExcelColumns(
              baseOrgLevelPercentageRowData,
              orgLevelPercentageRow,
              mainTrendFiles,
              mainTrendExcelOptions({ dashOnly: true })
            )
          : baseOrgLevelPercentageRowData;

        const orgLevelPercentageExcelRow = worksheet.addRow(orgLevelPercentageRowData);
        
        // Apply word wrapping and alignment to all cells in the percentage row
        orgLevelPercentageExcelRow.eachCell((cell, colNumber) => {
          // Text columns (Sr. No., Business Unit, Customer Name) - left align
          // Numeric columns - center align
          const isTextColumn = colNumber === 1 || colNumber === 2 || (!groupByBU && colNumber === 3);
          cell.alignment = {
            horizontal: isTextColumn ? 'left' : 'center',
            vertical: 'middle',
            wrapText: true
          };
          cell.font = { bold: true, italic: true };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9FC5E8' } }; // Light Blue 3 background (Excel standard) - same as header
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
        });
        
        // Apply legend color to Response Rate cell in percentage row
        // Column structure for groupByBU: Sr.No(1), BU(2), Polled(3), Responded(4), Response%(5), 
        // Column structure for !groupByBU: Sr.No(1), BU(2), Account(3), Polled(4), Responded(5), Response%(6),
        const orgLevelResponseRateColumnNumber = groupByBU ? 5 : 6; // Column 5 for BU view, 6 for account view
        const orgLevelResponseRateCell = orgLevelPercentageExcelRow.getCell(orgLevelResponseRateColumnNumber);
        // Parse responseRate value (it might be a string with %)
        const orgLevelResponseRateValue = typeof orgLevelPercentageRow.responseRate === 'number' 
          ? orgLevelPercentageRow.responseRate 
          : (typeof orgLevelPercentageRow.responseRate === 'string' 
            ? parseFloat(orgLevelPercentageRow.responseRate.replace('%', '')) || 0 
            : 0);
        const orgLevelSurveysReceived = grandTotal.receivedCount || 0;
        
        if (orgLevelSurveysReceived === 0 || orgLevelResponseRateValue === 0) {
          // For zero Response %, use Red color
          orgLevelResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red for zero Response %
          orgLevelResponseRateCell.font = { color: { argb: 'FFFFFFFF' }, bold: true, italic: true }; // White text
        } else if (orgLevelResponseRateValue >= 75) {
          orgLevelResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; // Light Green 2 >=75% (Excel standard)
          orgLevelResponseRateCell.font = { color: { argb: 'FF000000' }, bold: true, italic: true }; // Black text
        } else if (orgLevelResponseRateValue >= 50 && orgLevelResponseRateValue < 75) {
          orgLevelResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Orange 50%-75% (Excel standard)
          orgLevelResponseRateCell.font = { color: { argb: 'FF000000' }, bold: true, italic: true }; // Black text
        } else {
          orgLevelResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red <50% (Excel standard)
          orgLevelResponseRateCell.font = { color: { argb: 'FFFFFFFF' }, bold: true, italic: true }; // White text
        }
        // Ensure center alignment for Response Rate cell (numeric column)
        orgLevelResponseRateCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        
        // Apply legend color to NPS cells in percentage row (Both Predicted and Actual NPS columns)
        // Column structure for groupByBU: Sr.No(1), BU(2), Polled(3), Responded(4), Response%(5), 
        //   Predicted: #Promoters(6), #Passives(7), #Detractors(8), NPS(9),
        //   Actual: #Promoters(10), #Passives(11), #Detractors(12), NPS(13)
        // Column structure for !groupByBU: Sr.No(1), BU(2), Account(3), Polled(4), Responded(5), Response%(6),
        //   Predicted: #Promoters(7), #Passives(8), #Detractors(9), NPS(10),
        //   Actual: #Promoters(11), #Passives(12), #Detractors(13), NPS(14)
        // Predicted NPS cell index: groupByBU ? 9 : 10
        // Actual NPS cell index: groupByBU ? 13 : 14
        const orgLevelPredictedNpsCellIndex = groupByBU ? 9 : 10;
        const orgLevelActualNpsCellIndex = groupByBU ? 13 : 14;
        
        const orgLevelPredictedNpsCell = orgLevelPercentageExcelRow.getCell(orgLevelPredictedNpsCellIndex);
        const orgLevelActualNpsCell = orgLevelPercentageExcelRow.getCell(orgLevelActualNpsCellIndex);
        
        // Parse NPS values (they might be strings with % removed)
        const orgLevelPredictedNpsValue = typeof orgLevelPercentageRow.predictedNpsScore === 'string' 
          ? parseFloat(orgLevelPercentageRow.predictedNpsScore) || 0 
          : (orgLevelPercentageRow.predictedNpsScore || 0);
        const orgLevelActualNpsValue = typeof orgLevelPercentageRow.npsScore === 'string' 
          ? parseFloat(orgLevelPercentageRow.npsScore) || 0 
          : (orgLevelPercentageRow.npsScore || 0);
        
        // Apply color coding to Predicted NPS cell
        if (orgLevelPredictedNpsValue >= 75) {
          orgLevelPredictedNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; // Light Green 2 >=75%
          orgLevelPredictedNpsCell.font = { color: { argb: 'FF000000' }, bold: true, italic: true }; // Black text
        } else if (orgLevelPredictedNpsValue >= 0 && orgLevelPredictedNpsValue < 75) {
          orgLevelPredictedNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Orange 0% to 74.99% - Excel standard
          orgLevelPredictedNpsCell.font = { color: { argb: 'FF000000' }, bold: true, italic: true }; // Black text
        } else {
          orgLevelPredictedNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red <0% - Excel standard
          orgLevelPredictedNpsCell.font = { color: { argb: 'FFFFFFFF' }, bold: true, italic: true }; // White text
        }
        // Set number format for Org Level Predicted NPS cell to show 2 decimal places
        orgLevelPredictedNpsCell.numFmt = '0.00';
        // Ensure center alignment for NPS cell (numeric column)
        orgLevelPredictedNpsCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        
        // Apply color coding to Actual NPS cell
        if (orgLevelActualNpsValue >= 75) {
          orgLevelActualNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; // Light Green 2 >=75%
          orgLevelActualNpsCell.font = { color: { argb: 'FF000000' }, bold: true, italic: true }; // Black text
        } else if (orgLevelActualNpsValue >= 0 && orgLevelActualNpsValue < 75) {
          orgLevelActualNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Orange 0% to 74.99% - Excel standard
          orgLevelActualNpsCell.font = { color: { argb: 'FF000000' }, bold: true, italic: true }; // Black text
        } else {
          orgLevelActualNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red <0% - Excel standard
          orgLevelActualNpsCell.font = { color: { argb: 'FFFFFFFF' }, bold: true, italic: true }; // White text
        }
        // Set number format for Org Level Actual NPS cell to show 2 decimal places
        orgLevelActualNpsCell.numFmt = '0.00';
        // Ensure center alignment for NPS cell (numeric column)
        orgLevelActualNpsCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

        if (includeMainNpsTrendColumns) {
          styleNpsExcelTrendDiffCells(orgLevelPercentageExcelRow, mainTrendFiles, excelTrendCols);
        }
        
        // Set row height for percentage row
        orgLevelPercentageExcelRow.height = 30;
      }

      // Add GRAND TOTAL percentage row below Grand Total (only for account-wise dashboard, not Top 10)
      if (grandTotalPercentageRow && !groupByBU && !showTop10) {
        const baseGrandTotalPercentageRowData = [
          '',
          grandTotalPercentageRow.businessUnit || '',
          grandTotalPercentageRow.customerName || 'GRAND TOTAL %',
          '-',
          '-',
          grandTotalPercentageRow.responseRate,
          grandTotalPercentageRow.predictedPromotersCount,
          grandTotalPercentageRow.predictedPassivesCount,
          grandTotalPercentageRow.predictedDetractorsCount,
          grandTotalPercentageRow.predictedNpsScore,
          grandTotalPercentageRow.promotersCount,
          grandTotalPercentageRow.passivesCount,
          grandTotalPercentageRow.detractorsCount,
          grandTotalPercentageRow.npsScore,
          '-',
        ];
        const grandTotalPercentageRowData = includeMainNpsTrendColumns
          ? injectNpsMainTrendExcelColumns(
              baseGrandTotalPercentageRowData,
              grandTotalPercentageRow,
              mainTrendFiles,
              mainTrendExcelOptions({ dashOnly: true })
            )
          : baseGrandTotalPercentageRowData;

        const grandTotalPercentageExcelRow = worksheet.addRow(grandTotalPercentageRowData);
        
        // Apply word wrapping and alignment to all cells in the percentage row
        grandTotalPercentageExcelRow.eachCell((cell, colNumber) => {
          // Text columns (Sr. No., Business Unit, Customer Name) - left align
          // Numeric columns - center align
          const isTextColumn = colNumber === 1 || colNumber === 2 || (!groupByBU && colNumber === 3);
          cell.alignment = {
            horizontal: isTextColumn ? 'left' : 'center',
            vertical: 'middle',
            wrapText: true
          };
          cell.font = { bold: true, italic: true };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9FC5E8' } }; // Light Blue 3 background (Excel standard) - same as header
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
        });
        
        // Apply legend color to Response Rate cell in percentage row
        // Column structure for groupByBU: Sr.No(1), BU(2), Polled(3), Responded(4), Response%(5), 
        // Column structure for !groupByBU: Sr.No(1), BU(2), Account(3), Polled(4), Responded(5), Response%(6),
        const grandTotalPercentageResponseRateColumnNumber = groupByBU ? 5 : 6; // Column 5 for BU view, 6 for account view
        const grandTotalPercentageResponseRateCell = grandTotalPercentageExcelRow.getCell(grandTotalPercentageResponseRateColumnNumber);
        // Parse responseRate value (it might be a string with %)
        const grandTotalPercentageResponseRateValue = typeof grandTotalPercentageRow.responseRate === 'number' 
          ? grandTotalPercentageRow.responseRate 
          : (typeof grandTotalPercentageRow.responseRate === 'string' 
            ? parseFloat(grandTotalPercentageRow.responseRate.replace('%', '')) || 0 
            : 0);
        const grandTotalPercentageSurveysReceived = grandTotal.receivedCount || 0;
        
        if (grandTotalPercentageSurveysReceived === 0) {
          // For zero surveys received, use neutral styling
          grandTotalPercentageResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
          grandTotalPercentageResponseRateCell.font = { color: { argb: 'FF6B7280' }, bold: true, italic: true };
        } else if (grandTotalPercentageResponseRateValue >= 75) {
          grandTotalPercentageResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; // Light Green 2 >=75% (Excel standard)
          grandTotalPercentageResponseRateCell.font = { color: { argb: 'FF000000' }, bold: true, italic: true }; // Black text
        } else if (grandTotalPercentageResponseRateValue >= 50 && grandTotalPercentageResponseRateValue < 75) {
          grandTotalPercentageResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Orange 50%-75% (Excel standard)
          grandTotalPercentageResponseRateCell.font = { color: { argb: 'FF000000' }, bold: true, italic: true }; // Black text
        } else {
          grandTotalPercentageResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red <50% (Excel standard)
          grandTotalPercentageResponseRateCell.font = { color: { argb: 'FFFFFFFF' }, bold: true, italic: true }; // White text
        }
        // Ensure center alignment for Response Rate cell (numeric column)
        grandTotalPercentageResponseRateCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        
        // Apply legend color to NPS cells in percentage row (Both Predicted and Actual NPS columns)
        // Column structure for groupByBU: Sr.No(1), BU(2), Polled(3), Responded(4), Response%(5), 
        //   Predicted: #Promoters(6), #Passives(7), #Detractors(8), NPS(9),
        //   Actual: #Promoters(10), #Passives(11), #Detractors(12), NPS(13)
        // Column structure for !groupByBU: Sr.No(1), BU(2), Account(3), Polled(4), Responded(5), Response%(6),
        //   Predicted: #Promoters(7), #Passives(8), #Detractors(9), NPS(10),
        //   Actual: #Promoters(11), #Passives(12), #Detractors(13), NPS(14)
        // Predicted NPS cell index: groupByBU ? 9 : 10
        // Actual NPS cell index: groupByBU ? 13 : 14
        const grandTotalPredictedNpsCellIndex = groupByBU ? 9 : 10;
        const grandTotalActualNpsCellIndex = groupByBU ? 13 : 14;
        
        const grandTotalPredictedNpsCell = grandTotalPercentageExcelRow.getCell(grandTotalPredictedNpsCellIndex);
        const grandTotalActualNpsCell = grandTotalPercentageExcelRow.getCell(grandTotalActualNpsCellIndex);
        
        // Parse NPS values (they might be strings with % removed)
        const grandTotalPredictedNpsValue = typeof grandTotalPercentageRow.predictedNpsScore === 'string' 
          ? parseFloat(grandTotalPercentageRow.predictedNpsScore) || 0 
          : (grandTotalPercentageRow.predictedNpsScore || 0);
        const grandTotalActualNpsValue = typeof grandTotalPercentageRow.npsScore === 'string' 
          ? parseFloat(grandTotalPercentageRow.npsScore) || 0 
          : (grandTotalPercentageRow.npsScore || 0);
        
        // Apply color coding to Predicted NPS cell
        if (grandTotalPredictedNpsValue >= 75) {
          grandTotalPredictedNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; // Light Green 2 >=75%
          grandTotalPredictedNpsCell.font = { color: { argb: 'FF000000' }, bold: true, italic: true }; // Black text
        } else if (grandTotalPredictedNpsValue >= 0 && grandTotalPredictedNpsValue < 75) {
          grandTotalPredictedNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Orange 0% to 74.99% - Excel standard
          grandTotalPredictedNpsCell.font = { color: { argb: 'FF000000' }, bold: true, italic: true }; // Black text
        } else {
          grandTotalPredictedNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red <0% - Excel standard
          grandTotalPredictedNpsCell.font = { color: { argb: 'FFFFFFFF' }, bold: true, italic: true }; // White text
        }
        // Ensure center alignment for NPS cell (numeric column)
        grandTotalPredictedNpsCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        
        // Apply color coding to Actual NPS cell
        if (grandTotalActualNpsValue >= 75) {
          grandTotalActualNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; // Light Green 2 >=75%
          grandTotalActualNpsCell.font = { color: { argb: 'FF000000' }, bold: true, italic: true }; // Black text
        } else if (grandTotalActualNpsValue >= 0 && grandTotalActualNpsValue < 75) {
          grandTotalActualNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Orange 0% to 74.99% - Excel standard
          grandTotalActualNpsCell.font = { color: { argb: 'FF000000' }, bold: true, italic: true }; // Black text
        } else {
          grandTotalActualNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red <0% - Excel standard
          grandTotalActualNpsCell.font = { color: { argb: 'FFFFFFFF' }, bold: true, italic: true }; // White text
        }
        // Ensure center alignment for NPS cell (numeric column)
        grandTotalActualNpsCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

        if (includeMainNpsTrendColumns) {
          styleNpsExcelTrendDiffCells(grandTotalPercentageExcelRow, mainTrendFiles, excelTrendCols);
        }
        
        // Set row height for percentage row
        grandTotalPercentageExcelRow.height = 30;
      }

      // Add percentage row below Other Account row (only for Top 10 view)
      if (percentageRow) {
        const percentageRowData = groupByBU
          ? [
              '', // Empty Sr. No. for percentage row
              percentageRow.businessUnit || '',
              '-', // Don't display Polled
              '-', // Don't display Responded
              '-', // Don't display Response %
              percentageRow.predictedPromotersCount,
              percentageRow.predictedPassivesCount,
              percentageRow.predictedDetractorsCount,
              '-', // Don't display NPS for percentage row
              percentageRow.promotersCount,
              percentageRow.passivesCount,
              percentageRow.detractorsCount,
              '-', // Don't display NPS for percentage row
              '-'  // Don't display NPS score for percentage row
            ]
          : [
              '', // Empty Sr. No. for percentage row
              percentageRow.businessUnit || '',
              percentageRow.customerName || '%',
              '-', // Don't display Polled
              '-', // Don't display Responded
              '-', // Don't display Response %
              percentageRow.predictedPromotersCount,
              percentageRow.predictedPassivesCount,
              percentageRow.predictedDetractorsCount,
              '-', // Don't display NPS for percentage row
              percentageRow.promotersCount,
              percentageRow.passivesCount,
              percentageRow.detractorsCount,
              '-', // Don't display NPS for percentage row
              '-'  // Don't display NPS score for percentage row
            ];

        const percentageExcelRow = worksheet.addRow(percentageRowData);
        
        // Apply word wrapping and alignment to all cells in the percentage row
        percentageExcelRow.eachCell((cell, colNumber) => {
          // Text columns (Sr. No., Business Unit, Customer Name) - left align
          // Numeric columns - center align
          const isTextColumn = colNumber === 1 || colNumber === 2 || (!groupByBU && colNumber === 3);
          cell.alignment = {
            horizontal: isTextColumn ? 'left' : 'center',
            vertical: 'middle',
            wrapText: true
          };
          cell.font = { bold: true, italic: true };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } }; // Light Yellow 2 background (Excel standard)
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
        });
        
        // Apply blue background to Response % and NPS cells (same as dashboard)
        // Column structure for groupByBU: Sr.No(1), BU(2), Polled(3), Responded(4), Response%(5), 
        //   Predicted: #Promoters(6), #Passives(7), #Detractors(8), NPS(9),
        //   Actual: #Promoters(10), #Passives(11), #Detractors(12), NPS(13)
        // Column structure for !groupByBU: Sr.No(1), BU(2), Account(3), Polled(4), Responded(5), Response%(6),
        //   Predicted: #Promoters(7), #Passives(8), #Detractors(9), NPS(10),
        //   Actual: #Promoters(11), #Passives(12), #Detractors(13), NPS(14)
        const responseRateColumnNumber = groupByBU ? 5 : 6;
        const predictedNpsColumnNumber = groupByBU ? 9 : 10;
        const actualNpsColumnNumber = groupByBU ? 13 : 14;
        
        const responseRateCell = percentageExcelRow.getCell(responseRateColumnNumber);
        const predictedNpsCell = percentageExcelRow.getCell(predictedNpsColumnNumber);
        const actualNpsCell = percentageExcelRow.getCell(actualNpsColumnNumber);
        
        // Apply yellow background (same as dashboard)
        responseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } }; // Light Yellow 2
        responseRateCell.font = { bold: true, italic: true, color: { argb: 'FF000000' } };
        responseRateCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        
        predictedNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } }; // Light Yellow 2
        predictedNpsCell.font = { bold: true, italic: true, color: { argb: 'FF000000' } };
        predictedNpsCell.numFmt = '0.00'; // Format to show 2 decimal places
        predictedNpsCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        
        actualNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } }; // Light Yellow 2
        actualNpsCell.font = { bold: true, italic: true, color: { argb: 'FF000000' } };
        actualNpsCell.numFmt = '0.00'; // Format to show 2 decimal places
        actualNpsCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        
        // Set row height for percentage row
        percentageExcelRow.height = 30;
      }
      
      // Add Other Account percentage row below Other Account row (only for Top 10 view)
      if (otherAccountPercentageRow) {
        const otherAccountPercentageRowData = groupByBU
          ? [
              '', // Empty Sr. No. for Other Account percentage row
              otherAccountPercentageRow.businessUnit || '',
              otherAccountPercentageRow.sentCount,
              otherAccountPercentageRow.receivedCount,
              typeof otherAccountPercentageRow.responseRate === 'number' ? (Math.round(otherAccountPercentageRow.responseRate * 10) / 10).toFixed(1) + '%' : otherAccountPercentageRow.responseRate,
              otherAccountPercentageRow.predictedPromotersCount,
              otherAccountPercentageRow.predictedPassivesCount,
              otherAccountPercentageRow.predictedDetractorsCount,
              otherAccountPercentageRow.predictedNpsScore,
              otherAccountPercentageRow.promotersCount,
              otherAccountPercentageRow.passivesCount,
              otherAccountPercentageRow.detractorsCount,
              otherAccountPercentageRow.npsScore
            ]
          : [
              '', // Empty Sr. No. for Other Account percentage row
              otherAccountPercentageRow.businessUnit || '',
              otherAccountPercentageRow.customerName || '%',
              otherAccountPercentageRow.sentCount,
              otherAccountPercentageRow.receivedCount,
              '-', // Don't display Response % for percentage row
              otherAccountPercentageRow.predictedPromotersCount,
              otherAccountPercentageRow.predictedPassivesCount,
              otherAccountPercentageRow.predictedDetractorsCount,
              '-', // Don't display NPS for percentage row
              otherAccountPercentageRow.promotersCount,
              otherAccountPercentageRow.passivesCount,
              otherAccountPercentageRow.detractorsCount,
              '-', // Don't display NPS for percentage row
              '-'  // Don't display NPS score for percentage row
            ];

        const otherAccountPercentageExcelRow = worksheet.addRow(otherAccountPercentageRowData);
        
        // Apply word wrapping and alignment to all cells in the Other Account percentage row
        otherAccountPercentageExcelRow.eachCell((cell, colNumber) => {
          // Text columns (Sr. No., Business Unit, Customer Name) - left align
          // Numeric columns - center align
          const isTextColumn = colNumber === 1 || colNumber === 2 || (!groupByBU && colNumber === 3);
          cell.alignment = {
            horizontal: isTextColumn ? 'left' : 'center',
            vertical: 'middle',
            wrapText: true
          };
          cell.font = { bold: true, italic: true };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB4C6E7' } };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
        });
        
        // Apply blue background to Response % and NPS cells (same as dashboard)
        // Column structure for groupByBU: Sr.No(1), BU(2), Polled(3), Responded(4), Response%(5), 
        //   Predicted: #Promoters(6), #Passives(7), #Detractors(8), NPS(9),
        //   Actual: #Promoters(10), #Passives(11), #Detractors(12), NPS(13)
        // Column structure for !groupByBU: Sr.No(1), BU(2), Account(3), Polled(4), Responded(5), Response%(6),
        //   Predicted: #Promoters(7), #Passives(8), #Detractors(9), NPS(10),
        //   Actual: #Promoters(11), #Passives(12), #Detractors(13), NPS(14)
        const otherResponseRateColumnNumber = groupByBU ? 5 : 6;
        const otherPredictedNpsColumnNumber = groupByBU ? 9 : 10;
        const otherActualNpsColumnNumber = groupByBU ? 13 : 14;
        
        const otherResponseRateCell = otherAccountPercentageExcelRow.getCell(otherResponseRateColumnNumber);
        const otherPredictedNpsCell = otherAccountPercentageExcelRow.getCell(otherPredictedNpsColumnNumber);
        const otherActualNpsCell = otherAccountPercentageExcelRow.getCell(otherActualNpsColumnNumber);
        
        // Apply blue background (same as dashboard)
        otherResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB4C6E7' } }; // Light Blue 2
        otherResponseRateCell.font = { bold: true, italic: true, color: { argb: 'FF000000' } };
        otherResponseRateCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        
        otherPredictedNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB4C6E7' } }; // Light Blue 2
        otherPredictedNpsCell.font = { bold: true, italic: true, color: { argb: 'FF000000' } };
        otherPredictedNpsCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        
        otherActualNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB4C6E7' } }; // Light Blue 2
        otherActualNpsCell.font = { bold: true, italic: true, color: { argb: 'FF000000' } };
        otherActualNpsCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        
        // Set row height for Other Account percentage row
        otherAccountPercentageExcelRow.height = 30;
      }
      
      // Add Overall row below Other Account percentage row (only for Top 10 view)
      if (overallRow) {
        const overallRowData = groupByBU
          ? [
              '', // Empty Sr. No. for Overall row
              overallRow.businessUnit || '',
              overallRow.sentCount,
              overallRow.receivedCount,
              typeof overallRow.responseRate === 'number' ? (Math.round(overallRow.responseRate * 10) / 10).toFixed(1) + '%' : overallRow.responseRate,
              overallRow.predictedPromotersCount,
              overallRow.predictedPassivesCount,
              overallRow.predictedDetractorsCount,
              typeof overallRow.predictedNpsScore === 'number' ? parseFloat((Math.round(overallRow.predictedNpsScore * 100) / 100).toFixed(2)) : overallRow.predictedNpsScore,
              overallRow.promotersCount,
              overallRow.passivesCount,
              overallRow.detractorsCount,
              typeof overallRow.npsScore === 'number' ? parseFloat((Math.round(overallRow.npsScore * 100) / 100).toFixed(2)) : overallRow.npsScore
            ]
          : [
              '', // Empty Sr. No. for Overall row
              overallRow.businessUnit || '',
              overallRow.customerName || 'Overall',
              overallRow.sentCount,
              overallRow.receivedCount,
              typeof overallRow.responseRate === 'number' ? (Math.round(overallRow.responseRate * 10) / 10).toFixed(1) + '%' : overallRow.responseRate,
              overallRow.predictedPromotersCount,
              overallRow.predictedPassivesCount,
              overallRow.predictedDetractorsCount,
              typeof overallRow.predictedNpsScore === 'number' ? parseFloat((Math.round(overallRow.predictedNpsScore * 100) / 100).toFixed(2)) : overallRow.predictedNpsScore,
              overallRow.promotersCount,
              overallRow.passivesCount,
              overallRow.detractorsCount,
              typeof overallRow.npsScore === 'number' ? parseFloat((Math.round(overallRow.npsScore * 100) / 100).toFixed(2)) : overallRow.npsScore,
              overallRow.receivedCount === 0 ? '-' : (overallRow.npsAvgRating == null ? '-' : parseFloat((Math.round(Number(overallRow.npsAvgRating) * 100) / 100).toFixed(2)))
            ];

        const overallExcelRow = worksheet.addRow(overallRowData);
        
        // Apply word wrapping and alignment to all cells in the Overall row
        overallExcelRow.eachCell((cell, colNumber) => {
          // Text columns (Sr. No., Business Unit, Customer Name) - left align
          // Numeric columns - center align
          const isTextColumn = colNumber === 1 || colNumber === 2 || (!groupByBU && colNumber === 3);
          cell.alignment = {
            horizontal: isTextColumn ? 'left' : 'center',
            vertical: 'middle',
            wrapText: true
          };
          cell.font = { bold: true };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D2E9' } };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
        });
        
        // Style Response Rate cell for Overall row
        const overallResponseRateColumnNumber = groupByBU ? 5 : 6;
        const overallResponseRateCell = overallExcelRow.getCell(overallResponseRateColumnNumber);
        const overallResponseRate = overallRow.responseRate || 0;
        if (overallRow.receivedCount === 0 || overallResponseRate === 0) {
          // For zero Response %, use Red color
          overallResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red for zero Response %
          overallResponseRateCell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; // White text
        } else if (overallResponseRate >= 75) {
          overallResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; // Light Green 2 >=75%
          overallResponseRateCell.font = { color: { argb: 'FF000000' }, bold: true };
        } else if (overallResponseRate >= 50 && overallResponseRate < 75) {
          overallResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Orange 50%-75%
          overallResponseRateCell.font = { color: { argb: 'FF000000' }, bold: true };
        } else {
          overallResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red <50%
          overallResponseRateCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        }
        overallResponseRateCell.numFmt = '0.0"%"';
        overallResponseRateCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        
        // Style NPS cells for Overall row
        const overallPredictedNpsColumnNumber = groupByBU ? 9 : 10;
        const overallActualNpsColumnNumber = groupByBU ? 13 : 14;
        const overallPredictedNpsCell = overallExcelRow.getCell(overallPredictedNpsColumnNumber);
        const overallActualNpsCell = overallExcelRow.getCell(overallActualNpsColumnNumber);
        
        // Check if values should be '-' based on receivedCount
        const overallPredictedNpsScore = overallRow.receivedCount === 0 ? '-' : overallRow.predictedNpsScore;
        const overallActualNpsScore = overallRow.receivedCount === 0 ? '-' : overallRow.npsScore;
        
        // Style Predicted NPS cell
        // Check if overallPredictedNpsScore is '-' or null/undefined before applying color
        if (overallPredictedNpsScore !== '-' && overallPredictedNpsScore !== null && overallPredictedNpsScore !== undefined && !isNaN(parseFloat(overallPredictedNpsScore))) {
          const score = parseFloat(overallPredictedNpsScore);
          if (score >= 75) {
            overallPredictedNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; // Light Green 2 >=75%
            overallPredictedNpsCell.font = { color: { argb: 'FF000000' }, bold: true };
          } else if (score >= 0 && score < 75) {
            overallPredictedNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Orange 0% to 74.99%
            overallPredictedNpsCell.font = { color: { argb: 'FF000000' }, bold: true };
          } else {
            overallPredictedNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red <0%
            overallPredictedNpsCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
          }
          overallPredictedNpsCell.numFmt = '0.00';
        } else {
          // No color for '-' or null/undefined values
          overallPredictedNpsCell.font = { color: { argb: 'FF000000' }, bold: true }; // Default black text
        }
        overallPredictedNpsCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        
        // Style Actual NPS cell
        // Check if overallActualNpsScore is '-' or null/undefined before applying color
        if (overallActualNpsScore !== '-' && overallActualNpsScore !== null && overallActualNpsScore !== undefined && !isNaN(parseFloat(overallActualNpsScore))) {
          const score = parseFloat(overallActualNpsScore);
          if (score >= 75) {
            overallActualNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; // Light Green 2 >=75%
            overallActualNpsCell.font = { color: { argb: 'FF000000' }, bold: true };
          } else if (score >= 0 && score < 75) {
            overallActualNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Orange 0% to 74.99%
            overallActualNpsCell.font = { color: { argb: 'FF000000' }, bold: true };
          } else {
            overallActualNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red <0%
            overallActualNpsCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
          }
          overallActualNpsCell.numFmt = '0.00';
        } else {
          // No color for '-' or null/undefined values
          overallActualNpsCell.font = { color: { argb: 'FF000000' }, bold: true }; // Default black text
        }
        overallActualNpsCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        
        // Set row height for Overall row
        overallExcelRow.height = 30;
      }
      
      // Add Overall percentage row below Overall row (only for Top 10 view)
      if (overallPercentageRow) {
        const overallPercentageRowData = groupByBU
          ? [
              '', // Empty Sr. No. for Overall percentage row
              overallPercentageRow.businessUnit || '',
              overallPercentageRow.sentCount,
              overallPercentageRow.receivedCount,
              overallPercentageRow.responseRate,
              overallPercentageRow.predictedPromotersCount,
              overallPercentageRow.predictedPassivesCount,
              overallPercentageRow.predictedDetractorsCount,
              overallPercentageRow.predictedNpsScore,
              overallPercentageRow.promotersCount,
              overallPercentageRow.passivesCount,
              overallPercentageRow.detractorsCount,
              overallPercentageRow.npsScore
            ]
          : [
              '', // Empty Sr. No. for Overall percentage row
              overallPercentageRow.businessUnit || '',
              overallPercentageRow.customerName || '%',
              overallPercentageRow.sentCount,
              overallPercentageRow.receivedCount,
              overallPercentageRow.responseRate,
              overallPercentageRow.predictedPromotersCount,
              overallPercentageRow.predictedPassivesCount,
              overallPercentageRow.predictedDetractorsCount,
              overallPercentageRow.predictedNpsScore,
              overallPercentageRow.promotersCount,
              overallPercentageRow.passivesCount,
              overallPercentageRow.detractorsCount,
              overallPercentageRow.npsScore,
              '-' // Don't display NPS score for percentage row
            ];

        const overallPercentageExcelRow = worksheet.addRow(overallPercentageRowData);
        
        // Apply word wrapping and alignment to all cells in the Overall percentage row
        overallPercentageExcelRow.eachCell((cell, colNumber) => {
          // Text columns (Sr. No., Business Unit, Customer Name) - left align
          // Numeric columns - center align
          const isTextColumn = colNumber === 1 || colNumber === 2 || (!groupByBU && colNumber === 3);
          cell.alignment = {
            horizontal: isTextColumn ? 'left' : 'center',
            vertical: 'middle',
            wrapText: true
          };
          cell.font = { bold: true, italic: true };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D2E9' } }; // Light Purple 3 background (Excel standard)
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
        });
        
        // Apply magenta background to Response % and NPS cells (same as dashboard)
        const overallPercentageResponseRateColumnNumber = groupByBU ? 5 : 6;
        const overallPercentagePredictedNpsColumnNumber = groupByBU ? 9 : 10;
        const overallPercentageActualNpsColumnNumber = groupByBU ? 13 : 14;
        
        const overallPercentageResponseRateCell = overallPercentageExcelRow.getCell(overallPercentageResponseRateColumnNumber);
        const overallPercentagePredictedNpsCell = overallPercentageExcelRow.getCell(overallPercentagePredictedNpsColumnNumber);
        const overallPercentageActualNpsCell = overallPercentageExcelRow.getCell(overallPercentageActualNpsColumnNumber);
        
        // Apply purple background (same as dashboard)
        overallPercentageResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D2E9' } }; // Light Purple 3
        overallPercentageResponseRateCell.font = { bold: true, italic: true, color: { argb: 'FF000000' } };
        overallPercentageResponseRateCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        
        overallPercentagePredictedNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D2E9' } }; // Light Purple 3
        overallPercentagePredictedNpsCell.font = { bold: true, italic: true, color: { argb: 'FF000000' } };
        overallPercentagePredictedNpsCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        
        overallPercentageActualNpsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D2E9' } }; // Light Purple 3
        overallPercentageActualNpsCell.font = { bold: true, italic: true, color: { argb: 'FF000000' } };
        overallPercentageActualNpsCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        
        // Set row height for Overall percentage row
        overallPercentageExcelRow.height = 30;
      }

      // Add NPS Calculation Formula section
      const formulaStartRow = (regularData.length + (grandTotal ? 1 : 0) + (percentageRow ? 1 : 0) + (otherAccount ? 1 : 0) + (otherAccountPercentageRow ? 1 : 0) + (overallRow ? 1 : 0) + (overallPercentageRow ? 1 : 0)) + 3;
      
      // Add title
      const formulaTitleRow = worksheet.addRow(['NPS Calculation Formula']);
      formulaTitleRow.getCell(1).font = { bold: true, size: 14, color: { argb: 'FF2D3748' } };
      formulaTitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7FAFC' } };
      
      // Add formula
      const formulaRow = worksheet.addRow(['NPS = (#Promoters - # Detractors) / Responded × 100']);
      formulaRow.getCell(1).font = { bold: true, color: { argb: 'FF4A5568' } };
      
      // Add breakdown
      worksheet.addRow(['Where:']);
      worksheet.addRow(['• Promoters: Customers who gave ratings 9 or 10']);
      worksheet.addRow(['• Detractors: Customers who gave ratings less than 7']);
      worksheet.addRow(['• Responded: Count of CSAT RECEIVED DATE from CSAT received Report']);
      
      // Add legend
      const legendStartRow = formulaStartRow + 6;
      worksheet.addRow(['NPS Score Legend:']);
      const legendTitleRow = worksheet.getRow(legendStartRow);
      legendTitleRow.getCell(1).font = { bold: true, color: { argb: 'FF2D3748' } };
      
      const legendRow1 = worksheet.addRow(['Green: ≥75%', 'Orange: 0% to 74.99%', 'Red: <0%']);
      legendRow1.eachCell((cell, colNumber) => {
        cell.font = { size: 9, bold: true };
        if (colNumber === 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
          cell.font.color = { argb: 'FF000000' };
        } else if (colNumber === 2) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
          cell.font.color = { argb: 'FF000000' };
        } else if (colNumber === 3) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
          cell.font.color = { argb: 'FFFFFFFF' };
        }
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
        cell.alignment = { horizontal: 'left' };
      });

      // Add NPS Dashboard Summary section
      worksheet.addRow([]);
      worksheet.addRow([]);
      
      // Record the start row for the summary section
      const summaryStartRow = worksheet.lastRow.number + 1;
      
      // NPS Dashboard Summary Title
      const summaryTitleRow = worksheet.addRow(['📊 NPS Dashboard Summary']);
      const summaryTitleRowNum = summaryTitleRow.number;
      summaryTitleRow.getCell(1).font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
      summaryTitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } }; // Navy blue
      summaryTitleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      summaryTitleRow.height = 45;
      worksheet.mergeCells(`A${summaryTitleRowNum}:F${summaryTitleRowNum}`);

      // Add Achieved NPS Score
      worksheet.addRow([]);
      const achievedNPSTitleRow = worksheet.addRow(['🎯 Achieved NPS Score']);
      const achievedNPSTitleRowNum = achievedNPSTitleRow.number;
      achievedNPSTitleRow.getCell(1).font = { bold: true, size: 14, color: { argb: 'FF059669' } };
      achievedNPSTitleRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      achievedNPSTitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } };
      achievedNPSTitleRow.height = 35;
      worksheet.mergeCells(`A${achievedNPSTitleRowNum}:F${achievedNPSTitleRowNum}`);
      
      const achievedNPSValueRow = worksheet.addRow([`${processedData.summary?.achievedNPSScore !== undefined && processedData.summary?.achievedNPSScore !== null 
        ? (Math.round(processedData.summary.achievedNPSScore * 100) / 100).toFixed(2) 
        : '0.00'}`]);
      const achievedNPSValueRowNum = achievedNPSValueRow.number;
      const achievedNPSScore = processedData.summary?.achievedNPSScore || 0;
      
      // Apply color coding based on NPS score
      let npsValueBgColor = 'FFF9FAFB'; // Default light gray
      let npsValueTextColor = 'FF6B7280'; // Default gray text
      
      if (achievedNPSScore >= 75) {
        // Light Green 2: ≥75% (Great) - Black text - Excel standard
        npsValueBgColor = 'FFC6EFCE';
        npsValueTextColor = 'FF000000';
      } else if (achievedNPSScore >= 0 && achievedNPSScore < 75) {
        // Orange: 0% to 75% (Good) - Black text - Excel standard
        npsValueBgColor = 'FFFFA500';
        npsValueTextColor = 'FF000000';
      } else if (achievedNPSScore < 0) {
        // Red: <0% (Needs Attention) - White text - Excel standard
        npsValueBgColor = 'FFFF0000';
        npsValueTextColor = 'FFFFFFFF';
      }
      
      achievedNPSValueRow.getCell(1).font = { bold: true, size: 14, color: { argb: npsValueTextColor } };
      achievedNPSValueRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      achievedNPSValueRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: npsValueBgColor } };
      achievedNPSValueRow.height = 30;
      worksheet.mergeCells(`A${achievedNPSValueRowNum}:F${achievedNPSValueRowNum}`);
      
      const achievedNPSDescRow = worksheet.addRow(['Overall NPS Score based on grand total of all ' + (groupByBU ? 'business units' : 'customers')]);
      const achievedNPSDescRowNum = achievedNPSDescRow.number;
      achievedNPSDescRow.getCell(1).font = { size: 12, color: { argb: 'FF6B7280' } };
      achievedNPSDescRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      achievedNPSDescRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
      achievedNPSDescRow.height = 25;
      worksheet.mergeCells(`A${achievedNPSDescRowNum}:F${achievedNPSDescRowNum}`);


      // Add Top 5 Accounts (only for account-wise data)
      let topAccountsStartRow = null;
      let topAccountsEndRow = null;
      
      if (!groupByBU && processedData.summary?.top5Accounts && processedData.summary.top5Accounts.length > 0) {
        worksheet.addRow([]);
        topAccountsStartRow = worksheet.lastRow.number + 1;
        
        const topAccountsTitleRow = worksheet.addRow(['🏆 Top 5 Accounts (Highest NPS)']);
        const topAccountsTitleRowNum = topAccountsTitleRow.number;
        topAccountsTitleRow.getCell(1).font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
        topAccountsTitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } }; // Navy blue
        topAccountsTitleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        topAccountsTitleRow.height = 35;
        worksheet.mergeCells(`A${topAccountsTitleRowNum}:F${topAccountsTitleRowNum}`);
        
        processedData.summary.top5Accounts.forEach((account, index) => {
          const accountRow = worksheet.addRow([`${account.rank}. ${account.customerName}`, `${(Math.round(account.npsScore * 100) / 100).toFixed(2)}`]);
          const accountRowNum = accountRow.number;
          accountRow.getCell(1).font = { size: 12, color: { argb: 'FF1F2937' } };
          accountRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
          accountRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
          accountRow.getCell(2).font = { bold: true, size: 12, color: { argb: 'FF059669' } };
          accountRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
          accountRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
          accountRow.height = 28;
          worksheet.mergeCells(`A${accountRowNum}:B${accountRowNum}`);
        });
        
        topAccountsEndRow = worksheet.lastRow.number;
      }
      
      // Add blue borders only to the outer edges of the summary section
      const summaryEndRow = topAccountsStartRow ? topAccountsStartRow - 1 : worksheet.lastRow.number;
      
      // Add borders only to the outer perimeter for NPS Dashboard Summary
      for (let rowNum = summaryStartRow; rowNum <= summaryEndRow; rowNum++) {
        const row = worksheet.getRow(rowNum);
        
        // Top and bottom rows get full borders
        if (rowNum === summaryStartRow || rowNum === summaryEndRow) {
          for (let colNum = 1; colNum <= 6; colNum++) {
            const cell = row.getCell(colNum);
            cell.border = {
              top: { style: 'medium', color: { argb: 'FF1D4ED8' } },
              bottom: { style: 'medium', color: { argb: 'FF1D4ED8' } },
              left: { style: 'medium', color: { argb: 'FF1D4ED8' } },
              right: { style: 'medium', color: { argb: 'FF1D4ED8' } }
            };
          }
        } else {
          // Middle rows get only left and right borders
          const leftCell = row.getCell(1);
          const rightCell = row.getCell(6);
          
          leftCell.border = {
            top: { style: 'none' },
            bottom: { style: 'none' },
            left: { style: 'medium', color: { argb: 'FF1D4ED8' } },
            right: { style: 'none' }
          };
          
          rightCell.border = {
            top: { style: 'none' },
            bottom: { style: 'none' },
            left: { style: 'none' },
            right: { style: 'medium', color: { argb: 'FF1D4ED8' } }
          };
        }
      }
      
      // Add blue borders only to the outer edges of the Top 5 Accounts section
      if (topAccountsStartRow && topAccountsEndRow) {
        for (let rowNum = topAccountsStartRow; rowNum <= topAccountsEndRow; rowNum++) {
          const row = worksheet.getRow(rowNum);
          
          // Only the title row gets full borders
          if (rowNum === topAccountsStartRow) {
            for (let colNum = 1; colNum <= 6; colNum++) {
              const cell = row.getCell(colNum);
              cell.border = {
                top: { style: 'medium', color: { argb: 'FF1D4ED8' } },
                bottom: { style: 'medium', color: { argb: 'FF1D4ED8' } },
                left: { style: 'medium', color: { argb: 'FF1D4ED8' } },
                right: { style: 'medium', color: { argb: 'FF1D4ED8' } }
              };
            }
          } else {
            // All account rows (including 5th) get only left and right borders on outer cells
            const leftCell = row.getCell(1);
            const rightCell = row.getCell(6);
            
            // Only add left border to the leftmost cell
            leftCell.border = {
              top: { style: 'none' },
              bottom: { style: 'none' },
              left: { style: 'medium', color: { argb: 'FF1D4ED8' } },
              right: { style: 'none' }
            };
            
            // Only add right border to the rightmost cell
            rightCell.border = {
              top: { style: 'none' },
              bottom: { style: 'none' },
              left: { style: 'none' },
              right: { style: 'medium', color: { argb: 'FF1D4ED8' } }
            };
            
            // Remove any internal borders from middle cells (columns 2-5)
            for (let colNum = 2; colNum <= 5; colNum++) {
              const cell = row.getCell(colNum);
              cell.border = {
                top: { style: 'none' },
                bottom: { style: 'none' },
                left: { style: 'none' },
                right: { style: 'none' }
              };
            }
          }
        }
        
        // Add bottom border to the entire section (last row)
        const lastRow = worksheet.getRow(topAccountsEndRow);
        for (let colNum = 1; colNum <= 6; colNum++) {
          const cell = lastRow.getCell(colNum);
          cell.border = {
            ...cell.border,
            bottom: { style: 'medium', color: { argb: 'FF1D4ED8' } }
          };
        }
      }
      
      // Add extra spacing after the bordered section
      worksheet.addRow([]);
      worksheet.addRow([]);

      // Set column widths
      worksheet.columns = [
        { width: 8 },   // Sr. No.
        { width: 20 },  // Business Unit
        ...(groupByBU ? [] : [{ width: 25 }]), // Customer Name (only for account-wise)
        { width: 20 },  // Polled
        { width: 20 },  // Responded
        { width: 15 },  // Response %
        { width: 15 },  // Predicted #Promoters
        { width: 15 },  // Predicted # Passives
        { width: 15 },  // Predicted # Detractors
        { width: 10 },  // Predicted NPS
        { width: 15 },  // #Promoters
        { width: 15 },  // # Passives
        { width: 15 },  // # Detractors
        { width: 10 }   // NPS
      ];

      // Add NPS Legend to Excel
      worksheet.addRow([]);
      const npsLegendTitleRow = worksheet.addRow(['📊 NPS Score Legend']);
      const npsLegendTitleRowNum = npsLegendTitleRow.number;
      npsLegendTitleRow.getCell(1).font = { bold: true, size: 14, color: { argb: 'FF1D4ED8' } };
      npsLegendTitleRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      npsLegendTitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
      npsLegendTitleRow.height = 35;
      worksheet.mergeCells(`A${npsLegendTitleRowNum}:F${npsLegendTitleRowNum}`);
      
      // Add legend items in separate rows to match dashboard layout
      const legendItem1 = worksheet.addRow(['Green: ≥75%']);
      const legendItem1Num = legendItem1.number;
      legendItem1.getCell(1).font = { size: 12, color: { argb: 'FF000000' }, bold: true }; // Black text for Light Green 2
      legendItem1.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      legendItem1.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; // Light Green 2 >=75% (Great) - Excel standard
      legendItem1.getCell(1).border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
      legendItem1.height = 25;
      worksheet.mergeCells(`A${legendItem1Num}:F${legendItem1Num}`);
      
      const legendItem2 = worksheet.addRow(['Orange: 0% to 74.99%']);
      const legendItem2Num = legendItem2.number;
      legendItem2.getCell(1).font = { size: 12, color: { argb: 'FF000000' }, bold: true }; // Black text for Orange
      legendItem2.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      legendItem2.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Orange 0% to 75% (Good) - Excel standard
      legendItem2.getCell(1).border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
      legendItem2.height = 25;
      worksheet.mergeCells(`A${legendItem2Num}:F${legendItem2Num}`);
      
      const legendItem3 = worksheet.addRow(['Red: <0%']);
      const legendItem3Num = legendItem3.number;
      legendItem3.getCell(1).font = { size: 12, color: { argb: 'FFFFFFFF' }, bold: true }; // White text for Red
      legendItem3.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      legendItem3.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red <0% (Needs Attention) - Excel standard
      legendItem3.getCell(1).border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
      legendItem3.height = 25;
      worksheet.mergeCells(`A${legendItem3Num}:F${legendItem3Num}`);

      const fileName = `NPS_Dashboard_${groupByBU ? 'BU_Wise' : 'Account_Wise'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      console.error('Error stack:', error.stack);
      console.error('Error message:', error.message);
      alert(`Error downloading Excel file: ${error.message || 'Unknown error'}`);
    }
  };

  // Download Chart as Image
  const downloadChartImage = async () => {
    if (!chartRef.current || !showVerticalGraph) {
      alert('No chart available to download');
      return;
    }

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false
      });

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `BU_wise_NPS_Distribution_Chart_${new Date().toISOString().split('T')[0]}.png`;
        link.click();
        window.URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Error downloading chart:', error);
      alert('Error downloading chart image');
    }
  };

  // Download Top 10 Chart as Image
  const downloadTop10ChartImage = async () => {
    if (!top10ChartRef.current || !showTop10Chart) {
      alert('No chart available to download');
      return;
    }

    try {
      const canvas = await html2canvas(top10ChartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false
      });
      
      const link = document.createElement('a');
      link.download = `Top_10_NPS_Distribution_${acsatCycleStartDateFormatted || 'data'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error downloading Top 10 chart image:', error);
      alert('Error downloading chart image');
    }
  };

  // Download Other Account Chart as Image
  const downloadOtherAccountChartImage = async () => {
    if (!otherAccountChartRef.current || !showTop10Chart) {
      alert('No chart available to download');
      return;
    }

    try {
      const canvas = await html2canvas(otherAccountChartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false
      });
      
      const link = document.createElement('a');
      link.download = `Other_Account_NPS_Distribution_${acsatCycleStartDateFormatted || 'data'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error downloading Other Account chart image:', error);
      alert('Error downloading chart image');
    }
  };

  // Download Org Level Chart as Image
  const downloadOrgLevelChartImage = async () => {
    if (!orgLevelChartRef.current || !showVerticalGraph) {
      alert('No chart available to download');
      return;
    }

    try {
      const canvas = await html2canvas(orgLevelChartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false
      });

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Org_Level_NPS_Distribution_Chart_${new Date().toISOString().split('T')[0]}.png`;
        link.click();
        window.URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Error downloading chart:', error);
      alert('Error downloading chart image');
    }
  };

  // Download Respondent Chart as Image
  const downloadRespondentChartImage = async () => {
    if (!respondentChartRef.current || !showRespondedComparison) {
      alert('No chart available to download');
      return;
    }

    try {
      const canvas = await html2canvas(respondentChartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false
      });

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Respondent_Category_NPS_Distribution_Chart_${new Date().toISOString().split('T')[0]}.png`;
        link.click();
        window.URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Error downloading chart:', error);
      alert('Error downloading chart image');
    }
  };

  // Download Donut Chart as Image
  const downloadDonutChartImage = async () => {
    if (!donutChartRef.current || !showRespondedComparison) {
      alert('No chart available to download');
      return;
    }

    try {
      const canvas = await html2canvas(donutChartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false
      });

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Donut_Chart_Respondent_Category_Distribution_${new Date().toISOString().split('T')[0]}.png`;
        link.click();
        window.URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Error downloading donut chart:', error);
      alert('Error downloading donut chart image');
    }
  };

  // Download Pie Chart as Image
  const downloadPieChartImage = async () => {
    if (!pieChartRef.current || !showRespondedComparison) {
      alert('No chart available to download');
      return;
    }

    try {
      const canvas = await html2canvas(pieChartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false
      });

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Pie_Chart_Respondent_Category_Distribution_${new Date().toISOString().split('T')[0]}.png`;
        link.click();
        window.URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Error downloading pie chart:', error);
      alert('Error downloading pie chart image');
    }
  };

  // Download Responded Level Comparison Excel
  const downloadRespondedLevelComparisonExcel = async () => {
    if (!respondentLevelData || respondentLevelData.length === 0) {
      alert('No respondent data to download');
      return;
    }

    try {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Responded Level Comparison');

      // Define columns
      worksheet.columns = [
        { header: 'Sr. No.', key: 'sno', width: 10 },
        { header: 'RESPONDENT CATEGORY', key: 'respondentCategory', width: 25 },
        { header: '#Promoters', key: 'promotersCount', width: 20 },
        { header: 'Promoters %', key: 'promotersPercent', width: 15 },
        { header: 'Number of Passive', key: 'passivesCount', width: 20 },
        { header: 'Passives %', key: 'passivesPercent', width: 15 },
        { header: '# Detractors', key: 'detractorsCount', width: 20 },
        { header: 'Detractors %', key: 'detractorsPercent', width: 15 },
        { header: 'NPS', key: 'npsScore', width: 15 }
      ];

      // Style the header row
      worksheet.getRow(1).eachCell((cell, colNumber) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1e3a8a' }
        };
        cell.font = {
          color: { argb: 'FFFFFFFF' },
          bold: true,
          size: 12
        };
        // Headers should be center-aligned
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Add data
      respondentLevelData.forEach((respondent) => {
        const row = worksheet.addRow({
          sno: respondent.isGrandTotal ? 'Overall' : respondent.sno,
          respondentCategory: respondent.respondentCategory,
          promotersCount: respondent.promotersCount,
          promotersPercent: Math.round((respondent.promotersPercent || 0) * 10) / 10,
          passivesCount: respondent.passivesCount,
          passivesPercent: Math.round((respondent.passivesPercent || 0) * 10) / 10,
          detractorsCount: respondent.detractorsCount,
          detractorsPercent: Math.round((respondent.detractorsPercent || 0) * 10) / 10,
          npsScore: Math.round(respondent.npsScore * 100) / 100
        });

        // Apply styling to data rows
        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          // Text columns (Sr. No.=1, Category=2) - left align, Numeric/% columns (3-9) - center align
          const isTextColumn = colNumber === 1 || colNumber === 2;
          cell.alignment = { horizontal: isTextColumn ? 'left' : 'center', vertical: 'middle', wrapText: true };
          
          // Bold styling for grand total row
          if (respondent.isGrandTotal) {
            cell.font = { bold: true, size: 12 };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
          }
          
          // Style NPS cell based on score
          // NPS column is column 9 (1-indexed: Sr. No.=1, Category=2, Promoters=3, Promoters%=4, Passives=5, Passives%=6, Detractors=7, Detractors%=8, NPS=9)
          if (cell.col === 9) { // NPS column
            const npsValue = cell.value;
            // Apply color coding: Light Green 2 ≥75% (black text), Amber 0% to 75% (black text), Red <0% (white text)
            if (npsValue >= 75) {
              // Light Green 2: ≥75% (Great) - Black text - Excel standard
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
              cell.font = { ...cell.font, color: { argb: 'FF000000' }, bold: true };
            } else if (npsValue >= 0 && npsValue < 75) {
              // Orange: 0% to 75% (Good) - Black text - Excel standard
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
              cell.font = { ...cell.font, color: { argb: 'FF000000' }, bold: true };
            } else {
              // Red: <0% (Needs Attention) - White text - Excel standard
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
              cell.font = { ...cell.font, color: { argb: 'FFFFFFFF' }, bold: true };
            }
          }
        });
      });

      // Add information rows
      worksheet.addRow([]);
      worksheet.addRow(['NPS Calculation Formula: (#Promoters - # Detractors) ÷ Responded × 100']);
      worksheet.addRow(['Promoters: Ratings of 9 or 10 for perspective "NPS"']);
      worksheet.addRow(['Detractors: Ratings less than 7 for perspective "NPS"']);
      worksheet.addRow([`Date Filter: CSAT SENT DATE and CSAT RECEIVED DATE ≥ ${acsatCycleStartDateFormatted}`]);
      worksheet.addRow([`Data Source: CSAT sent and received Report`]);
      worksheet.addRow([]);
      worksheet.addRow(['NPS Score Legend:']);
      const legendRow1 = worksheet.addRow(['Green: ≥75%', 'Orange: 0% to 74.99%', 'Red: <0%']);
      legendRow1.eachCell((cell, colNumber) => {
        cell.font = { size: 9, bold: true };
        if (colNumber === 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
          cell.font.color = { argb: 'FF000000' };
        } else if (colNumber === 2) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
          cell.font.color = { argb: 'FF000000' };
        } else if (colNumber === 3) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
          cell.font.color = { argb: 'FFFFFFFF' };
        }
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
        cell.alignment = { horizontal: 'left' };
      });

      // Save the file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Responded_Level_Comparison_${acsatCycleStartDateFormatted || 'data'}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Responded Level Comparison Excel:', error);
      alert('Error downloading Excel file');
    }
  };

  return (
    <DashboardContainer>
      <Header>
        <Title>📊 {showTop10 ? 'Top 10 Accounts-NPS' : 'NPS Dashboard'}</Title>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem', minWidth: '220px' }}>
            <BackButton onClick={onBack}>← Back to ACSAT</BackButton>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <ToggleButton 
            active={!groupByBU && !showTop10 && !showRespondedComparison && !showVerticalGraph}
            onClick={() => {
              setGroupByBU(false);
              setShowTop10(false);
              setShowRespondedComparison(false);
              setShowVerticalGraph(false);
            }}
          >
            👥 Show by Account
          </ToggleButton>
          <ToggleButton 
            active={groupByBU && !showTop10 && !showRespondedComparison && !showVerticalGraph}
            onClick={() => {
              setGroupByBU(true);
              setShowTop10(false);
              setShowRespondedComparison(false);
              setShowVerticalGraph(false);
            }}
          >
            🏢 Show by BU Only
          </ToggleButton>
          <ToggleButton 
            active={showTop10 && !showRespondedComparison && !showVerticalGraph}
            onClick={() => {
              const newShowTop10 = !showTop10;
              setShowTop10(newShowTop10);
              setShowTop10Chart(newShowTop10); // Show chart when Top 10 is active
              setShowRespondedComparison(false);
              setShowVerticalGraph(false);
              // If switching to Top 10 view, turn off Business Unit view (show customer data)
              if (newShowTop10) {
                setGroupByBU(false);
              }
            }}
          >
            🏆 Top 10 account -NPS
          </ToggleButton>
          <ToggleButton 
            active={showRespondedComparison}
            onClick={() => {
              setShowRespondedComparison(!showRespondedComparison);
              setShowVerticalGraph(false);
              if (!showRespondedComparison) {
                // When turning off Responded Comparison, don't change other view settings
                setGroupByBU(false);
                setShowTop10(false);
              }
            }}
          >
            📊 Responded Level Comparison
          </ToggleButton>
          {groupByBU && (
          <ToggleButton 
            active={showVerticalGraph && groupByBU}
            onClick={() => {
              setShowVerticalGraph(!showVerticalGraph);
              setShowRespondedComparison(false);
              // Enable BU view when showing graph
              if (!showVerticalGraph) {
                setGroupByBU(true);
              }
            }}
          >
            📊 Vertical Graph
          </ToggleButton>
          )}
          {showRespondedComparison ? (
            <DownloadButton onClick={downloadRespondedLevelComparisonExcel}>
              📥 Download Responded Comparison
            </DownloadButton>
          ) : (
          <DownloadButton onClick={downloadExcel}>
            📥 Download Excel
          </DownloadButton>
          )}
          <TrendAnalysisButton type="button" onClick={handleViewAcsatTrendAnalysis} style={{ width: 'auto', minWidth: '220px' }}>
            <TrendingUp size={16} />
            View ACSAT trend analysis
          </TrendAnalysisButton>
        </div>
        
        {acsatCycleStartDateFormatted && (
          <div style={{ 
            marginTop: '0.5rem', 
            fontSize: '0.875rem', 
            color: '#6b7280',
            fontWeight: '500'
          }}>
            📅 CSAT Cycle Start Date: {acsatCycleStartDateFormatted}
          </div>
        )}
        
        {processedData.data.length > 0 && (
          <SuccessMessage>
            ✅ Data loaded successfully! Showing {processedData.data.length} {showTop10 ? 'top 10 accounts' : (groupByBU ? 'business units' : 'customers')}
          </SuccessMessage>
        )}

        {!showRespondedComparison && (
        <NPSFormulaContainer>
          <FormulaTitle>📈 NPS Calculation Formula</FormulaTitle>
          <FormulaText>
            <strong>NPS = (#Promoters - # Detractors) ÷ Responded × 100</strong>
          </FormulaText>
          
          <FormulaBreakdown>
            <FormulaItem>
              <FormulaItemTitle>🎯 Promoters</FormulaItemTitle>
              <FormulaItemText>Customers who gave ratings of 9 or 10 for NPS perspective</FormulaItemText>
            </FormulaItem>
            
            <FormulaItem>
              <FormulaItemTitle>😞 Detractors</FormulaItemTitle>
              <FormulaItemText>Customers who gave ratings less than 7 for NPS perspective</FormulaItemText>
            </FormulaItem>
            
            <FormulaItem>
              <FormulaItemTitle>📊 Total Surveys Sent</FormulaItemTitle>
              <FormulaItemText>Count of CSAT SENT DATE from CSAT sent and received Report</FormulaItemText>
            </FormulaItem>
            
            <FormulaItem>
              <FormulaItemTitle>📈 Score Interpretation</FormulaItemTitle>
              <FormulaItemText>
                <span style={{color: '#155724', fontWeight: '600'}}>≥50: Excellent</span> | 
                <span style={{color: '#856404', fontWeight: '600'}}> 0-49: Good</span> | 
                <span style={{color: '#721c24', fontWeight: '600'}}> &lt;0: Poor</span>
              </FormulaItemText>
            </FormulaItem>
          </FormulaBreakdown>
        </NPSFormulaContainer>
        )}
      </Header>

      {/* Search box - only show for account-wise view */}
      {!showRespondedComparison && !groupByBU && processedData.data.length > 0 && (
        <SearchContainer>
          <SearchLabel>🔍 Search Customer:</SearchLabel>
          <SearchInputContainer>
            <SearchInput
              type="text"
              placeholder={showTop10 ? "Search by top 10 account name..." : "Enter customer name or ID..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <InlineClearButton onClick={() => setSearchTerm('')} title="Clear search">
                ✕
              </InlineClearButton>
            )}
          </SearchInputContainer>
          {searchTerm && (
            <ClearButton onClick={() => setSearchTerm('')} title="Clear search">
              ✕ Clear
            </ClearButton>
          )}
        </SearchContainer>
      )}

      {/* Search results counter */}
      {!groupByBU && searchTerm && processedData.data.length > 0 && (
        <div style={{ 
          textAlign: 'center', 
          margin: '0.5rem 0', 
          fontSize: '0.875rem', 
          color: '#6b7280',
          fontWeight: '500'
        }}>
          Found {processedData.data.length} {showTop10 ? 'top 10 account' : 'customer'}{processedData.data.length !== 1 ? 's' : ''} matching "{searchTerm}"
        </div>
      )}

      {/* NPS Legend - Moved above the table */}
      {!showRespondedComparison && (
      <LegendContainer>
        <LegendTitle>NPS Score Legend</LegendTitle>
        <LegendItem>
          <LegendColor color="#C6EFCE" />
              <LegendText>Green: ≥75%</LegendText>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#FFA500" />
          <LegendText>Orange: 0% to 74.99%</LegendText>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#FF0000" />
          <LegendText>Red: &lt;0%</LegendText>
        </LegendItem>
      </LegendContainer>
      )}

      {/* Vertical Graph for BU-wise */}
      {showVerticalGraph && groupByBU && chartData.length > 0 && (
        <ChartContainer ref={chartRef}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid #e5e7eb' }}>
            <ChartTitle style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>📊 BU-wise NPS Distribution</ChartTitle>
            <button
              onClick={downloadChartImage}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              📥 Download Chart
            </button>
          </div>
          <ResponsiveContainer width="100%" height={650}>
            <BarChart data={chartData} margin={{ top: 40, right: 50, left: 50, bottom: 120 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end"
                height={120}
                interval={0}
                tick={{ fontSize: 14, fill: '#374151', fontWeight: '600' }}
                label={{ value: 'Business Unit', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fontSize: '16px', fontWeight: '700', fill: '#1f2937' } }}
              />
              <YAxis 
                domain={[0, 100]}
                type="number"
                allowDataOverflow={false}
                tick={{ fontSize: 14, fill: '#374151', fontWeight: '600' }}
                label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '16px', fontWeight: '700', fill: '#1f2937' } }}
                ticks={[0, 20, 40, 60, 80, 100]}
              />
              <Tooltip 
                formatter={(value, name) => [`${value.toFixed(1)}%`, name]}
                labelStyle={{ color: '#000', fontWeight: 'bold', fontSize: '14px' }}
                contentStyle={{ backgroundColor: '#fff', border: '2px solid #3b82f6', borderRadius: '8px', fontSize: '14px', fontWeight: '600', padding: '10px' }}
              />
              {/* Order: Promoters (bottom), Passives (middle), Detractors (top) */}
              <Bar 
                dataKey="promotersPercent" 
                stackId="a" 
                fill="#C6EFCE" 
                name="Promoters %"
                isAnimationActive={false}
                barSize={80}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-promoters-${index}`} fill="#C6EFCE" />
                ))}
                <LabelList 
                  key="promoters-labels"
                  content={(props) => <CustomLabelWithData {...props} dataKey="promotersPercent" chartData={chartData} />} 
                />
              </Bar>
              <Bar 
                dataKey="passivesPercent" 
                stackId="a" 
                fill="#FFA500" 
                name="Passives %"
                isAnimationActive={false}
                barSize={80}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-passives-${index}`} fill="#FFA500" />
                ))}
                <LabelList 
                  key="passives-labels"
                  content={(props) => <CustomLabelWithData {...props} dataKey="passivesPercent" chartData={chartData} />} 
                />
              </Bar>
              <Bar 
                dataKey="detractorsPercent" 
                stackId="a" 
                fill="#FF0000" 
                name="Detractors %"
                isAnimationActive={false}
                barSize={80}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-detractors-${index}`} fill="#FF0000" />
                ))}
                <LabelList 
                  key="detractors-labels"
                  content={(props) => <CustomLabelWithData {...props} dataKey="detractorsPercent" chartData={chartData} />} 
                />
              </Bar>
              {/* Hidden bar to show NPS label below the stacked bars */}
              <Bar 
                dataKey={(data) => data.promotersPercent + data.passivesPercent + data.detractorsPercent}
                stackId="a"
                fill="transparent"
                name="NPS"
                stroke="none"
              >
                <LabelList 
                  content={(props) => <NPSLabelWithData {...props} chartData={chartData} />} 
                  position="bottom" 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          
          {/* Legend for BU-wise NPS Distribution */}
          <ChartLegend style={{ marginTop: '1.5rem', justifyContent: 'center' }}>
            <ChartLegendItem>
              <ChartLegendColor style={{ backgroundColor: '#C6EFCE' }} />
              <ChartLegendText>Promoters % (Green)</ChartLegendText>
            </ChartLegendItem>
            <ChartLegendItem>
              <ChartLegendColor style={{ backgroundColor: '#FFA500' }} />
              <ChartLegendText>Passives % (Orange)</ChartLegendText>
            </ChartLegendItem>
            <ChartLegendItem>
              <ChartLegendColor style={{ backgroundColor: '#FF0000' }} />
              <ChartLegendText>Detractors % (Red)</ChartLegendText>
            </ChartLegendItem>
          </ChartLegend>
        </ChartContainer>
      )}

      {/* Vertical Graph for Org Level - NPS Distribution */}
      {showVerticalGraph && groupByBU && orgLevelChartData.length > 0 && (
        <ChartContainer ref={orgLevelChartRef}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid #e5e7eb' }}>
            <ChartTitle style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>📊 Org Level - NPS Distribution</ChartTitle>
            <button
              onClick={downloadOrgLevelChartImage}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              📥 Download Chart
            </button>
          </div>
          <ResponsiveContainer width="100%" height={650}>
            <BarChart data={orgLevelChartData} margin={{ top: 40, right: 50, left: 50, bottom: 120 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 14, fill: '#374151', fontWeight: '600' }}
              />
              <YAxis 
                domain={[0, 100]}
                type="number"
                allowDataOverflow={false}
                tick={{ fontSize: 14, fill: '#374151', fontWeight: '600' }}
                label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '16px', fontWeight: '700', fill: '#1f2937' } }}
                ticks={[0, 20, 40, 60, 80, 100]}
              />
              <Tooltip 
                formatter={(value, name) => [`${value.toFixed(1)}%`, name]}
                labelStyle={{ color: '#000', fontWeight: 'bold', fontSize: '14px' }}
                contentStyle={{ backgroundColor: '#fff', border: '2px solid #3b82f6', borderRadius: '8px', fontSize: '14px', fontWeight: '600', padding: '10px' }}
              />
              {/* Order: Promoters (bottom), Passives (middle), Detractors (top) */}
              <Bar 
                dataKey="promotersPercent" 
                stackId="a" 
                fill="#C6EFCE" 
                name="Promoters %"
                isAnimationActive={false}
                barSize={120}
              >
                {orgLevelChartData.map((entry, index) => (
                  <Cell key={`cell-promoters-${index}`} fill="#C6EFCE" />
                ))}
                <LabelList 
                  key="promoters-labels"
                  content={(props) => <CustomLabelWithData {...props} dataKey="promotersPercent" chartData={orgLevelChartData} />} 
                />
              </Bar>
              <Bar 
                dataKey="passivesPercent" 
                stackId="a" 
                fill="#FFA500" 
                name="Passives %"
                isAnimationActive={false}
                barSize={120}
              >
                {orgLevelChartData.map((entry, index) => (
                  <Cell key={`cell-passives-${index}`} fill="#FFA500" />
                ))}
                <LabelList 
                  key="passives-labels"
                  content={(props) => <CustomLabelWithData {...props} dataKey="passivesPercent" chartData={orgLevelChartData} />} 
                />
              </Bar>
              <Bar 
                dataKey="detractorsPercent" 
                stackId="a" 
                fill="#FF0000" 
                name="Detractors %"
                isAnimationActive={false}
                barSize={120}
              >
                {orgLevelChartData.map((entry, index) => (
                  <Cell key={`cell-detractors-${index}`} fill="#FF0000" />
                ))}
                <LabelList 
                  key="detractors-labels"
                  content={(props) => <CustomLabelWithData {...props} dataKey="detractorsPercent" chartData={orgLevelChartData} />} 
                />
              </Bar>
              {/* Hidden bar to show NPS label below the stacked bars */}
              <Bar 
                dataKey={(data) => data.promotersPercent + data.passivesPercent + data.detractorsPercent}
                stackId="a"
                fill="transparent"
                name="NPS"
                stroke="none"
              >
                <LabelList 
                  content={(props) => <NPSLabelWithData {...props} chartData={orgLevelChartData} />} 
                  position="bottom" 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          
          {/* Legend for Org Level - NPS Distribution */}
          <ChartLegend style={{ marginTop: '1.5rem', justifyContent: 'center' }}>
            <ChartLegendItem>
              <ChartLegendColor style={{ backgroundColor: '#C6EFCE' }} />
              <ChartLegendText>Promoters % (Green)</ChartLegendText>
            </ChartLegendItem>
            <ChartLegendItem>
              <ChartLegendColor style={{ backgroundColor: '#FFA500' }} />
              <ChartLegendText>Passives % (Orange)</ChartLegendText>
            </ChartLegendItem>
            <ChartLegendItem>
              <ChartLegendColor style={{ backgroundColor: '#FF0000' }} />
              <ChartLegendText>Detractors % (Red)</ChartLegendText>
            </ChartLegendItem>
          </ChartLegend>
        </ChartContainer>
      )}

      {/* Vertical Graph for Top 10 - NPS Distribution */}
      {showTop10Chart && showTop10 && combinedTop10AndOtherChartData.length > 0 && (
        <ChartContainer ref={top10ChartRef}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid #e5e7eb' }}>
            <ChartTitle style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>📊 NPS Distribution</ChartTitle>
            <button
              onClick={downloadTop10ChartImage}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              📥 Download Chart
            </button>
          </div>
          {/* Combined Bar Chart for Top 10 and Other Accounts */}
          {combinedTop10AndOtherChartData.length > 0 && (
          <ResponsiveContainer width="100%" height={650}>
              <BarChart 
                data={combinedTop10AndOtherChartData} 
                margin={{ top: 40, right: 50, left: 50, bottom: 160 }}
                categoryGap={0}
                barCategoryGap="2%"
              >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 14, fill: '#374151', fontWeight: '600' }}
                padding={{ left: 0, right: 0 }}
              />
              <YAxis 
                domain={[0, 100]}
                type="number"
                allowDataOverflow={false}
                tick={{ fontSize: 14, fill: '#374151', fontWeight: '600' }}
                label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '16px', fontWeight: '700', fill: '#1f2937' } }}
                ticks={[0, 20, 40, 60, 80, 100]}
              />
              <Tooltip 
                formatter={(value, name) => [`${value.toFixed(1)}%`, name]}
                labelStyle={{ color: '#000', fontWeight: 'bold', fontSize: '14px' }}
                contentStyle={{ backgroundColor: '#fff', border: '2px solid #3b82f6', borderRadius: '8px', fontSize: '14px', fontWeight: '600', padding: '10px' }}
              />
              {/* Order: Promoters (bottom), Passives (middle), Detractors (top) */}
              <Bar 
                dataKey="promotersPercent" 
                stackId="a" 
                fill="#C6EFCE" 
                name="Promoters %"
                isAnimationActive={false}
                barSize={150}
              >
                  {combinedTop10AndOtherChartData.map((entry, index) => (
                  <Cell key={`cell-promoters-${index}`} fill="#C6EFCE" />
                ))}
                <LabelList 
                  key="promoters-labels"
                    content={(props) => <CustomLabelWithData {...props} dataKey="promotersPercent" chartData={combinedTop10AndOtherChartData} />} 
                />
              </Bar>
              <Bar 
                dataKey="passivesPercent" 
                stackId="a" 
                  fill="#FFA500" 
                name="Passives %"
                isAnimationActive={false}
                barSize={150}
              >
                  {combinedTop10AndOtherChartData.map((entry, index) => (
                    <Cell key={`cell-passives-${index}`} fill="#FFA500" />
                ))}
                <LabelList 
                  key="passives-labels"
                    content={(props) => <CustomLabelWithData {...props} dataKey="passivesPercent" chartData={combinedTop10AndOtherChartData} />} 
                />
              </Bar>
              <Bar 
                dataKey="detractorsPercent" 
                stackId="a" 
                  fill="#FF0000" 
                name="Detractors %"
                isAnimationActive={false}
                barSize={150}
              >
                  {combinedTop10AndOtherChartData.map((entry, index) => (
                    <Cell key={`cell-detractors-${index}`} fill="#FF0000" />
                ))}
                <LabelList 
                  key="detractors-labels"
                    content={(props) => <CustomLabelWithData {...props} dataKey="detractorsPercent" chartData={combinedTop10AndOtherChartData} />} 
                />
              </Bar>
              {/* Hidden bar to show NPS label below the stacked bars */}
              <Bar 
                dataKey={(data) => data.promotersPercent + data.passivesPercent + data.detractorsPercent}
                stackId="a"
                fill="transparent"
                name="NPS"
                stroke="none"
              >
                <LabelList 
                    content={(props) => <NPSLabelWithData {...props} chartData={combinedTop10AndOtherChartData} />} 
                  position="bottom" 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          )}
          
          {/* Pie Charts Section - Three Column Layout */}
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', marginTop: '2rem' }}>
            {/* First Column: Overall Pie Chart */}
          {overallPieChartData.length > 0 && (
              <div style={{ flex: '1', display: 'flex', justifyContent: 'center' }}>
              <div style={{ flex: '1', maxWidth: '400px', padding: '1rem', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#1f2937', fontSize: '1.25rem', fontWeight: '700' }}>Overall - NPS Distribution</h4>
                  <div style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: '700' }}>NPS: {overallChartData[0].nps.toFixed(2)}</div>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={overallPieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderPieChartLabel}
                      outerRadius={140}
                      innerRadius={0}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {overallPieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `${value.toFixed(2)}%`}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', fontSize: '14px', fontWeight: '600' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
            {/* Second Column: Top 10 Pie Chart */}
          {top10PieChartData.length > 0 && (
              <div style={{ flex: '1', display: 'flex', justifyContent: 'center' }}>
              <div style={{ flex: '1', maxWidth: '400px', padding: '1rem', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#1f2937', fontSize: '1.25rem', fontWeight: '700' }}>Top 10 - NPS Distribution</h4>
                  <div style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: '700' }}>NPS: {top10ChartData[0].nps.toFixed(2)}</div>
          </div>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={top10PieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderPieChartLabel}
                      outerRadius={140}
                      innerRadius={0}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {top10PieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `${value.toFixed(2)}%`}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', fontSize: '14px', fontWeight: '600' }}
                    />
                  </PieChart>
          </ResponsiveContainer>
              </div>
            </div>
          )}
          
            {/* Third Column: Other Accounts Pie Chart */}
          {otherAccountPieChartData.length > 0 && (
              <div style={{ flex: '1', display: 'flex', justifyContent: 'center' }}>
              <div style={{ flex: '1', maxWidth: '400px', padding: '1rem', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#1f2937', fontSize: '1.25rem', fontWeight: '700' }}>Other Accounts - NPS Distribution</h4>
                  <div style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: '700' }}>NPS: {otherAccountChartData[0].nps.toFixed(2)}</div>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={otherAccountPieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderPieChartLabel}
                      outerRadius={140}
                      innerRadius={0}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {otherAccountPieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `${value.toFixed(2)}%`}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', fontSize: '14px', fontWeight: '600' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          </div>
          
          {/* Legend for NPS Distribution */}
          <ChartLegend style={{ marginTop: '1.5rem', justifyContent: 'center' }}>
            <ChartLegendItem>
              <ChartLegendColor style={{ backgroundColor: '#C6EFCE' }} />
              <ChartLegendText>Promoters % (Green)</ChartLegendText>
            </ChartLegendItem>
            <ChartLegendItem>
              <ChartLegendColor style={{ backgroundColor: '#FFA500' }} />
              <ChartLegendText>Passives % (Orange)</ChartLegendText>
            </ChartLegendItem>
            <ChartLegendItem>
              <ChartLegendColor style={{ backgroundColor: '#FF0000' }} />
              <ChartLegendText>Detractors % (Red)</ChartLegendText>
            </ChartLegendItem>
          </ChartLegend>
        </ChartContainer>
      )}


      {/* Summary Table for BU-wise NPS */}
      {showVerticalGraph && groupByBU && chartData.length > 0 && (
        <SummaryTableContainer>
          <SummaryTableTitle>📊 BU-wise NPS Summary</SummaryTableTitle>
          <SummaryTable>
            <SummaryTableHeader>
              <tr>
                <SummaryTableHeaderCell>Business Unit</SummaryTableHeaderCell>
                <SummaryTableHeaderCell>NPS</SummaryTableHeaderCell>
                <SummaryTableHeaderCell>Promoters %</SummaryTableHeaderCell>
                <SummaryTableHeaderCell>Passives %</SummaryTableHeaderCell>
                <SummaryTableHeaderCell>Detractors %</SummaryTableHeaderCell>
              </tr>
            </SummaryTableHeader>
            <SummaryTableBody>
              {chartData.filter(item => item.name !== 'Org Level').map((item, index) => (
                <SummaryTableRow key={index}>
                  <SummaryTableCell>{item.name}</SummaryTableCell>
                  <SummaryNPSCell score={item.nps || 0}>
                    {(Math.round(item.nps * 100) / 100).toFixed(2)}
                  </SummaryNPSCell>
                  <SummaryTableCellPercentage percentage={item.promotersPercent} columnType="promoters">
                    {Math.round(item.promotersPercent * 100) / 100}%
                  </SummaryTableCellPercentage>
                  <SummaryTableCellPercentage percentage={item.passivesPercent} columnType="passives">
                    {Math.round(item.passivesPercent * 100) / 100}%
                  </SummaryTableCellPercentage>
                  <SummaryTableCellPercentage percentage={item.detractorsPercent}>
                    {Math.round(item.detractorsPercent * 100) / 100}%
                  </SummaryTableCellPercentage>
                </SummaryTableRow>
              ))}
              {/* Grand Total Row - Renamed to "Org Level" */}
              <SummaryTableRow>
                <SummaryTableCell fontWeight="700">Org Level</SummaryTableCell>
                <SummaryNPSCell score={buWiseGrandTotals.overallNPS || 0}>
                  {(Math.round(buWiseGrandTotals.overallNPS * 100) / 100).toFixed(2)}
                </SummaryNPSCell>
                <SummaryTableCellPercentage percentage={buWiseGrandTotals.overallPromotersPercent} columnType="promoters">
                  {Math.round(buWiseGrandTotals.overallPromotersPercent * 100) / 100}%
                </SummaryTableCellPercentage>
                <SummaryTableCellPercentage percentage={buWiseGrandTotals.overallPassivesPercent} columnType="passives">
                  {Math.round(buWiseGrandTotals.overallPassivesPercent * 100) / 100}%
                </SummaryTableCellPercentage>
                <SummaryTableCellPercentage percentage={buWiseGrandTotals.overallDetractorsPercent}>
                  {Math.round(buWiseGrandTotals.overallDetractorsPercent * 100) / 100}%
                </SummaryTableCellPercentage>
              </SummaryTableRow>
            </SummaryTableBody>
          </SummaryTable>
        </SummaryTableContainer>
      )}

      {/* NPS Dashboard Summary */}
      {!showRespondedComparison && processedData.data.length > 0 && processedData.summary && (
        <SummaryContainer>
          <SummaryTitle>📊 NPS Dashboard Summary</SummaryTitle>
          <SummaryGrid>
            {/* Top 5 Accounts - Only show for account-wise data */}
            {!groupByBU && processedData.summary.top5Accounts.length > 0 && (
              <SummaryCard>
                <SummaryCardTitle>🏆 Top 5 Accounts (Highest NPS)</SummaryCardTitle>
                <TopAccountsList>
                  {processedData.summary.top5Accounts.map((account, index) => (
                    <TopAccountItem key={index}>
                      <AccountName>
                        {account.rank}. {account.customerName}
                      </AccountName>
                      <AccountNPS>{(Math.round(account.npsScore * 100) / 100).toFixed(2)}</AccountNPS>
                    </TopAccountItem>
                  ))}
                </TopAccountsList>
              </SummaryCard>
            )}

            {/* Achieved NPS Score */}
            <SummaryCard>
              <SummaryCardTitle>🎯 Achieved NPS Score</SummaryCardTitle>
              <AchievedNPSContainer>
                <AchievedNPSValue npsScore={processedData.summary.achievedNPSScore}>
                  {processedData.summary.achievedNPSScore !== undefined && processedData.summary.achievedNPSScore !== null 
                    ? (Math.round(processedData.summary.achievedNPSScore * 100) / 100).toFixed(2) 
                    : '0.00'}
                </AchievedNPSValue>
                <AchievedNPSLabel>Overall NPS Score</AchievedNPSLabel>
                <AchievedNPSDescription>
                  Based on grand total of all {groupByBU ? 'business units' : 'customers'}
                </AchievedNPSDescription>
              </AchievedNPSContainer>
            </SummaryCard>

          </SummaryGrid>
        </SummaryContainer>
      )}

      {/* Responded Level Comparison Section */}
      {showRespondedComparison && (
        <>
        {/* Bar Chart for Respondent Category */}
        {respondentChartData.length > 0 && (
          <ChartContainer ref={respondentChartRef} style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid #e5e7eb' }}>
              <ChartTitle style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>📊 Respondent Category-wise NPS Distribution</ChartTitle>
              <button
                onClick={downloadRespondentChartImage}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                📥 Download Chart
              </button>
            </div>
            <ResponsiveContainer width="100%" height={650}>
              <BarChart data={respondentChartData} margin={{ top: 40, right: 50, left: 50, bottom: 120 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end"
                  height={120}
                  interval={0}
                  tick={{ fontSize: 14, fill: '#374151', fontWeight: '600' }}
                  label={{ value: 'Respondent Category', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fontSize: '16px', fontWeight: '700', fill: '#1f2937' } }}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 14, fill: '#374151', fontWeight: '600' }}
                  label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '16px', fontWeight: '700', fill: '#1f2937' } }}
                />
                <Tooltip 
                  formatter={(value, name) => [`${value.toFixed(1)}%`, name]}
                  labelStyle={{ color: '#000', fontWeight: 'bold', fontSize: '14px' }}
                  contentStyle={{ backgroundColor: '#fff', border: '2px solid #3b82f6', borderRadius: '8px', fontSize: '14px', fontWeight: '600', padding: '10px' }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '14px', fontWeight: '600', paddingTop: '20px' }}
                  iconSize={16}
                />
                <Bar dataKey="promotersPercent" stackId="a" fill="#C6EFCE" name="Promoters %" isAnimationActive={false} barSize={80}>
                  {respondentChartData.map((entry, index) => (
                    <Cell key={`cell-promoters-${index}`} fill="#C6EFCE" />
                  ))}
                  <LabelList 
                    content={(props) => <CustomLabelWithData {...props} dataKey="promotersPercent" chartData={respondentChartData} />} 
                    formatter={(value, name, props) => {
                      console.log('Promoters LabelList formatter:', { 
                        value, 
                        name, 
                        props,
                        valueType: typeof value,
                        payload: props?.payload,
                        dataKey: props?.dataKey
                      });
                      return value;
                    }}
                  />
                </Bar>
                <Bar dataKey="passivesPercent" stackId="a" fill="#FFA500" name="Passives %" isAnimationActive={false} barSize={80}>
                  {respondentChartData.map((entry, index) => (
                    <Cell key={`cell-passives-${index}`} fill="#FFA500" />
                  ))}
                  <LabelList 
                    content={(props) => <CustomLabelWithData {...props} dataKey="passivesPercent" chartData={respondentChartData} />} 
                    formatter={(value, name, props) => {
                      console.log('Passives LabelList formatter:', { 
                        value, 
                        name, 
                        props,
                        valueType: typeof value,
                        payload: props?.payload,
                        dataKey: props?.dataKey
                      });
                      return value;
                    }}
                  />
                </Bar>
                <Bar dataKey="detractorsPercent" stackId="a" fill="#FF0000" name="Detractors %" isAnimationActive={false} barSize={80}>
                  {respondentChartData.map((entry, index) => (
                    <Cell key={`cell-detractors-${index}`} fill="#FF0000" />
                  ))}
                  <LabelList 
                    content={(props) => <CustomLabelWithData {...props} dataKey="detractorsPercent" chartData={respondentChartData} />} 
                    formatter={(value, name, props) => {
                      console.log('Detractors LabelList formatter:', { 
                        value, 
                        name, 
                        props,
                        valueType: typeof value,
                        payload: props?.payload,
                        dataKey: props?.dataKey
                      });
                      return value;
                    }}
                  />
                </Bar>
                {/* Hidden bar to show NPS label on top of the stacked bars */}
                <Bar 
                  dataKey={(data) => data.promotersPercent + data.passivesPercent + data.detractorsPercent}
                  stackId="a"
                  fill="transparent"
                  name="NPS"
                  stroke="none"
                >
                  <LabelList 
                    content={(props) => <NPSLabelWithData {...props} chartData={respondentChartData} />} 
                    position="top" 
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {respondentChartData.length > 0 && (
              <div style={{ margin: '20px 0 0 0', background: '#ffffff', border: '2px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '12px 16px', background: '#f3f4f6', borderBottom: '2px solid #e5e7eb', fontWeight: 700, color: '#1f2937', fontSize: '1.1rem' }}>
                  NPS Summary
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '12px', borderRight: '1px solid #e5e7eb', textAlign: 'center', color: '#374151', fontSize: '1rem', fontWeight: '700', background: '#f9fafb' }}>Overall</th>
                      <th style={{ padding: '12px', borderRight: '1px solid #e5e7eb', textAlign: 'center', color: '#374151', fontSize: '1rem', fontWeight: '700', background: '#f9fafb' }}>CXO strata</th>
                      <th style={{ padding: '12px', textAlign: 'center', color: '#374151', fontSize: '1rem', fontWeight: '700', background: '#f9fafb' }}>Non CXO strata</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const findNps = (label) => {
                        const item = respondentChartData.find(i => (i.name || '').toString().trim().toLowerCase() === label);
                        const val = item && typeof item.nps === 'number' ? item.nps : 0;
                        return Math.round(val * 100) / 100;
                      };
                      const overall = findNps('overall');
                      const cxo = findNps('cxo strata');
                      const noncxo = findNps('non cxo strata');
                      return (
                        <tr>
                          <td style={{ padding: '14px', borderTop: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 700, color: '#111827', fontSize: '1.15rem' }}>{overall}</td>
                          <td style={{ padding: '14px', borderTop: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 700, color: '#111827', fontSize: '1.15rem' }}>{cxo}</td>
                          <td style={{ padding: '14px', borderTop: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 700, color: '#111827', fontSize: '1.15rem' }}>{noncxo}</td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Legend for Respondent Category-wise NPS Distribution */}
            <ChartLegend style={{ marginTop: '1.5rem', justifyContent: 'center' }}>
              <ChartLegendItem>
                <ChartLegendColor color="#C6EFCE" />
                <ChartLegendText>Promoters % (Green)</ChartLegendText>
              </ChartLegendItem>
              <ChartLegendItem>
                <ChartLegendColor color="#FFA500" />
                <ChartLegendText>Passives % (Orange)</ChartLegendText>
              </ChartLegendItem>
              <ChartLegendItem>
                <ChartLegendColor color="#FF0000" />
                <ChartLegendText>Detractors % (Red)</ChartLegendText>
              </ChartLegendItem>
            </ChartLegend>
          </ChartContainer>
        )}

        {/* Donut Charts Section */}
        {respondentChartData.length > 0 && (
          <ChartContainer ref={donutChartRef} style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <ChartTitle style={{ marginBottom: 0, textAlign: 'left' }}>📊 Donut Chart - Respondent Category Distribution</ChartTitle>
              <button
                onClick={downloadDonutChartImage}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                📥 Download Chart
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem' }}>
              {(() => {
                const getChartData = (nameKey) => {
                  const item = respondentChartData.find(i => {
                    const itemName = (i.name || '').toString().trim().toLowerCase();
                    const searchKey = nameKey.toLowerCase();
                    return itemName === searchKey;
                  });
                  if (!item) return [];
                  return [
                    { name: 'Promoters %', value: item.promotersPercent || 0, color: '#C6EFCE' }, // Light Green 2
                    { name: 'Passives %', value: item.passivesPercent || 0, color: '#FFA500' }, // Orange
                    { name: 'Detractors %', value: item.detractorsPercent || 0, color: '#FF0000' } // Red
                  ].filter(d => d.value > 0);
                };

                const renderDonutChart = (title, nameKey) => {
                  const data = getChartData(nameKey);
                  const item = respondentChartData.find(i => {
                    const itemName = (i.name || '').toString().trim().toLowerCase();
                    const searchKey = nameKey.toLowerCase();
                    return itemName === searchKey;
                  });
                  const nps = item ? (item.nps || 0) : 0;

                  const RADIAN = Math.PI / 180;
                  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, payload }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    
                    if (percent < 0.03) return null; // Hide labels for very small segments (< 3%)

                    // Determine text color based on segment color
                    const segmentColor = payload?.color || '#8884d8';
                    // Red (Detractors): white text
                    // Light Green 2 (Promoters) / Orange (Passives): black text
                    const isRed = segmentColor === '#FF0000' || segmentColor.toLowerCase() === '#ff0000';
                    const textColor = isRed ? '#ffffff' : '#000000';

                    return (
                      <text 
                        x={x} 
                        y={y} 
                        fill={textColor}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="18"
                        fontWeight="700"
                        fontFamily="Arial, sans-serif"
                      >
                        {`${(percent * 100).toFixed(1)}%`}
                      </text>
                    );
                  };

                  return (
                    <div key={title} style={{ flex: '1', minWidth: '300px', maxWidth: '380px', padding: '1rem', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#1f2937', fontSize: '1.25rem', fontWeight: '700' }}>{title}</h4>
                        <div style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: '700' }}>NPS: {nps.toFixed(2)}</div>
                      </div>
                      <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                          <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomLabel}
                            outerRadius={110}
                            innerRadius={65}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {data.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => `${value.toFixed(2)}%`}
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', fontSize: '14px', fontWeight: '600' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  );
                };

                return (
                  <>
                    {renderDonutChart('Overall', 'Overall')}
                    {renderDonutChart('CXO strata', 'CXO strata')}
                    {renderDonutChart('Non CXO strata', 'Non CXO strata')}
                    
                    {/* Single Legend for all Donut Charts */}
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
                      <ChartLegend style={{ justifyContent: 'center' }}>
                        <ChartLegendItem>
                          <ChartLegendColor color="#C6EFCE" />
                          <ChartLegendText>Promoters % (Green)</ChartLegendText>
                        </ChartLegendItem>
                        <ChartLegendItem>
                          <ChartLegendColor color="#FFA500" />
                          <ChartLegendText>Passives % (Orange)</ChartLegendText>
                        </ChartLegendItem>
                        <ChartLegendItem>
                          <ChartLegendColor color="#FF0000" />
                          <ChartLegendText>Detractors % (Red)</ChartLegendText>
                        </ChartLegendItem>
                      </ChartLegend>
                    </div>
                  </>
                );
              })()}
            </div>
          </ChartContainer>
        )}

        {/* Pie Charts Section */}
        {respondentChartData.length > 0 && (
          <ChartContainer ref={pieChartRef} style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <ChartTitle style={{ marginBottom: 0, textAlign: 'left' }}>📊 Pie Chart - Respondent Category Distribution</ChartTitle>
              <button
                onClick={downloadPieChartImage}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                📥 Download Chart
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem' }}>
              {(() => {
                const getChartData = (nameKey) => {
                  const item = respondentChartData.find(i => {
                    const itemName = (i.name || '').toString().trim().toLowerCase();
                    const searchKey = nameKey.toLowerCase();
                    return itemName === searchKey;
                  });
                  if (!item) return [];
                  return [
                    { name: 'Promoters %', value: item.promotersPercent || 0, color: '#C6EFCE' }, // Light Green 2
                    { name: 'Passives %', value: item.passivesPercent || 0, color: '#FFA500' }, // Orange
                    { name: 'Detractors %', value: item.detractorsPercent || 0, color: '#FF0000' } // Red
                  ].filter(d => d.value > 0);
                };

                const renderPieChart = (title, nameKey) => {
                  const data = getChartData(nameKey);
                  const item = respondentChartData.find(i => {
                    const itemName = (i.name || '').toString().trim().toLowerCase();
                    const searchKey = nameKey.toLowerCase();
                    return itemName === searchKey;
                  });
                  const nps = item ? (item.nps || 0) : 0;

                  const RADIAN = Math.PI / 180;
                  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, payload }) => {
                    const radius = outerRadius * 0.7; // Position labels at 70% of radius for pie charts
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    
                    if (percent < 0.03) return null; // Hide labels for very small segments (< 3%)

                    // Determine text color based on segment color
                    const segmentColor = payload?.color || '#8884d8';
                    // Red (Detractors): white text
                    // Light Green 2 (Promoters) / Orange (Passives): black text
                    const isRed = segmentColor === '#FF0000' || segmentColor.toLowerCase() === '#ff0000';
                    const textColor = isRed ? '#ffffff' : '#000000';

                    return (
                      <text 
                        x={x} 
                        y={y} 
                        fill={textColor}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="18"
                        fontWeight="700"
                        fontFamily="Arial, sans-serif"
                      >
                        {`${(percent * 100).toFixed(1)}%`}
                      </text>
                    );
                  };

                  return (
                    <div key={title} style={{ flex: '1', minWidth: '300px', maxWidth: '380px', padding: '1rem', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#1f2937', fontSize: '1.25rem', fontWeight: '700' }}>{title}</h4>
                        <div style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: '700' }}>NPS: {nps.toFixed(2)}</div>
                      </div>
                      <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                          <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomLabel}
                            outerRadius={110}
                            innerRadius={0}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {data.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => `${value.toFixed(2)}%`}
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', fontSize: '14px', fontWeight: '600' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  );
                };

                return (
                  <>
                    {renderPieChart('Overall', 'Overall')}
                    {renderPieChart('CXO strata', 'CXO strata')}
                    {renderPieChart('Non CXO strata', 'Non CXO strata')}
                    
                    {/* Single Legend for all Pie Charts */}
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
                      <ChartLegend style={{ justifyContent: 'center' }}>
                        <ChartLegendItem>
                          <ChartLegendColor color="#C6EFCE" />
                          <ChartLegendText>Promoters % (Green)</ChartLegendText>
                        </ChartLegendItem>
                        <ChartLegendItem>
                          <ChartLegendColor color="#FFA500" />
                          <ChartLegendText>Passives % (Orange)</ChartLegendText>
                        </ChartLegendItem>
                        <ChartLegendItem>
                          <ChartLegendColor color="#FF0000" />
                          <ChartLegendText>Detractors % (Red)</ChartLegendText>
                        </ChartLegendItem>
                      </ChartLegend>
                    </div>
                  </>
                );
              })()}
            </div>
          </ChartContainer>
        )}
        
        <TableContainer>
          <div style={{ padding: '1.5rem', backgroundColor: '#f0f9ff', borderRadius: '8px', marginBottom: '1rem', border: '2px solid #3b82f6' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e3a8a', fontSize: '1.4rem', fontWeight: 'bold' }}>
              📊 Responded Level Comparison - Individual Respondent Analysis
            </h3>
            <p style={{ margin: '0', color: '#6b7280', fontSize: '0.95rem', lineHeight: '1.6' }}>
              <strong>NPS Calculation for Each Respondent:</strong> (#Promoters - # Detractors) ÷ Responded × 100
            </p>
            <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
              📋 <strong>Promoters:</strong> Ratings of 9 or 10 for perspective "NPS" | <strong>Passives:</strong> Ratings of 7 or 8 for perspective "NPS" | <strong>Detractors:</strong> Ratings less than 7 for perspective "NPS"
            </p>
            <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
              📅 Filtered by: CSAT SENT DATE and CSAT RECEIVED DATE ≥ {acsatCycleStartDateFormatted} | <strong>Data Source:</strong> CSAT sent and received Report
            </p>
          </div>
          {respondentLevelData.length === 0 ? (
            <LoadingMessage>
              No respondent data available for the selected date range
            </LoadingMessage>
          ) : (
          <Table>
            <TableHeader>
              <tr>
                <TableHeaderCell isFirstColumn style={{ backgroundColor: '#1e3a8a', color: '#ffffff', fontWeight: 'bold', textAlign: 'center', width: '80px' }}>
                  SNO
                </TableHeaderCell>
                <TableHeaderCell style={{ backgroundColor: '#1e3a8a', color: '#ffffff', fontWeight: 'bold', textAlign: 'center', width: '200px' }}>
                  RESPONDENT CATEGORY
                </TableHeaderCell>
                <TableHeaderCell style={{ backgroundColor: '#1e3a8a', color: '#ffffff', fontWeight: 'bold', textAlign: 'center', width: '150px' }}>
                  #Promoters
                </TableHeaderCell>
                <TableHeaderCell style={{ backgroundColor: '#1e3a8a', color: '#ffffff', fontWeight: 'bold', textAlign: 'center', width: '120px' }}>
                  Promoters %
                </TableHeaderCell>
                <TableHeaderCell style={{ backgroundColor: '#1e3a8a', color: '#ffffff', fontWeight: 'bold', textAlign: 'center', width: '150px' }}>
                  Number of Passive
                </TableHeaderCell>
                <TableHeaderCell style={{ backgroundColor: '#1e3a8a', color: '#ffffff', fontWeight: 'bold', textAlign: 'center', width: '120px' }}>
                  Passives %
                </TableHeaderCell>
                <TableHeaderCell style={{ backgroundColor: '#1e3a8a', color: '#ffffff', fontWeight: 'bold', textAlign: 'center', width: '150px' }}>
                  # Detractors
                </TableHeaderCell>
                <TableHeaderCell style={{ backgroundColor: '#1e3a8a', color: '#ffffff', fontWeight: 'bold', textAlign: 'center', width: '120px' }}>
                  Detractors %
                </TableHeaderCell>
                <TableHeaderCell style={{ backgroundColor: '#1e3a8a', color: '#ffffff', fontWeight: 'bold', textAlign: 'center', width: '150px' }}>
                  NPS
                </TableHeaderCell>
              </tr>
            </TableHeader>
            <TableBody>
              {respondentLevelData.map((respondent, index) => (
                <TableRow key={index} style={{ backgroundColor: respondent.isGrandTotal ? '#f0f0f0' : 'transparent' }}>
                  <TableCell isFirstColumn style={{ fontWeight: respondent.isGrandTotal ? 'bold' : 'bold' }}>
                    {respondent.isGrandTotal ? '' : respondent.sno}
                  </TableCell>
                  <TableCell style={{ fontWeight: respondent.isGrandTotal ? 'bold' : '500' }}>
                    {respondent.respondentCategory || '-'}
                  </TableCell>
                  <TableCell style={{ textAlign: 'center' }}>
                    <span style={{ 
                      display: 'inline-block',
                      padding: '6px 16px', 
                      backgroundColor: '#C6EFCE', 
                      color: '#000000', 
                      borderRadius: '16px', 
                      fontSize: '0.875rem', 
                      fontWeight: '600',
                      minWidth: '40px'
                    }}>
                      {respondent.promotersCount}
                    </span>
                  </TableCell>
                  <TableCell style={{ textAlign: 'center', fontWeight: respondent.isGrandTotal ? 'bold' : 'normal', color: '#1f2937' }}>
                    {Math.round((respondent.promotersPercent || 0) * 10) / 10}%
                  </TableCell>
                  <TableCell style={{ textAlign: 'center' }}>
                    <span style={{ 
                      display: 'inline-block',
                      padding: '6px 16px', 
                      backgroundColor: '#FFA500', 
                      color: '#000000', 
                      borderRadius: '16px', 
                      fontSize: '0.875rem', 
                      fontWeight: '600',
                      minWidth: '40px'
                    }}>
                      {respondent.passivesCount}
                    </span>
                  </TableCell>
                  <TableCell style={{ textAlign: 'center', fontWeight: respondent.isGrandTotal ? 'bold' : 'normal', color: '#1f2937' }}>
                    {Math.round((respondent.passivesPercent || 0) * 10) / 10}%
                  </TableCell>
                  <TableCell style={{ textAlign: 'center' }}>
                    <span style={{ 
                      display: 'inline-block',
                      padding: '6px 16px', 
                      backgroundColor: '#FF0000', 
                      color: '#ffffff', 
                      borderRadius: '16px', 
                      fontSize: '0.875rem', 
                      fontWeight: '600',
                      minWidth: '40px'
                    }}>
                      {respondent.detractorsCount}
                    </span>
                  </TableCell>
                  <TableCell style={{ textAlign: 'center', fontWeight: respondent.isGrandTotal ? 'bold' : 'normal' }}>
                    {Math.round((respondent.detractorsPercent || 0) * 10) / 10}%
                  </TableCell>
                  {respondent.isGrandTotal ? (
                    <NPSCell score={respondent.npsScore} style={{ fontSize: '1rem' }}>
                      {(Math.round(respondent.npsScore * 100) / 100).toFixed(2)}
                    </NPSCell>
                  ) : (
                    <NPSCell score={respondent.npsScore}>
                      {(Math.round(respondent.npsScore * 100) / 100).toFixed(2)}
                    </NPSCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
          {/* Legend for Responded Level Comparison */}
          <LegendContainer style={{ marginTop: '1.5rem' }}>
            <LegendTitle>Respondent Category Legend</LegendTitle>
            <LegendItem>
              <LegendColor color="#C6EFCE" />
              <LegendText>Promoters % (Green)</LegendText>
            </LegendItem>
            <LegendItem>
              <LegendColor color="#FFA500" />
              <LegendText>Passives % (Orange)</LegendText>
            </LegendItem>
            <LegendItem>
              <LegendColor color="#FF0000" />
              <LegendText>Detractors % (Red)</LegendText>
            </LegendItem>
          </LegendContainer>
          {/* NPS Score Legend */}
          <LegendContainer style={{ marginTop: '1.5rem' }}>
            <LegendTitle>NPS Score Legend</LegendTitle>
            <LegendItem>
              <LegendColor color="#C6EFCE" />
              <LegendText>Green: ≥75%</LegendText>
            </LegendItem>
            <LegendItem>
              <LegendColor color="#FFA500" />
              <LegendText>Orange: 0% to 74.99%</LegendText>
            </LegendItem>
            <LegendItem>
              <LegendColor color="#FF0000" />
              <LegendText>Red: &lt;0%</LegendText>
            </LegendItem>
          </LegendContainer>
        </TableContainer>
        </>
      )}

      {!showRespondedComparison && !showVerticalGraph && (
      <TableContainer>
        {processedData.data.length === 0 ? (
          <ErrorMessage>
            <div style={{ fontWeight: 'bold', marginBottom: '0.75rem' }}>No data found</div>
            <div style={{ fontSize: '1rem', color: '#742a2a', marginBottom: '0.5rem' }}>{emptyDisplayMessage}</div>
            <div style={{ fontSize: '0.85rem', color: '#9b2c2c', marginTop: '1rem' }}>
              Open browser DevTools (F12 → Console) and filter by &quot;[NPS Dashboard]&quot; for full debug output.
            </div>
          </ErrorMessage>
        ) : (
          <Table>
            <TableHeader>
              <tr>
                <TableHeaderCell colSpan={groupByBU ? 2 : 3} style={{ backgroundColor: '#1e3a8a', color: '#ffffff', fontWeight: 'bold', textAlign: 'center' }}></TableHeaderCell>
                <TableHeaderCell colSpan="3" style={{ backgroundColor: '#9FC5E8', color: '#000000', fontWeight: 'bold', textAlign: 'center' }}>Response Rate</TableHeaderCell>
                <TableHeaderCell colSpan="4" style={{ backgroundColor: '#9FC5E8', color: '#000000', fontWeight: 'bold', textAlign: 'center' }}>Predicted NPS for the surveys responses received</TableHeaderCell>
                <TableHeaderCell colSpan="5" style={{ backgroundColor: '#9FC5E8', color: '#000000', fontWeight: 'bold', textAlign: 'center' }}>Actual NPS</TableHeaderCell>
                {showMainNpsTrendColumns && (
                  <TableHeaderCell
                    colSpan={npsMainTrendFileCount * NPS_MAIN_TREND_COLUMNS_PER_FILE}
                    style={{ backgroundColor: '#0d9488', color: '#ffffff', fontWeight: 'bold', textAlign: 'center' }}
                  >
                    Trend Comparison
                  </TableHeaderCell>
                )}
              </tr>
              <tr>
                <TableHeaderCell isFirstColumn style={{ backgroundColor: '#1e3a8a', color: '#ffffff', fontWeight: 'bold', textAlign: 'center' }}>Sr. No.</TableHeaderCell>
                <TableHeaderCell 
                  style={{ 
                    backgroundColor: '#1e3a8a', 
                    color: '#ffffff', 
                    fontWeight: 'bold', 
                    textAlign: 'center',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('businessUnit')}
                >
                  Business Unit
                  {sortConfig.key === 'businessUnit' && (
                    <span style={{ marginLeft: '0.5rem' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHeaderCell>
                {!groupByBU && (
                  <TableHeaderCell 
                    style={{ 
                      backgroundColor: '#1e3a8a', 
                      color: '#ffffff', 
                      fontWeight: 'bold', 
                      textAlign: 'center',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    onClick={() => handleSort('customerName')}
                  >
                    Account Name
                    {sortConfig.key === 'customerName' && (
                      <span style={{ marginLeft: '0.5rem' }}>
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </TableHeaderCell>
                )}
                <TableHeaderCell 
                  style={{ 
                    backgroundColor: '#1e3a8a', 
                    color: '#ffffff', 
                    fontWeight: 'bold', 
                    textAlign: 'center',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('sentCount')}
                >
                  Polled
                  {sortConfig.key === 'sentCount' && (
                    <span style={{ marginLeft: '0.5rem' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHeaderCell>
                <TableHeaderCell 
                  style={{ 
                    backgroundColor: '#1e3a8a', 
                    color: '#ffffff', 
                    fontWeight: 'bold', 
                    textAlign: 'center',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('receivedCount')}
                >
                  Responded
                  {sortConfig.key === 'receivedCount' && (
                    <span style={{ marginLeft: '0.5rem' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHeaderCell>
                <TableHeaderCell 
                  style={{ 
                    backgroundColor: '#1e3a8a', 
                    color: '#ffffff', 
                    fontWeight: 'bold', 
                    textAlign: 'center',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('responseRate')}
                >
                  Response %
                  {sortConfig.key === 'responseRate' && (
                    <span style={{ marginLeft: '0.5rem' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHeaderCell>
                <TableHeaderCell 
                  style={{ 
                    backgroundColor: '#1e3a8a', 
                    color: '#ffffff', 
                    fontWeight: 'bold', 
                    textAlign: 'center',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('predictedPromotersCount')}
                >
                  #Promoters
                  {sortConfig.key === 'predictedPromotersCount' && (
                    <span style={{ marginLeft: '0.5rem' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHeaderCell>
                <TableHeaderCell 
                  style={{ 
                    backgroundColor: '#1e3a8a', 
                    color: '#ffffff', 
                    fontWeight: 'bold', 
                    textAlign: 'center',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('predictedPassivesCount')}
                >
                  # Passives
                  {sortConfig.key === 'predictedPassivesCount' && (
                    <span style={{ marginLeft: '0.5rem' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHeaderCell>
                <TableHeaderCell 
                  style={{ 
                    backgroundColor: '#1e3a8a', 
                    color: '#ffffff', 
                    fontWeight: 'bold', 
                    textAlign: 'center',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('predictedDetractorsCount')}
                >
                  # Detractors
                  {sortConfig.key === 'predictedDetractorsCount' && (
                    <span style={{ marginLeft: '0.5rem' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHeaderCell>
                <TableHeaderCell 
                  style={{ 
                    backgroundColor: '#1e3a8a', 
                    color: '#ffffff', 
                    fontWeight: 'bold', 
                    textAlign: 'center',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('predictedNPSScore')}
                >
                  NPS
                  {sortConfig.key === 'predictedNPSScore' && (
                    <span style={{ marginLeft: '0.5rem' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHeaderCell>
                <TableHeaderCell 
                  style={{ 
                    backgroundColor: '#1e3a8a', 
                    color: '#ffffff', 
                    fontWeight: 'bold', 
                    textAlign: 'center',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('promotersCount')}
                >
                  #Promoters
                  {sortConfig.key === 'promotersCount' && (
                    <span style={{ marginLeft: '0.5rem' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHeaderCell>
                <TableHeaderCell 
                  style={{ 
                    backgroundColor: '#1e3a8a', 
                    color: '#ffffff', 
                    fontWeight: 'bold', 
                    textAlign: 'center',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('passivesCount')}
                >
                  # Passives
                  {sortConfig.key === 'passivesCount' && (
                    <span style={{ marginLeft: '0.5rem' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHeaderCell>
                <TableHeaderCell 
                  style={{ 
                    backgroundColor: '#1e3a8a', 
                    color: '#ffffff', 
                    fontWeight: 'bold', 
                    textAlign: 'center',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('detractorsCount')}
                >
                  # Detractors
                  {sortConfig.key === 'detractorsCount' && (
                    <span style={{ marginLeft: '0.5rem' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHeaderCell>
                <TableHeaderCell 
                  style={{ 
                    backgroundColor: '#1e3a8a', 
                    color: '#ffffff', 
                    fontWeight: 'bold', 
                    textAlign: 'center',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('npsScore')}
                >
                  NPS
                  {sortConfig.key === 'npsScore' && (
                    <span style={{ marginLeft: '0.5rem' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHeaderCell>
                <TableHeaderCell
                  style={{
                    backgroundColor: '#1e3a8a',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('npsAvgRating')}
                >
                  NPS score
                  {sortConfig.key === 'npsAvgRating' && (
                    <span style={{ marginLeft: '0.5rem' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHeaderCell>
                {showMainNpsTrendColumns &&
                  getNpsMainTrendComparisonSubHeaders(mainNpsTrendAnalysisData, npsMainTrendFileCount).map((label, headerIdx) => (
                    <TableHeaderCell
                      key={`main-trend-comp-header-${headerIdx}`}
                      style={{ backgroundColor: '#0d9488', color: '#ffffff', fontWeight: 'bold', textAlign: 'center', minWidth: '120px' }}
                    >
                      {label}
                    </TableHeaderCell>
                  ))}
              </tr>
            </TableHeader>
            <TableBody>
              {/* Regular data rows - exclude Grand Total, Percentage Row, Other Account, Other Account Percentage Row, Overall Row, Overall Percentage Row, Org Level Percentage Row, and Grand Total Percentage Row */}
              {sortedData.filter(group => !group.isGrandTotal && !group.isOtherAccount && !group.isPercentageRow && !group.isOtherAccountPercentageRow && !group.isOverallRow && !group.isOverallPercentageRow && !group.isOrgLevelPercentageRow && !group.isGrandTotalPercentageRow).map((group, index) => (
                <TableRow 
                  key={index}
                  style={{
                    backgroundColor: 'inherit',
                    fontWeight: 'normal'
                  }}
                >
                  <TableCell isFirstColumn isNumeric={true}>
                    {group.displayIndex || index + 1}
                  </TableCell>
                  <TableCell isNumeric={false}>
                    {normalizeBusinessUnitDisplay(group.businessUnit)}
                  </TableCell>
                  {!groupByBU && (
                    <TableCell isNumeric={false}>
                      {group.customerName}
                    </TableCell>
                  )}
                  <TableCell isNumeric={true}>
                    {group.sentCount}
                  </TableCell>
                  <TableCell isNumeric={true}>
                    {group.receivedCount}
                  </TableCell>
                  <ResponseRateCell 
                    rate={group.responseRate || 0} 
                    surveysReceived={group.receivedCount || 0}
                  >
                    {group.sentCount === 0 ? '-' : (Math.round((group.responseRate || 0) * 10) / 10).toFixed(1) + '%'}
                  </ResponseRateCell>
                  <TableCell isNumeric={true}>
                    {group.receivedCount === 0 ? '-' : (group.predictedPromotersCount || 0)}
                  </TableCell>
                  <TableCell isNumeric={true}>
                    {group.receivedCount === 0 ? '-' : (group.predictedPassivesCount || 0)}
                  </TableCell>
                  <TableCell isNumeric={true}>
                    {group.receivedCount === 0 ? '-' : (group.predictedDetractorsCount || 0)}
                  </TableCell>
                  <NPSCell score={group.receivedCount === 0 ? '-' : (group.predictedNpsScore || 0)}>
                    {group.receivedCount === 0 ? '-' : (Math.round((group.predictedNpsScore || 0) * 100) / 100).toFixed(2)}
                  </NPSCell>
                  <TableCell isNumeric={true}>
                    {group.receivedCount === 0 ? '-' : (group.promotersCount || 0)}
                  </TableCell>
                  <TableCell isNumeric={true}>
                    {group.receivedCount === 0 ? '-' : (group.passivesCount || 0)}
                  </TableCell>
                  <TableCell isNumeric={true}>
                    {group.receivedCount === 0 ? '-' : (group.detractorsCount || 0)}
                  </TableCell>
                  <NPSCell score={group.receivedCount === 0 ? '-' : (group.npsScore || 0)}>
                    {group.receivedCount === 0 ? '-' : (Math.round((group.npsScore || 0) * 100) / 100).toFixed(2)}
                  </NPSCell>
                  <TableCell isNumeric={true}>
                    {group.receivedCount === 0 ? '-' : (group.npsAvgRating == null ? '-' : (Math.round(Number(group.npsAvgRating) * 100) / 100).toFixed(2))}
                  </TableCell>
                  {renderMainNpsTrendComparisonCells(group)}
                </TableRow>
              ))}
              {/* Grand Total row - displayed below regular data */}
              {sortedData.find(group => group.isGrandTotal) && (() => {
                const grandTotal = sortedData.find(group => group.isGrandTotal);
                return (
                  <TableRow 
                    style={{
                      backgroundColor: showTop10 ? '#FFE699' : '#f8fafc',
                      fontWeight: 'bold',
                      borderTop: '2px solid #3b82f6'
                    }}
                  >
                    <TableCell isFirstColumn>
                      {/* Empty Sr. No. for Grand Total row */}
                    </TableCell>
                    <TableCell isNumeric={false} style={{ fontWeight: 'bold' }}>
                      {normalizeBusinessUnitDisplay(grandTotal.businessUnit)}
                    </TableCell>
                    {!groupByBU && (
                      <TableCell isNumeric={false} style={{ fontWeight: 'bold' }}>
                        {grandTotal.customerName}
                      </TableCell>
                    )}
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold' }}>
                      {grandTotal.sentCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold' }}>
                      {grandTotal.receivedCount}
                    </TableCell>
                    <ResponseRateCell 
                      rate={grandTotal.responseRate || 0} 
                      surveysReceived={grandTotal.receivedCount || 0}
                      style={{ fontWeight: 'bold' }}
                    >
                      {grandTotal.sentCount === 0 ? '-' : (Math.round((grandTotal.responseRate || 0) * 10) / 10).toFixed(1) + '%'}
                    </ResponseRateCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold' }}>
                      {grandTotal.receivedCount === 0 ? '-' : (grandTotal.predictedPromotersCount || 0)}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold' }}>
                      {grandTotal.receivedCount === 0 ? '-' : (grandTotal.predictedPassivesCount || 0)}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold' }}>
                      {grandTotal.receivedCount === 0 ? '-' : (grandTotal.predictedDetractorsCount || 0)}
                    </TableCell>
                    <NPSCell score={grandTotal.predictedNpsScore || 0}>
                      {grandTotal.receivedCount === 0 ? '-' : (Math.round((grandTotal.predictedNpsScore || 0) * 100) / 100).toFixed(2)}
                    </NPSCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold' }}>
                      {grandTotal.receivedCount === 0 ? '-' : (grandTotal.promotersCount || 0)}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold' }}>
                      {grandTotal.receivedCount === 0 ? '-' : (grandTotal.passivesCount || 0)}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold' }}>
                      {grandTotal.receivedCount === 0 ? '-' : (grandTotal.detractorsCount || 0)}
                    </TableCell>
                    <NPSCell score={grandTotal.npsScore || 0}>
                      {grandTotal.receivedCount === 0 ? '-' : (Math.round((grandTotal.npsScore || 0) * 100) / 100).toFixed(2)}
                    </NPSCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold' }}>
                      {grandTotal.receivedCount === 0 ? '-' : (grandTotal.npsAvgRating == null ? '-' : (Math.round(Number(grandTotal.npsAvgRating) * 100) / 100).toFixed(2))}
                    </TableCell>
                    {renderMainNpsTrendComparisonCells(grandTotal, {
                      bold: true,
                      useGrandTotalTrend: !groupByBU,
                      cellBackground: showTop10 ? '#FFE699' : '#f8fafc',
                    })}
                  </TableRow>
                );
              })()}
              {/* GRAND TOTAL Percentage row - displayed below Grand Total (only for account-wise dashboard, not Top 10) */}
              {!groupByBU && !showTop10 && sortedData.find(group => group.isGrandTotalPercentageRow) && (() => {
                const grandTotalPercentageRow = sortedData.find(group => group.isGrandTotalPercentageRow);
                return (
                  <TableRow 
                    style={{
                      backgroundColor: '#9FC5E8',
                      fontWeight: 'bold',
                      borderTop: '1px solid #3b82f6',
                      fontStyle: 'italic'
                    }}
                  >
                    <TableCell isFirstColumn>
                      {/* Empty Sr. No. for percentage row */}
                    </TableCell>
                    <TableCell isNumeric={false} style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#9FC5E8' }}>
                      {normalizeBusinessUnitDisplay(grandTotalPercentageRow.businessUnit)}
                    </TableCell>
                    {!groupByBU && (
                      <TableCell isNumeric={false} style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#9FC5E8' }}>
                        {grandTotalPercentageRow.customerName}
                      </TableCell>
                    )}
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#9FC5E8' }}>
                      {grandTotalPercentageRow.sentCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#9FC5E8' }}>
                      {grandTotalPercentageRow.receivedCount}
                    </TableCell>
                    <ResponseRateCell 
                      rate={typeof grandTotalPercentageRow.responseRate === 'number' ? grandTotalPercentageRow.responseRate : (typeof grandTotalPercentageRow.responseRate === 'string' ? parseFloat(grandTotalPercentageRow.responseRate) || 0 : 0)} 
                      surveysReceived={sortedData.find(group => group.isGrandTotal)?.receivedCount || 0}
                      style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#9FC5E8' }}
                    >
                      {typeof grandTotalPercentageRow.responseRate === 'number' ? (Math.round(grandTotalPercentageRow.responseRate * 10) / 10).toFixed(1) + '%' : grandTotalPercentageRow.responseRate}
                    </ResponseRateCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#9FC5E8' }}>
                      {grandTotalPercentageRow.predictedPromotersCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#9FC5E8' }}>
                      {grandTotalPercentageRow.predictedPassivesCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#9FC5E8' }}>
                      {grandTotalPercentageRow.predictedDetractorsCount}
                    </TableCell>
                    <NPSCell score={typeof grandTotalPercentageRow.predictedNpsScore === 'string' ? parseFloat(grandTotalPercentageRow.predictedNpsScore) || 0 : (grandTotalPercentageRow.predictedNpsScore || 0)} style={{ fontStyle: 'italic' }}>
                      {grandTotalPercentageRow.predictedNpsScore}
                    </NPSCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#9FC5E8' }}>
                      {grandTotalPercentageRow.promotersCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#9FC5E8' }}>
                      {grandTotalPercentageRow.passivesCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#9FC5E8' }}>
                      {grandTotalPercentageRow.detractorsCount}
                    </TableCell>
                    <NPSCell score={typeof grandTotalPercentageRow.npsScore === 'string' ? parseFloat(grandTotalPercentageRow.npsScore) || 0 : (grandTotalPercentageRow.npsScore || 0)} style={{ fontStyle: 'italic' }}>
                      {grandTotalPercentageRow.npsScore}
                    </NPSCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#9FC5E8' }}>
                      {'-'}
                    </TableCell>
                    {renderMainNpsTrendComparisonCells(grandTotalPercentageRow, { bold: true, dashOnly: true, cellBackground: '#9FC5E8' })}
                  </TableRow>
                );
              })()}
              {/* Org Level Percentage row - displayed below Grand Total (only for BU-wise dashboard) */}
              {groupByBU && sortedData.find(group => group.isOrgLevelPercentageRow) && (() => {
                const orgLevelPercentageRow = sortedData.find(group => group.isOrgLevelPercentageRow);
                return (
                  <TableRow 
                    style={{
                      backgroundColor: '#9FC5E8',
                      fontWeight: 'bold',
                      borderTop: '1px solid #3b82f6',
                      fontStyle: 'italic'
                    }}
                  >
                    <TableCell isFirstColumn>
                      {/* Empty Sr. No. for percentage row */}
                    </TableCell>
                    <TableCell isNumeric={false} style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#9FC5E8' }}>
                      {normalizeBusinessUnitDisplay(orgLevelPercentageRow.businessUnit)}
                    </TableCell>
                    {!groupByBU && (
                      <TableCell isNumeric={false} style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#9FC5E8' }}>
                        {orgLevelPercentageRow.customerName}
                      </TableCell>
                    )}
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#9FC5E8' }}>
                      {orgLevelPercentageRow.sentCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#9FC5E8' }}>
                      {orgLevelPercentageRow.receivedCount}
                    </TableCell>
                    <ResponseRateCell 
                      rate={typeof orgLevelPercentageRow.responseRate === 'number' ? orgLevelPercentageRow.responseRate : (typeof orgLevelPercentageRow.responseRate === 'string' ? parseFloat(orgLevelPercentageRow.responseRate) || 0 : 0)} 
                      surveysReceived={sortedData.find(group => group.isGrandTotal)?.receivedCount || 0}
                      style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#9FC5E8' }}
                    >
                      {typeof orgLevelPercentageRow.responseRate === 'number' ? (Math.round(orgLevelPercentageRow.responseRate * 10) / 10).toFixed(1) + '%' : orgLevelPercentageRow.responseRate}
                    </ResponseRateCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#9FC5E8' }}>
                      {orgLevelPercentageRow.predictedPromotersCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#9FC5E8' }}>
                      {orgLevelPercentageRow.predictedPassivesCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#9FC5E8' }}>
                      {orgLevelPercentageRow.predictedDetractorsCount}
                    </TableCell>
                    <NPSCell score={typeof orgLevelPercentageRow.predictedNpsScore === 'string' ? parseFloat(orgLevelPercentageRow.predictedNpsScore) || 0 : (orgLevelPercentageRow.predictedNpsScore || 0)} style={{ fontStyle: 'italic' }}>
                      {orgLevelPercentageRow.predictedNpsScore}
                    </NPSCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#9FC5E8' }}>
                      {orgLevelPercentageRow.promotersCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#9FC5E8' }}>
                      {orgLevelPercentageRow.passivesCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#9FC5E8' }}>
                      {orgLevelPercentageRow.detractorsCount}
                    </TableCell>
                    <NPSCell score={typeof orgLevelPercentageRow.npsScore === 'string' ? parseFloat(orgLevelPercentageRow.npsScore) || 0 : (orgLevelPercentageRow.npsScore || 0)} style={{ fontStyle: 'italic' }}>
                      {orgLevelPercentageRow.npsScore}
                    </NPSCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#9FC5E8' }}>
                      {'-'}
                    </TableCell>
                    {renderMainNpsTrendComparisonCells(orgLevelPercentageRow, { bold: true, dashOnly: true, cellBackground: '#9FC5E8' })}
                  </TableRow>
                );
              })()}
              {/* Percentage row for Top10 - displayed below Grand Total and above Other Account */}
              {sortedData.find(group => group.isPercentageRow) && (() => {
                const percentageRow = sortedData.find(group => group.isPercentageRow);
                return (
                  <TableRow 
                    style={{
                      backgroundColor: '#FFEB9C', // Light Yellow 2
                      fontWeight: 'bold',
                      borderTop: '1px solid #3b82f6',
                      fontStyle: 'italic'
                    }}
                  >
                    <TableCell isFirstColumn>
                      {/* Empty Sr. No. for percentage row */}
                    </TableCell>
                    <TableCell isNumeric={false} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                      {normalizeBusinessUnitDisplay(percentageRow.businessUnit)}
                    </TableCell>
                    {!groupByBU && (
                      <TableCell isNumeric={false} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                        {percentageRow.customerName}
                      </TableCell>
                    )}
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                      {percentageRow.sentCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                      {percentageRow.receivedCount}
                    </TableCell>
                    <ResponseRateCell 
                      rate={typeof percentageRow.responseRate === 'number' ? percentageRow.responseRate : (typeof percentageRow.responseRate === 'string' ? parseFloat(percentageRow.responseRate) || 0 : 0)} 
                      surveysReceived={sortedData.find(group => group.isGrandTotal && showTop10)?.receivedCount || 0}
                      style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#FFEB9C' }}
                    >
                      {typeof percentageRow.responseRate === 'number' ? (Math.round(percentageRow.responseRate * 10) / 10).toFixed(1) + '%' : percentageRow.responseRate}
                    </ResponseRateCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                      {percentageRow.predictedPromotersCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                      {percentageRow.predictedPassivesCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                      {percentageRow.predictedDetractorsCount}
                    </TableCell>
                    <NPSCell score={typeof percentageRow.predictedNpsScore === 'string' ? parseFloat(percentageRow.predictedNpsScore) || 0 : (percentageRow.predictedNpsScore || 0)} style={{ fontStyle: 'italic', backgroundColor: '#FFEB9C' }}>
                      {percentageRow.predictedNpsScore}
                    </NPSCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                      {percentageRow.promotersCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                      {percentageRow.passivesCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                      {percentageRow.detractorsCount}
                    </TableCell>
                    <NPSCell score={typeof percentageRow.npsScore === 'string' ? parseFloat(percentageRow.npsScore) || 0 : (percentageRow.npsScore || 0)} style={{ fontStyle: 'italic', backgroundColor: '#FFEB9C' }}>
                      {percentageRow.npsScore === '-' || percentageRow.npsScore === null || percentageRow.npsScore === undefined 
                        ? '-' 
                        : (typeof percentageRow.npsScore === 'number' 
                          ? (Math.round(percentageRow.npsScore * 100) / 100).toFixed(2)
                          : percentageRow.npsScore)}
                    </NPSCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#FFEB9C' }}>
                      {'-'}
                    </TableCell>
                  </TableRow>
                );
              })()}
              {/* Other Account row - displayed below percentage row */}
              {sortedData.find(group => group.isOtherAccount) && (() => {
                const otherAccount = sortedData.find(group => group.isOtherAccount);
                return (
                  <TableRow 
                    style={{
                      backgroundColor: '#B4C6E7',
                      fontWeight: 'bold',
                      borderTop: '2px solid #f59e0b'
                    }}
                  >
                    <TableCell isFirstColumn isNumeric={false}>
                      {/* Empty Sr. No. for Other Account row */}
                    </TableCell>
                    <TableCell isNumeric={false} style={{ fontWeight: 'bold' }}>
                      {normalizeBusinessUnitDisplay(otherAccount.businessUnit)}
                    </TableCell>
                    {!groupByBU && (
                      <TableCell isNumeric={false} style={{ fontWeight: 'bold' }}>
                        {otherAccount.customerName}
                      </TableCell>
                    )}
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold' }}>
                      {otherAccount.sentCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold' }}>
                      {otherAccount.receivedCount}
                    </TableCell>
                    <ResponseRateCell 
                      rate={otherAccount.responseRate || 0} 
                      surveysReceived={otherAccount.receivedCount || 0}
                      style={{ fontWeight: 'bold' }}
                    >
                      {otherAccount.sentCount === 0 ? '-' : (Math.round((otherAccount.responseRate || 0) * 10) / 10).toFixed(1) + '%'}
                    </ResponseRateCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold' }}>
                      {otherAccount.receivedCount === 0 ? '-' : (otherAccount.predictedPromotersCount || 0)}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold' }}>
                      {otherAccount.receivedCount === 0 ? '-' : (otherAccount.predictedPassivesCount || 0)}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold' }}>
                      {otherAccount.receivedCount === 0 ? '-' : (otherAccount.predictedDetractorsCount || 0)}
                    </TableCell>
                    <NPSCell score={otherAccount.predictedNpsScore || 0}>
                      {otherAccount.receivedCount === 0 ? '-' : (Math.round((otherAccount.predictedNpsScore || 0) * 100) / 100).toFixed(2)}
                    </NPSCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold' }}>
                      {otherAccount.receivedCount === 0 ? '-' : (otherAccount.promotersCount || 0)}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold' }}>
                      {otherAccount.receivedCount === 0 ? '-' : (otherAccount.passivesCount || 0)}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold' }}>
                      {otherAccount.receivedCount === 0 ? '-' : (otherAccount.detractorsCount || 0)}
                    </TableCell>
                    <NPSCell score={otherAccount.npsScore || 0}>
                      {otherAccount.receivedCount === 0 ? '-' : (Math.round((otherAccount.npsScore || 0) * 100) / 100).toFixed(2)}
                    </NPSCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold' }}>
                      {otherAccount.receivedCount === 0 ? '-' : (otherAccount.npsAvgRating == null ? '-' : (Math.round(Number(otherAccount.npsAvgRating) * 100) / 100).toFixed(2))}
                    </TableCell>
                  </TableRow>
                );
              })()}
              {/* Other Account percentage row - displayed below Other Account row */}
              {sortedData.find(group => group.isOtherAccountPercentageRow) && (() => {
                const otherAccountPercentageRow = sortedData.find(group => group.isOtherAccountPercentageRow);
                return (
                  <TableRow 
                    style={{
                      backgroundColor: '#B4C6E7', // Light Blue 2
                      fontWeight: 'bold',
                      borderTop: '1px solid #3b82f6',
                      fontStyle: 'italic'
                    }}
                  >
                    <TableCell isFirstColumn>
                      {/* Empty Sr. No. for Other Account percentage row */}
                    </TableCell>
                    <TableCell isNumeric={false} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                      {normalizeBusinessUnitDisplay(otherAccountPercentageRow.businessUnit)}
                    </TableCell>
                    {!groupByBU && (
                      <TableCell isNumeric={false} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                        {otherAccountPercentageRow.customerName}
                      </TableCell>
                    )}
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                      {otherAccountPercentageRow.sentCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                      {otherAccountPercentageRow.receivedCount}
                    </TableCell>
                    <ResponseRateCell 
                      rate={typeof otherAccountPercentageRow.responseRate === 'number' ? otherAccountPercentageRow.responseRate : (typeof otherAccountPercentageRow.responseRate === 'string' ? parseFloat(otherAccountPercentageRow.responseRate) || 0 : 0)} 
                      surveysReceived={sortedData.find(group => group.isOtherAccount)?.receivedCount || 0}
                      style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#B4C6E7' }}
                    >
                      {typeof otherAccountPercentageRow.responseRate === 'number' ? (Math.round(otherAccountPercentageRow.responseRate * 10) / 10).toFixed(1) + '%' : otherAccountPercentageRow.responseRate}
                    </ResponseRateCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                      {otherAccountPercentageRow.predictedPromotersCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                      {otherAccountPercentageRow.predictedPassivesCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                      {otherAccountPercentageRow.predictedDetractorsCount}
                    </TableCell>
                    <NPSCell score={typeof otherAccountPercentageRow.predictedNpsScore === 'string' ? parseFloat(otherAccountPercentageRow.predictedNpsScore) || 0 : (otherAccountPercentageRow.predictedNpsScore || 0)} style={{ fontStyle: 'italic', backgroundColor: '#B4C6E7' }}>
                      {otherAccountPercentageRow.predictedNpsScore}
                    </NPSCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                      {otherAccountPercentageRow.promotersCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                      {otherAccountPercentageRow.passivesCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                      {otherAccountPercentageRow.detractorsCount}
                    </TableCell>
                    <NPSCell score={typeof otherAccountPercentageRow.npsScore === 'string' ? parseFloat(otherAccountPercentageRow.npsScore) || 0 : (otherAccountPercentageRow.npsScore || 0)} style={{ fontStyle: 'italic', backgroundColor: '#B4C6E7' }}>
                      {otherAccountPercentageRow.npsScore === '-' || otherAccountPercentageRow.npsScore === null || otherAccountPercentageRow.npsScore === undefined 
                        ? '-' 
                        : (typeof otherAccountPercentageRow.npsScore === 'number' 
                          ? (Math.round(otherAccountPercentageRow.npsScore * 100) / 100).toFixed(2)
                          : otherAccountPercentageRow.npsScore)}
                    </NPSCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#B4C6E7' }}>
                      {'-'}
                    </TableCell>
                  </TableRow>
                );
              })()}
              {/* Overall row - displayed below Other Account percentage row */}
              {sortedData.find(group => group.isOverallRow) && (() => {
                const overallRow = sortedData.find(group => group.isOverallRow);
                return (
                  <TableRow 
                    style={{
                      backgroundColor: '#D9D2E9',
                      fontWeight: 'bold',
                      borderTop: '1px solid #3b82f6'
                    }}
                  >
                    <TableCell isFirstColumn>
                      {/* Empty Sr. No. for Overall row */}
                    </TableCell>
                    <TableCell isNumeric={false} style={{ fontWeight: 'bold' }}>
                      {normalizeBusinessUnitDisplay(overallRow.businessUnit)}
                    </TableCell>
                    {!groupByBU && (
                      <TableCell isNumeric={false} style={{ fontWeight: 'bold' }}>
                        {overallRow.customerName}
                      </TableCell>
                    )}
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold' }}>
                      {overallRow.sentCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold' }}>
                      {overallRow.receivedCount}
                    </TableCell>
                    <ResponseRateCell 
                      rate={typeof overallRow.responseRate === 'number' ? overallRow.responseRate : 0} 
                      surveysReceived={overallRow.receivedCount || 0}
                      style={{ fontWeight: 'bold' }}
                    >
                      {typeof overallRow.responseRate === 'number' ? (Math.round(overallRow.responseRate * 10) / 10).toFixed(1) + '%' : overallRow.responseRate}
                    </ResponseRateCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold' }}>
                      {overallRow.predictedPromotersCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold' }}>
                      {overallRow.predictedPassivesCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold' }}>
                      {overallRow.predictedDetractorsCount}
                    </TableCell>
                    <NPSCell score={typeof overallRow.predictedNpsScore === 'number' ? overallRow.predictedNpsScore : 0} style={{ fontWeight: 'bold' }}>
                      {typeof overallRow.predictedNpsScore === 'number' ? (Math.round(overallRow.predictedNpsScore * 100) / 100).toFixed(2) : overallRow.predictedNpsScore}
                    </NPSCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold' }}>
                      {overallRow.promotersCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold' }}>
                      {overallRow.passivesCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold' }}>
                      {overallRow.detractorsCount}
                    </TableCell>
                    <NPSCell score={typeof overallRow.npsScore === 'number' ? overallRow.npsScore : 0} style={{ fontWeight: 'bold' }}>
                      {typeof overallRow.npsScore === 'number' ? (Math.round(overallRow.npsScore * 100) / 100).toFixed(2) : overallRow.npsScore}
                    </NPSCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold' }}>
                      {overallRow.receivedCount === 0 ? '-' : (overallRow.npsAvgRating == null ? '-' : (Math.round(Number(overallRow.npsAvgRating) * 100) / 100).toFixed(2))}
                    </TableCell>
                  </TableRow>
                );
              })()}
              {/* Overall percentage row - displayed below Overall row */}
              {sortedData.find(group => group.isOverallPercentageRow) && (() => {
                const overallPercentageRow = sortedData.find(group => group.isOverallPercentageRow);
                return (
                  <TableRow 
                    style={{
                      backgroundColor: '#D9D2E9', // Light Purple 3
                      fontWeight: 'bold',
                      fontStyle: 'italic'
                    }}
                  >
                    <TableCell isFirstColumn>
                      {/* Empty Sr. No. for Overall percentage row */}
                    </TableCell>
                    <TableCell isNumeric={false} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                      {normalizeBusinessUnitDisplay(overallPercentageRow.businessUnit)}
                    </TableCell>
                    {!groupByBU && (
                      <TableCell isNumeric={false} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                        {overallPercentageRow.customerName}
                      </TableCell>
                    )}
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                      {overallPercentageRow.sentCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                      {overallPercentageRow.receivedCount}
                    </TableCell>
                    <ResponseRateCell 
                      rate={0} 
                      surveysReceived={0}
                      style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#D9D2E9' }}
                    >
                      {overallPercentageRow.responseRate}
                    </ResponseRateCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                      {overallPercentageRow.predictedPromotersCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                      {overallPercentageRow.predictedPassivesCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                      {overallPercentageRow.predictedDetractorsCount}
                    </TableCell>
                    <NPSCell score={overallPercentageRow.predictedNpsScore === '-' || overallPercentageRow.predictedNpsScore === null || overallPercentageRow.predictedNpsScore === undefined ? '-' : (overallPercentageRow.predictedNpsScore || 0)} style={{ fontStyle: 'italic', backgroundColor: '#D9D2E9' }}>
                      {overallPercentageRow.predictedNpsScore}
                    </NPSCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                      {overallPercentageRow.promotersCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                      {overallPercentageRow.passivesCount}
                    </TableCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                      {overallPercentageRow.detractorsCount}
                    </TableCell>
                    <NPSCell score={overallPercentageRow.npsScore === '-' || overallPercentageRow.npsScore === null || overallPercentageRow.npsScore === undefined ? '-' : (overallPercentageRow.npsScore || 0)} style={{ fontStyle: 'italic', backgroundColor: '#D9D2E9' }}>
                      {overallPercentageRow.npsScore === '-' || overallPercentageRow.npsScore === null || overallPercentageRow.npsScore === undefined 
                        ? '-' 
                        : (typeof overallPercentageRow.npsScore === 'number' 
                          ? (Math.round(overallPercentageRow.npsScore * 100) / 100).toFixed(2)
                          : overallPercentageRow.npsScore)}
                    </NPSCell>
                    <TableCell isNumeric={true} style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#D9D2E9' }}>
                      {'-'}
                    </TableCell>
                  </TableRow>
                );
              })()}
            </TableBody>
          </Table>
        )}
      </TableContainer>
      )}

      {isAccountWiseNpsView && showAcsatTrendAnalysis && (
        <div ref={acsatTrendSectionRef} style={{ marginTop: '2rem' }}>
          <div style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
            color: 'white',
            borderRadius: '12px 12px 0 0',
            fontWeight: 600,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} />
              ACSAT: Account Wise NPS Trend Analysis (from uploaded trend files)
            </div>
            {trendAnalysisFiles?.length > 0 && (
              <DownloadButton
                type="button"
                onClick={() => downloadNpsAccountWiseTrendExcel()}
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                <Download size={16} />
                Download Excel
              </DownloadButton>
            )}
          </div>
          <div style={{
            padding: '1rem',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderTop: 'none',
            borderRadius: '0 0 12px 12px',
          }}>
            {!trendAnalysisFiles?.length ? (
              <div style={{ padding: '0.9rem 1rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', color: '#9a3412', fontSize: '0.875rem' }}>
                No ACSAT trend files uploaded. Use &quot;Upload data for ACSAT trend analysis&quot; on the Upload ACSAT Data page.
              </div>
            ) : (
              acsatNpsTrendAnalysisData.map((fileData, idx) => (
                <div key={`acsat-nps-trend-${idx}`} style={{ marginBottom: idx < acsatNpsTrendAnalysisData.length - 1 ? '1.5rem' : 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    marginBottom: '0.75rem',
                    flexWrap: 'wrap',
                  }}>
                    <div style={{ fontWeight: 600, color: '#0f766e', fontSize: '0.9rem' }}>
                      {fileData.saveName}
                    </div>
                    {fileData.hasData && fileData.rows?.length > 0 && (
                      <DownloadButton
                        type="button"
                        onClick={() => downloadNpsAccountWiseTrendExcel(fileData, idx)}
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                      >
                        <Download size={14} />
                        Download Excel
                      </DownloadButton>
                    )}
                  </div>
                  {fileData.error && !fileData.hasData ? (
                    <div style={{ padding: '0.9rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.875rem' }}>
                      {fileData.error}
                    </div>
                  ) : (
                    <TableContainer style={{ maxHeight: '55vh' }}>
                      <Table>
                        <TableHeader>
                          <tr>
                            <TableHeaderCell colSpan={3} style={{ backgroundColor: '#1e3a8a', color: '#ffffff' }} />
                            <TableHeaderCell colSpan={3} style={{ backgroundColor: '#9FC5E8', color: '#000000', textAlign: 'center' }}>
                              Response Rate
                            </TableHeaderCell>
                            <TableHeaderCell colSpan={4} style={{ backgroundColor: '#9FC5E8', color: '#000000', textAlign: 'center' }}>
                              Predicted NPS for the surveys received
                            </TableHeaderCell>
                            <TableHeaderCell colSpan={5} style={{ backgroundColor: '#9FC5E8', color: '#000000', textAlign: 'center' }}>
                              Actual NPS
                            </TableHeaderCell>
                          </tr>
                          <tr>
                            <TableHeaderCell isFirstColumn style={{ backgroundColor: '#0f766e', color: '#ffffff' }}>Sr. No.</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#0f766e', color: '#ffffff' }}>Business Unit</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#0f766e', color: '#ffffff' }}>Account Name</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#0f766e', color: '#ffffff' }}>Polled</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#0f766e', color: '#ffffff' }}>Responded</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#0f766e', color: '#ffffff' }}>Response Rate %</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#0f766e', color: '#ffffff' }}>Number of Promoters</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#0f766e', color: '#ffffff' }}>Number of Detractors</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#0f766e', color: '#ffffff' }}>Number of Passives</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#0f766e', color: '#ffffff' }}>NPS</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#0f766e', color: '#ffffff' }}>Number of Promoters</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#0f766e', color: '#ffffff' }}>Number of Detractors</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#0f766e', color: '#ffffff' }}>Number of Passives</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#0f766e', color: '#ffffff' }}>NPS</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#0f766e', color: '#ffffff' }}>NPS score</TableHeaderCell>
                          </tr>
                        </TableHeader>
                        <TableBody>
                          {fileData.rows.map((row, rowIdx) => (
                            <TableRow key={`${fileData.saveName}-nps-trend-${rowIdx}`}>
                              <TableCell isFirstColumn>{rowIdx + 1}</TableCell>
                              <TableCell>{normalizeBusinessUnitDisplay(row.businessUnit)}</TableCell>
                              <TableCell>{row.customerName}</TableCell>
                              <TableCell isNumeric>{row.polled ?? 0}</TableCell>
                              <TableCell isNumeric>{row.responded ?? 0}</TableCell>
                              <ResponseRateCell rate={row.responseRatePct || 0} surveysReceived={row.responded || 0}>
                                {(row.responded || 0) === 0 ? '0%' : `${(row.responseRatePct || 0).toFixed(1)}%`}
                              </ResponseRateCell>
                              <TableCell isNumeric>{row.predictedPromoters ?? 0}</TableCell>
                              <TableCell isNumeric>{row.predictedDetractors ?? 0}</TableCell>
                              <TableCell isNumeric>{row.predictedPassives ?? 0}</TableCell>
                              <NPSCell score={row.predictedNps ?? 0}>
                                {(row.predictedNps ?? 0).toFixed(2)}
                              </NPSCell>
                              <TableCell isNumeric>{row.actualPromoters ?? 0}</TableCell>
                              <TableCell isNumeric>{row.actualDetractors ?? 0}</TableCell>
                              <TableCell isNumeric>{row.actualPassives ?? 0}</TableCell>
                              <NPSCell score={row.actualNps ?? 0}>
                                {(row.actualNps ?? 0).toFixed(2)}
                              </NPSCell>
                              <TableCell isNumeric>
                                {row.npsScore == null ? '-' : row.npsScore.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                          {fileData.grandTotal && (
                            <TableRow style={{ backgroundColor: '#e2e8f0', fontWeight: 'bold' }}>
                              <TableCell isFirstColumn />
                              <TableCell />
                              <TableCell style={{ fontWeight: 'bold' }}>
                                {fileData.grandTotal.customerName || 'Grand Total'}
                              </TableCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>{fileData.grandTotal.polled ?? 0}</TableCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>{fileData.grandTotal.responded ?? 0}</TableCell>
                              <ResponseRateCell
                                rate={fileData.grandTotal.responseRatePct || 0}
                                surveysReceived={fileData.grandTotal.responded || 0}
                                style={{ fontWeight: 'bold' }}
                              >
                                {(fileData.grandTotal.responded || 0) === 0
                                  ? '0%'
                                  : `${(fileData.grandTotal.responseRatePct || 0).toFixed(1)}%`}
                              </ResponseRateCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>{fileData.grandTotal.predictedPromoters ?? 0}</TableCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>{fileData.grandTotal.predictedDetractors ?? 0}</TableCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>{fileData.grandTotal.predictedPassives ?? 0}</TableCell>
                              <NPSCell score={fileData.grandTotal.predictedNps ?? 0} style={{ fontWeight: 'bold' }}>
                                {(fileData.grandTotal.predictedNps ?? 0).toFixed(2)}
                              </NPSCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>{fileData.grandTotal.actualPromoters ?? 0}</TableCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>{fileData.grandTotal.actualDetractors ?? 0}</TableCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>{fileData.grandTotal.actualPassives ?? 0}</TableCell>
                              <NPSCell score={fileData.grandTotal.actualNps ?? 0} style={{ fontWeight: 'bold' }}>
                                {(fileData.grandTotal.actualNps ?? 0).toFixed(2)}
                              </NPSCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>
                                {fileData.grandTotal.npsScore == null
                                  ? '-'
                                  : fileData.grandTotal.npsScore.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </div>
              ))
            )}
            {trendAnalysisFiles?.length > 0 && acsatNpsTrendAnalysisData.some((f) => f.hasData && f.rows?.length) && (
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <DownloadButton
                  type="button"
                  onClick={() => downloadNpsAccountWiseTrendExcel()}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  <Download size={16} />
                  Download All Trend Files (Excel)
                </DownloadButton>
              </div>
            )}
          </div>
        </div>
      )}

      {isTop10NpsView && showAcsatTrendAnalysis && (
        <div ref={acsatTop10TrendSectionRef} style={{ marginTop: '2rem' }}>
          <div style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, #b45309 0%, #92400e 100%)',
            color: 'white',
            borderRadius: '12px 12px 0 0',
            fontWeight: 600,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} />
              ACSAT: Top 10 Account Wise NPS Trend Analysis (from uploaded trend files)
            </div>
            {trendAnalysisFiles?.length > 0 && (
              <DownloadButton
                type="button"
                onClick={() => downloadNpsTop10TrendExcel()}
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                <Download size={16} />
                Download Excel
              </DownloadButton>
            )}
          </div>
          <div style={{
            padding: '1rem',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderTop: 'none',
            borderRadius: '0 0 12px 12px',
          }}>
            {!trendAnalysisFiles?.length ? (
              <div style={{ padding: '0.9rem 1rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', color: '#9a3412', fontSize: '0.875rem' }}>
                No ACSAT trend files uploaded. Use &quot;Upload data for ACSAT trend analysis&quot; on the Upload ACSAT Data page.
              </div>
            ) : (
              acsatTop10NpsTrendAnalysisData.map((fileData, idx) => (
                <div key={`acsat-top10-nps-trend-${idx}`} style={{ marginBottom: idx < acsatTop10NpsTrendAnalysisData.length - 1 ? '1.5rem' : 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    marginBottom: '0.75rem',
                    flexWrap: 'wrap',
                  }}>
                    <div style={{ fontWeight: 600, color: '#b45309', fontSize: '0.9rem' }}>
                      {fileData.saveName}
                    </div>
                    {fileData.hasData && fileData.rows?.length > 0 && (
                      <DownloadButton
                        type="button"
                        onClick={() => downloadNpsTop10TrendExcel(fileData, idx)}
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                      >
                        <Download size={14} />
                        Download Excel
                      </DownloadButton>
                    )}
                  </div>
                  {fileData.error && !fileData.hasData ? (
                    <div style={{ padding: '0.9rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.875rem' }}>
                      {fileData.error}
                    </div>
                  ) : (
                    <TableContainer style={{ maxHeight: '55vh' }}>
                      <Table>
                        <TableHeader>
                          <tr>
                            <TableHeaderCell colSpan={3} style={{ backgroundColor: '#1e3a8a', color: '#ffffff' }} />
                            <TableHeaderCell colSpan={3} style={{ backgroundColor: '#9FC5E8', color: '#000000', textAlign: 'center' }}>
                              Response Rate
                            </TableHeaderCell>
                            <TableHeaderCell colSpan={4} style={{ backgroundColor: '#9FC5E8', color: '#000000', textAlign: 'center' }}>
                              Predicted NPS for the surveys received
                            </TableHeaderCell>
                            <TableHeaderCell colSpan={4} style={{ backgroundColor: '#9FC5E8', color: '#000000', textAlign: 'center' }}>
                              Actual NPS
                            </TableHeaderCell>
                          </tr>
                          <tr>
                            <TableHeaderCell isFirstColumn style={{ backgroundColor: '#b45309', color: '#ffffff' }}>Sr. No.</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#b45309', color: '#ffffff' }}>Business Unit</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#b45309', color: '#ffffff' }}>Account Name</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#b45309', color: '#ffffff' }}>Polled</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#b45309', color: '#ffffff' }}>Responded</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#b45309', color: '#ffffff' }}>Response Rate %</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#b45309', color: '#ffffff' }}>Number of Promoters</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#b45309', color: '#ffffff' }}>Number of Detractors</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#b45309', color: '#ffffff' }}>Number of Passives</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#b45309', color: '#ffffff' }}>NPS</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#b45309', color: '#ffffff' }}>Number of Promoters</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#b45309', color: '#ffffff' }}>Number of Detractors</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#b45309', color: '#ffffff' }}>Number of Passives</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#b45309', color: '#ffffff' }}>NPS</TableHeaderCell>
                          </tr>
                        </TableHeader>
                        <TableBody>
                          {fileData.rows.map((row, rowIdx) => (
                            <TableRow key={`${fileData.saveName}-top10-nps-trend-${rowIdx}`}>
                              <TableCell isFirstColumn>{rowIdx + 1}</TableCell>
                              <TableCell>{normalizeBusinessUnitDisplay(row.businessUnit)}</TableCell>
                              <TableCell>{row.customerName}</TableCell>
                              <TableCell isNumeric>{row.polled ?? 0}</TableCell>
                              <TableCell isNumeric>{row.responded ?? 0}</TableCell>
                              <ResponseRateCell rate={row.responseRatePct || 0} surveysReceived={row.responded || 0}>
                                {(row.responded || 0) === 0 ? '0%' : `${(row.responseRatePct || 0).toFixed(1)}%`}
                              </ResponseRateCell>
                              <TableCell isNumeric>{row.predictedPromoters ?? 0}</TableCell>
                              <TableCell isNumeric>{row.predictedDetractors ?? 0}</TableCell>
                              <TableCell isNumeric>{row.predictedPassives ?? 0}</TableCell>
                              <NPSCell score={row.predictedNps ?? 0}>
                                {(row.predictedNps ?? 0).toFixed(2)}
                              </NPSCell>
                              <TableCell isNumeric>{row.actualPromoters ?? 0}</TableCell>
                              <TableCell isNumeric>{row.actualDetractors ?? 0}</TableCell>
                              <TableCell isNumeric>{row.actualPassives ?? 0}</TableCell>
                              <NPSCell score={row.actualNps ?? 0}>
                                {(row.actualNps ?? 0).toFixed(2)}
                              </NPSCell>
                            </TableRow>
                          ))}
                          {fileData.grandTotal && (
                            <TableRow style={{ backgroundColor: '#FFE699', fontWeight: 'bold' }}>
                              <TableCell isFirstColumn />
                              <TableCell />
                              <TableCell style={{ fontWeight: 'bold' }}>
                                {fileData.grandTotal.customerName || 'Top 10 Accounts'}
                              </TableCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>{fileData.grandTotal.polled ?? 0}</TableCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>{fileData.grandTotal.responded ?? 0}</TableCell>
                              <ResponseRateCell
                                rate={fileData.grandTotal.responseRatePct || 0}
                                surveysReceived={fileData.grandTotal.responded || 0}
                                style={{ fontWeight: 'bold' }}
                              >
                                {(fileData.grandTotal.responded || 0) === 0
                                  ? '0%'
                                  : `${(fileData.grandTotal.responseRatePct || 0).toFixed(1)}%`}
                              </ResponseRateCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>{fileData.grandTotal.predictedPromoters ?? 0}</TableCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>{fileData.grandTotal.predictedDetractors ?? 0}</TableCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>{fileData.grandTotal.predictedPassives ?? 0}</TableCell>
                              <NPSCell score={fileData.grandTotal.predictedNps ?? 0} style={{ fontWeight: 'bold' }}>
                                {(fileData.grandTotal.predictedNps ?? 0).toFixed(2)}
                              </NPSCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>{fileData.grandTotal.actualPromoters ?? 0}</TableCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>{fileData.grandTotal.actualDetractors ?? 0}</TableCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>{fileData.grandTotal.actualPassives ?? 0}</TableCell>
                              <NPSCell score={fileData.grandTotal.actualNps ?? 0} style={{ fontWeight: 'bold' }}>
                                {(fileData.grandTotal.actualNps ?? 0).toFixed(2)}
                              </NPSCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </div>
              ))
            )}
            {trendAnalysisFiles?.length > 0 && acsatTop10NpsTrendAnalysisData.some((f) => f.hasData && f.rows?.length) && (
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <DownloadButton
                  type="button"
                  onClick={() => downloadNpsTop10TrendExcel()}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  <Download size={16} />
                  Download All Trend Files (Excel)
                </DownloadButton>
              </div>
            )}
          </div>
        </div>
      )}

      {isBuWiseNpsView && showAcsatTrendAnalysis && (
        <div ref={acsatBuTrendSectionRef} style={{ marginTop: '2rem' }}>
          <div style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, #4338ca 0%, #3730a3 100%)',
            color: 'white',
            borderRadius: '12px 12px 0 0',
            fontWeight: 600,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} />
              ACSAT: BU Wise NPS Trend Analysis (from uploaded trend files)
            </div>
            {trendAnalysisFiles?.length > 0 && (
              <DownloadButton
                type="button"
                onClick={() => downloadNpsBuWiseTrendExcel()}
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                <Download size={16} />
                Download Excel
              </DownloadButton>
            )}
          </div>
          <div style={{
            padding: '1rem',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderTop: 'none',
            borderRadius: '0 0 12px 12px',
          }}>
            {!trendAnalysisFiles?.length ? (
              <div style={{ padding: '0.9rem 1rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', color: '#9a3412', fontSize: '0.875rem' }}>
                No ACSAT trend files uploaded. Use &quot;Upload data for ACSAT trend analysis&quot; on the Upload ACSAT Data page.
              </div>
            ) : (
              acsatBuNpsTrendAnalysisData.map((fileData, idx) => (
                <div key={`acsat-bu-nps-trend-${idx}`} style={{ marginBottom: idx < acsatBuNpsTrendAnalysisData.length - 1 ? '1.5rem' : 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    marginBottom: '0.75rem',
                    flexWrap: 'wrap',
                  }}>
                    <div style={{ fontWeight: 600, color: '#4338ca', fontSize: '0.9rem' }}>
                      {fileData.saveName}
                    </div>
                    {fileData.hasData && fileData.rows?.length > 0 && (
                      <DownloadButton
                        type="button"
                        onClick={() => downloadNpsBuWiseTrendExcel(fileData, idx)}
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                      >
                        <Download size={14} />
                        Download Excel
                      </DownloadButton>
                    )}
                  </div>
                  {fileData.error && !fileData.hasData ? (
                    <div style={{ padding: '0.9rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.875rem' }}>
                      {fileData.error}
                    </div>
                  ) : (
                    <TableContainer style={{ maxHeight: '55vh' }}>
                      <Table>
                        <TableHeader>
                          <tr>
                            <TableHeaderCell colSpan={2} style={{ backgroundColor: '#1e3a8a', color: '#ffffff' }} />
                            <TableHeaderCell colSpan={3} style={{ backgroundColor: '#9FC5E8', color: '#000000', textAlign: 'center' }}>
                              Response Rate
                            </TableHeaderCell>
                            <TableHeaderCell colSpan={4} style={{ backgroundColor: '#9FC5E8', color: '#000000', textAlign: 'center' }}>
                              Predicted NPS for the surveys received
                            </TableHeaderCell>
                            <TableHeaderCell colSpan={5} style={{ backgroundColor: '#9FC5E8', color: '#000000', textAlign: 'center' }}>
                              Actual NPS
                            </TableHeaderCell>
                          </tr>
                          <tr>
                            <TableHeaderCell isFirstColumn style={{ backgroundColor: '#4338ca', color: '#ffffff' }}>Sr. No.</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#4338ca', color: '#ffffff' }}>Business Unit</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#4338ca', color: '#ffffff' }}>Polled</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#4338ca', color: '#ffffff' }}>Responded</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#4338ca', color: '#ffffff' }}>Response Rate %</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#4338ca', color: '#ffffff' }}>Number of Promoters</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#4338ca', color: '#ffffff' }}>Number of Detractors</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#4338ca', color: '#ffffff' }}>Number of Passives</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#4338ca', color: '#ffffff' }}>NPS</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#4338ca', color: '#ffffff' }}>Number of Promoters</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#4338ca', color: '#ffffff' }}>Number of Detractors</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#4338ca', color: '#ffffff' }}>Number of Passives</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#4338ca', color: '#ffffff' }}>NPS</TableHeaderCell>
                            <TableHeaderCell style={{ backgroundColor: '#4338ca', color: '#ffffff' }}>NPS score</TableHeaderCell>
                          </tr>
                        </TableHeader>
                        <TableBody>
                          {fileData.rows.map((row, rowIdx) => (
                            <TableRow key={`${fileData.saveName}-bu-nps-trend-${rowIdx}`}>
                              <TableCell isFirstColumn>{rowIdx + 1}</TableCell>
                              <TableCell>{normalizeBusinessUnitDisplay(row.businessUnit)}</TableCell>
                              <TableCell isNumeric>{row.polled ?? 0}</TableCell>
                              <TableCell isNumeric>{row.responded ?? 0}</TableCell>
                              <ResponseRateCell rate={row.responseRatePct || 0} surveysReceived={row.responded || 0}>
                                {(row.responded || 0) === 0 ? '0%' : `${(row.responseRatePct || 0).toFixed(1)}%`}
                              </ResponseRateCell>
                              <TableCell isNumeric>{row.predictedPromoters ?? 0}</TableCell>
                              <TableCell isNumeric>{row.predictedDetractors ?? 0}</TableCell>
                              <TableCell isNumeric>{row.predictedPassives ?? 0}</TableCell>
                              <NPSCell score={row.predictedNps ?? 0}>
                                {(row.predictedNps ?? 0).toFixed(2)}
                              </NPSCell>
                              <TableCell isNumeric>{row.actualPromoters ?? 0}</TableCell>
                              <TableCell isNumeric>{row.actualDetractors ?? 0}</TableCell>
                              <TableCell isNumeric>{row.actualPassives ?? 0}</TableCell>
                              <NPSCell score={row.actualNps ?? 0}>
                                {(row.actualNps ?? 0).toFixed(2)}
                              </NPSCell>
                              <TableCell isNumeric>
                                {row.npsScore == null ? '-' : row.npsScore.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                          {fileData.grandTotal && (
                            <TableRow style={{ backgroundColor: '#e2e8f0', fontWeight: 'bold' }}>
                              <TableCell isFirstColumn />
                              <TableCell style={{ fontWeight: 'bold' }}>
                                {fileData.grandTotal.customerName || 'Org Level'}
                              </TableCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>{fileData.grandTotal.polled ?? 0}</TableCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>{fileData.grandTotal.responded ?? 0}</TableCell>
                              <ResponseRateCell
                                rate={fileData.grandTotal.responseRatePct || 0}
                                surveysReceived={fileData.grandTotal.responded || 0}
                                style={{ fontWeight: 'bold' }}
                              >
                                {(fileData.grandTotal.responded || 0) === 0
                                  ? '0%'
                                  : `${(fileData.grandTotal.responseRatePct || 0).toFixed(1)}%`}
                              </ResponseRateCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>{fileData.grandTotal.predictedPromoters ?? 0}</TableCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>{fileData.grandTotal.predictedDetractors ?? 0}</TableCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>{fileData.grandTotal.predictedPassives ?? 0}</TableCell>
                              <NPSCell score={fileData.grandTotal.predictedNps ?? 0} style={{ fontWeight: 'bold' }}>
                                {(fileData.grandTotal.predictedNps ?? 0).toFixed(2)}
                              </NPSCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>{fileData.grandTotal.actualPromoters ?? 0}</TableCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>{fileData.grandTotal.actualDetractors ?? 0}</TableCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>{fileData.grandTotal.actualPassives ?? 0}</TableCell>
                              <NPSCell score={fileData.grandTotal.actualNps ?? 0} style={{ fontWeight: 'bold' }}>
                                {(fileData.grandTotal.actualNps ?? 0).toFixed(2)}
                              </NPSCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>
                                {fileData.grandTotal.npsScore == null
                                  ? '-'
                                  : fileData.grandTotal.npsScore.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </div>
              ))
            )}
            {trendAnalysisFiles?.length > 0 && acsatBuNpsTrendAnalysisData.some((f) => f.hasData && f.rows?.length) && (
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <DownloadButton
                  type="button"
                  onClick={() => downloadNpsBuWiseTrendExcel()}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  <Download size={16} />
                  Download All Trend Files (Excel)
                </DownloadButton>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardContainer>
  );
};

export default NPSDashboard;
