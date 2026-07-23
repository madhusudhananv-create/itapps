import React from 'react';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const ChartsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const ChartTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #374151;
  font-size: 1.125rem;
  font-weight: 600;
`;

const ChartSubtitle = styled.p`
  margin: 0 0 1.5rem 0;
  color: #6b7280;
  font-size: 0.875rem;
`;

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

const AnalyticsCharts = ({ data }) => {
  // Calculate average score by account
  const accountScores = data.reduce((acc, item) => {
    if (!acc[item.account]) {
      acc[item.account] = { total: 0, count: 0 };
    }
    acc[item.account].total += item.score;
    acc[item.account].count += 1;
    return acc;
  }, {});

  const accountChartData = Object.entries(accountScores).map(([account, { total, count }]) => ({
    account: account.length > 15 ? account.substring(0, 15) + '...' : account,
    averageScore: (total / count).toFixed(1),
    fullAccount: account
  }));

  // Calculate average score by business unit
  const buScores = data.reduce((acc, item) => {
    if (!acc[item.bu]) {
      acc[item.bu] = { total: 0, count: 0 };
    }
    acc[item.bu].total += item.score;
    acc[item.bu].count += 1;
    return acc;
  }, {});

  const buChartData = Object.entries(buScores).map(([bu, { total, count }]) => ({
    bu: bu.length > 20 ? bu.substring(0, 20) + '...' : bu,
    averageScore: (total / count).toFixed(1),
    fullBU: bu
  }));

  // Score distribution
  const scoreDistribution = data.reduce((acc, item) => {
    const scoreRange = item.score >= 4.5 ? '4.5-5.0' : 
                      item.score >= 4.0 ? '4.0-4.4' : 
                      item.score >= 3.5 ? '3.5-3.9' : '3.0-3.4';
    
    acc[scoreRange] = (acc[scoreRange] || 0) + 1;
    return acc;
  }, {});

  const scoreChartData = Object.entries(scoreDistribution).map(([range, count]) => ({
    range,
    count,
    percentage: ((count / data.length) * 100).toFixed(1)
  }));

  // Project performance
  const projectScores = data.reduce((acc, item) => {
    if (!acc[item.project]) {
      acc[item.project] = { total: 0, count: 0 };
    }
    acc[item.project].total += item.score;
    acc[item.project].count += 1;
    return acc;
  }, {});

  const projectChartData = Object.entries(projectScores)
    .map(([project, { total, count }]) => ({
      project: project.length > 20 ? project.substring(0, 20) + '...' : project,
      averageScore: (total / count).toFixed(1),
      fullProject: project
    }))
    .sort((a, b) => parseFloat(b.averageScore) - parseFloat(a.averageScore))
    .slice(0, 8);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>{label}</p>
          <p style={{ margin: 0, color: '#6b7280' }}>
            Average Score: <span style={{ color: '#374151', fontWeight: '600' }}>{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>{payload[0].name}</p>
          <p style={{ margin: 0, color: '#6b7280' }}>
            Count: <span style={{ color: '#374151', fontWeight: '600' }}>{payload[0].value}</span>
          </p>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>
            ({((payload[0].value / data.length) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartsContainer>
      <ChartCard>
        <ChartTitle>Average CSAT Score by Account</ChartTitle>
        <ChartSubtitle>Performance comparison across different accounts</ChartSubtitle>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={accountChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="account" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis 
              domain={[0, 5]}
              tickCount={6}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="averageScore" fill="#667eea" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard>
        <ChartTitle>Average CSAT Score by Business Unit</ChartTitle>
        <ChartSubtitle>Performance across different business units</ChartSubtitle>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={buChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="bu" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis 
              domain={[0, 5]}
              tickCount={6}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="averageScore" fill="#764ba2" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard>
        <ChartTitle>Score Distribution</ChartTitle>
        <ChartSubtitle>Distribution of CSAT scores across all responses</ChartSubtitle>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={scoreChartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ range, percentage }) => `${range} (${percentage}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {scoreChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard>
        <ChartTitle>Top Projects by CSAT Score</ChartTitle>
        <ChartSubtitle>Best performing projects based on customer satisfaction</ChartSubtitle>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={projectChartData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              type="number"
              domain={[0, 5]}
              tickCount={6}
              fontSize={12}
            />
            <YAxis 
              dataKey="project" 
              type="category"
              width={120}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="averageScore" fill="#4facfe" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </ChartsContainer>
  );
};

export default AnalyticsCharts; 