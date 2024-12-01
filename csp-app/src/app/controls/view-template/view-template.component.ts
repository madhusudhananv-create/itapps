import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, Input, NgZone, OnChanges, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-view-template',
  templateUrl: './view-template.component.html',
  styleUrls: ['./view-template.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewTemplateComponent implements OnInit, OnChanges, AfterViewInit {

  @Input('templateName') templateName: string;
  @Input('templateHeading') templateHeading: string;
  @ViewChild('confirmationDialog') confirmationDialogTemplate: TemplateRef<any>;
  templateUrl: SafeResourceUrl;
  @Output() private onChange = new EventEmitter();

  constructor(private sanitizer: DomSanitizer, public dialog: MatDialog, private cdr: ChangeDetectorRef,
    private ngZone: NgZone, @Inject(MAT_DIALOG_DATA) private data: any) { }

  ngOnInit() {
    this.updateTemplateUrl(this.templateName);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.templateName && !changes.templateName.isFirstChange()) {
      this.updateTemplateUrl(this.templateName);
      this.cdr.detectChanges();
    }
  }

  ngAfterViewInit() {
    this.ngZone.run(() => {
      setTimeout(() => {
        this.openDialog();
      });
    });
  }

  updateTemplateUrl(templateName: string) {
    this.templateUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`/assets/MailTemplates/${templateName}.htm`);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(this.confirmationDialogTemplate, {
      width: '90%',
      height: '90%',
      data: this.templateName
    });

    dialogRef.afterClosed().subscribe(() => {
      this.onChange.emit(false);
    });
  }

  close_PopUp(): void {
    this.dialog.closeAll();
  }

}
