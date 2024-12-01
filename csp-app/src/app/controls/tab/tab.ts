import { Component, OnInit,  Input } from '@angular/core';

@Component({
  selector: 'tab',
  styles: [`
    .pane{
      padding: 5px; /*1em;*/
      background-color:rgb(243, 242, 242);
      //background:green;
      height: 100%;
      //width: 50%;
      //position: absolute;
      right: 0;
      top: 0;
      min-height: 400px;
    }
  `],
  template: `
    <div [hidden]="!active" class="pane">
      <ng-content></ng-content>
    </div>
  `
})
export class Tab implements OnInit {
  @Input('tabTitle') title: string;
  @Input('tabFirstLetter') firstletter: string;
  @Input('tabWidth') width: number;
  @Input('tabRAG') rag: any;
  @Input('tabBG') bg: any;
  @Input('tabColor') color: any;
  
  
  @Input() active = false;

  ngOnInit() {
    // this.title = this.tabHeader.title;
    this.rag = this.rag;
  }
}