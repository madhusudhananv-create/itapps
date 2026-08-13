import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import type {
  ExecutiveInsight,
  ExecutiveInsightRiskLevel,
} from '../../core/models/executive-insight.model';
import type { NeurealmNewsImpact } from '../../core/models/neurealm-news.model';
import { KeyInsightsEngineService } from '../../core/services/key-insights-engine.service';
import { NeurealmOpenAiInsightsService } from '../../core/services/neurealm-openai-insights.service';

@Component({
  selector: 'app-key-insights',
  standalone: true,
  imports: [DatePipe, Button, Card],
  templateUrl: './key-insights.component.html',
  styleUrl: './key-insights.component.scss',
})
export class KeyInsightsComponent {
  readonly engine = inject(KeyInsightsEngineService);
  readonly news = inject(NeurealmOpenAiInsightsService);
  readonly realtimeThemes = [
    'Finance',
    'Business',
    'IT',
    'Operations',
    'Supply Chain',
    'GTM',
    'Human Capital',
    'Revenue',
    'Legal',
    'Security',
  ];

  riskLevelRing(level: ExecutiveInsightRiskLevel): string {
    switch (level) {
      case 'High':
        return 'ring-rose-200/90 bg-rose-50/90 text-rose-900';
      case 'Medium':
        return 'ring-amber-200/90 bg-amber-50/90 text-amber-950';
      case 'Low':
        return 'ring-emerald-200/90 bg-emerald-50/90 text-emerald-950';
      default:
        return 'ring-slate-200 bg-slate-50 text-slate-800';
    }
  }

  categoryIcon(id: string): string {
    const map: Record<string, string> = {
      geopolitical: 'pi-globe',
      financial: 'pi-chart-line',
      business: 'pi-briefcase',
      people: 'pi-users',
      technical: 'pi-cog',
      security: 'pi-shield',
    };
    return map[id] ?? 'pi-bolt';
  }

  /** Full risk-type line for the card hero (Neurealm register). */
  riskTypeTitle(ins: ExecutiveInsight): string {
    const suffix = ins.title.toLowerCase().endsWith('risk') ? '' : ' risk';
    return `${ins.title}${suffix}`;
  }

  newsImpactClass(level: NeurealmNewsImpact): string {
    switch (level) {
      case 'High':
        return 'neurealm-news-impact--high';
      case 'Medium':
        return 'neurealm-news-impact--medium';
      case 'Low':
        return 'neurealm-news-impact--low';
      default:
        return 'neurealm-news-impact--low';
    }
  }

  textBullets(text: string): string[] {
    const normalized = text.trim();
    if (!normalized) return [];
    const explicitBullets = normalized
      .split(/\n+|(?:^|\s)[•*-]\s+/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (explicitBullets.length > 1) {
      return explicitBullets;
    }
    const sentenceBullets = normalized
      .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
      .map((line) => line.trim())
      .filter(Boolean);
    return sentenceBullets.length ? sentenceBullets : [normalized];
  }

  executiveBullets(text: string, max = 2): string[] {
    return this.textBullets(text)
      .map((line) => this.toExecutiveLine(line))
      .filter(Boolean)
      .slice(0, max);
  }

  executiveActions(actions: readonly string[]): string[] {
    return actions
      .map((line) => this.toExecutiveLine(line))
      .filter(Boolean)
      .slice(0, 2);
  }

  private toExecutiveLine(line: string): string {
    const cleaned = line
      .replace(/^\s*[•*-]\s*/, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (cleaned.length <= 110) return cleaned;
    return `${cleaned.slice(0, 107).replace(/[,\s;:]+$/, '')}...`;
  }

  selectRealtimeTheme(theme: string): void {
    this.news.setFocusTheme(theme);
  }

  realtimeCriticalityTone(index: number): string {
    return ['critical', 'high', 'elevated', 'guarded', 'watch'][index] ?? 'watch';
  }

  realtimeCriticalityLabel(index: number): string {
    return ['Most critical', 'High priority', 'Elevated', 'Guarded', 'Monitor'][index] ?? 'Monitor';
  }
}
