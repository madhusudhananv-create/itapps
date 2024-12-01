import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionItemsPageComponent } from './action-items-page.component';

describe('ActionItemsComponent', () => {
  let component: ActionItemsPageComponent;
  let fixture: ComponentFixture<ActionItemsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActionItemsPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionItemsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
