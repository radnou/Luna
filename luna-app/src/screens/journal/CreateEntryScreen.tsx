import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing } from '@styles/index';
import { MoodSelector } from '@components/journal/MoodSelector';
import { ImagePicker } from '@components/journal/ImagePicker';
import { TagInput } from '@components/journal/TagInput';
import { journalService } from '@services/journal.service';
import { mediaService } from '@services/media.service';
import { useAuth } from '@hooks/useAuth';
import { JournalEntry, Mood } from '@types/journal';

const DRAFT_KEY = 'journal_draft';

export const CreateEntryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood>();
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const contentInputRef = useRef<TextInput>(null);

  // Auto-save draft
  useEffect(() => {
    const saveDraft = async () => {
      if (title || content || selectedMood || tags.length > 0 || images.length > 0) {
        const draft = {
          title,
          content,
          mood: selectedMood,
          tags,
          images,
          savedAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      }
    };

    const timer = setTimeout(saveDraft, 2000);
    return () => clearTimeout(timer);
  }, [title, content, selectedMood, tags, images]);

  // Load draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draftStr = await AsyncStorage.getItem(DRAFT_KEY);
        if (draftStr) {
          const draft = JSON.parse(draftStr);
          Alert.alert(
            'Draft Found',
            'Would you like to continue with your saved draft?',
            [
              { text: 'Discard', style: 'destructive', onPress: () => clearDraft() },
              {
                text: 'Continue',
                onPress: () => {
                  setTitle(draft.title || '');
                  setContent(draft.content || '');
                  setSelectedMood(draft.mood);
                  setTags(draft.tags || []);
                  setImages(draft.images || []);
                },
              },
            ]
          );
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    };

    loadDraft();
  }, []);

  const clearDraft = async () => {
    await AsyncStorage.removeItem(DRAFT_KEY);
  };

  const handleSave = async (isDraft = false) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to save entries');
      return;
    }

    if (!isDraft && !content.trim()) {
      Alert.alert('Error', 'Please write something in your journal entry');
      return;
    }

    setIsLoading(true);
    try {
      let attachments = [];

      // Upload images if any
      if (images.length > 0 && !isDraft) {
        const uploadResults = await mediaService.uploadBatch(
          images,
          user.uid,
          (progress, individual) => setUploadProgress(progress)
        );

        attachments = uploadResults.map((result, index) => ({
          id: `img_${index}`,
          type: 'image' as const,
          url: result.url,
          thumbnailUrl: result.thumbnailUrl,
          storagePath: result.path,
        }));
      }

      const entryData = {
        userId: user.uid,
        title: title.trim() || undefined,
        content: content.trim(),
        mood: selectedMood,
        tags,
        attachments,
        isPrivate: true,
        isDraft,
      };

      await journalService.createEntry(entryData);
      await clearDraft();

      Alert.alert(
        'Success',
        isDraft ? 'Draft saved successfully' : 'Journal entry created successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save journal entry. Please try again.');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDiscard = () => {
    Alert.alert(
      'Discard Entry',
      'Are you sure you want to discard this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: async () => {
            await clearDraft();
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleDiscard}>
            <Ionicons name="close" size={28} color={colors.neutral.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Entry</Text>
          <TouchableOpacity onPress={() => handleSave(false)} disabled={isLoading}>
            <Text style={[styles.saveButton, isLoading && styles.disabledButton]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            style={styles.titleInput}
            placeholder="Give your entry a title (optional)"
            placeholderTextColor={colors.neutral.gray}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />

          <TextInput
            ref={contentInputRef}
            style={styles.contentInput}
            placeholder="What's on your mind?"
            placeholderTextColor={colors.neutral.gray}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            scrollEnabled={false}
          />

          <MoodSelector selectedMood={selectedMood} onMoodSelect={setSelectedMood} />

          <ImagePicker
            images={images}
            onImagesChange={setImages}
            maxImages={5}
          />

          <TagInput
            tags={tags}
            onTagsChange={setTags}
            maxTags={10}
          />

          <TouchableOpacity
            style={styles.saveDraftButton}
            onPress={() => handleSave(true)}
            disabled={isLoading}
          >
            <Ionicons name="save-outline" size={20} color={colors.primary.pink} />
            <Text style={styles.saveDraftText}>Save as Draft</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.pink} />
            <Text style={styles.loadingText}>
              {uploadProgress > 0 ? `Uploading images... ${uploadProgress}%` : 'Saving...'}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGray,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.neutral.black,
  },
  saveButton: {
    ...typography.bodyBold,
    color: colors.primary.pink,
  },
  disabledButton: {
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  titleInput: {
    ...typography.h3,
    color: colors.neutral.black,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  contentInput: {
    ...typography.body,
    color: colors.neutral.black,
    minHeight: 150,
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  saveDraftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
    backgroundColor: colors.neutral.lightGray,
    borderRadius: spacing.md,
  },
  saveDraftText: {
    ...typography.body,
    color: colors.primary.pink,
    marginLeft: spacing.sm,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: colors.neutral.white,
    padding: spacing.xl,
    borderRadius: spacing.md,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.neutral.black,
    marginTop: spacing.md,
  },
});