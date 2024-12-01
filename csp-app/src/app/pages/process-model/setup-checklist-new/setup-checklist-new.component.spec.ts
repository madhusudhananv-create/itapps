import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupChecklistNewComponent } from './setup-checklist-new.component';

describe('SetupChecklistNewComponent', () => {
  let component: SetupChecklistNewComponent;
  let fixture: ComponentFixture<SetupChecklistNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetupChecklistNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupChecklistNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
