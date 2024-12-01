import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrispValidationsComponent } from './crisp-validations.component';

describe('CrispValidationsComponent', () => {
  let component: CrispValidationsComponent;
  let fixture: ComponentFixture<CrispValidationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrispValidationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrispValidationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
