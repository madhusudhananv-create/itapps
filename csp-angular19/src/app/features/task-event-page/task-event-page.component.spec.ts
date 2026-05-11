import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { TaskEventPageComponent } from './task-event-page.component';
import { AppsService } from '../../core/services/apps.service';
import { SharedService } from '../../shared/shared.service';

describe('TaskEventPageComponent', () => {
  let component: TaskEventPageComponent;
  let fixture: ComponentFixture<TaskEventPageComponent>;
  let mockAppService: any;
  let mockSharedService: any;

  beforeEach(waitForAsync(() => {
    mockAppService = {
      getTasksEventsDetails: jasmine.createSpy('getTasksEventsDetails').and.returnValue(of([]))
    };

    mockSharedService = {
      selectedProjects: [],
      filterChanged: of(null)
    };

    TestBed.configureTestingModule({
      imports: [TaskEventPageComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: SharedService, useValue: mockSharedService },
        provideRouter([]),
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ custid: 'C001', period: 'TM' })
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskEventPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set selectedCust from route params', () => {
      expect(component.selectedCust).toBe('C001');
    });

    it('should set period from route params', () => {
      expect(component.period).toBe('TM');
    });

    it('should call GetTasksEventsDetails on init', () => {
      expect(mockAppService.getTasksEventsDetails).toHaveBeenCalled();
    });
  });

  describe('initial state', () => {
    it('should initialize allproj to false', () => {
      expect(component.allproj).toBe(false);
    });

    it('should initialize loading to false', () => {
      expect(component.loading).toBe(false);
    });

    it('should initialize toggletext to "Hide"', () => {
      expect(component.toggletext).toBe('Hide');
    });

    it('should initialize selectedOption to "1"', () => {
      expect(component.selectedOption).toBe('1');
    });

    it('should initialize PastDueChecked to true', () => {
      expect(component.PastDueChecked).toBe(true);
    });

    it('should initialize DueClosureChecked to true', () => {
      expect(component.DueClosureChecked).toBe(true);
    });

    it('should have displayedColumns defined', () => {
      expect(component.displayedColumns).toContain('description');
      expect(component.displayedColumns).toContain('status');
    });
  });

  describe('getPeriodTitle', () => {
    it('should set periodTitle for TM', () => {
      component.period = 'TM';
      component.getPeriodTitle();
      expect(component.periodTitle).toBe('Events & Tasks Due This Month');
    });

    it('should set periodTitle for TW', () => {
      component.period = 'TW';
      component.getPeriodTitle();
      expect(component.periodTitle).toBe('Events & Tasks Due This Week');
    });

    it('should set periodTitle for NM', () => {
      component.period = 'NM';
      component.getPeriodTitle();
      expect(component.periodTitle).toBe('Events & Tasks Due Next Month');
    });

    it('should set periodTitle for NW', () => {
      component.period = 'NW';
      component.getPeriodTitle();
      expect(component.periodTitle).toBe('Events & Tasks Due Next Week');
    });

    it('should set periodTitle for OD', () => {
      component.period = 'OD';
      component.getPeriodTitle();
      expect(component.periodTitle).toBe('Over Due Events & Tasks');
    });
  });

  describe('uncheckOthers', () => {
    it('should set PastDueChecked and DueClosureChecked to false', () => {
      component.PastDueChecked = true;
      component.DueClosureChecked = true;
      component.uncheckOthers();
      expect(component.PastDueChecked).toBe(false);
      expect(component.DueClosureChecked).toBe(false);
    });
  });

  describe('GetTasksEventsDetails', () => {
    it('should populate input on success', () => {
      const data = [{ projectName: 'Project A' }] as any[];
      mockAppService.getTasksEventsDetails.and.returnValue(of(data));
      component.GetTasksEventsDetails('C001');
      expect(component.input.length).toBe(1);
    });

    it('should handle empty custid gracefully', () => {
      component.GetTasksEventsDetails('');
      expect(mockAppService.getTasksEventsDetails).not.toHaveBeenCalledWith('', jasmine.anything(), jasmine.anything());
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe on destroy', () => {
      spyOn(component['sub'], 'unsubscribe');
      component.ngOnDestroy();
      expect(component['sub'].unsubscribe).toHaveBeenCalled();
    });
  });
});
