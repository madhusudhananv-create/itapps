import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCsatComponent } from './view-csat.component';

describe('ViewCsatComponent', () => {
  let component: ViewCsatComponent;
  let fixture: ComponentFixture<ViewCsatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewCsatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCsatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
