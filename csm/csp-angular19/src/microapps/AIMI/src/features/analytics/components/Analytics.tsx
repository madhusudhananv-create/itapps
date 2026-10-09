import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Alert,
  Box,
  Breadcrumbs,
  ButtonBase,
  Button,
  CircularProgress,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useAuth } from '@auth/hooks/useAuth';
import { downloadCSV } from '@reports/utils/csvExportUtils';
import {
  analyticsService,
  EMPTY_SERIES,
} from '../services/analyticsService';
import type {
  AnalyticsFilters,
  AnalyticsLevel,
  AnalyticsResult,
  ScoreSeries,
} from '../services/analyticsService';
import {
  buildMonthAxis,
  computeStats,
  currentMonthKey,
  formatGrowth,
  formatScore,
  isDrop,
  monthLabel,
} from '../utils/scoreStats';
import { TrendChart } from './TrendChart';
import { FilterDialog } from './FilterDialog';

// AIMI Analytics (admin only): current / accepted / previous score, growth and the monthly
// trend, read from the stored score history. BU -> Account -> Project -> Practice drill-down.

const GOOD = '#1a7f37';
const BAD = '#c9302c';
const MUTED = 'text.secondary';
const HISTORY_MONTHS = 24;

interface DimConfig {
  level: AnalyticsLevel;
  label: string;
  noun: string;
  description: string;
}

const DIMS: DimConfig[] = [
  {
    level: 'BU',
    label: 'Business Unit',
    noun: 'business units',
    description: 'Compare maturity across business units.',
  },
  {
    level: 'ACCOUNT',
    label: 'Account',
    noun: 'accounts',
    description: 'See how each customer account is progressing.',
  },
  {
    level: 'PROJECT',
    label: 'Project',
    noun: 'projects',
    description: 'Track individual projects over time.',
  },
  {
    level: 'PRACTICE',
    label: 'Practice',
    noun: 'practices',
    description: 'Compare practices side by side.',
  },
];

const CHAINS: Record<AnalyticsLevel, AnalyticsLevel[]> = {
  BU: ['BU', 'ACCOUNT', 'PROJECT', 'PRACTICE'],
  ACCOUNT: ['ACCOUNT', 'PROJECT', 'PRACTICE'],
  PROJECT: ['PROJECT', 'PRACTICE'],
  PRACTICE: ['PRACTICE'],
};

const LEVEL_LABEL: Record<AnalyticsLevel, string> = {
  BU: 'Business unit',
  ACCOUNT: 'Account',
  PROJECT: 'Project',
  PRACTICE: 'Practice',
};

const FILTER_KEY: Record<AnalyticsLevel, keyof AnalyticsFilters> = {
  BU: 'businessUnits',
  ACCOUNT: 'accounts',
  PROJECT: 'projects',
  PRACTICE: 'practices',
};

interface PathStep {
  level: AnalyticsLevel;
  value: string;
}

const card = {
  bgcolor: '#fff',
  borderRadius: '18px',
  boxShadow: '0 1px 2px rgba(0,0,0,.04), 0 6px 24px rgba(0,0,0,.05)',
} as const;

const Sparkline = ({ series, months }: { series: ScoreSeries; months: string[] }) => {
  const by = new Map(series.points.map((p) => [p.month, p.current]));
  const vals = months.map((m) => by.get(m) ?? null);
  const nums = vals.filter((v): v is number => v !== null);
  if (nums.length < 2) return <Typography variant="caption" color={MUTED}>–</Typography>;
  const w = 84;
  const h = 26;
  const p = 3;
  const mn = Math.min(...nums);
  const mx = Math.max(...nums);
  const pts = vals
    .map((v, i) =>
      v === null
        ? null
        : [
            p + (i * (w - 2 * p)) / Math.max(1, vals.length - 1),
            h - p - ((v - mn) / (mx - mn || 1)) * (h - 2 * p),
          ]
    )
    .filter((q): q is number[] => q !== null);
  const end = pts[pts.length - 1];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <polyline
        points={pts.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ')}
        fill="none"
        stroke="#0066FF"
        strokeWidth={1.8}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={end[0]} cy={end[1]} r={2.4} fill="#0066FF" />
    </svg>
  );
};

