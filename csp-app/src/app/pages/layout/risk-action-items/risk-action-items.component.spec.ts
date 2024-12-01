import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskActionItemsComponent } from './risk-action-items.component';

describe('RiskActionItemsComponent', () => {
  let component: RiskActionItemsComponent;
  let fixture: ComponentFixture<RiskActionItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiskActionItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskActionItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
