import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../widgets/luna_progress_indicator.dart';

/// Painter for constellation-style animations
class ConstellationPainter extends CustomPainter {
  final List<StarData> stars;
  final double animationValue;
  final double? progress;
  final Color color;

  ConstellationPainter({
    required this.stars,
    required this.animationValue,
    this.progress,
    required this.color,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 10;

    // Draw connections between stars
    final connectionPaint = Paint()
      ..color = color.withOpacity(0.3)
      ..strokeWidth = 1.0
      ..style = PaintingStyle.stroke;

    for (int i = 0; i < stars.length; i++) {
      final star = stars[i];
      final nextStar = stars[(i + 1) % stars.length];
      
      final startPos = Offset(
        center.dx + star.x * radius,
        center.dy + star.y * radius,
      );
      
      final endPos = Offset(
        center.dx + nextStar.x * radius,
        center.dy + nextStar.y * radius,
      );

      // Animate connection opacity
      final connectionProgress = ((animationValue + star.delayFactor) % 1.0);
      connectionPaint.color = color.withOpacity(0.1 + connectionProgress * 0.4);
      
      canvas.drawLine(startPos, endPos, connectionPaint);
    }

    // Draw stars
    for (final star in stars) {
      final position = Offset(
        center.dx + star.x * radius,
        center.dy + star.y * radius,
      );

      // Calculate star animation
      final starProgress = ((animationValue + star.delayFactor) % 1.0);
      final scale = 0.5 + starProgress * 0.5;
      final opacity = 0.4 + starProgress * 0.6;

      // Draw star glow
      final glowPaint = Paint()
        ..color = color.withOpacity(opacity * 0.3)
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8);

      canvas.drawCircle(position, star.size * scale * 2, glowPaint);

      // Draw star core
      final starPaint = Paint()
        ..color = color.withOpacity(opacity)
        ..style = PaintingStyle.fill;

      canvas.drawCircle(position, star.size * scale, starPaint);

      // Draw star sparkle
      if (starProgress > 0.8) {
        final sparklePaint = Paint()
          ..color = Colors.white.withOpacity((starProgress - 0.8) * 5)
          ..style = PaintingStyle.fill;
        
        canvas.drawCircle(position, star.size * scale * 0.5, sparklePaint);
      }
    }

    // Draw progress arc if determinate
    if (progress != null) {
      final progressPaint = Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3.0
        ..strokeCap = StrokeCap.round;

      final sweepAngle = 2 * math.pi * progress!;
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius + 5),
        -math.pi / 2,
        sweepAngle,
        false,
        progressPaint,
      );
    }
  }

  @override
  bool shouldRepaint(ConstellationPainter oldDelegate) {
    return oldDelegate.animationValue != animationValue ||
        oldDelegate.progress != progress ||
        oldDelegate.color != color;
  }
}