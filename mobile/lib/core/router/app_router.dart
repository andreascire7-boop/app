import 'package:flutter/material.dart';

import '../../features/auth/login_screen.dart';
import '../../features/home/home_screen.dart';
import '../../features/onboarding/onboarding_screen.dart';
import '../../features/splash/splash_screen.dart';

/// Route names — kept centralized so screens never hardcode path strings.
class AppRoutes {
  static const splash = '/splash';
  static const login = '/login';
  static const onboarding = '/onboarding';
  static const home = '/home';
}

Map<String, WidgetBuilder> buildAppRoutes() {
  return {
    AppRoutes.splash: (_) => const SplashScreen(),
    AppRoutes.login: (_) => const LoginScreen(),
    AppRoutes.onboarding: (_) => const OnboardingScreen(),
    AppRoutes.home: (_) => const HomeScreen(),
  };
}
