import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdeaEntryComponent } from './idea-entry.component';

describe('IdeaEntryComponent', () => {
  let component: IdeaEntryComponent;
  let fixture: ComponentFixture<IdeaEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdeaEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdeaEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
