import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'luna_colors.dart';
import 'luna_typography.dart';

/// LUNA app theme configuration
class LunaTheme {
  // Private constructor to prevent instantiation
  LunaTheme._();

  // Light theme
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      
      // Color scheme
      colorScheme: const ColorScheme.light(
        primary: LunaColors.primary,
        onPrimary: LunaColors.white,
        primaryContainer: LunaColors.primaryLight,
        onPrimaryContainer: LunaColors.primaryDark,
        
        secondary: LunaColors.secondary,
        onSecondary: LunaColors.white,
        secondaryContainer: LunaColors.secondaryLight,
        onSecondaryContainer: LunaColors.secondaryDark,
        
        tertiary: LunaColors.accent,
        onTertiary: LunaColors.white,
        tertiaryContainer: LunaColors.accentLight,
        onTertiaryContainer: LunaColors.accentDark,
        
        error: LunaColors.error,
        onError: LunaColors.white,
        errorContainer: Color(0xFFFEE2E2),
        onErrorContainer: Color(0xFF991B1B),
        
        background: LunaColors.gray50,
        onBackground: LunaColors.gray900,
        
        surface: LunaColors.white,
        onSurface: LunaColors.gray900,
        surfaceVariant: LunaColors.gray100,
        onSurfaceVariant: LunaColors.gray700,
        
        outline: LunaColors.gray300,
        outlineVariant: LunaColors.gray200,
        
        shadow: LunaColors.black,
        scrim: LunaColors.black,
        
        inverseSurface: LunaColors.gray900,
        onInverseSurface: LunaColors.gray50,
        inversePrimary: LunaColors.primaryLight,
      ),
      
      // Text theme
      textTheme: TextTheme(
        displayLarge: LunaTypography.displayLarge(color: LunaColors.gray900),
        displayMedium: LunaTypography.displayMedium(color: LunaColors.gray900),
        displaySmall: LunaTypography.displaySmall(color: LunaColors.gray900),
        headlineLarge: LunaTypography.headlineLarge(color: LunaColors.gray900),
        headlineMedium: LunaTypography.headlineMedium(color: LunaColors.gray900),
        headlineSmall: LunaTypography.headlineSmall(color: LunaColors.gray900),
        titleLarge: LunaTypography.titleLarge(color: LunaColors.gray900),
        titleMedium: LunaTypography.titleMedium(color: LunaColors.gray800),
        titleSmall: LunaTypography.titleSmall(color: LunaColors.gray800),
        bodyLarge: LunaTypography.bodyLarge(color: LunaColors.gray700),
        bodyMedium: LunaTypography.bodyMedium(color: LunaColors.gray700),
        bodySmall: LunaTypography.bodySmall(color: LunaColors.gray600),
        labelLarge: LunaTypography.labelLarge(color: LunaColors.gray700),
        labelMedium: LunaTypography.labelMedium(color: LunaColors.gray600),
        labelSmall: LunaTypography.labelSmall(color: LunaColors.gray500),
      ),
      
      // Component themes
      appBarTheme: AppBarTheme(
        backgroundColor: LunaColors.white,
        foregroundColor: LunaColors.gray900,
        elevation: 0,
        centerTitle: true,
        systemOverlayStyle: SystemUiOverlayStyle.dark,
        titleTextStyle: LunaTypography.headlineSmall(color: LunaColors.gray900),
      ),
      
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(30),
          ),
        ),
      ),
      
      cardTheme: CardTheme(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        color: LunaColors.white,
      ),
      
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: LunaColors.gray50,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: LunaColors.gray200),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: LunaColors.gray200),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: LunaColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: LunaColors.error),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      ),
      
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: LunaColors.white,
        selectedItemColor: LunaColors.primary,
        unselectedItemColor: LunaColors.gray400,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
    );
  }

  // Dark theme
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      
      // Color scheme
      colorScheme: const ColorScheme.dark(
        primary: LunaColors.primaryLight,
        onPrimary: LunaColors.white,
        primaryContainer: LunaColors.primary,
        onPrimaryContainer: LunaColors.moonGlow,
        
        secondary: LunaColors.secondaryLight,
        onSecondary: LunaColors.white,
        secondaryContainer: LunaColors.secondary,
        onSecondaryContainer: LunaColors.moonGlow,
        
        tertiary: LunaColors.accentLight,
        onTertiary: LunaColors.black,
        tertiaryContainer: LunaColors.accent,
        onTertiaryContainer: LunaColors.starYellow,
        
        error: Color(0xFFF87171),
        onError: LunaColors.white,
        errorContainer: Color(0xFF7F1D1D),
        onErrorContainer: Color(0xFFFCA5A5),
        
        background: LunaColors.gray900,
        onBackground: LunaColors.gray50,
        
        surface: LunaColors.gray800,
        onSurface: LunaColors.gray50,
        surfaceVariant: LunaColors.gray700,
        onSurfaceVariant: LunaColors.gray200,
        
        outline: LunaColors.gray600,
        outlineVariant: LunaColors.gray700,
        
        shadow: LunaColors.black,
        scrim: LunaColors.black,
        
        inverseSurface: LunaColors.gray50,
        onInverseSurface: LunaColors.gray900,
        inversePrimary: LunaColors.primary,
      ),
      
      // Text theme
      textTheme: TextTheme(
        displayLarge: LunaTypography.displayLarge(color: LunaColors.gray50),
        displayMedium: LunaTypography.displayMedium(color: LunaColors.gray50),
        displaySmall: LunaTypography.displaySmall(color: LunaColors.gray50),
        headlineLarge: LunaTypography.headlineLarge(color: LunaColors.gray50),
        headlineMedium: LunaTypography.headlineMedium(color: LunaColors.gray50),
        headlineSmall: LunaTypography.headlineSmall(color: LunaColors.gray50),
        titleLarge: LunaTypography.titleLarge(color: LunaColors.gray50),
        titleMedium: LunaTypography.titleMedium(color: LunaColors.gray100),
        titleSmall: LunaTypography.titleSmall(color: LunaColors.gray100),
        bodyLarge: LunaTypography.bodyLarge(color: LunaColors.gray200),
        bodyMedium: LunaTypography.bodyMedium(color: LunaColors.gray200),
        bodySmall: LunaTypography.bodySmall(color: LunaColors.gray300),
        labelLarge: LunaTypography.labelLarge(color: LunaColors.gray200),
        labelMedium: LunaTypography.labelMedium(color: LunaColors.gray300),
        labelSmall: LunaTypography.labelSmall(color: LunaColors.gray400),
      ),
      
      // Component themes
      appBarTheme: AppBarTheme(
        backgroundColor: LunaColors.gray800,
        foregroundColor: LunaColors.gray50,
        elevation: 0,
        centerTitle: true,
        systemOverlayStyle: SystemUiOverlayStyle.light,
        titleTextStyle: LunaTypography.headlineSmall(color: LunaColors.gray50),
      ),
      
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(30),
          ),
        ),
      ),
      
      cardTheme: CardTheme(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        color: LunaColors.gray800,
      ),
      
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: LunaColors.gray700,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: LunaColors.gray600),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: LunaColors.gray600),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: LunaColors.primaryLight, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: LunaColors.error),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      ),
      
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: LunaColors.gray800,
        selectedItemColor: LunaColors.primaryLight,
        unselectedItemColor: LunaColors.gray400,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
    );
  }
}