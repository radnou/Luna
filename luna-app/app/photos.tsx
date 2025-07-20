import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, spacing } from '@styles/index';
import { mediaService } from '@services/media.service';
import { useAuth } from '@hooks/useAuth';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - spacing.lg * 2 - spacing.sm * 2) / 3;

interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  createdAt: Date;
  caption?: string;
}

export default function Photos() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, [user]);

  const loadPhotos = async () => {
    if (!user) return;
    
    try {
      const userPhotos = await mediaService.getUserPhotos(user.uid);
      setPhotos(userPhotos);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickImages = async () => {
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
      await uploadPhotos(result.assets);
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
      await uploadPhotos([result.assets[0]]);
    }
  };

  const uploadPhotos = async (assets: ImagePicker.ImagePickerAsset[]) => {
    if (!user) return;

    setIsUploading(true);
    try {
      const uploadPromises = assets.map(asset => 
        mediaService.uploadPhoto(user.uid, asset.uri)
      );
      
      await Promise.all(uploadPromises);
      await loadPhotos(); // Reload photos
      Alert.alert('Success', `${assets.length} photo${assets.length > 1 ? 's' : ''} uploaded`);
    } catch (error) {
      console.error('Error uploading photos:', error);
      Alert.alert('Error', 'Failed to upload photos');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoPress = (photo: Photo) => {
    if (isSelecting) {
      togglePhotoSelection(photo.id);
    } else {
      // Navigate to photo viewer
      router.push({
        pathname: '/photo-viewer',
        params: { photoId: photo.id, photos: JSON.stringify(photos) },
      });
    }
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId) 
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const handleDeleteSelected = () => {
    Alert.alert(
      'Delete Photos',
      `Are you sure you want to delete ${selectedPhotos.length} photo${selectedPhotos.length > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await Promise.all(
                selectedPhotos.map(photoId => mediaService.deletePhoto(photoId))
              );
              await loadPhotos();
              setSelectedPhotos([]);
              setIsSelecting(false);
            } catch (error) {
              console.error('Error deleting photos:', error);
              Alert.alert('Error', 'Failed to delete photos');
            }
          },
        },
      ]
    );
  };

  const renderPhoto = ({ item }: { item: Photo }) => {
    const isSelected = selectedPhotos.includes(item.id);
    
    return (
      <TouchableOpacity
        style={styles.photoContainer}
        onPress={() => handlePhotoPress(item)}
        onLongPress={() => {
          setIsSelecting(true);
          togglePhotoSelection(item.id);
        }}
      >
        <Image source={{ uri: item.thumbnailUrl || item.url }} style={styles.photo} />
        {isSelecting && (
          <View style={[styles.selectionOverlay, isSelected && styles.selectedOverlay]}>
            <Ionicons
              name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={colors.neutral.white}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={colors.gradients.aurora}
        style={styles.emptyGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name="images-outline" size={64} color={colors.neutral.white} />
      </LinearGradient>
      <Text style={styles.emptyTitle}>No Photos Yet</Text>
      <Text style={styles.emptyText}>
        Add photos to create your visual diary
      </Text>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Photos & Media',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.neutral.black} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            isSelecting ? (
              <TouchableOpacity onPress={() => {
                setIsSelecting(false);
                setSelectedPhotos([]);
              }}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setIsSelecting(true)}>
                <Text style={styles.selectButton}>Select</Text>
              </TouchableOpacity>
            )
          ),
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.pink} />
          </View>
        ) : (
          <>
            <FlatList
              data={photos}
              renderItem={renderPhoto}
              keyExtractor={(item) => item.id}
              numColumns={3}
              columnWrapperStyle={styles.row}
              contentContainerStyle={[
                styles.listContent,
                photos.length === 0 && styles.emptyListContent,
              ]}
              ListEmptyComponent={renderEmptyState}
              showsVerticalScrollIndicator={false}
            />

            {/* Action buttons */}
            {!isSelecting ? (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.fab}
                  onPress={handlePickImages}
                  disabled={isUploading}
                >
                  <LinearGradient
                    colors={colors.gradients.primary}
                    style={styles.fabGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {isUploading ? (
                      <ActivityIndicator size="small" color={colors.neutral.white} />
                    ) : (
                      <Ionicons name="images" size={28} color={colors.neutral.white} />
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.fab, styles.cameraFab]}
                  onPress={handleTakePhoto}
                  disabled={isUploading}
                >
                  <View style={styles.cameraFabBackground}>
                    <Ionicons name="camera" size={24} color={colors.primary.pink} />
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.selectionActions}>
                <Text style={styles.selectionCount}>
                  {selectedPhotos.length} selected
                </Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDeleteSelected}
                  disabled={selectedPhotos.length === 0}
                >
                  <Ionicons name="trash" size={24} color={colors.accent.coral} />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
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
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 100,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  photoContainer: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: spacing.sm,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedOverlay: {
    backgroundColor: 'rgba(255, 107, 157, 0.3)',
  },
  emptyContainer: {
    alignItems: 'center',
  },
  emptyGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.neutral.black,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.neutral.gray,
    textAlign: 'center',
  },
  actionButtons: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
  },
  fab: {
    marginBottom: spacing.md,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cameraFab: {
    marginBottom: 0,
  },
  cameraFabBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  selectButton: {
    ...typography.bodyBold,
    color: colors.primary.pink,
  },
  cancelButton: {
    ...typography.bodyBold,
    color: colors.neutral.gray,
  },
  selectionActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGray,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
  },
  selectionCount: {
    ...typography.body,
    color: colors.neutral.black,
  },
  deleteButton: {
    padding: spacing.sm,
  },
});