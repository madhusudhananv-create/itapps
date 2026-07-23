import { Component, OnInit, Inject, Input, Optional, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';

import { UtilityService } from '../../../../core/services/utility.service';

// Pure pipe for formatting weightage - prevents recalculation on every change detection
@Pipe({
  name: 'formatWeightage',
  pure: true,
  standalone: true
})
export class FormatWeightagePipe implements PipeTransform {
  transform(weightage: string, score: any): string {
    return `${weightage} (${score})`;
  }
}

@Component({
  selector: 'app-preview-popup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    DatePipe,
    FormatWeightagePipe
  ],
  templateUrl: './preview-popup.component.html',
  styleUrls: ['./preview-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewPopupComponent implements OnInit {
  @Input() previewData: any[] = [];
  @Input() checklistname!: string;
  @Input() version!: number;
  @Input() effectivefrom!: Date;
  @Input() isMergeView: boolean = false;
  @Input() showSelectColumn: boolean = false;
  @Input() sa: any;
  @Input() pa: any;
  @Input() p: any;
  @Input() question: any;
  @Output() checkboxChange = new EventEmitter<{ type: string, data: any, parentData: any, grandparentData: any }>();
  
  isweightageApplicable!: boolean;
  ismaturityApplicable!: boolean;
  isLoading: boolean = true;
  renderedData: any[] = [];

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    @Optional() private dialogRef: MatDialogRef<PreviewPopupComponent>,
    private _util: UtilityService,
    private cdr: ChangeDetectorRef
  ) {
    const constructorStartTime = performance.now();
    
    if (data != null) {
      this.previewData = data.previewData;
      this.checklistname = data.checklistName;
      this.version = data.version;
      this.effectivefrom = data.effectivE_FROM;
      this.isweightageApplicable = data.iS_WEIGHTAGE_APPLICABLE;
      this.ismaturityApplicable = data.iS_MATURITY_APPLICABLE;
      
      // Pre-process data for better performance
      this.preprocessData();
    }
  }

  ngOnInit() {
    const initStartTime = performance.now();
    
    // Start chunked rendering after dialog is opened
    this.startChunkedRendering();
  }

  // Render data in chunks to prevent UI blocking
  private startChunkedRendering(): void {
    const renderStartTime = performance.now();
    
    const chunkSize = 5; // Render 5 service towers at a time
    let currentIndex = 0;
    
    const renderChunk = () => {
      const chunkStartTime = performance.now();
      const endIndex = Math.min(currentIndex + chunkSize, this.previewData.length);
      
      // Add the next chunk of data
      for (let i = currentIndex; i < endIndex; i++) {
        this.renderedData.push(this.previewData[i]);
      }
      
      currentIndex = endIndex;
      this.cdr.markForCheck();
      
      // If more data to render, schedule next chunk
      if (currentIndex < this.previewData.length) {
        setTimeout(() => renderChunk(), 10);
      } else {
        // All data rendered
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    };
    
    // Start rendering with a small delay to allow dialog to open smoothly
    setTimeout(() => renderChunk(), 50);
  }

  // Pre-process data to reduce template computation
  private preprocessData(): void {
    // Add any data preprocessing here if needed
    // For example: pre-calculate values, sort, filter, etc.
  }

  // TrackBy functions for performance optimization
  trackByServiceTower(index: number, item: any): any {
    return item.servicE_AREA_ID || index;
  }

  trackByProcessArea(index: number, item: any): any {
    return item.procesS_AREA_ID || index;
  }

  trackByProcess(index: number, item: any): any {
    return item.procesS_ID || index;
  }

  trackByQuestion(index: number, item: any): any {
    return item.id || index;
  }

  onCheckboxChange(type: string, data: any, parentData: any = null, grandparentData: any = null) {
    this.checkboxChange.emit({ type, data, parentData, grandparentData });
    this.cdr.markForCheck();
  }

  closepopup() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
