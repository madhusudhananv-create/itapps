import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessChecklistMappingComponent } from './process-checklist-mapping.component';

describe('ProcessChecklistMappingComponent', () => {
  let component: ProcessChecklistMappingComponent;
  let fixture: ComponentFixture<ProcessChecklistMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessChecklistMappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessChecklistMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
