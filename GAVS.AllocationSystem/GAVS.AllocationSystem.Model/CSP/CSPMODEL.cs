using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class CSPMODEL
    {
        public CSPMODEL()
        {
            clients = new List<Client>();
        }
        public List<Client> clients { get; set; }

        public class Client
        {
            public string Client_ID { get; set; }
            public string Client_NM { get; set; }
            public string Client_RAG { get; set; }
            public string Client_Description { get; set; }
            public string Client_Goals { get; set; }
            public string Gavs_Description { get; set; }
            public List<Project> projects { get; set; } = new List<Project>();
            public List<CUSTOMER_REPORTS> reports { get; set; } = new List<CUSTOMER_REPORTS>();
            public class Project
            {
                public string PROJ_ID { get; set; }
                public string PROJ_NM { get; set; }
                public string PROJ_ALIAS_NM { get; set; }
                public string BILLING_PROJ_ID { get; set; }
                public string BILLING_PROJ_NM { get; set; }
                public string PROJ_RAG { get; set; }
                public DateTime PUBLISHED_ON { get; set; }
                public PROJ_DETAILS Details { get; set; }
                public string LastUpdated { get; set; }
                public class PROJ_DETAILS
                {
                    public PROJECT_RAGS[] Rags { get; set; }
                    public PROJECT_SCOPE Scope { get; set; }
                    public PROJECT_DELIVERY_DETAILS DeliveryDetails { get; set; }
                    public ProjectPeopleDetails People { get; set; }
                    public PROJECT_PROCESS[] Process { get; set; }
                    public PROJECT_RISK[] Risk { get; set; }
                    public PROJECT_ISSUE[] Issue { get; set; }
                    public PROJECT_INNOVATION[] Innovation { get; set; }
                    public PROJECT_SUCCESS[] Success { get; set; }
                    public PROJECT_VALUEADDS[] Valueadds { get; set; }
                    public PROJECT_ACTIONITEM[] Actionitems { get; set; }
                }
            }
            //public class Report
            //{
            //    public CUSTOMER_REPORTS[] reports { get; set; }
            //}
        }

    }

}
