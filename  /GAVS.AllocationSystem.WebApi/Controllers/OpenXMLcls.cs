using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;

//using DocumentFormat.OpenXml.Packaging;
//using DocumentFormat.OpenXml.Spreadsheet;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public class OpenXMLcls
    {
        /// <summary>
        ///  Read Data from selected excel file into DataTable
        /// </summary>
        /// <param name="filename">Excel File Path</param>
        /// <returns></returns>
        //public DataTable ReadExcelFile(string filename)
        //{
        //    // Initialize an instance of DataTable
        //    DataTable dt = new DataTable();


        //    try
        //    {
        //        // Use SpreadSheetDocument class of Open XML SDK to open excel file
        //        using (SpreadsheetDocument spreadsheetDocument = SpreadsheetDocument.Open(filename, false))
        //        {
        //            // Get Workbook Part of Spread Sheet Document
        //            WorkbookPart workbookPart = spreadsheetDocument.WorkbookPart;


        //            // Get all sheets in spread sheet document 
        //            IEnumerable<Sheet> sheetcollection = spreadsheetDocument.WorkbookPart.Workbook.GetFirstChild<Sheets>().Elements<Sheet>();


        //            // Get relationship Id
        //            string relationshipId = sheetcollection.First().Id.Value;


        //            // Get sheet1 Part of Spread Sheet Document
        //            WorksheetPart worksheetPart = (WorksheetPart)spreadsheetDocument.WorkbookPart.GetPartById(relationshipId);


        //            // Get Data in Excel file
        //            SheetData sheetData = worksheetPart.Worksheet.Elements<SheetData>().First();
        //            IEnumerable<Row> rowcollection = sheetData.Descendants<Row>();


        //            if (rowcollection.Count() == 0)
        //            {
        //                return dt;
        //            }


        //            // Add columns
        //            foreach (Cell cell in rowcollection.ElementAt(0))
        //            {
        //                dt.Columns.Add(GetValueOfCell(spreadsheetDocument, cell));
        //            }


        //            // Add rows into DataTable
        //            foreach (Row row in rowcollection)
        //            {
        //                DataRow temprow = dt.NewRow();
        //                int columnIndex = 0;
        //                foreach (Cell cell in row.Descendants<Cell>())
        //                {
        //                    // Get Cell Column Index
        //                    int cellColumnIndex = GetColumnIndex(GetColumnName(cell.CellReference));


        //                    if (columnIndex < cellColumnIndex)
        //                    {
        //                        do
        //                        {
        //                            temprow[columnIndex] = string.Empty;
        //                            columnIndex++;
        //                        }


        //                        while (columnIndex < cellColumnIndex);
        //                    }


        //                    temprow[columnIndex] = GetValueOfCell(spreadsheetDocument, cell);
        //                    columnIndex++;
        //                }


        //                // Add the row to DataTable
        //                // the rows include header row
        //                dt.Rows.Add(temprow);
        //            }
        //        }


        //        // Here remove header row
        //        dt.Rows.RemoveAt(0);
        //        return dt;
        //    }
        //    catch (IOException ex)
        //    {
        //        throw new IOException(ex.Message);
        //    }
        //}


        ///// <summary>
        /////  Get Value of Cell 
        ///// </summary>
        ///// <param name="spreadsheetdocument">SpreadSheet Document Object</param>
        ///// <param name="cell">Cell Object</param>
        ///// <returns>The Value in Cell</returns>
        //private static string GetValueOfCell(SpreadsheetDocument spreadsheetdocument, Cell cell)
        //{
        //    // Get value in Cell
        //    SharedStringTablePart sharedString = spreadsheetdocument.WorkbookPart.SharedStringTablePart;
        //    if (cell.CellValue == null)
        //    {
        //        return string.Empty;
        //    }


        //    string cellValue = cell.CellValue.InnerText;

        //    // The condition that the Cell DataType is SharedString
        //    if (cell.DataType != null && cell.DataType.Value == CellValues.SharedString)
        //    {
        //        return sharedString.SharedStringTable.ChildElements[int.Parse(cellValue)].InnerText;
        //    }
        //    else
        //    {
        //        return cellValue;
        //    }
        //}


    }
}