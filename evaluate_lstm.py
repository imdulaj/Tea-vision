"""
Utility script to instantly evaluate and show the accuracy of the already-trained LSTM model.
Useful for live demonstrations and vivas without needing to retrain from scratch.
"""
import sqlite3
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, mean_absolute_error

DB_PATH = "soil_data.db"
MODEL_DIR = "models"
SEQ_LENGTH = 15
FEATURES = ["nitrogen", "phosphorus", "potassium", "ph", "moisture", "temperature", "ec"]

def load_data():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM soil_readings ORDER BY id ASC")
    rows = [dict(r) for r in cur.fetchall()]
    cur.close()
    conn.close()
    return rows

def create_sequences(rows, scaler, label_encoder):
    feature_matrix = np.array([[r[f] for f in FEATURES] for r in rows], dtype=np.float32)
    fert_types = [r["fertilizer_type"] for r in rows]
    amounts = np.array([r["fertilizer_amount"] for r in rows], dtype=np.float32)

    scaled = scaler.transform(feature_matrix)
    encoded = label_encoder.transform(fert_types)

    X, y_type, y_amount = [], [], []

    for i in range(len(scaled) - SEQ_LENGTH):
        X.append(scaled[i : i + SEQ_LENGTH])
        y_type.append(encoded[i + SEQ_LENGTH])
        y_amount.append(amounts[i + SEQ_LENGTH])

    return np.array(X), np.array(y_type), np.array(y_amount)

def main():
    os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
    os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
    os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
    
    print("=" * 60)
    print("  Evaluating Pre-Trained LSTM Model...")
    print("=" * 60)

    try:
        from tensorflow.keras.models import load_model as keras_load_model
        model = keras_load_model(os.path.join(MODEL_DIR, "lstm_fertilizer.keras"))
        scaler = joblib.load(os.path.join(MODEL_DIR, "lstm_scaler.pkl"))
        label_encoder = joblib.load(os.path.join(MODEL_DIR, "lstm_label_encoder.pkl"))
    except Exception as e:
        print(f"[ERROR] Could not load model files: {e}")
        print("Please make sure you have run 'python train_lstm.py' at least once.")
        return

    rows = load_data()
    X, y_type, y_amount = create_sequences(rows, scaler, label_encoder)
    
    # We use the same random_state=42 as the training script so we test on the exact same holdout test set
    X_train, X_test, yt_train, yt_test, ya_train, ya_test = train_test_split(
        X, y_type, y_amount, test_size=0.2, random_state=42, stratify=y_type
    )

    print(f"[INFO] Testing on {len(X_test)} samples...\n")

    # Evaluate
    preds = model.predict(X_test, verbose=0)
    type_pred_classes = np.argmax(preds[0], axis=1)
    amount_preds = preds[1].flatten()

    from sklearn.metrics import accuracy_score, precision_recall_fscore_support
    acc = accuracy_score(yt_test, type_pred_classes)
    precision, recall, f1, _ = precision_recall_fscore_support(yt_test, type_pred_classes, average='weighted')

    print("LSTM Model Performance Metrics:")
    print(f"  - Accuracy  : {acc * 100:.2f}%")
    print(f"  - F1 Score  : {f1 * 100:.2f}%")
    print(f"  - Precision : {precision * 100:.2f}%\n")

    mae = mean_absolute_error(ya_test, amount_preds)
    print(f"Amount Prediction Error (MAE): {mae:.2f} kg/ha\n")
    print("=" * 60)
    print("  Evaluation Complete")
    print("=" * 60)

if __name__ == "__main__":
    main()
