import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
import '../../constants/app_theme.dart';
import '../../services/user_service.dart';
import '../../widgets/constellation_background.dart';
import '../../widgets/location_picker.dart';
import 'relationship_goals_screen.dart';

class AstralProfileScreen extends StatefulWidget {
  const AstralProfileScreen({Key? key}) : super(key: key);

  @override
  State<AstralProfileScreen> createState() => _AstralProfileScreenState();
}

class _AstralProfileScreenState extends State<AstralProfileScreen> {
  DateTime? _selectedDate;
  TimeOfDay? _selectedTime;
  String? _birthLocation;
  double? _latitude;
  double? _longitude;
  bool _isLoading = false;

  void _navigateToRelationshipGoals() async {
    if (_selectedDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select your birth date'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final userService = Provider.of<UserService>(context, listen: false);
      
      // Format birth time if selected
      String? birthTime;
      if (_selectedTime != null) {
        birthTime = '${_selectedTime!.hour.toString().padLeft(2, '0')}:${_selectedTime!.minute.toString().padLeft(2, '0')}';
      }
      
      await userService.updateBirthDetails(
        dateOfBirth: _selectedDate!,
        birthTime: birthTime,
        birthLocation: _birthLocation,
      );
      
      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) =>
              const RelationshipGoalsScreen(),
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

  Future<void> _selectDate() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().subtract(const Duration(days: 365 * 25)),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.dark(
              primary: AppTheme.primaryColor,
              onPrimary: Colors.white,
              surface: AppTheme.surfaceColor,
              onSurface: Colors.white,
            ),
          ),
          child: child!,
        );
      },
    );
    
    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  Future<void> _selectTime() async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.dark(
              primary: AppTheme.primaryColor,
              onPrimary: Colors.white,
              surface: AppTheme.surfaceColor,
              onSurface: Colors.white,
            ),
          ),
          child: child!,
        );
      },
    );
    
    if (picked != null && picked != _selectedTime) {
      setState(() {
        _selectedTime = picked;
      });
    }
  }

  void _selectLocation() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => LocationPicker(
        onLocationSelected: (location, lat, lng) {
          setState(() {
            _birthLocation = location;
            _latitude = lat;
            _longitude = lng;
          });
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
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 40),
                  Icon(
                    Icons.auto_awesome,
                    size: 64,
                    color: AppTheme.accentColor,
                  ).animate()
                    .fadeIn()
                    .scale()
                    .shimmer(duration: 2.seconds),
                  const SizedBox(height: 24),
                  Text(
                    'Your Cosmic Blueprint',
                    style: AppTheme.headlineMedium,
                    textAlign: TextAlign.center,
                  ).animate()
                    .fadeIn(delay: 200.ms),
                  const SizedBox(height: 8),
                  Text(
                    'Your birth details help us calculate your astrological profile',
                    style: AppTheme.bodyMedium,
                    textAlign: TextAlign.center,
                  ).animate()
                    .fadeIn(delay: 400.ms),
                  const SizedBox(height: 48),
                  
                  // Birth Date
                  _buildInputCard(
                    icon: Icons.calendar_today,
                    title: 'Birth Date',
                    subtitle: _selectedDate != null
                        ? DateFormat('MMMM d, yyyy').format(_selectedDate!)
                        : 'Select your birth date',
                    onTap: _selectDate,
                    delay: 600,
                  ),
                  const SizedBox(height: 16),
                  
                  // Birth Time
                  _buildInputCard(
                    icon: Icons.access_time,
                    title: 'Birth Time (Optional)',
                    subtitle: _selectedTime != null
                        ? _selectedTime!.format(context)
                        : 'For more accurate readings',
                    onTap: _selectTime,
                    delay: 800,
                  ),
                  const SizedBox(height: 16),
                  
                  // Birth Location
                  _buildInputCard(
                    icon: Icons.location_on,
                    title: 'Birth Location (Optional)',
                    subtitle: _birthLocation ?? 'For complete astrological chart',
                    onTap: _selectLocation,
                    delay: 1000,
                  ),
                  const SizedBox(height: 32),
                  
                  // Zodiac Info
                  if (_selectedDate != null) ...[
                    _buildZodiacInfo(),
                    const SizedBox(height: 32),
                  ],
                  
                  // Continue Button
                  ElevatedButton(
                    onPressed: _isLoading ? null : _navigateToRelationshipGoals,
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 56),
                    ),
                    child: _isLoading
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text('Continue'),
                  ).animate()
                    .fadeIn(delay: 1200.ms)
                    .slideY(begin: 0.2, end: 0),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    required int delay,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppTheme.surfaceColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: Colors.white.withOpacity(0.1),
            width: 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppTheme.primaryColor.withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                color: AppTheme.primaryColor,
                size: 24,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppTheme.bodyLarge.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: AppTheme.bodyMedium.copyWith(
                      color: Colors.white.withOpacity(0.6),
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right,
              color: Colors.white.withOpacity(0.5),
            ),
          ],
        ),
      ),
    ).animate()
      .fadeIn(delay: delay.ms)
      .slideX(begin: 0.1, end: 0);
  }

  Widget _buildZodiacInfo() {
    final zodiacSign = _getZodiacSign(_selectedDate!);
    final zodiacSymbol = _getZodiacSymbol(zodiacSign);
    final zodiacElement = _getZodiacElement(zodiacSign);
    
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppTheme.primaryColor.withOpacity(0.2),
            AppTheme.secondaryColor.withOpacity(0.2),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: AppTheme.primaryColor.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Column(
        children: [
          Text(
            zodiacSymbol,
            style: const TextStyle(fontSize: 48),
          ).animate()
            .fadeIn()
            .scale(),
          const SizedBox(height: 16),
          Text(
            zodiacSign,
            style: AppTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          Text(
            '$zodiacElement Sign',
            style: AppTheme.bodyMedium.copyWith(
              color: AppTheme.accentColor,
            ),
          ),
        ],
      ),
    ).animate()
      .fadeIn(delay: 1400.ms)
      .shimmer(duration: 2.seconds);
  }

  String _getZodiacSign(DateTime date) {
    int day = date.day;
    int month = date.month;
    
    if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) {
      return 'Aries';
    } else if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) {
      return 'Taurus';
    } else if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) {
      return 'Gemini';
    } else if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) {
      return 'Cancer';
    } else if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) {
      return 'Leo';
    } else if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) {
      return 'Virgo';
    } else if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) {
      return 'Libra';
    } else if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) {
      return 'Scorpio';
    } else if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) {
      return 'Sagittarius';
    } else if ((month == 12 && day >= 22) || (month == 1 && day <= 19)) {
      return 'Capricorn';
    } else if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) {
      return 'Aquarius';
    } else {
      return 'Pisces';
    }
  }

  String _getZodiacSymbol(String sign) {
    switch (sign) {
      case 'Aries':
        return '♈';
      case 'Taurus':
        return '♉';
      case 'Gemini':
        return '♊';
      case 'Cancer':
        return '♋';
      case 'Leo':
        return '♌';
      case 'Virgo':
        return '♍';
      case 'Libra':
        return '♎';
      case 'Scorpio':
        return '♏';
      case 'Sagittarius':
        return '♐';
      case 'Capricorn':
        return '♑';
      case 'Aquarius':
        return '♒';
      case 'Pisces':
        return '♓';
      default:
        return '?';
    }
  }

  String _getZodiacElement(String sign) {
    switch (sign) {
      case 'Aries':
      case 'Leo':
      case 'Sagittarius':
        return 'Fire';
      case 'Taurus':
      case 'Virgo':
      case 'Capricorn':
        return 'Earth';
      case 'Gemini':
      case 'Libra':
      case 'Aquarius':
        return 'Air';
      case 'Cancer':
      case 'Scorpio':
      case 'Pisces':
        return 'Water';
      default:
        return 'Unknown';
    }
  }
}