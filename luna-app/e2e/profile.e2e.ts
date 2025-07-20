import { device, expect, element, by, waitFor } from 'detox';

describe('Profile Management', () => {
  beforeAll(async () => {
    await device.launchApp();
    await completeOnboarding();
    await login();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  it('should display user profile', async () => {
    await element(by.id('tab-profile')).tap();
    await waitFor(element(by.id('profile-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Check profile elements
    await expect(element(by.id('profile-photo'))).toBeVisible();
    await expect(element(by.id('profile-name'))).toBeVisible();
    await expect(element(by.id('profile-stats'))).toBeVisible();
    await expect(element(by.id('profile-menu'))).toBeVisible();
  });

  it('should edit profile information', async () => {
    await element(by.id('tab-profile')).tap();
    await waitFor(element(by.id('profile-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Navigate to edit profile
    await element(by.id('edit-profile-button')).tap();
    await waitFor(element(by.id('edit-profile-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Edit name
    await element(by.id('edit-name-input')).clearText();
    await element(by.id('edit-name-input')).typeText('Marie Dupont');

    // Edit bio
    await element(by.id('edit-bio-input')).typeText('Passionnée de bien-être et de développement personnel');

    // Add interests
    await element(by.id('interest-input')).typeText('Yoga');
    await element(by.id('add-interest-button')).tap();

    await element(by.id('interest-input')).typeText('Lecture');
    await element(by.id('add-interest-button')).tap();

    // Save changes
    await element(by.id('save-profile-button')).tap();

    // Should navigate back to profile
    await waitFor(element(by.id('profile-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Check updated information
    await expect(element(by.text('Marie Dupont'))).toBeVisible();
    await expect(element(by.text('Passionnée de bien-être et de développement personnel'))).toBeVisible();
    await expect(element(by.text('Yoga'))).toBeVisible();
    await expect(element(by.text('Lecture'))).toBeVisible();
  });

  it('should update profile photo', async () => {
    await element(by.id('tab-profile')).tap();
    await element(by.id('edit-profile-button')).tap();

    await waitFor(element(by.id('edit-profile-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Change profile photo
    await element(by.id('profile-photo-button')).tap();
    await waitFor(element(by.id('photo-picker-modal')))
      .toBeVisible()
      .withTimeout(2000);

    await element(by.text('Galerie')).tap();

    // Mock photo selection
    await waitFor(element(by.id('photo-preview')))
      .toBeVisible()
      .withTimeout(5000);

    await element(by.id('confirm-photo-button')).tap();

    // Should update profile photo
    await expect(element(by.id('updated-profile-photo'))).toBeVisible();

    await element(by.id('save-profile-button')).tap();

    // Check photo persisted
    await waitFor(element(by.id('profile-screen')))
      .toBeVisible()
      .withTimeout(3000);

    await expect(element(by.id('updated-profile-photo'))).toBeVisible();
  });

  it('should manage interests', async () => {
    await element(by.id('tab-profile')).tap();
    await element(by.id('edit-profile-button')).tap();

    await waitFor(element(by.id('edit-profile-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Add new interest
    await element(by.id('interest-input')).typeText('Méditation');
    await element(by.id('add-interest-button')).tap();

    await expect(element(by.text('Méditation'))).toBeVisible();

    // Remove existing interest
    await element(by.id('interest-yoga-remove')).tap();
    await expect(element(by.text('Yoga'))).not.toBeVisible();

    // Save changes
    await element(by.id('save-profile-button')).tap();

    // Verify changes persisted
    await element(by.id('edit-profile-button')).tap();
    await waitFor(element(by.id('edit-profile-screen')))
      .toBeVisible()
      .withTimeout(3000);

    await expect(element(by.text('Méditation'))).toBeVisible();
    await expect(element(by.text('Yoga'))).not.toBeVisible();
  });

  it('should display profile statistics', async () => {
    await element(by.id('tab-profile')).tap();
    await waitFor(element(by.id('profile-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Check stats section
    await expect(element(by.id('profile-stats'))).toBeVisible();
    await expect(element(by.id('stats-days-active'))).toBeVisible();
    await expect(element(by.id('stats-entries-count'))).toBeVisible();
    await expect(element(by.id('stats-mood-average'))).toBeVisible();
    await expect(element(by.id('stats-streak'))).toBeVisible();
  });

  it('should access settings from profile', async () => {
    await element(by.id('tab-profile')).tap();
    await waitFor(element(by.id('profile-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Navigate to settings
    await element(by.id('settings-button')).tap();
    await waitFor(element(by.id('settings-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Check settings sections
    await expect(element(by.text('Notifications'))).toBeVisible();
    await expect(element(by.text('Confidentialité'))).toBeVisible();
    await expect(element(by.text('Apparence'))).toBeVisible();
    await expect(element(by.text('Compte'))).toBeVisible();
  });

  it('should manage notification settings', async () => {
    await element(by.id('tab-profile')).tap();
    await element(by.id('settings-button')).tap();

    await waitFor(element(by.id('settings-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Toggle notifications
    await element(by.id('notifications-toggle')).tap();
    await expect(element(by.id('notifications-enabled'))).toBeVisible();

    // Set reminder time
    await element(by.id('reminder-time-setting')).tap();
    await element(by.id('time-picker-20h')).tap();
    await element(by.id('time-picker-confirm')).tap();

    // Check setting saved
    await expect(element(by.text('20:00'))).toBeVisible();
  });

  it('should manage privacy settings', async () => {
    await element(by.id('tab-profile')).tap();
    await element(by.id('settings-button')).tap();
    await element(by.id('privacy-settings-button')).tap();

    await waitFor(element(by.id('privacy-settings-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Toggle biometric lock
    await element(by.id('biometric-lock-toggle')).tap();
    await expect(element(by.text('Biométrie activée'))).toBeVisible();

    // Toggle analytics
    await element(by.id('analytics-toggle')).tap();
    await expect(element(by.id('analytics-disabled'))).toBeVisible();

    // Data export
    await element(by.id('export-data-button')).tap();
    await waitFor(element(by.id('export-modal')))
      .toBeVisible()
      .withTimeout(2000);

    await element(by.id('export-confirm-button')).tap();
    await expect(element(by.text('Export initié'))).toBeVisible();
  });

  it('should change app theme', async () => {
    await element(by.id('tab-profile')).tap();
    await element(by.id('settings-button')).tap();

    await waitFor(element(by.id('settings-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Change theme
    await element(by.id('theme-setting')).tap();
    await waitFor(element(by.id('theme-picker')))
      .toBeVisible()
      .withTimeout(2000);

    await element(by.id('theme-dark')).tap();

    // Check theme applied
    await expect(element(by.id('dark-theme-active'))).toBeVisible();
  });

  it('should view and manage photos', async () => {
    await element(by.id('tab-profile')).tap();
    await element(by.id('photos-button')).tap();

    await waitFor(element(by.id('photos-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Check photos grid
    await expect(element(by.id('photos-grid'))).toBeVisible();

    // Add new photo
    await element(by.id('add-photo-button')).tap();
    await element(by.text('Galerie')).tap();

    // Mock photo selection
    await waitFor(element(by.id('photo-preview')))
      .toBeVisible()
      .withTimeout(5000);

    await element(by.id('confirm-photo-button')).tap();

    // Should appear in grid
    await expect(element(by.id('new-photo-thumbnail'))).toBeVisible();

    // Select and delete photo
    await element(by.id('photo-select-mode')).tap();
    await element(by.id('photo-thumbnail-0')).tap();
    await element(by.id('delete-selected-button')).tap();
    await element(by.text('Supprimer')).tap();

    // Photo should be removed
    await expect(element(by.id('photo-thumbnail-0'))).not.toBeVisible();
  });

  it('should manage relationships', async () => {
    await element(by.id('tab-profile')).tap();
    await element(by.id('relationships-button')).tap();

    await waitFor(element(by.id('relationships-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Add new relationship
    await element(by.id('add-relationship-button')).tap();
    await waitFor(element(by.id('add-relationship-modal')))
      .toBeVisible()
      .withTimeout(2000);

    await element(by.id('relationship-name-input')).typeText('Sophie');
    await element(by.id('relationship-type-friendship')).tap();
    await element(by.id('relationship-status-active')).tap();
    await element(by.id('relationship-notes-input')).typeText('Ma meilleure amie depuis le lycée');

    await element(by.id('save-relationship-button')).tap();

    // Should appear in relationships list
    await expect(element(by.text('Sophie'))).toBeVisible();
    await expect(element(by.text('Amitié'))).toBeVisible();

    // Edit relationship
    await element(by.text('Sophie')).tap();
    await element(by.id('edit-relationship-button')).tap();
    
    await element(by.id('relationship-notes-input')).clearText();
    await element(by.id('relationship-notes-input')).typeText('Ma meilleure amie depuis toujours');
    await element(by.id('save-relationship-button')).tap();

    // Check updated
    await expect(element(by.text('Ma meilleure amie depuis toujours'))).toBeVisible();
  });

  it('should handle account deletion confirmation', async () => {
    await element(by.id('tab-profile')).tap();
    await element(by.id('settings-button')).tap();

    await waitFor(element(by.id('settings-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Navigate to account deletion
    await element(by.id('delete-account-button')).tap();
    await waitFor(element(by.id('delete-account-modal')))
      .toBeVisible()
      .withTimeout(2000);

    // Check deletion requirements
    await expect(element(by.text('Cette action est irréversible'))).toBeVisible();
    await expect(element(by.id('delete-confirm-input'))).toBeVisible();

    // Cancel deletion
    await element(by.id('cancel-delete-button')).tap();

    // Should return to settings
    await expect(element(by.id('settings-screen'))).toBeVisible();
  });

  it('should validate profile form inputs', async () => {
    await element(by.id('tab-profile')).tap();
    await element(by.id('edit-profile-button')).tap();

    await waitFor(element(by.id('edit-profile-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Clear required field
    await element(by.id('edit-name-input')).clearText();
    await element(by.id('save-profile-button')).tap();

    // Should show validation error
    await expect(element(by.text('Le nom est requis'))).toBeVisible();

    // Try invalid birth date
    await element(by.id('edit-birth-date-input')).tap();
    await element(by.id('date-picker-future')).tap();
    await element(by.id('date-picker-confirm')).tap();

    // Should show date validation error
    await expect(element(by.text('Date de naissance invalide'))).toBeVisible();
  });
});

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

async function login() {
  try {
    await waitFor(element(by.id('auth-screen')))
      .toBeVisible()
      .withTimeout(3000);

    await element(by.id('login-email-input')).typeText('test@luna-app.com');
    await element(by.id('login-password-input')).typeText('TestPassword123!');
    await element(by.id('login-button')).tap();

    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(10000);
  } catch (error) {
    // Already logged in
  }
}