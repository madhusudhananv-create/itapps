import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterpriseCssComponent } from './enterprise-css.component';

describe('EnterpriseCssComponent', () => {
  let component: EnterpriseCssComponent;
  let fixture: ComponentFixture<EnterpriseCssComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnterpriseCssComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterpriseCssComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
