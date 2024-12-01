import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrispDialogComponent } from './crisp-dialog.component';

describe('CrispDialogComponent', () => {
  let component: CrispDialogComponent;
  let fixture: ComponentFixture<CrispDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrispDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrispDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
