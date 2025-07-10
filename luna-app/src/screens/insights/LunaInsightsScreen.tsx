import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../styles';
import LunaInsightsService, { Insight } from '../../services/luna-insights.service';
import { useAuth } from '../../hooks/useAuth';
import { useHaptics } from '../../hooks/useHaptics';
import { useRouter } from 'expo-router';

const InsightCard: React.FC<{ 
  insight: Insight; 
  onPress: () => void;
  isExpanded: boolean;
}> = ({ insight, onPress, isExpanded }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const { trigger } = useHaptics();

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePress = () => {
    trigger('impact');
    onPress();
  };

  const getPriorityColor = () => {
    switch (insight.priority) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.primary.main;
    }
  };

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          }],
        },
      ]}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <BlurView intensity={90} tint="light" style={styles.card}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.95)']}
            style={styles.cardGradient}
          />
          
          <View style={styles.cardHeader}>
            <View style={styles.titleRow}>
              <Text style={styles.emoji}>{insight.emoji || '💫'}</Text>
              <Text style={styles.title}>{insight.title}</Text>
            </View>
            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor() }]} />
          </View>

          <Text style={styles.content} numberOfLines={isExpanded ? undefined : 3}>
            {insight.content}
          </Text>

          {isExpanded && insight.actionItems && (
            <View style={styles.actionItems}>
              <Text style={styles.actionTitle}>Actions suggérées:</Text>
              {insight.actionItems.map((item, index) => (
                <View key={index} style={styles.actionItem}>
                  <Ionicons name="sparkles" size={16} color={colors.primary.main} />
                  <Text style={styles.actionText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.cardFooter}>
            <Text style={styles.insightType}>{getInsightTypeLabel(insight.type)}</Text>
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={colors.primary.main} 
            />
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

const getInsightTypeLabel = (type: string): string => {
  const labels: { [key: string]: string } = {
    'mood_pattern': '🌈 Humeur',
    'relationship_advice': '💕 Relations',
    'self_care': '🌸 Self-Care',
    'goal_progress': '🎯 Objectifs',
    'celebration': '🎉 Célébration',
  };
  return labels[type] || '✨ Insight';
};

export default function LunaInsightsScreen() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [timeRecommendations, setTimeRecommendations] = useState<string[]>([]);
  
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadInsights();
    loadTimeRecommendations();
  }, []);

  const loadInsights = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const userInsights = await LunaInsightsService.getPersonalizedInsights(user.uid);
      setInsights(userInsights);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTimeRecommendations = async () => {
    if (!user?.uid) return;
    
    try {
      const recommendations = await LunaInsightsService.getTimeBasedRecommendations(user.uid);
      setTimeRecommendations(recommendations);
    } catch (error) {
      console.error('Error loading time recommendations:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInsights();
    await loadTimeRecommendations();
    setRefreshing(false);
  };

  const toggleCard = (insightId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(insightId)) {
      newExpanded.delete(insightId);
    } else {
      newExpanded.add(insightId);
      // Mark as read
      if (user?.uid) {
        LunaInsightsService.markInsightAsRead(user.uid, insightId);
      }
    }
    setExpandedCards(newExpanded);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Luna analyse tes patterns...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#F5F0FF', '#FFF0F5', '#F0F5FF']}
        style={styles.gradientBackground}
      />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.main}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tes Insights Luna ✨</Text>
          <Text style={styles.headerSubtitle}>
            Découvre tes patterns et célèbre tes progrès
          </Text>
        </View>

        {timeRecommendations.length > 0 && (
          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationsTitle}>
              Pour toi maintenant 🌟
            </Text>
            {timeRecommendations.map((rec, index) => (
              <View key={index} style={styles.recommendation}>
                <Ionicons name="star-outline" size={16} color={colors.primary.main} />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.insightsContainer}>
          {insights.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={styles.emptyTitle}>Pas encore d'insights</Text>
              <Text style={styles.emptyText}>
                Continue à journaler et à partager avec moi pour que je puisse mieux te comprendre!
              </Text>
              <TouchableOpacity 
                style={styles.ctaButton}
                onPress={() => router.push('/journal')}
              >
                <LinearGradient
                  colors={[colors.primary.gradient.start, colors.primary.gradient.end]}
                  style={styles.ctaGradient}
                >
                  <Text style={styles.ctaText}>Commencer à journaler</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            insights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onPress={() => toggleCard(insight.id)}
                isExpanded={expandedCards.has(insight.id)}
              />
            ))
          )}
        </View>

        <TouchableOpacity 
          style={styles.chatButton}
          onPress={() => router.push('/chat')}
        >
          <LinearGradient
            colors={[colors.primary.gradient.start, colors.primary.gradient.end]}
            style={styles.chatButtonGradient}
          >
            <Ionicons name="chatbubbles" size={24} color={colors.white} />
            <Text style={styles.chatButtonText}>Parler avec Luna</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.primary.main,
    marginTop: spacing.md,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  recommendationsContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(147, 112, 219, 0.2)',
  },
  recommendationsTitle: {
    ...typography.h3,
    color: colors.primary.main,
    marginBottom: spacing.sm,
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  recommendationText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    marginLeft: spacing.xs,
    flex: 1,
  },
  insightsContainer: {
    paddingHorizontal: spacing.lg,
  },
  cardContainer: {
    marginBottom: spacing.md,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(147, 112, 219, 0.2)',
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    flex: 1,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: spacing.sm,
  },
  content: {
    ...typography.body,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    lineHeight: 22,
  },
  actionItems: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  actionTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.primary.main,
    marginBottom: spacing.sm,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  actionText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    marginLeft: spacing.xs,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  insightType: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  ctaButton: {
    marginTop: spacing.md,
  },
  ctaGradient: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 25,
  },
  ctaText: {
    ...typography.button,
    color: colors.white,
  },
  chatButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  chatButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 25,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  chatButtonText: {
    ...typography.button,
    color: colors.white,
    marginLeft: spacing.sm,
  },
});