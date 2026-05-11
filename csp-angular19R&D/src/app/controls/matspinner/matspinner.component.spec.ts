import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatspinnerComponent } from './matspinner.component';
import { provideHttpClient } from '@angular/common/http';

describe('MatspinnerComponent', () => {
  let component: MatspinnerComponent;
  let fixture: ComponentFixture<MatspinnerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatspinnerComponent],
      providers: [provideHttpClient()]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatspinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have hidden input default as false', () => {
    expect(component.hidden).toBeFalsy();
  });

  it('should accept hidden input as true', () => {
    component.hidden = true;
    fixture.detectChanges();
    expect(component.hidden).toBeTruthy();
  });

  it('should accept hidden input as false', () => {
    component.hidden = false;
    fixture.detectChanges();
    expect(component.hidden).toBeFalsy();
  });

  it('should render spinner element when hidden is false', () => {
    component.hidden = false;
    fixture.detectChanges();
    expect(fixture.nativeElement).toBeTruthy();
  });
});
