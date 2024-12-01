import { TestBed } from '@angular/core/testing';

import { CloseComponentService } from './close-component.service';

describe('CloseComponentService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CloseComponentService = TestBed.get(CloseComponentService);
    expect(service).toBeTruthy();
  });
});
