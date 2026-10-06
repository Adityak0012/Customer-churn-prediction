// Customer profile defaults, presets and option lists (amounts in ₹).
export const SERVICES = [
  ["OnlineSecurity", "Online security"], ["TechSupport", "Tech support"], ["OnlineBackup", "Online backup"],
  ["DeviceProtection", "Device protection"], ["StreamingTV", "Streaming TV"], ["StreamingMovies", "Streaming movies"],
];

export const PAYMENT_METHODS = [
  ["Electronic check", "Electronic check"], ["Mailed check", "Mailed check"],
  ["Bank transfer (automatic)", "Bank transfer (auto-pay)"], ["Credit card (automatic)", "Credit card (auto-pay)"],
];

const base = {
  gender: "Female", SeniorCitizen: "No", Partner: "No", Dependents: "No",
  tenure: 3, PhoneService: "Yes", MultipleLines: "No", InternetService: "Fiber optic",
  OnlineSecurity: "No", OnlineBackup: "No", DeviceProtection: "No", TechSupport: "No", StreamingTV: "Yes", StreamingMovies: "No",
  Contract: "Month-to-month", PaperlessBilling: "Yes", PaymentMethod: "Electronic check", MonthlyCharges: 1900,
};

export const PRESETS = [
  { id: "newcomer", label: "At-risk newcomer", profile: base },
  { id: "streamer", label: "Fiber streamer", profile: { ...base, gender: "Male", Partner: "Yes", tenure: 20, OnlineBackup: "Yes",
    StreamingMovies: "Yes", Contract: "One year", PaymentMethod: "Mailed check", MonthlyCharges: 2100 } },
  { id: "loyal", label: "Loyal family", profile: { ...base, Partner: "Yes", Dependents: "Yes", tenure: 60, InternetService: "DSL",
    OnlineSecurity: "Yes", OnlineBackup: "Yes", TechSupport: "Yes", StreamingTV: "No", Contract: "Two year", PaperlessBilling: "No",
    PaymentMethod: "Bank transfer (automatic)", MonthlyCharges: 1400 } },
];

export const DEFAULT_PROFILE = base;

export const inr = (v) => "₹" + Math.round(v).toLocaleString("en-IN");
export const pct = (p) => (p >= 0.9995 ? ">99.9%" : `${(p * 100).toFixed(1)}%`);
