import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../constants/Theme';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Camera, AlertTriangle, CheckCircle, Share2, Save, X } from 'lucide-react-native';

const DiseaseDetectionScreen = () => {
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
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <Text style={{ textAlign: 'center', marginBottom: 20, color: COLORS.text }}>We need your permission to show the camera</Text>
                <TouchableOpacity onPress={requestPermission} style={{ backgroundColor: COLORS.primary, padding: 10, borderRadius: 8 }}>
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
                            {scannedImage && <Image source={{ uri: scannedImage }} style={{ width: '100%', height: '100%', position: 'absolute' }} />}

                            <TouchableOpacity
                                style={styles.retakeButton}
                                onPress={() => { setImageCaptured(false); setScannedImage(null); }}
                            >
                                <X color={COLORS.white} size={24} />
                                <Text style={styles.retakeText}>Retake</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <CameraView
                            style={{ flex: 1, width: '100%' }}
                            facing="back"
                            ref={cameraRef}
                        >
                            <View style={styles.cameraOverlay}>
                                <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
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
                                <Text style={styles.resultTitle}>Blister Blight</Text>
                                <Text style={styles.severityText}>Severity: <Text style={{ color: COLORS.warning, fontWeight: 'bold' }}>Moderate</Text></Text>
                            </View>
                            <View style={styles.confidenceBadge}>
                                <Text style={styles.confidenceText}>92% Conf.</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <Text style={styles.sectionHeader}>Treatment Suggestion</Text>
                        <Text style={styles.suggestionText}>
                            Apply copper-based fungicide spray (Copper Oxychloride) immediately to affected areas. Ensure proper drainage to reduce humidity.
                        </Text>

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
                    {[1, 2, 3].map(i => (
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