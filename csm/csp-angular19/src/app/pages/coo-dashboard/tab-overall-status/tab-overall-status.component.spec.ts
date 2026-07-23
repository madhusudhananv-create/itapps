import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TabOverallStatusComponent } from './tab-overall-status.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { OverallStatusPage1Component } from './overall-status-page1/overall-status-page1.component';

// Mock child components that require Highcharts
@Component({ selector: 'app-overall-status-page1', template: '', standalone: true })
class MockOverallStatusPage1Component {
  @Input() menuToggleStatus: any;
  @Input() selectedPeriod: any;
  @Input() empid: any;
  @Input() customers: any;
  @Input() projects: any;
}

describe('TabOverallStatusComponent', () => {
  let component: TabOverallStatusComponent;
  let fixture: ComponentFixture<TabOverallStatusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TabOverallStatusComponent,
        NoopAnimationsModule,
        MockOverallStatusPage1Component
      ],
      providers: [provideHttpClient()]
    });

    TestBed.overrideComponent(TabOverallStatusComponent, {
      remove: {
        imports: [OverallStatusPage1Component]
      },
      add: {
        imports: [MockOverallStatusPage1Component]
      }
    });

    TestBed.compileComponents();
  }));

  beforeEach(() => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) =>
      key === 'empid' ? 'emp001' : null
    );
    fixture = TestBed.createComponent(TabOverallStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize default property values', () => {
    expect(component.menuToggleStatus).toBe(false);
    expect(component.selectedPeriod).toBe('asToday');
    expect(component.loading).toBe(false);
    expect(component.isChecked).toBe(false);
    expect(component.selectedDateType).toBe('1');
  });

  it('should read empid from localStorage on ngOnInit', () => {
    component.ngOnInit();
    expect(component.empid).toBe('emp001');
  });

  it('should initialize with empty projId and custId arrays', () => {
    expect(component.projId).toEqual([]);
  });

  it('should initialize with empty customers and projects', () => {
    expect(component.customers).toEqual([]);
    expect(component.projects).toEqual([]);
  });

  it('should initialize with empty portfolioList and projectList', () => {
    expect(component.portfolioList).toEqual([]);
    expect(component.projectList).toEqual([]);
  });

  it('should have toggle EventEmitter defined', () => {
    expect(component.toggle).toBeDefined();
  });
});
