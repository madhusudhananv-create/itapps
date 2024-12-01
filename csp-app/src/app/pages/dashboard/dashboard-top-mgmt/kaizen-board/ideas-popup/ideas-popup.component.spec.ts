import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdeasPopupComponent } from './ideas-popup.component';

describe('IdeasPopupComponent', () => {
  let component: IdeasPopupComponent;
  let fixture: ComponentFixture<IdeasPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdeasPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdeasPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
