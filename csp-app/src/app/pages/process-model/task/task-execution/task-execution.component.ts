import { Component, OnInit, ElementRef, Input } from '@angular/core';
import { TaskService } from '../task.service';

@Component({
  selector: 'app-task-execution',
  templateUrl: './task-execution.component.html',
  styleUrls: ['./task-execution.component.scss']
})
export class TaskExecutionComponent implements OnInit {

 // @Input() task;

  constructor(public _taskService: TaskService, private elRef: ElementRef) { }

  ngOnInit() {
//console.log("parent element" + this.elRef.nativeElement.parentElement);
  }

}
