import { Component, OnInit,EventEmitter, Input, Output } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-dropdown-filter',
  templateUrl: './dropdown-filter.component.html',
  styleUrls: ['./dropdown-filter.component.scss']
})
export class DropdownFilterComponent implements OnInit {
  @Input() title: string;
  @Input() itemList: any[];
  @Input() selectedValue: any;
  @Input() placeholder: string;
  @Output() selectionChange: EventEmitter<any> = new EventEmitter<any>();
  filteredItemList: any[] =[];
  searchValue : string = "";
  //OriginalList : any[] = [];
  constructor() { }

  ngOnInit() {
    this.filteredItemList = this.itemList;

  }
  ngOnChanges(){
    this.filteredItemList = this.itemList;

  }
  openedChangeSPAL(opened: boolean) {
    this.searchValue = "";
    this.applyFilterForList(this.searchValue);
  }

  applyFilterForList(filterValue: string) {
   this.filteredItemList = this.itemList.filter( x => x.title.toLowerCase().includes(filterValue.toLowerCase()));
  }


  onChangeSelection( ) {

    this.selectionChange.emit(this.selectedValue);
  }
}
