import os
import json
import pickle
import tempfile
import numpy as np
import torch
import pandas as pd
from datetime import datetime, timedelta
import base64
from flask import Flask, request, jsonify
from ultralytics import YOLO
from PIL import Image
import io
import storage as st
import joblib
import database.db_connect as db
from firebase_integration import get_firebase_fetcher
from config import FIREBASE_DATABASE_URL, FIREBASE_AUTH_TOKEN

import sqlite3

SQLITE_DB_PATH = "soil_data.db"

def get_sqlite_connection():
    conn = sqlite3.connect(SQLITE_DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_sqlite_db():
    conn = get_sqlite_connection()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS soil_readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        nitrogen REAL,
        phosphorus REAL,
        potassium REAL,
        ph REAL,
        moisture REAL,
        temperature REAL,
        ec REAL,
        fertilizer_type TEXT,
        fertilizer_amount REAL
    )
    """)

    # Migrate: add new columns if they don't exist yet
    for col, col_type in [("fertilizer_type", "TEXT"), ("fertilizer_amount", "REAL")]:
        try:
            cur.execute(f"ALTER TABLE soil_readings ADD COLUMN {col} {col_type}")
        except sqlite3.OperationalError:
            pass  # Column already exists

    conn.commit()
    cur.close()
    conn.close()

init_sqlite_db()
# -----------------------------------
# Prevent Torch / OpenMP thread issues
# -----------------------------------
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
torch.set_num_threads(1)

# Disable TensorFlow warnings and set CPU-only mode
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Suppress TF warnings
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'  # Force CPU only
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'  # Disable oneDNN optimizations that may cause issues

app = Flask(__name__)

# ===================================
# 🔥 LIVE SENSOR STORAGE (NEW)
# ===================================
# ==============================
# 🔥 LIVE SENSOR STORAGE
# ==============================
latest_sensor_data = {
    "Nitrogen": 0,
    "Phosphorus": 0,
    "Potassium": 0,
    "pH": 0,
    "Moisture": 0,
    "soil_temp": 0,
    "EC": 0
}

# Initialize Firebase fetcher
try:
    firebase_fetcher = get_firebase_fetcher(FIREBASE_DATABASE_URL, FIREBASE_AUTH_TOKEN)
    print(f"[INFO] Firebase integration initialized: {FIREBASE_DATABASE_URL}")
except Exception as e:
    print(f"[WARN] Firebase initialization failed: {e}")
    firebase_fetcher = None

# ==============================
# 📡 UPDATE SENSOR DATA (ESP32)
# ==============================
@app.route("/update-live-sensor", methods=["POST"])
def update_live_sensor():
    global latest_sensor_data

    try:
        data = request.get_json()

        latest_sensor_data = {
            "Nitrogen": float(data.get("Nitrogen", 0)),
            "Phosphorus": float(data.get("Phosphorus", 0)),
            "Potassium": float(data.get("Potassium", 0)),
            "pH": float(data.get("pH", 0)),
            "Moisture": float(data.get("Moisture", 0)),
            "soil_temp": float(data.get("soil_temp", data.get("Temperature", 0))),
            "EC": float(data.get("EC", 0))
        }

        print("✅ LIVE SENSOR UPDATED:", latest_sensor_data)

        return jsonify({"success": True, "data": latest_sensor_data})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ==============================
# 📊 GET LIVE SENSOR DATA
# ==============================
@app.route("/get-live-sensor", methods=["GET"])
def get_live_sensor():
    """
    Get live sensor data - fetches from Firebase if available,
    otherwise returns last known data
    """
    global latest_sensor_data
    
    # Try to fetch fresh data from Firebase
    if firebase_fetcher:
        try:
            firebase_data = firebase_fetcher.fetch_soil_data()
            if firebase_data:
                # Update global sensor data with Firebase values
                latest_sensor_data = {
                    "Nitrogen": firebase_data.get("Nitrogen", 0),
                    "Phosphorus": firebase_data.get("Phosphorus", 0),
                    "Potassium": firebase_data.get("Potassium", 0),
                    "pH": firebase_data.get("pH", 0),
                    "Moisture": firebase_data.get("Moisture", 0),
                    "Temperature": firebase_data.get("Temperature", 0),
                    "EC": firebase_data.get("EC", 0)
                }
                print(f"[INFO] Sensor data fetched from Firebase")
        except Exception as e:
            print(f"[WARN] Failed to fetch from Firebase: {e}")
    
    return jsonify({
        "success": True,
        "data": latest_sensor_data,
        "source": "firebase" if firebase_fetcher else "local"
    })

# Create bid_offers table if not exists
try:
    conn = db.get_db_connection()
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS bid_offers (
        id SERIAL PRIMARY KEY,
        bid_id INTEGER REFERENCES bids(id),
        user_id INTEGER,
        amount DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        message TEXT,
        type TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    conn.commit()
    cur.close()
    conn.close()
    print("[INFO] DB tables (bid_offers, notifications) ensured")
except Exception as e:
    print(f"[WARN] Could not create tables: {e}")

# -----------------------------------
# Safe Base Directory
# -----------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

# YOLO Disease Segmentation Model
disease_model = YOLO('best2.pt')

# YOLO Classification Model
try:
    cls_model = YOLO(os.path.join(MODEL_DIR, "best.pt"))
except Exception as e:
    cls_model = None
    print(f"[WARN] YOLO cls model not loaded: {e}")

# Tea Price Model
try:
    tea_model = joblib.load(os.path.join(MODEL_DIR, "tea_price_model.pkl"))
except Exception as e:
    tea_model = None
    print(f"[WARN] Tea price model not loaded: {e}")

# Soil Model
try:
    soil_model = joblib.load(os.path.join(MODEL_DIR, "soil_analyzer.pkl"))
except Exception as e:
    soil_model = None
    print(f"[WARN] Soil ML model not loaded: {e}")

# -----------------------------------
# CoLeaf Model (MobileNetV2 Keras)
# Try .keras first, fall back to .h5
# -----------------------------------
coleaf_model       = None
coleaf_class_names = []

try:
    from tensorflow.keras.models import load_model as keras_load_model

    keras_path = os.path.join(MODEL_DIR, "coleaf_mobilenetv2.keras")
    h5_path    = os.path.join(MODEL_DIR, "coleaf_mobilenetv2.h5")

    if os.path.exists(keras_path):
        coleaf_model = keras_load_model(keras_path)
        print("[INFO] CoLeaf model loaded from .keras")
    elif os.path.exists(h5_path):
        coleaf_model = keras_load_model(h5_path)
        print("[INFO] CoLeaf model loaded from .h5")
    else:
        print("[WARN] No CoLeaf model file found in models/")

    # Load class names — try class_labels.json first, then pkl metadata
    labels_path = os.path.join(MODEL_DIR, "class_labels.json")
    pkl_path    = os.path.join(MODEL_DIR, "coleaf_model.pkl")

    if os.path.exists(labels_path):
        with open(labels_path, "r") as f:
            coleaf_class_names = json.load(f)["classes"]
        print(f"[INFO] CoLeaf classes: {coleaf_class_names}")
    elif os.path.exists(pkl_path):
        with open(pkl_path, "rb") as f:
            meta = pickle.load(f)
        coleaf_class_names = meta.get("class_names", [])
        print(f"[INFO] CoLeaf classes from pkl: {coleaf_class_names}")

except Exception as e:
    coleaf_model = None
    print(f"[WARN] CoLeaf model not loaded: {e}")

    # -----------------------------------
# ==============================
# 🔥 LOAD FERTILIZER MODELS
# ==============================
fert_type_model = None
fert_amount_model = None
fert_scaler = None
fert_label_encoder = None

try:
    print("📂 Loading fertilizer models...")

    fert_type_model = joblib.load(os.path.join(MODEL_DIR, "fertilizer_type_model.pkl"))
    print("✅ Type model loaded")

    fert_amount_model = joblib.load(os.path.join(MODEL_DIR, "fertilizer_amount_model.pkl"))
    print("✅ Amount model loaded")

    fert_scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))
    print("✅ Scaler loaded")

    fert_label_encoder = joblib.load(os.path.join(MODEL_DIR, "label_encoder.pkl"))
    print("✅ Label encoder loaded")

except Exception as e:
    import traceback
    traceback.print_exc()
    print("[ERROR] FERTILIZER MODEL LOADING:", e)


# ==============================
# LOAD LSTM FERTILIZER MODEL
# ==============================
lstm_fert_model = None
lstm_scaler = None
lstm_label_encoder = None
LSTM_SEQ_LENGTH = 15
LSTM_FEATURES = ["nitrogen", "phosphorus", "potassium", "ph", "moisture", "temperature", "ec"]

try:
    from tensorflow.keras.models import load_model as keras_load_model
    lstm_path = os.path.join(MODEL_DIR, "lstm_fertilizer.keras")
    if os.path.exists(lstm_path):
        lstm_fert_model = keras_load_model(lstm_path)
        lstm_scaler = joblib.load(os.path.join(MODEL_DIR, "lstm_scaler.pkl"))
        lstm_label_encoder = joblib.load(os.path.join(MODEL_DIR, "lstm_label_encoder.pkl"))
        print(f"[INFO] LSTM fertilizer model loaded (classes: {list(lstm_label_encoder.classes_)})")
    else:
        print("[WARN] LSTM model file not found")
except Exception as e:
    lstm_fert_model = None
    print(f"[WARN] LSTM model not loaded: {e}")

# Ensemble weight: XGBoost 60%, LSTM 40%
XGB_WEIGHT = 0.6
LSTM_WEIGHT = 0.4


def get_lstm_prediction(current_features):
    """
    Generates a time-series prediction using the LSTM model.
    
    This function:
    1. Fetches the N most recent historical sensor readings from the local SQLite database.
    2. Appends the real-time `current_features` to complete the sequence window.
    3. Feeds this chronologically ordered sequence into the LSTM.
    4. Returns the predicted fertilizer type, confidence, and amount.
    
    Returns `None` if there isn't enough historical data (e.g., a brand new sensor installation),
    in which case the system safely falls back to the XGBoost-only method.
    """
    if not lstm_fert_model or not lstm_scaler or not lstm_label_encoder:
        return None

    try:
        conn = get_sqlite_connection()
        cur = conn.cursor()
        cur.execute(
            f"SELECT {', '.join(LSTM_FEATURES)} FROM soil_readings ORDER BY id DESC LIMIT ?",
            (LSTM_SEQ_LENGTH - 1,)
        )
        past_rows = cur.fetchall()
        cur.close()
        conn.close()

        if len(past_rows) < LSTM_SEQ_LENGTH - 1:
            return None  # Not enough history

        # Build sequence: past readings (oldest first) + current reading
        # The LSTM requires strict chronological order to understand trends (e.g. nutrient depletion)
        past_rows = list(reversed(past_rows))  # Reverse DESC to ASC
        sequence = []
        for row in past_rows:
            sequence.append([row[f] for f in LSTM_FEATURES])
        sequence.append(current_features)

        # Scale the entire sequence using the pre-fitted MinMaxScaler
        seq_array = np.array(sequence, dtype=np.float32)
        seq_scaled = lstm_scaler.transform(seq_array)
        # Keras models expect a batch dimension: (Batch_Size, Sequence_Length, Features)
        seq_input = np.expand_dims(seq_scaled, axis=0)  

        # Execute prediction using the multi-output LSTM
        type_probs, amount_pred = lstm_fert_model.predict(seq_input, verbose=0)
        
        # Process Classification Head (Type)
        type_idx = int(np.argmax(type_probs[0]))
        lstm_type = lstm_label_encoder.inverse_transform([type_idx])[0]
        lstm_confidence = float(np.max(type_probs[0])) * 100
        
        # Process Regression Head (Amount)
        lstm_amount = float(amount_pred[0][0])
        lstm_amount = max(0, min(lstm_amount, 500)) # Sanity clamp

        return {
            "type": lstm_type,
            "confidence": round(lstm_confidence, 2),
            "amount": round(lstm_amount, 2),
        }
    except Exception as e:
        print(f"[WARN] LSTM prediction failed: {e}")
        return None


# ==============================
# PREDICT FERTILIZER (Ensemble)
# ==============================
@app.route("/predict-fertilizer", methods=["POST"])
def predict_fertilizer():
    """
    API endpoint that recommends fertilizer type and amount based on live IoT sensor data.
    
    It employs a Weighted Ensemble Model Strategy:
    - XGBoost (60% weight): Highly accurate for analyzing point-in-time "snapshots" of current soil health.
    - LSTM (40% weight): Analyzes historical trends (depletion/recovery cycles) over the last N readings.
    
    If the LSTM cannot run (due to lack of history or missing files), it automatically
    gracefully degrades to using only the XGBoost model.
    """

    if not all([fert_type_model, fert_amount_model, fert_scaler, fert_label_encoder]):
        return jsonify({
            "success": False,
            "error": "Fertilizer models not loaded"
        }), 500

    try:
        # Use live sensor data
        data = latest_sensor_data

        N = float(data["Nitrogen"])
        P = float(data["Phosphorus"])
        K = float(data["Potassium"])
        pH_val = float(data["pH"])
        moisture = float(data["Moisture"])
        temp = float(data.get("soil_temp", data.get("Temperature", 0)))
        ec = float(data["EC"])

        input_data = np.array([[N, P, K, pH_val, moisture, temp, ec]])

        # --- XGBoost prediction (The "Snapshot" Expert) ---
        xgb_type_pred = fert_type_model.predict(input_data)[0]
        xgb_type = fert_label_encoder.inverse_transform([xgb_type_pred])[0]

        if hasattr(fert_type_model, "predict_proba"):
            xgb_probs = fert_type_model.predict_proba(input_data)[0]
            xgb_confidence = float(np.max(xgb_probs)) * 100
        else:
            xgb_confidence = 100.0

        xgb_amount = float(fert_amount_model.predict(input_data)[0])
        xgb_amount = max(0, min(xgb_amount, 500))

        # --- LSTM prediction (The "Trend" Expert) ---
        current_features = [N, P, K, pH_val, moisture, temp, ec]
        lstm_result = get_lstm_prediction(current_features)

        # --- Ensemble Integration ---
        if lstm_result:
            # 1. Weighted ensemble for continuous regression (Amount)
            final_amount = (XGB_WEIGHT * xgb_amount) + (LSTM_WEIGHT * lstm_result["amount"])

            # 2. Confidence-based ensemble for categorical classification (Type)
            if lstm_result["type"] == xgb_type:
                # Both models agree: Boost confidence
                final_type = xgb_type
                final_confidence = (XGB_WEIGHT * xgb_confidence) + (LSTM_WEIGHT * lstm_result["confidence"])
            elif lstm_result["confidence"] > xgb_confidence:
                # Models disagree: Trust the LSTM if it is highly confident about a historical trend
                final_type = lstm_result["type"]
                final_confidence = lstm_result["confidence"]
            else:
                # Models disagree: Default to XGBoost snapshot
                final_type = xgb_type
                final_confidence = xgb_confidence

            method = "ensemble"
            reason = "Ensemble: XGBoost + LSTM time-series analysis"
            print(f"[ENSEMBLE] XGB={xgb_type}({xgb_confidence:.1f}%) + LSTM={lstm_result['type']}({lstm_result['confidence']:.1f}%) -> {final_type}")
        else:
            # Fallback: LSTM unavailable (e.g. not enough historical records yet)
            final_type = xgb_type
            final_amount = xgb_amount
            final_confidence = xgb_confidence
            method = "xgboost_only"
            reason = "AI-based recommendation (XGBoost)"
            print(f"[XGB-ONLY] {xgb_type} ({xgb_confidence:.1f}%)")

        # Final safety clamp
        final_amount = round(max(0, min(final_amount, 500)), 2)

        # Save to SQLite
        try:
            conn = get_sqlite_connection()
            cur = conn.cursor()
            cur.execute(
                """INSERT INTO soil_readings
                   (nitrogen, phosphorus, potassium, ph, moisture, temperature, ec, fertilizer_type, fertilizer_amount)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (N, P, K, pH_val, moisture, temp, ec, final_type, final_amount)
            )
            conn.commit()
            cur.close()
            conn.close()
            print(f"[DB] Saved: {final_type} @ {final_amount} kg/ha")
        except Exception as db_err:
            print(f"[WARN] SQLite save failed: {db_err}")

        return jsonify({
            "success": True,
            "fertilizer_type": final_type,
            "amount_kg_per_ha": final_amount,
            "confidence_percent": round(final_confidence, 2),
            "reason": reason,
            "input_used": data,
            "model_details": {
                "xgboost": {"type": xgb_type, "confidence": round(xgb_confidence, 2), "amount": round(xgb_amount, 2)},
                "lstm": lstm_result if lstm_result else "not_available",
                "method": method,
                "weights": {"xgboost": XGB_WEIGHT, "lstm": LSTM_WEIGHT} if lstm_result else None
            }
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# -----------------------------------
# CoLeaf Recommendations
# Update keys to match your actual class names
# -----------------------------------
COLEAF_RECOMMENDATIONS = {
    "healthy":        "No action needed. Continue regular care and monitoring.",
    "leaf_blight":    "Apply copper-based fungicide. Remove infected leaves and improve air circulation.",
    "leaf_spot":      "Use mancozeb or chlorothalonil fungicide. Avoid overhead watering.",
    "rust":           "Apply sulfur-based fungicide. Remove and destroy infected plant parts.",
    "powdery_mildew": "Spray neem oil or potassium bicarbonate solution. Reduce humidity.",
    "anthracnose":    "Apply fungicide containing azoxystrobin. Remove debris around plants.",
    "brown_blight":   "Prune affected branches. Use appropriate fungicide and ensure good drainage.",
    "grey_blight":    "Apply copper oxychloride. Improve drainage and reduce leaf wetness.",
    "red_spot":       "Use systemic fungicide. Improve ventilation and avoid waterlogging.",
    "default":        "Consult an agricultural expert for further diagnosis and treatment.",
}

def get_coleaf_recommendation(class_name: str) -> str:
    name_lower = class_name.lower().strip()
    if name_lower in COLEAF_RECOMMENDATIONS:
        return COLEAF_RECOMMENDATIONS[name_lower]
    for key in COLEAF_RECOMMENDATIONS:
        if key in name_lower or name_lower in key:
            return COLEAF_RECOMMENDATIONS[key]
    return COLEAF_RECOMMENDATIONS["default"]


# -----------------------------------
# Health Check
# -----------------------------------
@app.route("/")
def home():
    return jsonify({
        "status": "Tea API Running Successfully",
        "models": {
            "yolo_classify": cls_model     is not None,
            "yolo_disease":  disease_model is not None,
            "coleaf":        coleaf_model  is not None,
             "lstm_fertilizer":    fert_type_model     is not None,
             "tea_price_ml": tea_model is not None,
             "soil_ml":      soil_model is not None,
        }
    })


# 1️⃣ YOLO IMAGE CLASSIFICATION
# ===================================
@app.route("/classify", methods=["POST"])
def classify_image():

    if cls_model is None:
        return jsonify({"success": False, "error": "YOLO model not available"}), 500

    temp_path = None

    try:
        if "image" not in request.files:
            return jsonify({"success": False, "error": "No image file provided"}), 400

        file = request.files["image"]

        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp:
            file.save(temp.name)
            temp_path = temp.name

        results     = cls_model.predict(temp_path, verbose=False)
        probs       = results[0].probs.data.cpu().numpy()
        class_names = cls_model.names

        probabilities = {
            class_names[i]: round(float(probs[i]) * 100, 2)
            for i in range(len(probs))
        }

        max_index       = int(np.argmax(probs))
        max_prob        = float(probs[max_index]) * 100
        predicted_class = class_names[max_index]

        CONF_THRESHOLD = 70
        is_uncertain   = max_prob < CONF_THRESHOLD
        if is_uncertain:
            predicted_class = "unknown"

        return jsonify({
            "success":            True,
            "predicted_class":    predicted_class,
            "confidence_percent": round(max_prob, 2),
            "all_probabilities":  probabilities,
            "is_uncertain":       is_uncertain
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


# ===================================
# 2️⃣ COLEAF — Leaf Disease Classification
# POST  /classify-leaf
# Body  multipart/form-data  →  image (file)
# ===================================
@app.route("/classify-leaf", methods=["POST"])
def classify_leaf():

    if coleaf_model is None:
        return jsonify({"success": False, "error": "CoLeaf model not available"}), 500

    temp_path = None

    try:
        if "image" not in request.files:
            return jsonify({"success": False, "error": "No image file provided"}), 400

        file   = request.files["image"]
        suffix = os.path.splitext(file.filename)[-1] or ".jpg"

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
            file.save(temp.name)
            temp_path = temp.name

        # Preprocess for MobileNetV2  (224×224, rescale to [0,1])
        from tensorflow.keras.preprocessing import image as keras_image
        IMG_SIZE = (224, 224)

        img       = keras_image.load_img(temp_path, target_size=IMG_SIZE)
        img_array = keras_image.img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)   # (1, 224, 224, 3)

        preds     = coleaf_model.predict(img_array, verbose=0)[0]
        max_index = int(np.argmax(preds))
        max_prob  = float(preds[max_index]) * 100

        if coleaf_class_names:
            predicted_class   = coleaf_class_names[max_index]
            all_probabilities = {
                coleaf_class_names[i]: round(float(preds[i]) * 100, 2)
                for i in range(len(preds))
            }
        else:
            predicted_class   = str(max_index)
            all_probabilities = {
                str(i): round(float(preds[i]) * 100, 2)
                for i in range(len(preds))
            }

        CONF_THRESHOLD = 70
        is_uncertain   = max_prob < CONF_THRESHOLD

        if is_uncertain:
            display_class  = "unknown"
            recommendation = "Confidence too low. Please retake the photo in better lighting."
        else:
            display_class  = predicted_class
            recommendation = get_coleaf_recommendation(predicted_class)

        return jsonify({
            "success":            True,
            "predicted_class":    display_class,
            "raw_class":          predicted_class,
            "confidence_percent": round(max_prob, 2),
            "is_uncertain":       is_uncertain,
            "all_probabilities":  all_probabilities,
            "recommendation":     recommendation
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


# ===================================
# 3️⃣ SOIL ANALYZER (Weighted Smart Model)
# ===================================

IDEAL_RANGES = {
    "Nitrogen":    (40,  80),
    "Phosphorus":  (20,  40),
    "Potassium":   (40,  80),
    "pH":          (6.0, 7.5),
    "Moisture":    (30,  60),
    "Temperature": (20,  35),
    "Humidity":    (50,  80),
    "Rainfall":    (80, 200),
}

SOIL_WEIGHTS = {
    "Nitrogen":    0.20,
    "Phosphorus":  0.15,
    "Potassium":   0.15,
    "pH":          0.20,
    "Moisture":    0.10,
    "Temperature": 0.10,
    "Humidity":    0.05,
    "Rainfall":    0.05,
}


def calculate_score(value, min_val, max_val):
    if min_val <= value <= max_val:
        return 100.0
    deviation  = abs(value - min_val) if value < min_val else abs(value - max_val)
    range_span = max_val - min_val
    return max(0.0, 100 - (deviation / range_span) * 100)


@app.route("/analyze-soil", methods=["POST"])
def analyze_soil():

    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No JSON body provided"}), 400

        missing = [key for key in IDEAL_RANGES if key not in data]
        if missing:
            return jsonify({"success": False, "error": f"Missing fields: {missing}"}), 400

        results        = {}
        weighted_score = 0

        for param, (min_val, max_val) in IDEAL_RANGES.items():
            value  = float(data[param])
            score  = calculate_score(value, min_val, max_val)
            weight = SOIL_WEIGHTS[param]
            weighted_score += score * weight

            status = "Good" if score >= 80 else "Moderate" if score >= 50 else "Poor"
            results[param] = {
                "value":         value,
                "ideal_range":   f"{min_val} - {max_val}",
                "score_percent": round(score, 2),
                "weight":        weight,
                "status":        status,
            }

        overall_score  = round(weighted_score, 2)
        soil_condition = (
            "Excellent for Cultivation"     if overall_score >= 80 else
            "Moderate - Improvement Needed" if overall_score >= 60 else
            "Poor - Not Suitable"
        )

        return jsonify({
            "success":                      True,
            "overall_soil_quality_percent": overall_score,
            "soil_condition":               soil_condition,
            "parameter_analysis":           results,
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


# ===================================
# 4️⃣ TEA PRICE PREDICTION
# ===================================

REQUIRED_TEA_FIELDS = [
    "Rainfall_mm", "Avg_Temperature_C", "Max_Temperature_C",
    "Min_Temperature_C", "Humidity_pct", "Sunshine_Hours",
    "Drought_Index", "USD_LKR", "Inflation_Rate", "Fuel_Price",
    "Interest_Rate", "Electricity_Cost", "Production_MT",
    "Auction_Quantity_MT", "Stocks_MT", "Plucking_Rate",
    "Fertilizer_Usage", "Labor_Cost",
    "Price_lag_1", "Price_lag_2", "Price_lag_3",
]


def predict_tea_price(data):

    def normalize(value, min_val, max_val):
        if value < min_val:   return value / min_val
        elif value > max_val: return max_val / value
        return 1.0

    climate_factor = np.mean([
        normalize(data["Rainfall_mm"],       100, 250),
        normalize(data["Avg_Temperature_C"],  18,  30),
        normalize(data["Humidity_pct"],       60,  85),
        normalize(data["Sunshine_Hours"],      4,   8),
    ])

    supply_index      = (
        data["Production_MT"]       * 0.5 +
        data["Auction_Quantity_MT"] * 0.3 +
        data["Stocks_MT"]           * 0.2
    )
    normalized_supply = supply_index / 50000

    cost_index = (
        data["Labor_Cost"]       * 0.4 +
        data["Fuel_Price"]       * 0.2 +
        data["Electricity_Cost"] * 0.2 +
        data["Fertilizer_Usage"] * 0.2
    )

    economic_index = (
        data["USD_LKR"]        *  0.4 +
        data["Inflation_Rate"] *  0.3 -
        data["Interest_Rate"]  *  0.2
    )

    momentum_price = (
        data["Price_lag_1"] * 0.5 +
        data["Price_lag_2"] * 0.3 +
        data["Price_lag_3"] * 0.2
    )

    predicted_price = (
        momentum_price
        + (0.25 * economic_index)
        + (0.30 * cost_index)
        - (0.35 * normalized_supply * 10)
        - (0.15 * climate_factor * 5)
    )

    return round(max(200, predicted_price), 2)


@app.route("/predict-tea-price", methods=["POST"])
def tea_price_endpoint():

    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No JSON body provided"}), 400

        missing = [f for f in REQUIRED_TEA_FIELDS if f not in data]
        if missing:
            return jsonify({"success": False, "error": f"Missing fields: {missing}"}), 400

        numeric_data = {k: float(data[k]) for k in REQUIRED_TEA_FIELDS}
        price        = predict_tea_price(numeric_data)

        return jsonify({"success": True, "predicted_market_price_LKR": price})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


# ===================================
# 4.5️⃣ TEA PRICE & SOIL ML PREDICTION
# ===================================
@app.route("/predict-tea-price-ml", methods=["POST"])
def predict_tea_ml():
    if tea_model is None:
        return jsonify({
            "success": False,
            "error": "Tea price model not available"
        }), 500

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "No JSON body provided"
            }), 400

        missing = [f for f in tea_model.feature_names_in_ if f not in data]
        if missing:
            return jsonify({
                "success": False,
                "error": f"Missing fields: {missing}"
            }), 400

        df = pd.DataFrame([data])
        df = df[tea_model.feature_names_in_]

        prediction = tea_model.predict(df)[0]

        return jsonify({
            "success": True,
            "prediction": float(prediction)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400


SOIL_FEATURES = [
    "Nitrogen",
    "Phosphorus",
    "Potassium",
    "pH",
    "Moisture"
]

@app.route("/analyze-soil-ml", methods=["POST"])
def analyze_soil_ml():
    if soil_model is None:
        return jsonify({
            "success": False,
            "error": "Soil ML model not available"
        }), 500

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "No JSON body provided"
            }), 400

        missing = [f for f in SOIL_FEATURES if f not in data]
        if missing:
            return jsonify({
                "success": False,
                "error": f"Missing fields: {missing}"
            }), 400

        input_data = np.array([[data[f] for f in SOIL_FEATURES]])

        prediction = soil_model.predict(input_data)

        predicted_class = int(np.argmax(prediction))
        confidence = float(np.max(prediction) * 100)

        return jsonify({
            "success": True,
            "predicted_class": predicted_class,
            "confidence_percent": round(confidence, 2)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400


# ===================================
# 5️⃣ SOIL HISTORY
# ===================================
@app.route("/add-soil-reading", methods=["POST"])
def add_soil_reading():
    try:
        data = request.get_json()

        conn = get_sqlite_connection()
        cur = conn.cursor()

        cur.execute(
            """INSERT INTO soil_readings 
               (nitrogen, phosphorus, potassium, ph, moisture, temperature, ec)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                float(data.get("Nitrogen", 0)),
                float(data.get("Phosphorus", 0)),
                float(data.get("Potassium", 0)),
                float(data.get("pH", 0)),
                float(data.get("Moisture", 0)),
                float(data.get("Temperature", 0)),
                float(data.get("EC", 0)) / 100
            )
        )

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"success": True})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

def save_firebase_to_sqlite():
    try:
        if not firebase_fetcher:
            return

        data = firebase_fetcher.fetch_soil_data()
        if not data:
            return

        conn = get_sqlite_connection()
        cur = conn.cursor()

        cur.execute(
            """INSERT INTO soil_readings 
               (nitrogen, phosphorus, potassium, ph, moisture, temperature, ec)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                data.get("Nitrogen", 0),
                data.get("Phosphorus", 0),
                data.get("Potassium", 0),
                data.get("pH", 0),
                data.get("Moisture", 0),
                data.get("Temperature", 0),
                data.get("EC", 0) / 100
            )
        )

        conn.commit()
        cur.close()
        conn.close()

    except Exception as e:
        print("SQLite error:", e)


@app.route("/soil-history", methods=["POST"])
def soil_history():
    try:
        data = request.get_json()
        mode = data.get("mode", "hourly")  # 'hourly' or 'realtime'
        
        start_date_str = data.get("start_date")
        end_date_str   = data.get("end_date")

        conn = get_sqlite_connection()
        cur  = conn.cursor()

        if mode == "realtime":
            # Get last 50 raw readings for better real-time resolution
            cur.execute(
                """SELECT timestamp, nitrogen, phosphorus, potassium, ph, moisture, temperature, humidity, rainfall 
                   FROM soil_readings 
                   ORDER BY timestamp DESC LIMIT 50"""
            )
            rows = cur.fetchall()
            rows.reverse()
        else:
            # Get raw data for the specified range, let frontend aggregate
            if not start_date_str or not end_date_str:
                return jsonify({"success": False, "error": "start_date and end_date required for hourly mode"}), 400
                
            start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
            end_date   = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))

            cur.execute(
                """SELECT timestamp, nitrogen, phosphorus, potassium, ph, moisture, temperature, humidity, rainfall 
                   FROM soil_readings 
                   WHERE timestamp >= %s AND timestamp <= %s 
                   ORDER BY timestamp ASC""",
                (start_date, end_date)
            )
            rows = cur.fetchall()

        cur.close()
        conn.close()

        history_data = []
        for row in rows:
            history_data.append({
                "timestamp":   row[0].isoformat() + "Z",
                "Nitrogen":    float(row[1]) if row[1] else 0.0,
                "Phosphorus":  float(row[2]) if row[2] else 0.0,
                "Potassium":   float(row[3]) if row[3] else 0.0,
                "pH":          float(row[4]) if row[4] else 0.0,
                "Moisture":    float(row[5]) if row[5] else 0.0,
                "Temperature": float(row[6]) if row[6] else 0.0,
                "Humidity":    float(row[7]) if row[7] else 0.0,
                "Rainfall":    float(row[8]) if row[8] else 0.0
            })

        return jsonify({"success": True, "data": history_data})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ===================================
# 6️⃣ YOLO DISEASE SEGMENTATION
# ===================================
@app.route('/predict', methods=['POST'])
def predict():

    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file    = request.files['image']
    img     = Image.open(file.stream)
    results = disease_model(img)[0]

    predictions = {}

    if results.masks is not None:
        masks   = results.masks.data.cpu().numpy()
        classes = results.boxes.cls.cpu().numpy()

        for i, mask in enumerate(masks):
            class_name              = results.names[int(classes[i])]
            pixel_count             = int(np.sum(mask > 0))
            predictions[class_name] = predictions.get(class_name, 0) + pixel_count

    res_plotted = results.plot(labels=False, boxes=False)
    res_img     = Image.fromarray(res_plotted[:, :, ::-1])

    buffered = io.BytesIO()
    res_img.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')

    return jsonify({
        "status":      "success",
        "predictions": predictions,
        "image":       img_str,
    })




# ===================================
# 7️⃣ BIDS
# ===================================
@app.route('/uploads/<filename>')
def serve_upload(filename):
    from flask import send_from_directory
    UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route("/create-bid", methods=["POST"])
def create_bid():

    try:
        file           = request.files["image"]
        name           = request.form.get("name")
        description    = request.form.get("description")
        owner_id       = request.form.get("owner_id")
        starting_price = request.form.get("starting_price")

        from werkzeug.utils import secure_filename
        import uuid
        
        UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        
        ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        image_url = f"/uploads/{filename}"
        created_at = datetime.utcnow()

        conn = db.get_db_connection()
        cur  = conn.cursor()
        cur.execute(
            """INSERT INTO bids (name, description, owner_id, starting_price, image_url, created_at)
               VALUES (%s, %s, %s, %s, %s, %s) RETURNING id""",
            (name, description, owner_id, starting_price, image_url, created_at)
        )
        bid_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Bid created successfully", "bid_id": bid_id, "image_url": image_url}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/bids", methods=["GET"])
def list_bids():
    try:
        conn = db.get_db_connection()
        cur  = conn.cursor()
        cur.execute(
            "SELECT b.id, b.name, b.description, b.owner_id, b.starting_price, b.image_url, b.created_at, COALESCE(MAX(bo.amount), b.starting_price) as current_highest, COUNT(bo.id) as total_bids FROM bids b LEFT JOIN bid_offers bo ON b.id = bo.bid_id GROUP BY b.id, b.name, b.description, b.owner_id, b.starting_price, b.image_url, b.created_at ORDER BY b.created_at DESC"
        )
        bids = cur.fetchall()
        cur.close()
        conn.close()

        return jsonify({
            "bids": [
                {
                    "id":             row[0],
                    "name":           row[1],
                    "description":    row[2],
                    "owner_id":       row[3],
                    "starting_price": row[4],
                    "image_url":      f"http://{request.host}{row[5]}" if row[5] and str(row[5]).startswith("/uploads") else row[5],
                    "created_at":     row[6].isoformat() if row[6] else None,
                    "current_highest": float(row[7]) if row[7] else row[4],
                    "total_bids":     int(row[8]),
                }
                for row in bids
            ]
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/bid/<int:bid_id>", methods=["DELETE"])
def delete_bid(bid_id):
    try:
        conn = db.get_db_connection()
        cur  = conn.cursor()
        cur.execute("DELETE FROM bids WHERE id = %s RETURNING id", (bid_id,))
        deleted = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        if deleted:
            return jsonify({"message": "Bid deleted successfully", "bid_id": bid_id}), 200
        return jsonify({"error": "Bid not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ===================================
# 7.5️⃣ PLACE BID
# ===================================
@app.route("/place-bid", methods=["POST"])
def place_bid():
    try:
        data = request.get_json()
        bid_id = data.get("bid_id")
        user_id = data.get("user_id")
        bid_amount = data.get("bid_amount")

        if not bid_id or not user_id or not bid_amount:
            return jsonify({"error": "bid_id, user_id, bid_amount required"}), 400

        bid_amount = float(bid_amount)

        conn = db.get_db_connection()
        cur = conn.cursor()

        # Check if bid exists
        cur.execute("SELECT id FROM bids WHERE id = %s", (bid_id,))
        if not cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({"error": "Bid not found"}), 404

        # Get all distinct previous bidders on this bid_id (excluding the current user)
        cur.execute("SELECT DISTINCT user_id FROM bid_offers WHERE bid_id = %s AND user_id != %s", (bid_id, user_id))
        previous_bidders = cur.fetchall()

        # Insert bid offer
        cur.execute(
            "INSERT INTO bid_offers (bid_id, user_id, amount, created_at) VALUES (%s, %s, %s, %s)",
            (bid_id, user_id, bid_amount, datetime.utcnow())
        )

        # Create notifications for previous bidders
        for row in previous_bidders:
            prev_user_id = row[0]
            # Fetch bid name for better notification message (optional but nice)
            cur.execute("SELECT name FROM bids WHERE id = %s", (bid_id,))
            bid_data = cur.fetchone()
            bid_name = bid_data[0] if bid_data else f"Item #{bid_id}"
            
            message = f"You have been outbid on '{bid_name}'. A new bid of Rs. {bid_amount} was placed."
            cur.execute(
                "INSERT INTO notifications (user_id, message, type, created_at) VALUES (%s, %s, %s, %s)",
                (prev_user_id, message, "outbid", datetime.utcnow())
            )

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Bid placed successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ===================================
# 7.6️⃣ NOTIFICATIONS
# ===================================
@app.route("/notifications/<int:user_id>", methods=["GET"])
def get_notifications(user_id):
    try:
        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, message, type, is_read, created_at FROM notifications WHERE user_id = %s AND is_read = FALSE ORDER BY created_at DESC", 
            (user_id,)
        )
        notifs = cur.fetchall()
        cur.close()
        conn.close()
        
        result = []
        for row in notifs:
            result.append({
                "id": row[0],
                "message": row[1],
                "type": row[2],
                "is_read": row[3],
                "created_at": row[4].strftime("%H:%M") if row[4] else ""
            })
            
        return jsonify({"success": True, "notifications": result}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/notifications/<int:notif_id>/read", methods=["POST"])
def mark_notification_read(notif_id):
    try:
        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute("UPDATE notifications SET is_read = TRUE WHERE id = %s", (notif_id,))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ===================================
# 8️⃣ USER AUTH & PROFILE
# ===================================
@app.route("/register", methods=["POST"])
def register():
    try:
        username        = request.form.get("username")
        email           = request.form.get("email")
        phone           = request.form.get("phone")
        password        = request.form.get("password")
        profile_picture = request.files.get("profile_picture")

        if not username: return jsonify({"error": "username is required"}), 400
        if not email:    return jsonify({"error": "email is required"}), 400
        if not phone:    return jsonify({"error": "phone is required"}), 400
        if not password: return jsonify({"error": "password is required"}), 400

        profile_image_url = st.upload_image(profile_picture) if profile_picture else None
        created_at        = datetime.utcnow()

        conn = db.get_db_connection()
        cur  = conn.cursor()
        cur.execute(
            """INSERT INTO users (username, email, phone, profile_image_url, password, created_at)
               VALUES (%s,%s,%s,%s,%s,%s) RETURNING id""",
            (username, email, phone, profile_image_url, password, created_at)
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            "message":             "User registered successfully",
            "user_id":             user_id,
            "username":            username,
            "email":               email,
            "phone":               phone,
            "profile_picture_url": profile_image_url,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/login", methods=["POST"])
def login():
    try:
        username = request.json.get("username")
        password = request.json.get("password")

        conn = db.get_db_connection()
        cur  = conn.cursor()
        cur.execute(
            "SELECT id, username, email, phone, profile_image_url, password FROM users WHERE username=%s",
            (username,)
        )
        user = cur.fetchone()
        cur.close()
        conn.close()

        if not user:
            return jsonify({"error": "User not found"}), 404

        user_id, username, email, phone, profile_image_url, db_password = user

        if password == db_password:
            return jsonify({
                "message":             "Login successful",
                "user_id":             user_id,
                "user_name":           username,
                "email":               email,
                "phone_number":        phone,
                "profile_picture_url": profile_image_url,
            })

        return jsonify({"error": "Invalid password"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/update-profile-picture", methods=["POST"])
def update_profile_picture():
    try:
        user_id         = request.form.get("user_id")
        profile_picture = request.files.get("profile_picture")

        if not profile_picture:
            return jsonify({"error": "No image provided"}), 400

        image_url = st.upload_image(profile_picture)

        conn = db.get_db_connection()
        cur  = conn.cursor()
        cur.execute("UPDATE users SET profile_image_url=%s WHERE id=%s", (image_url, user_id))
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Profile picture updated", "profile_picture_url": image_url})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/update-phone", methods=["POST"])
def update_phone():
    try:
        user_id = request.json.get("user_id")
        phone   = request.json.get("phone")

        conn = db.get_db_connection()
        cur  = conn.cursor()
        cur.execute("UPDATE users SET phone=%s WHERE id=%s", (phone, user_id))
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Phone number updated", "phone_number": phone})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/update-email", methods=["POST"])
def update_email():
    try:
        user_id = request.json.get("user_id")
        email   = request.json.get("email")

        conn = db.get_db_connection()
        cur  = conn.cursor()
        cur.execute("UPDATE users SET email=%s WHERE id=%s", (email, user_id))
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Email updated", "email": email})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -----------------------------------
# Run Server
# -----------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False, use_reloader=False)
