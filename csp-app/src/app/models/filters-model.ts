import { FilterPreferenceModel } from "./filter-preference-model";
import { ParameterModel } from "./parameter-model";
import { AppsService } from "../Services/apps.service";
import { myUtility } from "../Shared/myUtility";


export class FiltersModel {
  originalData: any[];
  filteredData: any[];
  filterPref: FilterPreferenceModel[] = []
  filterCriterias: FilterPreferenceModel[] = [];
  selectedFilterPref: FilterPreferenceModel = new FilterPreferenceModel('', '', true, 'string', []);
  public constructor(private _util: myUtility, private _appservice: AppsService, data, tableName) {
    this.originalData = data;
    this.filteredData = data;
    this.LoadFilterPrefernce(tableName);
  }
  LoadFilterPrefernce(tableName) {
    this.service_GetFilterPreferences(tableName);
  }
  service_GetFilterPreferences(tableName: string) {
    let prob: ParameterModel[] = [];
    prob.push(this.NewParam(1, 'Rare'));
    prob.push(this.NewParam(2, 'Unlikely'));
    prob.push(this.NewParam(3, 'Possible'));
    prob.push(this.NewParam(4, 'Probably'));
    prob.push(this.NewParam(5, 'Almost Certain'));

    let impact: ParameterModel[] = [];
    impact.push(this.NewParam(1, 'Insignificant'));
    impact.push(this.NewParam(2, 'Minor'));
    impact.push(this.NewParam(3, 'Moderate'));
    impact.push(this.NewParam(4, 'Major'));
    impact.push(this.NewParam(5, 'Extreme'));

    this._appservice.GetFilterPreferences(tableName).subscribe(
      data => {
        this.filterPref = data;
        for (let field of this.filterPref) {
          if (field.fielD_NAME == "impacT_SCALE")
            field.values = impact;
          else if (field.fielD_NAME == "probabilitY_SCALE")
            field.values = prob;
        }
      },
      error => { this._util.serviceError(error); }
    )
  }
  NewParam(id: number, name: string) {
    let prob = new ParameterModel();
    prob.id = id;
    prob.name = name;
    return prob;
  }
  // FillColumns(data) {
  //   if (data != undefined) {
  //     if (data.length > 0) {
  //       for (var p in data[0]) {
  //         this.columns.push(p);
  //       }
  //     }
  //   }
  // }

  public ApplyFilter() {
    if (this.selectedFilterPref.datA_TYPE === 'number') {
      let vals = this.selectedFilterPref.values.filter(t => t.id === Number(this.selectedFilterPref.searchString));
      if (vals.length > 0) {
        this.selectedFilterPref.searchStringValue = vals[0].name;
      }
      //this.selectedFilterPref.searchStringValue = this.selectedFilterPref.values.filter(t => t.id.toString() === this.selectedFilterPref.searchString)[0].name;
    }
    else
      this.selectedFilterPref.searchStringValue = this.selectedFilterPref.searchString;

    this.filterCriterias.push(this.selectedFilterPref);
    try {
      this.filteredData = this.filteredData.filter(t => t[this.selectedFilterPref.fielD_NAME].toLowerCase().search(this.selectedFilterPref.searchString.toLowerCase()) > -1);
    }
    catch (e) {
      if (e.stack.search("TypeError") > -1) {
        this.filteredData = this.filteredData.filter(t => t[this.selectedFilterPref.fielD_NAME] == this.selectedFilterPref.searchString);
      }
    }
    this.selectedFilterPref = new FilterPreferenceModel('', '', true, 'string', []);
  }
  public ClearFilters() {
    this.selectedFilterPref = new FilterPreferenceModel('', '', true, 'string', []);
    this.filterCriterias = [];
    this.filteredData = this.originalData;
  }
  public RemoveFilter(filterCriteria: FilterPreferenceModel) {
    this.filterCriterias.splice(this.filterCriterias.indexOf(filterCriteria), 1);
    this.filteredData = this.originalData;
    for (let criteria of this.filterCriterias) {
      try {
        this.filteredData = this.filteredData.filter(t => t[this.selectedFilterPref.fielD_NAME].toLowerCase().search(this.selectedFilterPref.searchString.toLowerCase()) > -1);
      }
      catch (e) {
        if (e.stack.search("TypeError") > -1) {
          this.filteredData = this.filteredData.filter(t => t[this.selectedFilterPref.fielD_NAME] == this.selectedFilterPref.searchString);
        }
      }
    }
  }
}

// export class FilterCriteria {
//   column: string;
//   displayName:string;
//   criteria: string;
// }