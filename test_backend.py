import requests

BASE_URL = "http://localhost:8080"

def test_health():
    print("\n🔹 Testing Health Endpoint...")
    r = requests.get(f"{BASE_URL}/")
    print("Status:", r.status_code)
    print("Response:", r.json())


def test_update_sensor():
    print("\n🔹 Updating Live Sensor...")
    payload = {
        "Nitrogen": 60,
        "Phosphorus": 5,
        "Potassium": 40,
        "pH": 6.5,
        "Moisture": 35,
        "soil_temp": 28,
        "EC": 1.2
    }

    r = requests.post(f"{BASE_URL}/update-live-sensor", json=payload)
    print("Status:", r.status_code)
    print("Response:", r.json())


def test_get_sensor():
    print("\n🔹 Getting Live Sensor...")
    r = requests.get(f"{BASE_URL}/get-live-sensor")
    print("Status:", r.status_code)
    print("Response:", r.json())


def test_fertilizer():
    print("\n🔥 Testing Fertilizer Prediction...")
    r = requests.post(f"{BASE_URL}/predict-fertilizer")
    print("Status:", r.status_code)
    print("Response:", r.json())


def run_all_tests():
    test_health()
    test_update_sensor()
    test_get_sensor()
    test_fertilizer()


if __name__ == "__main__":
    run_all_tests()