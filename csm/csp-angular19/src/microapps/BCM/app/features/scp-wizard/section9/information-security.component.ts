import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export interface InformationSecurityData {
  declarationText: string;
  agreedToTerms: boolean;
}

@Component({
  selector: 'bcp-information-security',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatSelectModule, MatTooltipModule,MatSnackBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './information-security.component.html',
  styleUrl: './information-security.component.scss',
})
export class InformationSecurityComponent  {
  form: FormGroup;
    readonly defaultPolicyText = `Working remotely may cause certain security risks that must be addressed in order to protect Neurealmâ€™s information assets. For any team member logging into the network from a remote location, whether working from home or are logging in while traveling, please adhere to relevant policies, requirements and best practices as described in Neurealmâ€™s Policy Central / Neurealm websites / communicated to employees.`;

  // 2. The variable actually bound to the HTML
  displayedSecurityPolicy: string = this.defaultPolicyText;
      @Input() mode: 'view' | 'edit' = 'edit';
      @Output() dataChange = new EventEmitter<InformationSecurityData>();
      @Output() validityChange = new EventEmitter<boolean>();
      // State Signals
      

  constructor(private _snackBar: MatSnackBar, private fb: FormBuilder) { 
    this.form = this.fb.group({
      comments: [''] // The textarea control
    });
  }
          
  AddUpdateInformationSecurity() {
    const newComment = this.form.get('comments')?.value;

    if (newComment && newComment.trim() !== '') {
      // Update the display variable with the new text
      this.displayedSecurityPolicy = newComment;
      
      // Optional: Clear the textarea after adding
      this.form.get('comments')?.setValue(''); 
    }
    this.validityChange.emit(this.form.valid);
  }
  onDeleteInformationSecurity() {
    // Option A: Revert to the original default message
    this.displayedSecurityPolicy = this.defaultPolicyText;
    
    // Option B: If you want to clear it completely, use:
    // this.displayedSecurityPolicy = ''; 
    
    this.form.get('comments')?.setValue('');
  } 
      
}


