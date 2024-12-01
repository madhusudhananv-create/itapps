import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Top3PerformingComponent } from './top3-performing.component';
 

describe('Top3PerformingComponent', () => {
  let component: Top3PerformingComponent;
  let fixture: ComponentFixture<Top3PerformingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Top3PerformingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Top3PerformingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
