import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionitemComponent } from './actionitem.component';

describe('ActionitemComponent', () => {
  let component: ActionitemComponent;
  let fixture: ComponentFixture<ActionitemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActionitemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionitemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
