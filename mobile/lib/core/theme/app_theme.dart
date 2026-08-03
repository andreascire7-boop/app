import 'package:flutter/material.dart';

/// Design tokens for the app — same palette as the product-design document
/// (docs/product-design), kept consistent across deliverables.
class AppColors {
  static const navy = Color(0xFF0B2E4F);
  static const accent = Color(0xFF1F7A6C);
  static const backgroundLight = Color(0xFFEEF3F6);
  static const grey = Color(0xFF5A6B76);
  static const danger = Color(0xFFB3261E);
  static const warning = Color(0xFFC77700);
  static const success = Color(0xFF1F7A6C);
}

class AppSpacing {
  static const xs = 4.0;
  static const sm = 8.0;
  static const md = 16.0;
  static const lg = 24.0;
  static const xl = 32.0;
}

class AppTheme {
  static ThemeData light() {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: AppColors.navy,
      primary: AppColors.navy,
      secondary: AppColors.accent,
      error: AppColors.danger,
      brightness: Brightness.light,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: Colors.white,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        foregroundColor: AppColors.navy,
        elevation: 0,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.navy,
          foregroundColor: Colors.white,
          minimumSize: const Size.fromHeight(48),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.md),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        selectedItemColor: AppColors.navy,
        unselectedItemColor: AppColors.grey,
        showUnselectedLabels: true,
      ),
    );
  }
}
