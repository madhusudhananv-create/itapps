using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.WebApi.Models;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public class EmployeesController : ApiController
    {
        Employee[] employees = new Employee[]{
           new Employee { ID = 1, Name = "Mark", JoiningDate =
              DateTime.Parse(DateTime.Today.ToString()), Age = 30 },
           new Employee { ID = 2, Name = "Allan", JoiningDate =
              DateTime.Parse(DateTime.Today.ToString()), Age = 35 },
           new Employee { ID = 3, Name = "Johny", JoiningDate =
              DateTime.Parse(DateTime.Today.ToString()), Age = 21 }
        };

        public IEnumerable<Employee> GetAllEmployees()
        {
            return employees;
        }

        public IHttpActionResult GetEmployee(int id)
        {
            var employee = employees.FirstOrDefault((p) => p.ID == id);
            if (employee == null)
            {
                return NotFound();
            }
            return Ok(employee);
        }
        List<int> classes = new List<int>() { 1, 2, 3, 4, 5 };
        public List<int> GetAllEmployees1()
        {
            return classes;
        }
        List<int> numbers = new List<int>() { 1, 2, 3, 4, 5 };
        List<int> oddnumbers = new List<int>() { 1, 3, 5 };
        //[GET("OddNumbers")]
        //[ActionName("numbers")]
        [HttpGet]
        public IHttpActionResult GetNumbers()
        {
            var query = numbers;
            return Ok(query.ToList().AsQueryable());
        }
        [ActionName("oddnumbers")]
        [HttpGet]
        public IHttpActionResult GetOddNumbers()
        {
            var query = oddnumbers;
            return Ok(query.ToList().AsQueryable());
        }

        private class Languages
        {
            public List<string> values = new List<string>() {
            "C#","ASP.NET","MVC"
            };
        }
        private class SpeakingLanguages
        {
            public List<string> values = new List<string>() {
            "tamil","english","hindi"
        };
        }

        [GET("GetLanguages")]
        [ActionName("GetLanguages")]
        [HttpGet]
        public IHttpActionResult GetLanguages()
        {
            Languages lan = new Controllers.EmployeesController.Languages();
            var query = lan.values;
            return Ok(query.ToList().AsQueryable());
        }

        [GET("GetSpeakingLanguages")]
        [ActionName("GetSpeakingLanguages")]
        [HttpGet]
        public IHttpActionResult GetSpeakingLanguages()
        {
            SpeakingLanguages lan = new Controllers.EmployeesController.SpeakingLanguages();
            var query = lan.values;
            return Ok(query.ToList().AsQueryable());
        }

    }
}
