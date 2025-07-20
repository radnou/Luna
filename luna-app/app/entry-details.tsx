import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '@styles/index';
import { journalService } from '@services/journal.service';
import type { JournalEntry } from '@types/journal';

export default function EntryDetails() {
  const { id } = useLocalSearchParams();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEntry();
  }, [id]);

  const loadEntry = async () => {
    if (!id || typeof id !== 'string') {
      Alert.alert('Error', 'Invalid entry ID');
      router.back();
      return;
    }

    try {
      const journalEntry = await journalService.getEntry(id);
      if (!journalEntry) {
        Alert.alert('Error', 'Entry not found');
        router.back();
        return;
      }
      setEntry(journalEntry);
    } catch (error) {
      console.error('Error loading entry:', error);
      Alert.alert('Error', 'Failed to load entry');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/edit-entry?id=${id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await journalService.deleteEntry(id as string);
              Alert.alert('Success', 'Entry deleted');
              router.back();
            } catch (error) {
              console.error('Error deleting entry:', error);
              Alert.alert('Error', 'Failed to delete entry');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.pink} />
        </View>
      </SafeAreaView>
    );
  }

  if (!entry) {
    return null;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.neutral.black} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
                <Ionicons name="create-outline" size={24} color={colors.neutral.black} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
                <Ionicons name="trash-outline" size={24} color={colors.accent.coral} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header with mood and date */}
          <View style={styles.header}>
            {entry.mood && (
              <LinearGradient
                colors={[entry.mood.color, entry.mood.color + 'CC']}
                style={styles.moodBadge}
              >
                <Text style={styles.moodEmoji}>{entry.mood.emoji}</Text>
                <Text style={styles.moodLabel}>{entry.mood.label}</Text>
              </LinearGradient>
            )}
            <Text style={styles.date}>
              {new Date(entry.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          </View>

          {/* Title */}
          {entry.title && (
            <Text style={styles.title}>{entry.title}</Text>
          )}

          {/* Content */}
          <Text style={styles.content}>{entry.content}</Text>

          {/* Attachments */}
          {entry.attachments && entry.attachments.length > 0 && (
            <View style={styles.attachmentsSection}>
              <Text style={styles.sectionTitle}>Photos</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.attachmentsList}
              >
                {entry.attachments.map((attachment, index) => (
                  <TouchableOpacity key={index} style={styles.attachmentItem}>
                    <Image 
                      source={{ uri: attachment.thumbnailUrl || attachment.url }} 
                      style={styles.attachmentImage} 
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsList}>
                {entry.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Location */}
          {entry.location && (
            <View style={styles.locationSection}>
              <Ionicons name="location" size={20} color={colors.neutral.gray} />
              <Text style={styles.locationText}>{entry.location.name}</Text>
            </View>
          )}

          {/* Relationship */}
          {entry.relationshipId && (
            <View style={styles.relationshipSection}>
              <Ionicons name="people" size={20} color={colors.neutral.gray} />
              <Text style={styles.relationshipText}>Tagged relationship</Text>
            </View>
          )}

          {/* Metadata */}
          <View style={styles.metadata}>
            <Text style={styles.metadataText}>
              Created {new Date(entry.createdAt).toLocaleDateString()}
            </Text>
            {entry.updatedAt && entry.updatedAt !== entry.createdAt && (
              <Text style={styles.metadataText}>
                Updated {new Date(entry.updatedAt).toLocaleDateString()}
              </Text>
            )}
            {entry.isDraft && (
              <View style={styles.draftBadge}>
                <Text style={styles.draftText}>Draft</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: spacing.md,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xl,
    marginBottom: spacing.md,
  },
  moodEmoji: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  moodLabel: {
    ...typography.bodyBold,
    color: colors.neutral.white,
  },
  date: {
    ...typography.body,
    color: colors.neutral.gray,
    textAlign: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.neutral.black,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  content: {
    ...typography.body,
    color: colors.neutral.black,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.neutral.black,
    marginBottom: spacing.sm,
  },
  attachmentsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  attachmentsList: {
    paddingRight: spacing.lg,
  },
  attachmentItem: {
    marginRight: spacing.md,
  },
  attachmentImage: {
    width: 200,
    height: 200,
    borderRadius: spacing.md,
  },
  tagsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.primary.pink + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xl,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  tagText: {
    ...typography.body,
    color: colors.primary.pink,
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  locationText: {
    ...typography.body,
    color: colors.neutral.gray,
    marginLeft: spacing.sm,
  },
  relationshipSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  relationshipText: {
    ...typography.body,
    color: colors.neutral.gray,
    marginLeft: spacing.sm,
  },
  metadata: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGray,
    marginTop: spacing.xl,
  },
  metadataText: {
    ...typography.caption,
    color: colors.neutral.gray,
    marginBottom: spacing.xs,
  },
  draftBadge: {
    backgroundColor: colors.accent.coral + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: spacing.xs,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  draftText: {
    ...typography.caption,
    color: colors.accent.coral,
    fontWeight: '600',
  },
});