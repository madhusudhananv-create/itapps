import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CiTrackerPageComponent } from './ci-tracker-page.component';

describe('CiTrackerPageComponent', () => {
  let component: CiTrackerPageComponent;
  let fixture: ComponentFixture<CiTrackerPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CiTrackerPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CiTrackerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
