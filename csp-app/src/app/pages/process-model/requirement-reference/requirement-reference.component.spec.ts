import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementReferenceComponent } from './requirement-reference.component';

describe('RequirementReferenceComponent', () => {
  let component: RequirementReferenceComponent;
  let fixture: ComponentFixture<RequirementReferenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequirementReferenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequirementReferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
