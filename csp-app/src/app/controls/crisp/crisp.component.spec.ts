import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrispComponent } from './crisp.component';

describe('CrispComponent', () => {
  let component: CrispComponent;
  let fixture: ComponentFixture<CrispComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrispComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrispComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
