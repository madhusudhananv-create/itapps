/**
 * Customer Project IDs Model
 * Used for passing selected customer and project IDs with date range
 */
export class CustomerProjectIds {
  CustomerIds: string[] = [];
  ProjectIds: string[] = [];
  StartDate: Date = new Date();
  EndDate: Date = new Date();
}
