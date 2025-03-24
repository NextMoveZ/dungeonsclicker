import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/stores/useAuth";
import AdminPanel from "@/components/admin/admin-panel";

export default function Admin() {
  const { isAdmin, isAuthenticated, checkAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const authenticated = await checkAuth();
      if (!authenticated) {
        navigate("/login");
      } else if (!isAdmin) {
        navigate("/");
      }
    };
    
    checkAdminStatus();
  }, [checkAuth, isAdmin, navigate]);

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  if (!isAdmin) {
    navigate("/");
    return null;
  }

  return <AdminPanel />;
}
