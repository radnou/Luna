import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../constants/app_theme.dart';
import '../../models/user_model.dart';
import '../../services/user_service.dart';
import '../../widgets/constellation_background.dart';
import '../../widgets/star_progress_indicator.dart';
import 'astral_profile_screen.dart';

class PersonalityQuestionnaireScreen extends StatefulWidget {
  const PersonalityQuestionnaireScreen({Key? key}) : super(key: key);

  @override
  State<PersonalityQuestionnaireScreen> createState() =>
      _PersonalityQuestionnaireScreenState();
}

class _PersonalityQuestionnaireScreenState
    extends State<PersonalityQuestionnaireScreen> {
  final PageController _pageController = PageController();
  int _currentQuestion = 0;
  final Map<String, int> _answers = {};
  
  final List<PersonalityQuestion> _questions = [
    PersonalityQuestion(
      id: 'social_energy',
      question: 'After a long day, what recharges you most?',
      options: [
        'Meeting friends for dinner or drinks',
        'A quiet evening at home with a book or show',
        'A mix of both, depending on my mood',
        'Working on a personal project or hobby',
      ],
      trait: 'extraversion',
    ),
    PersonalityQuestion(
      id: 'decision_making',
      question: 'When making important decisions, you tend to:',
      options: [
        'Trust your gut feeling and intuition',
        'Analyze all the facts and data carefully',
        'Seek advice from trusted friends and family',
        'Consider how it aligns with your values',
      ],
      trait: 'thinking',
    ),
    PersonalityQuestion(
      id: 'conflict_style',
      question: 'In a disagreement with someone you care about, you:',
      options: [
        'Address it directly and work through it together',
        'Give it time to cool down before discussing',
        'Try to understand their perspective first',
        'Focus on finding a compromise quickly',
      ],
      trait: 'agreeableness',
    ),
    PersonalityQuestion(
      id: 'planning_style',
      question: 'When it comes to planning, you prefer:',
      options: [
        'Having everything scheduled and organized',
        'Keeping things flexible and spontaneous',
        'A general plan with room for changes',
        'Planning only the essentials',
      ],
      trait: 'conscientiousness',
    ),
    PersonalityQuestion(
      id: 'emotional_expression',
      question: 'How do you typically express your emotions?',
      options: [
        'Openly and freely with those close to me',
        'Carefully, after processing them internally',
        'Through actions more than words',
        'It depends on the emotion and situation',
      ],
      trait: 'neuroticism',
    ),
    PersonalityQuestion(
      id: 'social_preference',
      question: 'Your ideal weekend involves:',
      options: [
        'Exploring new places and meeting new people',
        'Quality time with a small group of close friends',
        'Solo activities that bring you joy',
        'A balance of social time and alone time',
      ],
      trait: 'extraversion',
    ),
    PersonalityQuestion(
      id: 'communication_style',
      question: 'In conversations, you tend to:',
      options: [
        'Share stories and personal experiences',
        'Ask questions and listen actively',
        'Keep things light and humorous',
        'Discuss ideas and possibilities',
      ],
      trait: 'openness',
    ),
    PersonalityQuestion(
      id: 'stress_response',
      question: 'When stressed, you usually:',
      options: [
        'Talk it out with someone you trust',
        'Need space to process on your own',
        'Distract yourself with activities',
        'Make a plan to address the source',
      ],
      trait: 'neuroticism',
    ),
    PersonalityQuestion(
      id: 'relationship_pace',
      question: 'In relationships, you prefer to:',
      options: [
        'Take things slow and build gradually',
        'Follow your feelings in the moment',
        'Be intentional about each step',
        'Let things unfold naturally',
      ],
      trait: 'conscientiousness',
    ),
    PersonalityQuestion(
      id: 'trust_building',
      question: 'You build trust with others through:',
      options: [
        'Consistent actions over time',
        'Open and vulnerable conversations',
        'Shared experiences and adventures',
        'Mutual respect and understanding',
      ],
      trait: 'agreeableness',
    ),
    PersonalityQuestion(
      id: 'change_adaptation',
      question: 'How do you handle unexpected changes?',
      options: [
        'Adapt quickly and see it as an adventure',
        'Need time to adjust but manage well',
        'Feel stressed but work through it',
        'Embrace change as an opportunity',
      ],
      trait: 'openness',
    ),
    PersonalityQuestion(
      id: 'value_priority',
      question: 'What matters most in a partner?',
      options: [
        'Emotional intelligence and empathy',
        'Shared values and life goals',
        'Intellectual stimulation and growth',
        'Stability and reliability',
      ],
      trait: 'thinking',
    ),
    PersonalityQuestion(
      id: 'intimacy_style',
      question: 'Emotional intimacy for you means:',
      options: [
        'Deep conversations about feelings and dreams',
        'Comfortable silence and physical presence',
        'Shared activities and quality time',
        'Acts of service and thoughtful gestures',
      ],
      trait: 'openness',
    ),
    PersonalityQuestion(
      id: 'attachment_preference',
      question: 'In relationships, you need:',
      options: [
        'Lots of closeness and connection',
        'A healthy balance of together and apart',
        'Independence with emotional support',
        'Deep connection with personal space',
      ],
      trait: 'extraversion',
    ),
    PersonalityQuestion(
      id: 'growth_mindset',
      question: 'Personal growth in relationships means:',
      options: [
        'Learning and evolving together',
        'Supporting each other\'s individual goals',
        'Challenging each other constructively',
        'Creating a safe space for vulnerability',
      ],
      trait: 'openness',
    ),
  ];

  void _navigateToAstralProfile() {
    // Calculate personality profile based on answers
    final profile = _calculatePersonalityProfile();
    
    // Save to user service
    final userService = Provider.of<UserService>(context, listen: false);
    userService.updatePersonalityProfile(profile);
    
    Navigator.pushReplacement(
      context,
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) =>
            const AstralProfileScreen(),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return FadeTransition(
            opacity: animation,
            child: child,
          );
        },
      ),
    );
  }

  PersonalityProfile _calculatePersonalityProfile() {
    // Calculate trait scores
    final traits = <String, int>{
      'extraversion': 0,
      'agreeableness': 0,
      'conscientiousness': 0,
      'neuroticism': 0,
      'openness': 0,
      'thinking': 0,
    };
    
    for (final question in _questions) {
      final answer = _answers[question.id] ?? 2;
      traits[question.trait] = (traits[question.trait] ?? 0) + answer;
    }
    
    // Determine strengths and growth areas
    final strengths = <String>[];
    final growthAreas = <String>[];
    
    traits.forEach((trait, score) {
      if (score > 10) {
        strengths.add(_getStrengthForTrait(trait));
      } else if (score < 5) {
        growthAreas.add(_getGrowthAreaForTrait(trait));
      }
    });
    
    // Determine communication and attachment styles
    final communicationStyle = _determineCommunicationStyle(traits);
    final attachmentStyle = _determineAttachmentStyle(traits);
    
    return PersonalityProfile(
      traits: traits,
      strengths: strengths,
      growthAreas: growthAreas,
      communicationStyle: communicationStyle,
      attachmentStyle: attachmentStyle,
      values: ['Authenticity', 'Growth', 'Connection'],
      interests: ['Mindfulness', 'Spirituality', 'Psychology'],
    );
  }

  String _getStrengthForTrait(String trait) {
    switch (trait) {
      case 'extraversion':
        return 'Social connection';
      case 'agreeableness':
        return 'Empathy and compassion';
      case 'conscientiousness':
        return 'Reliability and organization';
      case 'neuroticism':
        return 'Emotional awareness';
      case 'openness':
        return 'Creativity and curiosity';
      case 'thinking':
        return 'Analytical thinking';
      default:
        return 'Self-awareness';
    }
  }

  String _getGrowthAreaForTrait(String trait) {
    switch (trait) {
      case 'extraversion':
        return 'Building social confidence';
      case 'agreeableness':
        return 'Setting boundaries';
      case 'conscientiousness':
        return 'Flexibility and spontaneity';
      case 'neuroticism':
        return 'Emotional regulation';
      case 'openness':
        return 'Embracing new experiences';
      case 'thinking':
        return 'Emotional intelligence';
      default:
        return 'Personal development';
    }
  }

  String _determineCommunicationStyle(Map<String, int> traits) {
    if (traits['extraversion']! > 10 && traits['thinking']! > 10) {
      return 'Direct and expressive';
    } else if (traits['agreeableness']! > 10 && traits['openness']! > 10) {
      return 'Empathetic and intuitive';
    } else if (traits['conscientiousness']! > 10) {
      return 'Thoughtful and structured';
    } else {
      return 'Adaptive and balanced';
    }
  }

  String _determineAttachmentStyle(Map<String, int> traits) {
    if (traits['agreeableness']! > 10 && traits['neuroticism']! < 5) {
      return 'Secure';
    } else if (traits['extraversion']! < 5 && traits['neuroticism']! > 10) {
      return 'Anxious';
    } else if (traits['agreeableness']! < 5) {
      return 'Avoidant';
    } else {
      return 'Secure';
    }
  }

  void _selectAnswer(int index) {
    setState(() {
      _answers[_questions[_currentQuestion].id] = index;
    });
    
    if (_currentQuestion < _questions.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      _navigateToAstralProfile();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: Stack(
        children: [
          const ConstellationBackground(),
          SafeArea(
            child: Column(
              children: [
                // Header
                Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    children: [
                      Text(
                        'Personality Insights',
                        style: AppTheme.headlineMedium,
                      ).animate().fadeIn(),
                      const SizedBox(height: 8),
                      Text(
                        'Help us understand you better',
                        style: AppTheme.bodyMedium,
                      ).animate().fadeIn(delay: 200.ms),
                      const SizedBox(height: 24),
                      StarProgressIndicator(
                        current: _currentQuestion + 1,
                        total: _questions.length,
                      ),
                    ],
                  ),
                ),
                
                // Questions
                Expanded(
                  child: PageView.builder(
                    controller: _pageController,
                    onPageChanged: (index) {
                      setState(() {
                        _currentQuestion = index;
                      });
                    },
                    itemCount: _questions.length,
                    itemBuilder: (context, index) {
                      return _buildQuestion(_questions[index]);
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuestion(PersonalityQuestion question) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            question.question,
            style: AppTheme.headlineSmall,
            textAlign: TextAlign.center,
          ).animate()
            .fadeIn()
            .slideY(begin: 0.1, end: 0),
          const SizedBox(height: 48),
          ...question.options.asMap().entries.map((entry) {
            final index = entry.key;
            final option = entry.value;
            final isSelected = _answers[question.id] == index;
            
            return Padding(
              padding: const EdgeInsets.only(bottom: 16.0),
              child: _buildOptionCard(option, index, isSelected),
            );
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildOptionCard(String option, int index, bool isSelected) {
    return GestureDetector(
      onTap: () => _selectAnswer(index),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isSelected
              ? AppTheme.primaryColor.withOpacity(0.2)
              : AppTheme.surfaceColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected
                ? AppTheme.primaryColor
                : Colors.transparent,
            width: 2,
          ),
        ),
        child: Text(
          option,
          style: AppTheme.bodyLarge.copyWith(
            color: isSelected ? Colors.white : Colors.white.withOpacity(0.8),
          ),
          textAlign: TextAlign.center,
        ),
      ),
    ).animate()
      .fadeIn(delay: (100 * index).ms)
      .slideX(begin: 0.1, end: 0);
  }
}

class PersonalityQuestion {
  final String id;
  final String question;
  final List<String> options;
  final String trait;

  PersonalityQuestion({
    required this.id,
    required this.question,
    required this.options,
    required this.trait,
  });
}