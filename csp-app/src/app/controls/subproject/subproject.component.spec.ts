import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubprojectComponent } from './subproject.component';

describe('SubprojectComponent', () => {
  let component: SubprojectComponent;
  let fixture: ComponentFixture<SubprojectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubprojectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubprojectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
