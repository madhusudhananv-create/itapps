import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SqaManagementUploadComponent } from './sqa-management-upload.component';

describe('SqaManagementUploadComponent', () => {
  let component: SqaManagementUploadComponent;
  let fixture: ComponentFixture<SqaManagementUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SqaManagementUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SqaManagementUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
