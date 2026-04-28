"""
Test script for Firebase integration
Run this to verify Firebase connection and data fetching
"""

import sys
from firebase_integration import get_firebase_fetcher
from config import FIREBASE_DATABASE_URL, FIREBASE_AUTH_TOKEN

def test_firebase_connection():
    """Test Firebase connection and data fetching"""
    
    print("=" * 60)
    print("Firebase Integration Test")
    print("=" * 60)
    print()
    
    # Test 1: Initialize Firebase fetcher
    print("Test 1: Initializing Firebase fetcher...")
    try:
        fetcher = get_firebase_fetcher(FIREBASE_DATABASE_URL, FIREBASE_AUTH_TOKEN)
        print(f"✅ Firebase fetcher initialized")
        print(f"   URL: {FIREBASE_DATABASE_URL}")
        print(f"   Auth: {'Yes' if FIREBASE_AUTH_TOKEN else 'No'}")
    except Exception as e:
        print(f"❌ Failed to initialize: {e}")
        return False
    
    print()
    
    # Test 2: Fetch data from Firebase
    print("Test 2: Fetching data from Firebase...")
    try:
        data = fetcher.fetch_soil_data()
        if data:
            print("✅ Data fetched successfully!")
            print()
            print("Sensor Readings:")
            print("-" * 40)
            print(f"  Nitrogen (N):    {data['Nitrogen']} mg/kg")
            print(f"  Phosphorus (P):  {data['Phosphorus']} mg/kg")
            print(f"  Potassium (K):   {data['Potassium']} mg/kg")
            print(f"  pH:              {data['pH']}")
            print(f"  Moisture:        {data['Moisture']}%")
            print(f"  Temperature:     {data['Temperature']}°C")
            print(f"  EC:              {data['EC']}")
            print("-" * 40)
        else:
            print("❌ No data returned from Firebase")
            return False
    except Exception as e:
        print(f"❌ Failed to fetch data: {e}")
        return False
    
    print()
    
    # Test 3: Check cached data
    print("Test 3: Checking cached data...")
    try:
        cached = fetcher.get_cached_data()
        if cached:
            print("✅ Cached data available")
            print(f"   Last fetch time: {fetcher.get_last_fetch_time()}")
        else:
            print("⚠️  No cached data")
    except Exception as e:
        print(f"❌ Failed to get cached data: {e}")
    
    print()
    
    # Test 4: Data validation
    print("Test 4: Validating data ranges...")
    issues = []
    
    if data['Nitrogen'] == 0 and data['Phosphorus'] == 0 and data['Potassium'] == 0:
        issues.append("⚠️  NPK values are all zero - sensor may not be reading correctly")
    
    if data['pH'] < 3 or data['pH'] > 9:
        issues.append(f"⚠️  pH value ({data['pH']}) is outside typical range (3-9)")
    
    if data['Temperature'] < 0 or data['Temperature'] > 60:
        issues.append(f"⚠️  Temperature ({data['Temperature']}°C) is outside typical range (0-60°C)")
    
    if data['Moisture'] < 0 or data['Moisture'] > 100:
        issues.append(f"⚠️  Moisture ({data['Moisture']}%) is outside valid range (0-100%)")
    
    if issues:
        print("Data validation warnings:")
        for issue in issues:
            print(f"  {issue}")
    else:
        print("✅ All values within expected ranges")
    
    print()
    print("=" * 60)
    print("Test Summary")
    print("=" * 60)
    print("✅ Firebase integration is working correctly!")
    print()
    print("Next steps:")
    print("1. Start the Flask backend: python app.py")
    print("2. Test the API endpoint: curl http://localhost:8080/get-live-sensor")
    print("3. Check that mobile app receives the data")
    print()
    
    return True


if __name__ == "__main__":
    try:
        success = test_firebase_connection()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
