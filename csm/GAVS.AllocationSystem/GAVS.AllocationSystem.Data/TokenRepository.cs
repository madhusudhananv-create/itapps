using GAVS.AllocationSystem.Data.Contracts;
using GAVS.AllocationSystem.Model.AllSys;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Configuration;
using System.IO;
using System.Web;

namespace GAVS.AllocationSystem.Data
{
    public class TokenRepository : EFRepository<Token>, ITokenRepository
    {

        public TokenRepository(DbContext context) : base(context) { }

        public string ValidateandRefreshToken(string tokenId)
        {
            var token = (from t in DbContext.Set<Token>()
                         where (t.AUTHKEY == tokenId)
                         select t).SingleOrDefault();
            if (token == null)
                return "Session expired, plese login again";
            else
            {
                if (token.EXPIRESON > DateTime.Now)
                {
                    DateTime expiredOn = DateTime.Now.AddSeconds(
                                              Convert.ToDouble(ConfigurationManager.AppSettings["AuthTokenExpiry"]));
                    (from t in DbContext.Set<Token>()
                     where (t.AUTHKEY == tokenId)

                     select t).ToList().ForEach(a =>
                     {
                         a.EXPIRESON = expiredOn;
                     });
                    DbContext.SaveChanges();
                    return "Token Extended";
                }
                else
                {
                    Delete(token);
                    DbContext.SaveChanges();

                    string Newtoken = Guid.NewGuid().ToString();
                    DateTime issuedOn = DateTime.Now;
                    DateTime expiredOn = DateTime.Now.AddSeconds(
                                                      Convert.ToDouble(ConfigurationManager.AppSettings["AuthTokenExpiry"]));
                    var tokendomain = new Token
                    {
                        EMAILID = token.EMAILID,
                        AUTHKEY = Newtoken,
                        ISSUEDON = issuedOn,
                        EXPIRESON = expiredOn
                    };
                    Add(tokendomain);
                    DbContext.SaveChanges();

                    return "Token Renewed:" + Newtoken;
                }
            }

        }
        public Tuple<string, bool> ValidateToken(string tokenId)
        {
            try
            {
                var token = (from t in DbContext.Set<Token>()
                             where (t.AUTHKEY == tokenId)
                             select t).SingleOrDefault();
                if (token == null)
                    return new Tuple<string, bool>(string.Empty, false);
                else
                {

                    if (token.EXPIRESON > DateTime.Now)
                    {
                        DateTime expiredOn = DateTime.Now.AddSeconds(
                                                  Convert.ToDouble(ConfigurationManager.AppSettings["AuthTokenExpiry"]));
                        (from t in DbContext.Set<Token>()
                         where (t.AUTHKEY == tokenId)

                         select t).ToList().ForEach(a =>
                         {
                             a.EXPIRESON = expiredOn;
                         });
                        DbContext.SaveChanges();
                        return new Tuple<string, bool>(token.EMAILID, true);
                    }
                    else
                        return new Tuple<string, bool>(string.Empty, false);
                }
            }
            catch (Exception ex)
            {
                try
                {
                    string uploadfolder = ConfigurationManager.AppSettings["uploadfolder"];
                    string logpath = HttpContext.Current.Server.MapPath(uploadfolder) + @"\log.txt";
                    using (StreamWriter sw = new StreamWriter(logpath, true))
                        sw.WriteLine(DateTime.Now.ToString() + "\t" + tokenId + "\t" + ex.Message + "\t" + ex.StackTrace);
                }
                catch { }
                return new Tuple<string, bool>(string.Empty, true);
            }
            return new Tuple<string, bool>(string.Empty, true);
        }
    }
}
