import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild, ChangeDetectorRef
} from "@angular/core";
import { AppsService } from "../../Services/apps.service";
import { myUtility } from "../../Shared/myUtility";
import { MatOption, MatSelect } from "@angular/material";
import { FormBuilder, FormControl } from '@angular/forms';
import { forEach } from "@angular/router/src/utils/collection";
@Component({
  selector: "app-searchable-multiselect-dropdown",
  templateUrl: "./searchable-multiselect-dropdown.component.html",
  styleUrls: ["./searchable-multiselect-dropdown.component.scss"],
})
export class SearchableMultiselectDropdownComponent implements OnInit {
  @Input("Id") Id: string[];
  @Input("data") data: any[];
  @Input("idField") idField: string;
  @Input("nameField") nameField: string;
  @Input("displayName") displayName: string = "";
  @Input("isLoaded") isLoaded: boolean = false;
  @Input("reset") reset: boolean = false;
  dataOld: any[];
  dataIp: any[];
  dataOp: string[] = [];
  searchVal: string = '';
  searchValue: string = "";
  @Input("disabled") disabled: boolean = false;
  Name = [];
  public ids: string[] = ["-1"];
  @ViewChild('multiSelect') multiSelect: MatSelect;
  @ViewChild('allSelected') allSelected: MatOption;
  @Output() onChange: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Output() selectionChange: EventEmitter<any> = new EventEmitter<any>();
  //isLoaded: boolean = false;

  constructor(private _appservice: AppsService, public _util: myUtility) {
    this.dataIp = this.data;
    if (this.data != null && this.data != undefined && this.data.length > 0)
      this.toggleAllSelection();
  }

  tosslePerOne() {
    this.setIDS(this.ids);
    if (this.allSelected != undefined && this.allSelected != null) {
      if (this.allSelected.selected) {
        this.allSelected.deselect();
        //return false;
      }
    }
    let allSelect: Boolean = false;
    this.multiSelect.options.forEach(function (i) {
      if (!i.selected && i.value != -1)
        allSelect = false;
    });
    if (allSelect)
      this.allSelected.select();
    this.emitChanges();
  }
  setIDS(idList: string[]) {
    this.dataOp = [];
    idList.forEach(element => {
      this.dataOp.push(element);
    });
  }
  ngOnInit() {
    this.selectAll();
  }

  emitChanges() {
    this.dataOp = [];
    if (this.multiSelect != null && this.multiSelect != undefined) {
      this.multiSelect.options.forEach((item: MatOption) => {
        if (item.selected)
          this.dataOp.push(item.value);
      });
      let str = this.dataOp;
      this.onChange.emit(str);
    }
  }
  ngOnChanges() {
    this.dataIp = this.data;
    if (this.reset) {
      this.searchValue = "";
    }
  }

  onKey(value) {
    this.searchValue = value;
    this.data = this.SearchKey(value);
    // this.searchValue = value;

  }
  SearchKey(value: string) {
    let filter = value.toLowerCase();
    let list = this.dataIp;
    if (value != "" || value != null || value != undefined) {
      return list.filter(option =>
        option[this.nameField].toLowerCase().includes(filter.toLocaleLowerCase())
      );
    }
    else {
      return list;
    }
  }

  toggleAllSelection() {
    if (this.allSelected.selected) {
      this.multiSelect.options.forEach((item: MatOption) => item.select());
    }
    else {
      this.multiSelect.options.forEach((item: MatOption) => item.deselect());
    }
    this.setIDS(this.ids);
    this.emitChanges();
  }

  selectAll() {
    if ((this.data != null && this.data != undefined && this.data.length > 0) && (!this.isLoaded || this.data != this.dataOld)) {
      if (!this.isLoaded && this.data != this.dataOld)
        this.dataIp = this.data;
      let n = this.data.length;
      this.isLoaded = true;
      this.dataOld = this.data;

      setTimeout(() => {
        if (this.data)
          this.allSelected.select();
        this.toggleAllSelection();
      }, n * 5); this.emitChanges();
    }
  }

  onDropdownOpenedChanged(opened: boolean) {
    this.searchVal = this.searchValue;
    this.SearchKey(this.searchVal);
  }

}
