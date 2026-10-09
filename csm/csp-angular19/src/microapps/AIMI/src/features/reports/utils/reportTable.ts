import { downloadCSV } from './csvExportUtils';

/**
 * A report exactly as the backend defines it: column titles in order, and one object per row keyed
 * by column title. Nothing about the columns is known to the client.
 */
export interface ReportTable {
  columns: string[];
  rows: Record<string, string | number | null>[];
}

const toCsvCell = (value: string | number | null | undefined): string => {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

/** Turn a ReportTable into CSV text (every cell quoted, so commas and line breaks are safe). */
export const reportTableToCsv = (table: ReportTable): string =>
  [
    table.columns.map(toCsvCell).join(','),
    ...table.rows.map((row) =>
      table.columns.map((column) => toCsvCell(row[column])).join(',')
    ),
  ].join('\r\n');

/** Download a ReportTable as a CSV file. */
export const downloadReportTable = (
  table: ReportTable,
  filename: string
): void => {
  downloadCSV(reportTableToCsv(table), filename);
};
