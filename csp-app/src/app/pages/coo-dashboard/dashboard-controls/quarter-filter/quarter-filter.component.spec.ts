import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { QuarterFilterComponent } from './quarter-filter.component';
 

describe('QuarterFilterComponent', () => {
  let component: QuarterFilterComponent;
  let fixture: ComponentFixture<QuarterFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuarterFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuarterFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
