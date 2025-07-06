import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();
const messaging = admin.messaging();

export const sendDailyHoroscope = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    // Get user data
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    const userData = userDoc.data();

    if (!userData?.preferences?.notifications) {
      return { success: false, message: 'Notifications disabled' };
    }

    const sunSign = userData.astralData?.sunSign || 'Unknown';
    
    // Generate horoscope message (in production, fetch from horoscope API)
    const horoscope = generateDailyHoroscope(sunSign);

    // Create notification in database
    await db.collection('notifications').add({
      userId: context.auth.uid,
      type: 'daily_horoscope',
      title: `Daily Horoscope for ${sunSign}`,
      body: horoscope.summary,
      data: {
        fullHoroscope: horoscope.full,
        luckyNumbers: horoscope.luckyNumbers,
        mood: horoscope.mood
      },
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Send push notification if FCM token exists
    if (userData.fcmToken) {
      await messaging.send({
        token: userData.fcmToken,
        notification: {
          title: `Daily Horoscope for ${sunSign}`,
          body: horoscope.summary
        },
        data: {
          type: 'daily_horoscope',
          sunSign: sunSign
        },
        android: {
          priority: 'normal',
          notification: {
            channelId: 'horoscope'
          }
        },
        apns: {
          payload: {
            aps: {
              badge: 1,
              sound: 'default'
            }
          }
        }
      });
    }

    return { success: true, horoscope };
  } catch (error) {
    console.error('Error sending daily horoscope:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send horoscope');
  }
});

export const sendMoonPhaseAlert = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { moonPhase, significance } = data;

  try {
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    const userData = userDoc.data();

    if (!userData?.preferences?.notifications) {
      return { success: false, message: 'Notifications disabled' };
    }

    // Create notification
    await db.collection('notifications').add({
      userId: context.auth.uid,
      type: 'moon_phase',
      title: `${moonPhase} Moon Alert`,
      body: `Tonight's ${moonPhase} moon brings ${significance}`,
      data: {
        moonPhase,
        date: new Date().toISOString(),
        rituals: getMoonRituals(moonPhase)
      },
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Send push notification
    if (userData.fcmToken) {
      await messaging.send({
        token: userData.fcmToken,
        notification: {
          title: `${moonPhase} Moon Alert`,
          body: `Tonight's ${moonPhase} moon brings ${significance}`
        },
        data: {
          type: 'moon_phase',
          phase: moonPhase
        }
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending moon phase alert:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send alert');
  }
});

// Batch notification functions
export const sendBatchNotifications = functions.https.onCall(async (data, context) => {
  // Admin only function
  if (!context.auth || !await isAdmin(context.auth.uid)) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  const { title, body, targetAudience = 'all', data: notificationData } = data;

  try {
    let tokens: string[] = [];
    
    // Get target audience tokens
    if (targetAudience === 'all') {
      const usersSnapshot = await db.collection('users')
        .where('preferences.notifications', '==', true)
        .where('fcmToken', '!=', null)
        .get();
      
      tokens = usersSnapshot.docs
        .map(doc => doc.data().fcmToken)
        .filter(token => token);
    } else if (targetAudience === 'premium') {
      const usersSnapshot = await db.collection('users')
        .where('subscription.plan', 'in', ['premium', 'pro'])
        .where('preferences.notifications', '==', true)
        .where('fcmToken', '!=', null)
        .get();
      
      tokens = usersSnapshot.docs
        .map(doc => doc.data().fcmToken)
        .filter(token => token);
    }

    if (tokens.length === 0) {
      return { success: false, message: 'No eligible recipients found' };
    }

    // Send multicast message
    const message = {
      notification: { title, body },
      data: notificationData || {},
      tokens
    };

    const response = await messaging.sendMulticast(message);
    
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount
    };
  } catch (error) {
    console.error('Error sending batch notifications:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send notifications');
  }
});

// Helper functions
function generateDailyHoroscope(sunSign: string): any {
  // Mock horoscope generation
  const horoscopes: Record<string, any> = {
    'Aries': {
      summary: 'Energy and enthusiasm drive you forward today.',
      full: 'The planetary alignments favor bold initiatives...',
      mood: 'energetic',
      luckyNumbers: [3, 7, 21]
    },
    'Taurus': {
      summary: 'Focus on financial matters and practical goals.',
      full: 'Venus in your second house suggests...',
      mood: 'grounded',
      luckyNumbers: [2, 6, 14]
    },
    // Add all zodiac signs...
  };

  return horoscopes[sunSign] || {
    summary: 'Cosmic energies are aligning in your favor.',
    full: 'Today brings opportunities for growth and self-discovery.',
    mood: 'balanced',
    luckyNumbers: [1, 5, 9]
  };
}

function getMoonRituals(moonPhase: string): string[] {
  const rituals: Record<string, string[]> = {
    'New': [
      'Set intentions for the lunar cycle',
      'Start new projects',
      'Plant seeds (literal or metaphorical)'
    ],
    'Full': [
      'Release what no longer serves you',
      'Practice gratitude',
      'Charge crystals under moonlight'
    ],
    'Waxing': [
      'Take action on goals',
      'Build momentum',
      'Attract abundance'
    ],
    'Waning': [
      'Let go of negativity',
      'Rest and reflect',
      'Clear clutter'
    ]
  };

  return rituals[moonPhase] || ['Connect with lunar energy'];
}

async function isAdmin(userId: string): Promise<boolean> {
  const adminDoc = await db.collection('admins').doc(userId).get();
  return adminDoc.exists;
}