import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CSSNPSDetailsTableComponent } from './cssnpsdetails-table.component';

describe('CSSNPSDetailsTableComponent', () => {
  let component: CSSNPSDetailsTableComponent;
  let fixture: ComponentFixture<CSSNPSDetailsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CSSNPSDetailsTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CSSNPSDetailsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
