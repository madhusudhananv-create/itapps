
import { Component, OnInit,Input,SimpleChanges } from '@angular/core';
//import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
@Component({
  selector: 'app-coo-dashboard',
  templateUrl: './coo-dashboard.component.html',
  styleUrls: ['./coo-dashboard.component.scss']
})
export class COODashboardComponent implements OnInit {
  isOpened = true;
  // constructor(private bottomSheetRef: MatBottomSheetRef<COODashboardComponent>) {}

  // openLink(event: MouseEvent): void {
  //   this.bottomSheetRef.dismiss();
  //   event.preventDefault();
  // }
  ngOnInit() {
  }
  
  toggle() {
    this.isOpened = !this.isOpened;
  }

  
}





