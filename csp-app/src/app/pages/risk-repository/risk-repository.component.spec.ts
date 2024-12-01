import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskRepositoryComponent } from './risk-repository.component';

describe('RiskRepositoryComponent', () => {
  let component: RiskRepositoryComponent;
  let fixture: ComponentFixture<RiskRepositoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiskRepositoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskRepositoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
