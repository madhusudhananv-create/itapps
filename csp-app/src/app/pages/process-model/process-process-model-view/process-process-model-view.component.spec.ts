import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessProcessModelViewComponent } from './process-process-model-view.component';

describe('ProcessProcessModelViewComponent', () => {
  let component: ProcessProcessModelViewComponent;
  let fixture: ComponentFixture<ProcessProcessModelViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessProcessModelViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessProcessModelViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
