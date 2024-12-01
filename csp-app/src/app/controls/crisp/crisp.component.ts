import { Component, OnInit } from '@angular/core';
import { myUtility } from '../../Shared/myUtility';

@Component({
  selector: 'app-crisp',
  templateUrl: './crisp.component.html',
  styleUrls: ['./crisp.component.scss']
})
export class CrispComponent implements OnInit {

  constructor(public _util: myUtility) { }

  ngOnInit() {
  }

}
