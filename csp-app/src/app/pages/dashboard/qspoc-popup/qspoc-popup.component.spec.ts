import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QSPOCPopupComponent } from './qspoc-popup.component';

describe('QSPOCPopupComponent', () => {
  let component: QSPOCPopupComponent;
  let fixture: ComponentFixture<QSPOCPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QSPOCPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QSPOCPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
