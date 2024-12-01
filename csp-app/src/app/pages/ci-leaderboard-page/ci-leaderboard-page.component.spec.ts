import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CiLeaderboardPageComponent } from './ci-leaderboard-page.component';

describe('CiLeaderboardPageComponent', () => {
  let component: CiLeaderboardPageComponent;
  let fixture: ComponentFixture<CiLeaderboardPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CiLeaderboardPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CiLeaderboardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
