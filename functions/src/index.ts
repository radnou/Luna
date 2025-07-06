import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Import function modules
import * as authFunctions from './triggers/auth.triggers';
import * as aiIntegration from './services/ai.service';
import * as astrologyService from './services/astrology.service';
import * as pdfService from './services/pdf.service';
import * as notificationService from './services/notification.service';
import * as scheduledFunctions from './triggers/scheduled.triggers';

// Auth triggers
export const onUserCreated = authFunctions.onUserCreated;
export const onUserDeleted = authFunctions.onUserDeleted;

// AI Integration endpoints
export const analyzeJournalEntry = aiIntegration.analyzeJournalEntry;
export const generateCompatibilityReport = aiIntegration.generateCompatibilityReport;
export const decodeConversation = aiIntegration.decodeConversation;

// Astrology calculations
export const calculateBirthChart = astrologyService.calculateBirthChart;
export const calculateTransits = astrologyService.calculateTransits;
export const calculateSynastry = astrologyService.calculateSynastry;

// PDF generation
export const generateChartPDF = pdfService.generateChartPDF;
export const generateAnalysisReport = pdfService.generateAnalysisReport;

// Push notifications
export const sendDailyHoroscope = notificationService.sendDailyHoroscope;
export const sendMoonPhaseAlert = notificationService.sendMoonPhaseAlert;

// Scheduled functions
export const dailyHoroscopeJob = scheduledFunctions.dailyHoroscopeJob;
export const weeklyBackup = scheduledFunctions.weeklyBackup;
export const monthlyAnalytics = scheduledFunctions.monthlyAnalytics;