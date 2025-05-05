import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MergeChecklistComponent } from './merge-checklist.component';

describe('MergeChecklistComponent', () => {
  let component: MergeChecklistComponent;
  let fixture: ComponentFixture<MergeChecklistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MergeChecklistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MergeChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
