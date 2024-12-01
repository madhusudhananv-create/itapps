import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterpriseNpsComponent } from './enterprise-nps.component';

describe('EnterpriseNpsComponent', () => {
  let component: EnterpriseNpsComponent;
  let fixture: ComponentFixture<EnterpriseNpsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnterpriseNpsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterpriseNpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
