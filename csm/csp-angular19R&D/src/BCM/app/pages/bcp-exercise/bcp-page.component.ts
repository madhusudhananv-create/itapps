import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef, PLATFORM_ID, Inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';


// Dynamic imports for libraries (only in browser)
let mammoth: any;
let docx: any;
let Quill: any;

/**
 * Interface for BCP document metadata
 */
export interface BcpDocumentMetadata {
  fileName: string;
  fileSize: number;
  uploadedDate: Date;
  uploadedBy: string;
  version: number;
  fileContent?: ArrayBuffer | string;
  lastModified?: Date;
}

/**
 * Interface for audit log entries
 */
export interface AuditLogEntry {
  timestamp: Date;
  action: 'import' | 'edit' | 'save' | 'export' | 'download';
  user: string;
  description: string;
  version?: number;
}

/**
 * Interface for BC Exercise document metadata
 */
export interface BcExerciseDocumentMetadata {
  fileName: string;
  fileSize: number;
  uploadedDate: Date;
  uploadedBy: string;
  version: number;
  fileContent?: ArrayBuffer | string;
  lastModified?: Date;
}

/**
 * Interface for BC Exercise audit log entries
 */
export interface BcExerciseAuditLogEntry {
  timestamp: Date;
  action: 'import' | 'edit' | 'save' | 'export' | 'download';
  user: string;
  description: string;
  version?: number;
}

