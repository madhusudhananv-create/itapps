import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessProcessModelMappingComponent } from './process-process-model-mapping.component';

describe('ProcessProcessModelMappingComponent', () => {
  let component: ProcessProcessModelMappingComponent;
  let fixture: ComponentFixture<ProcessProcessModelMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessProcessModelMappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessProcessModelMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
