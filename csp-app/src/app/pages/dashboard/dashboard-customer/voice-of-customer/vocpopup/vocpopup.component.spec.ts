import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VocpopupComponent } from './vocpopup.component';

describe('VocpopupComponent', () => {
  let component: VocpopupComponent;
  let fixture: ComponentFixture<VocpopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VocpopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VocpopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
