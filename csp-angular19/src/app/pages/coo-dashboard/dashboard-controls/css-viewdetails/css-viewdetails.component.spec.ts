import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CSSViewdetailsComponent } from './css-viewdetails.component';
import { provideHttpClient } from '@angular/common/http';


describe('CSSViewdetailsComponent', () => {
  let component: CSSViewdetailsComponent;
  let fixture: ComponentFixture<CSSViewdetailsComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ CSSViewdetailsComponent ],
      providers: [provideHttpClient()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CSSViewdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
