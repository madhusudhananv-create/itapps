import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ContractStatusViewdetailsComponent } from './contract-status-viewdetails.component';


describe('ContractStatusViewdetailsComponent', () => {
  let component: ContractStatusViewdetailsComponent;
  let fixture: ComponentFixture<ContractStatusViewdetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractStatusViewdetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractStatusViewdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
