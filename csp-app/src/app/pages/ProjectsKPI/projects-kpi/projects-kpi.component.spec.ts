import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsKPIComponent } from './projects-kpi.component';

describe('ProjectsKPIComponent', () => {
  let component: ProjectsKPIComponent;
  let fixture: ComponentFixture<ProjectsKPIComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectsKPIComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectsKPIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
