import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistAuditeeComponent } from './checklist-auditee.component';

describe('ChecklistAuditeeComponent', () => {
  let component: ChecklistAuditeeComponent;
  let fixture: ComponentFixture<ChecklistAuditeeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChecklistAuditeeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistAuditeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
