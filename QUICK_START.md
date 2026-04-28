# Tea Analyzer Backend - Quick Start Guide

## 📁 Current Directory Structure

```
tea_analyzer/                          ← You are here!
├── app.py                            ← Main Flask backend
├── config.py                         ← Configuration (Firebase URL)
├── firebase_integration.py           ← Firebase fetcher module
├── test_firebase_integration.py      ← Test script
├── requirements.txt                  ← Python dependencies
├── setup.sh                          ← Automated setup script
├── storage.py                        ← Google Cloud Storage
├── database/
│   └── db_connect.py                ← PostgreSQL connection
├── models/                           ← ML models (YOLO, MobileNetV2, etc.)
├── uploads/                          ← Uploaded images
├── .venv/                            ← Virtual environment (if created)
└── README.md                         ← Project documentation
```

---

## 🚀 Quick Start (Choose One Method)

### Method 1: Automated Setup (Recommended)

```bash
# Run the setup script
bash setup.sh
```

This will automatically:
- ✅ Create virtual environment
- ✅ Install all dependencies
- ✅ Set everything up

---

### Method 2: Manual Setup

```bash
# 1. Create virtual environment
python3 -m venv .venv

# 2. Activate virtual environment
source .venv/bin/activate  # Linux/Mac
# OR
.venv\Scripts\activate     # Windows

# 3. Install dependencies
pip install -r requirements.txt
```

---

## ✅ Verify Installation

### Step 1: Test Firebase Connection

```bash
# Make sure virtual environment is activated!
# You should see (.venv) in your prompt

python test_firebase_integration.py
```

**Expected Output:**
```
============================================================
Firebase Integration Test
============================================================

Test 1: Initializing Firebase fetcher...
✅ Firebase fetcher initialized
   URL: https://tea-analyzer-7a2b0-default-rtdb.asia-southeast1.firebasedatabase.app

Test 2: Fetching data from Firebase...
✅ Data fetched successfully!

Sensor Readings:
----------------------------------------
  Nitrogen (N):    0 mg/kg
  Phosphorus (P):  0 mg/kg
  Potassium (K):   0 mg/kg
  pH:              3.0
  Moisture:        0.0%
  Temperature:     31.8°C
  EC:              0
----------------------------------------

✅ Firebase integration is working correctly!
```

---

### Step 2: Start Backend

```bash
# Make sure virtual environment is activated!
python app.py
```

**Expected Output:**
```
[INFO] Firebase integration initialized: https://tea-analyzer-7a2b0-default-rtdb.asia-southeast1.firebasedatabase.app
 * Serving Flask app 'app'
 * Debug mode: off
WARNING: This is a development server. Do not use it in a production deployment.
 * Running on http://0.0.0.0:8080
Press CTRL+C to quit
```

---

### Step 3: Test API

Open a **new terminal** and test:

```bash
curl http://localhost:8080/get-live-sensor
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "Nitrogen": 0,
    "Phosphorus": 0,
    "Potassium": 0,
    "pH": 3.0,
    "Moisture": 0.0,
    "Temperature": 31.8,
    "EC": 0
  },
  "source": "firebase"
}
```

✅ If you see `"source": "firebase"`, it's working perfectly!

---

## 📊 Data Flow

```
ESP8266 → Firebase → Backend → Mobile App
  (5s)     (Cloud)   (On demand)  (Real-time)
```

1. **ESP8266** uploads sensor data to Firebase every 5 seconds
2. **Firebase** stores latest readings at `/SoilData`
3. **Backend** fetches from Firebase when mobile app requests
4. **Mobile App** displays real-time sensor data

---

## 🔄 Daily Workflow

### Every Time You Start Working:

```bash
# 1. Navigate to project directory
cd /path/to/tea_analyzer

# 2. Activate virtual environment
source .venv/bin/activate  # Linux/Mac
# OR
.venv\Scripts\activate     # Windows

# 3. Start backend
python app.py
```

### To Stop:

Press `CTRL+C` in the terminal running the backend

### To Deactivate Virtual Environment:

```bash
deactivate
```

---

## 🧪 Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/get-live-sensor` | GET | Get live sensor data from Firebase |
| `/update-live-sensor` | POST | Manually update sensor data |
| `/predict` | POST | Disease detection (YOLO segmentation) |
| `/classify-leaf` | POST | Disease classification (MobileNetV2) |
| `/predict-fertilizer` | POST | Fertilizer recommendation |
| `/predict-tea-price` | POST | Market price prediction |
| `/register` | POST | User registration |
| `/login` | POST | User login |
| `/create-bid` | POST | Create auction bid |
| `/list-bids` | GET | List all bids |

---

## 🐛 Troubleshooting

### Issue: "python3: command not found"

**Solution:**
```bash
# Linux/Ubuntu
sudo apt update
sudo apt install python3 python3-venv python3-pip

# macOS
brew install python3
```

### Issue: "No module named 'venv'"

**Solution:**
```bash
sudo apt install python3-venv
```

