import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  try {
    // Create initial user profile
    const userProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      phoneNumber: user.phoneNumber || null,
      emailVerified: user.emailVerified,
      preferences: {
        notifications: true,
        theme: 'system',
        language: 'en',
        privacyMode: false
      },
      subscription: {
        plan: 'free',
        startDate: admin.firestore.FieldValue.serverTimestamp(),
        status: 'active'
      },
      stats: {
        journalEntries: 0,
        analyses: 0,
        conversations: 0
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(user.uid).set(userProfile);

    // Send welcome email (if email verified)
    if (user.email && user.emailVerified) {
      await sendWelcomeEmail(user.email, user.displayName || 'User');
    }

    // Create welcome notification
    await db.collection('notifications').add({
      userId: user.uid,
      type: 'welcome',
      title: 'Welcome to Luna!',
      body: 'Start your cosmic journey by setting up your birth chart.',
      data: {
        action: 'setup_profile'
      },
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`User profile created for ${user.uid}`);
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
});

export const onUserDeleted = functions.auth.user().onDelete(async (user) => {
  try {
    const batch = db.batch();
    
    // Delete user data (consider soft delete for compliance)
    const collections = [
      'users',
      'journal_entries',
      'analyses',
      'conversations',
      'relationships',
      'notifications'
    ];

    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName)
        .where('userId', '==', user.uid)
        .get();
      
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
    }

    // Delete user profile
    batch.delete(db.collection('users').doc(user.uid));

    await batch.commit();

    // Delete user files from Storage
    const bucket = admin.storage().bucket();
    await bucket.deleteFiles({
      prefix: `users/${user.uid}/`
    });

    console.log(`User data deleted for ${user.uid}`);
  } catch (error) {
    console.error('Error deleting user data:', error);
  }
});

// Helper function to send welcome email
async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  // Implement email sending logic here
  // You can use SendGrid, Mailgun, or Firebase Extensions
  console.log(`Welcome email would be sent to ${email}`);
}