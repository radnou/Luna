const { device, expect, element, by, waitFor } = require('detox');
const { reloadApp } = require('detox/runners/jest/utils');

// Global test utilities
global.device = device;
global.expect = expect;
global.element = element;
global.by = by;
global.waitFor = waitFor;

// Custom test utilities for Luna app
global.LunaTestUtils = {
  // Wait for element to be visible with timeout
  waitForElementVisible: async (testID, timeout = 10000) => {
    await waitFor(element(by.id(testID)))
      .toBeVisible()
      .withTimeout(timeout);
  },

  // Wait for element to be tappable
  waitForElementTappable: async (testID, timeout = 10000) => {
    await waitFor(element(by.id(testID)))
      .toBeVisible()
      .withTimeout(timeout);
    await element(by.id(testID)).tap();
  },

  // Type text with delay to simulate real user input
  typeTextSlowly: async (testID, text, delay = 100) => {
    const input = element(by.id(testID));
    await input.tap();
    await input.clearText();
    
    for (let i = 0; i < text.length; i++) {
      await input.typeText(text[i]);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  },

  // Reset app to initial state
  resetApp: async () => {
    await device.reloadReactNative();
  },

  // Navigate to specific screen
  navigateToScreen: async (screenName) => {
    // Implementation depends on your navigation structure
    const screenMap = {
      home: 'home-tab',
      journal: 'journal-tab',
      chat: 'chat-tab',
      insights: 'insights-tab',
      profile: 'profile-tab'
    };
    
    const tabId = screenMap[screenName];
    if (tabId) {
      await element(by.id(tabId)).tap();
    }
  },

  // Create mock journal entry
  createMockJournalEntry: async (title, content, mood = 'happy') => {
    await element(by.id('create-entry-button')).tap();
    await element(by.id('entry-title-input')).typeText(title);
    await element(by.id('entry-content-input')).typeText(content);
    await element(by.id(`mood-${mood}`)).tap();
    await element(by.id('save-entry-button')).tap();
  },

  // Login with test credentials
  loginWithTestUser: async (email = 'test@luna.app', password = 'testpass123') => {
    await element(by.id('email-input')).typeText(email);
    await element(by.id('password-input')).typeText(password);
    await element(by.id('login-button')).tap();
  },

  // Complete onboarding flow
  completeOnboarding: async (userData = {}) => {
    const defaultData = {
      name: 'Test User',
      birthdate: '1995-01-01',
      location: 'New York',
      goals: ['self-discovery', 'mental-health'],
      personality: 'introvert',
      ...userData
    };

    // Welcome screen
    await element(by.id('get-started-button')).tap();
    
    // Profile setup
    await element(by.id('name-input')).typeText(defaultData.name);
    await element(by.id('birthdate-input')).typeText(defaultData.birthdate);
    await element(by.id('location-input')).typeText(defaultData.location);
    await element(by.id('next-button')).tap();
    
    // Goals selection
    for (const goal of defaultData.goals) {
      await element(by.id(`goal-${goal}`)).tap();
    }
    await element(by.id('next-button')).tap();
    
    // Personality questionnaire
    await element(by.id(`personality-${defaultData.personality}`)).tap();
    await element(by.id('next-button')).tap();
    
    // Preferences
    await element(by.id('privacy-settings-toggle')).tap();
    await element(by.id('next-button')).tap();
    
    // Complete
    await element(by.id('complete-onboarding-button')).tap();
  },

  // Take screenshot with timestamp
  takeScreenshot: async (name) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await device.takeScreenshot(`${name}-${timestamp}`);
  },

  // Verify Firebase connection
  verifyFirebaseConnection: async () => {
    // This would require implementing a test endpoint
    // For now, we'll just check if the app loads successfully
    await waitFor(element(by.id('app-container')))
      .toBeVisible()
      .withTimeout(30000);
  },

  // Test offline functionality
  testOfflineMode: async () => {
    await device.setNetworkConditions({
      type: 'none'
    });
    
    // Verify app still functions
    await waitFor(element(by.id('app-container')))
      .toBeVisible()
      .withTimeout(10000);
    
    // Restore network
    await device.setNetworkConditions({
      type: 'wifi'
    });
  },

  // Performance measurement
  measurePerformance: async (actionName, actionFn) => {
    const startTime = Date.now();
    await actionFn();
    const endTime = Date.now();
    
    console.log(`Performance: ${actionName} took ${endTime - startTime}ms`);
    return endTime - startTime;
  },

  // Cleanup test data
  cleanupTestData: async () => {
    // This would require implementing cleanup functions
    // For now, we'll just reset the app
    await device.reloadReactNative();
  }
};

// Global setup and teardown
beforeAll(async () => {
  console.log('🧪 Starting Luna E2E tests...');
  await LunaTestUtils.resetApp();
});

afterAll(async () => {
  console.log('✅ Luna E2E tests completed');
  await LunaTestUtils.cleanupTestData();
});