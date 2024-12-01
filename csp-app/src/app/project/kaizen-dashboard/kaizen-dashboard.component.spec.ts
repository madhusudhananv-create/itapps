import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KaizenDashboardComponent } from './kaizen-dashboard.component';

describe('KaizenDashboardComponent', () => {
  let component: KaizenDashboardComponent;
  let fixture: ComponentFixture<KaizenDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KaizenDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KaizenDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
