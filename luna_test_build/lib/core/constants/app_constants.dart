class AppConstants {
  static const String appName = 'LUNA';
  static const String appVersion = '1.0.0';
  static const String appDescription = 'AI-Powered Relationship & Personal Growth App';
  
  // Navigation Routes
  static const String splashRoute = '/splash';
  static const String onboardingRoute = '/onboarding';
  static const String loginRoute = '/login';
  static const String registerRoute = '/register';
  static const String dashboardRoute = '/dashboard';
  static const String journalRoute = '/journal';
  static const String astrologyRoute = '/astrology';
  static const String analysisRoute = '/analysis';
  static const String textingCoachRoute = '/texting-coach';
  static const String premiumRoute = '/premium';
  
  // Storage Keys
  static const String userTokenKey = 'user_token';
  static const String isFirstLaunchKey = 'is_first_launch';
  static const String themeKey = 'theme_mode';
  static const String userPreferencesKey = 'user_preferences';
  
  // Animation Durations
  static const Duration fastAnimation = Duration(milliseconds: 200);
  static const Duration normalAnimation = Duration(milliseconds: 300);
  static const Duration slowAnimation = Duration(milliseconds: 500);
  
  // API Endpoints
  static const String baseApiUrl = 'https://api.luna-app.com';
  static const String authEndpoint = '/auth';
  static const String userEndpoint = '/user';
  static const String journalEndpoint = '/journal';
  static const String astrologyEndpoint = '/astrology';
  static const String analysisEndpoint = '/analysis';
  
  // Error Messages
  static const String genericError = 'Something went wrong. Please try again.';
  static const String networkError = 'Network error. Please check your connection.';
  static const String authError = 'Authentication failed. Please login again.';
  static const String validationError = 'Please check your input and try again.';
  
  // Success Messages
  static const String loginSuccess = 'Welcome back to LUNA!';
  static const String registerSuccess = 'Account created successfully!';
  static const String journalSaved = 'Journal entry saved successfully!';
  static const String analysisComplete = 'Analysis completed successfully!';
}

class AppImages {
  static const String logoPath = 'assets/images/luna_logo.png';
  static const String splashBg = 'assets/images/splash_bg.png';
  static const String onboardingBg = 'assets/images/onboarding_bg.png';
  static const String dashboardBg = 'assets/images/dashboard_bg.png';
  static const String journalIcon = 'assets/icons/journal.png';
  static const String astrologyIcon = 'assets/icons/astrology.png';
  static const String analysisIcon = 'assets/icons/analysis.png';
  static const String textingCoachIcon = 'assets/icons/texting_coach.png';
  static const String premiumIcon = 'assets/icons/premium.png';
}

class AppAnimations {
  static const String loading = 'assets/animations/loading.json';
  static const String success = 'assets/animations/success.json';
  static const String error = 'assets/animations/error.json';
  static const String splash = 'assets/animations/splash.json';
  static const String onboarding = 'assets/animations/onboarding.json';
}

class AppDimensions {
  static const double borderRadius = 12.0;
  static const double buttonHeight = 48.0;
  static const double cardElevation = 4.0;
  static const double horizontalPadding = 16.0;
  static const double verticalPadding = 16.0;
  static const double appBarHeight = 56.0;
  static const double bottomNavHeight = 70.0;
}