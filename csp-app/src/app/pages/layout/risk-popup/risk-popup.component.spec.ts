import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskPopupComponent } from './risk-popup.component';

describe('RiskPopupComponent', () => {
  let component: RiskPopupComponent;
  let fixture: ComponentFixture<RiskPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiskPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
