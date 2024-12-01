import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImplementationPlanComponent } from './implementation-plan.component';

describe('ImplementationPlanComponent', () => {
  let component: ImplementationPlanComponent;
  let fixture: ComponentFixture<ImplementationPlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImplementationPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImplementationPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
