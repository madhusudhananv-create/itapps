import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableFilterComponent } from './table-filter.component';
import { provideHttpClient } from '@angular/common/http';

describe('TableFilterComponent', () => {
  let component: TableFilterComponent;
  let fixture: ComponentFixture<TableFilterComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ TableFilterComponent ],
      providers: [provideHttpClient()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
