import { TestBed, inject } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { ProcessModelService } from './process-model.service';

describe('ProcessModelService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProcessModelService,
        provideHttpClient()
      ]
    });
  });

  it('should be created', inject([ProcessModelService], (service: ProcessModelService) => {
    expect(service).toBeTruthy();
  }));
});
