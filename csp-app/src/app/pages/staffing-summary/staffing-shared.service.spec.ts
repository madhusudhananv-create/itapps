import { TestBed, inject } from '@angular/core/testing';

import { StaffingSharedService } from './staffing-shared.service';

describe('StaffingSharedService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StaffingSharedService]
    });
  });

  it('should be created', inject([StaffingSharedService], (service: StaffingSharedService) => {
    expect(service).toBeTruthy();
  }));
});
