import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterKpiComponent } from './master-kpi.component';

describe('MasterKpiComponent', () => {
  let component: MasterKpiComponent;
  let fixture: ComponentFixture<MasterKpiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MasterKpiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterKpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
