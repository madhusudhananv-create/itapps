import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { ExecuteComponent } from './execute.component';
import { TaskService } from '../../task/task.service';
import { TaskModel } from '../../../core/models/task-model';

describe('ExecuteComponent', () => {
  let component: ExecuteComponent;
  let fixture: ComponentFixture<ExecuteComponent>;
  let mockTaskService: any;

  beforeEach(waitForAsync(() => {
    mockTaskService = jasmine.createSpyObj('TaskService', ['saveTask']);

    TestBed.configureTestingModule({
      imports: [
        ExecuteComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: TaskService, useValue: mockTaskService },
        provideHttpClient()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecuteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty tasks', () => {
    expect(component.tasks).toEqual([]);
    expect(component.selectedTasks).toEqual([]);
  });

  it('should toggle task selection', () => {
    const task = new TaskModel();
    task.id = 1;
    component.tasks = [task];

    component.toggleTaskSelection(task);
    expect(component.selectedTasks.length).toBe(1);
    expect(component.isSelected(task)).toBe(true);

    component.toggleTaskSelection(task);
    expect(component.selectedTasks.length).toBe(0);
    expect(component.isSelected(task)).toBe(false);
  });

  it('should get priority class correctly', () => {
    expect(component.getPriorityClass('CRITICAL')).toBe('priority-critical');
    expect(component.getPriorityClass('HIGH')).toBe('priority-high');
    expect(component.getPriorityClass('MEDIUM')).toBe('priority-medium');
    expect(component.getPriorityClass('LOW')).toBe('priority-low');
  });

  it('should get status class correctly', () => {
    expect(component.getStatusClass('completed')).toBe('status-completed');
    expect(component.getStatusClass('in progress')).toBe('status-in-progress');
    expect(component.getStatusClass('open')).toBe('status-open');
    expect(component.getStatusClass('cancelled')).toBe('status-cancelled');
  });
});
