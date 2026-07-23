import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

/**
 * Dropdown Filter Component
 * Provides a searchable dropdown with filter functionality
 * Migrated from LEGACY-SOURCE/src/app/pages/dropdown-filter/dropdown-filter.component.ts
 * 
 * Features:
 * - Searchable dropdown
 * - Filter items by search value
 * - Emit selection changes
 * - Support for custom title property
 */
@Component({
  selector: 'app-dropdown-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './dropdown-filter.component.html',
  styleUrls: ['./dropdown-filter.component.scss']
})
export class DropdownFilterComponent implements OnInit {
  @Input() title!: string;
  @Input() itemList: any[] = [];
  @Input() selectedValue: any;
  @Input() placeholder!: string;
  @Output() selectionChange: EventEmitter<any> = new EventEmitter<any>();
  
  filteredItemList: any[] = [];
  searchValue: string = "";

  constructor() { }

  ngOnInit() {
    this.filteredItemList = this.itemList;
  }

  ngOnChanges() {
    this.filteredItemList = this.itemList;
  }

  openedChangeSPAL(opened: boolean) {
    this.searchValue = "";
    this.applyFilterForList(this.searchValue);
  }

  applyFilterForList(filterValue: string) {
    this.filteredItemList = this.itemList.filter(x => 
      x.title.toLowerCase().includes(filterValue.toLowerCase())
    );
  }

  onChangeSelection() {
    this.selectionChange.emit(this.selectedValue);
  }
}
