import 'package:flutter/material.dart';

/// LUNA app color palette
class LunaColors {
  // Private constructor to prevent instantiation
  LunaColors._();

  // Primary colors
  static const Color primary = Color(0xFF6B46C1);
  static const Color primaryLight = Color(0xFF8B66E1);
  static const Color primaryDark = Color(0xFF4B26A1);

  // Secondary colors
  static const Color secondary = Color(0xFFEC4899);
  static const Color secondaryLight = Color(0xFFF472B6);
  static const Color secondaryDark = Color(0xFFDB2777);

  // Accent colors
  static const Color accent = Color(0xFFF59E0B);
  static const Color accentLight = Color(0xFFFBBF24);
  static const Color accentDark = Color(0xFFD97706);

  // Cosmic colors
  static const Color cosmicPurple = Color(0xFF7C3AED);
  static const Color cosmicPink = Color(0xFFE879F9);
  static const Color cosmicBlue = Color(0xFF60A5FA);
  static const Color cosmicIndigo = Color(0xFF818CF8);
  static const Color starYellow = Color(0xFFFDE047);
  static const Color moonGlow = Color(0xFFF3F4F6);

  // Neutral colors
  static const Color white = Color(0xFFFFFFFF);
  static const Color black = Color(0xFF000000);
  static const Color gray50 = Color(0xFFF9FAFB);
  static const Color gray100 = Color(0xFFF3F4F6);
  static const Color gray200 = Color(0xFFE5E7EB);
  static const Color gray300 = Color(0xFFD1D5DB);
  static const Color gray400 = Color(0xFF9CA3AF);
  static const Color gray500 = Color(0xFF6B7280);
  static const Color gray600 = Color(0xFF4B5563);
  static const Color gray700 = Color(0xFF374151);
  static const Color gray800 = Color(0xFF1F2937);
  static const Color gray900 = Color(0xFF111827);

  // Semantic colors
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, cosmicPurple],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient secondaryGradient = LinearGradient(
    colors: [secondary, cosmicPink],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient cosmicGradient = LinearGradient(
    colors: [cosmicPurple, cosmicPink, cosmicBlue],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient nightSkyGradient = LinearGradient(
    colors: [
      Color(0xFF0F172A),
      Color(0xFF1E293B),
      Color(0xFF334155),
    ],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const RadialGradient moonGlowGradient = RadialGradient(
    colors: [
      moonGlow,
      Color(0x00F3F4F6),
    ],
    radius: 1.5,
  );
}