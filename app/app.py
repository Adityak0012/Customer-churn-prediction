"""ChurnRadar: customer churn prediction API + web app.

Run:  python app/app.py   then open http://127.0.0.1:5000
The React frontend (frontend/) is built into app/static/dist and served from here.
"""
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import shap
from flask import Flask, jsonify, request, send_from_directory
from sklearn.pipeline import Pipeline
from xgboost import XGBClassifier

ROOT = Path(__file__).resolve().parent.parent
# XGBoost model in its native JSON format (portable across OS / Python versions),
# scikit-learn preprocessing step with joblib.
PREP = joblib.load(ROOT / "models" / "preprocessor.joblib")
XGB = XGBClassifier()
XGB.load_model(ROOT / "models" / "xgb_model.json")
MODEL = Pipeline([("prep", PREP), ("model", XGB)])
META = json.load(open(ROOT / "models" / "model_meta.json"))
EXPLAINER = shap.TreeExplainer(XGB)

# ---- Currency ---------------------------------------------------------------------------
# The model was trained on US telecom data in US dollars. The app works in Indian rupees and
# converts with a purchasing-power-parity rate (same approach as the CreditLens project).
INR_PER_USD = 21.0

SERVICES = ["OnlineSecurity", "OnlineBackup", "DeviceProtection", "TechSupport", "StreamingTV", "StreamingMovies"]
YES_NO = {"Yes", "No"}
CHOICES = {
    "gender": {"Male", "Female"}, "SeniorCitizen": YES_NO, "Partner": YES_NO, "Dependents": YES_NO,
    "PhoneService": YES_NO, "MultipleLines": YES_NO, "InternetService": {"DSL", "Fiber optic", "No"},
    "Contract": {"Month-to-month", "One year", "Two year"}, "PaperlessBilling": YES_NO,
    "PaymentMethod": {"Electronic check", "Mailed check", "Bank transfer (automatic)", "Credit card (automatic)"},
    **{s: YES_NO for s in SERVICES},
}
FRIENDLY = {
    "Contract": "Contract type", "tenure": "Tenure", "InternetService": "Internet service",
    "MonthlyCharges": "Monthly charges", "TotalCharges": "Total spend to date", "PaymentMethod": "Payment method",
    "PaperlessBilling": "Paperless billing", "OnlineSecurity": "Online security", "TechSupport": "Tech support",
    "OnlineBackup": "Online backup", "DeviceProtection": "Device protection", "StreamingTV": "Streaming TV",
    "StreamingMovies": "Streaming movies", "SeniorCitizen": "Senior citizen", "Partner": "Has partner",
    "Dependents": "Has dependents", "PhoneService": "Phone service", "MultipleLines": "Multiple lines",
    "gender": "Gender", "NumServices": "Number of services", "IsNewCustomer": "Tenure",
    "AutoPay": "Payment method", "HasProtection": "Security / support add-ons",
}

app = Flask(__name__, static_folder="static")
DIST = Path(app.static_folder) / "dist"


def add_features(d: pd.DataFrame) -> pd.DataFrame:
    """Same feature engineering as notebooks/02_modeling.ipynb."""
    d = d.copy()
    d["NumServices"] = (d[SERVICES] == "Yes").sum(axis=1) + (d["PhoneService"] == "Yes")
    d["IsNewCustomer"] = (d["tenure"] <= 12).astype(int)
    d["AutoPay"] = d["PaymentMethod"].str.contains("automatic").astype(int)
    d["HasProtection"] = ((d["OnlineSecurity"] == "Yes") | (d["TechSupport"] == "Yes")).astype(int)
    return d


def validate(p: dict):
    for k, allowed in CHOICES.items():
        if p.get(k) not in allowed:
            raise ValueError(f"{k} has an unknown value")
    if not 0 <= int(p["tenure"]) <= 72:
        raise ValueError("tenure must be between 0 and 72 months")
    if not 300 <= float(p["MonthlyCharges"]) <= 3000:
        raise ValueError("Monthly charges must be between ₹300 and ₹3,000")


def build_frame(p: dict) -> pd.DataFrame:
    """Turn the form (INR, simple Yes/No answers) into the model's raw columns (USD, dataset labels)."""
    internet = p["InternetService"] != "No"
    phone = p["PhoneService"] == "Yes"
    monthly_usd = float(p["MonthlyCharges"]) / INR_PER_USD
    tenure = int(p["tenure"])
    row = {
        "gender": p["gender"], "SeniorCitizen": p["SeniorCitizen"], "Partner": p["Partner"], "Dependents": p["Dependents"],
        "tenure": tenure, "PhoneService": p["PhoneService"],
        "MultipleLines": p["MultipleLines"] if phone else "No phone service",
        "InternetService": p["InternetService"],
        **{s: (p[s] if internet else "No internet service") for s in SERVICES},
        "Contract": p["Contract"], "PaperlessBilling": p["PaperlessBilling"], "PaymentMethod": p["PaymentMethod"],
        "MonthlyCharges": monthly_usd,
        "TotalCharges": monthly_usd * max(tenure, 1) if tenure > 0 else 0.0,
    }
    return add_features(pd.DataFrame([row]))


