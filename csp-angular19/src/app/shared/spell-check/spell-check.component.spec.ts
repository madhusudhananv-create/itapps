import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { SpellCheckComponent } from './spell-check.component';

describe('SpellCheckComponent', () => {
  let component: SpellCheckComponent;
  let fixture: ComponentFixture<SpellCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpellCheckComponent],
      providers: [provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(SpellCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty text', () => {
    expect(component.userText).toBe('');
    expect(component.processedHtml).toBe('');
    expect(component.rawText).toBe('');
  });

  it('should update rawText on editor input', () => {
    const event = {
      target: {
        innerText: 'Hello World'
      }
    } as any;

    component.onEditorInput(event);
    expect(component.rawText).toBe('Hello World');
  });

  it('should handle keydown events', () => {
    component.rawText = 'test';
    const event = new KeyboardEvent('keydown', { key: ' ' });
    
    spyOn(component, 'checkSpelling');
    component.onKeyDown(event);
    
    expect(component.checkSpelling).toHaveBeenCalled();
  });
});
