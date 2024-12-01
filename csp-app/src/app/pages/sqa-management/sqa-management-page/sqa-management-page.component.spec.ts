import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SqaManagementPageComponent } from './sqa-management-page.component';

describe('SqaManagementPageComponent', () => {
  let component: SqaManagementPageComponent;
  let fixture: ComponentFixture<SqaManagementPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SqaManagementPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SqaManagementPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
