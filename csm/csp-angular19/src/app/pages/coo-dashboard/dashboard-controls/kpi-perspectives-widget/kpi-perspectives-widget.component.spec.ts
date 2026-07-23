import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiPerspectivesWidgetComponent } from './kpi-perspectives-widget.component';
import { provideHttpClient } from '@angular/common/http';

describe('KpiPerspectivesWidgetComponent', () => {
  let component: KpiPerspectivesWidgetComponent;
  let fixture: ComponentFixture<KpiPerspectivesWidgetComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ KpiPerspectivesWidgetComponent ],
      providers: [provideHttpClient()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiPerspectivesWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
