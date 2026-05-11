import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewPopupComponent } from './preview-popup.component';
import { provideHttpClient } from '@angular/common/http';

describe('PreviewPopupComponent', () => {
  let component: PreviewPopupComponent;
  let fixture: ComponentFixture<PreviewPopupComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ PreviewPopupComponent ],
      providers: [provideHttpClient()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
