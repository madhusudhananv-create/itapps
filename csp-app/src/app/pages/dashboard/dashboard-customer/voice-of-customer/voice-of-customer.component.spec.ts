import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VoiceOfCustomerComponent } from './voice-of-customer.component';

describe('VoiceOfCustomerComponent', () => {
  let component: VoiceOfCustomerComponent;
  let fixture: ComponentFixture<VoiceOfCustomerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VoiceOfCustomerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VoiceOfCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
