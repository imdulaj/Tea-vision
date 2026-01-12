import React, { useRef } from 'react';
import { Animated, TouchableWithoutFeedback, View } from 'react-native';

const ScaleButton = ({ children, onPress, style, scaleMin = 0.95 }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: scaleMin,
            useNativeDriver: true,
            speed: 20,
            bounciness: 10,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 20,
            bounciness: 10,
        }).start();
    };

    return (
        <TouchableWithoutFeedback onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress}>
            <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
                {children}
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};

export default ScaleButton;
