import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, Alert } from 'react-native';
import * as ExpoImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '@styles/index';

interface ImagePickerProps {
  images: string[];
  maxImages?: number;
  onImagesChange: (images: string[]) => void;
  onImageRemove?: (index: number) => void;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  images,
  maxImages = 5,
  onImagesChange,
  onImageRemove,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = async (type: 'camera' | 'gallery') => {
    if (type === 'camera') {
      const { status } = await ExpoImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } else {
      const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    }
  };

  const pickImage = async (source: 'camera' | 'gallery') => {
    if (images.length >= maxImages) {
      Alert.alert('Limit Reached', `You can only add up to ${maxImages} images`);
      return;
    }

    const hasPermission = await requestPermissions(source);
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        `Please grant ${source} permission to add photos to your journal.`
      );
      return;
    }

    setIsLoading(true);
    try {
      let result;
      if (source === 'camera') {
        result = await ExpoImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
          aspect: [4, 3],
        });
      } else {
        result = await ExpoImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
          allowsMultipleSelection: true,
          selectionLimit: maxImages - images.length,
        });
      }

      if (!result.canceled) {
        const newImages = result.assets.map(asset => asset.uri);
        onImagesChange([...images, ...newImages].slice(0, maxImages));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = (index: number) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const newImages = images.filter((_, i) => i !== index);
            onImagesChange(newImages);
            onImageRemove?.(index);
          },
        },
      ]
    );
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Take Photo', onPress: () => pickImage('camera') },
        { text: 'Choose from Gallery', onPress: () => pickImage('gallery') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Photos</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
        {images.map((uri, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeImage(index)}
            >
              <Ionicons name="close-circle" size={24} color={colors.semantic.error} />
            </TouchableOpacity>
          </View>
        ))}
        {images.length < maxImages && (
          <TouchableOpacity onPress={showImageOptions} disabled={isLoading}>
            <LinearGradient
              colors={colors.gradients.primary}
              style={styles.addButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="add-circle-outline" size={32} color={colors.neutral.white} />
              <Text style={styles.addButtonText}>Add</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
      <Text style={styles.hint}>
        {images.length}/{maxImages} photos
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.neutral.black,
    marginBottom: spacing.md,
  },
  imagesScroll: {
    flexDirection: 'row',
  },
  imageContainer: {
    marginRight: spacing.sm,
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: spacing.sm,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    ...typography.caption,
    color: colors.neutral.white,
    marginTop: spacing.xs,
  },
  hint: {
    ...typography.caption,
    color: colors.neutral.gray,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});