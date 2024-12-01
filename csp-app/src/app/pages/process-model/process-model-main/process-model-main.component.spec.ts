import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessModelMainComponent } from './process-model-main.component';

describe('ProcessModelMainComponent', () => {
  let component: ProcessModelMainComponent;
  let fixture: ComponentFixture<ProcessModelMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessModelMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessModelMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
