// Signup is handled directly in Login.tsx via mode toggle — redirect to /login
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/login?mode=signup", { replace: true }); }, [navigate]);
  return null;
}
