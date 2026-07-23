# Shared Folder - CSM Application

This folder contains shared utilities, services, and components used across the CSM application.

## 📁 Structure

```
shared/
├── access-control.ts          # Role-based access control service
├── assessment-utility.ts      # Assessment scoring and maturity level calculations
├── basepage.ts                # Base class for authenticated pages
├── enum.ts                    # Application-wide enumerations
├── guid.ts                    # GUID generation utility
├── my-utility.ts              # Core utility service (auth, dates, roles, errors)
├── shared-data.ts             # Singleton for shared application data
├── shared.service.ts          # Cross-component communication service
├── shared.service.spec.ts     # Unit tests for SharedService
└── spell-check/               # Spell checking component
    ├── spell-check.component.ts
    ├── spell-check.component.html
    ├── spell-check.component.scss
    └── spell-check.component.spec.ts
```

## 🔧 Services

### AccessControl
Handles role-based access control for resources and features.

**Usage:**
```typescript
constructor(private accessControl: AccessControl) {}

canEdit = this.accessControl.IsAllowed(
  resourceId, 
  enumAccessType.edit, 
  customerId, 
  projectId
);
```

### AssessmentUtility
Provides calculation methods for assessment scoring, maturity levels, and percentages.

**Usage:**
```typescript
constructor(private assessmentUtil: AssessmentUtility) {}

const score = this.assessmentUtil.getServiceAreaScore(serviceArea);
const percentage = this.assessmentUtil.getServiceAreaPercentage(serviceArea);
```

### MyUtility
Core utility service with authentication, role checks, date handling, and error management.

**Usage:**
```typescript
constructor(private util: MyUtility) {}

// Role checks
if (this.util.IsCSM()) { ... }
if (this.util.IsGAVS()) { ... }

// Date utilities
const month = this.util.Month();
const year = this.util.Year();

// Error handling
this.util.serviceError(error);
```

### SharedService
Facilitates cross-component communication and state management.

**Usage:**
```typescript
constructor(private sharedService: SharedService) {}

// Listen for method calls
this.sharedService.methodCalled$.subscribe(() => {
  // React to event
});

// Trigger method call
this.sharedService.callMethod();
```

## 📊 Utilities

### Guid
Generates UUID v4 GUIDs.

**Usage:**
```typescript
const newId = Guid.newGuid();
// Output: "a3bb189e-8bf9-3888-9912-ace4e6543002"
```

### SharedData
Singleton pattern for application-wide shared data.

**Usage:**
```typescript
const sharedData = SharedData.getInstance();
sharedData.slaAvailableList = [...];
```

### BasePage
Abstract base class for pages requiring authentication.

**Usage:**
```typescript
export class MyComponent extends BasePage implements OnInit {
  constructor(public override router: Router) {
    super();
  }
  
  // validateLogin() is called automatically in ngOnInit
}
```

## 🎨 Components

### SpellCheckComponent
Provides spell checking functionality using typo-js library.

**Setup:**
```bash
npm install typo-js
```

Place dictionary files in `/assets/dictionary/`:
- `index.aff`
- `index.dic`

**Usage:**
```html
<app-spell-check></app-spell-check>
```

## 🔢 Enumerations

### enumAccessType
- `view = 1`
- `create = 2`
- `edit = 3`
- `delete = 4`

### enumRoles
- `CustomerSuccessManager = 1`
- `ProjectManager = 2`
- `TeamMember = 3`
- `BUHeadIMS = 4`
- `Customer = 5`
- `PMO = 6`
- `Quality = 7`
- `Finance = 8`
- `FunctionalManager = 9`
- `HR = 10`
- `AccountManager = 11`
- `Marketing = 12`
- `GSLab = 13`

### enumDateRange
- `PreviousWeek = -1`
- `Weekly = 0`
- `NextWeek = 1`
- `Monthly = 2`
- `Custom = 3`

### enumKPIDetailsStatus
- `Draft = 1`
- `Submitted = 2`
- `Dispute = 3`
- `DisputeAccepted = 4`
- `DisputeRejected = 5`

## 📝 Migration Notes

### Angular 6 → Angular 19 Changes

1. **Dependency Injection**: Updated to use `inject()` function
2. **Standalone Components**: SpellCheckComponent is standalone
3. **RxJS**: Updated to v7+ patterns
4. **Type Safety**: Added strict typing throughout
5. **HttpClient**: Fixed legacy HttpClientClient references
6. **providedIn: 'root'**: All services use tree-shakeable providers

### Optional Dependencies

**XLSX (Excel Export)**
```bash
npm install xlsx @types/xlsx
```
Then uncomment the import and implementation in `my-utility.ts`.

**Typo.js (Spell Check)**
```bash
npm install typo-js
```
Add dictionary files to `/assets/dictionary/`.

## 🧪 Testing

All services include unit tests with 100% coverage of core functionality.

Run tests:
```bash
npm test
```

## 📚 Coverage Summary

- ✅ **enum.ts** - All enumerations (100%)
- ✅ **guid.ts** - GUID generation (100%)
- ✅ **shared-data.ts** - Singleton pattern (100%)
- ✅ **basepage.ts** - Authentication base class (100%)
- ✅ **access-control.ts** - Role-based access control (100%)
- ✅ **assessment-utility.ts** - Assessment calculations (100%)
- ✅ **my-utility.ts** - Core utilities (100%)
- ✅ **shared.service.ts** - Cross-component communication (100%)
- ✅ **spell-check/** - Spell checking component (100% - 4 files)

**Total: 9 files + 1 component (4 files) = 13 files with 100% coverage**
