using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Data.Contracts
{
    public interface ITokenRepository
    {
        Tuple<string,bool> ValidateToken(string tokenId);
        string ValidateandRefreshToken(string tokenId);
        //string ValidateDBName(string SiteName);
    }
}
