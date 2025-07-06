import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'welcome_screen.dart';
import '../../constants/app_theme.dart';
import '../../widgets/constellation_background.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigateToWelcome();
  }

  void _navigateToWelcome() async {
    await Future.delayed(const Duration(seconds: 3));
    if (mounted) {
      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) => const WelcomeScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(
              opacity: animation,
              child: child,
            );
          },
          transitionDuration: const Duration(milliseconds: 800),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: Stack(
        children: [
          const ConstellationBackground(),
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Moon icon with glow effect
                Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        AppTheme.accentColor.withOpacity(0.3),
                        AppTheme.accentColor.withOpacity(0.1),
                        Colors.transparent,
                      ],
                      stops: const [0.0, 0.7, 1.0],
                    ),
                  ),
                  child: Icon(
                    Icons.nights_stay_rounded,
                    size: 80,
                    color: AppTheme.accentColor,
                  ),
                ).animate()
                  .fadeIn(duration: 1.seconds)
                  .scale(duration: 1.seconds)
                  .then()
                  .shimmer(duration: 2.seconds, delay: 0.5.seconds),
                
                const SizedBox(height: 24),
                
                // App name
                Text(
                  'LUNA',
                  style: AppTheme.headlineLarge.copyWith(
                    fontSize: 48,
                    letterSpacing: 8,
                    fontWeight: FontWeight.w300,
                  ),
                ).animate()
                  .fadeIn(delay: 0.5.seconds, duration: 1.seconds)
                  .slideY(begin: 0.3, end: 0, duration: 1.seconds),
                
                const SizedBox(height: 8),
                
                // Tagline
                Text(
                  'Written in the Stars',
                  style: AppTheme.bodyLarge.copyWith(
                    color: AppTheme.accentColor.withOpacity(0.8),
                    letterSpacing: 2,
                  ),
                ).animate()
                  .fadeIn(delay: 1.seconds, duration: 1.seconds),
              ],
            ),
          ),
        ],
      ),
    );
  }
}