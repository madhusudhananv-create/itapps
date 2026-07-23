import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsatConfigurationComponent } from './csat-configuration.component';
import { provideHttpClient } from '@angular/common/http';

describe('CsatConfigurationComponent', () => {
  let component: CsatConfigurationComponent;
  let fixture: ComponentFixture<CsatConfigurationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CsatConfigurationComponent],
      providers: [provideHttpClient()]
    }).compileComponents();
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