@Component({
  selector: 'bcp-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTabsModule
  ],
  templateUrl: './bcp-page.component.html',
  styles: [
    `
      .page-container {
        padding: 2rem;
        margin: 0 auto;
        min-height: 100vh;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      }

      .page-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .page-header h1 {
        color: #2c3e50;
        font-size: 2.5rem;
        margin: 0 0 0.5rem 0;
        font-weight: 600;
      }
      .mat-mdc-tab-labels{
        width:40%;
      }

      .page-header p {
        color: #7f8c8d;
        font-size: 1.1rem;
        margin: 0;
      }

      .bcp-card {
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
      }
      
      .bcp-card .mat-mdc-card-header {
        background-color: #f5f5f5;
        padding: 1.5rem 2rem;
        border-bottom: 1px solid #e0e0e0;
      }

      .bcp-card .mat-mdc-card-title {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: #2c3e50;
        font-size: 1.5rem;
        font-weight: 600;
      }

      .bcp-card .mat-mdc-card-subtitle {
        color: #6c757d;
        margin-top: 0.5rem;
        font-size: 1rem;
      }

      .action-section,
      .metadata-section,
      .document-section,
      .audit-section {
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: #fafafa;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
      }

      .section-header {
        margin-bottom: 1rem;
        align-items: center;
        display: flex;
        justify-content: space-between;
      }

      .section-header h3 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #2c3e50;
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0 0 0.5rem 0;
      }
      
      .section-header-tab {
        margin-bottom: 1rem;
        align-items: center;
      }

      .section-header-tab h3 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #2c3e50;
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0 0 0.5rem 0;
      }


      .section-description {
        color: #6c757d;
        font-size: 0.9rem;
        margin: 0.5rem 0 0 0;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .header-actions {
        display: flex;
        justify-content: end;
        gap: 0.75rem;
        align-items: center;
      }

      .upload-area {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin: 1rem 0;
        flex-wrap: wrap;
      }

      .file-name {
        color: #2c3e50;
        font-weight: 500;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .spinning {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .upload-actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 1rem;
      }

      .upload-progress {
        margin-top: 1rem;
      }

      .metadata-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
      }

      .metadata-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .metadata-label {
        font-size: 0.85rem;
        color: #6c757d;
        font-weight: 500;
      }

      .metadata-value {
        font-size: 1rem;
        color: #2c3e50;
        font-weight: 600;
        overflow-wrap: break-word;
      }

      .version-chip {
        background-color: #e3f2fd !important;
        color: #1976d2 !important;
        font-weight: 600;
      }

      .unsaved-chip {
        background-color: #fff3cd !important;
        color: #856404 !important;
        font-weight: 500;
      }

      .saved-chip {
        background-color: #d4edda !important;
        color: #155724 !important;
        font-weight: 500;
      }

      .editor-container {
        margin-top: 1rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        background: white;
        min-height: 500px;
      }

      .quill-editor-wrapper {
        min-height: 500px;
        max-height: 500px;    
        overflow-x: hidden;
        overflow-y: auto;
      }

      /* Preserve document styling in Quill editor */
      .quill-editor-wrapper ::ng-deep .ql-editor {
        font-family: 'Times New Roman', 'Calibri', 'Arial', sans-serif;
        font-size: 11pt;
        line-height: 1.5;
        color: #000000;
        padding: 1.5rem;
      }

      /* Preserve heading styles */
      .quill-editor-wrapper ::ng-deep .ql-editor h1 {
        font-size: 24pt;
        font-weight: bold;
        margin-top: 12pt;
        margin-bottom: 6pt;
        color: #000000;
        page-break-after: avoid;
      }

      .quill-editor-wrapper ::ng-deep .ql-editor h2 {
        font-size: 18pt;
        font-weight: bold;
        margin-top: 10pt;
        margin-bottom: 6pt;
        color: #000000;
        page-break-after: avoid;
      }

      .quill-editor-wrapper ::ng-deep .ql-editor h3 {
        font-size: 14pt;
        font-weight: bold;
        margin-top: 8pt;
        margin-bottom: 4pt;
        color: #000000;
        page-break-after: avoid;
      }

      .quill-editor-wrapper ::ng-deep .ql-editor h4 {
        font-size: 12pt;
        font-weight: bold;
        margin-top: 6pt;
        margin-bottom: 4pt;
        color: #000000;
      }

      .quill-editor-wrapper ::ng-deep .ql-editor h5 {
        font-size: 11pt;
        font-weight: bold;
        margin-top: 6pt;
        margin-bottom: 4pt;
        color: #000000;
      }

      .quill-editor-wrapper ::ng-deep .ql-editor h6 {
        font-size: 10pt;
        font-weight: bold;
        margin-top: 4pt;
        margin-bottom: 4pt;
        color: #000000;
      }

      /* Preserve paragraph styles */
      .quill-editor-wrapper ::ng-deep .ql-editor p {
        margin-top: 0pt;
        margin-bottom: 6pt;
        text-align: left;
        orphans: 2;
        widows: 2;
      }

      /* Preserve list styles */
      .quill-editor-wrapper ::ng-deep .ql-editor ul,
      .quill-editor-wrapper ::ng-deep .ql-editor ol {
        margin-top: 6pt;
        margin-bottom: 6pt;
        padding-left: 36pt;
      }

      .quill-editor-wrapper ::ng-deep .ql-editor li {
        margin-top: 0pt;
        margin-bottom: 0pt;
        padding-left: 0pt;
      }

      /* Preserve table styles */
      .quill-editor-wrapper ::ng-deep .ql-editor table {
        border-collapse: collapse;
        border-spacing: 0;
        width: 100%;
        margin-top: 6pt;
        margin-bottom: 6pt;
        border: 1px solid #000000;
      }

      .quill-editor-wrapper ::ng-deep .ql-editor table td,
      .quill-editor-wrapper ::ng-deep .ql-editor table th {
        border: 1px solid #000000;
        padding: 4pt;
        text-align: left;
        vertical-align: top;
      }

      .quill-editor-wrapper ::ng-deep .ql-editor table th {
        background-color: #f0f0f0;
        font-weight: bold;
      }

      /* Preserve blockquote styles */
      .quill-editor-wrapper ::ng-deep .ql-editor blockquote {
        margin-left: 36pt;
        margin-right: 36pt;
        margin-top: 6pt;
        margin-bottom: 6pt;
        padding-left: 12pt;
        border-left: 3px solid #cccccc;
        font-style: italic;
      }

      /* Preserve text formatting */
      .quill-editor-wrapper ::ng-deep .ql-editor strong,
      .quill-editor-wrapper ::ng-deep .ql-editor b {
        font-weight: bold;
      }

      .quill-editor-wrapper ::ng-deep .ql-editor em,
      .quill-editor-wrapper ::ng-deep .ql-editor i {
        font-style: italic;
      }

      .quill-editor-wrapper ::ng-deep .ql-editor u {
        text-decoration: underline;
      }

      .quill-editor-wrapper ::ng-deep .ql-editor s,
      .quill-editor-wrapper ::ng-deep .ql-editor strike {
        text-decoration: line-through;
      }

      /* Preserve inline styles from DOCX */
      .quill-editor-wrapper ::ng-deep .ql-editor [style*="font-size"] {
        /* Preserve font sizes */
      }

      .quill-editor-wrapper ::ng-deep .ql-editor [style*="color"] {
        /* Preserve text colors */
      }

      .quill-editor-wrapper ::ng-deep .ql-editor [style*="background-color"] {
        /* Preserve background colors */
      }

      .quill-editor-wrapper ::ng-deep .ql-editor [style*="text-align"] {
        /* Preserve text alignment */
      }

      .quill-editor-wrapper ::ng-deep .ql-editor [style*="font-weight"] {
        /* Preserve font weights */
      }

      .quill-editor-wrapper ::ng-deep .ql-editor [style*="font-style"] {
        /* Preserve font styles */
      }

      /* Preserve images */
      .quill-editor-wrapper ::ng-deep .ql-editor img {
        max-width: 100%;
        height: auto;
        margin: 6pt 0;
        display: block;
      }

      .editor-status {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: #f5f5f5;
        border-top: 1px solid #e0e0e0;
        font-size: 0.85rem;
        color: #6c757d;
      }

      .editor-status .success {
        color: #4caf50;
      }

      .editor-status .error {
        color: #f44336;
      }

      .editor-status .info {
        color: #2196f3;
      }

      .editor-fallback {
        padding: 2rem;
        text-align: center;
        color: #6c757d;
      }

      .audit-log {
        margin-top: 1rem;
        max-height: 300px;
        overflow-y: auto;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        background: white;
      }

      .audit-entry {
        display: grid;
        grid-template-columns: 150px 100px 150px 1fr;
        gap: 1rem;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid #f0f0f0;
        font-size: 0.85rem;
      }

      .audit-entry:last-child {
        border-bottom: none;
      }

      .audit-time {
        color: #6c757d;
        font-weight: 500;
      }

      .audit-action {
        color: #1976d2;
        font-weight: 600;
        text-transform: capitalize;
      }

      .audit-user {
        color: #2c3e50;
      }

      .audit-description {
        color: #6c757d;
      }

      .no-document,
      .no-content {
        text-align: center;
        padding: 3rem;
        color: #6c757d;
      }

      .no-document mat-icon,
      .no-content mat-icon {
        font-size: 4rem;
        width: 4rem;
        height: 4rem;
        margin-bottom: 1rem;
        opacity: 0.5;
      }

      .no-document h3 {
        color: #2c3e50;
        margin: 0.5rem 0;
      }

      .bcp-tabs {
        margin-top: 1rem;
      }

      .tab-content {
        padding: 1rem 0;
      }

      .tab-navigation {
        text-align: center;
        padding: 3rem 2rem;
      }

      .navigate-button {
        margin-bottom: 1rem;
        min-width: 250px;
      }

      .tab-description {
        color: #6c757d;
        font-size: 1rem;
        margin-top: 1rem;
      }

      @media (max-width: 768px) {
        .page-container {
          padding: 1rem;
        }

        .metadata-grid {
          grid-template-columns: 1fr;
        }

        .header-actions {
          flex-direction: column;
          width: 100%;
        }

        .header-actions button {
          width: 100%;
        }

        .audit-entry {
          grid-template-columns: 1fr;
          gap: 0.5rem;
        }
      }
    `,
  ],
})
export class BcpPageComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('editorContainer', { static: false }) editorContainer!: ElementRef;
  @ViewChild('bcExerciseEditorContainer', { static: false }) bcExerciseEditorContainer!: ElementRef;

  selectedFile: File | null = null;
  bcpMetadata: BcpDocumentMetadata | null = null;
  documentContent: string = '';
  isProcessing: boolean = false;
  hasUnsavedChanges: boolean = false;
  showAuditLog: boolean = false;
  auditLogs: AuditLogEntry[] = [];
  quillEditor: any = null;
  editorStatus: { type: string; icon: string; message: string } | null = null;

  // BC Exercise properties
  selectedBcExerciseFile: File | null = null;
  bcExerciseMetadata: BcExerciseDocumentMetadata | null = null;
  bcExerciseDocumentContent: string = '';
  isBcExerciseProcessing: boolean = false;
  hasBcExerciseUnsavedChanges: boolean = false;
  showBcExerciseAuditLog: boolean = false;
  bcExerciseAuditLogs: BcExerciseAuditLogEntry[] = [];
  bcExerciseQuillEditor: any = null;
  bcExerciseEditorStatus: { type: string; icon: string; message: string } | null = null;

  private destroy$ = new Subject<void>();
  private autosaveSubject = new Subject<void>();
  private bcExerciseAutosaveSubject = new Subject<void>();
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly AUTOSAVE_DEBOUNCE = 2000; // 2 seconds

  isBrowser: boolean = false;
  private pendingEditorContent: string | null = null;

  constructor(
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Navigates to BC Exercise page
   */
  navigateToBcExercise(): void {
    this.router.navigate(['/bcp/bc-exercise']);
  }

  /**
   * Handles tab change event
   */
  onTabChange(event: any): void {
    // Handle tab change if needed
  }

  async ngOnInit(): Promise<void> {
    if (!this.isBrowser) {
      return;
    }

    // Load existing BCP document if available
    this.loadBcpDocument();

    // Load existing BC Exercise document if available
    this.loadBcExerciseDocument();

    // Set up autosave
    this.autosaveSubject
      .pipe(
        debounceTime(this.AUTOSAVE_DEBOUNCE),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.performAutosave();
      });

    // Set up BC Exercise autosave
    this.bcExerciseAutosaveSubject
      .pipe(
        debounceTime(this.AUTOSAVE_DEBOUNCE),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.performBcExerciseAutosave();
      });

    // Load libraries dynamically
    await this.loadLibraries();
  }

  async ngAfterViewInit(): Promise<void> {
    if (this.isBrowser) {
      if (this.editorContainer && !this.quillEditor) {
        await this.initializeEditor();
      }
      if (this.bcExerciseEditorContainer && !this.bcExerciseQuillEditor) {
        await this.initializeBcExerciseEditor();
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.quillEditor) {
      this.quillEditor = null;
    }
    if (this.bcExerciseQuillEditor) {
      this.bcExerciseQuillEditor = null;
    }
  }

  /**
   * Dynamically loads required libraries
   */
  private async loadLibraries(): Promise<void> {
    if (!this.isBrowser) {
      return;
    }

    try {
      // Load buffer polyfill first (required by docx)
      try {
        const bufferModule = await import('buffer');
        if (typeof window !== 'undefined' && !(window as any).Buffer) {
          (window as any).Buffer = bufferModule.Buffer;
        }
      } catch (e) {
        console.warn('Buffer polyfill not available, DOCX export may not work');
      }

      // Load mammoth.js
      const mammothModule = await import('mammoth');
      mammoth = mammothModule.default || mammothModule;

      // Load docx (may not work in browser without proper polyfills)
      try {
        const docxModule = await import('docx');
        docx = docxModule;
      } catch (e) {
        console.warn('DOCX library may not work in browser environment:', e);
        // Continue without docx - export will show error
      }

      // Load Quill
      const quillModule = await import('quill');
      Quill = quillModule.default || quillModule;

      // Import Quill styles dynamically
      if (this.isBrowser) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
        document.head.appendChild(link);
      }
    } catch (error) {
      console.error('Error loading libraries:', error);
      this.showEditorStatus('error', 'error', 'Failed to load editor libraries. Please refresh the page.');
    }
  }

  /**
   * Initializes the Quill rich text editor
   */
  private async initializeEditor(): Promise<void> {
    if (!this.isBrowser || !Quill || !this.editorContainer) {
      return;
    }

    try {
      this.quillEditor = new Quill(this.editorContainer.nativeElement, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['clean'],
            ['link', 'image'],
            ['table']
          ]
        },
        placeholder: 'Start editing your BCP document...',
        // Preserve HTML formatting from imported documents
        formats: [
          'header', 'bold', 'italic', 'underline', 'strike',
          'list', 'bullet', 'script', 'indent', 'direction',
          'size', 'color', 'background', 'font', 'align',
          'link', 'image', 'table', 'blockquote', 'code-block'
        ]
      });

      // Load existing content if available or pending
      if (this.pendingEditorContent) {
        this.quillEditor.root.innerHTML = this.pendingEditorContent;
        this.pendingEditorContent = null;
      } else if (this.documentContent) {
        this.quillEditor.root.innerHTML = this.documentContent;
      }

      // Load existing content if available
      if (this.documentContent) {
        this.quillEditor.root.innerHTML = this.documentContent;
      }

      // Set up change detection for autosave
      this.quillEditor.on('text-change', () => {
        this.hasUnsavedChanges = true;
        this.autosaveSubject.next();
        this.cdr.markForCheck();
      });

      this.showEditorStatus('success', 'check_circle', 'Editor ready');
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error initializing editor:', error);
      this.showEditorStatus('error', 'error', 'Failed to initialize editor');
    }
  }

  /**
   * Shows editor status message
   */
  private showEditorStatus(type: string, icon: string, message: string): void {
    this.editorStatus = { type, icon, message };
    setTimeout(() => {
      this.editorStatus = null;
      this.cdr.markForCheck();
    }, 3000);
  }

  /**
   * Handles file selection and automatically imports the document
   * Per US-6.1: Upload Organizational BCP (DOCX)
   * Single-click import: file selection triggers automatic import
   */
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file type
      const validExtensions = ['.docx', '.doc'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!validExtensions.includes(fileExtension)) {
        this.snackBar.open(
          `Invalid file type. Please select a .docx or .doc file. Selected: ${fileExtension}`,
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          }
        );
        this.clearFileInput(input);
        return;
      }

      // Validate file size
      if (file.size > this.MAX_FILE_SIZE) {
        this.snackBar.open(
          `File size (${this.formatFileSize(file.size)}) exceeds ${this.formatFileSize(this.MAX_FILE_SIZE)} limit. Please select a smaller file.`,
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          }
        );
        this.clearFileInput(input);
        return;
      }

      // Additional validation: Check MIME type if available
      if (file.type && !file.type.includes('wordprocessingml') && !file.type.includes('msword') && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        this.snackBar.open(
          'File type validation failed. Please ensure the file is a valid DOCX document.',
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['warning-snackbar']
          }
        );
      }

      // Set selected file and automatically trigger import
      this.selectedFile = file;
      this.cdr.markForCheck();

      // Automatically import the document
      await this.importDocument();
    }
  }

  /**
   * Clears file input
   */
  private clearFileInput(input: HTMLInputElement): void {
    input.value = '';
    this.selectedFile = null;
    this.cdr.markForCheck();
  }


  /**
   * Imports the selected document using mammoth.js
   * Per US-6.1: Upload Organizational BCP (DOCX)
   */
  async importDocument(): Promise<void> {
    if (!this.selectedFile || !this.isBrowser) {
      return;
    }

    if (!mammoth) {
      await this.loadLibraries();
      if (!mammoth) {
        this.snackBar.open(
          'Document parser library not available. Please refresh the page.',
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          }
        );
        return;
      }
    }

    this.isProcessing = true;
    this.cdr.markForCheck();

    try {
      const arrayBuffer = await this.readFileAsArrayBuffer(this.selectedFile);
      
      // Parse DOCX to HTML using mammoth.js with style preservation
      const result = await mammoth.convertToHtml(
        { arrayBuffer: arrayBuffer },
        {
          styleMap: [
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "p[style-name='Heading 3'] => h3:fresh",
            "p[style-name='Heading 4'] => h4:fresh",
            "p[style-name='Heading 5'] => h5:fresh",
            "p[style-name='Heading 6'] => h6:fresh",
            "p[style-name='Title'] => h1.title:fresh",
            "p[style-name='Subtitle'] => h2.subtitle:fresh",
            "r[style-name='Strong'] => strong",
            "r[style-name='Emphasis'] => em",
            "p[style-name='Quote'] => blockquote:fresh",
            "p[style-name='List Paragraph'] => p.list-paragraph:fresh"
          ],
          includeDefaultStyleMap: true,
          convertImage: mammoth.images.imgElement((image: any) => {
            return image.read("base64").then((imageBuffer: any) => {
              return {
                src: "data:" + image.contentType + ";base64," + imageBuffer.toString("base64")
              };
            });
          })
        }
      );
      const htmlContent = result.value;
      const messages = result.messages;

      // Show warnings if any
      if (messages.length > 0) {
        console.warn('Mammoth conversion messages:', messages);
        const warningCount = messages.filter((m: any) => m.type === 'warning').length;
        if (warningCount > 0) {
          this.snackBar.open(
            `Document imported with ${warningCount} warning(s). Some formatting may be lost.`,
            'Close',
            {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['warning-snackbar']
            }
          );
        }
      }

      // Create metadata
      const newVersion = this.bcpMetadata ? this.bcpMetadata.version + 1 : 1;
      this.bcpMetadata = {
        fileName: this.selectedFile.name,
        fileSize: this.selectedFile.size,
        uploadedDate: new Date(),
        uploadedBy: this.getCurrentUser(),
        version: newVersion,
        fileContent: arrayBuffer
      };

      // Set document content
      this.documentContent = htmlContent;

      // If editor is initialized, set content directly
      if (this.quillEditor) {
        this.quillEditor.root.innerHTML = htmlContent;
        this.hasUnsavedChanges = false;
        this.cdr.markForCheck();
      } else {
        // If editor container exists, initialize editor (pendingEditorContent will be used)
        if (this.editorContainer) {
          this.pendingEditorContent = htmlContent;
          await this.initializeEditor();
        } else {
          // Editor container not available yet, store content for later
          this.pendingEditorContent = htmlContent;
        }
      }
      
      // Add audit log entry
      this.addAuditLog('import', `Imported document: ${this.selectedFile.name}`, newVersion);

      // Save to storage
      this.saveBcpToStorage();

      this.snackBar.open(
        `BCP document "${this.selectedFile.name}" imported successfully. Version ${newVersion} created.`,
        'Close',
        {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        }
      );

      this.selectedFile = null;
      this.isProcessing = false;
      
      // Clear file input to allow importing another file
      const fileInput = document.getElementById('bcp-file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error importing document:', error);
      this.snackBar.open(
        `Error importing document: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        'Close',
        {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        }
      );
      this.isProcessing = false;
      this.cdr.markForCheck();
    }
  }

  
  /**
   * Reads file as ArrayBuffer
   */
  private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as ArrayBuffer);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Performs autosave of document content
   */
  private performAutosave(): void {
    if (!this.isBrowser || !this.quillEditor || !this.bcpMetadata) {
      return;
    }

    try {
      const htmlContent = this.quillEditor.root.innerHTML;
      
      // Only save if content has changed
      if (htmlContent !== this.documentContent) {
        this.documentContent = htmlContent;
        
        // Update metadata
        if (this.bcpMetadata) {
          this.bcpMetadata.lastModified = new Date();
        }

        // Save to storage
        this.saveBcpToStorage();

        // Add audit log entry
        this.addAuditLog('edit', 'Document content auto-saved');

        this.hasUnsavedChanges = false;
        this.showEditorStatus('success', 'save', 'Changes auto-saved');
        this.cdr.markForCheck();
      }
    } catch (error) {
      console.error('Error during autosave:', error);
      this.showEditorStatus('error', 'error', 'Autosave failed');
    }
  }

  /**
   * Loads BCP document from storage
   */
  private loadBcpDocument(): void {
    if (!this.isBrowser) {
      return;
    }

    const stored = localStorage.getItem('bcp_document');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.bcpMetadata = {
          ...data,
          uploadedDate: new Date(data.uploadedDate),
          lastModified: data.lastModified ? new Date(data.lastModified) : undefined
        };
        
        // Load document content
        const content = localStorage.getItem('bcp_document_content');
        if (content) {
          this.documentContent = content;
        }

        // Load audit logs
        const auditLogsStr = localStorage.getItem('bcp_audit_logs');
        if (auditLogsStr) {
          try {
            const logs = JSON.parse(auditLogsStr);
            this.auditLogs = logs.map((log: any) => ({
              ...log,
              timestamp: new Date(log.timestamp)
            }));
          } catch (e) {
            console.error('Error loading audit logs:', e);
          }
        }
        
        this.cdr.markForCheck();
      } catch (error) {
        console.error('Error loading BCP document:', error);
      }
    }
  }

  /**
   * Saves BCP document to storage
   */
  private saveBcpToStorage(): void {
    if (!this.isBrowser) {
      return;
    }

    if (this.bcpMetadata) {
      const metadataToStore = {
        ...this.bcpMetadata,
        fileContent: undefined // Don't store binary in localStorage
      };
      localStorage.setItem('bcp_document', JSON.stringify(metadataToStore));
      //localStorage.setItem('bcp_document_content', this.documentContent);
      
      // Save audit logs (keep last 50 entries)
      const logsToSave = this.auditLogs.slice(-50);
      localStorage.setItem('bcp_audit_logs', JSON.stringify(logsToSave));
    }
  }

  /**
   * Adds an entry to the audit log
   */
  private addAuditLog(action: AuditLogEntry['action'], description: string, version?: number): void {
    const entry: AuditLogEntry = {
      timestamp: new Date(),
      action,
      user: this.getCurrentUser(),
      description,
      version
    };

    this.auditLogs.unshift(entry); // Add to beginning
    
    // Keep only last 100 entries in memory
    if (this.auditLogs.length > 100) {
      this.auditLogs = this.auditLogs.slice(0, 100);
    }

    this.cdr.markForCheck();
  }

  /**
   * Gets current user (placeholder - should come from auth service)
   */
  private getCurrentUser(): string {
    // TODO: Get from auth service
    return 'Current User';
  }

  /**
   * Toggles audit log visibility
   */
  toggleAuditLog(): void {
    this.showAuditLog = !this.showAuditLog;
    this.cdr.markForCheck();
  }

  /**
   * Downloads the current BCP document as DOCX
   * Per US-6.2: View and Download BCP
   */
  async downloadDocument(): Promise<void> {
    if (!this.bcpMetadata || !this.isBrowser) {
      this.snackBar.open(
        'No document available to download.',
        'Close',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['warning-snackbar']
        }
      );
      return;
    }

    if (!docx) {
      await this.loadLibraries();
      if (!docx) {
        this.snackBar.open(
          'Document export library not available. Please refresh the page.',
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          }
        );
        return;
      }
    }

    this.isProcessing = true;
    this.cdr.markForCheck();

    try {
      // Get current content from editor or stored content
      const htmlContent = this.quillEditor ? this.quillEditor.root.innerHTML : this.documentContent;
      
      // Convert HTML to DOCX using docx library
      const docxBlob = await this.convertHtmlToDocx(htmlContent);
      
      // Create download with metadata in filename
      const timestamp = new Date().toISOString().split('T')[0];
      const version = this.bcpMetadata.version;
      const baseName = this.bcpMetadata.fileName.replace(/\.(docx|doc)$/i, '');
      const downloadName = `${baseName}_v${version}_${timestamp}.docx`;

      const url = URL.createObjectURL(docxBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      // Add audit log entry
      this.addAuditLog('download', `Downloaded document: ${downloadName}`, version);

      this.snackBar.open(
        `Document "${downloadName}" downloaded successfully.`,
        'Close',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        }
      );

      this.isProcessing = false;
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error downloading document:', error);
      this.snackBar.open(
        `Error downloading document: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Close',
        {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        }
      );
      this.isProcessing = false;
      this.cdr.markForCheck();
    }
  }

  /**
   * Exports the BCP document as DOCX
   * Per US-6.3: Export BCP (DOCX)
   */
  async exportDocument(): Promise<void> {
    if (!this.bcpMetadata || !this.isBrowser) {
      this.snackBar.open(
        'No document available to export.',
        'Close',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['warning-snackbar']
        }
      );
      return;
    }

    if (!docx) {
      await this.loadLibraries();
      if (!docx) {
        this.snackBar.open(
          'Document export library not available. Please refresh the page.',
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          }
        );
        return;
      }
    }

    this.isProcessing = true;
    this.cdr.markForCheck();

    try {
      // Ensure latest content is saved
      if (this.quillEditor) {
        this.documentContent = this.quillEditor.root.innerHTML;
        this.performAutosave();
      }

      // Get HTML content
      const htmlContent = this.documentContent;
      
      // Convert HTML to DOCX
      const docxBlob = await this.convertHtmlToDocx(htmlContent);
      
      // Create export filename with metadata
      const timestamp = new Date().toISOString().split('T')[0];
      const version = this.bcpMetadata.version;
      const baseName = this.bcpMetadata.fileName.replace(/\.(docx|doc)$/i, '');
      const exportName = `${baseName}_exported_v${version}_${timestamp}.docx`;

      const url = URL.createObjectURL(docxBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      // Update metadata
      this.bcpMetadata.lastModified = new Date();
      this.saveBcpToStorage();

      // Add audit log entry
      this.addAuditLog('export', `Exported document: ${exportName}`, version);

      this.snackBar.open(
        `BCP document "${exportName}" exported successfully.`,
        'Close',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        }
      );

      this.isProcessing = false;
      this.hasUnsavedChanges = false;
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error exporting document:', error);
      this.snackBar.open(
        `Error exporting document: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Close',
        {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        }
      );
      this.isProcessing = false;
      this.cdr.markForCheck();
    }
  }

  /**
   * Converts HTML content to DOCX format
   */
  private async convertHtmlToDocx(htmlContent: string): Promise<Blob> {
    if (!docx) {
      throw new Error('DOCX library not loaded');
    }

    // Parse HTML and convert to docx structure
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Extract paragraphs, headings, and other elements
    const children: any[] = [];
    
    // Process body content
    const body = doc.body;
    if (body) {
      for (let i = 0; i < body.childNodes.length; i++) {
        const node = body.childNodes[i];
        const element = node as HTMLElement;
        
        if (element.nodeType === Node.ELEMENT_NODE) {
          const paragraph = this.convertHtmlElementToDocx(element);
          if (paragraph) {
            children.push(paragraph);
          }
        } else if (element.nodeType === Node.TEXT_NODE && element.textContent?.trim()) {
          // Handle text nodes
          children.push(
            new docx.Paragraph({
              children: [
                new docx.TextRun({
                  text: element.textContent.trim()
                })
              ]
            })
          );
        }
      }
    }

    // If no content extracted, create a default paragraph
    if (children.length === 0) {
      children.push(
        new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: 'BCP Document Content'
            })
          ]
        })
      );
    }

    // Add metadata section at the beginning
    if (this.bcpMetadata) {
      const metadataParagraphs = this.createMetadataSection();
      children.unshift(...metadataParagraphs);
    }

    // Create document
    const docxDocument = new docx.Document({
      sections: [
        {
          properties: {},
          children: children
        }
      ]
    });

    // Generate blob
    const blob = await docx.Packer.toBlob(docxDocument);
    return blob;
  }

  /**
   * Converts an HTML element to DOCX paragraph
   */
  private convertHtmlElementToDocx(element: HTMLElement): any {
    if (!docx) {
      return null;
    }

    const tagName = element.tagName?.toLowerCase();
    const text = element.textContent?.trim() || '';

    if (!text) {
      return null;
    }

    // Handle headings
    if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3' || 
        tagName === 'h4' || tagName === 'h5' || tagName === 'h6') {
      const level = parseInt(tagName.charAt(1)) - 1;
      return new docx.Paragraph({
        heading: docx.HeadingLevel[`HEADING_${level}` as keyof typeof docx.HeadingLevel] || docx.HeadingLevel.HEADING_1,
        children: [
          new docx.TextRun({
            text: text,
            bold: true
          })
        ]
      });
    }

    // Handle lists
    if (tagName === 'li') {
      return new docx.Paragraph({
        bullet: {
          level: 0
        },
        children: [
          new docx.TextRun({
            text: text
          })
        ]
      });
    }

    // Handle tables
    if (tagName === 'table') {
      return this.convertTableToDocx(element);
    }

    // Handle paragraphs and other elements
    const runs: any[] = [];
    this.processTextNodes(element, runs);

    if (runs.length === 0) {
      runs.push(new docx.TextRun({ text: text }));
    }

    return new docx.Paragraph({
      children: runs
    });
  }

  /**
   * Processes text nodes and creates text runs with formatting
   */
  private processTextNodes(element: HTMLElement, runs: any[]): void {
    if (!docx) {
      return;
    }

    for (let i = 0; i < element.childNodes.length; i++) {
      const node = element.childNodes[i];
      
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          runs.push(new docx.TextRun({ text: text }));
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tagName = el.tagName?.toLowerCase();
        const text = el.textContent?.trim();

        if (text) {
          const runOptions: any = { text: text };
          
          if (tagName === 'strong' || tagName === 'b') {
            runOptions.bold = true;
          }
          if (tagName === 'em' || tagName === 'i') {
            runOptions.italics = true;
          }
          if (tagName === 'u') {
            runOptions.underline = {};
          }

          runs.push(new docx.TextRun(runOptions));
        } else {
          // Recursively process child elements
          this.processTextNodes(el, runs);
        }
      }
    }
  }

  /**
   * Converts HTML table to DOCX table
   */
  private convertTableToDocx(tableElement: HTMLElement): any {
    if (!docx) {
      return null;
    }

    const rows: any[] = [];
    const tableRows = tableElement.querySelectorAll('tr');

    tableRows.forEach((tr) => {
      const cells: any[] = [];
      const tableCells = tr.querySelectorAll('td, th');

      tableCells.forEach((td) => {
        const cellContent = td.textContent?.trim() || '';
        cells.push(
          new docx.TableCell({
            children: [
              new docx.Paragraph({
                children: [
                  new docx.TextRun({
                    text: cellContent,
                    bold: td.tagName?.toLowerCase() === 'th'
                  })
                ]
              })
            ]
          })
        );
      });

      if (cells.length > 0) {
        rows.push(
          new docx.TableRow({
            children: cells
          })
        );
      }
    });

    if (rows.length > 0) {
      return new docx.Paragraph({
        children: [
          new docx.Table({
            rows: rows
          })
        ]
      });
    }

    return null;
  }

  /**
   * Creates metadata section for DOCX document
   */
  private createMetadataSection(): any[] {
    if (!docx || !this.bcpMetadata) {
      return [];
    }

    const paragraphs: any[] = [
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: 'Business Continuity Plan (BCP)',
            bold: true,
            size: 32
          })
        ],
        spacing: { after: 200 }
      }),
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: `File Name: ${this.bcpMetadata.fileName}`,
            size: 24
          })
        ]
      }),
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: `Version: ${this.bcpMetadata.version}`,
            size: 24
          })
        ]
      }),
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: `Uploaded Date: ${this.bcpMetadata.uploadedDate.toLocaleString()}`,
            size: 24
          })
        ]
      }),
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: `Uploaded By: ${this.bcpMetadata.uploadedBy}`,
            size: 24
          })
        ]
      })
    ];

    if (this.bcpMetadata.lastModified) {
      paragraphs.push(
        new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: `Last Modified: ${this.bcpMetadata.lastModified.toLocaleString()}`,
              size: 24
            })
          ]
        })
      );
    }

    // Add separator
    paragraphs.push(
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: 'â”€'.repeat(50),
            size: 24
          })
        ],
        spacing: { after: 400 }
      })
    );

    return paragraphs;
  }

  /**
   * Formats file size in human-readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  // ==================== BC Exercise Methods ====================

  /**
   * Handles BC Exercise file selection and automatically imports the document
   */
  async onBcExerciseFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file type
      const validExtensions = ['.docx', '.doc'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!validExtensions.includes(fileExtension)) {
        this.snackBar.open(
          `Invalid file type. Please select a .docx or .doc file. Selected: ${fileExtension}`,
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          }
        );
        this.clearBcExerciseFileInput(input);
        return;
      }

      // Validate file size
      if (file.size > this.MAX_FILE_SIZE) {
        this.snackBar.open(
          `File size (${this.formatFileSize(file.size)}) exceeds ${this.formatFileSize(this.MAX_FILE_SIZE)} limit. Please select a smaller file.`,
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          }
        );
        this.clearBcExerciseFileInput(input);
        return;
      }

      // Set selected file and automatically trigger import
      this.selectedBcExerciseFile = file;
      this.cdr.markForCheck();

      // Automatically import the document
      await this.importBcExerciseDocument();
    }
  }

  /**
   * Clears BC Exercise file input
   */
  private clearBcExerciseFileInput(input: HTMLInputElement): void {
    input.value = '';
    this.selectedBcExerciseFile = null;
    this.cdr.markForCheck();
  }

  /**
   * Imports the selected BC Exercise document using mammoth.js
   */
  async importBcExerciseDocument(): Promise<void> {
    if (!this.selectedBcExerciseFile || !this.isBrowser) {
      return;
    }

    if (!mammoth) {
      await this.loadLibraries();
      if (!mammoth) {
        this.snackBar.open(
          'Document parser library not available. Please refresh the page.',
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          }
        );
        return;
      }
    }

    this.isBcExerciseProcessing = true;
    this.cdr.markForCheck();

    try {
      const arrayBuffer = await this.readFileAsArrayBuffer(this.selectedBcExerciseFile);
      
      // Parse DOCX to HTML using mammoth.js
      const result = await mammoth.convertToHtml(
        { arrayBuffer: arrayBuffer },
        {
          styleMap: [
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "p[style-name='Heading 3'] => h3:fresh",
            "p[style-name='Heading 4'] => h4:fresh",
            "p[style-name='Heading 5'] => h5:fresh",
            "p[style-name='Heading 6'] => h6:fresh",
            "p[style-name='Title'] => h1.title:fresh",
            "p[style-name='Subtitle'] => h2.subtitle:fresh",
            "r[style-name='Strong'] => strong",
            "r[style-name='Emphasis'] => em",
            "p[style-name='Quote'] => blockquote:fresh",
            "p[style-name='List Paragraph'] => p.list-paragraph:fresh"
          ],
          includeDefaultStyleMap: true,
          convertImage: mammoth.images.imgElement((image: any) => {
            return image.read("base64").then((imageBuffer: any) => {
              return {
                src: "data:" + image.contentType + ";base64," + imageBuffer.toString("base64")
              };
            });
          })
        }
      );
      const htmlContent = result.value;
      const messages = result.messages;

      // Show warnings if any
      if (messages.length > 0) {
        console.warn('Mammoth conversion messages:', messages);
        const warningCount = messages.filter((m: any) => m.type === 'warning').length;
        if (warningCount > 0) {
          this.snackBar.open(
            `Document imported with ${warningCount} warning(s). Some formatting may be lost.`,
            'Close',
            {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['warning-snackbar']
            }
          );
        }
      }

      // Create metadata
      const newVersion = this.bcExerciseMetadata ? this.bcExerciseMetadata.version + 1 : 1;
      this.bcExerciseMetadata = {
        fileName: this.selectedBcExerciseFile.name,
        fileSize: this.selectedBcExerciseFile.size,
        uploadedDate: new Date(),
        uploadedBy: this.getCurrentUser(),
        version: newVersion,
        fileContent: arrayBuffer
      };

      // Set document content
      this.bcExerciseDocumentContent = htmlContent;
      
      // Initialize editor if not already initialized
      if (!this.bcExerciseQuillEditor && this.bcExerciseEditorContainer) {
        await this.initializeBcExerciseEditor();
      }
      
      // Load content into editor if available
      if (this.bcExerciseQuillEditor) {
        this.bcExerciseQuillEditor.root.innerHTML = htmlContent;
        this.hasBcExerciseUnsavedChanges = false;
        this.cdr.markForCheck();
      }

      // Add audit log entry
      this.addBcExerciseAuditLog('import', `Imported document: ${this.selectedBcExerciseFile.name}`, newVersion);

      // Save to storage
      this.saveBcExerciseToStorage();

      this.snackBar.open(
        `BC Exercise Report "${this.selectedBcExerciseFile.name}" imported successfully. Version ${newVersion} created.`,
        'Close',
        {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        }
      );

      this.selectedBcExerciseFile = null;
      this.isBcExerciseProcessing = false;
      
      // Clear file input
      const fileInput = document.getElementById('bc-exercise-file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error importing BC Exercise document:', error);
      this.snackBar.open(
        `Error importing document: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        'Close',
        {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        }
      );
      this.isBcExerciseProcessing = false;
      this.cdr.markForCheck();
    }
  }

  /**
   * Initializes the BC Exercise Quill rich text editor
   */
  private async initializeBcExerciseEditor(): Promise<void> {
    if (!this.isBrowser || !Quill || !this.bcExerciseEditorContainer) {
      return;
    }

    try {
      this.bcExerciseQuillEditor = new Quill(this.bcExerciseEditorContainer.nativeElement, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['clean'],
            ['link', 'image'],
            ['table']
          ]
        },
        placeholder: 'Start editing your BC Exercise Report...',
        formats: [
          'header', 'bold', 'italic', 'underline', 'strike',
          'list', 'bullet', 'script', 'indent', 'direction',
          'size', 'color', 'background', 'font', 'align',
          'link', 'image', 'table', 'blockquote', 'code-block'
        ]
      });

      // Load existing content if available
      if (this.bcExerciseDocumentContent) {
        this.bcExerciseQuillEditor.root.innerHTML = this.bcExerciseDocumentContent;
      }

      // Set up change detection for autosave
      this.bcExerciseQuillEditor.on('text-change', () => {
        this.hasBcExerciseUnsavedChanges = true;
        this.bcExerciseAutosaveSubject.next();
        this.cdr.markForCheck();
      });

      this.showBcExerciseEditorStatus('success', 'check_circle', 'Editor ready');
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error initializing BC Exercise editor:', error);
      this.showBcExerciseEditorStatus('error', 'error', 'Failed to initialize editor');
    }
  }

  /**
   * Shows BC Exercise editor status message
   */
  private showBcExerciseEditorStatus(type: string, icon: string, message: string): void {
    this.bcExerciseEditorStatus = { type, icon, message };
    setTimeout(() => {
      this.bcExerciseEditorStatus = null;
      this.cdr.markForCheck();
    }, 3000);
  }

  /**
   * Performs autosave of BC Exercise document content
   */
  private performBcExerciseAutosave(): void {
    if (!this.isBrowser || !this.bcExerciseQuillEditor || !this.bcExerciseMetadata) {
      return;
    }

    try {
      const htmlContent = this.bcExerciseQuillEditor.root.innerHTML;
      
      // Only save if content has changed
      if (htmlContent !== this.bcExerciseDocumentContent) {
        this.bcExerciseDocumentContent = htmlContent;
        
        // Update metadata
        if (this.bcExerciseMetadata) {
          this.bcExerciseMetadata.lastModified = new Date();
        }

        // Save to storage
        this.saveBcExerciseToStorage();

        // Add audit log entry
        this.addBcExerciseAuditLog('edit', 'Document content auto-saved');

        this.hasBcExerciseUnsavedChanges = false;
        this.showBcExerciseEditorStatus('success', 'save', 'Changes auto-saved');
        this.cdr.markForCheck();
      }
    } catch (error) {
      console.error('Error during BC Exercise autosave:', error);
      this.showBcExerciseEditorStatus('error', 'error', 'Autosave failed');
    }
  }

  /**
   * Loads BC Exercise document from storage
   */
  private loadBcExerciseDocument(): void {
    if (!this.isBrowser) {
      return;
    }

    const stored = localStorage.getItem('bc_exercise_document');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.bcExerciseMetadata = {
          ...data,
          uploadedDate: new Date(data.uploadedDate),
          lastModified: data.lastModified ? new Date(data.lastModified) : undefined
        };
        
        // Load document content
        const content = localStorage.getItem('bc_exercise_document_content');
        if (content) {
          this.bcExerciseDocumentContent = content;
        }

        // Load audit logs
        const auditLogsStr = localStorage.getItem('bc_exercise_audit_logs');
        if (auditLogsStr) {
          try {
            const logs = JSON.parse(auditLogsStr);
            this.bcExerciseAuditLogs = logs.map((log: any) => ({
              ...log,
              timestamp: new Date(log.timestamp)
            }));
          } catch (e) {
            console.error('Error loading BC Exercise audit logs:', e);
          }
        }
        
        this.cdr.markForCheck();
      } catch (error) {
        console.error('Error loading BC Exercise document:', error);
      }
    }
  }

  /**
   * Saves BC Exercise document to storage
   */
  private saveBcExerciseToStorage(): void {
    if (!this.isBrowser) {
      return;
    }

    if (this.bcExerciseMetadata) {
      const metadataToStore = {
        ...this.bcExerciseMetadata,
        fileContent: undefined // Don't store binary in localStorage
      };
      localStorage.setItem('bc_exercise_document', JSON.stringify(metadataToStore));
      localStorage.setItem('bc_exercise_document_content', this.bcExerciseDocumentContent);
      
      // Save audit logs (keep last 50 entries)
      const logsToSave = this.bcExerciseAuditLogs.slice(-50);
      localStorage.setItem('bc_exercise_audit_logs', JSON.stringify(logsToSave));
    }
  }

  /**
   * Adds an entry to the BC Exercise audit log
   */
  private addBcExerciseAuditLog(action: BcExerciseAuditLogEntry['action'], description: string, version?: number): void {
    const entry: BcExerciseAuditLogEntry = {
      timestamp: new Date(),
      action,
      user: this.getCurrentUser(),
      description,
      version
    };

    this.bcExerciseAuditLogs.unshift(entry); // Add to beginning
    
    // Keep only last 100 entries in memory
    if (this.bcExerciseAuditLogs.length > 100) {
      this.bcExerciseAuditLogs = this.bcExerciseAuditLogs.slice(0, 100);
    }

    this.cdr.markForCheck();
  }

  /**
   * Toggles BC Exercise audit log visibility
   */
  toggleBcExerciseAuditLog(): void {
    this.showBcExerciseAuditLog = !this.showBcExerciseAuditLog;
    this.cdr.markForCheck();
  }

  /**
   * Downloads the current BC Exercise document as DOCX
   */
  async downloadBcExerciseDocument(): Promise<void> {
    if (!this.bcExerciseMetadata || !this.isBrowser) {
      this.snackBar.open(
        'No document available to download.',
        'Close',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['warning-snackbar']
        }
      );
      return;
    }

    if (!docx) {
      await this.loadLibraries();
      if (!docx) {
        this.snackBar.open(
          'Document export library not available. Please refresh the page.',
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          }
        );
        return;
      }
    }

    this.isBcExerciseProcessing = true;
    this.cdr.markForCheck();

    try {
      // Get current content from editor or stored content
      const htmlContent = this.bcExerciseQuillEditor ? this.bcExerciseQuillEditor.root.innerHTML : this.bcExerciseDocumentContent;
      
      // Convert HTML to DOCX using docx library
      const docxBlob = await this.convertHtmlToDocx(htmlContent);
      
      // Create download with metadata in filename
      const timestamp = new Date().toISOString().split('T')[0];
      const version = this.bcExerciseMetadata.version;
      const baseName = this.bcExerciseMetadata.fileName.replace(/\.(docx|doc)$/i, '');
      const downloadName = `${baseName}_v${version}_${timestamp}.docx`;

      const url = URL.createObjectURL(docxBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      // Add audit log entry
      this.addBcExerciseAuditLog('download', `Downloaded document: ${downloadName}`, version);

      this.snackBar.open(
        `Document "${downloadName}" downloaded successfully.`,
        'Close',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        }
      );

      this.isBcExerciseProcessing = false;
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error downloading BC Exercise document:', error);
      this.snackBar.open(
        `Error downloading document: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Close',
        {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        }
      );
      this.isBcExerciseProcessing = false;
      this.cdr.markForCheck();
    }
  }

  /**
   * Exports the BC Exercise document as DOCX
   */
  async exportBcExerciseDocument(): Promise<void> {
    if (!this.bcExerciseMetadata || !this.isBrowser) {
      this.snackBar.open(
        'No document available to export.',
        'Close',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['warning-snackbar']
        }
      );
      return;
    }

    if (!docx) {
      await this.loadLibraries();
      if (!docx) {
        this.snackBar.open(
          'Document export library not available. Please refresh the page.',
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          }
        );
        return;
      }
    }

    this.isBcExerciseProcessing = true;
    this.cdr.markForCheck();

    try {
      // Ensure latest content is saved
      if (this.bcExerciseQuillEditor) {
        this.bcExerciseDocumentContent = this.bcExerciseQuillEditor.root.innerHTML;
        this.performBcExerciseAutosave();
      }

      // Get HTML content
      const htmlContent = this.bcExerciseDocumentContent;
      
      // Convert HTML to DOCX
      const docxBlob = await this.convertHtmlToDocx(htmlContent);
      
      // Create export filename with metadata
      const timestamp = new Date().toISOString().split('T')[0];
      const version = this.bcExerciseMetadata.version;
      const baseName = this.bcExerciseMetadata.fileName.replace(/\.(docx|doc)$/i, '');
      const exportName = `${baseName}_exported_v${version}_${timestamp}.docx`;

      const url = URL.createObjectURL(docxBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      // Update metadata
      this.bcExerciseMetadata.lastModified = new Date();
      this.saveBcExerciseToStorage();

      // Add audit log entry
      this.addBcExerciseAuditLog('export', `Exported document: ${exportName}`, version);

      this.snackBar.open(
        `BC Exercise Report "${exportName}" exported successfully.`,
        'Close',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        }
      );

      this.isBcExerciseProcessing = false;
      this.hasBcExerciseUnsavedChanges = false;
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error exporting BC Exercise document:', error);
      this.snackBar.open(
        `Error exporting document: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Close',
        {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        }
      );
      this.isBcExerciseProcessing = false;
      this.cdr.markForCheck();
    }
  }
}
