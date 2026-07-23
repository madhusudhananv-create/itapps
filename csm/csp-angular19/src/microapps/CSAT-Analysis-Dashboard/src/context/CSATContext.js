import React, { createContext, useContext, useState } from 'react';

// Create the CSAT context
const CSATContext = createContext();

// Custom hook to use the CSAT context
export const useCSATContext = () => {
  const context = useContext(CSATContext);
  if (!context) {
    throw new Error('useCSATContext must be used within a CSATProvider');
  }
  return context;
};

// CSAT Provider component
export const CSATProvider = ({ children }) => {
  const [csatCycleStartDate, setCsatCycleStartDate] = useState(null);
  const [csatCycleStartDateFormatted, setCsatCycleStartDateFormatted] = useState('');
  const [acsatCycle, setAcsatCycle] = useState('');
  // ACSAT trend analysis files (session-persisted; used by ACSAT dashboards for H1 vs H2 comparison)
  const [acsatTrendAnalysisFiles, setAcsatTrendAnalysisFiles] = useState([]);

  const addAcsatTrendFile = (fileEntry) => {
    setAcsatTrendAnalysisFiles(prev => {
      let saveName = fileEntry.saveName;
      const baseName = saveName;
      let counter = 1;
      while (prev.some(f => f.saveName === saveName)) {
        saveName = `${baseName} (${counter})`;
        counter += 1;
      }
      return [...prev, { ...fileEntry, saveName }];
    });
  };

  const removeAcsatTrendFile = (fileId) => {
    setAcsatTrendAnalysisFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const renameAcsatTrendFile = (fileId, newName) => {
    setAcsatTrendAnalysisFiles(prev => prev.map(f => (f.id === fileId ? { ...f, saveName: newName } : f)));
  };

  const updateCSATCycleStartDate = (date, formattedDate) => {
    setCsatCycleStartDate(date);
    setCsatCycleStartDateFormatted(formattedDate);
  };

  const updateAcsatCycle = (cycle) => {
    setAcsatCycle(cycle);
  };

  const value = {
    csatCycleStartDate,
    csatCycleStartDateFormatted,
    updateCSATCycleStartDate,
    acsatCycle,
    updateAcsatCycle,
    acsatTrendAnalysisFiles,
    addAcsatTrendFile,
    removeAcsatTrendFile,
    renameAcsatTrendFile,
  };

  return (
    <CSATContext.Provider value={value}>
      {children}
    </CSATContext.Provider>
  );
};
