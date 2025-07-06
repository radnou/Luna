import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Daily horoscope job - runs every day at 7 AM
export const dailyHoroscopeJob = functions.pubsub
  .schedule('0 7 * * *')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    console.log('Running daily horoscope job');
    
    try {
      // Get all users with notifications enabled
      const usersSnapshot = await db.collection('users')
        .where('preferences.notifications', '==', true)
        .get();

      const batch = db.batch();
      const notifications: any[] = [];

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const sunSign = userData.astralData?.sunSign;
        
        if (!sunSign) continue;

        // Generate horoscope for each sign
        const horoscope = await generateDailyHoroscopeForSign(sunSign);
        
        // Create notification
        const notificationRef = db.collection('notifications').doc();
        batch.set(notificationRef, {
          userId: userDoc.id,
          type: 'daily_horoscope',
          title: `Daily ${sunSign} Horoscope`,
          body: horoscope.summary,
          data: horoscope,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Prepare push notification
        if (userData.fcmToken) {
          notifications.push({
            token: userData.fcmToken,
            notification: {
              title: `Daily ${sunSign} Horoscope`,
              body: horoscope.summary
            },
            data: {
              type: 'daily_horoscope',
              horoscopeId: notificationRef.id
            }
          });
        }
      }

      // Commit batch
      await batch.commit();

      // Send push notifications in batches
      if (notifications.length > 0) {
        const chunks = chunkArray(notifications, 500); // FCM limit
        for (const chunk of chunks) {
          await admin.messaging().sendAll(chunk);
        }
      }

      console.log(`Daily horoscopes sent to ${usersSnapshot.size} users`);
      return null;
    } catch (error) {
      console.error('Error in daily horoscope job:', error);
      throw error;
    }
  });

// Weekly backup job - runs every Sunday at 2 AM
export const weeklyBackup = functions.pubsub
  .schedule('0 2 * * 0')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    console.log('Running weekly backup job');
    
    try {
      const bucket = admin.storage().bucket();
      const timestamp = new Date().toISOString().split('T')[0];
      
      // Export Firestore data
      const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
      const databaseName = '(default)';
      
      // This requires Firebase Admin SDK with appropriate permissions
      const client = new admin.firestore.v1.FirestoreAdminClient();
      
      const exportRequest = {
        name: client.databasePath(projectId!, databaseName),
        outputUriPrefix: `gs://${bucket.name}/backups/${timestamp}`,
        collectionIds: [] // Empty means export all collections
      };

      const [operation] = await client.exportDocuments(exportRequest);
      
      console.log(`Backup started: ${operation.name}`);
      
      // Log backup record
      await db.collection('system_logs').add({
        type: 'backup',
        status: 'initiated',
        operationName: operation.name,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        backupPath: exportRequest.outputUriPrefix
      });

      return null;
    } catch (error) {
      console.error('Error in weekly backup job:', error);
      
      // Log error
      await db.collection('system_logs').add({
        type: 'backup',
        status: 'failed',
        error: error.message,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      
      throw error;
    }
  });

// Monthly analytics report - runs on the 1st of each month
export const monthlyAnalytics = functions.pubsub
  .schedule('0 0 1 * *')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    console.log('Running monthly analytics job');
    
    try {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Gather analytics data
      const analytics = {
        period: {
          start: lastMonth.toISOString(),
          end: lastMonthEnd.toISOString()
        },
        users: {
          total: 0,
          new: 0,
          active: 0
        },
        content: {
          journalEntries: 0,
          analyses: 0,
          conversations: 0
        },
        engagement: {
          avgSessionsPerUser: 0,
          avgJournalEntriesPerUser: 0,
          mostUsedFeatures: []
        },
        subscriptions: {
          free: 0,
          premium: 0,
          pro: 0,
          revenue: 0
        }
      };

      // Count total users
      const usersSnapshot = await db.collection('users').get();
      analytics.users.total = usersSnapshot.size;

      // Count new users (created last month)
      const newUsersSnapshot = await db.collection('users')
        .where('createdAt', '>=', lastMonth)
        .where('createdAt', '<=', lastMonthEnd)
        .get();
      analytics.users.new = newUsersSnapshot.size;

      // Count content created last month
      const journalSnapshot = await db.collection('journal_entries')
        .where('createdAt', '>=', lastMonth)
        .where('createdAt', '<=', lastMonthEnd)
        .get();
      analytics.content.journalEntries = journalSnapshot.size;

      const analysesSnapshot = await db.collection('analyses')
        .where('createdAt', '>=', lastMonth)
        .where('createdAt', '<=', lastMonthEnd)
        .get();
      analytics.content.analyses = analysesSnapshot.size;

      const conversationsSnapshot = await db.collection('conversations')
        .where('createdAt', '>=', lastMonth)
        .where('createdAt', '<=', lastMonthEnd)
        .get();
      analytics.content.conversations = conversationsSnapshot.size;

      // Count subscriptions
      const subscriptionCounts = { free: 0, premium: 0, pro: 0 };
      usersSnapshot.forEach(doc => {
        const plan = doc.data().subscription?.plan || 'free';
        subscriptionCounts[plan as keyof typeof subscriptionCounts]++;
      });
      analytics.subscriptions = { ...analytics.subscriptions, ...subscriptionCounts };

      // Save analytics report
      await db.collection('analytics_reports').add({
        type: 'monthly',
        period: analytics.period,
        data: analytics,
        generatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Send report to admins
      const adminsSnapshot = await db.collection('admins').get();
      for (const adminDoc of adminsSnapshot.docs) {
        await db.collection('notifications').add({
          userId: adminDoc.id,
          type: 'analytics_report',
          title: 'Monthly Analytics Report',
          body: `Analytics report for ${lastMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} is ready`,
          data: { reportPeriod: analytics.period },
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      console.log('Monthly analytics report generated');
      return null;
    } catch (error) {
      console.error('Error in monthly analytics job:', error);
      throw error;
    }
  });

// Helper functions
async function generateDailyHoroscopeForSign(sign: string): Promise<any> {
  // In production, this would call an astrology API
  return {
    sign,
    date: new Date().toISOString().split('T')[0],
    summary: `Today brings new opportunities for ${sign}...`,
    love: 'Romance is in the air...',
    career: 'Professional growth awaits...',
    health: 'Focus on self-care...',
    luckyNumber: Math.floor(Math.random() * 100),
    luckyColor: ['Red', 'Blue', 'Green', 'Yellow', 'Purple'][Math.floor(Math.random() * 5)],
    mood: ['Energetic', 'Calm', 'Adventurous', 'Reflective'][Math.floor(Math.random() * 4)]
  };
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}