// Shared styles for ActivityCard and ActivityDetailsModal components
import { getScoreColor } from '@shared/utils/scoreColorUtils';

// Common button styles
export const buttonStyles = {
  base: {
    borderRadius: 1.5,
    textTransform: 'none' as const,
    fontWeight: 500,
    px: 1.5,
    py: 0.75,
    fontSize: '0.8rem',
  },
  view: {
    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
    color: 'white',
    '&:hover': {
      background: 'linear-gradient(135deg, #218838 0%, #1ea085 100%)',
    },
  },
  edit: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    '&:hover': {
      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
    },
  },
  delete: {
    background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
    color: 'white',
    '&:hover': {
      background: 'linear-gradient(135deg, #c82333 0%, #a71e2a 100%)',
    },
  },
};

// Common typography styles
export const typographyStyles = {
  title: {
    fontWeight: 600,
    color: '#333',
    fontSize: '1.05rem',
  },
  fieldLabel: {
    color: 'text.secondary',
    display: 'block',
    fontSize: '0.85rem',
    mb: 0.25,
  },
  fieldValue: {
    fontWeight: 500,
    mt: 0.25,
    fontSize: '0.95rem',
  },
  caption: {
    color: 'text.secondary',
    fontSize: '0.85rem',
  },
  italic: {
    fontStyle: 'italic',
  },
};

// Common chip styles
export const chipStyles = {
  unsaved: {
    fontWeight: 600,
    fontSize: '0.75rem',
  },
  applicability: {
    fontWeight: 500,
    mt: 0.25,
    fontSize: '0.8rem',
  },
  aiScore: (score: string) => ({
    backgroundColor: getScoreColor(score),
    color: 'white',
    fontWeight: 600,
    fontSize: '0.75rem',
  }),
  aiScoreLabel: {
    fontWeight: 500,
    fontSize: '0.85rem',
  },
  small: {
    fontSize: '0.75rem',
  },
  qualitative: {
    fontSize: '0.8rem',
  },
};

// Common layout styles
export const layoutStyles = {
  container: {
    mb: 1.5,
  },
  divider: {
    mb: 1.5,
  },
  actionButtons: {
    display: 'flex',
    gap: 0.75,
    mt: 1.5,
    justifyContent: 'flex-end',
  },
  aiScoreContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    mt: 0.25,
  },
  chipsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
    mt: 0.25,
  },
};

// ActivityCard specific styles
export const activityCardStyles = {
  card: {
    mb: 2,
    borderRadius: 2,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
    position: 'relative' as const,
    border: '1px solid #e0e0e0',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
      borderColor: '#d0d0d0',
      transform: 'translateY(-1px)',
    },
  },
  unsavedChip: {
    position: 'absolute' as const,
    top: 12,
    right: 12,
    zIndex: 1,
    ...chipStyles.unsaved,
  },
  draftChip: {
    position: 'absolute',
    top: 0,
    right: 12,
    fontWeight: 600,
    fontSize: '0.75rem',
  },
  cardContent: {
    p: 2.5,
    backgroundColor: '#fafbfc',
  },
  header: {
    mb: 1.5,
    pb: 1,
    borderBottom: '1px solid #f0f0f0',
  },
  fieldsGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, 1fr)',
      md: 'repeat(3, 1fr)',
      lg: 'repeat(4, 1fr)',
    },
    gap: 1.5,
    mb: 0.5,
  },
  notApplicableMessage: {
    mb: 1.5,
  },
  notApplicableText: {
    ...typographyStyles.caption,
    ...typographyStyles.italic,
  },
  viewButton: {
    ...buttonStyles.base,
    ...buttonStyles.view,
  },
  editButton: {
    ...buttonStyles.base,
    ...buttonStyles.edit,
  },
  deleteButton: {
    ...buttonStyles.base,
    ...buttonStyles.delete,
  },
  actionButtonsContainer: {
    display: 'flex',
    gap: 0.5,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    mt: 1,
  },
};

// ActivityDetailsModal specific styles
export const activityDetailsModalStyles = {
  drawer: {
    '& .MuiDrawer-paper': {
      width: { xs: '100%', sm: 500, md: 600, lg: 700 },
      maxWidth: '100vw',
      boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.1)',
      border: 'none',
    },
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    p: 3,
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#fafafa',
  },
  headerTitleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
  content: {
    p: 3,
    height: '100%',
    overflowY: 'auto',
  },
  section: {
    mb: 3,
  },
  sectionTitle: {
    fontWeight: 600,
    color: '#333',
    mb: 1.5,
    fontSize: '1rem',
  },
  activityTitle: {
    fontWeight: 600,
    color: '#333',
    mb: 1,
    fontSize: '1.15rem',
  },
  divider: {
    mb: 3,
  },
  field: {
    mb: 2,
  },
  fieldLabel: {
    color: 'text.secondary',
    fontSize: '0.85rem',
    mb: 0.5,
    fontWeight: 500,
  },
  fieldValue: {
    fontWeight: 500,
    fontSize: '0.95rem',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
    gap: 2,
  },
  commentsText: {
    fontStyle: 'italic',
    color: '#666',
    fontSize: '0.95rem',
  },
  notApplicableText: {
    fontStyle: 'italic',
    fontSize: '0.95rem',
  },
  actionButtons: {
    display: 'flex',
    gap: 0.5,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    mt: 3,
    pt: 2,
    borderTop: '1px solid #e0e0e0',
  },
  editButton: {
    ...buttonStyles.base,
    ...buttonStyles.edit,
  },
  deleteButton: {
    ...buttonStyles.base,
    ...buttonStyles.delete,
  },
};
