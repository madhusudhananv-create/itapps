import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsatConfigurationComponent } from './csat-configuration.component';

describe('CsatConfigurationComponent', () => {
  let component: CsatConfigurationComponent;
  let fixture: ComponentFixture<CsatConfigurationComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsatConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsatConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
