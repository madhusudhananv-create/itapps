import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistFindingsSectionComponent } from './checklist-findings-section.component';

describe('ChecklistFindingsSectionComponent', () => {
  let component: ChecklistFindingsSectionComponent;
  let fixture: ComponentFixture<ChecklistFindingsSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChecklistFindingsSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistFindingsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
