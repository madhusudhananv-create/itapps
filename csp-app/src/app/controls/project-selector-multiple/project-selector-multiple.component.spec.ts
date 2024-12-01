import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectSelectorMultipleComponent } from './project-selector-multiple.component';

describe('ProjectSelectorMultipleComponent', () => {
  let component: ProjectSelectorMultipleComponent;
  let fixture: ComponentFixture<ProjectSelectorMultipleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectSelectorMultipleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectSelectorMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
