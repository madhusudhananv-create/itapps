import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerObjectivesSectionComponent } from './customer-objectives-section.component';

describe('CustomerObjectivesSectionComponent', () => {
  let component: CustomerObjectivesSectionComponent;
  let fixture: ComponentFixture<CustomerObjectivesSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerObjectivesSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerObjectivesSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
