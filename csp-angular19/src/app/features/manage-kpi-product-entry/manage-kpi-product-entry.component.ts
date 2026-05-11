/**
 * ManageKpiProductEntryComponent - Manage KPI Products with Stepper
 * Migrated from LEGACY Angular 8 to Angular 19 standalone
 * 
 * Features:
 * - Horizontal stepper with 3 steps
 * - Step 1: Manage Products (app-manageproduct)
 * - Step 2: Product Responsible Person (app-product-responsible)
 * - Step 3: Service Level Metrics (app-manage-kpi-metrics)
 * - Customer logo and back navigation
 * - Linear stepper flow
 * 
 * Migration Notes:
 * - Converted to standalone component
 * - Used inject() pattern for dependency injection
 * - All logic preserved exactly from legacy
 * - All method names unchanged
 * - All styling preserved
 * 
 * TODO: The following child components need to be migrated:
 * - app-manageproduct (from LEGACY-SOURCE/src/app/pages/manageproduct)
 * - app-product-responsible (from LEGACY-SOURCE/src/app/pages/product-responsible)
 * - app-manage-kpi-metrics (from LEGACY-SOURCE/src/app/pages/manage-kpi-metrics)
 */

import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Material Imports
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Services and Utilities
import { AppsService } from '../../core/services/apps.service';
import { AccessControl } from '../../shared/access-control';
import { MyUtility } from '../../shared/my-utility';
import { SharedService } from '../../shared/shared.service';

// Child Components
import { ManageproductComponent } from '../manageproduct/manageproduct.component';
import { ProductResponsibleComponent } from '../product-responsible/product-responsible.component';
import { ManageKpiMetricsComponent } from '../manage-kpi-metrics/manage-kpi-metrics.component';

@Component({
  selector: 'app-manage-kpi-product-entry',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    ManageproductComponent,
    ProductResponsibleComponent,
    ManageKpiMetricsComponent
  ],
  templateUrl: './manage-kpi-product-entry.component.html',
  styleUrl: './manage-kpi-product-entry.component.scss'
})
export class ManageKpiProductEntryComponent implements OnInit {
  // Dependency Injection
  private route = inject(ActivatedRoute);
  private _appservice = inject(AppsService);
  public _shared = inject(SharedService);
  public _util = inject(MyUtility);
  private changeDetectorRefs = inject(ChangeDetectorRef);
  public _access = inject(AccessControl);
  private _snackBar = inject(MatSnackBar);

  // ViewChild
  @ViewChild('stepper') stepper!: MatStepper;

  // Component Properties
  custId: string = '';
  IsBackButtonEnabled: boolean = false;
  menuToggleStatus: boolean = false;
  isIdeaSubmitted: boolean = false;

  ngOnInit(): void {
    this.custId = this.route.snapshot.params["custid"];
  }

  /**
   * Show toast notification
   */
  private showToast(message: string, type: 'success' | 'warn' | 'error'): void {
    const duration = type === 'error' ? 4000 : 3000;
    const panelClass = `${type}-snackbar`;
    
    this._snackBar.open(message, 'Close', {
      duration: duration,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [panelClass]
    });
  }
}
