import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RiskIssueViewdetailsComponent } from './risk-issue-viewdetails.component';


describe('RiskIssueViewdetailsComponent', () => {
  let component: RiskIssueViewdetailsComponent;
  let fixture: ComponentFixture<RiskIssueViewdetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiskIssueViewdetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskIssueViewdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
