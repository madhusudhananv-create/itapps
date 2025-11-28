import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter, TemplateRef } from '@angular/core';
import { myUtility } from '../../Shared/myUtility';
import { AppsService } from '../../Services/apps.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AccessRequestModel } from '../../models/access-control-model';
import { MatDialog } from '@angular/material';
import { AccessControl } from '../../Shared/accessControl';

@Component({
  selector: 'app-accesscontrol-management',
  templateUrl: './accesscontrol-management.component.html',
  styleUrls: ['./accesscontrol-management.component.scss']
})
export class AccesscontrolManagementComponent implements OnInit {
  constructor(private _access: AccessControl, public _util: myUtility, private _appservice: AppsService, private route: ActivatedRoute, private router: Router, public dialog: MatDialog) { }
  accessTypeText: string = '';
  rejectReason: string;
  confirmAction: string = '';
  showReasonInput: boolean = false;
  reasonText: string = '';
  requestId: number;
  accessRequestData: AccessRequestModel;
  @ViewChild('confirmationDialogAccess') confirmationDialogAccessTemplate: TemplateRef<any>
  @Input() resourceId: number;
  @Input() projectId: string;
  @Input() custId: string;
  @Input() feature: string;
  @Input() accessType: number;
  @Input() showAccessRequestButton: boolean = false;
  ngOnInit() {
    this.route.params.subscribe(params => {
      if(params['requestid']) {
      this.acceptOrRejectRequestAccess();
      }
    });

  }

  requestAccess() {
    this._appservice.sendRequestAccess(this.resourceId, this.feature, localStorage.getItem('empid'), this.accessType, this.custId, this.projectId).subscribe(data => {
      alert("Access request sent to Admin");
    }, (error) => { this._util.serviceError(error) });
  }

  acceptOrRejectRequestAccess() {
    this.route.params.subscribe(params => {
      this.accessRequestData = new AccessRequestModel();
      this.accessRequestData.id = params['requestid'];
      this.accessRequestData.accesS_LEVEL = params['accesstype'];
      this.accessRequestData.proJ_ID = params['projid'];
      this.accessRequestData.cusT_ID = params['custid'];
      this.accessRequestData.feature = params['feature'];
      this.accessRequestData.approveR_ID = localStorage.getItem('empid');
      this.accessRequestData.approvaL_DATE = new Date();
      if (params['approveval'] === "1") {
        this.confirmAction = 'approve';
        this.accessRequestData.status = "Approved";
        this.showReasonInput = false;
      } else {
        this.confirmAction = 'reject';
        this.accessRequestData.status = "Rejected";
        this.showReasonInput = true;
      }
      this.confirmDialogOpen();
    });
  }

  confirmDialogOpen() {
    const dialogRef = this.dialog.open(this.confirmationDialogAccessTemplate, {
      width: '500px',
      height: this.showReasonInput ? '250px' : '170px',
      data: { confirmAction: this.confirmAction, showReasonInput: this.showReasonInput }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === '1') {
        this.onConfirm(true);
      } else {
        this.onConfirm(false);
      }
    });
  }


  onConfirm(confirmed: boolean) {
    if (!confirmed) {
      this.reasonText = '';
      return;
    }

    if (this.confirmAction === 'reject' && (!this.reasonText || this.reasonText.trim() === '')) {
      alert('Please provide a reason for rejection');
      this.confirmDialogOpen();
      return;
    }
    this.accessRequestData.rejecT_REASON = this.confirmAction === 'reject' ? this.reasonText : '';
    this.processApproveReject();
  }

  processApproveReject() {
    this._appservice.saveApproveRejectRequestAccess(this.accessRequestData).subscribe(data => {
      alert('Access ' + this.accessRequestData.status + ' successfully.');
       this.router.navigateByUrl('/newdashboard/custm');    
      this.reasonText = '';
    },
      (error) => {
        this.reasonText = '';
        this._util.serviceError(error);
      }
    );
  }

}

