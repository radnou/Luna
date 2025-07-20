import { device, expect, element, by, waitFor } from 'detox';

describe('Authentication', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // Clear any existing authentication
    await clearAuth();
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  it('should show auth screen for new users', async () => {
    // Skip onboarding to get to auth
    await completeOnboarding();
    
    // Sign out if signed in
    await signOut();

    // Should show auth screen
    await waitFor(element(by.id('auth-screen')))
      .toBeVisible()
      .withTimeout(5000);

    await expect(element(by.text('Connexion'))).toBeVisible();
    await expect(element(by.text('Inscription'))).toBeVisible();
  });

  it('should register new user with email and password', async () => {
    await navigateToAuth();
    
    // Switch to register
    await element(by.text('Inscription')).tap();
    await waitFor(element(by.id('register-form')))
      .toBeVisible()
      .withTimeout(3000);

    // Fill registration form
    await element(by.id('register-name-input')).typeText('Test User');
    await element(by.id('register-email-input')).typeText('test@luna-app.com');
    await element(by.id('register-password-input')).typeText('TestPassword123!');
    await element(by.id('register-confirm-password-input')).typeText('TestPassword123!');

    // Accept terms
    await element(by.id('terms-checkbox')).tap();

    // Submit registration
    await element(by.id('register-button')).tap();

    // Should navigate to main app
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should login existing user', async () => {
    await navigateToAuth();

    // Fill login form
    await element(by.id('login-email-input')).typeText('test@luna-app.com');
    await element(by.id('login-password-input')).typeText('TestPassword123!');

    // Submit login
    await element(by.id('login-button')).tap();

    // Should navigate to main app
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should handle invalid credentials', async () => {
    await navigateToAuth();

    // Try invalid credentials
    await element(by.id('login-email-input')).typeText('wrong@email.com');
    await element(by.id('login-password-input')).typeText('wrongpassword');
    await element(by.id('login-button')).tap();

    // Should show error message
    await waitFor(element(by.text('Identifiants incorrects')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should validate email format', async () => {
    await navigateToAuth();

    // Try invalid email
    await element(by.id('login-email-input')).typeText('invalid-email');
    await element(by.id('login-password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    // Should show email validation error
    await expect(element(by.text('Format email invalide'))).toBeVisible();
  });

  it('should validate password strength on registration', async () => {
    await navigateToAuth();
    await element(by.text('Inscription')).tap();

    await element(by.id('register-name-input')).typeText('Test User');
    await element(by.id('register-email-input')).typeText('test2@luna-app.com');
    
    // Try weak password
    await element(by.id('register-password-input')).typeText('123');
    await element(by.id('register-confirm-password-input')).typeText('123');

    // Should show password strength indicator
    await expect(element(by.id('password-strength-weak'))).toBeVisible();
    await expect(element(by.text('Mot de passe trop faible'))).toBeVisible();
  });

  it('should handle password mismatch', async () => {
    await navigateToAuth();
    await element(by.text('Inscription')).tap();

    await element(by.id('register-name-input')).typeText('Test User');
    await element(by.id('register-email-input')).typeText('test3@luna-app.com');
    await element(by.id('register-password-input')).typeText('TestPassword123!');
    await element(by.id('register-confirm-password-input')).typeText('DifferentPassword123!');

    await element(by.id('register-button')).tap();

    // Should show password mismatch error
    await expect(element(by.text('Les mots de passe ne correspondent pas'))).toBeVisible();
  });

  it('should handle forgot password', async () => {
    await navigateToAuth();

    // Click forgot password
    await element(by.text('Mot de passe oublié?')).tap();

    await waitFor(element(by.id('forgot-password-modal')))
      .toBeVisible()
      .withTimeout(3000);

    // Enter email
    await element(by.id('forgot-password-email')).typeText('test@luna-app.com');
    await element(by.id('send-reset-button')).tap();

    // Should show confirmation
    await waitFor(element(by.text('Email de récupération envoyé')))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should handle Google sign in', async () => {
    await navigateToAuth();

    // Tap Google sign in
    await element(by.id('google-signin-button')).tap();

    // Mock Google sign in success
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should handle Apple sign in', async () => {
    await navigateToAuth();

    // Tap Apple sign in (iOS only)
    if (device.getPlatform() === 'ios') {
      await element(by.id('apple-signin-button')).tap();

      // Mock Apple sign in success
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(10000);
    }
  });

  it('should persist authentication state', async () => {
    // Login first
    await navigateToAuth();
    await element(by.id('login-email-input')).typeText('test@luna-app.com');
    await element(by.id('login-password-input')).typeText('TestPassword123!');
    await element(by.id('login-button')).tap();

    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(10000);

    // Restart app
    await device.terminateApp();
    await device.launchApp();

    // Should stay logged in
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should handle logout', async () => {
    // Ensure user is logged in
    await navigateToAuth();
    await element(by.id('login-email-input')).typeText('test@luna-app.com');
    await element(by.id('login-password-input')).typeText('TestPassword123!');
    await element(by.id('login-button')).tap();

    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(10000);

    // Navigate to profile and logout
    await element(by.id('tab-profile')).tap();
    await element(by.id('settings-button')).tap();
    await element(by.id('logout-button')).tap();

    // Confirm logout
    await element(by.text('Déconnexion')).tap();

    // Should return to auth screen
    await waitFor(element(by.id('auth-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should handle biometric authentication', async () => {
    // Login first
    await navigateToAuth();
    await element(by.id('login-email-input')).typeText('test@luna-app.com');
    await element(by.id('login-password-input')).typeText('TestPassword123!');
    await element(by.id('login-button')).tap();

    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(10000);

    // Enable biometric in settings
    await element(by.id('tab-profile')).tap();
    await element(by.id('settings-button')).tap();
    await element(by.id('biometric-toggle')).tap();

    // Mock biometric enrollment
    await element(by.text('Activer')).tap();

    // Should show biometric enabled
    await expect(element(by.text('Biométrie activée'))).toBeVisible();

    // Logout and try biometric login
    await element(by.id('logout-button')).tap();
    await element(by.text('Déconnexion')).tap();

    await waitFor(element(by.id('auth-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Should show biometric option
    await expect(element(by.id('biometric-login-button'))).toBeVisible();
  });

  it('should handle account deletion', async () => {
    // Login first
    await navigateToAuth();
    await element(by.id('login-email-input')).typeText('test@luna-app.com');
    await element(by.id('login-password-input')).typeText('TestPassword123!');
    await element(by.id('login-button')).tap();

    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(10000);

    // Navigate to delete account
    await element(by.id('tab-profile')).tap();
    await element(by.id('settings-button')).tap();
    await element(by.id('delete-account-button')).tap();

    // Confirm deletion
    await waitFor(element(by.id('delete-account-modal')))
      .toBeVisible()
      .withTimeout(3000);

    await element(by.id('delete-confirm-input')).typeText('SUPPRIMER');
    await element(by.id('delete-confirm-button')).tap();

    // Should return to onboarding
    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(10000);
  });
});

async function navigateToAuth() {
  await completeOnboarding();
  await signOut();
  await waitFor(element(by.id('auth-screen')))
    .toBeVisible()
    .withTimeout(5000);
}

async function completeOnboarding() {
  try {
    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(3000);

    await element(by.id('welcome-start-button')).tap();
    await element(by.id('goals-continue-button')).tap();
    
    for (let i = 0; i < 5; i++) {
      await element(by.id(`personality-option-${i}-1`)).tap();
    }
    
    await element(by.id('preferences-continue-button')).tap();
    await element(by.id('profile-name-input')).typeText('Test User');
    await element(by.id('profile-continue-button')).tap();
    await element(by.id('complete-start-button')).tap();
  } catch (error) {
    // Onboarding already completed
  }
}

async function signOut() {
  try {
    await element(by.id('tab-profile')).tap();
    await element(by.id('settings-button')).tap();
    await element(by.id('logout-button')).tap();
    await element(by.text('Déconnexion')).tap();
  } catch (error) {
    // User not signed in
  }
}

async function clearAuth() {
  // Clear stored authentication
  await device.clearKeychain();
}