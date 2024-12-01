import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrispScoresEntryComponent } from './crisp-scores-entry.component';

describe('CrispScoresEntryComponent', () => {
  let component: CrispScoresEntryComponent;
  let fixture: ComponentFixture<CrispScoresEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrispScoresEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrispScoresEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
