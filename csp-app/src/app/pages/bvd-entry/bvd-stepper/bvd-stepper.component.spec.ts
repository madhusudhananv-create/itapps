import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BvdStepperComponent } from './bvd-stepper.component';

describe('BvdStepperComponent', () => {
  let component: BvdStepperComponent;
  let fixture: ComponentFixture<BvdStepperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BvdStepperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BvdStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
