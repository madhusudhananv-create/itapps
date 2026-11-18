import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  ButtonBase,
  Collapse,
  MenuItem,
  Skeleton,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { useProjectHierarchy } from '@shared/projects/hooks/useProjectHierarchy';
import {
  averageScore,
  isScorable,
  scoreReviewService,
  type ReviewActivity,
} from '../services/scoreReviewService';

// Admin Review Score: pick BU > Account > Project > Practice, then accept or adjust the score of
// every activity (with or without an entered score). The overall accepted score is calculated
// from the activities, the same way as the entered overall score.

// ---------- design tokens ----------
const FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
const INK = '#1d1d1f';
const MUTED = '#6e6e73';
const BLUE = '#0071e3';
const GREEN = '#248a3d';
const ORANGE = '#b25000';
const RED = '#d70015';
const SCORES = [0, 1, 2, 3, 4, 5];

const card = {
  background: '#fff',
  borderRadius: '20px',
  boxShadow: '0 1px 2px rgba(0,0,0,.04), 0 8px 30px rgba(0,0,0,.06)',
};

const riseIn = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const pop = keyframes`
  0%   { transform: scale(.82); }
  60%  { transform: scale(1.08); }
  100% { transform: scale(1); }
`;
const slideUp = keyframes`
  from { opacity: 0; transform: translate(-50%, 24px); }
  to   { opacity: 1; transform: translate(-50%, 0); }
`;
const shimmer = keyframes`
  0%   { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const reduceMotion = '@media (prefers-reduced-motion: reduce)';

// ---------- helpers ----------
interface Draft {
  acceptedScore: number | null;
  comment: string;
}

const fmt = (n: number | null) => (n === null ? '–' : n.toFixed(2));

/** Eases a number toward its target so score changes feel alive. */
const useCountUp = (target: number | null, duration = 600): number | null => {
  const [value, setValue] = useState<number | null>(target);
  const from = useRef<number | null>(target);
  useEffect(() => {
    if (target === null || from.current === null) {
      from.current = target;
      setValue(target);
      return;
    }
    const start = from.current;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const next = start + (target - start) * eased;
      setValue(next);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      from.current = target;
    };
  }, [target, duration]);
  return value;
};

type RowFilter = 'all' | 'scored' | 'unscored' | 'pending' | 'reviewed';
const FILTERS: { key: RowFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'scored', label: 'With score' },
  { key: 'unscored', label: 'No score' },
  { key: 'pending', label: 'Pending' },
  { key: 'reviewed', label: 'Reviewed' },
];

// ---------- small pieces ----------
const selectSx = {
  flex: '1 1 200px',
  minWidth: 180,
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
    backgroundColor: 'rgba(255,255,255,.85)',
    fontFamily: FONT,
    transition: `box-shadow .3s ${EASE}, background-color .3s ${EASE}`,
    '& fieldset': { borderColor: 'rgba(0,0,0,.08)' },
    '&:hover fieldset': { borderColor: 'rgba(0,0,0,.18)' },
    '&.Mui-focused': { boxShadow: '0 0 0 4px rgba(0,113,227,.18)' },
    '&.Mui-focused fieldset': { borderColor: BLUE, borderWidth: 1 },
    '&.Mui-disabled': { backgroundColor: 'rgba(0,0,0,.03)' },
  },
  '& .MuiInputLabel-root': { fontFamily: FONT, color: MUTED },
};

interface PickerProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
  onChange: (v: string) => void;
}

const Picker = ({ label, value, options, disabled, onChange }: PickerProps) => (
  <TextField
    select
    size="small"
    label={label}
    value={value}
    disabled={disabled}
    onChange={(e) => onChange(e.target.value)}
    sx={selectSx}
    SelectProps={{
      MenuProps: {
        PaperProps: {
          sx: {
            borderRadius: '14px',
            mt: 0.5,
            boxShadow: '0 12px 40px rgba(0,0,0,.18)',
            fontFamily: FONT,
          },
        },
      },
    }}
  >
    {options.length === 0 && (
      <MenuItem disabled sx={{ fontFamily: FONT }}>
        Nothing to show
      </MenuItem>
    )}
    {options.map((o) => (
      <MenuItem key={o.value} value={o.value} sx={{ fontFamily: FONT }}>
        {o.label}
      </MenuItem>
    ))}
  </TextField>
);

const SegmentedControl = ({
  value,
  counts,
  onChange,
}: {
  value: RowFilter;
  counts: Record<RowFilter, number>;
  onChange: (f: RowFilter) => void;
}) => {
  const index = FILTERS.findIndex((f) => f.key === value);
  return (
    <Box
      role="tablist"
      sx={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: `repeat(${FILTERS.length}, 1fr)`,
        background: 'rgba(120,120,128,.12)',
        borderRadius: '12px',
        p: '3px',
        maxWidth: 560,
        width: '100%',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 3,
          bottom: 3,
          left: 3,
          width: `calc((100% - 6px) / ${FILTERS.length})`,
          borderRadius: '9px',
          background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,.14)',
          transform: `translateX(${index * 100}%)`,
          transition: `transform .4s ${EASE}`,
          [reduceMotion]: { transition: 'none' },
        }}
      />
      {FILTERS.map((f) => (
        <ButtonBase
          key={f.key}
          role="tab"
          aria-selected={f.key === value}
          onClick={() => onChange(f.key)}
          sx={{
            position: 'relative',
            zIndex: 1,
            py: 0.75,
            borderRadius: '9px',
            fontFamily: FONT,
            fontSize: '0.8rem',
            fontWeight: f.key === value ? 600 : 500,
            color: f.key === value ? INK : MUTED,
            transition: `color .3s ${EASE}`,
          }}
        >
          {f.label}
          <Box component="span" sx={{ ml: 0.6, opacity: 0.55, fontWeight: 500 }}>
            {counts[f.key]}
          </Box>
        </ButtonBase>
      ))}
    </Box>
  );
};

const OverallTile = ({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number | null;
  sub: string;
  accent: string;
}) => {
  const shown = useCountUp(value);
  return (
    <Box sx={{ ...card, p: 2.5, flex: '1 1 220px', minWidth: 200 }}>
      <Typography
        sx={{
          fontFamily: FONT,
          fontSize: '0.72rem',
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          fontWeight: 600,
          color: MUTED,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, mt: 0.5 }}>
        <Typography
          sx={{
            fontFamily: FONT,
            fontSize: '2.6rem',
            fontWeight: 700,
            letterSpacing: '-.03em',
            color: value === null ? '#c7c7cc' : accent,
            lineHeight: 1.1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {fmt(shown)}
        </Typography>
        {value !== null && (
          <Typography sx={{ fontFamily: FONT, color: MUTED, fontWeight: 500 }}>/ 5</Typography>
        )}
      </Box>
      <Typography sx={{ fontFamily: FONT, color: MUTED, fontSize: '0.82rem', mt: 0.25 }}>
        {sub}
      </Typography>
    </Box>
  );
};

/** Accepted score as text: 0-5 with up to two decimals. Quick buttons set whole numbers. */
const parseScore = (text: string): number | null | 'invalid' => {
  const t = text.trim();
  if (t === '') return null;
  if (!/^\d(\.\d{1,2})?$|^\d\.$/.test(t)) return 'invalid';
  const n = Number(t);
  return n >= 0 && n <= 5 ? n : 'invalid';
};

const ScoreInput = ({
  value,
  onCommit,
}: {
  value: number | null;
  onCommit: (v: number | null) => void;
}) => {
  const [text, setText] = useState(value === null ? '' : String(value));
  const invalid = parseScore(text) === 'invalid';

  // Follow outside changes (quick buttons, accept, discard) without fighting the typing.
  useEffect(() => {
    const parsed = parseScore(text);
    if (parsed !== value) setText(value === null ? '' : String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Box
      component="input"
      inputMode="decimal"
      aria-label="Accepted score, 0 to 5, up to two decimals"
      aria-invalid={invalid}
      placeholder="0.00"
      value={text}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        if (!/^\d*\.?\d{0,2}$/.test(raw)) return; // ignore anything that is not a number
        setText(raw);
        const parsed = parseScore(raw);
        if (parsed !== 'invalid') onCommit(parsed);
      }}
      onBlur={() => setText(value === null ? '' : String(value))}
      sx={{
        width: 74,
        height: 34,
        borderRadius: '10px',
        border: `1px solid ${invalid ? RED : 'rgba(0,0,0,.12)'}`,
        background: '#fff',
        textAlign: 'center',
        fontFamily: FONT,
        fontWeight: 600,
        fontSize: '0.9rem',
        color: INK,
        outline: 'none',
        fontVariantNumeric: 'tabular-nums',
        transition: `box-shadow .3s ${EASE}, border-color .3s ${EASE}`,
        '&:focus': {
          borderColor: invalid ? RED : BLUE,
          boxShadow: `0 0 0 4px ${invalid ? 'rgba(215,0,21,.14)' : 'rgba(0,113,227,.18)'}`,
        },
      }}
    />
  );
};

type RowStatus = 'edited' | 'pending' | 'accepted' | 'changed' | 'notscored';
const STATUS_STYLE: Record<RowStatus, { bg: string; fg: string; label: string }> = {
  notscored: { bg: 'rgba(120,120,128,.14)', fg: MUTED, label: 'Not scored' },
  edited: { bg: 'rgba(0,113,227,.12)', fg: BLUE, label: 'Edited' },
  pending: { bg: 'rgba(255,159,10,.16)', fg: ORANGE, label: 'Pending' },
  accepted: { bg: 'rgba(52,199,89,.16)', fg: GREEN, label: 'Accepted' },
  changed: { bg: 'rgba(255,59,48,.12)', fg: RED, label: 'Changed' },
};

const StatusChip = ({ status }: { status: RowStatus }) => {
  const s = STATUS_STYLE[status];
  return (
    <Box
      key={status}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.25,
        py: 0.35,
        borderRadius: '980px',
        background: s.bg,
        color: s.fg,
        fontFamily: FONT,
        fontSize: '0.74rem',
        fontWeight: 600,
        animation: `${pop} .45s ${EASE}`,
        [reduceMotion]: { animation: 'none' },
      }}
    >
      {s.label}
    </Box>
  );
};

// ---------- activity row ----------
interface RowProps {
  activity: ReviewActivity;
  draft: Draft | undefined;
  index: number;
  showErrors: boolean;
  onScore: (a: ReviewActivity, score: number | null) => void;
  onComment: (a: ReviewActivity, comment: string) => void;
}

const ActivityRow = ({ activity, draft, index, showErrors, onScore, onComment }: RowProps) => {
  const scorable = isScorable(activity);
  const accepted = scorable ? (draft ? draft.acceptedScore : activity.acceptedScore) : null;
  const comment = draft ? draft.comment : activity.comment;
  const entered = activity.enteredScore;
  const differs = accepted !== null && accepted !== entered;
  const [commentOpen, setCommentOpen] = useState(false);
  const needsComment = differs;
  // Out-of-scope activities only take a comment, so their box is always there.
  const commentVisible = !scorable || needsComment || !!comment || commentOpen;
  const missingComment = needsComment && !comment.trim();

  const status: RowStatus = !scorable
    ? draft
      ? 'edited'
      : 'notscored'
    : draft
      ? 'edited'
      : accepted === null
        ? 'pending'
        : differs
          ? 'changed'
          : 'accepted';

  return (
    <Box
      sx={{
        px: { xs: 2, md: 2.5 },
        py: 1.75,
        borderTop: '1px solid rgba(0,0,0,.06)',
        background: draft ? 'rgba(0,113,227,.035)' : 'transparent',
        transition: `background-color .4s ${EASE}`,
        animation: `${riseIn} .5s ${EASE} both`,
        animationDelay: `${Math.min(index, 12) * 35}ms`,
        [reduceMotion]: { animation: 'none' },
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(220px,1.6fr) 110px auto 110px' },
          gap: { xs: 1.25, lg: 2 },
          alignItems: 'center',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{ fontFamily: FONT, fontWeight: 600, color: INK, fontSize: '0.95rem' }}
          >
            {activity.activity}
          </Typography>
          <Typography sx={{ fontFamily: FONT, color: MUTED, fontSize: '0.8rem' }}>
            {activity.applicability || 'Applicability not set'}
            {activity.status === 'draft' ? ' · Draft' : ''}
          </Typography>
        </Box>

        <Box>
          <Typography
            sx={{
              fontFamily: FONT,
              fontSize: '0.68rem',
              textTransform: 'uppercase',
              letterSpacing: '.07em',
              color: MUTED,
              fontWeight: 600,
            }}
          >
            Entered
          </Typography>
          {entered === null ? (
            <Typography sx={{ fontFamily: FONT, color: '#8e8e93', fontStyle: 'italic' }}>
              No score
            </Typography>
          ) : (
            <Typography
              sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '1.15rem', color: INK }}
            >
              {entered}
            </Typography>
          )}
        </Box>

        <Box>
          <Typography
            sx={{
              fontFamily: FONT,
              fontSize: '0.68rem',
              textTransform: 'uppercase',
              letterSpacing: '.07em',
              color: MUTED,
              fontWeight: 600,
              mb: 0.5,
            }}
          >
            Accepted
          </Typography>
          {!scorable ? (
            <Typography sx={{ fontFamily: FONT, color: '#8e8e93', fontStyle: 'italic', fontSize: '0.88rem', py: 0.5 }}>
              {activity.applicability} · comment only
            </Typography>
          ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
            {SCORES.map((s) => {
              const on = accepted === s;
              return (
                <ButtonBase
                  key={s}
                  aria-label={`Accept score ${s}`}
                  aria-pressed={on}
                  onClick={() => onScore(activity, on ? null : s)}
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    fontFamily: FONT,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: on ? '#fff' : INK,
                    background: on ? BLUE : 'rgba(120,120,128,.12)',
                    boxShadow: on ? '0 4px 12px rgba(0,113,227,.4)' : 'none',
                    transition: `background-color .3s ${EASE}, color .3s ${EASE}, transform .3s ${EASE}, box-shadow .3s ${EASE}`,
                    animation: on ? `${pop} .4s ${EASE}` : 'none',
                    '&:hover': { transform: 'scale(1.1)', background: on ? BLUE : 'rgba(120,120,128,.22)' },
                    '&:active': { transform: 'scale(.92)' },
                    [reduceMotion]: { animation: 'none', transition: 'none' },
                  }}
                >
                  {s}
                </ButtonBase>
              );
            })}
            <ScoreInput value={accepted} onCommit={(v) => onScore(activity, v)} />
            {entered !== null && accepted !== entered && (
              <ButtonBase
                onClick={() => onScore(activity, entered)}
                sx={{
                  ml: 0.5,
                  px: 1.25,
                  height: 30,
                  borderRadius: '980px',
                  fontFamily: FONT,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: BLUE,
                  background: 'rgba(0,113,227,.1)',
                  transition: `background-color .3s ${EASE}`,
                  '&:hover': { background: 'rgba(0,113,227,.18)' },
                }}
              >
                Accept {entered}
              </ButtonBase>
            )}
          </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, justifyContent: { lg: 'flex-end' } }}>
          <StatusChip status={status} />
          {status === 'changed' && entered !== null && (
            <Typography sx={{ fontFamily: FONT, color: MUTED, fontSize: '0.75rem' }}>
              was {entered}
            </Typography>
          )}
        </Box>
      </Box>

      <Collapse in={commentVisible} timeout={400} unmountOnExit>
        <TextField
          fullWidth
          size="small"
          multiline
          minRows={1}
          maxRows={4}
          value={comment}
          onChange={(e) => onComment(activity, e.target.value)}
          placeholder={
            needsComment
              ? 'Why was the score changed? (required)'
              : scorable
                ? 'Review comment (optional)'
                : `Review comment for ${activity.applicability} (optional)`
          }
          error={showErrors && missingComment}
          helperText={showErrors && missingComment ? 'A comment is required when the score differs.' : ' '}
          sx={{
            mt: 1.25,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              fontFamily: FONT,
              fontSize: '0.88rem',
              background: 'rgba(120,120,128,.06)',
              '& fieldset': { borderColor: 'transparent' },
              '&:hover fieldset': { borderColor: 'rgba(0,0,0,.12)' },
              '&.Mui-focused fieldset': { borderColor: BLUE, borderWidth: 1 },
            },
            '& .MuiFormHelperText-root': { fontFamily: FONT },
          }}
        />
      </Collapse>
      {!commentVisible && (
        <ButtonBase
          onClick={() => setCommentOpen(true)}
          sx={{
            mt: 0.5,
            fontFamily: FONT,
            fontSize: '0.78rem',
            color: BLUE,
            borderRadius: '6px',
            px: 0.5,
          }}
        >
          Add comment
        </ButtonBase>
      )}
    </Box>
  );
};

// ---------- phase section ----------
const PhaseSection = ({
  phase,
  rows,
  children,
  index,
  isReviewed,
}: {
  phase: string;
  rows: ReviewActivity[];
  children: React.ReactNode;
  index: number;
  isReviewed: (a: ReviewActivity) => boolean;
}) => {
  const [open, setOpen] = useState(true);
  const scorableRows = rows.filter(isScorable);
  const reviewed = scorableRows.filter(isReviewed).length;
  const pct = scorableRows.length ? (reviewed / scorableRows.length) * 100 : 0;
  return (
    <Box
      sx={{
        ...card,
        mb: 2,
        overflow: 'hidden',
        animation: `${riseIn} .6s ${EASE} both`,
        animationDelay: `${index * 70}ms`,
        [reduceMotion]: { animation: 'none' },
      }}
    >
      <ButtonBase
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 1.5,
          px: { xs: 2, md: 2.5 },
          py: 1.75,
          textAlign: 'left',
        }}
      >
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRight: `2px solid ${MUTED}`,
            borderBottom: `2px solid ${MUTED}`,
            transform: open ? 'rotate(45deg) translate(-2px,-2px)' : 'rotate(-45deg)',
            transition: `transform .4s ${EASE}`,
            flexShrink: 0,
          }}
        />
        <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: INK, fontSize: '1.05rem', flex: 1 }}>
          {phase === 'NA' ? 'Not applicable' : phase}
        </Typography>
        <Typography sx={{ fontFamily: FONT, color: MUTED, fontSize: '0.82rem' }}>
          {scorableRows.length === 0
            ? 'Comments only'
            : `${reviewed} of ${scorableRows.length} reviewed`}
        </Typography>
        <Box
          sx={{
            width: 72,
            height: 6,
            borderRadius: 3,
            background: 'rgba(120,120,128,.16)',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${pct}%`,
              borderRadius: 3,
              background: pct === 100 ? '#34c759' : BLUE,
              transition: `width .6s ${EASE}, background-color .4s ${EASE}`,
            }}
          />
        </Box>
      </ButtonBase>
      <Collapse in={open} timeout={450}>
        {children}
      </Collapse>
    </Box>
  );
};

