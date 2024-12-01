import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectSelectorSingletomultipleComponent } from './project-selector-singletomultiple.component';

describe('ProjectSelectorSingletomultipleComponent', () => {
  let component: ProjectSelectorSingletomultipleComponent;
  let fixture: ComponentFixture<ProjectSelectorSingletomultipleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectSelectorSingletomultipleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectSelectorSingletomultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
