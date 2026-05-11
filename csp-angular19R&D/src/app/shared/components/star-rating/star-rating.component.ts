/**
 * Star Rating Component
 * Migrated from Angular 6 to Angular 19
 * 
 * Displays interactive star rating (1-5 stars)
 * Used in Customer Satisfaction Survey for criteria ratings
 * 
 * Features:
 * - Click to rate (1-5 stars)
 * - Visual feedback with color coding
 * - Tooltips for each rating level
 * - Disabled state support
 * - Two scale types: Satisfaction (1) and Agreement (3)
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule
  ],
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss']
})
export class StarRatingComponent implements OnInit {
  @Input() disabled: boolean = false;
  @Input() rating: number = 0;
  @Input() starCount: number = 5;
  @Input() color: StarRatingColor = StarRatingColor.accent;
  @Input('Scale') scale: string | number = 1;
  @Output() ratingUpdated = new EventEmitter<number>();

  ratingArr: number[] = [];
  hasBeenClicked: boolean = false;

  // Tooltips for satisfaction scale (default)
  tooltips: string[] = [
    'Highly Dissatisfied',
    'Dissatisfied',
    'Neutral',
    'Satisfied',
    'Highly Satisfied'
  ];

  // Tooltips for agreement scale
  tooltips1: string[] = [
    'Strongly Disagree',
    'Disagree',
    'Somewhat Agree',
    'Agree',
    'Strongly Agree'
  ];

  constructor() {}

  ngOnInit(): void {
    // Create array [0, 1, 2, 3, 4] for 5 stars
    this.ratingArr = Array(this.starCount).fill(0).map((_, i) => i);
    
    if (this.rating > 0) {
      this.hasBeenClicked = true;
    }
  }

  /**
   * Handle star click
   * Emits the new rating value (1-5)
   */
  onClick(rating: number): boolean {
    if (this.disabled) {
      return false;
    }
    
    this.rating = rating;
    this.hasBeenClicked = true;
    this.ratingUpdated.emit(rating);
    return false;
  }

  /**
   * Determine which icon to show (filled or outlined star)
   */
  showIcon(index: number): string {
    return this.rating >= index + 1 ? 'star' : 'star_border';
  }

  /**
   * Get tooltip text based on scale type
   */
  gettooltip(index: number): string {
    const scaleValue = typeof this.scale === 'string' ? parseInt(this.scale, 10) : this.scale;
    if (scaleValue === 3) {
      return this.tooltips1[index];
    }
    return this.tooltips[index];
  }

  /**
   * Get CSS class for star color based on rating
   * - No rating: blue-star (skyblue)
   * - 1 star: dark red
   * - 2 stars: red
   * - 3 stars: orange
   * - 4 stars: yellow
   * - 5 stars: green
   */
  getStarClass(index: number): string {
    if (this.rating < index + 1) {
      return 'blue-star';
    }
    return `rating-${this.rating}`;
  }
}

/**
 * Star Rating Color Enum
 * Material Design color themes for the star buttons
 */
export enum StarRatingColor {
  primary = 'primary',
  accent = 'accent',
  warn = 'warn'
}
