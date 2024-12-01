import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RASPageComponent } from './raspage.component';

describe('RASPageComponent', () => {
  let component: RASPageComponent;
  let fixture: ComponentFixture<RASPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RASPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RASPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
