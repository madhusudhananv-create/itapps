import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { distinctUntilChanged, merge, startWith } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { Popover } from 'primeng/popover';
import { Select } from 'primeng/select';
import { Toast } from 'primeng/toast';
import {
  RiskRecord,
  type RiskLifecycleStatus,
  type RiskStrategyOption,
  RISK_LIFECYCLE_STATUSES,
  RISK_STRATEGY_OPTIONS,
} from '../../core/models/risk.model';
import {
  RISK_APPROVER_MAILBOX,
  RISK_APPROVER_OPTIONS,
  type RiskApproverRole,
} from '../../core/risk-approver.constants';
import {
  BUSINESS_UNIT_FUNCTION_OPTIONS,
  CIA_CONSEQUENCE_SCALE,
  LIKELIHOOD_VALUE_SCALE,
  RISK_CATEGORIES,
  RISK_LOG_LOCATION_OPTIONS,
  RISK_LOG_THREAT_OPTIONS,
  RISK_LOG_VULNERABILITY_OPTIONS,
  RISK_RATING_MATRIX_BAND_LABELS,
  type RiskRatingMatrixBand,
  riskRatingMatrixBandFromProduct,
} from '../../core/risk-rating.constants';
import { AuthService } from '../../core/auth.service';
import {
  ermSheet5RiskDescriptionDropdownOptions,
  ermSheet5RiskRemediationDropdownOptions,
  ermSheet5RowByDescription,
  mapErmSheetCategoryToRiskLog,
  suggestedTitleFromSheet5Description,
} from '../../core/data/erm-sheet5-scenarios';
import { RiskApprovalMailService } from '../../core/services/risk-approval-mail.service';
import { RiskService } from '../../core/services/risk.service';

/** Title-style name from login id (e.g. `a.b@co.com` → `A B`). */
function riskOwnerNameFromLogin(login: string): string {
  const t = login.trim();
  if (!t) return '';
  const at = t.indexOf('@');
  const local = at > 0 ? t.slice(0, at) : t;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
}

function riskOwnerEmailFromLogin(login: string): string {
  const t = login.trim();
  return t.includes('@') ? t : '';
}

/** Default "identified by" from sign-in: title-case name, else raw user id. */
function riskIdentifiedByDefaultFromLogin(login: string): string {
  const derived = riskOwnerNameFromLogin(login);
  if (derived) return derived;
  const t = login.trim();
  return t || 'Unknown user';
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(start: Date, days: number): Date {
  const x = new Date(start);
  x.setDate(x.getDate() + days);
  return x;
}

const DEFAULT_RISK_TITLE = 'Currency Exchange Volatility';
const DEFAULT_RISK_DESCRIPTION =
  'Currency Exchange Volatility: Significant fluctuations between the USD and INR affecting profitability of offshore delivery.';
const DEFAULT_RISK_REMEDIATION_PLAN =
  'Utilize forward contracts and hedging strategies; maintain a balanced mix of onshore and offshore billing.';
const RISK_TREATMENT_IMPLEMENTATION_STATUS_OPTIONS = [
  'TBD',
  'WIP',
  'Completed',
  'Deferred',
  'NA',
] as const;
const RISK_TREATMENT_EFFECTIVENESS_STATUS_OPTIONS = [
  'Pending verification',
  'Effective',
  'Partially effective',
  'Ineffective',
] as const;

/** When inherent exposure is set, residual exposure must not exceed it. */
function residualExposureNotAboveInherent(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const parent = control.parent;
    if (!parent) {
      return null;
    }
    const inhRaw = parent.get('inherentRiskExposureUsd')?.value;
    const resRaw = control.value;
    const inh =
      inhRaw === null || inhRaw === undefined || inhRaw === ''
        ? null
        : Number(inhRaw);
    const res =
      resRaw === null || resRaw === undefined || resRaw === ''
        ? null
        : Number(resRaw);
    if (inh == null || !Number.isFinite(inh)) {
      return null;
    }
    if (res == null || !Number.isFinite(res)) {
      return null;
    }
    if (res > inh) {
      return { residualExposureExceedsInherent: true };
    }
    return null;
  };
}

