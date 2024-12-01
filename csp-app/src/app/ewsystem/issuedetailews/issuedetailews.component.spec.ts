import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssuedetailewsComponent } from './issuedetailews.component';

describe('IssuedetailewsComponent', () => {
  let component: IssuedetailewsComponent;
  let fixture: ComponentFixture<IssuedetailewsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IssuedetailewsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssuedetailewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
