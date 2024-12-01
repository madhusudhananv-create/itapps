import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GrcsystemComponent } from './grcsystem.component';

describe('GrcsystemComponent', () => {
  let component: GrcsystemComponent;
  let fixture: ComponentFixture<GrcsystemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GrcsystemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GrcsystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
