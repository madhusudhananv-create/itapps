import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsmAccessCountComponent } from './csm-access-count.component';

describe('CsmAccessCountComponent', () => {
  let component: CsmAccessCountComponent;
  let fixture: ComponentFixture<CsmAccessCountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsmAccessCountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsmAccessCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
