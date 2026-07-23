export interface TasksEventsDetails {
  ID: number;
  customerID: string;
  customerName: string;
  projectID: string;
  projectName: string;
  taskType: string;
  taskCategory: string;
  description: string;
  status: string;
  scheduledStartDate: Date;
  scheduledDuration: number;
  dueDate: Date;
  owner: string;
  priority: string;
  assignedTo: string;
  auditorEmpId: string;
}
