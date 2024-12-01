import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrispCategoryComponent } from './crisp-category.component';

describe('CrispCategoryComponent', () => {
  let component: CrispCategoryComponent;
  let fixture: ComponentFixture<CrispCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrispCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrispCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
