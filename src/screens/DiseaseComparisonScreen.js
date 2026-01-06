import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../constants/Theme';
import { ArrowLeft, Droplet, Sun } from 'lucide-react-native';

const DiseaseComparisonScreen = ({ navigation }) => {
    // Hardcoded images as requested
    const mainImage = require('../../assets/potassium_deficiency.png');
    // Using specific generated images for diseases
    const redRustImage = require('../../assets/red_rust.png');
    const potassiumDeficiencyImage = require('../../assets/potassium_deficiency.png');

    const otherDiseases = [
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
                    <Image source={mainImage} style={styles.mainImage} resizeMode="cover" />
                    <View style={styles.overlayLabel}>
                        <Text style={styles.overlayText}>Analyzed Sample</Text>
                    </View>
                </View>

                {/* Comparison Section */}
                <Text style={styles.sectionTitle}>Differential Diagnosis</Text>
                <Text style={styles.subtitle}>Comparing potential matches</Text>

                <View style={styles.comparisonContainer}>
                    {/* Red Rust */}
                    <View style={styles.diseaseCard}>
                        <Image source={redRustImage} style={styles.diseaseImage} />
                        <Text style={styles.diseaseName}>Red Rust</Text>
                        <View style={styles.probabilityBadge}>
                            <Text style={styles.probabilityText}>10% Match</Text>
                        </View>
                    </View>

                    {/* VS Badge */}
                    <View style={styles.vsContainer}>
                        <Text style={styles.vsText}>VS</Text>
                    </View>

                    {/* Potassium Deficiency */}
                    <View style={styles.diseaseCard}>
                        <Image source={potassiumDeficiencyImage} style={styles.diseaseImage} />
                        <Text style={styles.diseaseName}>Potassium Deficiency</Text>
                        <View style={[styles.probabilityBadge, { backgroundColor: '#FFEBEE' }]}>
                            <Text style={[styles.probabilityText, { color: COLORS.error }]}>90% Match</Text>
                        </View>
                    </View>
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

                {/* Selected Diagnosis Detail */}
                <View style={styles.resultContainer}>
                    <Text style={styles.resultHeader}>Primary Diagnosis: Potassium Deficiency</Text>
                    <Text style={styles.description}>
                        The symptoms closely match Potassium Deficiency. This is characterized by scorching of leaf margins and tips, which may later become necrotic.
                    </Text>
                </View>

                {/* Healing Instructions */}
                <View style={styles.treatmentContainer}>
                    <Text style={styles.treatmentHeader}>Healing Instructions</Text>

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
});

export default DiseaseComparisonScreen;
