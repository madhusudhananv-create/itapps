import { Component, OnInit, OnChanges, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule, MatOption } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-searchable-multiselect-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './searchable-multiselect-dropdown.component.html',
  styleUrl: './searchable-multiselect-dropdown.component.scss'
})
export class SearchableMultiselectDropdownComponent implements OnInit, OnChanges {
  @Input() Id: string[] = [];
  @Input() data: any[] = [];
  @Input() idField: string = '';
  @Input() nameField: string = '';
  @Input() displayName: string = '';
  @Input() isLoaded: boolean = false;
  @Input() reset: boolean = false;
  @Input() disabled: boolean = false;

  @ViewChild('multiSelect') multiSelect!: MatSelect;
  @ViewChild('allSelected') allSelected!: MatOption;

  @Output() onChange: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Output() selectionChange: EventEmitter<any> = new EventEmitter<any>();

  dataOld: any[] = [];
  dataIp: any[] = [];
  dataOp: string[] = [];
  searchVal: string = '';
  searchValue: string = '';
  Name: string[] = [];
  public ids: string[] = ['-1'];

  constructor() {
    this.dataIp = this.data;
    if (this.data != null && this.data != undefined && this.data.length > 0) {
      this.toggleAllSelection();
    }
  }

  ngOnInit(): void {
    this.selectAll();
  }

  ngOnChanges(): void {
    this.dataIp = this.data;
    if (this.reset) {
      this.searchValue = '';
    }
  }

  tosslePerOne(): void {
    this.setIDS(this.ids);
    if (this.allSelected != undefined && this.allSelected != null) {
      if (this.allSelected.selected) {
        this.allSelected.deselect();
      }
    }
    
    let allSelect: boolean = true;
    if (this.multiSelect && this.multiSelect.options) {
      this.multiSelect.options.forEach((item: MatOption) => {
        if (!item.selected && item.value !== -1) {
          allSelect = false;
        }
      });
      
      if (allSelect && this.allSelected) {
        this.allSelected.select();
      }
    }
    this.emitChanges();
  }

  setIDS(idList: string[]): void {
    this.dataOp = [];
    idList.forEach(element => {
      this.dataOp.push(element);
    });
  }

  emitChanges(): void {
    this.dataOp = [];
    if (this.multiSelect != null && this.multiSelect != undefined) {
      this.multiSelect.options.forEach((item: MatOption) => {
        if (item.selected) {
          this.dataOp.push(item.value);
        }
      });
      let str = this.dataOp;
      this.onChange.emit(str);
    }
  }

  onKey(value: string): void {
    this.searchValue = value;
    this.data = this.SearchKey(value);
  }

  SearchKey(value: string): any[] {
    let filter = value.toLowerCase();
    let list = this.dataIp;
    if (value && value !== '' && value != null && value != undefined) {
      return list.filter(option =>
        option[this.nameField].toLowerCase().includes(filter.toLowerCase())
      );
    } else {
      return list;
    }
  }

  toggleAllSelection(): void {
    if (this.allSelected && this.allSelected.selected) {
      this.multiSelect.options.forEach((item: MatOption) => item.select());
    } else if (this.allSelected) {
      this.multiSelect.options.forEach((item: MatOption) => item.deselect());
    }
    this.setIDS(this.ids);
    this.emitChanges();
  }

  selectAll(): void {
    if ((this.data != null && this.data != undefined && this.data.length > 0) && 
        (!this.isLoaded || this.data !== this.dataOld)) {
      if (!this.isLoaded && this.data !== this.dataOld) {
        this.dataIp = this.data;
      }
      let n = this.data.length;
      this.isLoaded = true;
      this.dataOld = this.data;

      setTimeout(() => {
        if (this.data && this.allSelected) {
          this.allSelected.select();
          this.toggleAllSelection();
        }
      }, n * 5);
      this.emitChanges();
    }
  }

  onDropdownOpenedChanged(opened: boolean): void {
    this.searchVal = this.searchValue;
    this.SearchKey(this.searchVal);
  }
}
