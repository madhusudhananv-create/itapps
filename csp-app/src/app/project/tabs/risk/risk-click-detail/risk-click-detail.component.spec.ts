import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskClickDetailComponent } from './risk-click-detail.component';

describe('RiskClickDetailComponent', () => {
  let component: RiskClickDetailComponent;
  let fixture: ComponentFixture<RiskClickDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiskClickDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskClickDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
