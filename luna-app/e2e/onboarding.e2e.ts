import { device, expect, element, by, waitFor } from 'detox';

describe('Onboarding Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  it('should complete the full onboarding flow', async () => {
    // Wait for app to load
    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Welcome Screen
    await expect(element(by.text('Bienvenue sur Luna'))).toBeVisible();
    await element(by.id('welcome-start-button')).tap();

    // Goals Screen
    await waitFor(element(by.id('goals-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Select some goals
    await element(by.id('goal-personal-growth')).tap();
    await element(by.id('goal-healthy-relationships')).tap();
    await element(by.id('goals-continue-button')).tap();

    // Personality Quiz
    await waitFor(element(by.id('personality-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Answer personality questions
    for (let i = 0; i < 5; i++) {
      await waitFor(element(by.id(`personality-option-${i}-1`)))
        .toBeVisible()
        .withTimeout(2000);
      await element(by.id(`personality-option-${i}-1`)).tap();
    }

    // Preferences Screen
    await waitFor(element(by.id('preferences-screen')))
      .toBeVisible()
      .withTimeout(3000);

    await element(by.id('preferences-continue-button')).tap();

    // Profile Screen
    await waitFor(element(by.id('profile-screen')))
      .toBeVisible()
      .withTimeout(3000);

    await element(by.id('profile-name-input')).typeText('Test User');
    await element(by.id('profile-continue-button')).tap();

    // Complete Screen
    await waitFor(element(by.id('complete-screen')))
      .toBeVisible()
      .withTimeout(3000);

    await expect(element(by.text('Félicitations!'))).toBeVisible();
    await element(by.id('complete-start-button')).tap();

    // Should navigate to main app
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should show progress indicators correctly', async () => {
    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Check progress stars
    await expect(element(by.id('progress-indicator'))).toBeVisible();
    await expect(element(by.id('progress-star-0'))).toBeVisible();
    
    await element(by.id('welcome-start-button')).tap();

    // Goals screen - progress should update
    await waitFor(element(by.id('goals-screen')))
      .toBeVisible()
      .withTimeout(3000);

    await expect(element(by.id('progress-star-1'))).toBeVisible();
  });

  it('should allow skipping optional steps', async () => {
    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(5000);

    await element(by.id('welcome-start-button')).tap();

    // Skip goals
    await waitFor(element(by.id('goals-screen')))
      .toBeVisible()
      .withTimeout(3000);

    await element(by.id('goals-skip-button')).tap();

    // Should go to personality
    await waitFor(element(by.id('personality-screen')))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should save progress and resume from where user left off', async () => {
    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(5000);

    await element(by.id('welcome-start-button')).tap();

    // Complete goals
    await waitFor(element(by.id('goals-screen')))
      .toBeVisible()
      .withTimeout(3000);

    await element(by.id('goal-personal-growth')).tap();
    await element(by.id('goals-continue-button')).tap();

    // Close app
    await device.sendToHome();
    await device.terminateApp();

    // Relaunch app
    await device.launchApp();

    // Should resume from personality screen
    await waitFor(element(by.id('personality-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should handle animations gracefully', async () => {
    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Check for animated background
    await expect(element(by.id('animated-background'))).toBeVisible();

    await element(by.id('welcome-start-button')).tap();

    // Wait for transition animation
    await waitFor(element(by.id('goals-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Check transition completed
    await expect(element(by.id('goals-screen'))).toBeVisible();
  });
});