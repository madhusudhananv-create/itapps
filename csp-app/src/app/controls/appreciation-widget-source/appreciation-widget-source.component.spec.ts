import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppreciationWidgetSourceComponent } from './appreciation-widget-source.component';

describe('AppreciationWidgetSourceComponent', () => {
  let component: AppreciationWidgetSourceComponent;
  let fixture: ComponentFixture<AppreciationWidgetSourceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppreciationWidgetSourceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppreciationWidgetSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
