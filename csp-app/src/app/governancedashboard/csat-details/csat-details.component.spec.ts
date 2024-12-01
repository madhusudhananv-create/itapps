import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsatDetailsComponent } from './csat-details.component';

describe('CsatDetailsComponent', () => {
  let component: CsatDetailsComponent;
  let fixture: ComponentFixture<CsatDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsatDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsatDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
