import { TestBed, inject } from '@angular/core/testing';

import { KpiSharedService } from './kpi-shared.service';

describe('KpiSharedService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KpiSharedService]
    });
  });

  it('should be created', inject([KpiSharedService], (service: KpiSharedService) => {
    expect(service).toBeTruthy();
  }));
});
