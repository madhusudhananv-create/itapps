import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SqaManagementSetupComponent } from './sqa-management-setup.component';

describe('SqaManagementSetupComponent', () => {
  let component: SqaManagementSetupComponent;
  let fixture: ComponentFixture<SqaManagementSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SqaManagementSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SqaManagementSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
