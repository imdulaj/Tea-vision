# Tea Analyzer Workspace

## Active source folders

- Frontend: `app/app`
- Backend: `backend/tea_analyzer-be/tea_analyzer-be`

There are extra extracted folders in this workspace, but the folders above are the ones cleaned up for running the project.

## Start order

### Backend

```powershell
cd backend\tea_analyzer-be\tea_analyzer-be
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

### Frontend

In a separate terminal:

```powershell
cd app\app
$env:EXPO_PUBLIC_API_BASE_URL = "http://YOUR_LOCAL_IP:8080"
npm install
npm run start
```

## Existing features preserved

- User registration and login
- Disease segmentation and leaf classification
- Fertilizer prediction route support
- Tea market price prediction
- Bidding and listing creation
- Profile display and logout