const GrowthPill = ({ growth }: { growth: number | null }) => {
  const drop = isDrop(growth);
  const up = growth !== null && growth > 0.005;
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        px: 1.1,
        py: 0.2,
        borderRadius: '999px',
        fontSize: '0.8rem',
        fontWeight: 600,
        fontVariantNumeric: 'tabular-nums',
        color: drop ? BAD : up ? GOOD : 'text.secondary',
        bgcolor: drop ? '#fdecea' : up ? '#e6f4ea' : '#efeff2',
      }}
    >
      {drop ? '▼ ' : up ? '▲ ' : ''}
      {formatGrowth(growth)}
    </Box>
  );
};

const Tile = ({
  label,
  value,
  unit,
  sub,
  color,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  sub: string;
  color?: string;
}) => (
  <Paper elevation={0} sx={{ ...card, p: 2.25, minWidth: 0 }}>
    <Typography
      variant="caption"
      sx={{ textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, color: MUTED }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        fontSize: '2.1rem',
        fontWeight: 700,
        letterSpacing: '-.025em',
        lineHeight: 1.15,
        mt: 0.5,
        color: color ?? 'text.primary',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value}
      {unit && (
        <Typography component="span" sx={{ fontSize: '0.95rem', color: MUTED, fontWeight: 500, ml: 0.5 }}>
          {unit}
        </Typography>
      )}
    </Typography>
    <Typography variant="body2" color={MUTED} sx={{ mt: 0.5 }}>
      {sub}
    </Typography>
  </Paper>
);

