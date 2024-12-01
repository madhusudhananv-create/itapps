import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessControlProjectComponent } from './access-control-project.component';

describe('AccessControlProjectComponent', () => {
  let component: AccessControlProjectComponent;
  let fixture: ComponentFixture<AccessControlProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessControlProjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessControlProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
