import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrispScoresValidationsComponent } from './crisp-scores-validations.component';

describe('CrispScoresValidationsComponent', () => {
  let component: CrispScoresValidationsComponent;
  let fixture: ComponentFixture<CrispScoresValidationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrispScoresValidationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrispScoresValidationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
