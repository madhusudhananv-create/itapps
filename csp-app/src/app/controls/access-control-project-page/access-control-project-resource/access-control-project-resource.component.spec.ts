import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessControlProjectResourceComponent } from './access-control-project-resource.component';

describe('AccessControlProjectResourceComponent', () => {
  let component: AccessControlProjectResourceComponent;
  let fixture: ComponentFixture<AccessControlProjectResourceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessControlProjectResourceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessControlProjectResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
