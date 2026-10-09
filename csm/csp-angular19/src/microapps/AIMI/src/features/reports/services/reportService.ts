import { aimiApiClient } from '@shared/services/aimiApiClient';
import type { ReportTable } from '../utils/reportTable';

// Backs both activity reports. The columns, their titles and their order are decided by the
// database (AIMI_ACTIVITY_REPORT_COLUMN, usp_AIMI_GetActivityReport.sql), including the project
// master fields (business head, account manager, manager, head count) and the overall score, so
// nothing is added or named here: whatever comes back is what gets downloaded.

const ENDPOINT = '/api/AllSys/GetAimiActivityReport';

/** PROJECT: Manage Activities > Generate Report. MULTI: Reports page > Generate Reports. */
export type ActivityReportType = 'PROJECT' | 'MULTI';

export interface ReportDataFilters {
  projectId?: string;
  practice?: string;
  businessUnits?: string[];
  accounts?: string[];
  projects?: string[];
  practices?: string[];
}

export const reportService = {
  getActivityReport: async (
    reportType: ActivityReportType,
    filters: ReportDataFilters
  ): Promise<ReportTable> => {
    try {
      const rows =
        (await aimiApiClient.post<ReportTable['rows']>(ENDPOINT, {
          reportType,
          projectId: filters.projectId ?? null,
          practice: filters.practice ?? null,
          businessUnits: filters.businessUnits ?? [],
          accounts: filters.accounts ?? [],
          projects: filters.projects ?? [],
          practices: filters.practices ?? [],
        })) ?? [];
      // Property order in a row object is the column order.
      return { columns: rows.length ? Object.keys(rows[0]) : [], rows };
    } catch (error) {
      console.error('Error fetching activity report:', error);
      throw error;
    }
  },
};
