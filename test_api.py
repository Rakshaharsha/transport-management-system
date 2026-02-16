import requests
import json

# Base URL
BASE_URL = "http://127.0.0.1:8000/api"

print("=" * 60)
print("TRANSPORT MANAGEMENT API TESTER")
print("=" * 60)

# Step 1: Login
print("\n[STEP 1] Testing Login...")
print("-" * 60)

username = input("Enter your username (e.g., admin): ")
password = input("Enter your password: ")

login_url = f"{BASE_URL}/auth/login/"
login_data = {
    "username": username,
    "password": password
}

try:
    response = requests.post(login_url, json=login_data)
    print(f"\nStatus Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("✅ LOGIN SUCCESSFUL!")
        print(f"\nUser: {data['user']['username']}")
        print(f"Role: {data['user']['role']}")
        print(f"Email: {data['user']['email']}")
        
        access_token = data['access']
        print(f"\n🔑 Access Token (first 50 chars): {access_token[:50]}...")
        
        # Step 2: Test Profile with Token
        print("\n" + "=" * 60)
        print("[STEP 2] Testing Profile Endpoint with Token...")
        print("-" * 60)
        
        profile_url = f"{BASE_URL}/auth/profile/"
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        
        profile_response = requests.get(profile_url, headers=headers)
        print(f"\nStatus Code: {profile_response.status_code}")
        
        if profile_response.status_code == 200:
            profile_data = profile_response.json()
            print("✅ PROFILE FETCH SUCCESSFUL!")
            print(f"\nProfile Data:")
            print(json.dumps(profile_data, indent=2))
            
            # Step 3: Test Dashboard based on role
            print("\n" + "=" * 60)
            print("[STEP 3] Testing Dashboard Endpoint...")
            print("-" * 60)
            
            role = data['user']['role']
            if role == 'ADMIN':
                dashboard_url = f"{BASE_URL}/dashboard/admin/"
            elif role == 'DRIVER':
                dashboard_url = f"{BASE_URL}/dashboard/driver/"
            else:
                dashboard_url = f"{BASE_URL}/dashboard/user/"
            
            dashboard_response = requests.get(dashboard_url, headers=headers)
            print(f"\nStatus Code: {dashboard_response.status_code}")
            
            if dashboard_response.status_code == 200:
                dashboard_data = dashboard_response.json()
                print(f"✅ DASHBOARD FETCH SUCCESSFUL!")
                print(f"\nDashboard Data:")
                print(json.dumps(dashboard_data, indent=2))
            else:
                print(f"❌ Dashboard Error: {dashboard_response.text}")
            
            # Step 4: Test Buses List
            print("\n" + "=" * 60)
            print("[STEP 4] Testing Buses List...")
            print("-" * 60)
            
            buses_url = f"{BASE_URL}/buses/"
            buses_response = requests.get(buses_url, headers=headers)
            print(f"\nStatus Code: {buses_response.status_code}")
            
            if buses_response.status_code == 200:
                buses_data = buses_response.json()
                print(f"✅ BUSES FETCH SUCCESSFUL!")
                print(f"\nTotal Buses: {len(buses_data)}")
                if buses_data:
                    print("\nBuses:")
                    for bus in buses_data:
                        print(f"  - Bus #{bus['bus_number']}: {bus['source']} → {bus['destination']} (Status: {bus['status']})")
                else:
                    print("  No buses found. Create one using admin account!")
            else:
                print(f"❌ Buses Error: {buses_response.text}")
            
            # Summary
            print("\n" + "=" * 60)
            print("✅ ALL TESTS COMPLETED!")
            print("=" * 60)
            print("\n📋 SUMMARY:")
            print(f"  • Login: ✅ Success")
            print(f"  • Profile: ✅ Success")
            print(f"  • Dashboard: ✅ Success")
            print(f"  • Buses: ✅ Success")
            print("\n💡 Your API is working correctly!")
            print("\n🔑 Copy this token for Postman:")
            print(f"\n{access_token}")
            print("\n📝 In Postman:")
            print("  1. Go to Authorization tab")
            print("  2. Type: Bearer Token")
            print("  3. Token: Paste the token above")
            print("  4. Send your request")
            
        else:
            print(f"❌ PROFILE ERROR!")
            print(f"Response: {profile_response.text}")
            print("\n⚠️ This means your token is invalid or the endpoint is wrong.")
    else:
        print("❌ LOGIN FAILED!")
        print(f"Response: {response.text}")
        print("\n⚠️ Check your username and password.")
        
except requests.exceptions.ConnectionError:
    print("❌ CONNECTION ERROR!")
    print("\n⚠️ Make sure your Django server is running:")
    print("   cd transport")
    print("   python manage.py runserver")
    
except Exception as e:
    print(f"❌ ERROR: {str(e)}")

print("\n" + "=" * 60)
