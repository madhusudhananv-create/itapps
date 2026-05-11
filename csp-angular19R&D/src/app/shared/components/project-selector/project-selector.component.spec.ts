import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ProjectSelectorComponent } from './project-selector.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../my-utility';
import { provideHttpClient } from '@angular/common/http';

describe('ProjectSelectorComponent', () => {
  let component: ProjectSelectorComponent;
  let fixture: ComponentFixture<ProjectSelectorComponent>;
  let mockAppService: any;
  let mockUtil: any;

  beforeEach(async () => {
    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      ShouldLoadAllProjects: jasmine.createSpy('ShouldLoadAllProjects').and.returnValue(false)
    };

    mockAppService = {
      getCustomerList: jasmine.createSpy('getCustomerList').and.returnValue(of([])),
      GetRASCustomerList: jasmine.createSpy('GetRASCustomerList').and.returnValue(of([])),
      GetCustomerProjectsName: jasmine.createSpy('GetCustomerProjectsName').and.returnValue(of([])),
      GetProjectDataConfigurationValues: jasmine.createSpy('GetProjectDataConfigurationValues').and.returnValue(of([]))
    };

    TestBed.configureTestingModule({
      imports: [ ProjectSelectorComponent ],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        provideHttpClient()
      ]
    });
    TestBed.overrideComponent(ProjectSelectorComponent, { set: { imports: [], template: '<div></div>' } });
    return TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