def score(p: dict) -> float:
    return float(MODEL.predict_proba(build_frame(p))[0, 1])


def explain(frame: pd.DataFrame):
    names = [n.split("__", 1)[1] for n in PREP.get_feature_names_out()]
    values = EXPLAINER(PREP.transform(frame)).values[0]
    raw_cols = list(CHOICES) + ["tenure", "MonthlyCharges", "TotalCharges"]
    grouped = {}
    for name, v in zip(names, values):
        base = next((c for c in raw_cols if name == c or name.startswith(c + "_")), name)
        label = FRIENDLY.get(base, base)
        grouped[label] = grouped.get(label, 0.0) + float(v)
    items = sorted(grouped.items(), key=lambda kv: abs(kv[1]), reverse=True)[:6]
    return [{"feature": k, "impact": round(v, 3)} for k, v in items]


def tier(prob: float):
    low, high = META["tiers"]
    if prob < low:
        return "low", "Low risk", "Likely to stay"
    if prob < high:
        return "medium", "Medium risk", "Watch closely"
    return "high", "High risk", "Likely to churn"


def retention_actions(p: dict, base: float):
    """Re-score the customer with one change at a time (model-based what-if, not a causal estimate)."""
    internet = p["InternetService"] != "No"
    candidates = []
    if p["Contract"] == "Month-to-month":
        candidates.append(("one_year", "Offer a 1-year contract", "Lock in the customer with a 12-month plan", {"Contract": "One year"}))
    if p["Contract"] != "Two year":
        candidates.append(("two_year", "Offer a 2-year contract", "Longest commitment, usually with a loyalty discount", {"Contract": "Two year"}))
    if internet and p["TechSupport"] == "No":
        candidates.append(("tech", "Add free tech support", "Support add-on for the next billing cycles", {"TechSupport": "Yes"}))
    if internet and p["OnlineSecurity"] == "No":
        candidates.append(("security", "Add online security", "Bundle the security add-on at no extra cost", {"OnlineSecurity": "Yes"}))
    if "automatic" not in p["PaymentMethod"]:
        candidates.append(("autopay", "Move to auto-pay", "Switch billing to automatic card payment", {"PaymentMethod": "Credit card (automatic)"}))
    discounted = round(float(p["MonthlyCharges"]) * 0.9 / 10) * 10
    if discounted >= 300:
        candidates.append(("discount", "Give a 10% discount", f"Monthly bill drops to ₹{discounted:,.0f}", {"MonthlyCharges": discounted}))

    out = []
    for key, title, detail, patch in candidates:
        new = score({**p, **patch})
        out.append({"id": key, "title": title, "detail": detail, "patch": patch,
                    "new_probability": round(new, 4), "reduction_pp": round((base - new) * 100, 1)})
    return sorted([a for a in out if a["reduction_pp"] >= 0.5], key=lambda a: -a["reduction_pp"])


@app.route("/")
def index():
    if not (DIST / "index.html").exists():
        return "Frontend not built yet. Run: cd frontend && npm install && npm run build", 503
    return send_from_directory(DIST, "index.html")


@app.route("/api/meta")
def meta():
    return jsonify({"metrics": META["test_metrics"], "tiers": META["tiers"], "churn_rate": META["churn_rate"],
                    "currency": {"code": "INR", "inr_per_usd": INR_PER_USD}})


@app.route("/api/predict", methods=["POST"])
def predict():
    try:
        p = request.get_json(force=True)
        validate(p)
        frame = build_frame(p)
    except (KeyError, ValueError, TypeError) as exc:
        return jsonify({"error": f"Invalid input: {exc}"}), 400
    prob = float(MODEL.predict_proba(frame)[0, 1])
    key, label, headline = tier(prob)
    monthly = float(p["MonthlyCharges"])
    return jsonify({
        "probability": round(prob, 4), "tier": key, "tier_label": label, "headline": headline,
        "churn_rate": META["churn_rate"],
        "monthly_revenue": monthly,
        "revenue_at_risk": round(monthly * 12 * prob),   # expected annual revenue lost (INR)
        "drivers": explain(frame),
        "actions": retention_actions(p, prob),
    })


if __name__ == "__main__":
    app.run(debug=False)
