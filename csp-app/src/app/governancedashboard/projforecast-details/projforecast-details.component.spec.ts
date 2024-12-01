import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjforecastDetailsComponent } from './projforecast-details.component';

describe('ProjforecastDetailsComponent', () => {
  let component: ProjforecastDetailsComponent;
  let fixture: ComponentFixture<ProjforecastDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjforecastDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjforecastDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
