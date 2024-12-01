import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessgoalComponent } from './successgoal.component';

describe('SuccessgoalComponent', () => {
  let component: SuccessgoalComponent;
  let fixture: ComponentFixture<SuccessgoalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuccessgoalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuccessgoalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
