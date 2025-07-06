import 'dart:math' as math;
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import '../theme/luna_colors.dart';

/// Painter for constellation-style backgrounds
class ConstellationBackgroundPainter extends CustomPainter {
  final List<Star> stars;
  final List<Connection> connections;
  final double animationValue;
  final bool showGradient;
  final List<Color>? gradientColors;

  ConstellationBackgroundPainter({
    required this.stars,
    required this.connections,
    required this.animationValue,
    this.showGradient = true,
    this.gradientColors,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // Draw gradient background
    if (showGradient) {
      final gradient = ui.Gradient.linear(
        Offset.zero,
        Offset(0, size.height),
        gradientColors ?? LunaColors.nightSkyGradient.colors,
      );

      final paint = Paint()..shader = gradient;
      canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), paint);
    }

    // Draw connections
    final connectionPaint = Paint()
      ..strokeWidth = 0.5
      ..style = PaintingStyle.stroke;

    for (final connection in connections) {
      final startStar = stars[connection.startIndex];
      final endStar = stars[connection.endIndex];
      
      final startPos = Offset(
        startStar.x * size.width,
        startStar.y * size.height,
      );
      
      final endPos = Offset(
        endStar.x * size.width,
        endStar.y * size.height,
      );

      // Calculate connection opacity based on animation
      final distance = (endPos - startPos).distance;
      final maxDistance = math.sqrt(size.width * size.width + size.height * size.height);
      final normalizedDistance = distance / maxDistance;
      
      final opacity = (0.1 + (1 - normalizedDistance) * 0.2) * 
                     (0.5 + 0.5 * math.sin(animationValue * 2 * math.pi + connection.phase));
      
      connectionPaint.color = LunaColors.starYellow.withOpacity(opacity.clamp(0.0, 0.3));
      
      canvas.drawLine(startPos, endPos, connectionPaint);
    }

    // Draw stars
    for (final star in stars) {
      final position = Offset(
        star.x * size.width,
        star.y * size.height,
      );

      // Calculate star twinkle
      final twinkle = 0.5 + 0.5 * math.sin(
        animationValue * 2 * math.pi * star.twinkleSpeed + star.twinklePhase
      );

      // Draw star glow
      final glowRadius = star.size * (1.5 + twinkle * 0.5);
      final glowPaint = Paint()
        ..color = star.color.withOpacity(twinkle * 0.3)
        ..maskFilter = MaskFilter.blur(BlurStyle.normal, glowRadius);

      canvas.drawCircle(position, glowRadius, glowPaint);

      // Draw star core
      final starPaint = Paint()
        ..color = star.color.withOpacity(0.8 + twinkle * 0.2);

      canvas.drawCircle(position, star.size, starPaint);

      // Draw star sparkle
      if (twinkle > 0.8) {
        final sparklePaint = Paint()
          ..color = Colors.white.withOpacity((twinkle - 0.8) * 2);
        
        canvas.drawCircle(position, star.size * 0.5, sparklePaint);
      }
    }

    // Draw shooting stars
    if (animationValue % 0.3 < 0.1) {
      _drawShootingStar(canvas, size, animationValue);
    }
  }

  void _drawShootingStar(Canvas canvas, Size size, double animationValue) {
    final startX = size.width * 0.8;
    final startY = size.height * 0.2;
    final endX = size.width * 0.2;
    final endY = size.height * 0.5;
    
    final progress = (animationValue % 0.3) / 0.1;
    final currentX = startX + (endX - startX) * progress;
    final currentY = startY + (endY - startY) * progress;
    
    final path = Path();
    path.moveTo(startX, startY);
    path.lineTo(currentX, currentY);
    
    final paint = Paint()
      ..shader = ui.Gradient.linear(
        Offset(startX, startY),
        Offset(currentX, currentY),
        [
          LunaColors.starYellow.withOpacity(0),
          LunaColors.starYellow.withOpacity(0.8),
          LunaColors.white,
        ],
        [0.0, 0.7, 1.0],
      )
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    
    canvas.drawPath(path, paint);
    
    // Draw shooting star head
    canvas.drawCircle(
      Offset(currentX, currentY),
      3,
      Paint()..color = Colors.white,
    );
  }

  @override
  bool shouldRepaint(ConstellationBackgroundPainter oldDelegate) {
    return oldDelegate.animationValue != animationValue;
  }
}

class Star {
  final double x;
  final double y;
  final double size;
  final Color color;
  final double twinkleSpeed;
  final double twinklePhase;

  Star({
    required this.x,
    required this.y,
    required this.size,
    required this.color,
    required this.twinkleSpeed,
    required this.twinklePhase,
  });
}

class Connection {
  final int startIndex;
  final int endIndex;
  final double phase;

  Connection({
    required this.startIndex,
    required this.endIndex,
    required this.phase,
  });
}

/// Widget that displays an animated constellation background
class ConstellationBackground extends StatefulWidget {
  final Widget? child;
  final int starCount;
  final bool showGradient;
  final List<Color>? gradientColors;
  final double animationSpeed;

  const ConstellationBackground({
    Key? key,
    this.child,
    this.starCount = 50,
    this.showGradient = true,
    this.gradientColors,
    this.animationSpeed = 0.5,
  }) : super(key: key);

  @override
  State<ConstellationBackground> createState() => _ConstellationBackgroundState();
}

class _ConstellationBackgroundState extends State<ConstellationBackground>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late List<Star> _stars;
  late List<Connection> _connections;

  @override
  void initState() {
    super.initState();
    
    _animationController = AnimationController(
      duration: Duration(seconds: (10 / widget.animationSpeed).round()),
      vsync: this,
    )..repeat();

    _generateStarsAndConnections();
  }

  void _generateStarsAndConnections() {
    final random = math.Random();
    
    // Generate stars
    _stars = List.generate(widget.starCount, (index) {
      return Star(
        x: random.nextDouble(),
        y: random.nextDouble(),
        size: 0.5 + random.nextDouble() * 2,
        color: [
          LunaColors.starYellow,
          LunaColors.moonGlow,
          LunaColors.cosmicBlue,
          LunaColors.white,
        ][random.nextInt(4)],
        twinkleSpeed: 0.5 + random.nextDouble() * 2,
        twinklePhase: random.nextDouble() * 2 * math.pi,
      );
    });

    // Generate connections between nearby stars
    _connections = [];
    for (int i = 0; i < _stars.length; i++) {
      for (int j = i + 1; j < _stars.length; j++) {
        final distance = math.sqrt(
          math.pow(_stars[i].x - _stars[j].x, 2) +
          math.pow(_stars[i].y - _stars[j].y, 2)
        );
        
        if (distance < 0.2) {
          _connections.add(Connection(
            startIndex: i,
            endIndex: j,
            phase: random.nextDouble() * 2 * math.pi,
          ));
        }
      }
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animationController,
      builder: (context, child) {
        return CustomPaint(
          painter: ConstellationBackgroundPainter(
            stars: _stars,
            connections: _connections,
            animationValue: _animationController.value,
            showGradient: widget.showGradient,
            gradientColors: widget.gradientColors,
          ),
          child: widget.child,
        );
      },
    );
  }
}