const LoadingState = () => (
  <Box sx={{ display: 'grid', gap: 2 }}>
    {[0, 1, 2].map((i) => (
      <Skeleton
        key={i}
        variant="rounded"
        height={120}
        sx={{
          borderRadius: '20px',
          background:
            'linear-gradient(90deg, rgba(0,0,0,.05) 0px, rgba(0,0,0,.09) 100px, rgba(0,0,0,.05) 200px)',
          backgroundSize: '200px 100%',
          animation: `${shimmer} 1.4s linear infinite`,
        }}
      />
    ))}
  </Box>
);

const EmptyState = ({ title, hint }: { title: string; hint: string }) => (
  <Box
    sx={{
      ...card,
      textAlign: 'center',
      py: 8,
      px: 3,
      animation: `${riseIn} .6s ${EASE} both`,
      [reduceMotion]: { animation: 'none' },
    }}
  >
    <Typography sx={{ fontFamily: FONT, fontSize: '1.3rem', fontWeight: 700, color: INK }}>
      {title}
    </Typography>
    <Typography sx={{ fontFamily: FONT, color: MUTED, mt: 0.75 }}>{hint}</Typography>
  </Box>
);

// ---------- page ----------
export const ScoreReview = () => {
  const { getBusinessUnits, getAccounts, getProjects, getProjectInfo, loading } =
    useProjectHierarchy();

  const [bu, setBu] = useState('');
  const [account, setAccount] = useState('');
  const [project, setProject] = useState('');
  const [practice, setPractice] = useState('');

  const [activities, setActivities] = useState<ReviewActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [filter, setFilter] = useState<RowFilter>('all');
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [toast, setToast] = useState<{ msg: string; severity: 'success' | 'error' | 'warning' } | null>(null);

  const projectId = useMemo(
    () => (bu && account && project ? getProjectInfo(bu, account, project)?.projectId ?? '' : ''),
    [bu, account, project, getProjectInfo]
  );

  const dirty = Object.keys(drafts).length > 0;

  const confirmDiscard = () =>
    !dirty || window.confirm('You have unsaved review changes. Discard them?');

  const loadProject = useCallback(async (id: string) => {
    setLoadingActivities(true);
    setLoadError('');
    try {
      setActivities(await scoreReviewService.getProjectActivities(id));
    } catch {
      setActivities([]);
      setLoadError('Could not load the activities for this project.');
    } finally {
      setLoadingActivities(false);
    }
  }, []);

  useEffect(() => {
    setDrafts({});
    setShowErrors(false);
    if (!projectId) {
      setActivities([]);
      return;
    }
    let cancelled = false;
    setLoadingActivities(true);
    setLoadError('');
    scoreReviewService
      .getProjectActivities(projectId)
      .then((rows) => !cancelled && setActivities(rows))
      .catch(() => {
        if (!cancelled) {
          setActivities([]);
          setLoadError('Could not load the activities for this project.');
        }
      })
      .finally(() => !cancelled && setLoadingActivities(false));
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // Practices that actually have activities for the chosen project.
  const practiceOptions = useMemo(() => {
    const counts = new Map<string, number>();
    activities.forEach((a) => counts.set(a.practice, (counts.get(a.practice) ?? 0) + 1));
    return Array.from(counts.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, n]) => ({ value: name, label: `${name} · ${n} ${n === 1 ? 'activity' : 'activities'}` }));
  }, [activities]);

  // A project with a single practice is selected for the admin.
  useEffect(() => {
    if (!practice && practiceOptions.length === 1) setPractice(practiceOptions[0].value);
    if (practice && !practiceOptions.some((o) => o.value === practice) && !loadingActivities) {
      setPractice('');
    }
  }, [practiceOptions, practice, loadingActivities]);

  const practiceActivities = useMemo(
    () => activities.filter((a) => a.practice === practice),
    [activities, practice]
  );

  const effAccepted = useCallback(
    (a: ReviewActivity) =>
      !isScorable(a) ? null : drafts[a.id] ? drafts[a.id].acceptedScore : a.acceptedScore,
    [drafts]
  );
  const isReviewed = useCallback((a: ReviewActivity) => effAccepted(a) !== null, [effAccepted]);

  const counts = useMemo(() => {
    const c: Record<RowFilter, number> = { all: 0, scored: 0, unscored: 0, pending: 0, reviewed: 0 };
    practiceActivities.forEach((a) => {
      c.all++;
      if (a.enteredScore === null) c.unscored++;
      else c.scored++;
      if (!isScorable(a)) return; // comment-only activities are never pending
      if (isReviewed(a)) c.reviewed++;
      else c.pending++;
    });
    return c;
  }, [practiceActivities, isReviewed]);

  const visible = useMemo(
    () =>
      practiceActivities.filter((a) => {
        switch (filter) {
          case 'scored':
            return a.enteredScore !== null;
          case 'unscored':
            return a.enteredScore === null;
          case 'pending':
            return isScorable(a) && !isReviewed(a);
          case 'reviewed':
            return isReviewed(a);
          default:
            return true;
        }
      }),
    [practiceActivities, filter, isReviewed]
  );

  const phases = useMemo(() => {
    const map = new Map<string, ReviewActivity[]>();
    visible.forEach((a) => {
      const list = map.get(a.sdlcPhase);
      if (list) list.push(a);
      else map.set(a.sdlcPhase, [a]);
    });
    return Array.from(map.entries());
  }, [visible]);

  // Overall scores: same average rule; accepted counts each activity's accepted score, falling back
  // to the entered one, and stays empty until at least one activity has been reviewed.
  const enteredOverall = useMemo(
    () => averageScore(practiceActivities, (a) => a.enteredScore),
    [practiceActivities]
  );
  // Only activities that have an entered score take part, exactly as in the entered overall.
  const acceptedOverall = useMemo(
    () =>
      practiceActivities.some((a) => a.enteredScore !== null && effAccepted(a) !== null)
        ? averageScore(practiceActivities, (a) =>
            a.enteredScore === null ? null : (effAccepted(a) ?? a.enteredScore)
          )
        : null,
    [practiceActivities, effAccepted]
  );

  // ----- editing -----
  const updateDraft = useCallback((a: ReviewActivity, patch: Partial<Draft>) => {
    setDrafts((prev) => {
      // Out-of-scope activities never carry a score, whatever an old row still holds.
      const savedScore = isScorable(a) ? a.acceptedScore : null;
      const current: Draft = prev[a.id] ?? { acceptedScore: savedScore, comment: a.comment };
      const next = { ...current, ...patch, ...(isScorable(a) ? {} : { acceptedScore: null }) };
      const same = next.acceptedScore === savedScore && next.comment.trim() === a.comment.trim();
      const copy = { ...prev };
      if (same) delete copy[a.id];
      else copy[a.id] = next;
      return copy;
    });
  }, []);

  const handleScore = useCallback(
    (a: ReviewActivity, score: number | null) => updateDraft(a, { acceptedScore: score }),
    [updateDraft]
  );
  const handleComment = useCallback(
    (a: ReviewActivity, comment: string) => updateDraft(a, { comment }),
    [updateDraft]
  );

  const acceptAllEntered = () => {
    const targets = practiceActivities.filter(
      (a) => isScorable(a) && a.enteredScore !== null && !isReviewed(a)
    );
    if (targets.length === 0) {
      setToast({ msg: 'Every activity with an entered score is already reviewed.', severity: 'warning' });
      return;
    }
    setDrafts((prev) => {
      const copy = { ...prev };
      targets.forEach((a) => {
        copy[a.id] = { acceptedScore: a.enteredScore, comment: prev[a.id]?.comment ?? a.comment };
      });
      return copy;
    });
  };

  // ----- save -----
  const invalidIds = useMemo(
    () =>
      Object.entries(drafts)
        .filter(([id, d]) => {
          const a = activities.find((x) => x.id === Number(id));
          return (
            a !== undefined &&
            d.acceptedScore !== null &&
            d.acceptedScore !== a.enteredScore &&
            !d.comment.trim()
          );
        })
        .map(([id]) => Number(id)),
    [drafts, activities]
  );

  const save = async () => {
    if (invalidIds.length > 0) {
      setShowErrors(true);
      setToast({
        msg: `${invalidIds.length} changed ${invalidIds.length === 1 ? 'score needs' : 'scores need'} a comment.`,
        severity: 'warning',
      });
      return;
    }
    setSaving(true);
    try {
      await scoreReviewService.saveReviews(
        Object.entries(drafts).map(([id, d]) => ({
          id: Number(id),
          acceptedScore: d.acceptedScore,
          comment: d.comment,
        }))
      );
      const saved = Object.keys(drafts).length;
      setDrafts({});
      setShowErrors(false);
      if (projectId) await loadProject(projectId);
      setToast({ msg: `Saved ${saved} ${saved === 1 ? 'review' : 'reviews'}.`, severity: 'success' });
    } catch (e) {
      setToast({
        msg: e instanceof Error && e.message ? e.message : 'Could not save the reviews. Nothing was changed.',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  // ----- selectors -----
  const buOptions = getBusinessUnits().map((v) => ({ value: v, label: v }));
  const accountOptions = getAccounts(bu).map((v) => ({ value: v, label: v }));
  const projectOptions = getProjects(bu, account).map((v) => ({ value: v, label: v }));

  const change = (apply: () => void) => {
    if (!confirmDiscard()) return;
    apply();
  };

  const pendingEnteredCount = practiceActivities.filter(
    (a) => isScorable(a) && a.enteredScore !== null && !isReviewed(a)
  ).length;

  return (
    <Box sx={{ fontFamily: FONT, pb: dirty ? 12 : 4, maxWidth: 1180, mx: 'auto' }}>
      <Box sx={{ mb: 3, animation: `${riseIn} .6s ${EASE} both`, [reduceMotion]: { animation: 'none' } }}>
        <Typography
          sx={{
            fontFamily: FONT,
            fontSize: { xs: '2rem', md: '2.6rem' },
            fontWeight: 700,
            letterSpacing: '-.03em',
            color: INK,
            lineHeight: 1.1,
          }}
        >
          Review Score
        </Typography>
        <Typography sx={{ fontFamily: FONT, color: MUTED, fontSize: '1.05rem', mt: 0.75, maxWidth: 640 }}>
          Accept or adjust the score of every activity. The accepted overall score updates as you go.
        </Typography>
      </Box>

      {/* Selectors */}
      <Box
        sx={{
          ...card,
          p: 2,
          mb: 3,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
          position: 'relative',
          zIndex: 2,
          animation: `${riseIn} .6s ${EASE} .08s both`,
          [reduceMotion]: { animation: 'none' },
        }}
      >
        <Picker
          label="Business unit"
          value={bu}
          options={buOptions}
          disabled={loading}
          onChange={(v) =>
            change(() => {
              setBu(v);
              setAccount('');
              setProject('');
              setPractice('');
            })
          }
        />
        <Picker
          label="Account"
          value={account}
          options={accountOptions}
          disabled={!bu}
          onChange={(v) =>
            change(() => {
              setAccount(v);
              setProject('');
              setPractice('');
            })
          }
        />
        <Picker
          label="Project"
          value={project}
          options={projectOptions}
          disabled={!account}
          onChange={(v) =>
            change(() => {
              setProject(v);
              setPractice('');
            })
          }
        />
        <Picker
          label="Practice"
          value={practice}
          options={practiceOptions}
          disabled={!project || loadingActivities || !!loadError}
          onChange={(v) => change(() => { setDrafts({}); setPractice(v); setFilter('all'); })}
        />
      </Box>

      {/* Body */}
      {!project ? (
        <EmptyState
          title="Choose a project to begin"
          hint="Select a business unit, account and project. Only practices with activities are offered."
        />
      ) : loadingActivities ? (
        <LoadingState />
      ) : loadError ? (
        <EmptyState title="Something went wrong" hint={loadError} />
      ) : practiceOptions.length === 0 ? (
        <EmptyState title="No activities yet" hint="This project has no activities to review." />
      ) : !practice ? (
        <EmptyState
          title="Choose a practice"
          hint={`${practiceOptions.length} practices have activities in this project.`}
        />
      ) : (
        <>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <OverallTile
              label="Entered overall"
              value={enteredOverall}
              sub="Average of the scores the project entered"
              accent={INK}
            />
            <OverallTile
              label="Accepted overall"
              value={acceptedOverall}
              sub={
                acceptedOverall === null
                  ? 'Not reviewed yet'
                  : `${counts.reviewed} of ${counts.reviewed + counts.pending} activities reviewed`
              }
              accent={BLUE}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
              mb: 2.5,
            }}
          >
            <SegmentedControl value={filter} counts={counts} onChange={setFilter} />
            <ButtonBase
              onClick={acceptAllEntered}
              disabled={pendingEnteredCount === 0}
              sx={{
                px: 2,
                py: 1,
                borderRadius: '980px',
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: '0.85rem',
                color: '#fff',
                background: BLUE,
                transition: `transform .3s ${EASE}, opacity .3s ${EASE}, box-shadow .3s ${EASE}`,
                boxShadow: '0 4px 14px rgba(0,113,227,.35)',
                '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 8px 20px rgba(0,113,227,.4)' },
                '&:active': { transform: 'scale(.97)' },
                '&.Mui-disabled': { opacity: 0.4, boxShadow: 'none' },
              }}
            >
              Accept all entered scores{pendingEnteredCount ? ` (${pendingEnteredCount})` : ''}
            </ButtonBase>
          </Box>

          {phases.length === 0 ? (
            <EmptyState title="Nothing matches" hint="Try a different filter." />
          ) : (
            phases.map(([phase, rows], pi) => (
              <PhaseSection
                key={`${practice}-${phase}`}
                phase={phase}
                rows={rows}
                index={pi}
                isReviewed={isReviewed}
              >
                {rows.map((a, i) => (
                  <ActivityRow
                    key={a.id}
                    activity={a}
                    draft={drafts[a.id]}
                    index={i}
                    showErrors={showErrors}
                    onScore={handleScore}
                    onComment={handleComment}
                  />
                ))}
              </PhaseSection>
            ))
          )}
        </>
      )}

      {/* Floating save bar */}
      {dirty && (
        <Box
          sx={{
            position: 'fixed',
            left: '50%',
            bottom: 28,
            transform: 'translateX(-50%)',
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            pl: 2.5,
            pr: 1,
            py: 1,
            borderRadius: '980px',
            background: 'rgba(29,29,31,.82)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
            boxShadow: '0 12px 40px rgba(0,0,0,.35)',
            animation: `${slideUp} .5s ${EASE} both`,
            [reduceMotion]: { animation: 'none' },
          }}
        >
          <Typography sx={{ fontFamily: FONT, color: '#fff', fontSize: '0.9rem', fontWeight: 500 }}>
            {Object.keys(drafts).length} unsaved {Object.keys(drafts).length === 1 ? 'change' : 'changes'}
          </Typography>
          <ButtonBase
            onClick={() => {
              setDrafts({});
              setShowErrors(false);
            }}
            disabled={saving}
            sx={{
              px: 1.5,
              py: 0.75,
              borderRadius: '980px',
              color: 'rgba(255,255,255,.8)',
              fontFamily: FONT,
              fontSize: '0.85rem',
              fontWeight: 500,
              '&:hover': { background: 'rgba(255,255,255,.12)' },
            }}
          >
            Discard
          </ButtonBase>
          <ButtonBase
            onClick={save}
            disabled={saving}
            sx={{
              px: 2.25,
              py: 0.9,
              borderRadius: '980px',
              background: BLUE,
              color: '#fff',
              fontFamily: FONT,
              fontSize: '0.88rem',
              fontWeight: 600,
              transition: `transform .3s ${EASE}, opacity .3s ${EASE}`,
              '&:active': { transform: 'scale(.96)' },
              '&.Mui-disabled': { opacity: 0.6, color: '#fff' },
            }}
          >
            {saving ? 'Saving…' : 'Save all'}
          </ButtonBase>
        </Box>
      )}

      <Snackbar
        open={!!toast}
        autoHideDuration={4500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast(null)}
          severity={toast?.severity ?? 'success'}
          variant="filled"
          sx={{ borderRadius: '14px', fontFamily: FONT }}
        >
          {toast?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};
