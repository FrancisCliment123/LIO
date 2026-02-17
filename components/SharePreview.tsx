import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface SharePreviewProps {
    affirmation: string;
    showLogo: boolean;
}

export const SharePreview: React.FC<SharePreviewProps> = ({ affirmation, showLogo }) => {
    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                {/* Main Content */}
                <View style={styles.centerContent}>
                    <Text style={styles.text}>{affirmation}</Text>
                </View>

                {/* Footer with Logo - Now Bottom Left */}
                {showLogo && (
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../assets/frames/lio-logoalone.png')}
                            style={styles.logo}
                        />
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        backgroundColor: '#0f172a', // Solid dark blue/slate color
        position: 'relative',
        overflow: 'hidden',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: -60,
    },
    text: {
        fontSize: 32,
        color: '#FFFFFF',
        textAlign: 'center',
        fontWeight: '600',
        lineHeight: 44,
        letterSpacing: 0.5,
    },
    logoContainer: {
        position: 'absolute',
        bottom: 15,
        left: 15,
    },
    logo: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
        opacity: 0.9,
    },
});
