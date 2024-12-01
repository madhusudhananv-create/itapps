import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CSSNPSTrendComponent } from './css-nps-trend.component';

describe('CSSNPSTrendComponent', () => {
  let component: CSSNPSTrendComponent;
  let fixture: ComponentFixture<CSSNPSTrendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CSSNPSTrendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CSSNPSTrendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
