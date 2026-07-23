using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PROJECT_DELIVERY
    {
        public int ID { get; set; }
        public string PROJECT_ID { get; set; }
        public string RAG { get; set; }
        public string LASTWEEK_ACHIEVED { get; set; }
        public string NEXTWEEK_MILESTONE { get; set; }
        public string RISKS_ISSUES { get; set; }
        public string CUSTOMER_SUPPORT { get; set; }
        public DateTime PUBLISH_DATE { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public Boolean ISACTIVE { get; set; }

    }
    public class PROJECT_DELIVERY_DETAILS
    {
        public PROJECT_DELIVERY delivery { get; set; }
        public DateRange daterange { get; set; }
    }
    public abstract class DateRangeBase
    {
        protected DateTime _startdate = DateTime.Now;
        protected  DateTime _enddate = DateTime.Now;
        protected void CurrentWeek(DateTime dt)
        {
            //if (dt.DayOfWeek == DayOfWeek.Saturday)
            //    _startdate = dt.AddDays(-6).Date;
            //else
            _startdate = dt.AddDays(-((int)dt.DayOfWeek)).Date;
            _enddate = _startdate.AddDays(7).Date.AddMinutes(-1); // next sunday 00:00
        }
        protected void PreviousWeek(DateTime dt)
        {
            //if (dt.DayOfWeek == DayOfWeek.Sunday)
            //    _startdate = dt.AddDays(-7).Date;
            //else
            _startdate = dt.AddDays(-(int)dt.DayOfWeek - 7).Date;
            _enddate = _startdate.AddDays(7).Date.AddMinutes(-1); // next sunday 00:00
        }
        protected void NextWeek(DateTime dt)
        {
            //if (dt.DayOfWeek == DayOfWeek.Sunday)
            //    _startdate = dt.AddDays(1).Date;
            //else
            _startdate = dt.AddDays(7 - ((int)dt.DayOfWeek)).Date;
            _enddate = _startdate.AddDays(7).Date.AddMinutes(-1); // next sunday 00:00
        }
        public virtual DateTime StartDate
        {
            get { return _startdate; }
        }
        public virtual DateTime EndDate
        {
            get { return _enddate; }
        }
        protected void Monthly(DateTime dt)
        {
            _startdate = new DateTime(dt.Year, dt.Month, 1);
            _enddate = _startdate.AddMonths(1).AddMinutes(-1);
        }
    }
    public class DateRange : DateRangeBase
    {
      
       
        //public string StartDateString
        //{
        //    get { return _startdate.ToString("dd-MMM-yyy"); }
        //}
        //public string EndDateString
        //{
        //    get { return _enddate.ToString("dd-MMM-yyy"); }
        //}

        public DateRange(DateTime dt, enDateRange range)
        {
            if (range == enDateRange.Weekly)
                CurrentWeek(dt);
            else if (range == enDateRange.PreviousWeek)
                PreviousWeek(dt);
            else if (range == enDateRange.NextWeek)
                NextWeek(dt);
            else if (range == enDateRange.Monthly)
                Monthly(dt);
        }

        public DateRange(DateTime startDT, DateTime endDT)
        {
            _startdate = startDT;
            _enddate = endDT;
        }

        //private void CurrentWeek(DateTime dt)
        //{
        //    if (dt.DayOfWeek == DayOfWeek.Sunday)
        //        _startdate = dt.AddDays(-6).Date;
        //    else
        //        _startdate = dt.AddDays(-((int)dt.DayOfWeek - 1)).Date;
        //    _enddate = _startdate.AddDays(7).Date.AddMinutes(-1); // next sunday 00:00
        //}
        //private void PreviousWeek(DateTime dt)
        //{
        //    if (dt.DayOfWeek == DayOfWeek.Sunday)
        //        _startdate = dt.AddDays(-7 - 6).Date;
        //    else
        //        _startdate = dt.AddDays(-(int)dt.DayOfWeek - 6).Date;
        //    _enddate = _startdate.AddDays(7).Date.AddMinutes(-1); // next sunday 00:00
        //}
        //private void NextWeek(DateTime dt)
        //{
        //    if (dt.DayOfWeek == DayOfWeek.Sunday)
        //        _startdate = dt.AddDays(1).Date;
        //    else
        //        _startdate = dt.AddDays(7 - ((int)dt.DayOfWeek - 1)).Date;
        //    _enddate = _startdate.AddDays(7).Date.AddMinutes(-1); // next sunday 00:00
        //}


    }

    public class DateRangeModel
    {
        public DateTime startDate = DateTime.Now;
        public DateTime endDate = DateTime.Now;

        public string displayName = string.Empty;
        public bool current = false;
        //public DateTime StartDate
        //{
        //    get { return startDate; }
        //}
        //public DateTime EndDate
        //{
        //    get { return endDate; }
        //}

        public DateRangeModel(DateTime dt, enDateRange range)
        {
            if (dt <= DateTime.MinValue) dt = DateTime.Now;

            if (range == enDateRange.Weekly)
                CurrentWeek(dt);
            else if (range == enDateRange.PreviousWeek)
                PreviousWeek(dt);
            else if (range == enDateRange.NextWeek)
                NextWeek(dt);
            else if (range == enDateRange.Monthly)
                Monthly(dt);

            displayName = startDate.ToString("ddMMMyyyy") + " - " + endDate.ToString("ddMMMyyyy");
        }

        //private void CurrentWeek(DateTime dt)
        //{
        //    if (dt.DayOfWeek == DayOfWeek.Sunday)
        //        startDate = dt.AddDays(-6).Date;
        //    else
        //        startDate = dt.AddDays(-((int)dt.DayOfWeek - 1)).Date;
        //    endDate = startDate.AddDays(7).Date.AddMinutes(-1); // next sunday 00:00
        //}
        //private void PreviousWeek(DateTime dt)
        //{
        //    if (dt.DayOfWeek == DayOfWeek.Sunday)
        //        startDate = dt.AddDays(-7 - 6).Date;
        //    else
        //        startDate = dt.AddDays(-(int)dt.DayOfWeek - 6).Date;
        //    endDate = startDate.AddDays(7).Date.AddMinutes(-1); // next sunday 00:00
        //}
        //private void NextWeek(DateTime dt)
        //{
        //    if (dt.DayOfWeek == DayOfWeek.Sunday)
        //        startDate = dt.AddDays(1).Date;
        //    else
        //        startDate = dt.AddDays(7 - ((int)dt.DayOfWeek - 1)).Date;
        //    endDate = startDate.AddDays(7).Date.AddMinutes(-1); // next sunday 00:00
        //}
        protected void CurrentWeek(DateTime dt)
        {
            //if (dt.DayOfWeek == DayOfWeek.Saturday)
            //    _startdate = dt.AddDays(-6).Date;
            //else

            startDate = dt.AddDays(-((int)dt.DayOfWeek)).Date;
            endDate = startDate.AddDays(7).Date.AddMinutes(-1); // next sunday 00:00
        }
        protected void PreviousWeek(DateTime dt)
        {
            //if (dt.DayOfWeek == DayOfWeek.Sunday)
            //    _startdate = dt.AddDays(-7).Date;
            //else
            startDate = dt.AddDays(-(int)dt.DayOfWeek - 7).Date;
            endDate = startDate.AddDays(7).Date.AddMinutes(-1); // next sunday 00:00
        }
        protected void NextWeek(DateTime dt)
        {
            //if (dt.DayOfWeek == DayOfWeek.Sunday)
            //    _startdate = dt.AddDays(1).Date;
            //else
            startDate = dt.AddDays(7 - ((int)dt.DayOfWeek)).Date;
            endDate = startDate.AddDays(7).Date.AddMinutes(-1); // next sunday 00:00
        }
        private void Monthly(DateTime dt)
        {
            startDate = new DateTime(dt.Year, dt.Month, 1);
            endDate = startDate.AddMonths(1).AddMinutes(-1);
        }

    }

    public enum enDateRange
    {
        PreviousWeek = -1,
        Weekly = 0,
        NextWeek = 1,
        Monthly = 2,
        Custom=3,
    }
}
