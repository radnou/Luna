import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { colors, typography, spacing } from '@styles/index';
import { JournalEntry } from '@types/journal';

interface JournalCardProps {
  entry: JournalEntry;
  onPress: () => void;
  onLongPress?: () => void;
}

export const JournalCard: React.FC<JournalCardProps> = ({ entry, onPress, onLongPress }) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const entryDate = new Date(date);
    const diffInDays = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return format(entryDate, 'EEEE');
    return format(entryDate, 'MMM dd, yyyy');
  };

  const truncateContent = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const hasImages = entry.attachments && entry.attachments.some(a => a.type === 'image');

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[colors.neutral.white, colors.neutral.offWhite]}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.date}>{formatDate(entry.createdAt)}</Text>
          {entry.mood && (
            <View style={[styles.moodBadge, { backgroundColor: entry.mood.color }]}>
              <Text style={styles.moodEmoji}>{entry.mood.emoji}</Text>
            </View>
          )}
        </View>

        {entry.title && <Text style={styles.title}>{entry.title}</Text>}

        <Text style={styles.content}>{truncateContent(entry.content)}</Text>

        {hasImages && (
          <View style={styles.imagesContainer}>
            {entry.attachments
              ?.filter(a => a.type === 'image')
              .slice(0, 3)
              .map((attachment, index) => (
                <Image
                  key={attachment.id}
                  source={{ uri: attachment.thumbnailUrl || attachment.url }}
                  style={[
                    styles.thumbnail,
                    index > 0 && { marginLeft: -spacing.sm },
                  ]}
                />
              ))}
            {entry.attachments.filter(a => a.type === 'image').length > 3 && (
              <View style={[styles.moreImages, { marginLeft: -spacing.sm }]}>
                <Text style={styles.moreImagesText}>
                  +{entry.attachments.filter(a => a.type === 'image').length - 3}
                </Text>
              </View>
            )}
          </View>
        )}

        {entry.tags && entry.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {entry.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {entry.tags.length > 3 && (
              <Text style={styles.moreTags}>+{entry.tags.length - 3} more</Text>
            )}
          </View>
        )}

        {entry.isDraft && (
          <View style={styles.draftBadge}>
            <Ionicons name="document-text-outline" size={14} color={colors.neutral.gray} />
            <Text style={styles.draftText}>Draft</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
  },
  card: {
    borderRadius: spacing.lg,
    padding: spacing.lg,
    shadowColor: colors.primary.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  date: {
    ...typography.caption,
    color: colors.neutral.gray,
  },
  moodBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 18,
  },
  title: {
    ...typography.h3,
    color: colors.neutral.black,
    marginBottom: spacing.sm,
  },
  content: {
    ...typography.body,
    color: colors.neutral.darkGray,
    lineHeight: 22,
  },
  imagesContainer: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: spacing.sm,
    borderWidth: 2,
    borderColor: colors.neutral.white,
  },
  moreImages: {
    width: 50,
    height: 50,
    borderRadius: spacing.sm,
    backgroundColor: colors.primary.lightPink,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neutral.white,
  },
  moreImagesText: {
    ...typography.caption,
    color: colors.primary.darkPink,
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    alignItems: 'center',
  },
  tag: {
    backgroundColor: colors.secondary.lightPurple,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xl,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  tagText: {
    ...typography.caption,
    color: colors.secondary.purple,
  },
  moreTags: {
    ...typography.caption,
    color: colors.neutral.gray,
    marginLeft: spacing.xs,
  },
  draftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
  },
  draftText: {
    ...typography.caption,
    color: colors.neutral.gray,
    marginLeft: spacing.xs,
  },
});