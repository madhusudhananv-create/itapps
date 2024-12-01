import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FmeaManagementComponent } from './fmea-management.component';

describe('FmeaManagementComponent', () => {
  let component: FmeaManagementComponent;
  let fixture: ComponentFixture<FmeaManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FmeaManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FmeaManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
