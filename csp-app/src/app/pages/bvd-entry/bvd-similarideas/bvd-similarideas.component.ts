import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { myUtility } from '../../../Shared/myUtility';
import { BvdEntryService } from '../services/bvd-entry.service';
import { AppsService } from '../../../Services/apps.service';

@Component({
  selector: 'app-bvd-similarideas',
  templateUrl: './bvd-similarideas.component.html',
  styleUrls: ['./bvd-similarideas.component.scss']
})
export class BvdSimilarideasComponent implements OnInit {

  @Input('ideas') Similarideas = [];
  constructor(private _bvdService: BvdEntryService, private _util: myUtility, private _appservice: AppsService) { }

  ngOnInit() {

  }

  ngOnChanges() {
    this.dataSource = new MatTableDataSource(this.Similarideas);
  }

  displayedColumns: string[] = ['projecT_NAME','customeR_NAME','ideaDescription', 'identifiedDate', 'status', 'identifiedBy'];
  dataSource = new MatTableDataSource(this.Similarideas);
}

export interface Ideas {
  ideaDescription: string;
  identifiedDate: string;
  status: string;
  area: string;
  projecT_NAME:string;
  customeR_NAME:string;
}

