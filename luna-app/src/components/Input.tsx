import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '@styles/index';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  type?: 'text' | 'email' | 'password' | 'number';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  type = 'text',
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const keyboardType = type === 'email' ? 'email-address' : type === 'number' ? 'numeric' : 'default';
  const isPassword = type === 'password';

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputFocused,
        error && styles.inputError,
      ]}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={error ? colors.semantic.error : isFocused ? colors.primary.pink : colors.neutral.gray}
            style={styles.icon}
          />
        )}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.neutral.gray}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={type === 'email' ? 'none' : props.autoCapitalize}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={colors.neutral.gray}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    color: colors.neutral.darkGray,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.md,
  },
  inputFocused: {
    borderColor: colors.primary.pink,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.semantic.error,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.neutral.black,
    paddingVertical: spacing.md,
  },
  icon: {
    marginRight: spacing.sm,
  },
  eyeIcon: {
    padding: spacing.xs,
  },
  error: {
    ...typography.caption,
    color: colors.semantic.error,
    marginTop: spacing.xs,
  },
});