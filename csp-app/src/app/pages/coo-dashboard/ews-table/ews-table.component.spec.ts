import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EwsTableComponent } from './ews-table.component';

describe('EwsTableComponent', () => {
  let component: EwsTableComponent;
  let fixture: ComponentFixture<EwsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EwsTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EwsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
