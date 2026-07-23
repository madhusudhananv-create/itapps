# Navbar Menu Component

## Overview
The navbar-menu component displays a settings menu with various administrative and configuration options. Access to each menu item is controlled by the AccessControl service based on user permissions.

## Component Details

### Files
- **navbar-menu.component.ts** - Component logic with AccessControl integration
- **navbar-menu.component.html** - Menu template with access-controlled items
- **navbar-menu.component.scss** - Styles (inherits Material menu styles)
- **navbar-menu.component.spec.ts** - Unit tests

### Features
- Role-based access control for all menu items
- Integration with AccessControl service
- Material Design menu styling
- Dynamic menu item visibility based on user permissions

## Menu Items and Access Control

Each menu item requires specific feature access. The menu uses `_access.IsAllowed(featureId, accessType, custId, projId)` to control visibility.

### Customer Management
| Menu Item | Route | Feature ID | Access Type |
|-----------|-------|------------|-------------|
| Customer Details | /customerinvite | 35 | 1 (View) |
| Application Access Control | /accesscontrol | 36 | 1 (View) |

### CRISP & Quality
| Menu Item | Route | Feature ID | Access Type |
|-----------|-------|------------|-------------|
| CRISP Scores Entry | /crispscores | 37 | 1 (View) |
| SQA Management | /sqamanagement | 42 | 1 (View) |

### Customer Satisfaction
| Menu Item | Route | Feature ID | Access Type |
|-----------|-------|------------|-------------|
| CSAT Configuration | /csatconfiguration | 826 | 1 (View) |
| Customer Satisfaction Survey | /css | 38 | 1 (View) |
| CSS Verification | /cssverification | 38 | 1 (View) |
| CSAT Monthly | /cssmonthly | 57 | 1 (View) |

### Project & Reports
| Menu Item | Route | Feature ID | Access Type |
|-----------|-------|------------|-------------|
| Project Access Control | /accesscontrolproj | 39 | 1 (View) |
| Resource Allocation | /ras | 40 | 1 (View) |
| Reports | /reports | 34 | 1 (View) |

### Advanced Features
| Menu Item | Route | Feature ID | Access Type |
|-----------|-------|------------|-------------|
| ConfigurationExt | /configext | 89 | 1 (View) |
| Risk Repository | /riskrepository | 104 | 1 (View) |
| Auditor Qualified Standards | /auditqualitystandards | 90 | 1 (View) |
| COO Dashboard | /coo-dashboard | 88 | 1 (View) |
| Benchmark KPI | /projectsKPI | 43 | 1 (View) |
| Compliance Insights | /complianceinsights | 113 | 1 (View) |
| CI LeaderBoard | /cileaderboard | 46 | 1 (View) |
| FMEA | /fmeamanagement | 45 | 1 (View) |

## Usage

The navbar-menu component is used within the navbar-new component:

```html
<button mat-icon-button [matMenuTriggerFor]="menu">
  <mat-icon>settings</mat-icon>
</button>
<mat-menu #menu="matMenu">
  <app-navbar-menu></app-navbar-menu>
</mat-menu>
```

## Migration from Legacy

### Changes from Angular 6 to Angular 19
1. **Standalone Component**: Updated to standalone component pattern
2. **Dependency Injection**: Using `inject()` instead of constructor injection
3. **Access Control**: Using the modernized AccessControl service
4. **Material Modules**: Importing Material modules directly in component

### Legacy Implementation
```typescript
// Angular 6
export class NavbarMenuComponent {
  constructor(public _util: myUtility, public _access: AccessControl) { }
}
```

### Modernized Implementation
```typescript
// Angular 19
export class NavbarMenuComponent {
  public _util = inject(MyUtility);
  public _access = inject(AccessControl);
}
```

## Access Control Logic

The `AccessControl.IsAllowed()` method checks:
1. User's role and permissions
2. Feature ID access rights
3. Customer and project level access (when applicable)

Example from template:
```html
<button mat-menu-item [routerLink]="['/customerinvite']" *ngIf="_access.IsAllowed(35, 1, '', '')">
  <i class="fa fa-street-view"></i>&nbsp;&nbsp;&nbsp;Customer Details
</button>
```

## Testing

The component includes comprehensive unit tests:
- Component creation
- Service injection verification
- Access control integration testing

Run tests with:
```bash
ng test
```

## Styling

The component uses Material Design menu styling with custom icons:
- Font Awesome icons for most menu items
- Material icons for some items (track_changes, etc.)
- Color-coded icons for visual categorization

## Dependencies

- `@angular/material` - Material menu, button, icon, divider components
- `@angular/router` - Navigation
- `AccessControl` service - Permission checking
- `MyUtility` service - Shared utilities

## Important Notes

1. **Access Control**: All menu items must have proper access control checks
2. **Feature IDs**: Feature IDs must match the backend permission configuration
3. **Look and Feel**: Maintains exact visual appearance from legacy application
4. **Empty Customer/Project IDs**: Most menu items use empty strings for customer/project IDs as they are application-level features
