import { TestBed, inject } from '@angular/core/testing';

import { BvdDashboardService } from './bvd-dashboard.service';

describe('BvdDashboardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BvdDashboardService]
    });
  });

  it('should be created', inject([BvdDashboardService], (service: BvdDashboardService) => {
    expect(service).toBeTruthy();
  }));
});
