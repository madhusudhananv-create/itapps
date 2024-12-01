import { NgModule } from "@angular/core";
import {
  MatIconModule, MatIconRegistry, MatMenuModule, MatTooltipModule, MatDividerModule,
  MatToolbarModule, MatSidenavModule, MatTableModule, MatFormFieldModule, MatInputModule,
  MatTabsModule, MatSelectModule, MatDatepickerModule, MatStepperModule, MatRippleModule,
  MatAutocompleteModule, MatListModule, MatRadioModule, MatSnackBarModule, MatButtonModule,
  MatExpansionModule, MatNativeDateModule, MatSliderModule, MatSortModule,
  MatButtonToggleModule, MatGridListModule, MatPaginatorModule, MatSlideToggleModule,
  MatTreeModule, MatCardModule, MatProgressBarModule, MatProgressSpinnerModule,
  MatCheckboxModule, MatChipsModule
} from "@angular/material";
import { ModuleWithProviders } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CdkTableModule } from "@angular/cdk/table";

@NgModule({
  exports: [
    //CdkTableModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSortModule, 
    MatStepperModule,
    MatTabsModule,
    MatTableModule,
    MatToolbarModule,
    MatTooltipModule,
    MatFormFieldModule,
    // MatAutocompleteModule, MatButtonModule, MatButtonToggleModule, MatCardModule, MatCheckboxModule, MatChipsModule,
    // MaterialModule, MatExpansionModule, MatGridListModule, MatInputModule,
    // MatListModule, MatNativeDateModule, MatPaginatorModule, MatProgressBarModule, MatProgressSpinnerModule,
    // MatRadioModule, MatSliderModule, MatSlideToggleModule,
    // MatSnackBarModule, MatSortModule, MatTreeModule
  ],
})
export class MaterialModule {
} 