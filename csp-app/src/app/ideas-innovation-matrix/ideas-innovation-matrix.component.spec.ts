import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdeasInnovationMatrixComponent } from './ideas-innovation-matrix.component';

describe('IdeasInnovationMatrixComponent', () => {
  let component: IdeasInnovationMatrixComponent;
  let fixture: ComponentFixture<IdeasInnovationMatrixComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdeasInnovationMatrixComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdeasInnovationMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
