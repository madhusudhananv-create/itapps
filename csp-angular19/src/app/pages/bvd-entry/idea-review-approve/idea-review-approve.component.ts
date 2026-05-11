import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BvdEntryService } from '../services/bvd-entry.service';
import { MyUtility } from '../../../shared/my-utility';
import { IdeaStatus } from '../../../models/bvd-entry/idea-model';
import { IdeaReview } from '../../../models/bvd-entry/idea-review-model';

@Component({
  selector: 'app-idea-review-approve',
  templateUrl: './idea-review-approve.component.html',
  styleUrls: ['./idea-review-approve.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class IdeaReviewApproveComponent implements OnInit {
  public _bvdService = inject(BvdEntryService);
  public _util = inject(MyUtility);

  stages: any[] = [];
  status: any[] = [];
  review = new IdeaReview();
  isLoading: boolean = false;
  disabled: boolean = false;
  @Output() setStep: EventEmitter<number> = new EventEmitter<number>();

  constructor() {
    if (this._bvdService.bvdreview && this._bvdService.bvdreview != null)
      this.review = this._bvdService.bvdreview;
  }

  setBack() {
    this.isLoading = true;
    setTimeout(() => { this.isLoading = false; this.setStep.emit(3); }, 350);
  }

  setNext() {
    this.isLoading = true;
    setTimeout(() => { this.isLoading = false; this.setStep.emit(5); }, 350);
  }

  ngOnInit() {
    //this.status = this._util.enumSelector(IdeaStatus)
    this.getIdeaStages();
    this.getIdeaStatus();
  }

  getIdeaStatus() {
    this._bvdService.getIdeaStatus().subscribe({
      next: (data) => {
        this.status = data;
        this.status = this.status.filter(x => x.stagE_ID == 4);
      },
      error: (err: any) => {
        console.error('Error loading idea status:', err);
        (this._util as any).serviceError(err);
      }
    });
  }

  getIdeaStages() {
    if (!this._bvdService.ideA_ID || this._bvdService.ideA_ID == 0) {
      console.warn('No ideA_ID available');
      return;
    }

    this.isLoading = true;
    this._bvdService.getIdeaStages(this._bvdService.ideA_ID).subscribe({
      next: (data) => {
        this._bvdService.bvdstages = data;
        
        if (this.review.ideA_STATUS_ID == 4 || this.review.ideA_STATUS_ID == 3) {
          this.disabled = true;
          this._bvdService.isIdeaApproved = true;
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading idea stages:', err);
        this.isLoading = false;
        (this._util as any).serviceError(err);
      }
    });
  }

  getStatusTitle(id: number): string {
    let statusRec = this.status.find(x => x.id == id);
    if (statusRec != undefined)
      return statusRec.title

    return "";
  }

  submitReviewerResponse() {
    if (!this.review.ideA_STATUS_ID || this.review.ideA_STATUS_ID == null) {
      (this._util as any).showWarning('Please choose a response before submitting');
      return;
    }
    
    this.review.ideA_ID = this._bvdService.ideA_ID;
    this.review.ideA_STATUS_TITLE = this.getStatusTitle(this.review.ideA_STATUS_ID);
    
    this.isLoading = true;
    this._bvdService.saveReviewerResponse(this.review).subscribe({
      next: (data) => {
        (this._util as any).showSuccess('Response submitted successfully');

        if (this.review.ideA_STATUS_ID == 5) {
          this._bvdService.isIdeaSubmitted = false;
        }
        this.getIdeaStages();  // isLoading reset inside getIdeaStages()
      },
      error: (err: any) => {
        console.error('Error submitting reviewer response:', err);
        this.isLoading = false;
        (this._util as any).serviceError(err);
      }
    });
  }
}
