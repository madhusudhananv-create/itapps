import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessControlProjectPageComponent } from './access-control-project-page.component';

describe('AccessControlProjectPageComponent', () => {
  let component: AccessControlProjectPageComponent;
  let fixture: ComponentFixture<AccessControlProjectPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessControlProjectPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessControlProjectPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
