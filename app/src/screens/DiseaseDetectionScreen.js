import React, { useState, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, Image, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants/Theme';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Camera, AlertTriangle, CheckCircle, Share2, Save, X, ImagePlus, Info, Thermometer } from 'lucide-react-native';
import { apiFetch, buildImageFormData } from '../lib/api';

const screenWidth = Dimensions.get('window').width;

const DiseaseDetectionScreen = ({ navigation }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [scannedImage, setScannedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const cameraRef = useRef(null);

    const ts = () => new Date().toISOString();
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const getTreatmentSuggestion = (predictedClass) => {
        if (predictedClass === 'Red Rust' || predictedClass === 'RedRust') {
            return "Apply copper-based fungicides (e.g., Copper Oxychloride) immediately. Ensure proper pruning to improve air circulation and reduce canopy humidity.";
        } else if (predictedClass === 'potasium-K') {
            return "Apply potassium-rich fertilizers such as Muriate of Potash (MOP) or Sulfate of Potash (SOP). Ensure adequate soil moisture for nutrient uptake.";
        } else {
            return "Monitor the plant closely and maintain optimal growing conditions.";
        }
    };

    const handleCameraCapture = async () => {
        if (cameraRef.current) {
            try {
                console.log(`[${ts()}] INFO  DiseaseDetector  Capturing photo from camera...`);
                const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
                setScannedImage(photo.uri);
                setIsCameraActive(false);
                analyzeImage(photo.uri);
            } catch (error) {
                console.log(`[${ts()}] ERROR DiseaseDetector  Capture failed:`, error);
                Alert.alert("Error", "Failed to capture image.");
            }
        }
    };

    const handleGalleryPick = async () => {
        try {
            console.log(`[${ts()}] INFO  DiseaseDetector  Opening image library...`);
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 4],
                quality: 0.8,
            });

            if (!result.canceled) {
                const uri = result.assets[0].uri;
                console.log(`[${ts()}] INFO  DiseaseDetector  Image selected:`, uri);
                setScannedImage(uri);
                analyzeImage(uri);
            }
        } catch (error) {
            console.log(`[${ts()}] ERROR DiseaseDetector  Pick failed:`, error);
            Alert.alert("Error", "Failed to select image from gallery.");
        }
    };

    const analyzeImage = async (uri) => {
        setIsLoading(true);
        setAnalysisResult(null);
        
        try {
            console.log(`\n\n[${ts()}] INFO  DiseaseDetector  ---- STARTING ANALYSIS ----`);
            
            setLoadingStep('Uploading image to server...');
            await delay(1000);

            setLoadingStep('Analyzing leaf structure...');
            console.log(`[${ts()}] INFO  DiseaseDetector  Requesting segmentation from /predict`);
            await delay(1000);

            setLoadingStep('Classifying disease patterns...');
            console.log(`[${ts()}] INFO  DiseaseDetector  Requesting classification from /classify-leaf`);

            // Run both models concurrently
            const [segmentationResponse, classificationResponse] = await Promise.all([
                apiFetch('/predict', {
                    method: 'POST',
                    body: buildImageFormData(uri, 'image', 'segmentation.jpg'),
                }),
                apiFetch('/classify-leaf', {
                    method: 'POST',
                    body: buildImageFormData(uri, 'image', 'classification.jpg'),
                })
            ]);
            const segResult = segmentationResponse;
            const clsResult = classificationResponse;

            setLoadingStep('Finalizing results...');
            await delay(800);

            console.log(`[${ts()}] DEBUG DiseaseDetector  Segmentation:`, JSON.stringify(segResult).substring(0, 100) + '...');
            console.log(`[${ts()}] DEBUG DiseaseDetector  Classification:`, JSON.stringify(clsResult));

            if (segResult.status === 'success' || clsResult.success) {
                const finalResult = {
                    ...segResult,
                    classification: clsResult.success ? clsResult : null
                };
                setAnalysisResult(finalResult);
                console.log(`[${ts()}] INFO  DiseaseDetector  Analysis complete. Result: ${finalResult.classification?.predicted_class || 'Unknown'}`);
            } else {
                console.log(`[${ts()}] WARN  DiseaseDetector  Server reported failure`);
                Alert.alert("Analysis Failed", "Could not classify the image properly.");
            }
        } catch (error) {
            console.error(`[${ts()}] ERROR DiseaseDetector  Network/API error:`, error);
            Alert.alert("Error", "Failed to connect to the analysis server.");
        } finally {
            setIsLoading(false);
            setLoadingStep('');
            console.log(`[${ts()}] INFO  DiseaseDetector  ---- ANALYSIS END ----\n`);
        }
    };

    if (!permission) return <View style={styles.container} />;
    if (!permission.granted) {
        return (
            <SafeAreaView style={[styles.container, styles.centered]}>
                <AlertTriangle size={60} color={COLORS.warning} />
                <Text style={styles.permissionText}>Camera access needed for disease detection</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.permissionBtn}>
                    <Text style={styles.permissionBtnText}>Grant Permission</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (isCameraActive) {
        return (
            <View style={styles.container}>
                <CameraView style={StyleSheet.absoluteFill} facing="back" ref={cameraRef}>
                    <View style={styles.cameraOverlay}>
                        <TouchableOpacity style={styles.closeCamera} onPress={() => setIsCameraActive(false)}>
                            <X color="#fff" size={30} />
                        </TouchableOpacity>
                        <View style={styles.cameraControls}>
                            <TouchableOpacity style={styles.captureBtn} onPress={handleCameraCapture}>
                                <View style={styles.captureBtnInner} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.cameraTip}>Point at a single leaf for best results</Text>
                    </View>
                </CameraView>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <LinearGradient colors={['#1B5E20', '#2E7D32', '#43A047']} style={styles.headerGradient}>
                    <Text style={styles.headerTitle}>Disease Detection</Text>
                    <Text style={styles.headerSub}>AI-Powered Tea Leaf Health Analysis</Text>
                </LinearGradient>

                {!scannedImage ? (
                    /* Initial Landing State */
                    <View style={styles.landingSection}>
                        <View style={styles.landingCard}>
                            <LinearGradient colors={['#E8F5E9', '#F1F8E9']} style={styles.landingIconBox}>
                                <Camera color={COLORS.primary} size={48} />
                            </LinearGradient>
                            <Text style={styles.landingTitle}>Analyze Your Crops</Text>
                            <Text style={styles.landingDesc}>
                                Snap a clear photo of a tea leaf or upload from your gallery to detect diseases instantly.
                            </Text>

                            <View style={styles.landingActionRow}>
                                <TouchableOpacity style={styles.mainActionBtn} onPress={() => setIsCameraActive(true)}>
                                    <Camera color="#fff" size={24} />
                                    <Text style={styles.mainActionText}>Use Camera</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity style={styles.secondaryActionBtn} onPress={handleGalleryPick}>
                                    <ImagePlus color={COLORS.primary} size={24} />
                                    <Text style={styles.secondaryActionText}>Gallery</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.tipsSection}>
                            <Text style={styles.tipsHeader}>Best Results Tips:</Text>
                            <View style={styles.tipItem}>
                                <CheckCircle color={COLORS.primary} size={16} />
                                <Text style={styles.tipText}>Use bright, even lighting</Text>
                            </View>
                            <View style={styles.tipItem}>
                                <CheckCircle color={COLORS.primary} size={16} />
                                <Text style={styles.tipText}>Keep leaf centered and in focus</Text>
                            </View>
                            <View style={styles.tipItem}>
                                <CheckCircle color={COLORS.primary} size={16} />
                                <Text style={styles.tipText}>Analyze one leaf at a time</Text>
                            </View>
                        </View>
                    </View>
                ) : (
                    /* Analysis & Results State */
                    <View style={styles.analysisSection}>
                        {/* Image Preview Card */}
                        <View style={styles.previewContainer}>
                           {/* <Image 
                                source={{ uri: (analysisResult && analysisResult.image) ? `data:image/jpeg;base64,${analysisResult.image}` : scannedImage }} 
                                style={styles.previewImage} 
                            />*/}
                            <Image 
                                source={{ uri: scannedImage }} 
                                style={styles.previewImage} 
                            />
                            {!isLoading && (
                                <TouchableOpacity 
                                    style={styles.retakeBtnInPreview}
                                    onPress={() => {
                                        setScannedImage(null);
                                        setAnalysisResult(null);
                                    }}
                                >
                                    <X color="#fff" size={20} />
                                    <Text style={styles.retakeLabel}>Retake</Text>
                                </TouchableOpacity>
                            )}
                            {isLoading && (
                                <View style={styles.analysisOverlay}>
                                    <ActivityIndicator size="large" color="#fff" />
                                    <Text style={styles.analysisStepText}>{loadingStep}</Text>
                                </View>
                            )}
                        </View>

                        {/* Analysis Results View */}
                        {!isLoading && analysisResult && (() => {
                            const predictions = analysisResult.predictions || {};
                            const keys = Object.keys(predictions);
                            const hasLeaf = keys.some(key => key.toLowerCase() === 'leaf');
                            const hasDisease = keys.some(key => key.toLowerCase() !== 'leaf');

                            if (keys.length === 0 || !hasLeaf || !hasDisease) {
                                return (
                                    <View style={styles.errorResultCard}>
                                        <AlertTriangle color={COLORS.warning} size={32} />
                                        <View style={{ marginLeft: 15, flex: 1 }}>
                                            <Text style={styles.errorTitle}>Analysis Inconclusive</Text>
                                            <Text style={styles.errorDesc}>We couldn't clearly identify a tea leaf or disease. Try a clearer shot with better lighting.</Text>
                                        </View>
                                    </View>
                                );
                            }

                            let diseaseName = 'Healthy';
                            let maxPixels = 0;
                            let totalPixels = 0;

                            for (const [key, value] of Object.entries(predictions)) {
                                totalPixels += value;
                                if (key.toLowerCase() !== 'leaf' && value > maxPixels) {
                                    diseaseName = key;
                                    maxPixels = value;
                                }
                            }

                            const percentage = totalPixels > 0 ? ((maxPixels / totalPixels) * 100).toFixed(1) : 0;
                            const formattedDiseaseName = diseaseName === 'potasium-K' ? 'Potassium Deficiency' : (diseaseName === 'RedRust' ? 'Red Rust' : diseaseName);
                            const severity = parseFloat(percentage);
                            const isCritical = severity > 20;

                            return (
                                <View style={styles.resultContainer}>
                                    {/* Main Result Card */}
                                    <View style={styles.mainResultCard}>
                                        <View style={styles.resultHeaderRow}>
                                            <View style={[styles.statusIndicator, { backgroundColor: isCritical ? '#FFEBEE' : '#E8F5E9' }]}>
                                                <Text style={[styles.statusIndicatorText, { color: isCritical ? '#C62828' : '#2E7D32' }]}>
                                                    {isCritical ? 'CRITICAL' : 'DETECTED'}
                                                </Text>
                                            </View>
                                            <View style={styles.impactBadge}>
                                                <Text style={styles.impactText}>{percentage}% Affected Area</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.detectionTitle}>{formattedDiseaseName}</Text>
                                        <View style={styles.severityBarBg}>
                                            <View style={[styles.severityBarFill, { 
                                                width: `${Math.min(severity * 3, 100)}%`, 
                                                backgroundColor: isCritical ? '#F44336' : '#FB8C00' 
                                            }]} />
                                        </View>
                                        <Text style={styles.impactLabel}>Overall leaf surface impact</Text>
                                    </View>

                                    {/* Treatment Suggestion */}
                                    <View style={styles.treatmentCard}>
                                        <View style={styles.treatmentHeader}>
                                            <Thermometer color={COLORS.primary} size={20} />
                                            <Text style={styles.treatmentTitle}>Recommended Treatment</Text>
                                        </View>
                                        <Text style={styles.treatmentText}>
                                            {getTreatmentSuggestion(diseaseName)}
                                        </Text>
                                        
                                        <TouchableOpacity
                                            style={styles.comparisonBtn}
                                            onPress={() => navigation.navigate('DiseaseComparison', {
                                                scannedImage: scannedImage, // ✅ ALWAYS original
    processedImage: analysisResult?.image 
        ? `data:image/jpeg;base64,${analysisResult.image}` 
        : null,
                                                // scannedImage: analysisResult.image ? `data:image/jpeg;base64,${analysisResult.image}` : scannedImage,
                                                analysisResult: analysisResult,
                                                diseaseName: diseaseName,
                                                formattedDiseaseName: formattedDiseaseName,
                                                percentage: percentage
                                            })}
                                        >
                                            <Info color="#fff" size={18} />
                                            <Text style={styles.comparisonBtnText}>View details</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Actions */}
                                    <View style={styles.actionRow}>
                                        <TouchableOpacity style={styles.iconActionBtn}>
                                            <Save color={COLORS.primary} size={22} />
                                            <Text style={styles.iconActionText}>Save</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.iconActionBtn}>
                                            <Share2 color={COLORS.primary} size={22} />
                                            <Text style={styles.iconActionText}>Share</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })()}
                    </View>
                )}

                {/* Recent Items Ticker */}
                <Text style={styles.recentHeader}>Recent Analysis</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentScroll}>
                    {[1, 2, 3, 4].map(i => (
                        <View key={i} style={styles.recentItem}>
                            <View style={styles.recentAvatar} />
                            <View>
                                <Text style={styles.recentName}>Scan #{100+i}</Text>
                                <Text style={styles.recentMeta}>Mar 11 • Detected</Text>
                            </View>
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
        backgroundColor: '#F5F7F5',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    headerGradient: {
        marginHorizontal: 12,
        marginTop: 12,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 24,
        borderRadius: 30,
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSub: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },

    // Landing State
    landingSection: {
        padding: 20,
    },
    landingCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 8 },
    },
    landingIconBox: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    landingTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    landingDesc: {
        fontSize: 14,
        color: COLORS.textLight,
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 20,
        paddingHorizontal: 10,
    },
    landingActionRow: {
        flexDirection: 'row',
        marginTop: 30,
        gap: 12,
    },
    mainActionBtn: {
        flex: 1.5,
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    mainActionText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
    secondaryActionBtn: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    secondaryActionText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 15,
    },

    // Tips
    tipsSection: {
        marginTop: 30,
        paddingHorizontal: 10,
    },
    tipsHeader: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 12,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 10,
    },
    tipText: {
        fontSize: 14,
        color: COLORS.textLight,
    },

    // Camera Mode
    cameraOverlay: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-between',
    },
    closeCamera: {
        alignSelf: 'flex-end',
        marginTop: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 8,
        borderRadius: 20,
    },
    cameraControls: {
        alignItems: 'center',
    },
    captureBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#fff',
    },
    captureBtnInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#fff',
    },
    cameraTip: {
        textAlign: 'center',
        color: '#fff',
        fontSize: 14,
        marginBottom: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: 6,
        borderRadius: 10,
    },

    // Analysis Section
    analysisSection: {
        padding: 20,
    },
    previewContainer: {
        width: '100%',
        height: 280,
        backgroundColor: '#E0E0E0',
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 6,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    analysisOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    analysisStepText: {
        color: '#fff',
        marginTop: 15,
        fontSize: 15,
        fontWeight: '500',
    },
    retakeBtnInPreview: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: 'rgba(0,0,0,0.6)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    retakeLabel: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },

    // Results
    resultContainer: {
        marginTop: 20,
    },
    mainResultCard: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 20,
        elevation: 4,
    },
    resultHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    statusIndicator: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusIndicatorText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    impactBadge: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    impactText: {
        fontSize: 11,
        color: COLORS.textLight,
        fontWeight: '600',
    },
    detectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 12,
    },
    severityBarBg: {
        height: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 4,
        marginBottom: 8,
    },
    severityBarFill: {
        height: 8,
        borderRadius: 4,
    },
    impactLabel: {
        fontSize: 12,
        color: COLORS.textLight,
    },

    // Treatment
    treatmentCard: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 20,
        marginTop: 14,
        elevation: 3,
    },
    treatmentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    treatmentTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    treatmentText: {
        fontSize: 14,
        color: COLORS.textLight,
        lineHeight: 22,
    },
    comparisonBtn: {
        backgroundColor: '#388E3C',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        marginTop: 20,
        gap: 8,
    },
    comparisonBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },

    // Actions
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        gap: 30,
    },
    iconActionBtn: {
        alignItems: 'center',
        gap: 6,
    },
    iconActionText: {
        fontSize: 13,
        color: COLORS.primary,
        fontWeight: '700',
    },

    // Error
    errorResultCard: {
        backgroundColor: '#FFFBE6',
        borderRadius: 18,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#FFE58F',
    },
    errorTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#856404',
    },
    errorDesc: {
        fontSize: 13,
        color: '#856404',
        marginTop: 2,
    },

    // Recents
    recentHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginLeft: 20,
        marginTop: 30,
        marginBottom: 14,
    },
    recentScroll: {
        paddingHorizontal: 20,
        gap: 12,
    },
    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 14,
        gap: 12,
        elevation: 2,
    },
    recentAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E8F5E9',
    },
    recentName: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    recentMeta: {
        fontSize: 11,
        color: COLORS.textLight,
    },

    permissionText: {
        textAlign: 'center',
        fontSize: 16,
        color: COLORS.text,
        marginTop: 20,
    },
    permissionBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 12,
        marginTop: 24,
    },
    permissionBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default DiseaseDetectionScreen;

