import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectSpecificFailuresComponent } from './project-specific-failures.component';

describe('ProjectSpecificFailuresComponent', () => {
  let component: ProjectSpecificFailuresComponent;
  let fixture: ComponentFixture<ProjectSpecificFailuresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectSpecificFailuresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectSpecificFailuresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
