#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <SoftwareSerial.h>
#include <ModbusMaster.h>

// -----------------------------------------
// 1. Wi-Fi & Firebase Credentials
// -----------------------------------------
#define WIFI_SSID "Pixel 8 Pro"
#define WIFI_PASSWORD "12345678910"

#define FIREBASE_HOST "tea-analyzer-7a2b0-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_AUTH "Wtg5xGwZjRHN4zDIyd8f0tLRf69CTUAyMk7Buep4" 

// -----------------------------------------
// 2. Hardware Pins (Using GPIO Numbers)
// -----------------------------------------
#define RO_PIN 5      // GPIO5 (D1) - RX Pin
#define DI_PIN 4      // GPIO4 (D2) - TX Pin
#define RE_DE_PIN 0   // GPIO0 (D3) - Flow Control Pin

// -----------------------------------------
// 3. Object Initialization
// -----------------------------------------
SoftwareSerial RS485Serial(RO_PIN, DI_PIN);
ModbusMaster node;

// Updated Firebase Objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Modbus callbacks for MAX485 flow control
void preTransmission() { digitalWrite(RE_DE_PIN, HIGH); }
void postTransmission() { digitalWrite(RE_DE_PIN, LOW); }

void setup() {
  Serial.begin(9600);
  
  // Initialize RS485
  RS485Serial.begin(4800); 
  pinMode(RE_DE_PIN, OUTPUT);
  digitalWrite(RE_DE_PIN, LOW);

  // Initialize Modbus
  node.begin(1, RS485Serial);
  node.preTransmission(preTransmission);
  node.postTransmission(postTransmission);

  // Connect to Wi-Fi
  Serial.print("Connecting to Wi-Fi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("\nWi-Fi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // Connect to Firebase (NEW SYNTAX)
  config.database_url = FIREBASE_HOST;
  config.signer.tokens.legacy_token = FIREBASE_AUTH;
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true); 
  
  Serial.println("Firebase Initialized.");
  delay(2000);
}

void loop() {
  uint8_t result;
  
  // Request 7 registers from address 0x0000
  result = node.readHoldingRegisters(0x0000, 7);

  if (result == node.ku8MBSuccess) {
    float moisture      = node.getResponseBuffer(0) / 10.0;
    float temperature   = node.getResponseBuffer(1) / 10.0;
    int ec              = node.getResponseBuffer(2);
    float ph            = node.getResponseBuffer(3) / 10.0;
    int nitrogen        = node.getResponseBuffer(4);
    int phosphorus      = node.getResponseBuffer(5);
    int potassium       = node.getResponseBuffer(6);

    Serial.println("=========================================");
    Serial.println("Readings successful. Pushing to Firebase...");
    
    // Push Data to Firebase Realtime Database
    if (Firebase.setInt(fbdo, "/SoilData/Nitrogen", nitrogen)) {
      Serial.println("N: " + String(nitrogen) + " mg/kg - Uploaded");
    } else {
      Serial.println("N Upload Failed: " + fbdo.errorReason());
    }

    Firebase.setInt(fbdo, "/SoilData/Phosphorus", phosphorus);
    Firebase.setInt(fbdo, "/SoilData/Potassium", potassium);
    Firebase.setFloat(fbdo, "/SoilData/pH", ph);
    Firebase.setFloat(fbdo, "/SoilData/Moisture", moisture);
    Firebase.setFloat(fbdo, "/SoilData/Temperature", temperature);
    Firebase.setInt(fbdo, "/SoilData/EC", ec);

    Serial.println("=========================================\n");
  } 
  else {
    Serial.print("Failed to read from sensor. Modbus Error Code: 0x");
    Serial.println(result, HEX);
  }

  // Poll every 5 seconds
  delay(5000); 
}