using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class MetaData
    {
[Key]
public int Id { get; set; }
public int TagID { get; set; }
public string KeyName { get; set; }
public string KeyValue { get; set; }
    }
}
