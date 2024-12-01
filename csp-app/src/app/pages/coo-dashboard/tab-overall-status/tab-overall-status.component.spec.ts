import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabOverallStatusComponent } from './tab-overall-status.component';

describe('TabOverallStatusComponent', () => {
  let component: TabOverallStatusComponent;
  let fixture: ComponentFixture<TabOverallStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabOverallStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabOverallStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
