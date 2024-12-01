import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppsService } from '../../Services/apps.service';

@Component({
  selector: 'app-appreciation-widget-source',
  templateUrl: './appreciation-widget-source.component.html',
  styleUrls: ['./appreciation-widget-source.component.scss']
})
export class AppreciationWidgetSourceComponent implements OnInit {
@Input('custId') custId: string;
appreciationArray: any;
totalAppreciation: number;
isAppreciationsEmpty: boolean;

constructor( private _appservice: AppsService ,private route: ActivatedRoute, private _router: Router) { }

  ngOnInit() {
    this.filterAppreciation();
  }
  async filterAppreciation() {
    this.appreciationArray = await this._appservice.getAppreciationDetails(this.custId, true).toPromise();
    this.totalAppreciation = this.appreciationArray.length;

    if (this.appreciationArray.length == 0) {
      this.isAppreciationsEmpty = true;
      return;
    }

    let dataA = 0;

    if (this.totalAppreciation == 0)
      this.isAppreciationsEmpty = true;
    else
      this.isAppreciationsEmpty = false;

    this.dataA.push(["Appreciation Received", this.totalAppreciation]);

  }

  typeA = 'PieChart';
  widthA = 180;
  heightA = 90;
  columnNamesA =
    ['status', 'count'];
  dataA = [
    ['Appreciations', 100],
    [null, 0],
  ];
  optionsA: google.visualization.PieChartOptions = {
    titleTextStyle:
    {
      fontSize: 15,
      color: '#ff0109',
      fontName: 'Helvetica Neue'
    },
    legend:'none',
    pieHole: 0.5,
    pieStartAngle: 270,
    sliceVisibilityThreshold: 0,
    height: 82,
    width: 165,
    tooltip: { trigger: 'selection' },
    pieSliceText: 'value',
    pieSliceTextStyle: { fontSize: 9 },
    colors: ['#3ab376'],
    chartArea: {
      'width': '100%', 'height': '100%', bottom: 0, top: 0
    }
  };

}
