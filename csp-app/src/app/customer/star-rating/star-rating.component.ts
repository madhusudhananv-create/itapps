import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material';


@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss']
})
export class StarRatingComponent implements OnInit {
  @Input('disabled') private disabled: boolean = false;
  @Input('rating') private rating: number = 3;
  @Input('starCount') public starCount: number = 5;
  @Input('color') private color: string = 'accent';
  @Input('Scale') private scale: number = 1;
  @Output() private ratingUpdated = new EventEmitter();

  private snackBarDuration: number = 2000;
  public ratingArr = [];
  //tooltips: string[] = ['Poor', 'Fair (Average)', 'Good', 'Very Good', 'Excellent'];
  //(1),  (2),  (3), Highly Satisfied (4), Delighted (5)
  tooltips: string[] = ['Dissatisfied', 'Somewhat Satisfied', 'Satisfied', ' Highly Satisfied', 'Delighted'];
  tooltips1: string[] = ['Strognly Disagree', 'Disagree', 'Somewhat Agree', 'Agree', 'Strongly Agree'];
  constructor(private snackBar: MatSnackBar) {
  }


  ngOnInit() {
    for (let index = 0; index < this.starCount; index++) {
      this.ratingArr.push(index);
    }
  }
  onClick(rating: number) {
    // this.snackBar.open('You rated ' + rating + ' / ' + this.starCount, '', {
    //   duration: this.snackBarDuration
    // });
    this.ratingUpdated.emit(rating);
    return false;
  }

  showIcon(index: number) {
    if (this.rating >= index + 1) {
      return 'star';
    } else {
      return 'star_border';
    }
  }

  gettooltip(i) {
    if (this.scale == 2 || this.scale == null)
      return this.tooltips[i];
    else if (this.scale == 3)
      return this.tooltips1[i];
    else return this.tooltips[i];;
  }

}
export enum StarRatingColor {
  primary = "primary",
  accent = "accent",
  warn = "warn"
}