import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import AdvisorDashboard from "./pages/AdvisorDashboard";
import { useAuth } from "./context/AuthContext";
import AdminAdvisors from "./pages/AdminAdvisors";
import AdminTemplates from "./pages/AdminTemplates";
import AdvisorLeads from "./pages/AdvisorLeads";
import AdvisorBrowseContacts from "./pages/AdvisorBrowseContacts";
import AdvisorContactsHome from "./pages/AdvisorContactsHome";
import AdvisorCreateContact from "./pages/AdvisorCreateContact";
import AdvisorImportContacts from "./pages/AdvisorImportContacts";
import AdvisorContactBatches from "./pages/AdvisorContactBatches";
import AdminContacts from "./pages/AdminContacts";
import ProfilePage from "./pages/ProfilePage";
import AdminPasswordRequests from "./pages/AdminPasswordRequests";
import AdminResources from "./pages/AdminResources";
import AdminSubscriptions from "./pages/AdminSubscriptions";
import AdminCompanies from "./pages/AdminCompanies";
import AdvisorResources from "./pages/AdvisorResources";
import AdvisorSubscription from "./pages/AdvisorSubscription";
import Pricing from "./pages/Pricing";
import Features from "./pages/Features";
import FAQ from "./pages/FAQ";
import ContactUs from "./pages/ContactUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import RefundPolicy from "./pages/RefundPolicy";
import CancellationPolicy from "./pages/CancellationPolicy";
import Security from "./pages/Security";
import AboutUs from "./pages/AboutUs";

function ProtectedRoute({ children, allowedRole }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/pricing" element={<Pricing />} />
      <Route path="/features" element={<Features />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/contact-us" element={<ContactUs />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      <Route path="/refund-policy" element={<RefundPolicy />} />
      <Route path="/cancellation-policy" element={<CancellationPolicy />} />
      <Route path="/security" element={<Security />} />
      <Route path="/about" element={<AboutUs />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/advisor"
        element={
          <ProtectedRoute allowedRole="ADVISOR">
            <AdvisorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
  path="/advisor/profile"
  element={
    <ProtectedRoute allowedRole="ADVISOR">
      <ProfilePage />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/resources"
  element={
    <ProtectedRoute allowedRole="ADMIN">
      <AdminResources />
    </ProtectedRoute>
  }
/>

<Route
  path="/advisor/resources"
  element={
    <ProtectedRoute allowedRole="ADVISOR">
      <AdvisorResources />
    </ProtectedRoute>
  }
/>
<Route
  path="/advisor/subscription"
  element={
    <ProtectedRoute allowedRole="ADVISOR">
      <AdvisorSubscription />
    </ProtectedRoute>
  }
/>
      <Route
  path="/admin/advisors"
  element={
    <ProtectedRoute allowedRole="ADMIN">
      <AdminAdvisors />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/templates"
  element={
    <ProtectedRoute allowedRole="ADMIN">
      <AdminTemplates />
    </ProtectedRoute>
  }
/>
<Route
  path="/advisor/leads"
  element={
    <ProtectedRoute allowedRole="ADVISOR">
      <AdvisorLeads />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/password-requests"
  element={
    <ProtectedRoute allowedRole="ADMIN">
      <AdminPasswordRequests />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/contacts"
  element={
    <ProtectedRoute allowedRole="ADMIN">
      <AdminContacts />
    </ProtectedRoute>
  }
/>
<Route
  path="/advisor/contacts/browse"
  element={
    <ProtectedRoute allowedRole="ADVISOR">
      <AdvisorBrowseContacts />
    </ProtectedRoute>
  }
/>
<Route
  path="/advisor/contacts"
  element={
    <ProtectedRoute allowedRole="ADVISOR">
      <AdvisorContactsHome />
    </ProtectedRoute>
  }
/>
<Route
  path="/advisor/contacts/create"
  element={
    <ProtectedRoute allowedRole="ADVISOR">
      <AdvisorCreateContact />
    </ProtectedRoute>
  }
/>
<Route
  path="/advisor/contacts/import"
  element={
    <ProtectedRoute allowedRole="ADVISOR">
      <AdvisorImportContacts />
    </ProtectedRoute>
  }
/>
<Route
  path="/advisor/contacts/batches"
  element={
    <ProtectedRoute allowedRole="ADVISOR">
      <AdvisorContactBatches />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/subscriptions"
  element={
    <ProtectedRoute allowedRole="ADMIN">
      <AdminSubscriptions />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/companies"
  element={
    <ProtectedRoute allowedRole="ADMIN">
      <AdminCompanies />
    </ProtectedRoute>
  }
/>
    </Routes>
    
  );
}

export default App;