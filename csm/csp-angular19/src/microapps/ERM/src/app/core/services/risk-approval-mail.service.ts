import { Injectable } from '@angular/core';
import { RiskApproverRole, RISK_APPROVER_MAILBOX } from '../risk-approver.constants';
import { RiskRecord } from '../models/risk.model';

export interface RiskApprovalMailPayload {
  approverRole: RiskApproverRole;
  risk: Pick<
    RiskRecord,
    | 'id'
    | 'title'
    | 'owner'
    | 'ownerEmail'
    | 'businessUnit'
    | 'riskIdentifiedBy'
    | 'riskApprover'
    | 'riskApproverName'
    | 'riskApproverEmail'
  >;
}

/**
 * Queues approval notification to the mailbox mapped for the selected {@link RiskApproverRole}.
 * Logs in the browser for demos; replace the body with `HttpClient.post('/api/erm/notify-approver', …)`.
 */
@Injectable({ providedIn: 'root' })
export class RiskApprovalMailService {
  sendApprovalRequest(payload: RiskApprovalMailPayload): void {
    const to = RISK_APPROVER_MAILBOX[payload.approverRole];
    const subject = `[ERP] Risk approval required — ${payload.risk.id}`;
    const text = [
      `A new risk has been submitted and requires your approval as ${payload.approverRole}.`,
      '',
      `Risk ID: ${payload.risk.id}`,
      `Title: ${payload.risk.title}`,
      `Business unit: ${payload.risk.businessUnit}`,
      `Risk identified by: ${payload.risk.riskIdentifiedBy || '—'}`,
      `Risk owner: ${payload.risk.owner}`,
      `Risk owner email: ${payload.risk.ownerEmail || '—'}`,
      `Risk approver role: ${payload.risk.riskApprover}`,
      `Risk approver name: ${payload.risk.riskApproverName || '—'}`,
      `Risk approver email: ${payload.risk.riskApproverEmail || '—'}`,
      '',
      `Open Neurealm's ERP workspace to review and approve.`,
    ].join('\n');

    console.info('[ERP] Approval email queued', { to, subject, preview: text.slice(0, 120) });
  }

  resolveMailbox(role: RiskApproverRole): string {
    return RISK_APPROVER_MAILBOX[role];
  }
}
