import { TestBed, inject } from '@angular/core/testing';

import { CSMDashboardService } from './csmdashboard.service';

describe('CSMDashboardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CSMDashboardService]
    });
  });

  it('should be created', inject([CSMDashboardService], (service: CSMDashboardService) => {
    expect(service).toBeTruthy();
  }));
});
