import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrispDialogValidationsComponent } from './crisp-dialog-validations.component';

describe('CrispDialogValidationsComponent', () => {
  let component: CrispDialogValidationsComponent;
  let fixture: ComponentFixture<CrispDialogValidationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrispDialogValidationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrispDialogValidationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
