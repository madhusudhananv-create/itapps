import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsatdashboardComponent } from './csatdashboard.component';

describe('CsatdashboardComponent', () => {
  let component: CsatdashboardComponent;
  let fixture: ComponentFixture<CsatdashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsatdashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsatdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
