import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarNewComponent } from './navbar-new.component';

describe('NavbarNewComponent', () => {
  let component: NavbarNewComponent;
  let fixture: ComponentFixture<NavbarNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavbarNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
