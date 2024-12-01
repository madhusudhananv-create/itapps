import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BvdImplementaionScheduleComponent } from './bvd-implementaion-schedule.component';

describe('BvdImplementaionScheduleComponent', () => {
  let component: BvdImplementaionScheduleComponent;
  let fixture: ComponentFixture<BvdImplementaionScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BvdImplementaionScheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BvdImplementaionScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
