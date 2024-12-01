using GAVS.AllocationSystem.Model.AllSys;
using System.Collections.Generic;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class ProjectPeopleDetails
    {
        public PROJECT_PEOPLE PROJECT_PEOPLE { get; set; }
        public List<ResourceDetails> RESOURCE { get; set; }
    }

    public class ResourceDetails
    {
        public string TITLE { get; set; }
        public List<Resource> RESOURCE { get; set; }

    }
}