import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '@styles/index';
import { JournalCard } from '@components/journal/JournalCard';
import { journalService } from '@services/journal.service';
import { useAuth } from '@hooks/useAuth';
import { JournalEntry } from '@types/journal';

export default function Journal() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');

  const loadEntries = async (showLoader = true) => {
    if (!user) return;

    if (showLoader) setIsLoading(true);
    try {
      const userEntries = await journalService.getUserEntries(user.uid);
      setEntries(userEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [user])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadEntries(false);
  };

  const handleCreateEntry = () => {
    navigation.navigate('CreateEntry');
  };

  const handleEntryPress = (entry: JournalEntry) => {
    navigation.navigate('EntryDetails', { entryId: entry.id });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={colors.gradients.aurora}
        style={styles.emptyGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name="book-outline" size={64} color={colors.neutral.white} />
      </LinearGradient>
      <Text style={styles.emptyTitle}>Start Your Journey</Text>
      <Text style={styles.emptyText}>
        Create your first journal entry and{`\n`}begin documenting your story
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleCreateEntry}>
        <Text style={styles.emptyButtonText}>Write First Entry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Dear Diary</Text>
        <Text style={styles.subtitle}>
          {entries.length} {entries.length === 1 ? 'memory' : 'memories'} collected
        </Text>
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.viewModeButton}
          onPress={() => setViewMode(viewMode === 'timeline' ? 'calendar' : 'timeline')}
        >
          <Ionicons
            name={viewMode === 'timeline' ? 'calendar-outline' : 'list-outline'}
            size={24}
            color={colors.primary.pink}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search-outline" size={24} color={colors.primary.pink} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.pink} />
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <JournalCard
              entry={item}
              onPress={() => handleEntryPress(item)}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            entries.length === 0 && styles.emptyListContent,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary.pink]}
              tintColor={colors.primary.pink}
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateEntry}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={colors.gradients.primary}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add" size={32} color={colors.neutral.white} />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

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
  greeting: {
    ...typography.h1,
    color: colors.neutral.black,
  },
  subtitle: {
    ...typography.caption,
    color: colors.neutral.gray,
    marginTop: spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewModeButton: {
    marginRight: spacing.md,
  },
  searchButton: {},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: spacing.xxl * 2,
  },
  emptyListContent: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
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
    marginBottom: spacing.xl,
  },
  emptyButton: {
    backgroundColor: colors.primary.pink,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: spacing.xl,
  },
  emptyButtonText: {
    ...typography.bodyBold,
    color: colors.neutral.white,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
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
});