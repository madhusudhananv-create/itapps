using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.ViewModels;
using System.Linq;
using System.Web.Http;
using Route1 = System.Web.Http.RouteAttribute;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {
        [Route1("GetQualitativeBenefit")]
        [ActionName("GetQualitativeBenefit")]
        [HttpPost]
        public IHttpActionResult GetQualitativeBenefit([FromBody] QualitativeBenefits qualitativeBenefit)
        {
            var benefits = new BenefitQualitativeDetails();
            var output = new BenefitByType();
            benefits.Beneficiary = string.Join(",", qualitativeBenefit.Beneficiary);
            benefits.BenefitPillar = string.Join(",", qualitativeBenefit.BenefitPillar);
            benefits.CustomerId = string.Join(",", qualitativeBenefit.CustomerId);
            benefits.ProjectId = string.Join(",", qualitativeBenefit.ProjectId);
            benefits.IdentifiedBy = string.Join(",", qualitativeBenefit.IdentifiedBy);
            benefits.Status = string.Join(",", qualitativeBenefit.StatusId);
            benefits.StartDate = qualitativeBenefit.StartDate;
            benefits.EndDate = qualitativeBenefit.EndDate;
            var result = CSPdb.AppRepo.GetQualitativeBenefit(benefits).ToList();
            output.Benefits_Value = result.Where(x => x.Type_id == TYPE.Value).ToList();
            output.Benefits_ValueAdd = result.Where(x => x.Type_id == TYPE.Value_Add).ToList();

            return Ok(output);
        }


        [Route1("GetQualitativeBenefitDetail")]
        [ActionName("GetQualitativeBenefitDetail")]
        [HttpPost]
        public IHttpActionResult GetQualitativeBenefitDetail([FromBody] QualitativeBenefits qualitativeBenefit)
        {
            var benefits = new BenefitQualitativeDetails();
            var output = new BenefitByType();
            benefits.Beneficiary = string.Join(",", qualitativeBenefit.Beneficiary);
            benefits.BenefitPillar = string.Join(",", qualitativeBenefit.BenefitPillar);
            benefits.CustomerId = string.Join(",", qualitativeBenefit.CustomerId);
            benefits.ProjectId = string.Join(",", qualitativeBenefit.ProjectId);
            benefits.IdentifiedBy = string.Join(",", qualitativeBenefit.IdentifiedBy);
            benefits.Status = string.Join(",", qualitativeBenefit.StatusId);
            benefits.StartDate = qualitativeBenefit.StartDate;
            benefits.EndDate = qualitativeBenefit.EndDate;
            var result = CSPdb.AppRepo.GetQualitativeBenefitDetail(benefits).ToList();
            output.Benefits_Value = result.Where(x => x.Type_id == TYPE.Value).ToList();
            output.Benefits_ValueAdd = result.Where(x => x.Type_id == TYPE.Value_Add).ToList();

            return Ok(output);
        }

        [Route1("GetQuantitativeBenefitsDetail")]
        [ActionName("GetQuantitativeBenefitsDetail")]
        [HttpPost]
        public IHttpActionResult GetQuantitativeBenefitsDetail([FromBody] QuantitativeBenefits quantitativeBenefit)
        {
            var benefits = new BenefitQuantitativeDetails();
            var output = new BenefitByType();
            benefits.Beneficiary = string.Join(",", quantitativeBenefit.Beneficiary);
            benefits.BenefitPillar = string.Join(",", quantitativeBenefit.BenefitPillar);
            benefits.CustomerId = string.Join(",", quantitativeBenefit.CustomerId);
            benefits.ProjectId = string.Join(",", quantitativeBenefit.ProjectId);
            benefits.IdentifiedBy = string.Join(",", quantitativeBenefit.IdentifiedBy);
            benefits.Status = string.Join(",", quantitativeBenefit.StatusId);
            benefits.StartDate = quantitativeBenefit.StartDate;
            benefits.EndDate = quantitativeBenefit.EndDate;
            benefits.UOMID = quantitativeBenefit.UOMID;

            var result = CSPdb.AppRepo.GetQuantitativeBenefitsDetail(benefits).ToList();
            output.Benefits_Quantitative_Value = result.Where(x => x.Type_id == TYPE.Value).ToList();
            output.Benefits_Quantitative_ValueAdd = result.Where(x => x.Type_id == TYPE.Value_Add).ToList();

            return Ok(output);
        }

        [Route1("GetValuePieChart")]
        [ActionName("GetValuePieChart")]
        [HttpPost]
        public IHttpActionResult GetValuePieChart([FromBody] QuantitativeBenefits quantitativeBenefit)
        {
            var benefits = new BenefitQuantitativeDetails();
            var output = new BenefitByType();
            benefits.Beneficiary = string.Join(",", quantitativeBenefit.Beneficiary);
            benefits.BenefitPillar = string.Join(",", quantitativeBenefit.BenefitPillar);
            benefits.CustomerId = string.Join(",", quantitativeBenefit.CustomerId);
            benefits.ProjectId = string.Join(",", quantitativeBenefit.ProjectId);
            benefits.IdentifiedBy = string.Join(",", quantitativeBenefit.IdentifiedBy);
            benefits.Status = string.Join(",", quantitativeBenefit.StatusId);
            benefits.StartDate = quantitativeBenefit.StartDate;
            benefits.EndDate = quantitativeBenefit.EndDate;
            benefits.UOMID = quantitativeBenefit.UOMID;

            var result = CSPdb.AppRepo.GetValuePieChart(benefits).ToList();
            output.Benefits_Quantitative_Value = result.Where(x => x.Type_id == TYPE.Value).ToList();
            output.Benefits_Quantitative_ValueAdd = result.Where(x => x.Type_id == TYPE.Value_Add).ToList();

            return Ok(output);
        }

        [Route1("GetValueColumnChart")]
        [ActionName("GetValueColumnChart")]
        [HttpPost]
        public IHttpActionResult GetValueColumnChart([FromBody] QuantitativeBenefits quantitativeColumnBenefits)
        {

            var benefits = new BenefitQuantitativeDetails();
            var output = new BenefitByType();
            benefits.Beneficiary = string.Join(",", quantitativeColumnBenefits.Beneficiary);
            benefits.BenefitPillar = string.Join(",", quantitativeColumnBenefits.BenefitPillar);
            benefits.CustomerId = string.Join(",", quantitativeColumnBenefits.CustomerId);
            benefits.ProjectId = string.Join(",", quantitativeColumnBenefits.ProjectId);
            benefits.IdentifiedBy = string.Join(",", quantitativeColumnBenefits.IdentifiedBy);
            benefits.Status = string.Join(",", quantitativeColumnBenefits.StatusId);
            benefits.StartDate = quantitativeColumnBenefits.StartDate;
            benefits.EndDate = quantitativeColumnBenefits.EndDate;
            benefits.UOMID = quantitativeColumnBenefits.UOMID;

            var result = CSPdb.AppRepo.GetValueColumnChart(benefits).ToList();
            output.Benefits_Quantitative_Column_Value = result.Where(x => x.Type_id == TYPE.Value).ToList();
            output.Benefits_Quantitative_Column_ValueAdd = result.Where(x => x.Type_id == TYPE.Value_Add).ToList();

            return Ok(output);
        }

        [Route1("GetIdeasStatusCountStackedChart")]
        [ActionName("GetIdeasStatusCountStackedChart")]
        [HttpPost]
        public IHttpActionResult GetIdeasStatusCountStackedChart([FromBody] IdeasFilter ideasFilter)
        {
            ValidateReqest(ideasFilter);
            var spData = new IdeasSPFilter();
            spData.CustomerId = string.Join(",", ideasFilter.CustomerId);
            spData.BenefitPillar = string.Join(",", ideasFilter.BenefitPillar);
            spData.Beneficiary = string.Join(",", ideasFilter.Beneficiary);
            spData.CustomerId = string.Join(",", ideasFilter.CustomerId);
            spData.ProjectId = string.Join(",", ideasFilter.ProjectId);
            spData.IdentifiedBy = string.Join(",", ideasFilter.IdentifiedBy);
            spData.StartDate = ideasFilter.StartDate;
            spData.EndDate = ideasFilter.EndDate;
            var result = CSPdb.AppRepo.GetIdeasStatusCount(spData).ToList();
            return Ok(result); ;
        }


        [Route1("GetAllUOM")]
        [ActionName("GetAllUOM")]
        [HttpGet]

        public IHttpActionResult GetAllUOM()
        {
            //var a = new BenefitQualitativeDetails
            return Ok(CSPdb.AppRepo.GetAllUOM().ToList());
        }

       
    }
}