const toCsvCell = (v: string | number | null) => {
  const s = v === null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const Analytics = () => {
  const { isAdmin } = useAuth();

  const [options, setOptions] = useState<Record<AnalyticsLevel, string[]> | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [dim, setDim] = useState<AnalyticsLevel | null>(null);
  const [sel, setSel] = useState<string[]>([]);
  const [path, setPath] = useState<PathStep[]>([]);
  const [range, setRange] = useState<6 | 12 | 24>(12);
  const [dialogDim, setDialogDim] = useState<AnalyticsLevel | null>(null);
  const [result, setResult] = useState<AnalyticsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    analyticsService
      .getFilterOptions()
      .then((o) => !cancelled && setOptions(o))
      .catch((e: unknown) =>
        !cancelled &&
        setOptionsError(e instanceof Error ? e.message : 'Could not load filters.')
      );
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const level: AnalyticsLevel | null = dim ? CHAINS[dim][path.length] : null;
  const nextLevel: AnalyticsLevel | null = dim ? CHAINS[dim][path.length + 1] ?? null : null;

  // Filters sent to the API: the applied selection, narrowed by each drill-down step.
  const filters = useMemo<AnalyticsFilters | null>(() => {
    if (!dim || !options) return null;
    const f: AnalyticsFilters = { businessUnits: [], accounts: [], projects: [], practices: [] };
    f[FILTER_KEY[dim]] = sel.length === options[dim].length ? [] : sel;
    path.forEach((p) => {
      f[FILTER_KEY[p.level]] = [p.value];
    });
    return f;
  }, [dim, sel, path, options]);

  useEffect(() => {
    if (!level || !filters) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    analyticsService
      .getScoreAnalytics(level, HISTORY_MONTHS, filters)
      .then((r) => !cancelled && setResult(r))
      .catch((e: unknown) =>
        !cancelled &&
        setError(e instanceof Error ? e.message : 'Could not load score history.')
      )
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [level, filters]);

  const months = useMemo(() => buildMonthAxis(range, currentMonthKey()), [range]);

  if (!isAdmin) {
    return (
      <Paper elevation={0} sx={{ ...card, p: 6, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={650} gutterBottom>
          AIMI Analytics is for administrators
        </Typography>
        <Typography color={MUTED}>
          Ask a CSM Platform admin for access.
        </Typography>
      </Paper>
    );
  }

  const dimConfig = DIMS.find((d) => d.level === dim);
  const openFilter = (l: AnalyticsLevel) => {
    setDialogDim(l);
  };

  const applyFilter = (l: AnalyticsLevel, values: string[]) => {
    setDialogDim(null);
    setDim(l);
    setSel(values);
    setPath([]);
    setResult(null);
  };

  const goTo = (depth: number) => {
    setPath((p) => p.slice(0, depth));
  };

  const drill = (name: string) => {
    if (!level || !nextLevel) return;
    setPath((p) => [...p, { level, value: name }]);
    window.scrollTo(0, 0);
  };

  // Detailed report from the API (usp_AIMI_GetScoreReport) for exactly what the dashboard is
  // showing: same view, selection, drill-down and history range.
  const downloadReport = async () => {
    if (!filters || !level || downloading) return;
    setDownloading(true);
    setError(null);
    try {
      const report = await analyticsService.getScoreReport(level, range, filters);
      if (report.rows.length === 0) {
        setError('There is no score history to download for this selection.');
        return;
      }
      // Columns, titles and order all come from the database; nothing is named here.
      const lines = [
        report.columns,
        ...report.rows.map((r) => report.columns.map((c) => r[c] ?? null)),
      ];
      const csv = lines.map((r) => r.map(toCsvCell).join(',')).join('\r\n');
      const today = new Date().toISOString().slice(0, 10);
      downloadCSV(csv, `AIMI_${LEVEL_LABEL[level].replace(' ', '')}_Score_Report_${today}.csv`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not download the report.');
    } finally {
      setDownloading(false);
    }
  };

  // ---------------- landing ----------------
  if (!dim) {
    return (
      <Box>
        <Typography sx={{ fontSize: { xs: '1.7rem', md: '2.2rem' }, fontWeight: 700, letterSpacing: '-.025em', lineHeight: 1.1, mb: 1 }}>
          How would you like to look at AI maturity?
        </Typography>
        <Typography sx={{ color: MUTED, fontSize: '1.05rem', mb: 3.5, maxWidth: 620 }}>
          Pick a view. You will choose what to include, then see the score, how it moved since the last snapshot, and the trend behind it.
        </Typography>
        {optionsError && <Alert severity="error" sx={{ mb: 2 }}>{optionsError}</Alert>}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
          {DIMS.map((d) => (
            <ButtonBase
              key={d.level}
              disabled={!options}
              onClick={() => openFilter(d.level)}
              sx={{
                ...card,
                p: 2.5,
                minHeight: 150,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                textAlign: 'left',
                border: '1px solid #e4e4e8',
                transition: 'transform .15s, border-color .15s',
                '&:hover': { transform: 'translateY(-2px)', borderColor: '#0066FF' },
              }}
            >
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, color: MUTED }}>
                View by
              </Typography>
              <Typography sx={{ fontSize: '1.3rem', fontWeight: 650, letterSpacing: '-.015em', mb: 0.5 }}>
                {d.label}
              </Typography>
              <Typography variant="body2" color={MUTED} sx={{ mb: 'auto' }}>
                {d.description}
              </Typography>
              <Typography variant="body2" sx={{ color: '#0066FF', fontWeight: 500, mt: 1.5 }}>
                {options ? `${options[d.level].length} ${d.noun}` : 'Loading…'}
              </Typography>
            </ButtonBase>
          ))}
        </Box>
        <Typography variant="body2" color={MUTED} sx={{ mt: 2.5 }}>
          Scores are saved as a monthly snapshot, so every month stays comparable.
        </Typography>
        {dialogDim && options && (
          <FilterDialog
            key={dialogDim}
            open
            noun={DIMS.find((d) => d.level === dialogDim)?.noun ?? ''}
            options={options[dialogDim]}
            selected={options[dialogDim]}
            onApply={(v) => applyFilter(dialogDim, v)}
            onCancel={() => setDialogDim(null)}
          />
        )}
      </Box>
    );
  }

  // ---------------- results ----------------
  const total = result?.total ?? EMPTY_SERIES;
  const stats = computeStats(total);
  const drop = isDrop(stats.growth);
  const allSelected = !!options && sel.length === options[dim].length;
  const selectedNoun = `${LEVEL_LABEL[dim]}${sel.length === 1 ? '' : 's'}`;
  const selectionText =
    allSelected && sel.length > 1
      ? `All ${sel.length} ${selectedNoun} selected`
      : `${sel.length} ${selectedNoun} selected`;
  const changeDim = dialogDim ?? dim;

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, alignItems: 'center' }}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={dim}
            onChange={(_, v: AnalyticsLevel | null) => v && openFilter(v)}
            aria-label="View by"
            sx={{ bgcolor: '#e4e4e8', p: '2px', borderRadius: '10px', '& .MuiToggleButton-root': { border: 0, borderRadius: '8px !important', textTransform: 'none', px: 1.75, py: 0.5, color: MUTED, fontWeight: 500, '&.Mui-selected': { bgcolor: '#fff', color: 'text.primary', '&:hover': { bgcolor: '#fff' } } } }}
          >
            {DIMS.map((d) => (
              <ToggleButton key={d.level} value={d.level} onClick={() => d.level === dim && openFilter(d.level)}>
                {d.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          
        </Box>
        <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={range}
            onChange={(_, v: 6 | 12 | 24 | null) => v && setRange(v)}
            aria-label="History range"
            sx={{ bgcolor: '#e4e4e8', p: '2px', borderRadius: '10px', '& .MuiToggleButton-root': { border: 0, borderRadius: '8px !important', textTransform: 'none', px: 1.5, py: 0.5, color: MUTED, fontWeight: 500, '&.Mui-selected': { bgcolor: '#fff', color: 'text.primary', '&:hover': { bgcolor: '#fff' } } } }}
          >
            <ToggleButton value={6}>6M</ToggleButton>
            <ToggleButton value={12}>12M</ToggleButton>
            <ToggleButton value={24}>24M</ToggleButton>
          </ToggleButtonGroup>
          <Button variant="contained" disableElevation disabled={!result || loading || downloading} onClick={downloadReport} sx={{ borderRadius: '999px', py: 0.75, px: 2.25, fontSize: '0.9rem' }}>
            {downloading ? 'Preparing…' : 'Download report'}
          </Button>
        </Box>
      </Box>

      <Breadcrumbs separator="›" aria-label="Drill-down path" sx={{ mb: 0.25, fontSize: '1.4rem', '& .MuiBreadcrumbs-separator': { fontSize: '1.4rem' } }}>
        {path.length === 0 ? (
          <Typography fontSize="inherit" fontWeight={700} letterSpacing="-.02em">{dimConfig?.label}</Typography>
        ) : (
          <Link component="button" underline="hover" fontSize="inherit" onClick={() => goTo(0)}>
            {dimConfig?.label}
          </Link>
        )}
        {path.map((p, i) =>
          i === path.length - 1 ? (
            <Typography key={i} fontSize="inherit" fontWeight={700} letterSpacing="-.02em">{p.value}</Typography>
          ) : (
            <Link key={i} component="button" underline="hover" fontSize="inherit" onClick={() => goTo(i + 1)}>
              {p.value}
            </Link>
          )
        )}
      </Breadcrumbs>
      <Typography sx={{ fontSize: '0.85rem', color: MUTED, mb: 2.25 }}>
        {selectionText}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ position: 'relative', opacity: loading ? 0.55 : 1, transition: 'opacity .15s' }}>
        {loading && <CircularProgress size={26} sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }} />}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1.5, mb: 1.5 }}>
          <Tile
            label="Current score"
            value={formatScore(stats.current)}
            unit="/5"
            color={drop ? BAD : undefined}
            sub={stats.month ? monthLabel(stats.month, true) : 'No snapshot yet'}
          />
          <Tile
            label="Accepted score"
            value={formatScore(stats.accepted)}
            unit={stats.accepted === null ? undefined : '/5'}
            sub={stats.accepted === null ? 'Not reviewed yet' : 'Reviewed and approved'}
          />
          <Tile
            label="Previous score"
            value={formatScore(stats.previous)}
            unit={stats.previous === null ? undefined : '/5'}
            sub={stats.previousMonth ? monthLabel(stats.previousMonth, true) : 'No earlier snapshot'}
          />
          <Tile
            label="Growth"
            value={
              stats.growth === null ? '–' : (
                <>
                  {drop ? '▼ ' : stats.growth > 0.005 ? '▲ ' : ''}
                  {formatGrowth(stats.growth).replace('%', '')}
                  <Typography component="span" sx={{ fontSize: '0.95rem', color: MUTED, fontWeight: 500, ml: 0.5 }}>%</Typography>
                </>
              )
            }
            color={drop ? BAD : stats.growth !== null && stats.growth > 0.005 ? GOOD : undefined}
            sub={drop ? 'Score dropped since previous' : 'vs previous snapshot'}
          />
        </Box>

        <Paper elevation={0} sx={{ ...card, p: 2.25, mb: 1.5 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="h6" fontWeight={650} fontSize="1.05rem">Monthly score trend</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, fontSize: '0.78rem', color: MUTED, alignItems: 'center' }}>
              <span><Box component="i" sx={{ display: 'inline-block', width: 16, borderTop: '2.5px solid #0066FF', verticalAlign: 'middle', mr: 0.75 }} />Current</span>
              <span><Box component="i" sx={{ display: 'inline-block', width: 16, borderTop: '2px dashed #6e6e73', verticalAlign: 'middle', mr: 0.75 }} />Accepted</span>
              <span><Box component="i" sx={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', bgcolor: BAD, verticalAlign: 'middle', mr: 0.75 }} />Lower than previous</span>
              <span><Box component="i" sx={{ display: 'inline-block', width: 16, borderTop: '2.5px dotted #0066FF', opacity: 0.6, verticalAlign: 'middle', mr: 0.75 }} />Months without a snapshot</span>
            </Box>
          </Box>
          <TrendChart series={total} months={months} />
        </Paper>

        <Paper elevation={0} sx={{ ...card, p: 2.25 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h6" fontWeight={650} fontSize="1.05rem">
              {level ? LEVEL_LABEL[level] : ''} breakdown
            </Typography>
            {nextLevel && (
              <Typography variant="body2" color={MUTED}>
                Select a row to open {LEVEL_LABEL[nextLevel].toLowerCase()}
              </Typography>
            )}
          </Box>
          <TableContainer>
            <Table size="medium" sx={{ minWidth: 640 }}>
              <TableHead>
                <TableRow sx={{ '& th': { color: MUTED, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 } }}>
                  <TableCell>{level ? LEVEL_LABEL[level] : ''}</TableCell>
                  <TableCell align="right">Current</TableCell>
                  <TableCell align="right">Accepted</TableCell>
                  <TableCell align="right">Previous</TableCell>
                  <TableCell align="right">Growth</TableCell>
                  <TableCell align="right">Trend</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(result?.groups ?? []).map((g) => {
                  const s = computeStats(g);
                  const rowDrop = isDrop(s.growth);
                  return (
                    <TableRow
                      key={g.name}
                      hover={!!nextLevel}
                      onClick={() => drill(g.name)}
                      onKeyDown={(e) => {
                        if (nextLevel && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          drill(g.name);
                        }
                      }}
                      tabIndex={nextLevel ? 0 : undefined}
                      role={nextLevel ? 'button' : undefined}
                      sx={{ cursor: nextLevel ? 'pointer' : 'default', '& td': { fontVariantNumeric: 'tabular-nums' } }}
                    >
                      <TableCell sx={{ fontWeight: 600 }}>
                        {g.name}
                        {nextLevel && <Box component="span" sx={{ color: MUTED, ml: 0.75, fontWeight: 400 }}>›</Box>}
                      </TableCell>
                      <TableCell align="right" sx={{ color: rowDrop ? BAD : undefined, fontWeight: rowDrop ? 700 : 400 }}>
                        {formatScore(s.current)}
                      </TableCell>
                      <TableCell align="right">{formatScore(s.accepted)}</TableCell>
                      <TableCell align="right">{formatScore(s.previous)}</TableCell>
                      <TableCell align="right"><GrowthPill growth={s.growth} /></TableCell>
                      <TableCell align="right"><Sparkline series={g} months={months} /></TableCell>
                    </TableRow>
                  );
                })}
                {!loading && (result?.groups.length ?? 0) === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ color: MUTED, py: 4 }}>
                      No score history for this selection yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" color={MUTED} sx={{ display: 'block', mt: 1 }}>
            Scores run 0 to 5. Growth is current minus previous snapshot, as a percent of previous. Scores that fell are shown in red.
          </Typography>
        </Paper>
      </Box>

      {dialogDim && options && (
        <FilterDialog
          key={changeDim}
          open
          noun={DIMS.find((d) => d.level === changeDim)?.noun ?? ''}
          options={options[changeDim]}
          selected={changeDim === dim ? sel : options[changeDim]}
          onApply={(v) => applyFilter(changeDim, v)}
          onCancel={() => setDialogDim(null)}
        />
      )}
    </Box>
  );
};
