import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FmeaProjectSetupComponent } from './fmea-project-setup.component';

describe('FmeaProjectSetupComponent', () => {
  let component: FmeaProjectSetupComponent;
  let fixture: ComponentFixture<FmeaProjectSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FmeaProjectSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FmeaProjectSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
