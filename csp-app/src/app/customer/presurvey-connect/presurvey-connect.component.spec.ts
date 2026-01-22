import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PresurveyConnectComponent } from './presurvey-connect.component';

describe('PresurveyConnectComponent', () => {
  let component: PresurveyConnectComponent;
  let fixture: ComponentFixture<PresurveyConnectComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PresurveyConnectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PresurveyConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
