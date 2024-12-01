import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdeaBenefitEntryComponent } from './idea-benefit-entry.component';

describe('IdeaBenefitEntryComponent', () => {
  let component: IdeaBenefitEntryComponent;
  let fixture: ComponentFixture<IdeaBenefitEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdeaBenefitEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdeaBenefitEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
