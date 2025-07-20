import { device, expect, element, by, waitFor } from 'detox';

describe('AI Chat', () => {
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

  it('should start conversation with Luna AI', async () => {
    // Navigate to chat tab
    await element(by.id('tab-chat')).tap();
    await waitFor(element(by.id('chat-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Check welcome message
    await expect(element(by.text('Bonjour! Je suis Luna'))).toBeVisible();
    await expect(element(by.id('chat-input'))).toBeVisible();
  });

  it('should send and receive messages', async () => {
    await element(by.id('tab-chat')).tap();
    await waitFor(element(by.id('chat-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Type message
    await element(by.id('chat-input')).typeText('Bonjour Luna, comment ça va?');
    await element(by.id('send-button')).tap();

    // Check message appears
    await expect(element(by.text('Bonjour Luna, comment ça va?'))).toBeVisible();

    // Wait for AI response
    await waitFor(element(by.id('typing-indicator')))
      .toBeVisible()
      .withTimeout(2000);

    await waitFor(element(by.id('ai-response')))
      .toBeVisible()
      .withTimeout(10000);

    // Check AI responded
    await expect(element(by.id('ai-response'))).toBeVisible();
  });

  it('should handle emotional support conversations', async () => {
    await element(by.id('tab-chat')).tap();
    await waitFor(element(by.id('chat-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Send emotional message
    await element(by.id('chat-input')).typeText('Je me sens très triste aujourd\'hui');
    await element(by.id('send-button')).tap();

    // Wait for empathetic response
    await waitFor(element(by.id('ai-response')))
      .toBeVisible()
      .withTimeout(10000);

    // Check for supportive response
    await expect(element(by.id('ai-response'))).toBeVisible();
    
    // Check for quick reply suggestions
    await expect(element(by.id('quick-replies'))).toBeVisible();
  });

  it('should provide quick reply options', async () => {
    await element(by.id('tab-chat')).tap();
    await waitFor(element(by.id('chat-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Check initial quick replies
    await expect(element(by.id('quick-replies'))).toBeVisible();
    await expect(element(by.text('Comment te sens-tu?'))).toBeVisible();
    await expect(element(by.text('Aide-moi à réfléchir'))).toBeVisible();

    // Tap quick reply
    await element(by.text('Comment te sens-tu?')).tap();

    // Should send the message
    await expect(element(by.text('Comment te sens-tu?'))).toBeVisible();

    // Wait for response with new quick replies
    await waitFor(element(by.id('ai-response')))
      .toBeVisible()
      .withTimeout(10000);

    await expect(element(by.id('quick-replies'))).toBeVisible();
  });

  it('should handle meditation requests', async () => {
    await element(by.id('tab-chat')).tap();
    await waitFor(element(by.id('chat-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Request meditation
    await element(by.id('chat-input')).typeText('J\'ai besoin d\'une méditation');
    await element(by.id('send-button')).tap();

    // Wait for response
    await waitFor(element(by.id('ai-response')))
      .toBeVisible()
      .withTimeout(10000);

    // Check for meditation options
    await expect(element(by.id('meditation-options'))).toBeVisible();
    await expect(element(by.text('5 minutes'))).toBeVisible();
    await expect(element(by.text('10 minutes'))).toBeVisible();
    await expect(element(by.text('15 minutes'))).toBeVisible();
  });

  it('should start guided meditation', async () => {
    await element(by.id('tab-chat')).tap();
    await element(by.id('chat-input')).typeText('Méditation de 5 minutes');
    await element(by.id('send-button')).tap();

    await waitFor(element(by.id('ai-response')))
      .toBeVisible()
      .withTimeout(10000);

    // Start meditation
    await element(by.text('Commencer')).tap();

    // Check meditation interface
    await waitFor(element(by.id('meditation-screen')))
      .toBeVisible()
      .withTimeout(3000);

    await expect(element(by.id('meditation-timer'))).toBeVisible();
    await expect(element(by.id('meditation-instructions'))).toBeVisible();
  });

  it('should handle crisis situations appropriately', async () => {
    await element(by.id('tab-chat')).tap();
    await waitFor(element(by.id('chat-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Send crisis message
    await element(by.id('chat-input')).typeText('J\'ai des pensées suicidaires');
    await element(by.id('send-button')).tap();

    // Wait for crisis response
    await waitFor(element(by.id('ai-response')))
      .toBeVisible()
      .withTimeout(10000);

    // Check for crisis resources
    await expect(element(by.id('crisis-resources'))).toBeVisible();
    await expect(element(by.text('3114'))).toBeVisible(); // French crisis line
    await expect(element(by.text('Parler à un professionnel'))).toBeVisible();
  });

  it('should maintain conversation context', async () => {
    await element(by.id('tab-chat')).tap();
    await waitFor(element(by.id('chat-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // First message
    await element(by.id('chat-input')).typeText('Je m\'appelle Marie');
    await element(by.id('send-button')).tap();

    await waitFor(element(by.id('ai-response')))
      .toBeVisible()
      .withTimeout(10000);

    // Second message referencing first
    await element(by.id('chat-input')).typeText('Comment devrais-je gérer mon stress?');
    await element(by.id('send-button')).tap();

    await waitFor(element(by.id('ai-response')))
      .toBeVisible()
      .withTimeout(10000);

    // Third message to test context
    await element(by.id('chat-input')).typeText('Tu te souviens de mon prénom?');
    await element(by.id('send-button')).tap();

    await waitFor(element(by.id('ai-response')))
      .toBeVisible()
      .withTimeout(10000);

    // AI should remember the name
    await expect(element(by.text('Marie'))).toBeVisible();
  });

  it('should handle voice messages', async () => {
    await element(by.id('tab-chat')).tap();
    await waitFor(element(by.id('chat-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Check voice button
    await expect(element(by.id('voice-button'))).toBeVisible();

    // Mock voice recording
    await element(by.id('voice-button')).longPress();
    await waitFor(element(by.id('voice-recording')))
      .toBeVisible()
      .withTimeout(2000);

    // Release to send
    await element(by.id('voice-button')).tap();

    // Check voice message sent
    await expect(element(by.id('voice-message'))).toBeVisible();
  });

  it('should clear conversation history', async () => {
    await element(by.id('tab-chat')).tap();
    await waitFor(element(by.id('chat-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Send a message first
    await element(by.id('chat-input')).typeText('Test message');
    await element(by.id('send-button')).tap();

    // Open chat menu
    await element(by.id('chat-menu-button')).tap();
    await waitFor(element(by.id('chat-menu')))
      .toBeVisible()
      .withTimeout(2000);

    // Clear history
    await element(by.text('Effacer l\'historique')).tap();
    await element(by.text('Confirmer')).tap();

    // Check history cleared
    await expect(element(by.text('Test message'))).not.toBeVisible();
    await expect(element(by.text('Bonjour! Je suis Luna'))).toBeVisible();
  });

  it('should handle offline state gracefully', async () => {
    await element(by.id('tab-chat')).tap();
    await waitFor(element(by.id('chat-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Simulate offline state
    await device.setNetworkState({ enabled: false });

    // Try to send message
    await element(by.id('chat-input')).typeText('Message hors ligne');
    await element(by.id('send-button')).tap();

    // Should show offline message
    await expect(element(by.text('Connexion requise'))).toBeVisible();

    // Restore network
    await device.setNetworkState({ enabled: true });

    // Should be able to send again
    await element(by.id('send-button')).tap();
    await waitFor(element(by.id('ai-response')))
      .toBeVisible()
      .withTimeout(10000);
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