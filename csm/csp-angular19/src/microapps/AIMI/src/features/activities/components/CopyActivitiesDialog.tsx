import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import type { ActivityData } from '../types/activityTypes';
import { activityService } from '../services/activityService';
import { useQuestionnaireLookup } from '../../../shared/lookups/useQuestionnaireLookup';
import { useProjectHierarchy } from '@shared/projects/hooks/useProjectHierarchy';
import { useAllocatedAccounts } from '@shared/projects/hooks/useAllocatedAccounts';
import { SelectField } from './FormFieldComponents';
import { modalStyles } from '../styles/formStyles';

interface CurrentProject {
  projectId: string;
  businessUnit: string;
  account: string;
  project: string;
}

interface CopyActivitiesDialogProps {
  open: boolean;
  onClose: () => void;
  // The activities to create/overwrite in the current project, already built and ready to save
  onConfirm: (activities: ActivityData[]) => void;
  selectedPractice: string;
  currentProject: CurrentProject;
  // Activities of the current project + practice
  existingActivities: ActivityData[];
}

type SourceScope = 'same' | 'other';
type ConflictMode = 'skip' | 'overwrite';

const cleanPhase = (phase: string) => phase.replace(/:/g, '');

// One dialog for all three copies:
//  - activity -> activity in the same phase (tick one activity, pick the target activity),
//  - phase -> phase in the same project (tick the activities to bring across),
//  - project -> project for the same practice (choose the source project first).
// Only the ticked activities are copied, and each one is mapped to the activity that receives it.
export const CopyActivitiesDialog: React.FC<CopyActivitiesDialogProps> = ({
  open,
  onClose,
  onConfirm,
  selectedPractice,
  currentProject,
  existingActivities,
}) => {
  const { getSDLCPhasesForPractice, getActivitiesForSDLCPhase } =
    useQuestionnaireLookup();
  const { getBusinessUnits, getAccounts, getProjects, getProjectInfo } =
    useProjectHierarchy();
  const { allocatedAccountNames } = useAllocatedAccounts();

  const [scope, setScope] = useState<SourceScope>('same');
  const [srcBusinessUnit, setSrcBusinessUnit] = useState('');
  const [srcAccount, setSrcAccount] = useState('');
  const [srcProject, setSrcProject] = useState('');
  const [otherActivities, setOtherActivities] = useState<ActivityData[]>([]);
  const [loadingOther, setLoadingOther] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [sourcePhase, setSourcePhase] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [targetPhase, setTargetPhase] = useState('');
  const [targetByActivityId, setTargetByActivityId] = useState<
    Record<string, string>
  >({});
  const [conflictMode, setConflictMode] = useState<ConflictMode>('skip');

  const reset = () => {
    setScope('same');
    setSrcBusinessUnit('');
    setSrcAccount('');
    setSrcProject('');
    setOtherActivities([]);
    setLoadError('');
    setSourcePhase('');
    setSelectedIds(new Set());
    setTargetPhase('');
    setTargetByActivityId({});
    setConflictMode('skip');
  };

  useEffect(() => {
    if (open) reset();
  }, [open]);

  // ---- source project (other project, same practice) ----
  const allowedAccounts = useMemo(
    () =>
      allocatedAccountNames === null
        ? null
        : new Set(allocatedAccountNames.map((n) => n.trim().toLowerCase())),
    [allocatedAccountNames]
  );
  const businessUnits = useMemo(
    () =>
      allowedAccounts
        ? getBusinessUnits().filter((bu) =>
            getAccounts(bu).some((a) => allowedAccounts.has(a.trim().toLowerCase()))
          )
        : [],
    [getBusinessUnits, getAccounts, allowedAccounts]
  );
  const accounts = useMemo(
    () =>
      allowedAccounts
        ? getAccounts(srcBusinessUnit).filter((a) =>
            allowedAccounts.has(a.trim().toLowerCase())
          )
        : [],
    [getAccounts, srcBusinessUnit, allowedAccounts]
  );
  const projects = useMemo(
    () => getProjects(srcBusinessUnit, srcAccount),
    [getProjects, srcBusinessUnit, srcAccount]
  );
  const sourceProjectId =
    getProjectInfo(srcBusinessUnit, srcAccount, srcProject)?.projectId ?? '';
  const isSameProjectPicked =
    scope === 'other' && !!sourceProjectId && sourceProjectId === currentProject.projectId;

  useEffect(() => {
    if (scope !== 'other' || !sourceProjectId || isSameProjectPicked) {
      setOtherActivities([]);
      setLoadError('');
      return;
    }
    let cancelled = false;
    setLoadingOther(true);
    setLoadError('');
    activityService
      .getActivitiesByProjectIdAndPractice(sourceProjectId, selectedPractice)
      .then((rows) => {
        if (!cancelled) setOtherActivities(rows);
      })
      .catch(() => {
        if (!cancelled) {
          setOtherActivities([]);
          setLoadError('Could not load the activities of that project.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingOther(false);
      });
    return () => {
      cancelled = true;
    };
  }, [scope, sourceProjectId, isSameProjectPicked, selectedPractice]);

  const sourceActivities = scope === 'same' ? existingActivities : otherActivities;

  // ---- source phase + activities ----
  const practicePhases = useMemo(
    () => (selectedPractice ? getSDLCPhasesForPractice(selectedPractice) : []),
    [selectedPractice, getSDLCPhasesForPractice]
  );
  const sourcePhases = useMemo(() => {
    const used = new Set(sourceActivities.map((a) => a.sdlcPhase));
    return practicePhases.filter((p) => used.has(p));
  }, [sourceActivities, practicePhases]);

  const phaseActivities = useMemo(
    () =>
      sourceActivities
        .filter((a) => a.sdlcPhase === sourcePhase)
        .sort((a, b) => a.activity.localeCompare(b.activity)),
    [sourceActivities, sourcePhase]
  );

  // ---- target ----
  const targetActivityOptions = useMemo(
    () =>
      selectedPractice && targetPhase
        ? [...getActivitiesForSDLCPhase(selectedPractice, targetPhase)].sort(
            (a, b) => a.localeCompare(b)
          )
        : [],
    [selectedPractice, targetPhase, getActivitiesForSDLCPhase]
  );

  const selectedActivities = phaseActivities.filter((a) => selectedIds.has(a.id));

  // Pre-select the same-named activity in the target phase; the user can change it.
  useEffect(() => {
    setTargetByActivityId((prev) => {
      const next: Record<string, string> = {};
      selectedActivities.forEach((a) => {
        const current = prev[a.id];
        if (current && targetActivityOptions.includes(current)) {
          next[a.id] = current;
        } else {
          next[a.id] = targetActivityOptions.includes(a.activity) ? a.activity : '';
        }
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds, targetPhase, targetActivityOptions, sourcePhase]);

  const handleScopeChange = (_: unknown, value: SourceScope | null) => {
    if (!value) return;
    setScope(value);
    setSourcePhase('');
    setSelectedIds(new Set());
    setTargetPhase('');
    setTargetByActivityId({});
  };

  const handleSourcePhaseChange = (phase: string) => {
    setSourcePhase(phase);
    setSelectedIds(new Set());
    setTargetByActivityId({});
    setTargetPhase(phase); // most copies stay in the same phase; the user can change it
  };

  const toggle = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allTicked = phaseActivities.length > 0 && selectedIds.size === phaseActivities.length;
  const toggleAll = () =>
    setSelectedIds(allTicked ? new Set() : new Set(phaseActivities.map((a) => a.id)));

  const existingFor = (activityName: string) =>
    existingActivities.find(
      (a) => a.sdlcPhase === targetPhase && a.activity === activityName
    );

  // Checks for each ticked activity
  const rows = selectedActivities.map((source) => {
    const target = targetByActivityId[source.id] ?? '';
    const existing = target ? existingFor(target) : undefined;
    const copiesOntoItself =
      scope === 'same' && !!target && existing?.id === source.id;
    const duplicateTarget =
      !!target &&
      selectedActivities.some(
        (other) => other.id !== source.id && targetByActivityId[other.id] === target
      );
    return { source, target, existing, copiesOntoItself, duplicateTarget };
  });

  const conflictCount = rows.filter((r) => r.existing && !r.copiesOntoItself).length;
  const hasProblem = rows.some(
    (r) => !r.target || r.copiesOntoItself || r.duplicateTarget
  );
  const toCopy = rows.filter(
    (r) => !r.copiesOntoItself && (!r.existing || conflictMode === 'overwrite')
  );
  const canConfirm =
    open && !!targetPhase && rows.length > 0 && !hasProblem && toCopy.length > 0;

  const handleConfirm = () => {
    if (!canConfirm) return;
    const stamp = Date.now();
    const now = new Date();

    const built: ActivityData[] = toCopy.map(({ source, target, existing }, index) => ({
      // Everything is copied except identity: phase/activity come from the target, and the
      // copy is a draft the user reviews before submitting.
      sdlcPhase: targetPhase,
      activity: target,
      applicability: source.applicability,
      aiAdoptionScore: source.aiAdoptionScore,
      aiToolUsed: Array.isArray(source.aiToolUsed)
        ? [...source.aiToolUsed]
        : source.aiToolUsed,
      acceleratorsUsed: Array.isArray(source.acceleratorsUsed)
        ? [...source.acceleratorsUsed]
        : source.acceleratorsUsed,
      workDoneByAI: source.workDoneByAI,
      hoursSaved: source.hoursSaved,
      revenueGenerated: source.revenueGenerated,
      benefitTo: source.benefitTo,
      qualitativeBenefits: [...(source.qualitativeBenefits ?? [])],
      comments: source.comments,
      aiToolDetails: JSON.parse(JSON.stringify(source.aiToolDetails ?? {})),
      id: existing ? existing.id : `${stamp}-copy-${index}`,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: undefined,
      status: 'draft',
    }));

    onConfirm(built);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          Copy Activities
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tick the activities to copy and choose the activity that should receive
          each one. Copies are saved as drafts for you to review.
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ ...modalStyles.dialogContent, display: 'grid', gap: 2.5 }}>
          {/* 1. Where from */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              1. Copy from
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={scope}
              onChange={handleScopeChange}
            >
              <ToggleButton value="same">This project</ToggleButton>
              <ToggleButton value="other">Another project (same practice)</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {scope === 'other' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
              <SelectField
                label="Business Unit"
                value={srcBusinessUnit}
                onChange={(v) => {
                  setSrcBusinessUnit(v);
                  setSrcAccount('');
                  setSrcProject('');
                  setSourcePhase('');
                }}
                options={businessUnits.map((b) => ({ value: b, label: b }))}
              />
              <SelectField
                label="Account"
                value={srcAccount}
                onChange={(v) => {
                  setSrcAccount(v);
                  setSrcProject('');
                  setSourcePhase('');
                }}
                options={accounts.map((a) => ({ value: a, label: a }))}
                disabled={!srcBusinessUnit}
              />
              <SelectField
                label="Project"
                value={srcProject}
                onChange={(v) => {
                  setSrcProject(v);
                  setSourcePhase('');
                }}
                options={projects.map((p) => ({ value: p, label: p }))}
                disabled={!srcAccount}
              />
            </Box>
          )}

          {isSameProjectPicked && (
            <Alert severity="info">
              That is the current project. Choose "This project" to copy within it.
            </Alert>
          )}
          {loadingOther && <CircularProgress size={22} />}
          {loadError && <Alert severity="error">{loadError}</Alert>}

          {/* 2. What */}
          {(scope === 'same' || (!!sourceProjectId && !isSameProjectPicked && !loadingOther)) && (
            <Box>
              <SelectField
                label="SDLC Phase to copy from"
                value={sourcePhase}
                onChange={handleSourcePhaseChange}
                options={sourcePhases.map((p) => ({ value: p, label: cleanPhase(p) }))}
              />
              {sourcePhases.length === 0 && !loadError && (
                <FormHelperText>
                  There are no saved activities to copy from here.
                </FormHelperText>
              )}
            </Box>
          )}

          {sourcePhase && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                2. Activities to copy
              </Typography>
              <FormControlLabel
                control={<Checkbox checked={allTicked} onChange={toggleAll} />}
                label="Select all"
              />
              <Box sx={{ display: 'grid', gap: 0 }}>
                {phaseActivities.map((a) => (
                  <FormControlLabel
                    key={a.id}
                    control={
                      <Checkbox
                        checked={selectedIds.has(a.id)}
                        onChange={() => toggle(a.id)}
                      />
                    }
                    label={`${a.activity}${a.applicability ? `  (${a.applicability})` : ''}`}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* 3. Where to */}
          {selectedActivities.length > 0 && (
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Typography variant="subtitle2">
                3. Copy to {scope === 'other' ? 'this project' : ''}
              </Typography>
              <SelectField
                label="Target SDLC Phase"
                value={targetPhase}
                onChange={(v) => {
                  setTargetPhase(v);
                  setTargetByActivityId({});
                }}
                options={practicePhases.map((p) => ({ value: p, label: cleanPhase(p) }))}
                required
              />

              {rows.map(({ source, target, existing, copiesOntoItself, duplicateTarget }) => (
                <Box
                  key={source.id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1.4fr',
                    gap: 2,
                    alignItems: 'start',
                  }}
                >
                  <Typography variant="body2" sx={{ pt: 2 }}>
                    {source.activity}
                  </Typography>
                  <Typography variant="body2" sx={{ pt: 2 }}>
                    →
                  </Typography>
                  <Box>
                    <SelectField
                      label="Copy to activity"
                      value={target}
                      onChange={(v) =>
                        setTargetByActivityId((prev) => ({ ...prev, [source.id]: v }))
                      }
                      options={targetActivityOptions.map((t) => ({ value: t, label: t }))}
                      disabled={!targetPhase}
                    />
                    {copiesOntoItself && (
                      <FormHelperText error>
                        This is the same activity - choose a different target.
                      </FormHelperText>
                    )}
                    {duplicateTarget && (
                      <FormHelperText error>
                        Another ticked activity is already copied to this target.
                      </FormHelperText>
                    )}
                    {!copiesOntoItself && !duplicateTarget && existing && (
                      <FormHelperText>This activity already has data.</FormHelperText>
                    )}
                  </Box>
                </Box>
              ))}

              {conflictCount > 0 && (
                <Box>
                  <Alert severity="warning" sx={{ mb: 1 }}>
                    {conflictCount} of the targets already have data.
                  </Alert>
                  <RadioGroup
                    value={conflictMode}
                    onChange={(e) => setConflictMode(e.target.value as ConflictMode)}
                  >
                    <FormControlLabel
                      value="skip"
                      control={<Radio />}
                      label="Skip those - only copy to empty activities"
                    />
                    <FormControlLabel
                      value="overwrite"
                      control={<Radio />}
                      label="Overwrite them with the copied data"
                    />
                  </RadioGroup>
                </Box>
              )}

              {rows.length > 0 && !hasProblem && (
                <Typography variant="body2" color="text.secondary">
                  {toCopy.length} {toCopy.length === 1 ? 'activity' : 'activities'} will be
                  copied
                  {rows.length - toCopy.length > 0
                    ? ` and ${rows.length - toCopy.length} skipped`
                    : ''}
                  .
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={modalStyles.dialogActions}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!canConfirm}
          sx={modalStyles.primaryButton}
        >
          Copy
        </Button>
      </DialogActions>
    </Dialog>
  );
};
