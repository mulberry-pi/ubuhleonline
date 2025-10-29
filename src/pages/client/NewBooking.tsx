import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function NewBooking() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to search page immediately
    navigate("/search", { replace: true });
  }, [navigate]);

  return null;
}
