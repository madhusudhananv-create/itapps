import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectMigrationPageComponent } from './project-migration-page.component';

describe('ProjectMigrationPageComponent', () => {
  let component: ProjectMigrationPageComponent;
  let fixture: ComponentFixture<ProjectMigrationPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectMigrationPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectMigrationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
