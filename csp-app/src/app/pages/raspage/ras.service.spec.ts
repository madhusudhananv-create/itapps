import { TestBed, inject } from '@angular/core/testing';

import { RasService } from './ras.service';

describe('RasService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RasService]
    });
  });

  it('should be created', inject([RasService], (service: RasService) => {
    expect(service).toBeTruthy();
  }));
});
