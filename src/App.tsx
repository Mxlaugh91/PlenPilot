import { AuthProvider, useAuth } from "./features/auth";
import { LoginPage } from "./features/auth/LoginPage";
import { AdminDashboard } from "./features/admin/AdminDashboard";
import { EmployeeDashboard } from "./features/employee/EmployeeDashboard";
import { InstallPrompt } from "./components/ui/InstallPrompt";
import { LoadingScreen } from "./components/ui/LoadingScreen";

/**
 * App Component
 *
 * Root component that wraps the entire application with AuthProvider.
 * Manages authentication state and conditional rendering based on user role.
 */
export default function App() {
  return (
    <AuthProvider>
      <InstallPrompt />
      <AppContent />
    </AuthProvider>
  );
}

/**
 * AppContent Component
 *
 * Handles conditional rendering based on authentication state.
 * Shows:
 * - Loading spinner while checking auth state
 * - LoginPage if user is not authenticated
 * - Dashboard based on user role if authenticated
 */
function AppContent() {
  const { user, loading } = useAuth();

  // Show loading state while checking for persisted session
  if (loading) {
    return <LoadingScreen message="Laster PlenPilot..." />;
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage />;
  }

  // Show dashboard based on user role
  if (user.role === "admin") {
    return <AdminDashboard />;
  }

  if (user.role === "employee") {
    return <EmployeeDashboard />;
  }

  // Fallback for unknown roles (should never happen with proper typing)
  console.error(`Unknown user role: ${user.role}`);
  return <LoginPage />;
}
