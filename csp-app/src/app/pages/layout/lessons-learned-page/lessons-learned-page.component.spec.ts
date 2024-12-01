import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonsLearnedPageComponent } from './lessons-learned-page.component';

describe('LessonsLearnedPageComponent', () => {
  let component: LessonsLearnedPageComponent;
  let fixture: ComponentFixture<LessonsLearnedPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LessonsLearnedPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LessonsLearnedPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
