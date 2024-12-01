import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditqualitystandardsComponent } from './auditqualitystandards.component';

describe('AuditqualitystandardsComponent', () => {
  let component: AuditqualitystandardsComponent;
  let fixture: ComponentFixture<AuditqualitystandardsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuditqualitystandardsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditqualitystandardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
