import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../constants/Theme';
import { ArrowLeft, Droplet, Sun } from 'lucide-react-native';

const DiseaseComparisonScreen = ({ route, navigation }) => {
    // Get passed parameters from DiseaseDetectionScreen
    const { scannedImage, analysisResult, diseaseName, formattedDiseaseName, percentage } = route.params || {};
    const [showProcessed, setShowProcessed] = React.useState(false);

    // Use passed image or fallback to a default
    // const mainImage = scannedImage ? { uri: scannedImage } : require('../../assets/potassium_deficiency.png');
    const originalImage = scannedImage
    ? { uri: scannedImage }
    : require('../../assets/potassium_deficiency.png');

    const processedImage = analysisResult?.image
    ? { uri: `data:image/jpeg;base64,${analysisResult.image}` }
    : null;

    // Using specific generated images for diseases
    const redRustImage = require('../../assets/red_rust.png');
    const potassiumDeficiencyImage = require('../../assets/potassium_deficiency.png');

    // Dynamically set comparison based on analysis result
    // Prioritize the classification model output if it exists
    let predictedClass = 'Unknown';
    let confidence = '0.0';
    let probabilities = {};

    if (analysisResult?.classification) {
        predictedClass = analysisResult.classification.predicted_class || 'Unknown';
        confidence = analysisResult.classification.confidence_percent
            ? parseFloat(analysisResult.classification.confidence_percent).toFixed(1)
            : '0.0';
        probabilities = analysisResult.classification.all_probabilities || {};
    } else {
        // Fallback to older segmentation logic if needed
        predictedClass = diseaseName || analysisResult?.predicted_class || 'Unknown';
        confidence = percentage || (analysisResult?.confidence_percent ? parseFloat(analysisResult.confidence_percent).toFixed(1) : '0.0');
    }

    // Determine which comparison card is the "primary" match based on prediction
    const isRedRust = predictedClass.toLowerCase() === 'red_rust' || predictedClass.toLowerCase() === 'red rust' || predictedClass.toLowerCase() === 'redrust';
    const isPotassium = predictedClass.toLowerCase() === 'potasium-k' || predictedClass.toLowerCase() === 'potassium_deficiency';

    // Map the actual classification probabilities to the "Other diseases" view, showing those with low confidence
    const allProbabilitiesList = Object.keys(probabilities).map(key => ({
        name: key.replace(/_/g, ' '),
        prob: probabilities[key]
    })).filter(item => item.name.toLowerCase() !== predictedClass.toLowerCase() && item.name.toLowerCase() !== 'healthy')
        .sort((a, b) => b.prob - a.prob)
        .slice(0, 5) // Display top 5 other low-probability matches
        .map(item => `${item.name.charAt(0).toUpperCase() + item.name.slice(1)} (${item.prob}%)`);

    const otherDiseases = allProbabilitiesList.length > 0 ? allProbabilitiesList : [
        "Red leaf spot",
        "Algal leaf spot",
        "Bird’s eyespot",
        "Gray blight",
        "White spot",
        "Anthracnose",
        "Brown blight"
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color={COLORS.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Disease Analysis</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Main Detected Image */}
                <View style={styles.mainImageContainer}>
                    {/* <Image source={mainImage} style={styles.mainImage} resizeMode="cover" /> */}
                    <Image
                        source={showProcessed && processedImage ? processedImage : originalImage}
                        style={styles.mainImage}
                        resizeMode="cover"
                    />
                    <View style={styles.overlayLabel}>
                        <Text style={styles.overlayText}>Analyzed Sample</Text>
                    </View>
                </View>

                <View style={styles.toggleContainer}>
    <TouchableOpacity
        style={[styles.toggleBtn, !showProcessed && styles.activeToggle]}
        onPress={() => setShowProcessed(false)}
    >
        <Text style={[styles.toggleText, !showProcessed && styles.activeText]}>
            Original
        </Text>
    </TouchableOpacity>

    <TouchableOpacity
        style={[styles.toggleBtn, showProcessed && styles.activeToggle]}
        onPress={() => setShowProcessed(true)}
        disabled={!processedImage} // disable if no AI image
    >
        <Text style={[styles.toggleText, showProcessed && styles.activeText]}>
            AI Highlight
        </Text>
    </TouchableOpacity>
</View>




                {/* Other Potential Diseases Section */}
                <View style={styles.otherDiseasesContainer}>
                    <Text style={styles.sectionHeader}>Other Potential Diseases Evaluated</Text>
                    <Text style={styles.instructionDesc}>The system also checked for the following but found low probability:</Text>
                    <View style={styles.diseaseList}>
                        {otherDiseases.map((disease, index) => (
                            <View key={index} style={styles.diseaseChip}>
                                <View style={styles.dot} />
                                <Text style={styles.diseaseChipText}>{disease}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ({confidence}% Affected) */}
                {/* Selected Diagnosis Detail */}
                <View style={styles.resultContainer}>
                    <Text style={styles.resultHeader}>Primary Diagnosis: {formattedDiseaseName || (isRedRust ? 'Red Rust' : (isPotassium ? 'Potassium Deficiency' : predictedClass))} </Text>
                    <Text style={styles.description}>
                        {isRedRust
                            ? "Symptoms closely match Red Rust. This is characterized by orange/reddish powdery patches on the leaf surface, which can restrict photosynthesis."
                            : (isPotassium
                                ? "The symptoms closely match Potassium Deficiency. This is characterized by scorching of leaf margins and tips, which may later become necrotic."
                                : "The system detected an unknown condition affecting the plant. Please consult a domain expert.")}
                    </Text>
                </View>

                {/* Healing Instructions */}
                <View style={styles.treatmentContainer}>
                    <Text style={styles.treatmentHeader}>Healing Instructions</Text>

                    {isRedRust ? (
                        <>
                            <View style={styles.instructionItem}>
                                <View style={styles.iconBox}>
                                    <Droplet color={COLORS.primary} size={20} />
                                </View>
                                <View style={styles.instructionTextContent}>
                                    <Text style={styles.instructionTitle}>Apply Copper Fungicide</Text>
                                    <Text style={styles.instructionDesc}>Apply 50% Copper Oxychloride fungicide directly onto affected areas to control spread.</Text>
                                </View>
                            </View>

                            <View style={styles.instructionItem}>
                                <View style={styles.iconBox}>
                                    <Sun color={COLORS.warning} size={20} />
                                </View>
                                <View style={styles.instructionTextContent}>
                                    <Text style={styles.instructionTitle}>Improve Canopy Ventilation</Text>
                                    <Text style={styles.instructionDesc}>Ensure adequate pruning is performed to improve air circulation and reduce trapped humidity.</Text>
                                </View>
                            </View>
                        </>
                    ) : (
                        <>
                            <View style={styles.instructionItem}>
                                <View style={styles.iconBox}>
                                    <Droplet color={COLORS.primary} size={20} />
                                </View>
                                <View style={styles.instructionTextContent}>
                                    <Text style={styles.instructionTitle}>Apply Muriate of Potash (MOP)</Text>
                                    <Text style={styles.instructionDesc}>Apply 60kg/ha of MOP fertilizer to the soil.</Text>
                                </View>
                            </View>

                            <View style={styles.instructionItem}>
                                <View style={styles.iconBox}>
                                    <Sun color={COLORS.warning} size={20} />
                                </View>
                                <View style={styles.instructionTextContent}>
                                    <Text style={styles.instructionTitle}>Maintain Soil Moisture</Text>
                                    <Text style={styles.instructionDesc}>Ensure adequate irrigation to help nutrient absorption.</Text>
                                </View>
                            </View>
                        </>
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: COLORS.white,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    mainImageContainer: {
        width: '100%',
        height: 220,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 25,
        elevation: 5,
        backgroundColor: COLORS.white,
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    overlayLabel: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 15,
    },
    overlayText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: 20,
    },
    comparisonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    diseaseCard: {
        width: '42%',
        backgroundColor: COLORS.white,
        borderRadius: 15,
        padding: 10,
        alignItems: 'center',
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    diseaseImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginBottom: 10,
        backgroundColor: '#f0f0f0',
    },
    diseaseName: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
        color: COLORS.text,
        height: 32,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
        marginTop: 10,
    },
    otherDiseasesContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 15,
        padding: 20,
        marginBottom: 25,
    },
    diseaseList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    diseaseChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    diseaseChipText: {
        fontSize: 12,
        color: COLORS.text,
        fontWeight: '500',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.textLight,
        marginRight: 6,
    },
    probabilityBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    probabilityText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    vsContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    vsText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.textLight,
    },
    resultContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 15,
        padding: 20,
        marginBottom: 25,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.warning, // highlighting the deficiency
    },
    resultHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        color: COLORS.textLight,
        lineHeight: 22,
    },
    treatmentContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 15,
        padding: 20,
    },
    treatmentHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 20,
    },
    instructionItem: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FAFAFA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    instructionTextContent: {
        flex: 1,
    },
    instructionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
    },
    instructionDesc: {
        fontSize: 13,
        color: COLORS.textLight,
        lineHeight: 18,
    },
    toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderRadius: 25,
    marginBottom: 20,
    overflow: 'hidden',
},

toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
},

activeToggle: {
    backgroundColor: COLORS.primary,
},

toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textLight,
},

activeText: {
    color: '#fff',
},
});

export default DiseaseComparisonScreen;
