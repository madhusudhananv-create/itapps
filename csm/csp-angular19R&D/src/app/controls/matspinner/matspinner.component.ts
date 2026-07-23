import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-matspinner',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './matspinner.component.html',
  styleUrls: ['./matspinner.component.scss']
})
export class MatspinnerComponent implements OnInit {
  @Input() hidden: boolean = false;
  
  constructor() { }

  ngOnInit(): void {
    // Initialization logic if needed
  }
}
