"""
Utility script to test the backend API and verify that the Ensemble Model 
(XGBoost + LSTM) is successfully generating predictions.
"""
import requests
import json

def test_prediction():
    """
    Sends a test request to the local Flask server's fertilizer prediction endpoint.
    It expects the server to use its currently stored `latest_sensor_data` 
    and recent database history to generate an ensemble prediction.
    """
    url = "http://localhost:8080/predict-fertilizer"
    
    # Send a POST request. The body is empty because the server pulls the 
    # latest live data from Firebase (or mock sensor) internally.
    try:
        response = requests.post(url, json={})
        if response.status_code == 200:
            data = response.json()
            print("Response Status: SUCCESS")
            print(json.dumps(data, indent=2))
            
            # Check if the backend explicitly states it used the Ensemble method
            if "model_details" in data:
                print("\nEnsemble working! Method:", data["model_details"]["method"])
            else:
                print("\nEnsemble NOT found in response. Is the server restarted?")
        else:
            print(f"Response Status: FAILED ({response.status_code})")
            print(response.text)
    except Exception as e:
        print(f"Error: {e}")
        print("\nMake sure the Flask server (app.py) is running on port 8080.")

if __name__ == "__main__":
    test_prediction()
