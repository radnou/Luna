/**
 * Luna Design System - Chat Bubble Styles
 * Modern chat bubble component for AI conversations
 */

import { StyleSheet } from 'react-native';
import { baseColors, gradients, effects } from '../colors';
import { typography } from '../typography';
import { spacing, radius, borderWidths } from '../tokens';

// Chat bubble variants
export const chatBubbleVariants = {
  user: {
    backgroundColor: baseColors.primary[400],
    borderColor: 'transparent',
    alignSelf: 'flex-end',
  },
  ai: {
    backgroundColor: baseColors.neutral[100],
    borderColor: baseColors.neutral[200],
    borderWidth: borderWidths.hairline,
    alignSelf: 'flex-start',
  },
  system: {
    backgroundColor: baseColors.support[400],
    borderColor: 'transparent',
    alignSelf: 'center',
  },
  gradient: {
    borderColor: 'transparent',
    alignSelf: 'flex-end',
  },
};

// Chat bubble styles
export const chatBubbleStyles = StyleSheet.create({
  // Container
  container: {
    flexDirection: 'row',
    marginVertical: spacing[2],
    maxWidth: '80%',
  },
  
  // Bubble
  bubble: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radius.lg,
    minWidth: 60,
  },
  
  // Text styles
  text: {
    ...typography.bodyMedium,
    includeFontPadding: false,
  },
  userText: {
    color: baseColors.neutral[0],
  },
  aiText: {
    color: baseColors.neutral[900],
  },
  systemText: {
    color: baseColors.neutral[0],
    ...typography.bodySmall,
  },
  
  // Avatar
  avatarContainer: {
    marginRight: spacing[2],
  },
  avatarContainerRight: {
    marginLeft: spacing[2],
    marginRight: 0,
    order: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: baseColors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarAI: {
    backgroundColor: baseColors.primary[400],
  },
  avatarUser: {
    backgroundColor: baseColors.secondary[500],
  },
  
  // Tail styles
  tail: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
  },
  tailLeft: {
    left: -8,
    bottom: spacing[3],
    borderTopWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftWidth: 0,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  tailRight: {
    right: -8,
    bottom: spacing[3],
    borderTopWidth: 8,
    borderLeftWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 0,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  tailLeftAI: {
    borderRightColor: baseColors.neutral[100],
  },
  tailRightUser: {
    borderLeftColor: baseColors.primary[400],
  },
  
  // Timestamp
  timestamp: {
    ...typography.caption,
    color: baseColors.neutral[500],
    marginTop: spacing[1],
  },
  timestampRight: {
    textAlign: 'right',
  },
  
  // Status indicators
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[1],
  },
  statusIcon: {
    marginLeft: spacing[1],
  },
  
  // Typing indicator
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: baseColors.neutral[500],
    marginHorizontal: 2,
  },
  
  // Reactions
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing[2],
    gap: spacing[1],
  },
  reaction: {
    backgroundColor: baseColors.neutral[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactionCount: {
    ...typography.caption,
    color: baseColors.neutral[700],
    marginLeft: spacing[1],
  },
  
  // Quick replies
  quickRepliesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing[3],
    gap: spacing[2],
  },
  quickReply: {
    backgroundColor: baseColors.neutral[0],
    borderWidth: borderWidths.thin,
    borderColor: baseColors.primary[400],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
  },
  quickReplyText: {
    ...typography.labelMedium,
    color: baseColors.primary[400],
  },
  
  // Media attachments
  mediaContainer: {
    marginTop: spacing[2],
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: 200,
    backgroundColor: baseColors.neutral[200],
  },
  
  // Code blocks
  codeBlock: {
    backgroundColor: baseColors.neutral[900],
    padding: spacing[3],
    borderRadius: radius.md,
    marginTop: spacing[2],
  },
  codeText: {
    ...typography.code,
    color: baseColors.neutral[100],
  },
  
  // Loading state
  loadingContainer: {
    opacity: 0.7,
  },
  
  // Gradient bubble
  gradientBubble: {
    overflow: 'hidden',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  
  // Glass effect
  glassBubble: {
    ...effects.glassmorphism,
  },
  
  // Glow effect
  glowBubble: {
    ...effects.glow.soft.primary,
  },
});

// Message group styles
export const messageGroupStyles = StyleSheet.create({
  group: {
    marginVertical: spacing[3],
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
    paddingHorizontal: spacing[2],
  },
  
  senderName: {
    ...typography.labelMedium,
    color: baseColors.neutral[700],
    marginLeft: spacing[2],
  },
  
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing[4],
  },
  
  dividerLine: {
    flex: 1,
    height: borderWidths.hairline,
    backgroundColor: baseColors.neutral[200],
  },
  
  dividerText: {
    ...typography.caption,
    color: baseColors.neutral[500],
    paddingHorizontal: spacing[3],
  },
});

// Helper function to create chat bubble styles
export const createChatBubbleStyle = (
  type: 'user' | 'ai' | 'system',
  showTail: boolean = false,
  gradient?: boolean
) => {
  const variant = gradient && type === 'user' ? 'gradient' : type;
  const variantStyle = chatBubbleVariants[variant];
  
  return {
    container: {
      ...chatBubbleStyles.container,
      alignSelf: variantStyle.alignSelf,
    },
    bubble: {
      ...chatBubbleStyles.bubble,
      ...variantStyle,
    },
    text: {
      ...chatBubbleStyles.text,
      ...(type === 'user' ? chatBubbleStyles.userText : 
         type === 'ai' ? chatBubbleStyles.aiText : 
         chatBubbleStyles.systemText),
    },
  };
};