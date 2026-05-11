/**
 * SpellCheckComponent - Spell checking component for text editors
 * Migrated from Angular 6 to Angular 19
 * 
 * Migration Changes:
 * - Updated to standalone component
 * - Modernized with Angular 19 patterns
 * - Added async initialization
 * - Type safety improvements
 * 
 * Requirements:
 * - typo-js library for spell checking
 * - Dictionary files in /assets/dictionary/
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Note: Install typo-js with: npm install typo-js @types/typo-js
declare var Typo: any;

@Component({
  selector: 'app-spell-check',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spell-check.component.html',
  styleUrls: ['./spell-check.component.scss']
})
export class SpellCheckComponent implements OnInit {
  userText = '';
  processedHtml = '';
  dictionary: any | null = null;
  rawText = '';

  async ngOnInit() {
    try {
      // Load dictionary files
      const aff = await fetch('/assets/dictionary/index.aff').then(r => r.text());
      const dic = await fetch('/assets/dictionary/index.dic').then(r => r.text());
      
      // Initialize Typo dictionary
      if (typeof Typo !== 'undefined') {
        this.dictionary = new Typo('en_US', aff, dic);
      } else {
        console.warn('Typo library not loaded. Spell check disabled.');
      }
    } catch (error) {
      console.error('Error loading dictionary:', error);
    }
  }

  onEditorInput(event: Event): void {
    const text = (event.target as HTMLElement).innerText || '';
    this.rawText = text;
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === ' ' || event.key === 'Enter' || event.key === '.' || event.key === ',') {
      this.checkSpelling();
    }
  }

  checkSpelling(): void {
    if (!this.dictionary) {
      return;
    }

    const words = this.rawText.split(/\b/);

    this.processedHtml = words
      .map(word => {
        const isWord = /^[a-zA-Z]+$/.test(word);
        
        if (isWord && !this.dictionary.check(word)) {
          const suggestions = this.dictionary.suggest(word);
          const tooltip = suggestions.length
            ? `Did you mean: ${suggestions.join(', ')}?`
            : 'No suggestions';
          return `<span class="misspelled" title="${tooltip}">${word}</span>`;
        }
        
        return word;
      })
      .join('');
  }
}
