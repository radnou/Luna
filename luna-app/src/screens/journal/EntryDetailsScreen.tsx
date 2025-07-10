import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Share,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import PagerView from 'react-native-pager-view';
import { colors, typography, spacing } from '@styles/index';
import { journalService } from '@services/journal.service';
import { mediaService } from '@services/media.service';
import { JournalEntry } from '@types/journal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type RouteParams = {
  EntryDetails: {
    entryId: string;
  };
};

export const EntryDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'EntryDetails'>>();
  const { entryId } = route.params;

  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    loadEntry();
  }, [entryId]);

  const loadEntry = async () => {
    setIsLoading(true);
    try {
      const entryData = await journalService.getEntry(entryId);
      setEntry(entryData);
    } catch (error) {
      console.error('Error loading entry:', error);
      Alert.alert('Error', 'Failed to load journal entry');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditEntry', { entryId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete associated images from storage
              if (entry?.attachments) {
                const imagePaths = entry.attachments
                  .filter(a => a.type === 'image')
                  .map(a => a.storagePath);
                await mediaService.deleteBatch(imagePaths);
              }

              await journalService.deleteEntry(entryId);
              Alert.alert('Success', 'Journal entry deleted', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              console.error('Error deleting entry:', error);
              Alert.alert('Error', 'Failed to delete journal entry');
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!entry) return;

    try {
      const shareContent = `${entry.title ? entry.title + '\\n\\n' : ''}${entry.content}${
        entry.tags && entry.tags.length > 0 ? '\\n\\n' + entry.tags.map(t => `#${t}`).join(' ') : ''
      }`;

      await Share.share({
        message: shareContent,
        title: entry.title || 'Journal Entry',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const openImageViewer = (index: number) => {
    setSelectedImageIndex(index);
    setImageModalVisible(true);
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

  const images = entry.attachments?.filter(a => a.type === 'image') || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.neutral.black} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color={colors.neutral.black} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
            <Ionicons name="create-outline" size={24} color={colors.neutral.black} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
            <Ionicons name="trash-outline" size={24} color={colors.semantic.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.dateContainer}>
            <Text style={styles.date}>{format(new Date(entry.createdAt), 'EEEE, MMMM d, yyyy')}</Text>
            <Text style={styles.time}>{format(new Date(entry.createdAt), 'h:mm a')}</Text>
          </View>

          {entry.mood && (
            <View style={styles.moodContainer}>
              <LinearGradient
                colors={[entry.mood.color, colors.secondary.lightPurple]}
                style={styles.moodGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.moodEmoji}>{entry.mood.emoji}</Text>
              </LinearGradient>
              <Text style={styles.moodLabel}>Feeling {entry.mood.label}</Text>
            </View>
          )}

          {entry.title && <Text style={styles.title}>{entry.title}</Text>}

          <Text style={styles.contentText}>{entry.content}</Text>

          {images.length > 0 && (
            <View style={styles.imagesSection}>
              <Text style={styles.sectionTitle}>Photos</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {images.map((image, index) => (
                  <TouchableOpacity
                    key={image.id}
                    onPress={() => openImageViewer(index)}
                    style={styles.imageContainer}
                  >
                    <Image source={{ uri: image.url }} style={styles.image} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {entry.tags && entry.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {entry.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setImageModalVisible(false)}
          >
            <Ionicons name="close" size={32} color={colors.neutral.white} />
          </TouchableOpacity>
          
          <PagerView
            style={styles.pagerView}
            initialPage={selectedImageIndex}
            onPageSelected={(e) => setSelectedImageIndex(e.nativeEvent.position)}
          >
            {images.map((image) => (
              <View key={image.id} style={styles.modalImageContainer}>
                <Image
                  source={{ uri: image.url }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
                {image.caption && (
                  <Text style={styles.imageCaption}>{image.caption}</Text>
                )}
              </View>
            ))}
          </PagerView>

          <View style={styles.imageIndicator}>
            <Text style={styles.imageIndicatorText}>
              {selectedImageIndex + 1} / {images.length}
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGray,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  dateContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  date: {
    ...typography.h3,
    color: colors.neutral.black,
  },
  time: {
    ...typography.caption,
    color: colors.neutral.gray,
    marginTop: spacing.xs,
  },
  moodContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  moodGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  moodEmoji: {
    fontSize: 40,
  },
  moodLabel: {
    ...typography.body,
    color: colors.neutral.darkGray,
  },
  title: {
    ...typography.h2,
    color: colors.neutral.black,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  contentText: {
    ...typography.body,
    color: colors.neutral.black,
    lineHeight: 26,
    marginBottom: spacing.xl,
  },
  imagesSection: {
    marginVertical: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.neutral.black,
    marginBottom: spacing.md,
  },
  imageContainer: {
    marginRight: spacing.sm,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: spacing.md,
  },
  tagsSection: {
    marginTop: spacing.xl,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.primary.lightPink,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xl,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  tagText: {
    ...typography.body,
    color: colors.primary.darkPink,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.overlay.dark,
  },
  modalCloseButton: {
    position: 'absolute',
    top: spacing.xxl,
    right: spacing.lg,
    zIndex: 10,
    padding: spacing.sm,
  },
  pagerView: {
    flex: 1,
  },
  modalImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: SCREEN_WIDTH,
    height: '80%',
  },
  imageCaption: {
    ...typography.body,
    color: colors.neutral.white,
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  imageIndicator: {
    position: 'absolute',
    bottom: spacing.xxl,
    alignSelf: 'center',
    backgroundColor: colors.overlay.dark,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xl,
  },
  imageIndicatorText: {
    ...typography.caption,
    color: colors.neutral.white,
  },
});