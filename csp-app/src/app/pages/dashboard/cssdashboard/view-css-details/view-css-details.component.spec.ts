import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCssDetailsComponent } from './view-css-details.component';

describe('ViewCssDetailsComponent', () => {
  let component: ViewCssDetailsComponent;
  let fixture: ComponentFixture<ViewCssDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewCssDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCssDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
