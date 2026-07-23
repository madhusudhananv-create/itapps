import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownFilterComponent } from './dropdown-filter.component';
import { provideHttpClient } from '@angular/common/http';

describe('DropdownFilterComponent', () => {
  let component: DropdownFilterComponent;
  let fixture: ComponentFixture<DropdownFilterComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ DropdownFilterComponent ],
      providers: [provideHttpClient()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
