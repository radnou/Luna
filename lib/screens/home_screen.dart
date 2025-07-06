import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../constants/app_theme.dart';
import '../services/auth_service.dart';
import '../services/user_service.dart';
import '../widgets/constellation_background.dart';
import '../widgets/zodiac_avatar.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    final userService = Provider.of<UserService>(context, listen: false);
    await userService.loadCurrentUser();
  }

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    final userService = Provider.of<UserService>(context);
    final user = userService.currentUser;

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: Stack(
        children: [
          const ConstellationBackground(animate: false),
          SafeArea(
            child: CustomScrollView(
              slivers: [
                SliverAppBar(
                  expandedHeight: 200,
                  floating: false,
                  pinned: true,
                  backgroundColor: Colors.transparent,
                  flexibleSpace: FlexibleSpaceBar(
                    title: Text(
                      'LUNA',
                      style: AppTheme.headlineSmall.copyWith(
                        letterSpacing: 4,
                      ),
                    ),
                    centerTitle: true,
                    background: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            AppTheme.primaryColor.withOpacity(0.3),
                            Colors.transparent,
                          ],
                        ),
                      ),
                    ),
                  ),
                  actions: [
                    IconButton(
                      icon: const Icon(Icons.settings),
                      onPressed: () {
                        // Navigate to settings
                      },
                    ),
                  ],
                ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // User Profile Card
                        Container(
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            color: AppTheme.surfaceColor,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: AppTheme.primaryColor.withOpacity(0.3),
                            ),
                          ),
                          child: Row(
                            children: [
                              if (user != null)
                                ZodiacAvatar(
                                  zodiacSign: user.zodiacSign,
                                  size: 80,
                                ),
                              const SizedBox(width: 20),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      user?.displayName ?? 'Loading...',
                                      style: AppTheme.headlineSmall,
                                    ),
                                    const SizedBox(height: 8),
                                    Row(
                                      children: [
                                        Icon(
                                          Icons.stars,
                                          size: 16,
                                          color: AppTheme.accentColor,
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          user?.zodiacSign ?? '',
                                          style: AppTheme.bodyMedium.copyWith(
                                            color: AppTheme.accentColor,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ).animate()
                          .fadeIn()
                          .slideY(begin: 0.1, end: 0),

                        const SizedBox(height: 32),

                        // Welcome Message
                        Text(
                          'Welcome back!',
                          style: AppTheme.headlineMedium,
                        ).animate()
                          .fadeIn(delay: 200.ms),

                        const SizedBox(height: 8),

                        Text(
                          'Your cosmic journey continues...',
                          style: AppTheme.bodyLarge.copyWith(
                            color: Colors.white.withOpacity(0.7),
                          ),
                        ).animate()
                          .fadeIn(delay: 400.ms),

                        const SizedBox(height: 32),

                        // Quick Actions
                        Text(
                          'Quick Actions',
                          style: AppTheme.headlineSmall,
                        ).animate()
                          .fadeIn(delay: 600.ms),

                        const SizedBox(height: 16),

                        GridView.count(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          crossAxisCount: 2,
                          crossAxisSpacing: 16,
                          mainAxisSpacing: 16,
                          children: [
                            _buildActionCard(
                              icon: Icons.explore,
                              title: 'Discover',
                              color: AppTheme.primaryColor,
                              onTap: () {},
                              delay: 800,
                            ),
                            _buildActionCard(
                              icon: Icons.favorite,
                              title: 'Matches',
                              color: AppTheme.secondaryColor,
                              onTap: () {},
                              delay: 900,
                            ),
                            _buildActionCard(
                              icon: Icons.chat,
                              title: 'Messages',
                              color: AppTheme.accentColor,
                              onTap: () {},
                              delay: 1000,
                            ),
                            _buildActionCard(
                              icon: Icons.person,
                              title: 'Profile',
                              color: const Color(0xFF4ECDC4),
                              onTap: () {},
                              delay: 1100,
                            ),
                          ],
                        ),

                        const SizedBox(height: 32),

                        // Sign Out Button (Temporary)
                        Center(
                          child: TextButton(
                            onPressed: () async {
                              await authService.signOut();
                              Navigator.pushReplacementNamed(context, '/');
                            },
                            child: Text(
                              'Sign Out',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.5),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionCard({
    required IconData icon,
    required String title,
    required Color color,
    required VoidCallback onTap,
    required int delay,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: color.withOpacity(0.2),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: color.withOpacity(0.3),
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 48,
              color: color,
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: AppTheme.bodyLarge.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    ).animate()
      .fadeIn(delay: delay.ms)
      .scale(delay: delay.ms);
  }
}