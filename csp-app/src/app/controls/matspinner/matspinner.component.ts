import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-matspinner',
  templateUrl: './matspinner.component.html',
  styleUrls: ['./matspinner.component.scss']
})
export class MatspinnerComponent implements OnInit {
  @Input('Hidden') hidden: Boolean;
  constructor() { }

  ngOnInit() {
  }

}
