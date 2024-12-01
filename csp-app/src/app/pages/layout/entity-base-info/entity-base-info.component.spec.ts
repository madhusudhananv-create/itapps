import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityBaseInfoComponent } from './entity-base-info.component';

describe('EntityBaseInfoComponent', () => {
  let component: EntityBaseInfoComponent;
  let fixture: ComponentFixture<EntityBaseInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityBaseInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityBaseInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
