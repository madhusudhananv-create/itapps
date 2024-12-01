import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BvdEntryComponent } from './bvd-entry.component';

describe('BvdEntryComponent', () => {
  let component: BvdEntryComponent;
  let fixture: ComponentFixture<BvdEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BvdEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BvdEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
