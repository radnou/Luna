import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lottie/lottie.dart';
import '../../constants/app_theme.dart';
import '../../services/user_service.dart';
import '../../widgets/constellation_background.dart';
import '../../widgets/zodiac_avatar.dart';
import '../home_screen.dart';

class ProfileCompletionScreen extends StatefulWidget {
  const ProfileCompletionScreen({Key? key}) : super(key: key);

  @override
  State<ProfileCompletionScreen> createState() => _ProfileCompletionScreenState();
}

class _ProfileCompletionScreenState extends State<ProfileCompletionScreen> {
  bool _isGeneratingAvatar = false;
  
  @override
  void initState() {
    super.initState();
    _generateAvatar();
  }

  Future<void> _generateAvatar() async {
    setState(() => _isGeneratingAvatar = true);
    
    try {
      final userService = Provider.of<UserService>(context, listen: false);
      final user = userService.currentUser;
      
      if (user != null && user.zodiacSign.isNotEmpty) {
        await userService.generateZodiacAvatar(user.zodiacSign);
      }
      
      // Simulate avatar generation time
      await Future.delayed(const Duration(seconds: 2));
    } catch (e) {
      print('Error generating avatar: $e');
    } finally {
      setState(() => _isGeneratingAvatar = false);
    }
  }

  void _navigateToHome() {
    Navigator.pushReplacement(
      context,
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) =>
            const HomeScreen(),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return FadeTransition(
            opacity: animation,
            child: child,
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final userService = Provider.of<UserService>(context);
    final user = userService.currentUser;
    
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: Stack(
        children: [
          const ConstellationBackground(),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Spacer(),
                  
                  // Avatar or Loading
                  if (_isGeneratingAvatar) ...[
                    Container(
                      width: 150,
                      height: 150,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: RadialGradient(
                          colors: [
                            AppTheme.primaryColor.withOpacity(0.2),
                            AppTheme.primaryColor.withOpacity(0.05),
                          ],
                        ),
                      ),
                      child: const Center(
                        child: CircularProgressIndicator(
                          color: AppTheme.primaryColor,
                        ),
                      ),
                    ).animate()
                      .fadeIn()
                      .scale(),
                    const SizedBox(height: 24),
                    Text(
                      'Creating your cosmic avatar...',
                      style: AppTheme.bodyLarge,
                    ).animate()
                      .fadeIn(delay: 200.ms),
                  ] else ...[
                    // Generated Avatar
                    ZodiacAvatar(
                      zodiacSign: user?.zodiacSign ?? 'Aries',
                      size: 150,
                    ).animate()
                      .fadeIn()
                      .scale()
                      .then()
                      .shimmer(duration: 2.seconds),
                    
                    const SizedBox(height: 32),
                    
                    // Welcome Message
                    Text(
                      'Welcome to LUNA,',
                      style: AppTheme.headlineMedium,
                    ).animate()
                      .fadeIn(delay: 400.ms),
                    
                    const SizedBox(height: 8),
                    
                    Text(
                      user?.displayName ?? 'Cosmic Traveler',
                      style: AppTheme.headlineLarge.copyWith(
                        color: AppTheme.accentColor,
                      ),
                    ).animate()
                      .fadeIn(delay: 600.ms)
                      .slideY(begin: 0.1, end: 0),
                    
                    const SizedBox(height: 24),
                    
                    // Zodiac Info
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 12,
                      ),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryColor.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(30),
                        border: Border.all(
                          color: AppTheme.primaryColor.withOpacity(0.3),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            user?.zodiacSign ?? 'Unknown',
                            style: AppTheme.bodyLarge.copyWith(
                              color: AppTheme.primaryColor,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ).animate()
                      .fadeIn(delay: 800.ms)
                      .scale(),
                    
                    const SizedBox(height: 16),
                    
                    // Personality Summary
                    if (user?.personalityProfile != null) ...[
                      Text(
                        user!.personalityProfile!.communicationStyle,
                        style: AppTheme.bodyMedium,
                      ).animate()
                        .fadeIn(delay: 1000.ms),
                      const SizedBox(height: 8),
                      Text(
                        '${user.personalityProfile!.attachmentStyle} Attachment Style',
                        style: AppTheme.bodySmall.copyWith(
                          color: AppTheme.accentColor,
                        ),
                      ).animate()
                        .fadeIn(delay: 1200.ms),
                    ],
                  ],
                  
                  const Spacer(),
                  
                  // Completion Message
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceColor,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: AppTheme.accentColor.withOpacity(0.3),
                      ),
                    ),
                    child: Column(
                      children: [
                        Icon(
                          Icons.check_circle,
                          color: AppTheme.accentColor,
                          size: 48,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Your cosmic profile is complete!',
                          style: AppTheme.bodyLarge.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'You\'re ready to explore meaningful connections aligned with your stars',
                          style: AppTheme.bodyMedium.copyWith(
                            color: Colors.white.withOpacity(0.7),
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ).animate()
                    .fadeIn(delay: 1400.ms)
                    .slideY(begin: 0.1, end: 0),
                  
                  const SizedBox(height: 32),
                  
                  // Start Button
                  ElevatedButton(
                    onPressed: _isGeneratingAvatar ? null : _navigateToHome,
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 56),
                      backgroundColor: AppTheme.accentColor,
                    ),
                    child: const Text(
                      'Start Your Journey',
                      style: TextStyle(
                        color: AppTheme.backgroundColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ).animate()
                    .fadeIn(delay: 1600.ms)
                    .slideY(begin: 0.2, end: 0),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}