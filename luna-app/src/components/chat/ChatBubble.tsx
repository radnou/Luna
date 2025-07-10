import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors, typography, spacing } from '../../styles';

interface ChatBubbleProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  };
  showAvatar?: boolean;
  isNewMessage?: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  message, 
  showAvatar = true,
  isNewMessage = false 
}) => {
  const fadeAnim = useRef(new Animated.Value(isNewMessage ? 0 : 1)).current;
  const slideAnim = useRef(new Animated.Value(isNewMessage ? 20 : 0)).current;

  useEffect(() => {
    if (isNewMessage) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isNewMessage]);

  const isLuna = message.role === 'assistant';

  return (
    <Animated.View
      style={[
        styles.container,
        isLuna ? styles.lunaContainer : styles.userContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {isLuna && showAvatar && (
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={[colors.primary.gradient.start, colors.primary.gradient.end]}
            style={styles.avatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.avatarText}>✨</Text>
          </LinearGradient>
        </View>
      )}

      <View style={[styles.bubbleWrapper, isLuna ? styles.lunaBubbleWrapper : styles.userBubbleWrapper]}>
        {isLuna ? (
          <BlurView intensity={80} tint="light" style={styles.lunaBubble}>
            <LinearGradient
              colors={['rgba(147, 112, 219, 0.1)', 'rgba(255, 182, 193, 0.1)']}
              style={styles.gradientOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Text style={styles.lunaText}>{message.content}</Text>
          </BlurView>
        ) : (
          <LinearGradient
            colors={[colors.primary.gradient.start, colors.primary.gradient.end]}
            style={styles.userBubble}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.userText}>{message.content}</Text>
          </LinearGradient>
        )}
        
        <Text style={[styles.timestamp, isLuna ? styles.lunaTimestamp : styles.userTimestamp]}>
          {new Date(message.timestamp).toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  lunaContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userContainer: {
    flexDirection: 'row-reverse',
  },
  avatarContainer: {
    marginRight: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarText: {
    fontSize: 20,
  },
  bubbleWrapper: {
    maxWidth: '75%',
  },
  lunaBubbleWrapper: {
    alignItems: 'flex-start',
  },
  userBubbleWrapper: {
    alignItems: 'flex-end',
  },
  lunaBubble: {
    borderRadius: 20,
    borderTopLeftRadius: 4,
    padding: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(147, 112, 219, 0.2)',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  userBubble: {
    borderRadius: 20,
    borderTopRightRadius: 4,
    padding: spacing.md,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lunaText: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 22,
  },
  userText: {
    ...typography.body,
    color: colors.white,
    lineHeight: 22,
  },
  timestamp: {
    ...typography.caption,
    marginTop: spacing.xs,
    marginHorizontal: spacing.xs,
  },
  lunaTimestamp: {
    color: colors.text.secondary,
  },
  userTimestamp: {
    color: colors.text.secondary,
    textAlign: 'right',
  },
});