/** Residual (consequence × likelihood) must not exceed inherent product. */
function residualRiskRatingNotAboveInherent(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control as FormGroup;
    const c = group.get('consequence')?.value;
    const l = group.get('likelihood')?.value;
    const rc = group.get('residualConsequence')?.value;
    const rl = group.get('residualLikelihood')?.value;
    if (c == null || l == null || rc == null || rl == null) {
      return null;
    }
    const inherent = Number(c) * Number(l);
    const residual = Number(rc) * Number(rl);
    if (!Number.isFinite(inherent) || !Number.isFinite(residual)) {
      return null;
    }
    if (residual > inherent) {
      return { residualRatingExceedsInherent: true };
    }
    return null;
  };
}

function noDateBeforeToday(errorKey: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value;
    if (v == null || v === '') {
      return null;
    }
    const d = v instanceof Date ? new Date(v) : new Date(v);
    if (Number.isNaN(d.getTime())) {
      return { invalidDate: true };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cmp = new Date(d);
    cmp.setHours(0, 0, 0, 0);
    if (cmp < today) {
      return { [errorKey]: true };
    }
    return null;
  };
}

@Component({
  selector: 'app-risk-log',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgTemplateOutlet,
    RouterLink,
    Button,
    DatePicker,
    InputText,
    Popover,
    Select,
    Toast,
  ],
  templateUrl: './risk-log.component.html',
  styleUrl: './risk-log.component.scss',
  providers: [MessageService],
})
export class RiskLogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly risks = inject(RiskService);

  /** ERM Sheet5 risk narratives for the Risk description control. */
  readonly riskDescriptionPresetOptions = ermSheet5RiskDescriptionDropdownOptions();
  readonly riskRemediationPresetOptions = ermSheet5RiskRemediationDropdownOptions();

  private readonly router = inject(Router);
  private readonly approvalMail = inject(RiskApprovalMailService);
  private readonly messages = inject(MessageService);
  private readonly auth = inject(AuthService);

  readonly minCalendarDate = (() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  })();

  readonly categoryOptions = [...RISK_CATEGORIES].map((c) => ({
    label: c,
    value: c,
  }));
  readonly businessUnitFunctionOptions = [...BUSINESS_UNIT_FUNCTION_OPTIONS].map(
    (v) => ({ label: v, value: v })
  );
  readonly riskLifecycleOptions = [...RISK_LIFECYCLE_STATUSES].map((s) => ({
    label: s,
    value: s,
  }));
  readonly riskStrategyOptions = [...RISK_STRATEGY_OPTIONS].map((s) => ({
    label: s,
    value: s,
  }));
  readonly riskTreatmentImplementationStatusOptions = [
    ...RISK_TREATMENT_IMPLEMENTATION_STATUS_OPTIONS,
  ].map((s) => ({
    label: s,
    value: s,
  }));
  readonly riskTreatmentEffectivenessStatusOptions = [
    ...RISK_TREATMENT_EFFECTIVENESS_STATUS_OPTIONS,
  ].map((s) => ({
    label: s,
    value: s,
  }));

  readonly threatOptions = [...RISK_LOG_THREAT_OPTIONS].map((v) => ({
    label: v,
    value: v,
  }));
  readonly vulnerabilityOptions = [...RISK_LOG_VULNERABILITY_OPTIONS].map(
    (v) => ({ label: v, value: v })
  );
  readonly locationOptions = [...RISK_LOG_LOCATION_OPTIONS].map((v) => ({
    label: v,
    value: v,
  }));

  readonly riskApproverOptions = RISK_APPROVER_OPTIONS;

  readonly consequenceOptions = ([0, 1, 2, 3, 4, 5] as const).map((n) => ({
    label: `${CIA_CONSEQUENCE_SCALE[n].label} (${n})`,
    value: n,
    detail: CIA_CONSEQUENCE_SCALE[n].detail,
  }));

  readonly likelihoodOptions = ([0, 1, 2, 3, 4, 5] as const).map((n) => {
    const row = LIKELIHOOD_VALUE_SCALE[n];
    return {
      label: `${row.label} (${n})`,
      value: n,
      detail: `${row.guideline} ${row.probability} — ${row.frequency}`,
    };
  });

  readonly form = this.fb.nonNullable.group(
    {
      riskId: this.fb.nonNullable.control({ value: '', disabled: true }),
      title: [DEFAULT_RISK_TITLE, Validators.required],
      description: [DEFAULT_RISK_DESCRIPTION, Validators.required],
      businessImpact: ['', Validators.required],
      threat: [RISK_LOG_THREAT_OPTIONS[0], Validators.required],
      vulnerability: [RISK_LOG_VULNERABILITY_OPTIONS[0], Validators.required],
      location: [RISK_LOG_LOCATION_OPTIONS[0], Validators.required],
      riskRemediationPlan: [DEFAULT_RISK_REMEDIATION_PLAN, Validators.required],
      personResponsibleRiskTreatment: ['', Validators.required],
      riskTreatmentCompletionDate: [
        null as Date | null,
        [Validators.required, noDateBeforeToday('pastTreatmentCompletion')],
      ],
      riskTreatmentImplementationStatus: [
        RISK_TREATMENT_IMPLEMENTATION_STATUS_OPTIONS[0],
        Validators.required,
      ],
      riskTreatmentEffectivenessStatus: [
        RISK_TREATMENT_EFFECTIVENESS_STATUS_OPTIONS[0],
        Validators.required,
      ],
      riskTreatmentEffectivenessVerifiedBy: ['', Validators.required],
      riskTreatmentEffectivenessVerifiedDate: [
        null as Date | null,
        [Validators.required, noDateBeforeToday('pastTreatmentEffectivenessVerified')],
      ],
      riskTreatmentEffectivenessComments: [''],
      nextRiskAssessmentDate: [
        null as Date | null,
        [Validators.required, noDateBeforeToday('pastNextAssessment')],
      ],
      category: ['Financial', Validators.required],
      categoryOther: [''],
      businessUnitFunction: ['IT', Validators.required],
      owner: [
        riskOwnerNameFromLogin(this.auth.currentUserId()),
        Validators.required,
      ],
      ownerEmail: [
        riskOwnerEmailFromLogin(this.auth.currentUserId()),
        [Validators.required, Validators.email],
      ],
      riskApprover: ['Function Head' as RiskApproverRole, Validators.required],
      riskApproverName: ['', Validators.required],
      riskApproverEmail: ['', [Validators.required, Validators.email]],
      identificationDate: [
        null as Date | null,
        [Validators.required, noDateBeforeToday('pastIdentification')],
      ],
      riskIdentifiedBy: [
        riskIdentifiedByDefaultFromLogin(this.auth.currentUserId()),
        Validators.required,
      ],
      riskLifecycleStatus: ['Draft' as RiskLifecycleStatus, Validators.required],
      riskStrategy: ['Risk Reduction' as RiskStrategyOption, Validators.required],
      targetClosureDate: [
        null as Date | null,
        [Validators.required, noDateBeforeToday('pastClosure')],
      ],
      consequence: [5, Validators.required],
      likelihood: [5, Validators.required],
      inherentRiskExposureUsd: [0],
      inherentRating: [{ value: 0, disabled: true }],
      residualConsequence: [3, Validators.required],
      residualLikelihood: [4, Validators.required],
      residualRiskExposureUsd: [0, residualExposureNotAboveInherent()],
      residualRating: [{ value: 0, disabled: true }],
    },
    { validators: [residualRiskRatingNotAboveInherent()] }
  );

  ngOnInit(): void {
    const id = this.risks.generateRiskId();
    const rid = this.form.controls.riskId;
    rid.enable({ emitEvent: false });
    rid.patchValue(id, { emitEvent: false });
    rid.disable({ emitEvent: false });

    const today = startOfDay(new Date());
    const closure = addDays(today, 15);
    const nextAssessment = addDays(today, 90);
    const login = this.auth.currentUserId();
    this.form.patchValue(
      {
        identificationDate: today,
        targetClosureDate: closure,
        riskTreatmentCompletionDate: closure,
        riskTreatmentEffectivenessVerifiedDate: closure,
        nextRiskAssessmentDate: nextAssessment,
        riskIdentifiedBy: riskIdentifiedByDefaultFromLogin(login),
        owner: riskOwnerNameFromLogin(login),
        ownerEmail: riskOwnerEmailFromLogin(login),
      },
      { emitEvent: false }
    );
    const c = this.form.controls.consequence.value;
    const l = this.form.controls.likelihood.value;
    if (c != null && l != null) {
      this.form.controls.inherentRating.patchValue(Number(c) * Number(l), {
        emitEvent: false,
      });
    }
    const rc = this.form.controls.residualConsequence.value;
    const rl = this.form.controls.residualLikelihood.value;
    if (rc != null && rl != null) {
      this.form.controls.residualRating.patchValue(Number(rc) * Number(rl), {
        emitEvent: false,
      });
    }
    this.form.updateValueAndValidity({ emitEvent: false });

    this.form.controls.category.valueChanges
      .pipe(startWith(this.form.controls.category.value))
      .subscribe((cat) => {
        const other = this.form.controls.categoryOther;
        if (cat === 'Other') {
          other.setValidators([
            Validators.required,
            Validators.pattern(/\S/),
          ]);
        } else {
          other.clearValidators();
          other.setValue('', { emitEvent: false });
        }
        other.updateValueAndValidity({ emitEvent: false });
      });

    merge(
      this.form.controls.consequence.valueChanges,
      this.form.controls.likelihood.valueChanges
    ).subscribe(() => {
      const c = this.form.controls.consequence.value;
      const l = this.form.controls.likelihood.value;
      const rating =
        c != null && l != null ? Number(c) * Number(l) : 0;
      this.form.controls.inherentRating.patchValue(rating, { emitEvent: false });
      this.form.updateValueAndValidity({ emitEvent: false });
    });

    merge(
      this.form.controls.residualConsequence.valueChanges,
      this.form.controls.residualLikelihood.valueChanges
    ).subscribe(() => {
      const c = this.form.controls.residualConsequence.value;
      const l = this.form.controls.residualLikelihood.value;
      const rating =
        c != null && l != null ? Number(c) * Number(l) : 0;
      this.form.controls.residualRating.patchValue(rating, { emitEvent: false });
      this.form.updateValueAndValidity({ emitEvent: false });
    });

    this.form.controls.inherentRiskExposureUsd.valueChanges.subscribe(() => {
      this.form.controls.residualRiskExposureUsd.updateValueAndValidity({
        emitEvent: false,
      });
    });

    this.form.controls.description.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((text) => {
        const row = ermSheet5RowByDescription(String(text ?? ''));
        if (!row) {
          return;
        }
        const { category, categoryOther } = mapErmSheetCategoryToRiskLog(
          row.category
        );
        const title = suggestedTitleFromSheet5Description(row.description);
        this.form.patchValue(
          {
            category,
            categoryOther,
            riskRemediationPlan: row.remediation,
            title,
          },
          { emitEvent: true }
        );
      });
  }

  get inherentMatrixBand(): RiskRatingMatrixBand {
    const v = this.form.controls.inherentRating.value as number;
    return riskRatingMatrixBandFromProduct(Number(v));
  }

  get residualMatrixBand(): RiskRatingMatrixBand {
    const v = this.form.controls.residualRating.value as number;
    return riskRatingMatrixBandFromProduct(Number(v));
  }

  matrixBandLabel(band: RiskRatingMatrixBand): string {
    return RISK_RATING_MATRIX_BAND_LABELS[band];
  }

  scoreToneClass(value: unknown): string {
    const n = Number(value);
    if (!Number.isFinite(n)) {
      return '';
    }
    if (n <= 1) {
      return 'risk-log-scale-select--green';
    }
    if (n <= 3) {
      return 'risk-log-scale-select--amber';
    }
    return 'risk-log-scale-select--red';
  }

  /** Numeric rating for display (0 is valid; only null/undefined shows em dash). */
  ratingNumberText(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    const n = Number(value);
    return Number.isFinite(n) ? String(n) : '—';
  }

  /** Upper bound for treatment/residual $ exposure when inherent $ is set. */
  get inherentRiskExposureMax(): number | undefined {
    const v = this.form.controls.inherentRiskExposureUsd.value as unknown;
    if (v === null || v === undefined || v === '') {
      return undefined;
    }
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }

  saveDraft(): void {
    const raw = this.form.getRawValue();
    const row = this.buildRiskRecord(raw, { forceDraft: true });
    this.risks.upsertRisk(row);
    this.messages.add({
      severity: 'success',
      summary: 'Draft',
      detail: 'Risk saved as draft successfully',
      life: 4500,
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const row = this.buildRiskRecord(raw, { forceDraft: false });
    this.risks.upsertRisk(row);
    this.approvalMail.sendApprovalRequest({
      approverRole: row.riskApprover,
      risk: {
        id: row.id,
        title: row.title,
        owner: row.owner,
        ownerEmail: row.ownerEmail,
        businessUnit: row.businessUnit,
        riskIdentifiedBy: row.riskIdentifiedBy,
        riskApprover: row.riskApprover,
        riskApproverName: row.riskApproverName,
        riskApproverEmail: row.riskApproverEmail,
      },
    });
    this.messages.add({
      severity: 'success',
      summary: 'Risk submitted',
      detail: 'Risk has been submitted successfully to the risk approver.',
      life: 5500,
    });
    setTimeout(() => {
      void this.router.navigate(['/dashboard']);
    }, 2000);
  }

  private parseUsdValue(v: unknown): number | null {
    if (v === null || v === undefined || v === '') {
      return null;
    }
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  private buildRiskRecord(
    raw: ReturnType<typeof this.form.getRawValue>,
    opts: { forceDraft: boolean }
  ): RiskRecord {
    const draft = opts.forceDraft;
    const num = (v: unknown): number => {
      if (v === null || v === undefined || v === '') {
        return 0;
      }
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };
    const toDate = (v: unknown, fallback: Date): Date => {
      if (v instanceof Date && !Number.isNaN(v.getTime())) {
        return v;
      }
      if (v === null || v === undefined || v === '') {
        return fallback;
      }
      const d = new Date(v as string | number | Date);
      return Number.isNaN(d.getTime()) ? fallback : d;
    };

    const idDt = draft
      ? toDate(raw.identificationDate, this.minCalendarDate)
      : raw.identificationDate instanceof Date
        ? raw.identificationDate
        : new Date(raw.identificationDate as unknown as string);
    const closureDt = draft
      ? toDate(raw.targetClosureDate, this.minCalendarDate)
      : raw.targetClosureDate instanceof Date
        ? raw.targetClosureDate
        : new Date(raw.targetClosureDate as unknown as string);

    const nextAssessmentDt = draft
      ? toDate(raw.nextRiskAssessmentDate, addDays(this.minCalendarDate, 90))
      : raw.nextRiskAssessmentDate instanceof Date
        ? raw.nextRiskAssessmentDate
        : new Date(raw.nextRiskAssessmentDate as unknown as string);

    const treatmentCompletionDt = draft
      ? toDate(raw.riskTreatmentCompletionDate, this.minCalendarDate)
      : raw.riskTreatmentCompletionDate instanceof Date
        ? raw.riskTreatmentCompletionDate
        : new Date(raw.riskTreatmentCompletionDate as unknown as string);

    const treatmentEffectivenessVerifiedDt = draft
      ? toDate(raw.riskTreatmentEffectivenessVerifiedDate, this.minCalendarDate)
      : raw.riskTreatmentEffectivenessVerifiedDate instanceof Date
        ? raw.riskTreatmentEffectivenessVerifiedDate
        : new Date(raw.riskTreatmentEffectivenessVerifiedDate as unknown as string);

    const cQ = num(raw.consequence);
    const lQ = num(raw.likelihood);
    const rcQ = num(raw.residualConsequence);
    const rlQ = num(raw.residualLikelihood);
    const inherent = cQ * lQ;
    const residual = rcQ * rlQ;
    const controlEffectiveness =
      inherent > 0
        ? Math.min(
            100,
            Math.max(0, Math.round(100 * (1 - residual / inherent)))
          )
        : 0;

    const riskApprover = (
      raw.riskApprover && String(raw.riskApprover).trim()
        ? raw.riskApprover
        : RISK_APPROVER_OPTIONS[0].value
    ) as RiskApproverRole;

    const riskStrategy = (
      raw.riskStrategy && String(raw.riskStrategy).trim()
        ? raw.riskStrategy
        : RISK_STRATEGY_OPTIONS[0]
    ) as RiskStrategyOption;

    const lifecycle: RiskLifecycleStatus = draft
      ? 'Draft'
      : raw.riskLifecycleStatus;

    const registerStatus: RiskRecord['status'] =
      lifecycle === 'Closed' ? 'closed' : 'open';

    const buFn =
      (raw.businessUnitFunction || '').trim() || 'IT';

    let category: string;
    if (raw.category === 'Other') {
      category = draft
        ? raw.categoryOther.trim() || 'Draft'
        : raw.categoryOther.trim();
    } else {
      category = (raw.category || '').trim();
      if (!category && draft) {
        category = RISK_CATEGORIES[0];
      }
    }

    const title = draft
      ? raw.title.trim() || 'Untitled draft'
      : raw.title.trim();
    const description = raw.description.trim();
    const businessImpact = draft
      ? raw.businessImpact.trim() || 'Draft — business impact to be defined'
      : raw.businessImpact.trim();

    const threat = (raw.threat || '').trim() || RISK_LOG_THREAT_OPTIONS[0];
    const vulnerability =
      (raw.vulnerability || '').trim() || RISK_LOG_VULNERABILITY_OPTIONS[0];
    const location =
      (raw.location || '').trim() || RISK_LOG_LOCATION_OPTIONS[0];
    const riskRemediationPlan = draft
      ? raw.riskRemediationPlan.trim() || 'Draft — remediation to be defined'
      : raw.riskRemediationPlan.trim();
    const personResponsibleRiskTreatment = draft
      ? raw.personResponsibleRiskTreatment.trim() || 'Unassigned'
      : raw.personResponsibleRiskTreatment.trim();

    return {
      id: raw.riskId,
      title,
      description,
      businessImpact,
      threat,
      vulnerability,
      location,
      riskRemediationPlan,
      personResponsibleRiskTreatment,
      riskTreatmentCompletionDate: treatmentCompletionDt.toISOString().slice(0, 10),
      riskTreatmentImplementationStatus:
        raw.riskTreatmentImplementationStatus ||
        RISK_TREATMENT_IMPLEMENTATION_STATUS_OPTIONS[0],
      riskTreatmentEffectivenessStatus:
        raw.riskTreatmentEffectivenessStatus ||
        RISK_TREATMENT_EFFECTIVENESS_STATUS_OPTIONS[0],
      riskTreatmentEffectivenessVerifiedBy: draft
        ? raw.riskTreatmentEffectivenessVerifiedBy.trim() || 'Unassigned'
        : raw.riskTreatmentEffectivenessVerifiedBy.trim(),
      riskTreatmentEffectivenessVerifiedDate: treatmentEffectivenessVerifiedDt
        .toISOString()
        .slice(0, 10),
      riskTreatmentEffectivenessComments:
        raw.riskTreatmentEffectivenessComments.trim(),
      category: category || RISK_CATEGORIES[0],
      businessUnit: buFn,
      account: 'N/A',
      treatment: riskRemediationPlan,
      consequence: cQ,
      likelihood: lQ,
      inherentRiskExposureUsd: this.parseUsdValue(raw.inherentRiskExposureUsd),
      inherentRating: inherent,
      residualConsequence: rcQ,
      residualLikelihood: rlQ,
      residualRiskExposureUsd: this.parseUsdValue(raw.residualRiskExposureUsd),
      residualRating: residual,
      identificationDate: idDt.toISOString().slice(0, 10),
      riskIdentifiedBy:
        raw.riskIdentifiedBy.trim() ||
        riskIdentifiedByDefaultFromLogin(this.auth.currentUserId()),
      owner: draft ? raw.owner.trim() || 'Unassigned' : raw.owner.trim(),
      ownerEmail: draft
        ? raw.ownerEmail.trim() || ''
        : raw.ownerEmail.trim(),
      riskApprover,
      riskApproverName: draft
        ? raw.riskApproverName.trim() || ''
        : raw.riskApproverName.trim(),
      riskApproverEmail: draft
        ? raw.riskApproverEmail.trim() || ''
        : raw.riskApproverEmail.trim(),
      status: registerStatus,
      riskLifecycleStatus: lifecycle,
      riskStrategy,
      targetClosureDate: closureDt.toISOString().slice(0, 10),
      nextRiskAssessmentDate: nextAssessmentDt.toISOString().slice(0, 10),
      orgFunction: buFn,
      controlEffectiveness,
      loggedAt: new Date().toISOString(),
    };
  }

  cancel(): void {
    void this.router.navigate(['/dashboard']);
  }
}
