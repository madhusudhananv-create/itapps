import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompliancedetailsComponent } from './compliancedetails.component';

describe('CompliancedetailsComponent', () => {
  let component: CompliancedetailsComponent;
  let fixture: ComponentFixture<CompliancedetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompliancedetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompliancedetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
