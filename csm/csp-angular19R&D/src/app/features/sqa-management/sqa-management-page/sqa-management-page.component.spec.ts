import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { provideHttpClient } from '@angular/common/http';

import { SqaManagementPageComponent } from './sqa-management-page.component';
import { MyUtility } from '../../../shared/my-utility';

describe('SqaManagementPageComponent', () => {
  let component: SqaManagementPageComponent;
  let fixture: ComponentFixture<SqaManagementPageComponent>;
  let mockRouter: any;
  let mockUtil: any;
  let mockMediaMatcher: any;
  let mockMediaQueryList: any;

  beforeEach(waitForAsync(() => {
    mockMediaQueryList = {
      addListener: jasmine.createSpy('addListener'),
      removeListener: jasmine.createSpy('removeListener'),
      matches: false
    };

    mockMediaMatcher = {
      matchMedia: jasmine.createSpy('matchMedia').and.returnValue(mockMediaQueryList)
    };

    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    mockUtil = {
      serviceError: jasmine.createSpy('serviceError')
    };

    TestBed.configureTestingModule({
      imports: [SqaManagementPageComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: MyUtility, useValue: mockUtil },
        { provide: MediaMatcher, useValue: mockMediaMatcher },
        ChangeDetectorRef,
        provideHttpClient()
      ]
    }).overrideComponent(SqaManagementPageComponent, { set: { imports: [], template: '<div></div>' } }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SqaManagementPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize mobileQuery via MediaMatcher', () => {
    expect(mockMediaMatcher.matchMedia).toHaveBeenCalled();
    expect(component.mobileQuery).toBeDefined();
  });

  it('should add a listener to mobileQuery on creation', () => {
    expect(mockMediaQueryList.addListener).toHaveBeenCalled();
  });

  describe('ngOnDestroy', () => {
    it('should remove the mobileQuery listener on destroy', () => {
      component.ngOnDestroy();
      expect(mockMediaQueryList.removeListener).toHaveBeenCalled();
    });
  });
});
