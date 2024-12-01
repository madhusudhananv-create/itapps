import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BvdIdeasListComponent } from './bvd-ideas-list.component';

describe('BvdIdeasListComponent', () => {
  let component: BvdIdeasListComponent;
  let fixture: ComponentFixture<BvdIdeasListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BvdIdeasListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BvdIdeasListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
