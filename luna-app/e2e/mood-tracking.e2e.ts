import { device, expect, element, by, waitFor } from 'detox';

describe('Mood Tracking', () => {
  beforeAll(async () => {
    await device.launchApp();
    await completeOnboarding();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  it('should log mood from home screen', async () => {
    // Should be on home screen
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Check mood check-in widget
    await expect(element(by.text('Comment te sens-tu?'))).toBeVisible();

    // Select mood
    await element(by.id('quick-mood-happy')).tap();

    // Should show confirmation
    await waitFor(element(by.text('Humeur sauvegardée')))
      .toBeVisible()
      .withTimeout(2000);

    // Check mood is reflected
    await expect(element(by.id('current-mood-display'))).toBeVisible();
  });

  it('should track mood history in insights', async () => {
    // Navigate to insights
    await element(by.id('tab-insights')).tap();
    await waitFor(element(by.id('insights-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Check mood section
    await expect(element(by.id('mood-analytics'))).toBeVisible();
    await expect(element(by.id('mood-chart'))).toBeVisible();

    // Check mood average
    await expect(element(by.id('mood-average'))).toBeVisible();
  });

  it('should show mood trends over time', async () => {
    await element(by.id('tab-insights')).tap();
    await waitFor(element(by.id('insights-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Check different time periods
    await element(by.id('mood-period-7days')).tap();
    await expect(element(by.id('mood-chart'))).toBeVisible();

    await element(by.id('mood-period-30days')).tap();
    await expect(element(by.id('mood-chart'))).toBeVisible();

    await element(by.id('mood-period-90days')).tap();
    await expect(element(by.id('mood-chart'))).toBeVisible();
  });

  it('should log detailed mood with journal entry', async () => {
    await element(by.id('tab-journal')).tap();
    await element(by.id('create-entry-button')).tap();

    await waitFor(element(by.id('create-entry-screen')))
      .toBeVisible()
      .withTimeout(3000);

    await element(by.id('entry-content-input')).typeText('Feeling great today!');

    // Select detailed mood
    await element(by.id('mood-selector')).tap();
    await waitFor(element(by.id('mood-options')))
      .toBeVisible()
      .withTimeout(2000);

    await element(by.id('mood-joyful')).tap();

    // Add mood note
    await element(by.id('mood-note-input')).typeText('Had a wonderful day with friends');

    await element(by.id('save-entry-button')).tap();

    // Check mood is saved
    await waitFor(element(by.id('journal-screen')))
      .toBeVisible()
      .withTimeout(3000);

    await element(by.text('Feeling great today!')).tap();

    await waitFor(element(by.id('entry-details-screen')))
      .toBeVisible()
      .withTimeout(3000);

    await expect(element(by.id('mood-display-joyful'))).toBeVisible();
    await expect(element(by.text('Had a wonderful day with friends'))).toBeVisible();
  });

  it('should provide mood insights and patterns', async () => {
    await element(by.id('tab-insights')).tap();
    await waitFor(element(by.id('insights-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Check patterns section
    await expect(element(by.id('mood-patterns'))).toBeVisible();
    await expect(element(by.id('mood-suggestions'))).toBeVisible();

    // Check for pattern insights
    await expect(element(by.id('weekly-pattern'))).toBeVisible();
    await expect(element(by.id('daily-pattern'))).toBeVisible();
  });

  it('should show mood correlation with activities', async () => {
    await element(by.id('tab-insights')).tap();
    await waitFor(element(by.id('insights-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Scroll to correlations section
    await element(by.id('insights-scroll-view')).scrollTo('bottom');

    // Check activity correlations
    await expect(element(by.id('mood-correlations'))).toBeVisible();
    await expect(element(by.id('positive-activities'))).toBeVisible();
    await expect(element(by.id('negative-activities'))).toBeVisible();
  });

  it('should handle mood reminders', async () => {
    // Navigate to settings
    await element(by.id('tab-profile')).tap();
    await element(by.id('settings-button')).tap();

    await waitFor(element(by.id('settings-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Enable mood reminders
    await element(by.id('mood-reminders-toggle')).tap();
    await element(by.id('reminder-time-picker')).tap();

    // Set reminder time
    await element(by.id('time-picker-confirm')).tap();

    // Check reminder is set
    await expect(element(by.id('mood-reminder-active'))).toBeVisible();
  });

  it('should export mood data', async () => {
    await element(by.id('tab-insights')).tap();
    await waitFor(element(by.id('insights-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Open export options
    await element(by.id('export-data-button')).tap();
    await waitFor(element(by.id('export-modal')))
      .toBeVisible()
      .withTimeout(2000);

    // Select mood data export
    await element(by.id('export-mood-data')).tap();
    await element(by.id('export-confirm-button')).tap();

    // Check export initiated
    await waitFor(element(by.text('Export en cours...')))
      .toBeVisible()
      .withTimeout(2000);
  });

  it('should validate mood entries', async () => {
    await element(by.id('tab-journal')).tap();
    await element(by.id('create-entry-button')).tap();

    await waitFor(element(by.id('create-entry-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Try to save without mood
    await element(by.id('entry-content-input')).typeText('Entry without mood');
    await element(by.id('save-entry-button')).tap();

    // Should save successfully (mood is optional)
    await waitFor(element(by.id('journal-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Create another entry with mood
    await element(by.id('create-entry-button')).tap();
    await element(by.id('entry-content-input')).typeText('Entry with mood');
    await element(by.id('mood-selector')).tap();
    await element(by.id('mood-calm')).tap();
    await element(by.id('save-entry-button')).tap();

    // Both entries should be saved
    await expect(element(by.text('Entry without mood'))).toBeVisible();
    await expect(element(by.text('Entry with mood'))).toBeVisible();
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