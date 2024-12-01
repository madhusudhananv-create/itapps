import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {  AccountHealthViewdetailsComponent } from './account-health-viewdetails.component';

describe('AccountHealthViewdetailsComponent', () => {
  let component: AccountHealthViewdetailsComponent;
  let fixture: ComponentFixture<AccountHealthViewdetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountHealthViewdetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountHealthViewdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
