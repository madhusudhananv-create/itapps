import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';

import { COODashboardService } from './coo-dashboard.service';

describe('COODashboardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ 
      imports: [
      HttpClientModule,
    ],
      providers: [COODashboardService]
    }).compileComponents();
  });

  it('should be created', inject([COODashboardService], (service: COODashboardService) => {
    expect(service).toBeTruthy();
  }));
});
