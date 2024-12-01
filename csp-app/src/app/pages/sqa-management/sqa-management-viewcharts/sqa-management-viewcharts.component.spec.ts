import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SqaManagementViewchartsComponent } from './sqa-management-viewcharts.component';

describe('SqaManagementViewchartsComponent', () => {
  let component: SqaManagementViewchartsComponent;
  let fixture: ComponentFixture<SqaManagementViewchartsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SqaManagementViewchartsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SqaManagementViewchartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
