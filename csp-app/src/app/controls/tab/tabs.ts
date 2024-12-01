import { Component, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { Tab } from './tab';

@Component({
  selector: 'tabs',
  styleUrls: ['./tabs.scss'],
  template:`
    <ul class="nav nav-tabs">
      <li *ngFor="let tab of tabs" (click)="selectTab(tab)" [class.active]="tab.active" [style.width.px]="tab.width" [style.background-color]="tab.bg">
        <a *ngIf="tab.rag == 'false'">
        <span>{{tab.firstletter}}</span>
        <span>{{tab.title}}</span>
        </a>
        <a *ngIf="tab.rag != 'false'" [ngClass]="{'gree-tag' : tab.rag == 'green','red_tag' : tab.rag == 'red','orange_tag' : tab.rag == 'orange'}">
        <span>{{tab.firstletter}}</span>
        <span>{{tab.title}}</span>
        <i *ngIf="tab.rag != 'false'" class="" [style.color]="tab.rag"></i></a>
      </li>
    </ul>
    <ng-content></ng-content>
  `
})
export class Tabs implements AfterContentInit {

  @ContentChildren(Tab) tabs: QueryList<Tab>;

  // contentChildren are set
  ngAfterContentInit() {
    // get all active tabs
    let activeTabs = this.tabs.filter((tab)=>tab.active);

    // if there is no active tab set, activate the first
    if(activeTabs.length === 0) {
      this.selectTab(this.tabs.first);
    }
  }

  selectTab(tab: Tab){
    // deactivate all tabs
    this.tabs.toArray().forEach(tab => tab.active = false);

    // activate the tab the user has clicked on.
    tab.active = true;
  }

}
