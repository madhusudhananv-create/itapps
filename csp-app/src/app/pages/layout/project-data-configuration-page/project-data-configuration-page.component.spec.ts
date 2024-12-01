import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectDataConfigurationComponent } from './project-data-configuration-page.component';



describe('ProjectDataConfigurationComponent', () => {
  let component: ProjectDataConfigurationComponent;
  let fixture: ComponentFixture<ProjectDataConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectDataConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectDataConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
