using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class Token
    {
[Key]
public int TOKENID { get; set; }
public string EMAILID { get; set; }
public string AUTHKEY { get; set; }
public DateTime ISSUEDON { get; set; }
public DateTime EXPIRESON { get; set; }
    }
}
