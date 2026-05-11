import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuarterFilterComponent } from './quarter-filter.component';
import { provideHttpClient } from '@angular/common/http';
 

describe('QuarterFilterComponent', () => {
  let component: QuarterFilterComponent;
  let fixture: ComponentFixture<QuarterFilterComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ QuarterFilterComponent ],
      providers: [provideHttpClient()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuarterFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
