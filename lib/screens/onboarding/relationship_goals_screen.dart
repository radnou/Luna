import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../constants/app_theme.dart';
import '../../services/user_service.dart';
import '../../widgets/constellation_background.dart';
import 'permissions_screen.dart';

class RelationshipGoalsScreen extends StatefulWidget {
  const RelationshipGoalsScreen({Key? key}) : super(key: key);

  @override
  State<RelationshipGoalsScreen> createState() => _RelationshipGoalsScreenState();
}

class _RelationshipGoalsScreenState extends State<RelationshipGoalsScreen> {
  final Set<String> _selectedGoals = {};
  bool _isLoading = false;

  final List<RelationshipGoal> _goals = [
    RelationshipGoal(
      id: 'long_term',
      title: 'Long-term Partnership',
      description: 'Ready for a committed, lasting relationship',
      icon: Icons.favorite,
      color: const Color(0xFFFF6B9D),
    ),
    RelationshipGoal(
      id: 'soul_connection',
      title: 'Soul Connection',
      description: 'Seeking deep spiritual and emotional bonds',
      icon: Icons.self_improvement,
      color: const Color(0xFF6B4EFF),
    ),
    RelationshipGoal(
      id: 'growth_focused',
      title: 'Growth-Focused',
      description: 'Partner for personal and mutual evolution',
      icon: Icons.psychology,
      color: const Color(0xFF4ECDC4),
    ),
    RelationshipGoal(
      id: 'casual_dating',
      title: 'Casual Dating',
      description: 'Exploring connections without pressure',
      icon: Icons.emoji_people,
      color: const Color(0xFFFECA57),
    ),
    RelationshipGoal(
      id: 'friendship_first',
      title: 'Friendship First',
      description: 'Building from a foundation of friendship',
      icon: Icons.people,
      color: const Color(0xFF95E1D3),
    ),
    RelationshipGoal(
      id: 'life_partner',
      title: 'Life Partner',
      description: 'Ready to build a life together',
      icon: Icons.home_filled,
      color: const Color(0xFFF38181),
    ),
  ];

  void _navigateToPermissions() async {
    if (_selectedGoals.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select at least one relationship goal'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final userService = Provider.of<UserService>(context, listen: false);
      await userService.updateRelationshipGoals(_selectedGoals.toList());
      
      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) =>
              const PermissionsScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(
              opacity: animation,
              child: child,
            );
          },
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setState(() => _isLoading = false);
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
                      Icon(
                        Icons.favorite_rounded,
                        size: 64,
                        color: AppTheme.secondaryColor,
                      ).animate()
                        .fadeIn()
                        .scale()
                        .then()
                        .animate(onPlay: (controller) => controller.repeat())
                        .scale(
                          begin: 1.0,
                          end: 1.1,
                          duration: 2.seconds,
                          curve: Curves.easeInOut,
                        ),
                      const SizedBox(height: 24),
                      Text(
                        'Relationship Goals',
                        style: AppTheme.headlineMedium,
                      ).animate()
                        .fadeIn(delay: 200.ms),
                      const SizedBox(height: 8),
                      Text(
                        'What are you looking for?',
                        style: AppTheme.bodyMedium,
                      ).animate()
                        .fadeIn(delay: 400.ms),
                      const SizedBox(height: 8),
                      Text(
                        'Select all that apply',
                        style: AppTheme.bodySmall.copyWith(
                          color: AppTheme.accentColor,
                        ),
                      ).animate()
                        .fadeIn(delay: 600.ms),
                    ],
                  ),
                ),
                
                // Goals Grid
                Expanded(
                  child: GridView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      childAspectRatio: 1.0,
                    ),
                    itemCount: _goals.length,
                    itemBuilder: (context, index) {
                      final goal = _goals[index];
                      return _buildGoalCard(goal, index);
                    },
                  ),
                ),
                
                // Continue Button
                Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    children: [
                      if (_selectedGoals.isNotEmpty)
                        Text(
                          '${_selectedGoals.length} selected',
                          style: AppTheme.bodySmall.copyWith(
                            color: AppTheme.accentColor,
                          ),
                        ).animate()
                          .fadeIn(),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _isLoading ? null : _navigateToPermissions,
                        style: ElevatedButton.styleFrom(
                          minimumSize: const Size(double.infinity, 56),
                        ),
                        child: _isLoading
                            ? const CircularProgressIndicator(color: Colors.white)
                            : const Text('Continue'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGoalCard(RelationshipGoal goal, int index) {
    final isSelected = _selectedGoals.contains(goal.id);
    
    return GestureDetector(
      onTap: () {
        setState(() {
          if (isSelected) {
            _selectedGoals.remove(goal.id);
          } else {
            _selectedGoals.add(goal.id);
          }
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        decoration: BoxDecoration(
          color: isSelected
              ? goal.color.withOpacity(0.2)
              : AppTheme.surfaceColor,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? goal.color : Colors.transparent,
            width: 2,
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                goal.icon,
                size: 40,
                color: isSelected ? goal.color : Colors.white.withOpacity(0.7),
              ),
              const SizedBox(height: 12),
              Text(
                goal.title,
                style: AppTheme.bodyLarge.copyWith(
                  fontWeight: FontWeight.w600,
                  color: isSelected ? Colors.white : Colors.white.withOpacity(0.9),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 4),
              Text(
                goal.description,
                style: AppTheme.bodySmall.copyWith(
                  color: isSelected
                      ? Colors.white.withOpacity(0.8)
                      : Colors.white.withOpacity(0.6),
                ),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    ).animate()
      .fadeIn(delay: (100 * index).ms)
      .scale(delay: (100 * index).ms);
  }
}

class RelationshipGoal {
  final String id;
  final String title;
  final String description;
  final IconData icon;
  final Color color;

  RelationshipGoal({
    required this.id,
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
  });
}