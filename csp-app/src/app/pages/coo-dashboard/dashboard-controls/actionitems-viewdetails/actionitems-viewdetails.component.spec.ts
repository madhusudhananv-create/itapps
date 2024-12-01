import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionitemsViewdetailsComponent } from './actionitems-viewdetails.component';


describe('ActionitemsViewdetailsComponent', () => {
  let component: ActionitemsViewdetailsComponent;
  let fixture: ComponentFixture<ActionitemsViewdetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActionitemsViewdetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionitemsViewdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
