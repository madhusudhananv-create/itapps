import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistExecutionNewComponent } from './checklist-execution-new.component';

describe('ChecklistExecutionNewComponent', () => {
  let component: ChecklistExecutionNewComponent;
  let fixture: ComponentFixture<ChecklistExecutionNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChecklistExecutionNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistExecutionNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
