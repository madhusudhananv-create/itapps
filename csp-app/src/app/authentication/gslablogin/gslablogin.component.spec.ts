import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GslabloginComponent } from './gslablogin.component';

describe('GslabloginComponent', () => {
  let component: GslabloginComponent;
  let fixture: ComponentFixture<GslabloginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GslabloginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GslabloginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
