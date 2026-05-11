import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { Router, provideRouter } from '@angular/router';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { SurveySettingsPageComponent } from './survey-settings-page.component';
import { MyUtility } from '../../../shared/my-utility';
import { SurveyService } from '../../../core/services/survey.service';
import { provideHttpClient } from '@angular/common/http';

describe('SurveySettingsPageComponent', () => {
  let component: SurveySettingsPageComponent;
  let fixture: ComponentFixture<SurveySettingsPageComponent>;
  let mockUtil: any;
  let mockSurveyService: any;
  let router: Router;

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy(),
      IsGAVS: jasmine.createSpy().and.returnValue(false),
      empid: jasmine.createSpy(),
      displayname: jasmine.createSpy(),
      token: jasmine.createSpy(),
      showWarningConfirmation: jasmine.createSpy().and.returnValue({ afterClosed: () => of(false) }),
      ShowSideNav: false
    };
    mockSurveyService = {
      Logout: jasmine.createSpy().and.returnValue(of({})),
      GetCSSBatches: jasmine.createSpy().and.returnValue(of([])),
      GetCSMList: jasmine.createSpy().and.returnValue(of([]))
    };

    TestBed.configureTestingModule({
      imports: [SurveySettingsPageComponent],
      providers: [
        { provide: MyUtility, useValue: mockUtil },
        { provide: SurveyService, useValue: mockSurveyService },
        { provide: ChangeDetectorRef, useValue: { detectChanges: jasmine.createSpy() } },
        { provide: MediaMatcher, useValue: { matchMedia: jasmine.createSpy().and.returnValue({ addListener: jasmine.createSpy(), removeListener: jasmine.createSpy() }) } },
        provideHttpClient(),
        provideRouter([])
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveySettingsPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have mobileQuery defined', () => {
    expect(component.mobileQuery).toBeDefined();
  });

  it('should call service_Logout when logout triggers confirmation', () => {
    mockUtil.showWarningConfirmation.and.returnValue({ afterClosed: () => of(true) });
    component.logout();
    expect(mockSurveyService.Logout).toHaveBeenCalled();
  });

  it('should navigate to login page after logout (non-GAVS)', () => {
    mockUtil.showWarningConfirmation.and.returnValue({ afterClosed: () => of(true) });
    mockUtil.IsGAVS.and.returnValue(false);
    const navigateSpy = spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));
    component.logout();
    expect(navigateSpy).toHaveBeenCalledWith('/login');
  });

  it('should call service_Logout and clear user data', () => {
    component.service_Logout();
    expect(mockSurveyService.Logout).toHaveBeenCalled();
  });
});
