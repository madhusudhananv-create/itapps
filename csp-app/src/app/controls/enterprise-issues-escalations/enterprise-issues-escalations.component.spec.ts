import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterpriseIssuesEscalationsComponent } from './enterprise-issues-escalations.component';

describe('EnterpriseIssuesEscalationsComponent', () => {
  let component: EnterpriseIssuesEscalationsComponent;
  let fixture: ComponentFixture<EnterpriseIssuesEscalationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnterpriseIssuesEscalationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterpriseIssuesEscalationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
