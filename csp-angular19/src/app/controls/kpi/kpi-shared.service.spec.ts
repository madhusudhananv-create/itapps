import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { KpiSharedService } from './kpi-shared.service';

describe('KpiSharedService', () => {
  let service: KpiSharedService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KpiSharedService,
        provideHttpClient()
      ]
    });
    service = TestBed.inject(KpiSharedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialise goals as an empty array', () => {
    expect(service.goals).toEqual([]);
  });

  it('should initialise goal with default KpiGoalModel values', () => {
    expect(service.goal).toBeTruthy();
    expect(service.goal.id).toBe(0);
    expect(service.goal.description).toBe('');
    expect(service.goal.displaY_ORDER).toBe(1);
    expect(service.goal.isactive).toBeTruthy();
  });

  it('should initialise selectedGoal as empty object', () => {
    expect(service.selectedGoal).toEqual({});
  });

  it('should allow goals array to be updated', () => {
    const newGoals = [{ id: 1, description: 'Test Goal' }];
    service.goals = newGoals;
    expect(service.goals).toBe(newGoals);
    expect(service.goals.length).toBe(1);
  });

  it('should allow goal to be replaced', () => {
    const newGoal: any = { id: 5, description: 'Updated Goal', displaY_ORDER: 2, isactive: false };
    service.goal = newGoal;
    expect(service.goal.id).toBe(5);
    expect(service.goal.description).toBe('Updated Goal');
  });

  it('should allow selectedGoal to be updated', () => {
    const selected = { id: 3, description: 'Selected' };
    service.selectedGoal = selected;
    expect(service.selectedGoal).toBe(selected);
  });
});
