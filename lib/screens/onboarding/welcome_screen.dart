import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import '../../constants/app_theme.dart';
import '../../widgets/constellation_background.dart';
import 'auth_screen.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({Key? key}) : super(key: key);

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<WelcomeContent> _pages = [
    WelcomeContent(
      icon: Icons.stars_rounded,
      title: 'Written in the Stars',
      description: 'Discover meaningful connections through the ancient wisdom of astrology combined with modern psychology.',
    ),
    WelcomeContent(
      icon: Icons.psychology_rounded,
      title: 'Understand Yourself',
      description: 'Take our personality assessment to unlock deep insights about your communication style and relationship patterns.',
    ),
    WelcomeContent(
      icon: Icons.favorite_rounded,
      title: 'Find Your Match',
      description: 'Connect with compatible souls who share your values, complement your energy, and align with your stars.',
    ),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _navigateToAuth() {
    Navigator.push(
      context,
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) => const AuthScreen(),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return SlideTransition(
            position: animation.drive(
              Tween(begin: const Offset(1.0, 0.0), end: Offset.zero).chain(
                CurveTween(curve: Curves.easeInOut),
              ),
            ),
            child: child,
          );
        },
      ),
    );
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
                Expanded(
                  child: PageView.builder(
                    controller: _pageController,
                    onPageChanged: (index) {
                      setState(() {
                        _currentPage = index;
                      });
                    },
                    itemCount: _pages.length,
                    itemBuilder: (context, index) {
                      return _buildPage(_pages[index], index);
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(32.0),
                  child: Column(
                    children: [
                      // Page indicator
                      SmoothPageIndicator(
                        controller: _pageController,
                        count: _pages.length,
                        effect: WormEffect(
                          dotWidth: 8,
                          dotHeight: 8,
                          activeDotColor: AppTheme.accentColor,
                          dotColor: AppTheme.accentColor.withOpacity(0.3),
                        ),
                      ),
                      const SizedBox(height: 32),
                      // Buttons
                      if (_currentPage == _pages.length - 1) ...[
                        ElevatedButton(
                          onPressed: _navigateToAuth,
                          style: ElevatedButton.styleFrom(
                            minimumSize: const Size(double.infinity, 56),
                            backgroundColor: AppTheme.primaryColor,
                          ),
                          child: const Text('Get Started'),
                        ).animate()
                          .fadeIn(duration: 500.ms)
                          .slideY(begin: 0.3, end: 0),
                      ] else ...[
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            TextButton(
                              onPressed: _navigateToAuth,
                              child: Text(
                                'Skip',
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.7),
                                ),
                              ),
                            ),
                            ElevatedButton(
                              onPressed: () {
                                _pageController.nextPage(
                                  duration: const Duration(milliseconds: 300),
                                  curve: Curves.easeInOut,
                                );
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.primaryColor,
                              ),
                              child: const Text('Next'),
                            ),
                          ],
                        ),
                      ],
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

  Widget _buildPage(WelcomeContent content, int index) {
    return Padding(
      padding: const EdgeInsets.all(32.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  AppTheme.primaryColor.withOpacity(0.2),
                  AppTheme.primaryColor.withOpacity(0.05),
                ],
              ),
            ),
            child: Icon(
              content.icon,
              size: 64,
              color: AppTheme.primaryColor,
            ),
          ).animate()
            .fadeIn(delay: (index * 100).ms)
            .scale(delay: (index * 100).ms),
          const SizedBox(height: 48),
          Text(
            content.title,
            style: AppTheme.headlineMedium,
            textAlign: TextAlign.center,
          ).animate()
            .fadeIn(delay: (index * 100 + 200).ms)
            .slideY(begin: 0.2, end: 0),
          const SizedBox(height: 16),
          Text(
            content.description,
            style: AppTheme.bodyLarge.copyWith(
              color: Colors.white.withOpacity(0.8),
              height: 1.6,
            ),
            textAlign: TextAlign.center,
          ).animate()
            .fadeIn(delay: (index * 100 + 400).ms)
            .slideY(begin: 0.2, end: 0),
        ],
      ),
    );
  }
}

class WelcomeContent {
  final IconData icon;
  final String title;
  final String description;

  WelcomeContent({
    required this.icon,
    required this.title,
    required this.description,
  });
}