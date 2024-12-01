namespace GAVS.AllocationSystem.WebApi
{
    using System;
    using System.Data.Entity;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Linq;

    public partial class Model1 : DbContext
    {
        public Model1()
            : base("name=Model1")
        {
        }

        public virtual DbSet<TASK_RECURRENCE> TASK_RECURRENCE { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<TASK_RECURRENCE>()
                .Property(e => e.FREQUENCY)
                .IsUnicode(false);

            modelBuilder.Entity<TASK_RECURRENCE>()
                .Property(e => e.WEEKLY_SELECTED_DAY)
                .IsUnicode(false);

            modelBuilder.Entity<TASK_RECURRENCE>()
                .Property(e => e.FORTNIGHTLY_SELECTED_DAY)
                .IsUnicode(false);

            modelBuilder.Entity<TASK_RECURRENCE>()
                .Property(e => e.MONTHLY_SELECTED_DAY)
                .IsUnicode(false);

            modelBuilder.Entity<TASK_RECURRENCE>()
                .Property(e => e.BIANNAUL_FIRST_SELECTED_DAY)
                .IsUnicode(false);

            modelBuilder.Entity<TASK_RECURRENCE>()
                .Property(e => e.BIANNAUL_FIRST_SELECTED_MONTH)
                .IsUnicode(false);

            modelBuilder.Entity<TASK_RECURRENCE>()
                .Property(e => e.BIANNAUL_SECOND_SELECTED_DAY)
                .IsUnicode(false);

            modelBuilder.Entity<TASK_RECURRENCE>()
                .Property(e => e.BIANNAUL_SECOND_SELECTED_MONTH)
                .IsUnicode(false);

            modelBuilder.Entity<TASK_RECURRENCE>()
                .Property(e => e.ANNUAL_SELECTED_DAY)
                .IsUnicode(false);

            modelBuilder.Entity<TASK_RECURRENCE>()
                .Property(e => e.ANNUAL_SELECTED_MONTH)
                .IsUnicode(false);

            modelBuilder.Entity<TASK_RECURRENCE>()
                .Property(e => e.CREATED_BY)
                .IsUnicode(false);

            modelBuilder.Entity<TASK_RECURRENCE>()
                .Property(e => e.UPDATED_BY)
                .IsUnicode(false);
        }
    }
}
