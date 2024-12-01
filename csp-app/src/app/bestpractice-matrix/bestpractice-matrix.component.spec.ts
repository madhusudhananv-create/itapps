import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BestpracticeMatrixComponent } from './bestpractice-matrix.component';

describe('BestpracticeMatrixComponent', () => {
  let component: BestpracticeMatrixComponent;
  let fixture: ComponentFixture<BestpracticeMatrixComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BestpracticeMatrixComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BestpracticeMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
