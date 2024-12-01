import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BestPracticesPageComponent } from './best-practices-page.component';

describe('BestPracticesPageComponent', () => {
  let component: BestPracticesPageComponent;
  let fixture: ComponentFixture<BestPracticesPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BestPracticesPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BestPracticesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
