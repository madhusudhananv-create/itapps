import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EwsystemComponent } from './ewsystem.component';

describe('EwsystemComponent', () => {
  let component: EwsystemComponent;
  let fixture: ComponentFixture<EwsystemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EwsystemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EwsystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
