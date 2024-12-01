import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessModelProjectComponent } from './process-model-project.component';

describe('ProcessModelProjectComponent', () => {
  let component: ProcessModelProjectComponent;
  let fixture: ComponentFixture<ProcessModelProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessModelProjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessModelProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
