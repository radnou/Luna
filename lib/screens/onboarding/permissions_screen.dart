import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../constants/app_theme.dart';
import '../../services/user_service.dart';
import '../../widgets/constellation_background.dart';
import 'profile_completion_screen.dart';

class PermissionsScreen extends StatefulWidget {
  const PermissionsScreen({Key? key}) : super(key: key);

  @override
  State<PermissionsScreen> createState() => _PermissionsScreenState();
}

class _PermissionsScreenState extends State<PermissionsScreen> {
  bool _notificationsEnabled = false;
  bool _locationEnabled = false;
  bool _isLoading = false;

  final List<PermissionItem> _permissions = [
    PermissionItem(
      id: 'notifications',
      title: 'Push Notifications',
      description: 'Get notified about matches and cosmic alignments',
      icon: Icons.notifications_rounded,
      color: AppTheme.primaryColor,
    ),
    PermissionItem(
      id: 'location',
      title: 'Location Access',
      description: 'Find matches near you and calculate accurate charts',
      icon: Icons.location_on_rounded,
      color: AppTheme.secondaryColor,
    ),
  ];

  void _navigateToProfileCompletion() async {
    setState(() => _isLoading = true);

    try {
      // Save permission preferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('notifications_enabled', _notificationsEnabled);
      await prefs.setBool('location_enabled', _locationEnabled);
      
      // Mark onboarding as complete
      final userService = Provider.of<UserService>(context, listen: false);
      await userService.completeOnboarding();
      
      // Mark first time as false
      await prefs.setBool('isFirstTime', false);
      
      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) =>
              const ProfileCompletionScreen(),
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

  Future<void> _requestNotificationPermission() async {
    // In a real app, you would request notification permissions here
    // For now, we'll just toggle the state
    setState(() {
      _notificationsEnabled = !_notificationsEnabled;
    });
  }

  Future<void> _requestLocationPermission() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      
      setState(() {
        _locationEnabled = permission == LocationPermission.whileInUse ||
            permission == LocationPermission.always;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error requesting location permission: ${e.toString()}'),
          backgroundColor: Colors.red,
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
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                children: [
                  const Spacer(),
                  
                  // Icon
                  Container(
                    width: 100,
                    height: 100,
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
                      Icons.security_rounded,
                      size: 50,
                      color: AppTheme.primaryColor,
                    ),
                  ).animate()
                    .fadeIn()
                    .scale(),
                  
                  const SizedBox(height: 32),
                  
                  // Title
                  Text(
                    'Stay Connected',
                    style: AppTheme.headlineMedium,
                  ).animate()
                    .fadeIn(delay: 200.ms),
                  
                  const SizedBox(height: 16),
                  
                  // Description
                  Text(
                    'Enable permissions to enhance your LUNA experience',
                    style: AppTheme.bodyLarge,
                    textAlign: TextAlign.center,
                  ).animate()
                    .fadeIn(delay: 400.ms),
                  
                  const SizedBox(height: 48),
                  
                  // Permission Cards
                  _buildPermissionCard(
                    _permissions[0],
                    _notificationsEnabled,
                    _requestNotificationPermission,
                    600,
                  ),
                  
                  const SizedBox(height: 16),
                  
                  _buildPermissionCard(
                    _permissions[1],
                    _locationEnabled,
                    _requestLocationPermission,
                    800,
                  ),
                  
                  const Spacer(),
                  
                  // Buttons
                  Column(
                    children: [
                      ElevatedButton(
                        onPressed: _isLoading ? null : _navigateToProfileCompletion,
                        style: ElevatedButton.styleFrom(
                          minimumSize: const Size(double.infinity, 56),
                        ),
                        child: _isLoading
                            ? const CircularProgressIndicator(color: Colors.white)
                            : const Text('Continue'),
                      ).animate()
                        .fadeIn(delay: 1000.ms)
                        .slideY(begin: 0.2, end: 0),
                      
                      const SizedBox(height: 16),
                      
                      TextButton(
                        onPressed: _isLoading ? null : _navigateToProfileCompletion,
                        child: Text(
                          'Skip for now',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.7),
                          ),
                        ),
                      ).animate()
                        .fadeIn(delay: 1200.ms),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPermissionCard(
    PermissionItem permission,
    bool isEnabled,
    VoidCallback onTap,
    int delay,
  ) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isEnabled
              ? permission.color.withOpacity(0.2)
              : AppTheme.surfaceColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isEnabled
                ? permission.color
                : Colors.white.withOpacity(0.1),
            width: 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: permission.color.withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                permission.icon,
                color: permission.color,
                size: 24,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    permission.title,
                    style: AppTheme.bodyLarge.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    permission.description,
                    style: AppTheme.bodyMedium.copyWith(
                      color: Colors.white.withOpacity(0.6),
                    ),
                  ),
                ],
              ),
            ),
            Switch(
              value: isEnabled,
              onChanged: (_) => onTap(),
              activeColor: permission.color,
            ),
          ],
        ),
      ),
    ).animate()
      .fadeIn(delay: delay.ms)
      .slideX(begin: 0.1, end: 0);
  }
}

class PermissionItem {
  final String id;
  final String title;
  final String description;
  final IconData icon;
  final Color color;

  PermissionItem({
    required this.id,
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
  });
}