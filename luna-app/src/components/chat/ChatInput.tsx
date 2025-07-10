import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { colors, typography, spacing } from '../../styles';
import { useHaptics } from '../../hooks/useHaptics';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onAttachment?: () => void;
  onVoiceNote?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onAttachment,
  onVoiceNote,
  placeholder = "Écris ton message à Luna...",
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const sendButtonScale = useRef(new Animated.Value(0)).current;
  const attachmentButtonScale = useRef(new Animated.Value(1)).current;
  const { trigger } = useHaptics();

  useEffect(() => {
    Animated.timing(sendButtonScale, {
      toValue: message.trim().length > 0 ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    Animated.timing(attachmentButtonScale, {
      toValue: message.trim().length > 0 ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [message]);

  const handleSend = () => {
    if (message.trim().length > 0 && !disabled) {
      trigger('impact');
      onSendMessage(message.trim());
      setMessage('');
      Keyboard.dismiss();
    }
  };

  const handleAttachment = () => {
    trigger('impact');
    onAttachment?.();
  };

  const handleVoiceNote = () => {
    trigger('impact');
    onVoiceNote?.();
  };

  const animateButtonPress = (scaleValue: Animated.Value) => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <BlurView intensity={90} tint="light" style={styles.container}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.95)']}
          style={styles.gradientOverlay}
        />
        
        <View style={styles.inputContainer}>
          {/* Attachment Button */}
          <Animated.View
            style={[
              styles.actionButton,
              {
                opacity: attachmentButtonScale,
                transform: [{ scale: attachmentButtonScale }],
              },
            ]}
          >
            <TouchableOpacity
              onPress={handleAttachment}
              disabled={disabled || message.trim().length > 0}
              style={styles.iconButton}
            >
              <Ionicons
                name="add-circle-outline"
                size={28}
                color={colors.primary.main}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Text Input */}
          <View style={[styles.textInputWrapper, isFocused && styles.textInputWrapperFocused]}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              value={message}
              onChangeText={setMessage}
              placeholder={placeholder}
              placeholderTextColor={colors.text.secondary}
              multiline
              maxLength={1000}
              editable={!disabled}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
          </View>

          {/* Voice Note Button (when no text) */}
          <Animated.View
            style={[
              styles.actionButton,
              {
                opacity: attachmentButtonScale,
                transform: [{ scale: attachmentButtonScale }],
                position: 'absolute',
                right: spacing.md,
              },
            ]}
          >
            <TouchableOpacity
              onPress={handleVoiceNote}
              disabled={disabled || message.trim().length > 0}
              style={styles.iconButton}
            >
              <Ionicons
                name="mic-outline"
                size={28}
                color={colors.primary.main}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Send Button (when text is present) */}
          <Animated.View
            style={[
              styles.sendButtonWrapper,
              {
                opacity: sendButtonScale,
                transform: [{ scale: sendButtonScale }],
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                animateButtonPress(sendButtonScale);
                handleSend();
              }}
              disabled={disabled || message.trim().length === 0}
              style={styles.sendButton}
            >
              <LinearGradient
                colors={[colors.primary.gradient.start, colors.primary.gradient.end]}
                style={styles.sendButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons
                  name="send"
                  size={20}
                  color={colors.white}
                  style={{ marginLeft: 2 }}
                />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </BlurView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(147, 112, 219, 0.1)',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    minHeight: 44,
  },
  actionButton: {
    marginBottom: 4,
  },
  iconButton: {
    padding: spacing.xs,
  },
  textInputWrapper: {
    flex: 1,
    marginHorizontal: spacing.sm,
    backgroundColor: 'rgba(147, 112, 219, 0.05)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(147, 112, 219, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
    maxHeight: 120,
  },
  textInputWrapperFocused: {
    borderColor: colors.primary.main,
    backgroundColor: 'rgba(147, 112, 219, 0.08)',
  },
  textInput: {
    ...typography.body,
    color: colors.text.primary,
    maxHeight: 100,
    minHeight: 20,
    paddingTop: 0,
    paddingBottom: 0,
  },
  sendButtonWrapper: {
    position: 'absolute',
    right: spacing.md,
    bottom: 4,
  },
  sendButton: {
    padding: spacing.xs,
  },
  sendButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});