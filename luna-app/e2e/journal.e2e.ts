import { device, expect, element, by, waitFor } from 'detox';

describe('Journal Features', () => {
  beforeAll(async () => {
    await device.launchApp();
    // Assume user has completed onboarding
    await completeOnboarding();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  it('should create a new journal entry', async () => {
    // Navigate to journal tab
    await element(by.id('tab-journal')).tap();
    await waitFor(element(by.id('journal-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Create new entry
    await element(by.id('create-entry-button')).tap();
    await waitFor(element(by.id('create-entry-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Fill in entry details
    await element(by.id('entry-title-input')).typeText('Test Entry');
    await element(by.id('entry-content-input')).typeText('This is a test journal entry for E2E testing.');

    // Select mood
    await element(by.id('mood-selector')).tap();
    await element(by.id('mood-happy')).tap();

    // Add tag
    await element(by.id('tag-input')).typeText('test');
    await element(by.id('add-tag-button')).tap();

    // Save entry
    await element(by.id('save-entry-button')).tap();

    // Should navigate back to journal list
    await waitFor(element(by.id('journal-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Check if entry appears in list
    await expect(element(by.text('Test Entry'))).toBeVisible();
  });

  it('should save draft entries', async () => {
    await element(by.id('tab-journal')).tap();
    await element(by.id('create-entry-button')).tap();

    await waitFor(element(by.id('create-entry-screen')))
      .toBeVisible()
      .withTimeout(3000);

    await element(by.id('entry-content-input')).typeText('Draft entry content');

    // Save as draft
    await element(by.id('save-draft-button')).tap();

    // Navigate back
    await element(by.id('back-button')).tap();

    // Check draft saved
    await waitFor(element(by.id('journal-screen')))
      .toBeVisible()
      .withTimeout(3000);

    await expect(element(by.text('Draft'))).toBeVisible();
  });

  it('should search journal entries', async () => {
    await element(by.id('tab-journal')).tap();
    await waitFor(element(by.id('journal-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Open search
    await element(by.id('search-button')).tap();
    await waitFor(element(by.id('search-input')))
      .toBeVisible()
      .withTimeout(2000);

    // Search for entry
    await element(by.id('search-input')).typeText('Test Entry');

    // Should show filtered results
    await waitFor(element(by.text('Test Entry')))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should view entry details', async () => {
    await element(by.id('tab-journal')).tap();
    await waitFor(element(by.id('journal-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Tap on entry
    await element(by.text('Test Entry')).tap();

    // Should open entry details
    await waitFor(element(by.id('entry-details-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Check entry content
    await expect(element(by.text('This is a test journal entry for E2E testing.'))).toBeVisible();
    await expect(element(by.id('mood-display'))).toBeVisible();
    await expect(element(by.text('test'))).toBeVisible(); // tag
  });

  it('should edit existing entry', async () => {
    await element(by.id('tab-journal')).tap();
    await element(by.text('Test Entry')).tap();

    await waitFor(element(by.id('entry-details-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Edit entry
    await element(by.id('edit-entry-button')).tap();

    await waitFor(element(by.id('create-entry-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Modify content
    await element(by.id('entry-content-input')).clearText();
    await element(by.id('entry-content-input')).typeText('Updated test entry content');

    // Save changes
    await element(by.id('save-entry-button')).tap();

    // Check updated content
    await waitFor(element(by.id('entry-details-screen')))
      .toBeVisible()
      .withTimeout(3000);

    await expect(element(by.text('Updated test entry content'))).toBeVisible();
  });

  it('should delete entry', async () => {
    await element(by.id('tab-journal')).tap();
    await element(by.text('Test Entry')).tap();

    await waitFor(element(by.id('entry-details-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Delete entry
    await element(by.id('delete-entry-button')).tap();

    // Confirm deletion
    await waitFor(element(by.text('Supprimer')))
      .toBeVisible()
      .withTimeout(2000);
    await element(by.text('Supprimer')).tap();

    // Should navigate back to journal list
    await waitFor(element(by.id('journal-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Entry should be gone
    await expect(element(by.text('Test Entry'))).not.toBeVisible();
  });

  it('should add photos to entry', async () => {
    await element(by.id('tab-journal')).tap();
    await element(by.id('create-entry-button')).tap();

    await waitFor(element(by.id('create-entry-screen')))
      .toBeVisible()
      .withTimeout(3000);

    await element(by.id('entry-content-input')).typeText('Entry with photo');

    // Add photo
    await element(by.id('add-photo-button')).tap();
    await element(by.text('Galerie')).tap();

    // Mock photo selection
    await waitFor(element(by.id('photo-thumbnail')))
      .toBeVisible()
      .withTimeout(5000);

    await element(by.id('save-entry-button')).tap();

    // Check photo is saved
    await waitFor(element(by.id('journal-screen')))
      .toBeVisible()
      .withTimeout(3000);

    await element(by.text('Entry with photo')).tap();

    await waitFor(element(by.id('entry-details-screen')))
      .toBeVisible()
      .withTimeout(3000);

    await expect(element(by.id('entry-photo'))).toBeVisible();
  });

  it('should filter entries by mood', async () => {
    await element(by.id('tab-journal')).tap();
    await waitFor(element(by.id('journal-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Open filter
    await element(by.id('filter-button')).tap();
    await waitFor(element(by.id('filter-modal')))
      .toBeVisible()
      .withTimeout(2000);

    // Select mood filter
    await element(by.id('filter-mood-happy')).tap();
    await element(by.id('apply-filter-button')).tap();

    // Should show only happy entries
    await waitFor(element(by.id('journal-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Check filter applied
    await expect(element(by.id('active-filter-indicator'))).toBeVisible();
  });
});

async function completeOnboarding() {
  // Helper function to complete onboarding flow
  try {
    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(3000);

    await element(by.id('welcome-start-button')).tap();
    await element(by.id('goals-continue-button')).tap();
    
    // Quick personality answers
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