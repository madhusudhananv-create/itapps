import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CSSViewdetailsComponent } from './css-viewdetails.component';


describe('CSSViewdetailsComponent', () => {
  let component: CSSViewdetailsComponent;
  let fixture: ComponentFixture<CSSViewdetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CSSViewdetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CSSViewdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
