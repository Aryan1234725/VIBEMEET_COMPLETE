import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button, Card, CardContent, Typography,
  Chip, Snackbar, Alert, CircularProgress, IconButton
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DiamondIcon from "@mui/icons-material/Diamond";
import HomeIcon from "@mui/icons-material/Home";
import { processPayment } from "../utils/razorpay";
import { AuthContext } from "../contexts/AuthContext";

const plans = [
  {
    name: "Free",
    price: 0,
    label: "Current Plan",
    features: [
      "5 participants max",
      "40 min time limit",
      "Basic chat only",
      "No recording",
    ],
    color: "#888",
    planKey: "FREE",
  },
  {
    name: "Pro",
    price: 499,
    label: "Upgrade ₹499/mo",
    features: [
      "100 participants",
      "Unlimited time",
      "Cloud recording",
      "Priority support",
    ],
    color: "#1976d2",
    planKey: "PRO",
  },
];

export default function Payment() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // Get token from localStorage
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const handlePayment = async (plan) => {
    if (plan.price === 0) return;
    
    if (!token) {
      setSnackbar({ open: true, message: "Please login first", severity: "error" });
      navigate("/auth");
      return;
    }
    
    setLoading(true);
    try {
      await processPayment(plan.planKey);
      setSnackbar({ open: true, message: "Payment successful! Your subscription has been upgraded to " + plan.planKey, severity: "success" });
    } catch (error) {
      console.error("Payment error:", error);
      setSnackbar({ open: true, message: error.message || "Payment failed", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "2rem" }}>
      
      <IconButton 
        onClick={() => navigate("/home")}
        sx={{ color: "white", mb: 2 }}
      >
        <HomeIcon />
      </IconButton>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <DiamondIcon sx={{ fontSize: 60, color: "#FFD700", mb: 2 }} />
          <Typography variant="h3" sx={{ color: "white", fontWeight: "bold", mb: 1 }}>
            Choose Your Plan
          </Typography>
          <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.8)" }}>
            Upgrade to unlock all premium features
          </Typography>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
          {plans.map((plan) => (
            <Card
              key={plan.name}
              elevation={plan.price > 0 ? 8 : 3}
              sx={{
                position: "relative",
                borderRadius: "16px",
                border: plan.price > 0 ? "3px solid #FFD700" : "none",
                transition: "transform 0.3s",
                "&:hover": { transform: "translateY(-8px)" }
              }}
            >
              {plan.price > 0 && (
                <Chip
                  icon={<CheckCircleIcon />}
                  label="POPULAR"
                  color="primary"
                  sx={{ position: "absolute", top: 16, right: 16, fontWeight: "bold" }}
                />
              )}

              <CardContent sx={{ p: 4 }}>
                <Typography variant="overline" sx={{ color: plan.color, fontWeight: "bold" }}>
                  {plan.name}
                </Typography>
                <Typography variant="h3" sx={{ my: 2, fontWeight: "bold", color: plan.color }}>
                  {plan.price === 0 ? "Free" : `₹${plan.price}`}
                  {plan.price > 0 && (
                    <Typography component="span" variant="h6" sx={{ color: "text.secondary" }}>
                      /mo
                    </Typography>
                  )}
                </Typography>

                <div style={{ marginTop: "2rem", marginBottom: "2rem" }}>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem" }}>
                      <CheckCircleIcon sx={{ color: plan.color, mr: 1, fontSize: 20 }} />
                      <Typography variant="body2">{feature}</Typography>
                    </div>
                  ))}
                </div>

                <Button
                  fullWidth
                  variant={plan.price > 0 ? "contained" : "outlined"}
                  size="large"
                  disabled={plan.price === 0 || loading}
                  onClick={() => handlePayment(plan)}
                  sx={{
                    borderRadius: "8px",
                    py: 1.5,
                    fontWeight: "bold",
                    backgroundColor: plan.price > 0 ? plan.color : "transparent",
                    "&:hover": { backgroundColor: plan.price > 0 ? "#1565c0" : "transparent" }
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : plan.label}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}