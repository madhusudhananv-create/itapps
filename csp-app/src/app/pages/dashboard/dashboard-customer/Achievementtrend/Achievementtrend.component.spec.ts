import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AchievementtrendComponent } from './Achievementtrend.component';
 
describe('AchievementtrendComponent', () => {
  let component: AchievementtrendComponent;
  let fixture: ComponentFixture<AchievementtrendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AchievementtrendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AchievementtrendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
