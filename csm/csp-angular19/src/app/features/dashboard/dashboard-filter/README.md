# Dashboard Filter Component

## Overview
The dashboard-filter component provides a comprehensive filtering interface for CSM and Business Value dashboards. It allows users to select customers, portfolios (for Premier customers), and projects with multi-select functionality.

## Component Details

### Files
- **dashboard-filter.component.ts** - Component logic with filter management
- **dashboard-filter.component.html** - Filter UI with dropdowns and tabs
- **dashboard-filter.component.scss** - Styles matching legacy design
- **dashboard-filter.component.spec.ts** - Unit tests

### Features
- Customer selection dropdown
- Portfolio selection (Premier customers only)
- Project multi-select with "All" option
- Tabbed interface for Operational and Business Value dashboards
- Dynamic filtering based on customer type
- Menu integration with navbar

## Usage

### Standalone Component
```typescript
import { DashboardFilterComponent } from './features/dashboard/dashboard-filter/dashboard-filter.component';

// In your component
imports: [DashboardFilterComponent]
```

### Template
```html
<app-dashboard-filter></app-dashboard-filter>
```

## Filter Hierarchy

### Non-Premier Customers
1. **Customer** - Select from dropdown
2. **Projects** - Multi-select projects for selected customer

### Premier Customers
1. **Customer** - Select from dropdown
2. **Portfolio** - Multi-select portfolios (with "All" option)
3. **Projects** - Multi-select projects from selected portfolios

## Key Methods

### Data Loading
- `loadProjects(empid)` - Entry point for loading filter data
- `getCustomerList(empId)` - Loads customer list for employee
- `getProjects()` - Loads projects for selected customer
- `service_getPortfolioDetails()` - Loads portfolio list (Premier only)
- `service_getProjectPortfolioMapping()` - Maps projects to portfolios

### Filter Logic
- `isPremier(custId)` - Checks if customer is Premier type
- `selectedCust_OnChange(event)` - Handles customer selection change
- `portfolio_OnChange(portId)` - Handles portfolio selection change
- `selectedProjects_OnChange(projId)` - Handles project selection change

### Multi-Select Management
- `toggleSelection()` - Toggle all portfolio selections
- `tosslePerOne()` - Handle individual portfolio toggle
- `tosslePerProjectAll()` - Toggle all project selections
- `tosslePerProject()` - Handle individual project toggle

## Output Events

### `toggle`
Emitted when menu toggle status changes
```typescript
@Output() toggle: EventEmitter<any> = new EventEmitter();
```

## ViewChild References

### MatSelect References
- `projectSelect` - Reference to project dropdown
- `portselect` - Reference to portfolio dropdown

### MatOption References
- `allSelected` - Reference to "All" option in multi-select

## Styling

### Custom Classes
- `.no-line` - Removes Material underline from form fields
- `.drpdown` - Standard dropdown styling (278px x 30px)
- `.navTabGrp` - Custom tab group styling with blue active tab

### Tab Styling
- Active tab background: `#59a3fd`
- Tab height: `30px`
- Tab labels background: `#eaeaea`
- Ink bar color: `white`

## Data Flow

```
Employee Login
    ↓
getCustomerList() → Load customers for employee
    ↓
selectedCust_OnChange()
    ↓
isPremier() check
    ↓
┌─────────────────┬──────────────────┐
│ Premier         │ Non-Premier      │
├─────────────────┼──────────────────┤
│ getPortfolio()  │ getProjects()    │
│     ↓           │                  │
│ getMapping()    │                  │
│     ↓           │                  │
│ getProjects()   │                  │
└─────────────────┴──────────────────┘
    ↓
User selects filters
    ↓
Dashboard loads with filtered data
```

## Dependencies

### Angular Material
- `MatFormFieldModule` - Form field wrapper
- `MatSelectModule` - Dropdown/multi-select
- `MatOptionModule` - Dropdown options
- `MatTabsModule` - Dashboard tabs

### Services
- `AppsService` - API calls for customers, projects, portfolios
- `MyUtility` - Utility functions and error handling

### Components
- `NavbarNewComponent` - Top navigation bar
- ~~`MenuComponent`~~ - Side menu (pending implementation)

## Migration from Legacy

### Changes from Angular 6 to Angular 19
1. **Standalone Component** - No NgModule required
2. **ViewChild Non-null Assertion** - Using `!` for definite assignment
3. **Typed Interfaces** - Added ProjectModelNew interface
4. **Observable Patterns** - Using object-based subscribe syntax
5. **Null Safety** - Added optional chaining and null checks

### Legacy Implementation
```typescript
// Angular 6
@ViewChild('allSelected') allSelected : MatOption;
```

### Modernized Implementation
```typescript
// Angular 19
@ViewChild('allSelected') allSelected!: MatOption;
```

## Premier Customer Detection

The component uses `isPremier()` method to determine if a customer requires portfolio filtering:

```typescript
isPremier(custId: string): boolean {
  return custId.includes('PREMIER') || custId.includes('Premier');
}
```

## Tab Configuration

### Operational Dashboard
- Default selected tab (index 0)
- Shows CSM customer dashboard with filters applied
- Placeholder content pending dashboard component implementation

### Business Value Dashboard
- Tab index 1
- Shows BVD dashboard for selected customer
- Placeholder content pending BVD component implementation

## Testing

The component includes comprehensive unit tests:
- Component creation
- Default values initialization
- Menu toggle functionality
- Array initialization
- Filter state management

Run tests with:
```bash
ng test
```

## Known Limitations

1. **Portfolio Services** - Portfolio-related API calls are currently placeholders
2. **Project Loading** - Project API method needs to be implemented in AppsService
3. **Menu Component** - Side menu component is commented out pending implementation
4. **Dashboard Components** - Child dashboard components (CSM, BVD) are placeholders

## Future Enhancements

1. Implement full portfolio service integration
2. Add project loading from backend
3. Integrate with actual CSM customer dashboard
4. Integrate with Business Value Dashboard
5. Add filter persistence (localStorage/session)
6. Add loading indicators during data fetch
7. Add empty state messaging when no data available

## Important Notes

- **Multi-select Behavior**: The "All" option (value="-1") toggles all other options
- **Premier Detection**: Currently checks if customer ID contains "PREMIER" or "Premier"
- **Filter Dependencies**: Portfolio changes trigger project list refresh
- **Look and Feel**: Maintains exact styling from legacy application
- **Null Safety**: All ViewChild references use safe navigation operators
