import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectProcessConfigComponent } from './project-process-config.component';

describe('ProjectProcessConfigComponent', () => {
  let component: ProjectProcessConfigComponent;
  let fixture: ComponentFixture<ProjectProcessConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectProcessConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectProcessConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
