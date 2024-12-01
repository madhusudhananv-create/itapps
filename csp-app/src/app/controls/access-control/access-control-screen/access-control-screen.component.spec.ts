import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessControlScreenComponent } from './access-control-screen.component';

describe('AccessControlScreenComponent', () => {
  let component: AccessControlScreenComponent;
  let fixture: ComponentFixture<AccessControlScreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessControlScreenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessControlScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
