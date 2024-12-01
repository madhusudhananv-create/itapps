import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrispCriteriaComponent } from './crisp-criteria.component';

describe('CrispCriteriaComponent', () => {
  let component: CrispCriteriaComponent;
  let fixture: ComponentFixture<CrispCriteriaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrispCriteriaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrispCriteriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
