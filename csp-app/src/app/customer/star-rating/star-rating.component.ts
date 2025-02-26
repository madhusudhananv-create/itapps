import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'; 
import { MatSnackBar } from '@angular/material';  

@Component({   
  selector: 'app-star-rating',   
  templateUrl: './star-rating.component.html',   
  styleUrls: ['./star-rating.component.scss'] 
}) 
export class StarRatingComponent implements OnInit {   
  @Input() disabled: boolean = false;   
  @Input() rating: number = 3;   
  @Input() starCount: number = 5;   
  @Input() color: string = 'accent';   
  @Input('Scale') scale: number = 1;   
  @Output() ratingUpdated = new EventEmitter<number>();    

  snackBarDuration: number = 2000;   
  ratingArr: number[] = [];   
  hasBeenClicked: boolean = false;      
  
  tooltips: string[] = ['Dissatisfied', 'Somewhat Satisfied', 'Satisfied', 'Highly Satisfied', 'Delighted'];   
  tooltips1: string[] = ['Strongly Disagree', 'Disagree', 'Somewhat Agree', 'Agree', 'Strongly Agree'];      

  constructor(private snackBar: MatSnackBar) {}    

  ngOnInit() {     
    this.ratingArr = Array(this.starCount).fill(0).map((_, i) => i);
    if (this.rating > 0) {
      this.hasBeenClicked = true;
    }
  }      

  onClick(rating: number): boolean {     
    this.rating = rating;     
    this.hasBeenClicked = true;     
    this.ratingUpdated.emit(rating);     
    return false;   
  }    

  showIcon(index: number): string {     
    return this.rating >= index + 1 ? 'star' : 'star_border';  
  }    

  gettooltip(index: number): string {     
    if (this.scale === 3) {
      return this.tooltips1[index];
    }
    return this.tooltips[index];   
  }      

  getStarClass(index: number): string {     
   
    if (this.rating < index + 1) {
      return 'blue-star';
    }

    return `rating-${this.rating}`;
  } 
}  

export enum StarRatingColor {   
  primary = "primary",   
  accent = "accent",   
  warn = "warn" 
}