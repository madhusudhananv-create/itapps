import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchableMultiselectDropdownComponent } from './searchable-multiselect-dropdown.component';
import { provideHttpClient } from '@angular/common/http';

describe('SearchableMultiselectDropdownComponent', () => {
  let component: SearchableMultiselectDropdownComponent;
  let fixture: ComponentFixture<SearchableMultiselectDropdownComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SearchableMultiselectDropdownComponent],
      providers: [provideHttpClient()]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchableMultiselectDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize Id as empty array', () => {
    expect(component.Id).toEqual([]);
  });

  it('should initialize data as empty array', () => {
    expect(component.data).toEqual([]);
  });

  it('should initialize idField as empty string', () => {
    expect(component.idField).toBe('');
  });

  it('should initialize nameField as empty string', () => {
    expect(component.nameField).toBe('');
  });

  it('should initialize displayName as empty string', () => {
    expect(component.displayName).toBe('');
  });

  it('should initialize isLoaded as false', () => {
    expect(component.isLoaded).toBeFalsy();
  });

  it('should initialize reset as false', () => {
    expect(component.reset).toBeFalsy();
  });

  it('should initialize disabled as false', () => {
    expect(component.disabled).toBeFalsy();
  });

  it('should initialize searchVal as empty string', () => {
    expect(component.searchVal).toBe('');
  });

  it('should initialize ids with ["-1"]', () => {
    expect(component.ids).toEqual(['-1']);
  });

  it('should have onChange EventEmitter defined', () => {
    expect(component.onChange).toBeDefined();
  });

  it('should have selectionChange EventEmitter defined', () => {
    expect(component.selectionChange).toBeDefined();
  });

  it('should update dataIp on ngOnChanges when data changes', () => {
    const newData = [{ id: '1', name: 'Option A' }];
    component.data = newData;
    component.ngOnChanges();
    expect(component.dataIp).toEqual(newData);
  });

  it('should clear searchValue on ngOnChanges when reset is true', () => {
    component.searchValue = 'test';
    component.reset = true;
    component.ngOnChanges();
    expect(component.searchValue).toBe('');
  });

  it('should accept disabled input as true', () => {
    component.disabled = true;
    fixture.detectChanges();
    expect(component.disabled).toBeTruthy();
  });
});
