import React, { useRef, useEffect } from 'react';
import { 
  ScrollView, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Animated,
  View 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '../../styles';
import { useHaptics } from '../../hooks/useHaptics';

interface QuickReply {
  id: string;
  text: string;
  emoji?: string;
}

interface QuickRepliesProps {
  replies: QuickReply[];
  onPress: (reply: QuickReply) => void;
  visible?: boolean;
}

export const QuickReplies: React.FC<QuickRepliesProps> = ({ 
  replies, 
  onPress, 
  visible = true 
}) => {
  const fadeAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const slideAnim = useRef(new Animated.Value(visible ? 0 : 20)).current;
  const { trigger } = useHaptics();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: visible ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: visible ? 0 : 20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible]);

  const handlePress = (reply: QuickReply) => {
    trigger('impact');
    onPress(reply);
  };

  if (replies.length === 0) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {replies.map((reply, index) => (
          <TouchableOpacity
            key={reply.id}
            onPress={() => handlePress(reply)}
            activeOpacity={0.7}
            style={styles.replyWrapper}
          >
            <Animated.View
              style={[
                styles.replyButton,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      scale: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(147, 112, 219, 0.1)', 'rgba(255, 182, 193, 0.1)']}
                style={styles.gradientBackground}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={styles.replyContent}>
                {reply.emoji && (
                  <Text style={styles.emoji}>{reply.emoji}</Text>
                )}
                <Text style={styles.replyText}>{reply.text}</Text>
              </View>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
};

const QuickReplyButton: React.FC<{ 
  reply: QuickReply; 
  onPress: () => void;
  style?: any;
}> = ({ reply, onPress, style }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.replyButton,
          style,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <LinearGradient
          colors={['rgba(147, 112, 219, 0.1)', 'rgba(255, 182, 193, 0.1)']}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.replyContent}>
          {reply.emoji && (
            <Text style={styles.emoji}>{reply.emoji}</Text>
          )}
          <Text style={styles.replyText}>{reply.text}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingRight: spacing.xl,
  },
  replyWrapper: {
    marginRight: spacing.sm,
  },
  replyButton: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(147, 112, 219, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  replyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  emoji: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  replyText: {
    ...typography.bodySmall,
    color: colors.primary.main,
    fontWeight: '500',
  },
});