import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '@styles/index';
import { JournalCard } from '@components/journal/JournalCard';
import { journalService } from '@services/journal.service';
import { useAuth } from '@hooks/useAuth';
import { JournalEntry, MOOD_OPTIONS } from '@types/journal';

interface FilterOptions {
  mood?: number;
  tags: string[];
  dateRange: 'all' | 'week' | 'month' | 'year';
}

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    tags: [],
    dateRange: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    loadEntries();
  }, [user]);

  const loadEntries = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const userEntries = await journalService.getUserEntries(user.uid, 100);
      setEntries(userEntries);
      
      // Extract all unique tags
      const tags = new Set<string>();
      userEntries.forEach(entry => {
        entry.tags?.forEach(tag => tags.add(tag));
      });
      setAllTags(Array.from(tags).sort());
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEntries = useMemo(() => {
    let filtered = entries;

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.title?.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query) ||
        entry.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Mood filter
    if (filters.mood) {
      filtered = filtered.filter(entry => entry.mood?.value === filters.mood);
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(entry =>
        filters.tags.every(tag => entry.tags?.includes(tag))
      );
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (filters.dateRange) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(entry =>
        new Date(entry.createdAt) >= cutoffDate
      );
    }

    return filtered;
  }, [entries, searchQuery, filters]);

  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const clearFilters = () => {
    setFilters({
      tags: [],
      dateRange: 'all',
    });
  };

  const hasActiveFilters = filters.mood || filters.tags.length > 0 || filters.dateRange !== 'all';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.neutral.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Entries</Text>
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
          <View style={styles.filterButton}>
            <Ionicons name="filter" size={24} color={colors.primary.pink} />
            {hasActiveFilters && <View style={styles.filterDot} />}
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.neutral.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search entries, tags..."
          placeholderTextColor={colors.neutral.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.neutral.gray} />
          </TouchableOpacity>
        )}
      </View>

      {showFilters && (
        <ScrollView style={styles.filtersContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Mood</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {MOOD_OPTIONS.map(mood => {
                const isSelected = filters.mood === mood.value;
                return (
                  <TouchableOpacity
                    key={mood.value}
                    style={[
                      styles.moodFilter,
                      isSelected && { backgroundColor: mood.color },
                    ]}
                    onPress={() => setFilters(prev => ({
                      ...prev,
                      mood: isSelected ? undefined : mood.value,
                    }))}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text style={[
                      styles.moodLabel,
                      isSelected && { color: colors.neutral.white },
                    ]}>
                      {mood.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Date Range</Text>
            <View style={styles.dateFilters}>
              {(['all', 'week', 'month', 'year'] as const).map(range => (
                <TouchableOpacity
                  key={range}
                  style={[
                    styles.dateFilter,
                    filters.dateRange === range && styles.dateFilterActive,
                  ]}
                  onPress={() => setFilters(prev => ({ ...prev, dateRange: range }))}
                >
                  <Text style={[
                    styles.dateFilterText,
                    filters.dateRange === range && styles.dateFilterTextActive,
                  ]}>
                    {range === 'all' ? 'All Time' : `Past ${range}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Tags</Text>
            <View style={styles.tagsFilter}>
              {allTags.map(tag => {
                const isSelected = filters.tags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tagFilter,
                      isSelected && styles.tagFilterActive,
                    ]}
                    onPress={() => toggleTag(tag)}
                  >
                    <Text style={[
                      styles.tagFilterText,
                      isSelected && styles.tagFilterTextActive,
                    ]}>
                      #{tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {hasActiveFilters && (
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear All Filters</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.pink} />
        </View>
      ) : (
        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <JournalCard
              entry={item}
              onPress={() => navigation.navigate('EntryDetails', { entryId: item.id })}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={64} color={colors.neutral.lightGray} />
              <Text style={styles.emptyText}>
                {searchQuery || hasActiveFilters
                  ? 'No entries match your search'
                  : 'Start typing to search your journal'}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.resultsCount}>
        <Text style={styles.resultsCountText}>
          {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'} found
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.neutral.black,
  },
  filterButton: {
    position: 'relative',
  },
  filterDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.semantic.error,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.lightGray,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.md,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.neutral.black,
    paddingVertical: spacing.sm,
    marginLeft: spacing.sm,
  },
  filtersContainer: {
    maxHeight: 300,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.neutral.lightGray,
    paddingVertical: spacing.md,
  },
  filterSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  filterTitle: {
    ...typography.bodyBold,
    color: colors.neutral.black,
    marginBottom: spacing.sm,
  },
  moodFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.lightGray,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xl,
    marginRight: spacing.sm,
  },
  moodEmoji: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  moodLabel: {
    ...typography.caption,
    color: colors.neutral.darkGray,
  },
  dateFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dateFilter: {
    backgroundColor: colors.neutral.lightGray,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  dateFilterActive: {
    backgroundColor: colors.primary.pink,
  },
  dateFilterText: {
    ...typography.caption,
    color: colors.neutral.darkGray,
  },
  dateFilterTextActive: {
    color: colors.neutral.white,
  },
  tagsFilter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagFilter: {
    backgroundColor: colors.neutral.lightGray,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xl,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  tagFilterActive: {
    backgroundColor: colors.secondary.purple,
  },
  tagFilterText: {
    ...typography.caption,
    color: colors.neutral.darkGray,
  },
  tagFilterTextActive: {
    color: colors.neutral.white,
  },
  clearButton: {
    marginHorizontal: spacing.lg,
    alignItems: 'center',
  },
  clearButtonText: {
    ...typography.body,
    color: colors.semantic.error,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xxl * 2,
  },
  emptyText: {
    ...typography.body,
    color: colors.neutral.gray,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  resultsCount: {
    position: 'absolute',
    bottom: spacing.lg,
    alignSelf: 'center',
    backgroundColor: colors.overlay.dark,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xl,
  },
  resultsCountText: {
    ...typography.caption,
    color: colors.neutral.white,
  },
});