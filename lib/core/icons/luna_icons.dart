import 'package:flutter/material.dart';

/// Custom icon set with lunar/astro themes
class LunaIcons {
  LunaIcons._();

  // Moon phases
  static const IconData newMoon = Icons.dark_mode_outlined;
  static const IconData crescentMoon = Icons.nightlight_round;
  static const IconData halfMoon = Icons.brightness_2;
  static const IconData fullMoon = Icons.brightness_1;
  static const IconData waningMoon = Icons.brightness_3;

  // Celestial objects
  static const IconData star = Icons.star;
  static const IconData starOutline = Icons.star_outline;
  static const IconData starHalf = Icons.star_half;
  static const IconData stars = Icons.auto_awesome;
  static const IconData constellation = Icons.scatter_plot;
  static const IconData galaxy = Icons.blur_circular;
  static const IconData sun = Icons.wb_sunny;
  static const IconData planet = Icons.public;
  static const IconData comet = Icons.flare;
  static const IconData meteor = Icons.trending_down;

  // Astrology
  static const IconData zodiac = Icons.circle;
  static const IconData crystal = Icons.diamond;
  static const IconData tarot = Icons.style;
  static const IconData oracle = Icons.visibility;
  static const IconData astrology = Icons.explore;

  // Mystical
  static const IconData magic = Icons.auto_fix_high;
  static const IconData sparkle = Icons.auto_awesome;
  static const IconData aura = Icons.blur_on;
  static const IconData energy = Icons.bolt;
  static const IconData meditation = Icons.self_improvement;
  static const IconData mindfulness = Icons.psychology;
  static const IconData balance = Icons.compare_arrows;
  static const IconData harmony = Icons.tune;

  // Nature
  static const IconData cloud = Icons.cloud;
  static const IconData cloudNight = Icons.nights_stay;
  static const IconData aurora = Icons.gradient;
  static const IconData cosmos = Icons.lens;

  // Navigation
  static const IconData home = Icons.home_rounded;
  static const IconData discover = Icons.explore_rounded;
  static const IconData insights = Icons.insights_rounded;
  static const IconData journal = Icons.book_rounded;
  static const IconData profile = Icons.person_rounded;
  static const IconData settings = Icons.settings_rounded;

  // Actions
  static const IconData add = Icons.add_rounded;
  static const IconData remove = Icons.remove_rounded;
  static const IconData edit = Icons.edit_rounded;
  static const IconData delete = Icons.delete_rounded;
  static const IconData share = Icons.share_rounded;
  static const IconData favorite = Icons.favorite_rounded;
  static const IconData favoriteOutline = Icons.favorite_outline_rounded;
  static const IconData bookmark = Icons.bookmark_rounded;
  static const IconData bookmarkOutline = Icons.bookmark_outline_rounded;

  // Communication
  static const IconData chat = Icons.chat_bubble_rounded;
  static const IconData send = Icons.send_rounded;
  static const IconData notification = Icons.notifications_rounded;
  static const IconData notificationOutline = Icons.notifications_outlined;

  // Time
  static const IconData calendar = Icons.calendar_today_rounded;
  static const IconData clock = Icons.access_time_rounded;
  static const IconData timer = Icons.timer_rounded;
  static const IconData schedule = Icons.schedule_rounded;

  // User states
  static const IconData mood = Icons.mood_rounded;
  static const IconData sleep = Icons.bedtime_rounded;
  static const IconData wake = Icons.wb_twilight_rounded;
  static const IconData relax = Icons.spa_rounded;
  static const IconData focus = Icons.center_focus_strong_rounded;

  // Tools
  static const IconData compass = Icons.explore_rounded;
  static const IconData telescope = Icons.search_rounded;
  static const IconData map = Icons.map_rounded;
  static const IconData guide = Icons.assistant_navigation_rounded;

  // Symbols
  static const IconData infinity = Icons.all_inclusive_rounded;
  static const IconData yinYang = Icons.change_circle_rounded;
  static const IconData lotus = Icons.local_florist_rounded;
  static const IconData eye = Icons.visibility_rounded;
  static const IconData thirdEye = Icons.remove_red_eye_rounded;
}

/// Widget for displaying Luna icons with cosmic effects
class LunaIcon extends StatelessWidget {
  final IconData icon;
  final double size;
  final Color? color;
  final bool showGlow;
  final double glowRadius;
  final Color? glowColor;

  const LunaIcon({
    Key? key,
    required this.icon,
    this.size = 24.0,
    this.color,
    this.showGlow = false,
    this.glowRadius = 8.0,
    this.glowColor,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final iconWidget = Icon(
      icon,
      size: size,
      color: color ?? Theme.of(context).iconTheme.color,
    );

    if (!showGlow) {
      return iconWidget;
    }

    final effectiveGlowColor = glowColor ?? 
        (color ?? Theme.of(context).iconTheme.color ?? Colors.white);

    return Stack(
      alignment: Alignment.center,
      children: [
        // Glow effect
        Icon(
          icon,
          size: size,
          color: effectiveGlowColor.withOpacity(0.5),
        ),
        Container(
          width: size + glowRadius * 2,
          height: size + glowRadius * 2,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: effectiveGlowColor.withOpacity(0.3),
                blurRadius: glowRadius,
                spreadRadius: glowRadius / 2,
              ),
            ],
          ),
        ),
        // Main icon
        iconWidget,
      ],
    );
  }
}

/// Animated moon phase icon
class MoonPhaseIcon extends StatelessWidget {
  final double phase; // 0.0 to 1.0 (new moon to full moon)
  final double size;
  final Color? color;

  const MoonPhaseIcon({
    Key? key,
    required this.phase,
    this.size = 24.0,
    this.color,
  }) : super(key: key);

  IconData _getPhaseIcon() {
    if (phase < 0.1) return LunaIcons.newMoon;
    if (phase < 0.4) return LunaIcons.crescentMoon;
    if (phase < 0.6) return LunaIcons.halfMoon;
    if (phase < 0.9) return LunaIcons.waningMoon;
    return LunaIcons.fullMoon;
  }

  @override
  Widget build(BuildContext context) {
    return LunaIcon(
      icon: _getPhaseIcon(),
      size: size,
      color: color,
      showGlow: phase > 0.5,
      glowRadius: size * 0.3,
    );
  }
}