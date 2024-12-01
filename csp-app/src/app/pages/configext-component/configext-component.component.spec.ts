import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigextComponentComponent } from './configext-component.component';

describe('ConfigextComponentComponent', () => {
  let component: ConfigextComponentComponent;
  let fixture: ComponentFixture<ConfigextComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigextComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigextComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
