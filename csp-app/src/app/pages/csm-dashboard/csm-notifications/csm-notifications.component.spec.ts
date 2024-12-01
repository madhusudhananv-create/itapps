import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsmNotificationsComponent } from './csm-notifications.component';

describe('CsmNotificationsComponent', () => {
  let component: CsmNotificationsComponent;
  let fixture: ComponentFixture<CsmNotificationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsmNotificationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsmNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
