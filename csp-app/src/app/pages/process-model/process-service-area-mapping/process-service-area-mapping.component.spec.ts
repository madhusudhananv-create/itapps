import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessServiceAreaMappingComponent } from './process-service-area-mapping.component';

describe('ProcessServiceAreaMappingComponent', () => {
  let component: ProcessServiceAreaMappingComponent;
  let fixture: ComponentFixture<ProcessServiceAreaMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessServiceAreaMappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessServiceAreaMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
