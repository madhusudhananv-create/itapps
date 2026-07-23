import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { COODashboardComponent } from './coo-dashboard.component';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHighcharts } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { CustomerProjectIds } from '../../models/customer-project-ids.model';

describe('COODashboardComponent', () => {
  let component: COODashboardComponent;
  let fixture: ComponentFixture<COODashboardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        COODashboardComponent,
        NoopAnimationsModule
      ],
      providers: [provideRouter([]),
        provideHttpClient(),
        provideHighcharts({ instance: () => Promise.resolve(Highcharts) })]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(COODashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default property values', () => {
    expect(component.isOpened).toBe(true);
    expect(component.projId).toEqual([]);
    expect(component.custId).toEqual([]);
  });

  it('should toggle isOpened on toggle()', () => {
    expect(component.isOpened).toBe(true);
    component.toggle();
    expect(component.isOpened).toBe(false);
    component.toggle();
    expect(component.isOpened).toBe(true);
  });

  it('should update custId and projId from onFilterChange()', () => {
    const model: CustomerProjectIds = {
      CustomerIds: ['C1', 'C2'],
      ProjectIds: ['P1'],
      StartDate: new Date(),
      EndDate: new Date()
    };
    component.onFilterChange(model);
    expect(component.custId).toEqual(['C1', 'C2']);
    expect(component.projId).toEqual(['P1']);
  });
});
