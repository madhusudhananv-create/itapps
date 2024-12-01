import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PspdComponent } from './pspd.component';

describe('PspdComponent', () => {
  let component: PspdComponent;
  let fixture: ComponentFixture<PspdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PspdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PspdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
