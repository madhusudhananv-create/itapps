import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportspageComponent } from './reportspage.component';

describe('ReportspageComponent', () => {
  let component: ReportspageComponent;
  let fixture: ComponentFixture<ReportspageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportspageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportspageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
