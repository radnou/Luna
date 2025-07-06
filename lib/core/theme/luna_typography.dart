import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// LUNA app typography system
class LunaTypography {
  // Private constructor to prevent instantiation
  LunaTypography._();

  // Font families
  static String get headerFont => 'Playfair Display';
  static String get bodyFont => 'Inter';
  static String get accentFont => 'Dancing Script';

  // Text styles
  static TextStyle displayLarge({Color? color}) => GoogleFonts.playfairDisplay(
        fontSize: 57,
        height: 1.12,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.25,
        color: color,
      );

  static TextStyle displayMedium({Color? color}) => GoogleFonts.playfairDisplay(
        fontSize: 45,
        height: 1.16,
        fontWeight: FontWeight.w700,
        letterSpacing: 0,
        color: color,
      );

  static TextStyle displaySmall({Color? color}) => GoogleFonts.playfairDisplay(
        fontSize: 36,
        height: 1.22,
        fontWeight: FontWeight.w600,
        letterSpacing: 0,
        color: color,
      );

  static TextStyle headlineLarge({Color? color}) => GoogleFonts.playfairDisplay(
        fontSize: 32,
        height: 1.25,
        fontWeight: FontWeight.w600,
        letterSpacing: 0,
        color: color,
      );

  static TextStyle headlineMedium({Color? color}) => GoogleFonts.playfairDisplay(
        fontSize: 28,
        height: 1.29,
        fontWeight: FontWeight.w600,
        letterSpacing: 0,
        color: color,
      );

  static TextStyle headlineSmall({Color? color}) => GoogleFonts.playfairDisplay(
        fontSize: 24,
        height: 1.33,
        fontWeight: FontWeight.w600,
        letterSpacing: 0,
        color: color,
      );

  static TextStyle titleLarge({Color? color}) => GoogleFonts.inter(
        fontSize: 22,
        height: 1.27,
        fontWeight: FontWeight.w600,
        letterSpacing: 0,
        color: color,
      );

  static TextStyle titleMedium({Color? color}) => GoogleFonts.inter(
        fontSize: 16,
        height: 1.5,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.15,
        color: color,
      );

  static TextStyle titleSmall({Color? color}) => GoogleFonts.inter(
        fontSize: 14,
        height: 1.43,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.1,
        color: color,
      );

  static TextStyle bodyLarge({Color? color}) => GoogleFonts.inter(
        fontSize: 16,
        height: 1.5,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.5,
        color: color,
      );

  static TextStyle bodyMedium({Color? color}) => GoogleFonts.inter(
        fontSize: 14,
        height: 1.43,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.25,
        color: color,
      );

  static TextStyle bodySmall({Color? color}) => GoogleFonts.inter(
        fontSize: 12,
        height: 1.33,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.4,
        color: color,
      );

  static TextStyle labelLarge({Color? color}) => GoogleFonts.inter(
        fontSize: 14,
        height: 1.43,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.1,
        color: color,
      );

  static TextStyle labelMedium({Color? color}) => GoogleFonts.inter(
        fontSize: 12,
        height: 1.33,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.5,
        color: color,
      );

  static TextStyle labelSmall({Color? color}) => GoogleFonts.inter(
        fontSize: 11,
        height: 1.45,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.5,
        color: color,
      );

  // Special accent styles
  static TextStyle accentLarge({Color? color}) => GoogleFonts.dancingScript(
        fontSize: 32,
        height: 1.25,
        fontWeight: FontWeight.w700,
        letterSpacing: 0,
        color: color,
      );

  static TextStyle accentMedium({Color? color}) => GoogleFonts.dancingScript(
        fontSize: 24,
        height: 1.33,
        fontWeight: FontWeight.w600,
        letterSpacing: 0,
        color: color,
      );

  static TextStyle accentSmall({Color? color}) => GoogleFonts.dancingScript(
        fontSize: 18,
        height: 1.44,
        fontWeight: FontWeight.w600,
        letterSpacing: 0,
        color: color,
      );
}