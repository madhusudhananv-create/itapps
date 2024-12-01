import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistFindingsPageComponent } from './checklist-findings-page.component';

describe('ChecklistFindingsPageComponent', () => {
  let component: ChecklistFindingsPageComponent;
  let fixture: ComponentFixture<ChecklistFindingsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChecklistFindingsPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistFindingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
