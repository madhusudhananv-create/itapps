import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioProjectSelectorComponent } from './portfolio-project-selector.component';
import { provideHttpClient } from '@angular/common/http';

describe('PortfolioProjectSelectorComponent', () => {
  let component: PortfolioProjectSelectorComponent;
  let fixture: ComponentFixture<PortfolioProjectSelectorComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ PortfolioProjectSelectorComponent ],
      providers: [provideHttpClient()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioProjectSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
