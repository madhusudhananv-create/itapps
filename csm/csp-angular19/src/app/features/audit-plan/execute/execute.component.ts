import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatStepper } from '@angular/material/stepper';
import { TaskService } from '../../task/task.service';
import { TaskModel } from '../../../core/models/task-model';
import { MyUtility } from '../../../shared/my-utility';

@Component({
  selector: 'app-execute',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCheckboxModule,
    MatProgressBarModule
  ],
  templateUrl: './execute.component.html',
  styleUrls: ['./execute.component.scss']
})
export class ExecuteComponent implements OnInit {
  @Input() stepper!: MatStepper;

  private _taskService = inject(TaskService);
  private _util = inject(MyUtility);

  tasks: TaskModel[] = [];
  selectedTasks: TaskModel[] = [];
  isLoading: boolean = false;
  displayedColumns: string[] = ['select', 'type', 'description', 'priority', 'dueDate', 'status', 'actions'];

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;
    // TODO: Load tasks from service
    // For now, using mock data or taskService.selectedTask if available
    
    setTimeout(() => {
      if (this._taskService.selectedTask) {
        this.tasks = [this._taskService.selectedTask];
      } else {
        this.tasks = [];
      }
      this.isLoading = false;
    }, 500);
  }

  toggleTaskSelection(task: TaskModel): void {
    const index = this.selectedTasks.indexOf(task);
    if (index > -1) {
      this.selectedTasks.splice(index, 1);
    } else {
      this.selectedTasks.push(task);
    }
  }

  isSelected(task: TaskModel): boolean {
    return this.selectedTasks.includes(task);
  }

  executeSelectedTasks(): void {
    if (this.selectedTasks.length === 0) {
      alert('Please select at least one task to execute.');
      return;
    }

    alert(`Executing ${this.selectedTasks.length} task(s)...`);
    
    // TODO: Implement actual execution logic
    // - Update task status to "In Progress" or "Executing"
    // - Trigger any workflows
    // - Send notifications
  }

  editTask(task: TaskModel): void {
    // Navigate back to Step 2 with this task
    this._taskService.selectedTask = task;
    this.stepper.previous();
  }

  deleteTask(task: TaskModel): void {
    const dialogRef = this._util.showWarningConfirmation(
      'Are you sure you want to delete this task?',
      'Delete Task'
    );
    
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        // TODO: Call service to delete task
        this.tasks = this.tasks.filter(t => t !== task);
        alert('Task deleted successfully!');
      }
    });
  }

  viewTaskDetails(task: TaskModel): void {
    alert('Task Details:\n' + JSON.stringify(task, null, 2));
  }

  goBack(): void {
    this.stepper.previous();
  }

  finishWorkflow(): void {
    const dialogRef = this._util.showWarningConfirmation(
      'Are you sure you want to finish this workflow?',
      'Finish Workflow'
    );
    
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        alert('Workflow completed successfully!');
        // TODO: Navigate to dashboard or reset stepper
      }
    });
  }

  getPriorityClass(priority: string): string {
    switch (priority?.toUpperCase()) {
      case 'CRITICAL':
        return 'priority-critical';
      case 'HIGH':
        return 'priority-high';
      case 'MEDIUM':
        return 'priority-medium';
      case 'LOW':
        return 'priority-low';
      default:
        return '';
    }
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'closed':
        return 'status-completed';
      case 'in progress':
        return 'status-in-progress';
      case 'planned':
      case 'open':
        return 'status-open';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }
}
