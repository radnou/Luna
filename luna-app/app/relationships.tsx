import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, typography, spacing } from '@styles/index';
import { Button } from '@components/Button';
import { journalService } from '@services/journal.service';
import { useAuth } from '@hooks/useAuth';
import type { Relationship } from '@types/journal';

export default function Relationships() {
  const { user } = useAuth();
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState<Relationship | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<Relationship['type']>('romantic');
  const [status, setStatus] = useState<Relationship['status']>('active');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    loadRelationships();
  }, [user]);

  const loadRelationships = async () => {
    if (!user) return;
    
    try {
      const userRelationships = await journalService.getUserRelationships(user.uid);
      setRelationships(userRelationships);
    } catch (error) {
      console.error('Error loading relationships:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setType('romantic');
    setStatus('active');
    setStartDate(undefined);
    setEndDate(undefined);
    setNotes('');
    setEditingRelationship(null);
  };

  const handleAddRelationship = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditRelationship = (relationship: Relationship) => {
    setEditingRelationship(relationship);
    setName(relationship.name);
    setType(relationship.type);
    setStatus(relationship.status);
    setStartDate(relationship.startDate);
    setEndDate(relationship.endDate);
    setNotes(relationship.notes || '');
    setShowAddModal(true);
  };

  const handleSaveRelationship = async () => {
    if (!user || !name.trim()) {
      Alert.alert('Error', 'Please enter a name for the relationship');
      return;
    }

    try {
      const relationshipData: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.uid,
        name: name.trim(),
        type,
        status,
        startDate,
        endDate,
        notes: notes.trim(),
      };

      if (editingRelationship) {
        await journalService.updateRelationship(editingRelationship.id, relationshipData);
      } else {
        await journalService.createRelationship(relationshipData);
      }

      await loadRelationships();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving relationship:', error);
      Alert.alert('Error', 'Failed to save relationship');
    }
  };

  const handleDeleteRelationship = (relationship: Relationship) => {
    Alert.alert(
      'Delete Relationship',
      `Are you sure you want to delete "${relationship.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await journalService.deleteRelationship(relationship.id);
              await loadRelationships();
            } catch (error) {
              console.error('Error deleting relationship:', error);
              Alert.alert('Error', 'Failed to delete relationship');
            }
          },
        },
      ]
    );
  };

  const getRelationshipIcon = (type: Relationship['type']) => {
    switch (type) {
      case 'romantic':
        return 'heart';
      case 'friendship':
        return 'people';
      case 'family':
        return 'home';
      default:
        return 'person';
    }
  };

  const getStatusColor = (status: Relationship['status']) => {
    switch (status) {
      case 'active':
        return colors.accent.green;
      case 'ended':
        return colors.neutral.gray;
      case 'complicated':
        return colors.accent.coral;
      default:
        return colors.neutral.gray;
    }
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

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Relationships',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.neutral.black} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleAddRelationship}>
              <Ionicons name="add" size={24} color={colors.primary.pink} />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {relationships.length === 0 ? (
            <View style={styles.emptyContainer}>
              <LinearGradient
                colors={colors.gradients.aurora}
                style={styles.emptyGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="people-outline" size={64} color={colors.neutral.white} />
              </LinearGradient>
              <Text style={styles.emptyTitle}>No Relationships Yet</Text>
              <Text style={styles.emptyText}>
                Add people who matter to track your relationship journey
              </Text>
              <TouchableOpacity style={styles.emptyButton} onPress={handleAddRelationship}>
                <Text style={styles.emptyButtonText}>Add First Relationship</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.relationshipsList}>
              {relationships.map((relationship) => (
                <TouchableOpacity
                  key={relationship.id}
                  style={styles.relationshipCard}
                  onPress={() => handleEditRelationship(relationship)}
                >
                  <View style={styles.relationshipHeader}>
                    <View style={styles.relationshipIcon}>
                      <Ionicons
                        name={getRelationshipIcon(relationship.type) as any}
                        size={24}
                        color={colors.primary.pink}
                      />
                    </View>
                    <View style={styles.relationshipInfo}>
                      <Text style={styles.relationshipName}>{relationship.name}</Text>
                      <View style={styles.relationshipMeta}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(relationship.status) + '20' }]}>
                          <Text style={[styles.statusText, { color: getStatusColor(relationship.status) }]}>
                            {relationship.status}
                          </Text>
                        </View>
                        <Text style={styles.typeText}>{relationship.type}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.moreButton}
                      onPress={() => handleDeleteRelationship(relationship)}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.accent.coral} />
                    </TouchableOpacity>
                  </View>
                  {relationship.notes && (
                    <Text style={styles.relationshipNotes} numberOfLines={2}>
                      {relationship.notes}
                    </Text>
                  )}
                  {relationship.startDate && (
                    <Text style={styles.dateText}>
                      Since {new Date(relationship.startDate).toLocaleDateString()}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Add/Edit Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingRelationship ? 'Edit Relationship' : 'Add Relationship'}
                </Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Ionicons name="close" size={24} color={colors.neutral.gray} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.form}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      placeholder="Enter name"
                      placeholderTextColor={colors.neutral.gray}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Type</Text>
                    <View style={styles.typeSelector}>
                      {(['romantic', 'friendship', 'family', 'other'] as const).map((t) => (
                        <TouchableOpacity
                          key={t}
                          style={[styles.typeOption, type === t && styles.typeOptionActive]}
                          onPress={() => setType(t)}
                        >
                          <Text style={[styles.typeOptionText, type === t && styles.typeOptionTextActive]}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Status</Text>
                    <View style={styles.statusSelector}>
                      {(['active', 'ended', 'complicated'] as const).map((s) => (
                        <TouchableOpacity
                          key={s}
                          style={[styles.statusOption, status === s && styles.statusOptionActive]}
                          onPress={() => setStatus(s)}
                        >
                          <Text style={[styles.statusOptionText, status === s && styles.statusOptionTextActive]}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Start Date</Text>
                    <TouchableOpacity
                      style={styles.dateInput}
                      onPress={() => setShowStartDatePicker(true)}
                    >
                      <Text style={styles.dateText}>
                        {startDate ? new Date(startDate).toLocaleDateString() : 'Select date'}
                      </Text>
                      <Ionicons name="calendar-outline" size={20} color={colors.neutral.gray} />
                    </TouchableOpacity>
                  </View>

                  {status === 'ended' && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>End Date</Text>
                      <TouchableOpacity
                        style={styles.dateInput}
                        onPress={() => setShowEndDatePicker(true)}
                      >
                        <Text style={styles.dateText}>
                          {endDate ? new Date(endDate).toLocaleDateString() : 'Select date'}
                        </Text>
                        <Ionicons name="calendar-outline" size={20} color={colors.neutral.gray} />
                      </TouchableOpacity>
                    </View>
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Notes</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={notes}
                      onChangeText={setNotes}
                      placeholder="Add any notes..."
                      placeholderTextColor={colors.neutral.gray}
                      multiline
                      numberOfLines={4}
                    />
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setShowAddModal(false)}
                  style={styles.modalButton}
                />
                <Button
                  title="Save"
                  onPress={handleSaveRelationship}
                  style={styles.modalButton}
                />
              </View>
            </View>
          </View>
        </Modal>

        {showStartDatePicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(false);
              if (selectedDate) {
                setStartDate(selectedDate);
              }
            }}
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowEndDatePicker(false);
              if (selectedDate) {
                setEndDate(selectedDate);
              }
            }}
          />
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl * 2,
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
  relationshipsList: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  relationshipCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  relationshipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  relationshipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.pink + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  relationshipInfo: {
    flex: 1,
  },
  relationshipName: {
    ...typography.bodyBold,
    color: colors.neutral.black,
    marginBottom: 4,
  },
  relationshipMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: spacing.xs,
    marginRight: spacing.sm,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  typeText: {
    ...typography.caption,
    color: colors.neutral.gray,
  },
  moreButton: {
    padding: spacing.sm,
  },
  relationshipNotes: {
    ...typography.body,
    color: colors.neutral.gray,
    marginTop: spacing.sm,
  },
  dateText: {
    ...typography.caption,
    color: colors.neutral.gray,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: spacing.lg,
    borderTopRightRadius: spacing.lg,
    paddingTop: spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.neutral.black,
  },
  form: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.bodyBold,
    color: colors.neutral.black,
    marginBottom: spacing.sm,
  },
  input: {
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.neutral.black,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xl,
    backgroundColor: colors.neutral.lightGray,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  typeOptionActive: {
    backgroundColor: colors.primary.pink,
  },
  typeOptionText: {
    ...typography.body,
    color: colors.neutral.gray,
  },
  typeOptionTextActive: {
    color: colors.neutral.white,
  },
  statusSelector: {
    flexDirection: 'row',
  },
  statusOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: spacing.sm,
    backgroundColor: colors.neutral.lightGray,
    marginHorizontal: spacing.xs,
  },
  statusOptionActive: {
    backgroundColor: colors.primary.pink,
  },
  statusOptionText: {
    ...typography.body,
    color: colors.neutral.gray,
  },
  statusOptionTextActive: {
    color: colors.neutral.white,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGray,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});