import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdeasListViewComponent } from './ideas-list-view.component';

describe('IdeasListViewComponent', () => {
  let component: IdeasListViewComponent;
  let fixture: ComponentFixture<IdeasListViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdeasListViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdeasListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
