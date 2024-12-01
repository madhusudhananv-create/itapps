import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdeasDetailsComponent } from './ideas-details.component';

describe('IdeasDetailsComponent', () => {
  let component: IdeasDetailsComponent;
  let fixture: ComponentFixture<IdeasDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdeasDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdeasDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
