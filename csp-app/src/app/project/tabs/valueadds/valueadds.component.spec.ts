import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValueaddsComponent } from './valueadds.component';

describe('ValueaddsComponent', () => {
  let component: ValueaddsComponent;
  let fixture: ComponentFixture<ValueaddsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValueaddsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValueaddsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
