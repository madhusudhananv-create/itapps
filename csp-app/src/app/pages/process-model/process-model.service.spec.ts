import { TestBed, inject } from '@angular/core/testing';

import { ProcessModelService } from './process-model.service';

describe('ProcessModelService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProcessModelService]
    });
  });

  it('should be created', inject([ProcessModelService], (service: ProcessModelService) => {
    expect(service).toBeTruthy();
  }));
});
