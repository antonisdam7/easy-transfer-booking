import { Navigate } from "react-router-dom";
import { getAdminToken } from "@/lib/auth";

type ProtectedRouteProps = {
  children: JSX.Element;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!getAdminToken()) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
