import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BvdSimilarideasComponent } from './bvd-similarideas.component';

describe('BvdSimilarideasComponent', () => {
  let component: BvdSimilarideasComponent;
  let fixture: ComponentFixture<BvdSimilarideasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BvdSimilarideasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BvdSimilarideasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
