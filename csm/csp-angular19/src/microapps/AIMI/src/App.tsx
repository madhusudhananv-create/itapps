import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { lazy, Suspense } from 'react';
import { AuthProvider } from '@auth/context/AuthProvider';
import { ProjectDataProvider } from '@shared/context/ProjectDataProvider';
import { Loading } from '@shared/components/Loading';
import { useFeatureFlags } from '@shared/hooks/useFeatureFlags';

// Lazy load route-level components to minimize initial bundle
const Login = lazy(() =>
  import('@auth/components/Login').then((module) => ({
    default: module.Login,
  }))
);
const ProtectedRoute = lazy(() =>
  import('@auth/components/ProtectedRoute').then((module) => ({
    default: module.ProtectedRoute,
  }))
);
const Layout = lazy(() =>
  import('@shared/components/Layout').then((module) => ({
    default: module.Layout,
  }))
);
const NotFound = lazy(() =>
  import('@shared/components/NotFound').then((module) => ({
    default: module.NotFound,
  }))
);
const Activities = lazy(() =>
  import('@activities/components/Activities').then((module) => ({
    default: module.Activities,
  }))
);
const Dashboard = lazy(() =>
  import('@dashboard/components/Dashboard').then((module) => ({
    default: module.Dashboard,
  }))
);
const Reports = lazy(() =>
  import('@reports/components/Reports').then((module) => ({
    default: module.Reports,
  }))
);
const Backup = lazy(() =>
  import('@backup/components/Backup').then((module) => ({
    default: module.Backup,
  }))
);

const theme = createTheme({
  palette: {
    primary: {
      main: '#0066FF',
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: '#fff',
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: '#0066FF',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          padding: '12px',
          fontSize: '1rem',
        },
      },
    },
  },
});

function AppRoutes() {
  const dashboardFlags = useFeatureFlags('dashboard');
  const activitiesFlags = useFeatureFlags('activities');
  const reportsFlags = useFeatureFlags('reports');
  const backupFlags = useFeatureFlags('backup');

  // Determine default route based on feature flags
  const getDefaultRoute = () => {
    if (activitiesFlags.enabled) return '/activities';
    if (dashboardFlags.enabled) return '/dashboard';
    if (reportsFlags.enabled) return '/reports';
    if (backupFlags.enabled) return '/backup';
    return '/activities'; // fallback
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <Suspense fallback={<Loading text="Loading..." />}>
            <ProtectedRoute>
              <Layout>
                <Routes>
                  {activitiesFlags.enabled && (
                    <Route path="/activities" element={<Activities />} />
                  )}
                  {dashboardFlags.enabled && (
                    <Route path="/dashboard" element={<Dashboard />} />
                  )}
                  {reportsFlags.enabled && (
                    <Route path="/reports" element={<Reports />} />
                  )}
                  {backupFlags.enabled && (
                    <Route path="/backup" element={<Backup />} />
                  )}
                  <Route
                    path="/"
                    element={<Navigate to={getDefaultRoute()} replace />}
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          </Suspense>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ProjectDataProvider>
          <Router basename="/aimi">
            <AppRoutes />
          </Router>
        </ProjectDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
