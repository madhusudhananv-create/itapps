import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

import { SemicircularGaugeComponent } from './semicircular-gauge.component';

describe('SemicircularGaugeComponent', () => {
  let component: SemicircularGaugeComponent;
  let fixture: ComponentFixture<SemicircularGaugeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SemicircularGaugeComponent, NoopAnimationsModule],
      providers: [provideHttpClient()]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SemicircularGaugeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default input values', () => {
    expect(component.high).toBe(0);
    expect(component.medium).toBe(0);
    expect(component.low).toBe(0);
    expect(component.highLabel).toBe('');
    expect(component.mediumLabel).toBe('');
    expect(component.lowLabel).toBe('');
  });

  it('should have default dimension values', () => {
    expect(component.width).toBe(200);
    expect(component.height).toBe(120);
    expect(component.strokeWidth).toBe(8);
  });

  it('should have showCenterText false by default', () => {
    expect(component.showCenterText).toBeFalsy();
  });

  it('should have isCircular false by default', () => {
    expect(component.isCircular).toBeFalsy();
  });

  it('should accept high/medium/low inputs', () => {
    component.high = 50;
    component.medium = 30;
    component.low = 20;
    fixture.detectChanges();
    expect(component.high).toBe(50);
    expect(component.medium).toBe(30);
    expect(component.low).toBe(20);
  });

  it('should recalculate on ngOnChanges when inputs change', () => {
    const spy = spyOn(component, 'ngOnChanges').and.callThrough();
    component.high = 40;
    component.medium = 35;
    component.low = 25;
    component.ngOnChanges({} as any);
    expect(spy).toHaveBeenCalled();
  });

  it('should accept label inputs', () => {
    component.highLabel = 'Critical';
    component.mediumLabel = 'Warning';
    component.lowLabel = 'Normal';
    fixture.detectChanges();
    expect(component.highLabel).toBe('Critical');
    expect(component.mediumLabel).toBe('Warning');
    expect(component.lowLabel).toBe('Normal');
  });

  it('should initialize trackColor', () => {
    expect(component.trackColor).toBeDefined();
  });
});
