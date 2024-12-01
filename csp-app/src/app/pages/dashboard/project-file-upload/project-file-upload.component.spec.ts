import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectFileUploadComponent } from './project-file-upload.component';

describe('ProjectFileUploadComponent', () => {
  let component: ProjectFileUploadComponent;
  let fixture: ComponentFixture<ProjectFileUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectFileUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectFileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
