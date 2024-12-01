import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GovernancePageComponent } from './governance-page.component';

describe('GovernancePageComponent', () => {
  let component: GovernancePageComponent;
  let fixture: ComponentFixture<GovernancePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GovernancePageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GovernancePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
