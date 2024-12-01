import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MinutesofmeetingComponent } from './minutesofmeeting.component';

describe('MinutesofmeetingComponent', () => {
  let component: MinutesofmeetingComponent;
  let fixture: ComponentFixture<MinutesofmeetingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MinutesofmeetingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MinutesofmeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
