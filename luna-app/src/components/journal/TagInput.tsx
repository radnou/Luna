import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '@styles/index';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  suggestions?: string[];
  maxTags?: number;
}

const DEFAULT_SUGGESTIONS = [
  'ex', 'crush', 'bestie', 'family', 'work', 'school', 
  'date', 'happy', 'sad', 'anxious', 'excited', 'memories'
];

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onTagsChange,
  suggestions = DEFAULT_SUGGESTIONS,
  maxTags = 10,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      onTagsChange([...tags, trimmedTag]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index));
  };

  const handleInputSubmit = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  const filteredSuggestions = suggestions.filter(
    suggestion => 
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(suggestion.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tags</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={(text) => {
            setInputValue(text);
            setShowSuggestions(text.length > 0);
          }}
          onSubmitEditing={handleInputSubmit}
          placeholder="Add a tag..."
          placeholderTextColor={colors.neutral.gray}
          maxLength={20}
        />
        {inputValue.length > 0 && (
          <TouchableOpacity onPress={handleInputSubmit} style={styles.addButton}>
            <Ionicons name="add-circle" size={24} color={colors.primary.pink} />
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsScroll}>
          {filteredSuggestions.map((suggestion) => (
            <TouchableOpacity
              key={suggestion}
              style={styles.suggestionChip}
              onPress={() => addTag(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.tagsContainer}>
        {tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>#{tag}</Text>
            <TouchableOpacity onPress={() => removeTag(index)} style={styles.removeTagButton}>
              <Ionicons name="close" size={16} color={colors.neutral.white} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <Text style={styles.hint}>
        {tags.length}/{maxTags} tags
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.lightGray,
    borderRadius: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.neutral.black,
    paddingVertical: spacing.sm,
  },
  addButton: {
    marginLeft: spacing.sm,
  },
  suggestionsScroll: {
    marginBottom: spacing.sm,
    maxHeight: 40,
  },
  suggestionChip: {
    backgroundColor: colors.secondary.lightPurple,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xl,
    marginRight: spacing.sm,
  },
  suggestionText: {
    ...typography.caption,
    color: colors.secondary.purple,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.pink,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xl,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  tagText: {
    ...typography.caption,
    color: colors.neutral.white,
    marginRight: spacing.xs,
  },
  removeTagButton: {
    padding: 2,
  },
  hint: {
    ...typography.caption,
    color: colors.neutral.gray,
    marginTop: spacing.sm,
  },
});