### Issue: Virtual environment not activating

**Solution:**
```bash
# Make sure you're in the correct directory
pwd  # Should show: .../tea_analyzer

# Check if .venv exists
ls -la .venv

# Activate
source .venv/bin/activate
```

### Issue: "Module 'requests' not found"

**Solution:**
```bash
# Make sure virtual environment is activated
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Issue: "Firebase initialization failed"

**Solution:**
1. Check internet connection
2. Verify Firebase URL in `config.py`
3. Test URL in browser:
   ```
   https://tea-analyzer-7a2b0-default-rtdb.asia-southeast1.firebasedatabase.app/SoilData.json
   ```

### Issue: NPK values are 0

**Solution:**
1. Ensure sensor probe is fully inserted into moist soil
2. Wait 30-60 seconds for sensor to stabilize
3. Check ESP8266 serial monitor for Modbus errors
4. Verify Modbus register addresses in ESP8266 code

---

## ✅ Verification Checklist

- [ ] Python 3 installed: `python3 --version`
- [ ] Virtual environment created: `ls -la .venv`
- [ ] Virtual environment activated: `(.venv)` in prompt
- [ ] Dependencies installed: `pip list | grep Flask`
- [ ] Firebase test passes: `python test_firebase_integration.py`
- [ ] Backend starts: `python app.py`
- [ ] API responds: `curl http://localhost:8080/get-live-sensor`
- [ ] Response shows `"source": "firebase"`

---

## 🔧 Configuration

### Firebase URL

Located in `config.py`:

```python
FIREBASE_DATABASE_URL = os.environ.get(
    "FIREBASE_DATABASE_URL", 
    "https://tea-analyzer-7a2b0-default-rtdb.asia-southeast1.firebasedatabase.app"
)
```

### Override with Environment Variable

**Linux/Mac:**
```bash
export FIREBASE_DATABASE_URL="https://your-firebase-url.firebaseio.com"
python app.py
```

**Windows PowerShell:**
```powershell
$env:FIREBASE_DATABASE_URL = "https://your-firebase-url.firebaseio.com"
python app.py
```

---

## 📱 Mobile App Setup

Once backend is running, configure the mobile app:

```bash
cd app/app

# Set backend URL (replace with your IP)
export EXPO_PUBLIC_API_BASE_URL="http://192.168.1.100:8080"

# Install dependencies
npm install

# Start Expo
npm start
```

**Note:** Use your computer's local IP address, not `localhost`, if testing on a physical phone.

---

## 💡 Pro Tips

### 1. Check Virtual Environment Status

```bash
which python
# Should show: /path/to/.venv/bin/python (not /usr/bin/python)
```

### 2. View Backend Logs

The backend prints detailed logs:
```
[2026-04-21T10:30:45] INFO  Fetching data from Firebase
[2026-04-21T10:30:46] INFO  Firebase data fetched successfully
  N: 0 mg/kg
  P: 0 mg/kg
  K: 0 mg/kg
  pH: 3.0
  Moisture: 0.0%
  Temperature: 31.8°C
  EC: 0
```

### 3. Test Individual Endpoints

```bash
# Health check
curl http://localhost:8080/

# Sensor data
curl http://localhost:8080/get-live-sensor

# Disease detection (with image)
curl -X POST http://localhost:8080/predict -F "image=@leaf.jpg"
```

### 4. Create Alias (Linux/Mac)

Add to `~/.bashrc` or `~/.zshrc`:
```bash
alias tea-backend='cd ~/path/to/tea_analyzer && source .venv/bin/activate'
```

Then just run:
```bash
tea-backend
python app.py
```

---

## 📚 Additional Documentation

- **Firebase Integration:** `FIREBASE_INTEGRATION_GUIDE.md`
- **Backend README:** `README_BACKEND.md`
- **Project Overview:** `README.md`

---

## 🎯 What's Working

- ✅ ESP8266 uploads to Firebase every 5 seconds
- ✅ Backend fetches from Firebase automatically
- ✅ Mobile app receives real-time data (no changes needed!)
- ✅ Temperature sensor: 31.8°C (working)
- ✅ pH sensor: 3.0 (working)
- ⚠️ NPK sensors: 0 (needs calibration/proper soil contact)

---

## 🚀 Next Steps

1. ✅ Backend is running on `http://0.0.0.0:8080`
2. ✅ Firebase integration is working
3. ✅ Ready to connect mobile app
4. ⚠️ Calibrate NPK sensors (insert into moist soil)
5. 📱 Configure and run mobile app

---

## 📞 Need Help?

1. Check the troubleshooting section above
2. Review `FIREBASE_INTEGRATION_GUIDE.md` for detailed info
3. Verify all dependencies are installed
4. Check backend logs for error messages
5. Test Firebase URL directly in browser

---

**Status:** ✅ **Ready to Use**

Your Tea Analyzer backend is properly structured and ready for deployment!

---

**Last Updated:** 2026-04-21  
**Version:** 3.0 (Clean Structure)
