import { TechnologyDomain } from '../models/maturity.model';

export type NotificationSeverity = 'info' | 'warning' | 'critical';

export interface NotificationItem {
  domainId: string;
  domainName: string;
  message: string;
  severity: NotificationSeverity;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const REVIEW_REMINDER_1_DAYS = 3;
const REVIEW_REMINDER_2_DAYS = 7;
const DRAFT_WARN_DAYS = 15;
const DRAFT_CRITICAL_DAYS = 30;
const NO_UPDATE_DAYS = 30;

function daysSince(iso?: string): number {
  if (!iso) return 0;
  return Math.floor((Date.now() - new Date(iso).getTime()) / DAY_MS);
}

/**
 * Client-side equivalent of the BRD's Notifications section: since this
 * build has no backend/email delivery, these are surfaced in-app as a bell
 * dropdown instead of dispatched notifications.
 */
export function computeNotifications(domains: TechnologyDomain[], allowedDomainIds: Set<string>): NotificationItem[] {
  const items: NotificationItem[] = [];

  for (const domain of domains) {
    if (!allowedDomainIds.has(domain.id)) continue;
    const idle = daysSince(domain.lastUpdated);

    if (domain.status === 'Pending Review') {
      if (idle >= REVIEW_REMINDER_2_DAYS) {
        items.push({
          domainId: domain.id,
          domainName: domain.name,
          message: `Review still pending after ${idle} days - escalate to BU Head.`,
          severity: 'critical',
        });
      } else if (idle >= REVIEW_REMINDER_1_DAYS) {
        items.push({
          domainId: domain.id,
          domainName: domain.name,
          message: `Reminder: assessment has been awaiting review for ${idle} days.`,
          severity: 'warning',
        });
      }
    }

    if (domain.status === 'Draft' || domain.status === 'In Progress') {
      if (idle > DRAFT_CRITICAL_DAYS) {
        items.push({
          domainId: domain.id,
          domainName: domain.name,
          message: `Draft has been open for ${idle} days - escalate to HOD.`,
          severity: 'critical',
        });
      } else if (idle > DRAFT_WARN_DAYS) {
        items.push({
          domainId: domain.id,
          domainName: domain.name,
          message: `Draft has been open for ${idle} days without submission.`,
          severity: 'warning',
        });
      }
    }

    if (idle > NO_UPDATE_DAYS && domain.status !== 'Approved') {
      items.push({
        domainId: domain.id,
        domainName: domain.name,
        message: `No management update in ${idle} days.`,
        severity: 'info',
      });
    }

    for (const param of domain.parameters) {
      if (
        param.findingStatus === 'Accepted' &&
        param.findingTargetDate &&
        new Date(param.findingTargetDate).getTime() < Date.now()
      ) {
        items.push({
          domainId: domain.id,
          domainName: domain.name,
          message: `Finding "${param.name}" is past its target date.`,
          severity: 'critical',
        });
      }
      if (param.findingRetargetStatus === 'Requested') {
        items.push({
          domainId: domain.id,
          domainName: domain.name,
          message: `Retarget request pending your approval for "${param.name}".`,
          severity: 'warning',
        });
      }
    }
  }

  const severityRank: Record<NotificationSeverity, number> = { critical: 0, warning: 1, info: 2 };
  return items.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
}
