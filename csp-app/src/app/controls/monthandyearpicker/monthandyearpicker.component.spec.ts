import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthandyearpickerComponent } from './monthandyearpicker.component';

describe('MonthandyearpickerComponent', () => {
  let component: MonthandyearpickerComponent;
  let fixture: ComponentFixture<MonthandyearpickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonthandyearpickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthandyearpickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
