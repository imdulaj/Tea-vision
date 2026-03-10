import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, ArrowLeft, Bot, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/Theme';
import { sendMessageToGemini } from '../services/ChatService';

const SoilChatbot = () => {
    const navigation = useNavigation();
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! I'm your Tea Soil Expert. Ask me anything about soil health, fertilizers, or pest control.",
            sender: 'bot',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef();

    // Hide Bottom Tab Bar when on this screen
    React.useLayoutEffect(() => {
        navigation.getParent()?.setOptions({
            tabBarStyle: { display: 'none' }
        });
        return () => navigation.getParent()?.setOptions({
            tabBarStyle: {
                position: 'absolute',
                bottom: 20,
                left: 20,
                right: 20,
                elevation: 5,
                backgroundColor: '#FFFFFF',
                borderRadius: 30,
                height: 70,
                borderTopWidth: 0,
                shadowColor: '#2E7D32',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.25,
                shadowRadius: 3.5,
            }
        });
    }, [navigation]);

    const handleSend = async () => {
        if (inputText.trim().length === 0) return;

        const userMsg = {
            id: Date.now(),
            text: inputText,
            sender: 'user',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        // Call Gemini API
        const botReplyText = await sendMessageToGemini(userMsg.text);

        const botMsg = {
            id: Date.now() + 1,
            text: botReplyText,
            sender: 'bot',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
    };

    useEffect(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
    }, [messages, isTyping]);

    const renderItem = ({ item }) => {
        const isBot = item.sender === 'bot';
        return (
            <View style={[styles.messageRow, isBot ? styles.botRow : styles.userRow]}>
                {isBot && (
                    <View style={styles.avatarContainer}>
                        <Bot size={20} color="#fff" />
                    </View>
                )}
                <View style={[styles.bubble, isBot ? styles.botBubble : styles.userBubble]}>
                    <Text style={[styles.messageText, isBot ? styles.botText : styles.userText]}>
                        {item.text}
                    </Text>
                    <Text style={[styles.timeText, isBot ? styles.botTime : styles.userTime]}>
                        {item.time}
                    </Text>
                </View>
                {!isBot && (
                    <View style={[styles.avatarContainer, styles.userAvatar]}>
                        <User size={20} color="#fff" />
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Tea-Vision AI</Text>
                    <View style={styles.statusContainer}>
                        <View style={styles.onlineDot} />
                        <Text style={styles.statusText}>Online</Text>
                    </View>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {/* Chat Area & Input */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={
                        isTyping ? (
                            <View style={styles.typingContainer}>
                                <View style={styles.avatarContainer}>
                                    <Bot size={20} color="#fff" />
                                </View>
                                <View style={styles.typingBubble}>
                                    <ActivityIndicator size="small" color={COLORS.primary} />
                                </View>
                            </View>
                        ) : null
                    }
                />

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Ask about soil health..."
                        placeholderTextColor="#90A4AE"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                        <LinearGradient
                            colors={[COLORS.primary, COLORS.primaryLight]}
                            style={styles.sendGradient}
                        >
                            <Send size={20} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9F9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ECEFF1',
        elevation: 2,
    },
    backButton: {
        padding: 8,
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    onlineDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#4CAF50',
        marginRight: 4,
    },
    statusText: {
        fontSize: 12,
        color: '#78909C',
    },
    listContent: {
        padding: 16,
        paddingBottom: 20,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-end',
    },
    botRow: {
        justifyContent: 'flex-start',
    },
    userRow: {
        justifyContent: 'flex-end',
    },
    avatarContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    userAvatar: {
        backgroundColor: COLORS.secondary,
        marginRight: 0,
        marginLeft: 8,
    },
    bubble: {
        maxWidth: '75%',
        padding: 12,
        borderRadius: 20,
        elevation: 1,
    },
    botBubble: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 4,
    },
    userBubble: {
        backgroundColor: COLORS.primary,
        borderBottomRightRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    botText: {
        color: COLORS.text,
    },
    userText: {
        color: '#fff',
    },
    timeText: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    botTime: {
        color: '#90A4AE',
    },
    userTime: {
        color: 'rgba(255,255,255,0.7)',
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    typingBubble: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        borderBottomLeftRadius: 4,
        elevation: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ECEFF1',
    },
    input: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 100,
        fontSize: 15,
        color: COLORS.text,
        marginRight: 12,
    },
    sendButton: {
        borderRadius: 24,
        overflow: 'hidden',
    },
    sendGradient: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default SoilChatbot;
