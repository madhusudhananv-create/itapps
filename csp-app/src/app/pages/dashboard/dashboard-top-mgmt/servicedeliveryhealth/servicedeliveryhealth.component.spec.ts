import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicedeliveryhealthComponent } from './servicedeliveryhealth.component';

describe('ServicedeliveryhealthComponent', () => {
  let component: ServicedeliveryhealthComponent;
  let fixture: ComponentFixture<ServicedeliveryhealthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServicedeliveryhealthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicedeliveryhealthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
