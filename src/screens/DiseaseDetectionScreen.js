import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES } from "../constants/Theme";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  Camera,
  AlertTriangle,
  CheckCircle,
  Share2,
  Save,
  X,
} from "lucide-react-native";

const DiseaseDetectionScreen = ({navigation}) => {
  const [imageCaptured, setImageCaptured] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedImage, setScannedImage] = useState(null);
  let cameraRef = React.useRef(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setScannedImage(photo.uri);
        setImageCaptured(true);
      } catch (error) {
        console.log("Error taking picture:", error);
      }
    }
  };

  if (!permission) {
    // Camera permissions are still loading
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center", padding: 20 },
        ]}
      >
        <Text
          style={{ textAlign: "center", marginBottom: 20, color: COLORS.text }}
        >
          We need your permission to show the camera
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={{
            backgroundColor: COLORS.primary,
            padding: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: COLORS.white }}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Disease Detection</Text>

        {/* Camera Preview Area */}
        <View style={styles.cameraContainer}>
          {imageCaptured ? (
            <View style={styles.capturedImagePlaceholder}>
              {/* Show Captured Image logic or just the placeholder for now with a retake button */}
              {scannedImage && (
                <Image
                  source={{ uri: scannedImage }}
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                  }}
                />
              )}

              <TouchableOpacity
                style={styles.retakeButton}
                onPress={() => {
                  setImageCaptured(false);
                  setScannedImage(null);
                }}
              >
                <X color={COLORS.white} size={24} />
                <Text style={styles.retakeText}>Retake</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <CameraView
              style={{ flex: 1, width: "100%" }}
              facing="back"
              ref={cameraRef}
            >
              <View style={styles.cameraOverlay}>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={takePicture}
                >
                  <View style={styles.captureInner} />
                </TouchableOpacity>
              </View>
            </CameraView>
          )}
        </View>

        {/* AI Analysis Result */}
        {imageCaptured && (
          <View style={styles.resultCard}>
            <View style={styles.row}>
              <View>
                <Text style={styles.resultTitle}>Red Rust</Text>
                <Text style={styles.severityText}>
                  Severity:{" "}
                  <Text style={{ color: COLORS.warning, fontWeight: "bold" }}>
                    Moderate
                  </Text>
                </Text>
              </View>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>92% Conf.</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionHeader}>Treatment Suggestion</Text>
            <Text style={styles.suggestionText}>
              Apply copper-based fungicide spray (Copper Oxychloride)
              immediately to affected areas. Ensure proper drainage to reduce
              humidity.
            </Text>

            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => navigation.navigate("DiseaseComparison")}
            >
              <Text style={styles.detailButtonText}>
                View Detailed Comparison
              </Text>
            </TouchableOpacity>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionButton}>
                <Save color={COLORS.primary} size={20} />
                <Text style={styles.actionText}>Save Report</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Share2 color={COLORS.primary} size={20} />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Recents */}
        <Text style={styles.subHeader}>Recent Scans</Text>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.recentsList}
        >
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.recentItem}>
              <View style={styles.recentImageLine} />
              <Text style={styles.recentName}>Scan #{100 + i}</Text>
              <Text style={styles.recentDate}>Today</Text>
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: 100,
  },
  headerTitle: {
    fontSize: SIZES.h1,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 20,
    marginTop: 10,
  },
  cameraContainer: {
    height: 300,
    backgroundColor: "#E0E0E0",
    borderRadius: SIZES.radius,
    marginBottom: 20,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  cameraPlaceholder: {
    alignItems: "center",
  },
  cameraText: {
    marginTop: 10,
    color: COLORS.textLight,
  },
  capturedImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#263238",
    alignItems: "center",
    justifyContent: "center",
  },
  highlightArea: {
    position: "absolute",
    top: 100,
    left: 150,
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: COLORS.warning,
    borderRadius: 20,
    backgroundColor: "rgba(255, 152, 0, 0.3)",
    zIndex: 10,
  },
  retakeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 20,
  },
  retakeText: {
    color: COLORS.white,
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "bold",
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 20,
  },
  captureButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  captureInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.white,
  },
  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 20,
    marginBottom: 20,
    elevation: 5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
  },
  severityText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  confidenceBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#EEE",
    marginVertical: 15,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
    paddingTop: 15,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 20,
  },
  actionText: {
    marginLeft: 6,
    color: COLORS.primary,
    fontWeight: "600",
  },
  subHeader: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    marginBottom: 10,
    color: COLORS.text,
  },
  recentsList: {
    flexDirection: "row",
  },
  recentItem: {
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: SIZES.radius,
    marginRight: 10,
    width: 100,
    alignItems: "center",
  },
  recentImageLine: {
    width: 40,
    height: 40,
    backgroundColor: "#E0E0E0",
    borderRadius: 20,
    marginBottom: 8,
  },
  recentName: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
  },
  recentDate: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  detailButton: {
    backgroundColor: COLORS.secondary || "#4CAF50", // Fallback if secondary not defined
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
    marginBottom: 5,
  },
  detailButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default DiseaseDetectionScreen;
