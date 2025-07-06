import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as PDFDocument from 'pdfkit';

const db = admin.firestore();
const bucket = admin.storage().bucket();

export const generateChartPDF = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { analysisId } = data;

  try {
    // Get analysis data
    const analysisDoc = await db.collection('analyses').doc(analysisId).get();
    if (!analysisDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Analysis not found');
    }

    const analysis = analysisDoc.data();
    if (analysis?.userId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Unauthorized access');
    }

    // Create PDF
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      },
      info: {
        Title: 'Birth Chart Analysis - Luna',
        Author: 'Luna Astrology App',
        Subject: 'Astrological Birth Chart',
        Keywords: 'astrology, birth chart, natal chart'
      }
    });

    // Create a buffer to store PDF
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    // Add content
    addHeaderToDoc(doc, 'Birth Chart Analysis');
    addChartVisualization(doc, analysis.data.chartData);
    addPlanetaryPositions(doc, analysis.data.chartData.planets);
    addAspects(doc, analysis.data.chartData.aspects);
    addInterpretation(doc, analysis.data.interpretation);
    addFooter(doc);

    // Finalize PDF
    doc.end();

    // Wait for PDF generation to complete
    await new Promise((resolve) => doc.on('end', resolve));

    // Combine chunks into single buffer
    const pdfBuffer = Buffer.concat(chunks);

    // Upload to Storage
    const fileName = `analyses/${analysisId}/birth-chart-${Date.now()}.pdf`;
    const file = bucket.file(fileName);
    
    await file.save(pdfBuffer, {
      metadata: {
        contentType: 'application/pdf',
        metadata: {
          userId: context.auth.uid,
          analysisId: analysisId,
          generatedAt: new Date().toISOString()
        }
      }
    });

    // Make file publicly accessible
    await file.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    // Update analysis with PDF URL
    await db.collection('analyses').doc(analysisId).update({
      pdfUrl: publicUrl,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      pdfUrl: publicUrl
    };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate PDF');
  }
});

export const generateAnalysisReport = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { analysisId, includeTransits = false } = data;

  try {
    // Similar to generateChartPDF but with more comprehensive report
    const analysisDoc = await db.collection('analyses').doc(analysisId).get();
    if (!analysisDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Analysis not found');
    }

    const analysis = analysisDoc.data();
    if (analysis?.userId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Unauthorized access');
    }

    // Create comprehensive PDF report
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    // Add comprehensive content
    addCoverPage(doc, analysis);
    addTableOfContents(doc);
    addExecutiveSummary(doc, analysis);
    addDetailedAnalysis(doc, analysis);
    
    if (includeTransits) {
      addCurrentTransits(doc, analysis);
    }
    
    addRecommendations(doc, analysis);
    addGlossary(doc);

    doc.end();

    await new Promise((resolve) => doc.on('end', resolve));

    const pdfBuffer = Buffer.concat(chunks);

    // Upload and get URL
    const fileName = `analyses/${analysisId}/comprehensive-report-${Date.now()}.pdf`;
    const file = bucket.file(fileName);
    
    await file.save(pdfBuffer, {
      metadata: {
        contentType: 'application/pdf'
      }
    });

    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    return {
      success: true,
      pdfUrl: publicUrl
    };
  } catch (error) {
    console.error('Error generating analysis report:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate report');
  }
});

// Helper functions for PDF generation
function addHeaderToDoc(doc: any, title: string): void {
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .text(title, { align: 'center' })
     .moveDown(2);
}

function addChartVisualization(doc: any, chartData: any): void {
  // Add chart wheel visualization
  // This would typically use a library to generate the astrological wheel
  doc.fontSize(12)
     .font('Helvetica')
     .text('Birth Chart Wheel', { align: 'center' })
     .rect(100, doc.y, 400, 400)
     .stroke()
     .moveDown(20);
}

function addPlanetaryPositions(doc: any, planets: any): void {
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('Planetary Positions')
     .moveDown();

  doc.fontSize(12)
     .font('Helvetica');

  Object.entries(planets).forEach(([planet, data]: [string, any]) => {
    doc.text(`${capitalize(planet)}: ${data.sign} ${data.degree}° (House ${data.house})`);
  });
  
  doc.moveDown(2);
}

function addAspects(doc: any, aspects: any[]): void {
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('Major Aspects')
     .moveDown();

  doc.fontSize(12)
     .font('Helvetica');

  aspects.forEach(aspect => {
    doc.text(`${capitalize(aspect.planet1)} ${aspect.type} ${capitalize(aspect.planet2)} (${aspect.degree}°)`);
  });
  
  doc.moveDown(2);
}

function addInterpretation(doc: any, interpretation: string): void {
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('Interpretation')
     .moveDown();

  doc.fontSize(12)
     .font('Helvetica')
     .text(interpretation, { align: 'justify' })
     .moveDown(2);
}

function addFooter(doc: any): void {
  doc.fontSize(10)
     .font('Helvetica')
     .text('Generated by Luna - Your Cosmic Companion', {
       align: 'center',
       valign: 'bottom'
     });
}

function addCoverPage(doc: any, analysis: any): void {
  doc.fontSize(32)
     .font('Helvetica-Bold')
     .text(analysis.title, 100, 200, { align: 'center' })
     .fontSize(16)
     .font('Helvetica')
     .text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' })
     .addPage();
}

function addTableOfContents(doc: any): void {
  doc.fontSize(20)
     .font('Helvetica-Bold')
     .text('Table of Contents')
     .moveDown()
     .fontSize(14)
     .font('Helvetica')
     .text('1. Executive Summary')
     .text('2. Birth Chart Analysis')
     .text('3. Planetary Positions')
     .text('4. House System')
     .text('5. Aspects and Patterns')
     .text('6. Elemental Balance')
     .text('7. Recommendations')
     .addPage();
}

function addExecutiveSummary(doc: any, analysis: any): void {
  doc.fontSize(18)
     .font('Helvetica-Bold')
     .text('Executive Summary')
     .moveDown()
     .fontSize(12)
     .font('Helvetica')
     .text('Your astrological profile reveals...', { align: 'justify' })
     .moveDown(2);
}

function addDetailedAnalysis(doc: any, analysis: any): void {
  // Add detailed analysis sections
  doc.fontSize(18)
     .font('Helvetica-Bold')
     .text('Detailed Analysis')
     .moveDown();
  // Add more content...
}

function addCurrentTransits(doc: any, analysis: any): void {
  doc.addPage()
     .fontSize(18)
     .font('Helvetica-Bold')
     .text('Current Planetary Transits')
     .moveDown();
  // Add transit information...
}

function addRecommendations(doc: any, analysis: any): void {
  doc.fontSize(18)
     .font('Helvetica-Bold')
     .text('Personalized Recommendations')
     .moveDown();
  // Add recommendations...
}

function addGlossary(doc: any): void {
  doc.addPage()
     .fontSize(18)
     .font('Helvetica-Bold')
     .text('Astrological Terms Glossary')
     .moveDown();
  // Add glossary terms...
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}