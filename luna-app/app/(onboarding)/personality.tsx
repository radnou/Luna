import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { colors } from '@/src/styles/colors';
import { OnboardingButton } from '@/src/components/onboarding/OnboardingButton';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface Question {
  id: string;
  question: string;
  emoji: string;
  options: {
    text: string;
    value: string;
    color: string[];
  }[];
}

const questions: Question[] = [
  {
    id: 'communication',
    question: 'Comment préfères-tu communiquer tes émotions?',
    emoji: '💬',
    options: [
      { text: 'Je parle ouvertement de mes sentiments', value: 'direct', color: colors.gradients.primary },
      { text: 'J\'ai besoin de temps pour formuler', value: 'reflective', color: colors.gradients.sunset },
      { text: 'Je m\'exprime mieux par écrit', value: 'written', color: colors.gradients.aurora },
      { text: 'J\'attends qu\'on me demande', value: 'reserved', color: [colors.accent.mint, colors.accent.peach] },
    ],
  },
  {
    id: 'conflict',
    question: 'Face à un conflit, quelle est ta réaction?',
    emoji: '⚡',
    options: [
      { text: 'J\'affronte directement', value: 'confrontational', color: colors.gradients.primary },
      { text: 'Je cherche un compromis', value: 'diplomatic', color: colors.gradients.sunset },
      { text: 'J\'évite et j\'attends que ça passe', value: 'avoidant', color: colors.gradients.aurora },
      { text: 'J\'analyse avant d\'agir', value: 'analytical', color: [colors.accent.mint, colors.accent.peach] },
    ],
  },
  {
    id: 'attachment',
    question: 'Dans tes relations, tu es plutôt...',
    emoji: '💕',
    options: [
      { text: 'Très fusionnelle', value: 'anxious', color: colors.gradients.primary },
      { text: 'Indépendante mais présente', value: 'secure', color: colors.gradients.sunset },
      { text: 'J\'ai besoin de mon espace', value: 'avoidant', color: colors.gradients.aurora },
      { text: 'Ça dépend de la personne', value: 'flexible', color: [colors.accent.mint, colors.accent.peach] },
    ],
  },
  {
    id: 'trust',
    question: 'Faire confiance pour toi c\'est...',
    emoji: '🔐',
    options: [
      { text: 'Facile, je fais vite confiance', value: 'trusting', color: colors.gradients.primary },
      { text: 'Progressif, ça se construit', value: 'cautious', color: colors.gradients.sunset },
      { text: 'Difficile, j\'ai été déçue', value: 'guarded', color: colors.gradients.aurora },
      { text: 'Je fais confiance à mon intuition', value: 'intuitive', color: [colors.accent.mint, colors.accent.peach] },
    ],
  },
  {
    id: 'love_language',
    question: 'Tu te sens aimée quand...',
    emoji: '💝',
    options: [
      { text: 'On me dit des mots doux', value: 'words', color: colors.gradients.primary },
      { text: 'On passe du temps de qualité', value: 'time', color: colors.gradients.sunset },
      { text: 'On me fait des câlins', value: 'touch', color: colors.gradients.aurora },
      { text: 'On me fait des surprises', value: 'gifts', color: [colors.accent.mint, colors.accent.peach] },
    ],
  },
];

export default function PersonalityScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const progressAnimation = useSharedValue(0);
  const questionOpacity = useSharedValue(1);
  const questionScale = useSharedValue(1);

  useEffect(() => {
    progressAnimation.value = withSpring((currentQuestion + 1) / questions.length, {
      damping: 15,
      stiffness: 100,
    });
  }, [currentQuestion]);

  const selectAnswer = (questionId: string, value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    // Animate transition
    questionOpacity.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(() => {
          if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
          } else {
            // Complete personality quiz
            router.push('/(onboarding)/preferences');
          }
        })();
      }
    });
    
    questionScale.value = withTiming(0.95, { duration: 200 }, (finished) => {
      if (finished) {
        questionScale.value = withSpring(1);
        questionOpacity.value = withTiming(1, { duration: 300 });
      }
    });
  };

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressAnimation.value * 100}%`,
  }));

  const questionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: questionOpacity.value,
    transform: [{ scale: questionScale.value }],
  }));

  const question = questions[currentQuestion];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, progressAnimatedStyle]}>
              <LinearGradient
                colors={colors.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFillObject}
              />
            </Animated.View>
          </View>
          <Text style={styles.progressText}>
            Question {currentQuestion + 1} sur {questions.length}
          </Text>
        </View>

        <Animated.View style={[styles.questionContainer, questionAnimatedStyle]}>
          <Text style={styles.emoji}>{question.emoji}</Text>
          <Text style={styles.question}>{question.question}</Text>

          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => (
              <OptionCard
                key={option.value}
                option={option}
                onPress={() => selectAnswer(question.id, option.value)}
                delay={index * 100}
                isSelected={answers[question.id] === option.value}
              />
            ))}
          </View>
        </Animated.View>

        <View style={styles.skipContainer}>
          <OnboardingButton
            title="Passer le quiz"
            onPress={() => router.push('/(onboarding)/preferences')}
            variant="skip"
          />
        </View>
      </View>
    </ScrollView>
  );
}

interface OptionCardProps {
  option: Question['options'][0];
  onPress: () => void;
  delay: number;
  isSelected: boolean;
}

function OptionCard({ option, onPress, delay, isSelected }: OptionCardProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, {
      damping: 15,
      stiffness: 100,
    }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
  }, []);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 150 }, (finished) => {
      if (finished) {
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
        runOnJS(onPress)();
      }
    });
  };

  return (
    <Animated.View style={[styles.optionCardWrapper, cardAnimatedStyle]}>
      <Pressable onPress={handlePress} style={styles.optionPressable}>
        <LinearGradient
          colors={option.color}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.optionCard}
        >
          <Text style={styles.optionText}>{option.text}</Text>
          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Ionicons name="checkmark-circle" size={24} color={colors.neutral.white} />
            </View>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  progressContainer: {
    marginBottom: 40,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.neutral.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.neutral.gray,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  questionContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.neutral.black,
    fontFamily: 'Comfortaa_700Bold',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  optionsContainer: {
    width: '100%',
  },
  optionCardWrapper: {
    marginBottom: 12,
  },
  optionPressable: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  optionCard: {
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  optionText: {
    fontSize: 16,
    color: colors.neutral.white,
    fontFamily: 'Inter_500Medium',
    flex: 1,
  },
  selectedIndicator: {
    marginLeft: 12,
  },
  skipContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
});