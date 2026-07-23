import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { RoleContextService } from './shared/services/role-context.service';

describe('App', () => {
  const mockRoleContext = {
    currentRole: jasmine.createSpy('currentRole').and.returnValue(null)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideRouter([]),
        { provide: RoleContextService, useValue: mockRoleContext }
      ],
    }).overrideComponent(App, {
      set: { imports: [], template: '<h1>Hello, {{title()}}</h1>' }
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, BCP');
  });
});
