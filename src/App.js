import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import CreateDocumentPage from "@/pages/CreateDocumentPage";
import MyDocumentsPage from "@/pages/MyDocumentsPage";
import DocumentDetailPage from "@/pages/DocumentDetailPage";
import AdminPage from "@/pages/AdminPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import SettingsPage from "@/pages/SettingsPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>
          } />
          <Route path="/documents" element={
            <ProtectedRoute><Layout><MyDocumentsPage /></Layout></ProtectedRoute>
          } />
          <Route path="/documents/new" element={
            <ProtectedRoute><Layout><CreateDocumentPage /></Layout></ProtectedRoute>
          } />
          <Route path="/documents/:id" element={
            <ProtectedRoute><Layout><DocumentDetailPage /></Layout></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly><Layout><AdminPage /></Layout></ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute><Layout><SettingsPage /></Layout></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
