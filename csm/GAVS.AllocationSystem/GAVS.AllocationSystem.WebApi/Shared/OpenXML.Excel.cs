using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Web;

using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
//using System.IO;
//using System.Data;

namespace GAVS.AllocationSystem.WebApi.Shared.OpenXML
{
    public static class Excel
    {
        public static int GetExcelSheetCount(string fileName)
        {
            int iCount = 0;
            DataTable dataTable = new DataTable();
            using (FileStream fs = new FileStream(fileName, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
            {
                using (SpreadsheetDocument doc = SpreadsheetDocument.Open(fs, false))
                {
                    WorkbookPart workbookPart = doc.WorkbookPart;
                    SharedStringTablePart sstpart = workbookPart.GetPartsOfType<SharedStringTablePart>().First();
                    SharedStringTable sst = sstpart.SharedStringTable;

                    iCount = workbookPart.WorksheetParts.Count();
                }
            }
            return iCount;
        }

        public static DataTable GetExcelColumnHeaders(string fileName)
        {
            DataTable dataTable = new DataTable();

            using (FileStream fs = new FileStream(fileName, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
            {
                using (SpreadsheetDocument doc = SpreadsheetDocument.Open(fs, false))
                {
                    WorkbookPart workbookPart = doc.WorkbookPart;
                    SharedStringTablePart sstpart = workbookPart.GetPartsOfType<SharedStringTablePart>().First();
                    SharedStringTable sst = sstpart.SharedStringTable;

                    WorksheetPart worksheetPart = workbookPart.WorksheetParts.First();
                    Worksheet sheet = worksheetPart.Worksheet;

                    var cellFormats = workbookPart.WorkbookStylesPart.Stylesheet.CellFormats;
                    var numberingFormats = workbookPart.WorkbookStylesPart.Stylesheet.NumberingFormats;

                    var cells = sheet.Descendants<Cell>();
                    var rows = sheet.Descendants<Row>();

                    foreach (Cell cell in rows.ElementAt(0))
                    {
                        dataTable.Columns.Add(GetCellValue(doc, sst, cellFormats, numberingFormats, cell));
                    }

                    //foreach (Row row in rows)
                    //{
                    //    DataRow dataRow = dataTable.NewRow();
                    //    for (int i = 0; i < row.Descendants<Cell>().Count(); i++)
                    //    {
                    //        dataRow[i] = GetCellValue(doc, sst, cellFormats, numberingFormats, row.Descendants<Cell>().ElementAt(i));
                    //    }
                    //    dataTable.Rows.Add(dataRow);
                    //}
                }
            }
            if (dataTable.Rows.Count > 0)
                dataTable.Rows.RemoveAt(0);
            return dataTable;
        }

        public static DataTable GetExcelData(string fileName)
        {
            DataTable dataTable = new DataTable();

            using (FileStream fs = new FileStream(fileName, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
            {
                using (SpreadsheetDocument doc = SpreadsheetDocument.Open(fs, false))
                {
                    WorkbookPart workbookPart = doc.WorkbookPart;
                    SharedStringTablePart sstpart = workbookPart.GetPartsOfType<SharedStringTablePart>().First();
                    SharedStringTable sst = sstpart.SharedStringTable;

                    WorksheetPart worksheetPart = workbookPart.WorksheetParts.First();
                    Worksheet sheet = worksheetPart.Worksheet;

                    var cellFormats = workbookPart.WorkbookStylesPart.Stylesheet.CellFormats;
                    var numberingFormats = workbookPart.WorkbookStylesPart.Stylesheet.NumberingFormats;

                    var cells = sheet.Descendants<Cell>();
                    var rows = sheet.Descendants<Row>();

                    foreach (Cell cell in rows.ElementAt(0))
                    {
                        //string name = GetCellValue(doc, sst, cellFormats, numberingFormats, cell);
                        //if (name.ToLower().Contains("log time") || name.ToLower().Contains("date"))
                        //    dataTable.Columns.Add(GetCellValue(doc, sst, cellFormats, numberingFormats, cell), typeof(DateTime));
                        //else
                            dataTable.Columns.Add(GetCellValue(doc, sst, cellFormats, numberingFormats, cell));
                    }

                    foreach (Row row in rows)
                    {
                        DataRow dataRow = dataTable.NewRow();
                        for (int i = 0; i < row.Descendants<Cell>().Count(); i++)
                        {
                            dataRow[i] = GetCellValue(doc, sst, cellFormats, numberingFormats, row.Descendants<Cell>().ElementAt(i));
                        }
                        dataTable.Rows.Add(dataRow);
                    }
                }
            }
            if (dataTable.Rows.Count > 0)
                dataTable.Rows.RemoveAt(0);
            return dataTable;
        }

        private static string GetCellValue(SpreadsheetDocument document, SharedStringTable sst, CellFormats cellFormats, NumberingFormats numberingFormats, Cell cell)
        {
            try
            {
                if ((cell.DataType != null) && (cell.DataType == CellValues.SharedString))
                {
                    int ssid = int.Parse(cell.CellValue.Text);
                    string str = sst.ChildElements[ssid].InnerText;
                    return str;
                }
                else if (cell.CellValue != null)
                {
                    if (IsDateCell(cellFormats, numberingFormats, cell))
                        return DateTime.FromOADate(double.Parse(cell.CellValue.Text)).ToString("dd-MMM-yyy hh:mm:ss");
                    else
                        return cell.CellValue.Text;
                }
                else
                {
                    return "";
                }
            }
            catch (Exception ex)
            {
                string err = ex.Message;
            }
            finally
            {

            }
            return "";
        }

        private static Boolean IsDateCell(CellFormats cellFormats, NumberingFormats numberingFormats, Cell cell)
        {
            bool isDate = false;
            int styleIndex = cell.StyleIndex!=null? Convert.ToInt32(cell.StyleIndex.Value):0;
            var cellFormat = (CellFormat)cellFormats.ElementAt(styleIndex);

            if (cellFormat.NumberFormatId != null)
            {
                var numberFormatId = cellFormat.NumberFormatId.Value;
                NumberingFormat numberingFormat = null;
                if (numberingFormats != null)
                    numberingFormat = numberingFormats.Cast<NumberingFormat>()
                    .SingleOrDefault(f => f.NumberFormatId.Value == numberFormatId);

                // Here's yer string! Example: $#,##0.00_);[Red]($#,##0.00)
                if (numberingFormat != null && (numberingFormat.FormatCode.Value.Contains("mm/dd/yy") || numberingFormat.FormatCode.Value.Contains("mmm")|| numberingFormat.FormatCode.Value.Contains("yy") || numberingFormat.FormatCode.Value.Contains("mm\\-dd\\-y")))
                {
                    string formatString = numberingFormat.FormatCode.Value;
                    isDate = true;
                }
            }
            return isDate;
        }
    }


}