import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FMEAPageComponent } from './fmea-page.component';

describe('FMEAPageComponent', () => {
  let component: FMEAPageComponent;
  let fixture: ComponentFixture<FMEAPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FMEAPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FMEAPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
