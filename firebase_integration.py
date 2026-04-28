"""
Firebase Integration Module
Fetches real-time soil sensor data from Firebase Realtime Database
"""

import requests
import json
from datetime import datetime

class FirebaseDataFetcher:
    def __init__(self, firebase_url, auth_token=None):
        """
        Initialize Firebase data fetcher
        
        Args:
            firebase_url: Firebase Realtime Database URL
            auth_token: Firebase authentication token (optional)
        """
        self.firebase_url = firebase_url.rstrip('/')
        self.auth_token = auth_token
        self.last_fetch_time = None
        self.last_data = None
    
    def fetch_soil_data(self):
        """
        Fetch soil sensor data from Firebase
        
        Returns:
            dict: Sensor data with keys: Nitrogen, Phosphorus, Potassium, pH, Moisture, Temperature, EC
        """
        try:
            # Firebase REST API endpoint - add .json to get data
            url = f"{self.firebase_url}/SoilData.json"
            
            # Add auth token if provided
            if self.auth_token:
                url += f"?auth={self.auth_token}"
            
            print(f"[{datetime.now().isoformat()}] INFO  Fetching data from Firebase: {url.split('?')[0]}")
            
            # Make GET request to Firebase
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if data is None:
                    print(f"[{datetime.now().isoformat()}] WARN  No data found in Firebase")
                    return None
                
                # Extract sensor values
                sensor_data = {
                    "Nitrogen": float(data.get("Nitrogen", 0)),
                    "Phosphorus": float(data.get("Phosphorus", 0)),
                    "Potassium": float(data.get("Potassium", 0)),
                    "pH": float(data.get("pH", 0)),
                    "Moisture": float(data.get("Moisture", 0)),
                    "Temperature": float(data.get("Temperature", 0)),
                    "EC": float(data.get("EC", 0))
                }
                
                self.last_fetch_time = datetime.now()
                self.last_data = sensor_data
                
                print(f"[{datetime.now().isoformat()}] INFO  Firebase data fetched successfully")
                print(f"  N: {sensor_data['Nitrogen']} mg/kg")
                print(f"  P: {sensor_data['Phosphorus']} mg/kg")
                print(f"  K: {sensor_data['Potassium']} mg/kg")
                print(f"  pH: {sensor_data['pH']}")
                print(f"  Moisture: {sensor_data['Moisture']}%")
                print(f"  Temperature: {sensor_data['Temperature']}°C")
                print(f"  EC: {sensor_data['EC']}")
                
                return sensor_data
            else:
                print(f"[{datetime.now().isoformat()}] ERROR Firebase request failed: {response.status_code}")
                return None
                
        except requests.exceptions.Timeout:
            print(f"[{datetime.now().isoformat()}] ERROR Firebase request timeout")
            return None
        except requests.exceptions.RequestException as e:
            print(f"[{datetime.now().isoformat()}] ERROR Firebase request failed: {str(e)}")
            return None
        except Exception as e:
            print(f"[{datetime.now().isoformat()}] ERROR Unexpected error: {str(e)}")
            return None
    
    def get_cached_data(self):
        """
        Get last fetched data without making a new request
        
        Returns:
            dict: Last fetched sensor data or None
        """
        return self.last_data
    
    def get_last_fetch_time(self):
        """
        Get timestamp of last successful fetch
        
        Returns:
            datetime: Last fetch time or None
        """
        return self.last_fetch_time


# Singleton instance
_firebase_fetcher = None

def get_firebase_fetcher(firebase_url=None, auth_token=None):
    """
    Get or create Firebase fetcher singleton
    
    Args:
        firebase_url: Firebase Realtime Database URL (required on first call)
        auth_token: Firebase authentication token (optional)
    
    Returns:
        FirebaseDataFetcher: Singleton instance
    """
    global _firebase_fetcher
    
    if _firebase_fetcher is None:
        if firebase_url is None:
            raise ValueError("firebase_url is required for first initialization")
        _firebase_fetcher = FirebaseDataFetcher(firebase_url, auth_token)
    
    return _firebase_fetcher
