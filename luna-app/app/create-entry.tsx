import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '@styles/index';
import { Button } from '@components/Button';
import { journalService } from '@services/journal.service';
import { mediaService } from '@services/media.service';
import { useAuth } from '@hooks/useAuth';
import { MOOD_OPTIONS, type Mood, type JournalEntry } from '@types/journal';

export default function CreateEntry() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const contentRef = useRef<TextInput>(null);

  const handleSave = async (isDraft = false) => {
    if (!user) return;

    if (!content.trim() && !isDraft) {
      Alert.alert('Empty Entry', 'Please write something before saving.');
      return;
    }

    setIsSaving(true);
    try {
      // Upload attachments if any
      let uploadedAttachments = [];
      if (attachments.length > 0) {
        const uploadResults = await mediaService.uploadBatch(attachments, user.uid);
        uploadedAttachments = uploadResults.map(result => ({
          id: Date.now().toString(),
          type: 'image' as const,
          url: result.url,
          thumbnailUrl: result.thumbnailUrl,
          storagePath: result.path,
        }));
      }

      const entry: Partial<JournalEntry> = {
        userId: user.uid,
        title: title.trim(),
        content: content.trim(),
        mood: selectedMood || undefined,
        tags,
        attachments: uploadedAttachments,
        isDraft,
        isPrivate: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await journalService.createEntry(entry as JournalEntry);
      
      Alert.alert(
        'Success',
        isDraft ? 'Draft saved!' : 'Entry created!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newAttachments = result.assets.map(asset => asset.uri);
      setAttachments([...attachments, ...newAttachments]);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your camera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAttachments([...attachments, result.assets[0].uri]);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'New Entry',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity 
                onPress={() => handleSave(true)} 
                style={styles.draftButton}
                disabled={isSaving}
              >
                <Text style={styles.draftButtonText}>Save Draft</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleSave(false)}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={colors.primary.pink} />
                ) : (
                  <Text style={styles.saveButton}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Title Input */}
          <TextInput
            style={styles.titleInput}
            placeholder="Give your entry a title (optional)"
            placeholderTextColor={colors.neutral.gray}
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
            onSubmitEditing={() => contentRef.current?.focus()}
          />

          {/* Mood Selector */}
          <View style={styles.moodSection}>
            <Text style={styles.sectionTitle}>How are you feeling?</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.moodContainer}
            >
              {MOOD_OPTIONS.map((mood) => (
                <TouchableOpacity
                  key={mood.value}
                  style={[
                    styles.moodItem,
                    selectedMood?.value === mood.value && styles.moodItemSelected,
                  ]}
                  onPress={() => setSelectedMood(mood)}
                >
                  <LinearGradient
                    colors={selectedMood?.value === mood.value 
                      ? [mood.color, mood.color + 'CC'] 
                      : [colors.neutral.lightGray, colors.neutral.lightGray]
                    }
                    style={styles.moodGradient}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  </LinearGradient>
                  <Text style={[
                    styles.moodLabel,
                    selectedMood?.value === mood.value && styles.moodLabelSelected,
                  ]}>
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Content Input */}
          <View style={styles.contentSection}>
            <TextInput
              ref={contentRef}
              style={styles.contentInput}
              placeholder="What's on your mind?"
              placeholderTextColor={colors.neutral.gray}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              scrollEnabled={false}
            />
          </View>

          {/* Tags Section */}
          <View style={styles.tagsSection}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.tagInput}
                placeholder="Add a tag"
                placeholderTextColor={colors.neutral.gray}
                value={newTag}
                onChangeText={setNewTag}
                onSubmitEditing={handleAddTag}
                returnKeyType="done"
              />
              <TouchableOpacity style={styles.addTagButton} onPress={handleAddTag}>
                <Ionicons name="add" size={20} color={colors.primary.pink} />
              </TouchableOpacity>
            </View>
            <View style={styles.tagsList}>
              {tags.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.tag}
                  onPress={() => handleRemoveTag(tag)}
                >
                  <Text style={styles.tagText}>#{tag}</Text>
                  <Ionicons name="close" size={16} color={colors.primary.pink} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Attachments Section */}
          {attachments.length > 0 && (
            <View style={styles.attachmentsSection}>
              <Text style={styles.sectionTitle}>Attachments</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.attachmentsList}
              >
                {attachments.map((uri, index) => (
                  <View key={index} style={styles.attachmentItem}>
                    <Image source={{ uri }} style={styles.attachmentImage} />
                    <TouchableOpacity
                      style={styles.removeAttachment}
                      onPress={() => setAttachments(attachments.filter((_, i) => i !== index))}
                    >
                      <Ionicons name="close-circle" size={24} color={colors.accent.coral} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handlePickImage}>
              <Ionicons name="images-outline" size={24} color={colors.primary.pink} />
              <Text style={styles.actionButtonText}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleTakePhoto}>
              <Ionicons name="camera-outline" size={24} color={colors.primary.pink} />
              <Text style={styles.actionButtonText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="location-outline" size={24} color={colors.primary.pink} />
              <Text style={styles.actionButtonText}>Location</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="people-outline" size={24} color={colors.primary.pink} />
              <Text style={styles.actionButtonText}>People</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    ...typography.body,
    color: colors.neutral.gray,
  },
  draftButton: {
    marginRight: spacing.md,
  },
  draftButtonText: {
    ...typography.body,
    color: colors.neutral.gray,
  },
  saveButton: {
    ...typography.bodyBold,
    color: colors.primary.pink,
  },
  titleInput: {
    ...typography.h3,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.neutral.black,
  },
  moodSection: {
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.neutral.black,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  moodContainer: {
    paddingHorizontal: spacing.lg,
  },
  moodItem: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  moodGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodLabel: {
    ...typography.caption,
    color: colors.neutral.gray,
  },
  moodItemSelected: {
    transform: [{ scale: 1.1 }],
  },
  moodLabelSelected: {
    color: colors.neutral.black,
    fontWeight: '600',
  },
  contentSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  contentInput: {
    ...typography.body,
    color: colors.neutral.black,
    minHeight: 200,
  },
  tagsSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  tagInput: {
    flex: 1,
    ...typography.body,
    paddingVertical: spacing.sm,
    color: colors.neutral.black,
  },
  addTagButton: {
    padding: spacing.xs,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.pink + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xl,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  tagText: {
    ...typography.caption,
    color: colors.primary.pink,
    marginRight: spacing.xs,
  },
  attachmentsSection: {
    paddingVertical: spacing.md,
  },
  attachmentsList: {
    paddingHorizontal: spacing.lg,
  },
  attachmentItem: {
    position: 'relative',
    marginRight: spacing.md,
  },
  attachmentImage: {
    width: 80,
    height: 80,
    borderRadius: spacing.sm,
  },
  removeAttachment: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGray,
    marginTop: spacing.xl,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonText: {
    ...typography.caption,
    color: colors.primary.pink,
    marginTop: 4,
  },
});