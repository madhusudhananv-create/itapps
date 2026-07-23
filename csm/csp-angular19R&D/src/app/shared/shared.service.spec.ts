import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { SharedService } from './shared.service';

describe('SharedService', () => {
  let service: SharedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call method and emit event', (done) => {
    service.methodCalled$.subscribe(() => {
      expect(true).toBe(true);
      done();
    });
    service.callMethod();
  });

  it('should clear all selections', () => {
    service.selectedPortfolios = [1, 2, 3];
    service.selectedProjects = ['proj1', 'proj2'];
    service.clearSelections();
    
    expect(service.selectedPortfolios.length).toBe(0);
    expect(service.selectedProjects.length).toBe(0);
  });
});
