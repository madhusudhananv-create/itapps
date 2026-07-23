using AttributeRouting.Web.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web.Http;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.AllSys.SP;
using Newtonsoft.Json;
using GAVS.AllocationSystem.Model.CSP;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {
        [GET("GetProductDetails")]
        [ActionName("GetProductDetails")]
        [HttpGet]
        public IHttpActionResult GetProductPortfolioDetails(string custId, int? portId)
        {
            CheckAccessForFeature(100);
            var productDetails = Cldb.AppRepo.GetProductByPortfolioId(custId, portId);
            return Ok(productDetails);
        }


        [GET("GetInitialDataForCRUDProduct")]
        [ActionName("GetInitialDataForCRUDProduct")]
        [HttpGet]
        public IHttpActionResult GetInitialDataForCRUDProduct()
        {
            var serviceAreas = CSPdb.PRODUCTS_SERVICE_AREA.GetAll().Where(x => x.ISACTIVE).ToList();
            var productModes = CSPdb.PRODUCTS_SERVICE_LEVEL_MODE.GetAll().Where(x => x.ISACTIVE).ToList();
            var productTiers = CSPdb.PRODUCT_TIER.GetAll().ToList();

            var initialData = new
            {
                ServiceAreas = serviceAreas,
                ProductModes = productModes,
                ProductTier = productTiers
            };

            return Ok(initialData);
        }


        [POST("UpdateProduct")]
        [ActionName("UpdateProduct")]
        [HttpPost]
        public IHttpActionResult UpdateProduct([FromBody] ProductPortfolioDetails productDetails)
        {
            CheckAccessForFeature(101);
            LogRequest(content: JsonConvert.SerializeObject(productDetails));
            if (productDetails == null)
            {
                return Content(HttpStatusCode.Conflict, "Request is invalid");
            }

            if (productDetails.ID != 0)
            {
                var existingProduct = CSPdb.PORTFOLIO_PRODUCTS.GetAll().FirstOrDefault(x => x.ID == productDetails.ID && x.ISACTIVE == true);
                var modeMapping = CSPdb.PRODUCT_MODE_MAPPING.GetAll().FirstOrDefault(x => x.PRODUCT_ID == productDetails.ID && x.ISACTIVE == true);

                if (existingProduct == null)
                {
                    return Content(HttpStatusCode.Conflict, "Product Portfolio doesn't exist");
                }

                else
                {
                    existingProduct.PRODUCT_TITLE = productDetails.PRODUCT_TITLE;
                    existingProduct.TIER_ID = productDetails.TIER_ID;
                    existingProduct.PORTFOLIO_ID = productDetails.PORTFOLIO_ID;
                    existingProduct.SERVICE_COMMENCEMENT_DATE = productDetails.SERVICE_COMMENCEMENT_DATE;
                    existingProduct.IS_SERVICE_COMMENCED = productDetails.IS_SERVICE_COMMENCED;
                    existingProduct.SERVICE_AREA_TYPE_ID = productDetails.SERVICE_AREA_TYPE_ID;
                    UpdateAuditFields(existingProduct);
                    CSPdb.PORTFOLIO_PRODUCTS.Update(existingProduct);
                }

                if (modeMapping == null)
                {
                    CreateModeMapping(productDetails, existingProduct.ID);

                }
                else
                {
                    modeMapping.PRODUCT_ID = productDetails.ID;
                    modeMapping.MODE_ID = productDetails.MODE_ID;
                    modeMapping.SERVICE_AREA_TYPE_ID = productDetails.SERVICE_AREA_TYPE_ID;
                    UpdateAuditFields(modeMapping);
                    CSPdb.PRODUCT_MODE_MAPPING.Update(modeMapping);
                }
            }
            else
            {
                var newProduct = new PORTFOLIO_PRODUCT();
                newProduct.PRODUCT_TITLE = productDetails.PRODUCT_TITLE;
                newProduct.TIER_ID = productDetails.TIER_ID;
                newProduct.PORTFOLIO_ID = productDetails.PORTFOLIO_ID;
                newProduct.SERVICE_COMMENCEMENT_DATE = productDetails.SERVICE_COMMENCEMENT_DATE;
                newProduct.IS_SERVICE_COMMENCED = productDetails.IS_SERVICE_COMMENCED;
                newProduct.CUST_ID = productDetails.CUST_ID;
                newProduct.SERVICE_AREA_TYPE_ID = productDetails.SERVICE_AREA_TYPE_ID;
                UpdateAuditFields(newProduct);
                CSPdb.PORTFOLIO_PRODUCTS.Add(newProduct);
                CSPdb.Commit(CanCommit);
                CreateModeMapping(productDetails, newProduct.ID);

            }
            CSPdb.Commit(CanCommit);
            return Ok();
        }

        private void CreateModeMapping(ProductPortfolioDetails productDetails, int id)
        {
            var modeMapping = new PRODUCT_MODE_MAPPING();
            modeMapping.PRODUCT_ID = id;
            modeMapping.MODE_ID = productDetails.MODE_ID;
            modeMapping.SERVICE_AREA_TYPE_ID = productDetails.SERVICE_AREA_TYPE_ID;
            UpdateAuditFields(modeMapping);
            CSPdb.PRODUCT_MODE_MAPPING.Add(modeMapping);
        }

        [POST("DeleteProduct")]
        [ActionName("DeleteProduct")]
        [HttpPost]
        public IHttpActionResult DeleteProduct([FromBody] ProductPortfolioDetails productDetails)
        {
            CheckAccessForFeature(101);
            LogRequest(content: JsonConvert.SerializeObject(productDetails));
            if (productDetails == null)
            {
                return Content(HttpStatusCode.Conflict, "Request is invalid");
            }
            var exist = CSPdb.PORTFOLIO_PRODUCTS.GetAll().FirstOrDefault(x => x.ID == productDetails.ID && x.ISACTIVE);
            if (exist != null)
            {
                UpdateAuditFields(exist);
                exist.ISACTIVE = false;
                CSPdb.PORTFOLIO_PRODUCTS.Update(exist);   
            }

            var kpiRecords = CSPdb.KPI.GetAll().Where(x => x.PRODUCT_ID == productDetails.ID && x.ISACTIVE).ToList();
            foreach (var item in kpiRecords)
            {
                UpdateAuditFields(item);
                item.ISACTIVE = false;
                CSPdb.KPI.Update(item);
            }
            CSPdb.Commit(CanCommit);
            return Ok();
        }

    }
}