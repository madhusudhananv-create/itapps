using GAVS.AllocationSystem.Model.CSP;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GAVS.AllocationSystem.WebApi
{
    internal static class DataTableHelper
    {
        private static string GetTBLIsRequired(Boolean Required)
        {
            if (Required)
            {
                return "NOT NULL ";
            }
            else
            {
                return "NULL ";
            }
        }
        private static string GetTBLDataType(string DataType, int Length)
        {
            if (DataType == "varchar")
            {
                return "[varchar]" + "(" + Length.ToString() + ") ";
            }
            else
            {
                return "[" + DataType + "] ";
            }
        }
    }
}