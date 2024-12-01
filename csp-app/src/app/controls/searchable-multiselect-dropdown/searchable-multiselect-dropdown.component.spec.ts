import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchableMultiselectDropdownComponent } from './searchable-multiselect-dropdown.component';

describe('SearchableMultiselectDropdownComponent', () => {
  let component: SearchableMultiselectDropdownComponent;
  let fixture: ComponentFixture<SearchableMultiselectDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchableMultiselectDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchableMultiselectDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
