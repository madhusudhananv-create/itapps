import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerObjectivesPageComponent } from './customer-objectives-page.component';

describe('CustomerObjectivesPageComponent', () => {
  let component: CustomerObjectivesPageComponent;
  let fixture: ComponentFixture<CustomerObjectivesPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerObjectivesPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerObjectivesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
