import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../constants/app_theme.dart';

class ConstellationBackground extends StatefulWidget {
  final bool animate;
  
  const ConstellationBackground({Key? key, this.animate = true}) : super(key: key);

  @override
  State<ConstellationBackground> createState() => _ConstellationBackgroundState();
}

class _ConstellationBackgroundState extends State<ConstellationBackground>
    with TickerProviderStateMixin {
  late AnimationController _controller;
  late List<Star> stars;
  final Random random = Random();

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 20),
      vsync: this,
    );
    
    if (widget.animate) {
      _controller.repeat();
    }
    
    stars = List.generate(100, (index) => Star(random));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: AppTheme.cosmicGradient,
        ),
      ),
      child: widget.animate
          ? AnimatedBuilder(
              animation: _controller,
              builder: (context, child) {
                return CustomPaint(
                  painter: ConstellationPainter(stars, _controller.value),
                  size: Size.infinite,
                );
              },
            )
          : CustomPaint(
              painter: ConstellationPainter(stars, 0),
              size: Size.infinite,
            ),
    );
  }
}

class Star {
  final double x;
  final double y;
  final double size;
  final double speed;
  final double opacity;

  Star(Random random)
      : x = random.nextDouble(),
        y = random.nextDouble(),
        size = random.nextDouble() * 3 + 0.5,
        speed = random.nextDouble() * 0.5 + 0.1,
        opacity = random.nextDouble() * 0.8 + 0.2;
}

class ConstellationPainter extends CustomPainter {
  final List<Star> stars;
  final double animationValue;

  ConstellationPainter(this.stars, this.animationValue);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = Colors.white;

    // Draw stars
    for (final star in stars) {
      final twinkle = sin(animationValue * 2 * pi * star.speed) * 0.3 + 0.7;
      paint.color = Colors.white.withOpacity(star.opacity * twinkle);
      
      canvas.drawCircle(
        Offset(star.x * size.width, star.y * size.height),
        star.size,
        paint,
      );
    }

    // Draw constellation lines
    final linePaint = Paint()
      ..color = Colors.white.withOpacity(0.2)
      ..strokeWidth = 0.5
      ..style = PaintingStyle.stroke;

    // Create some random constellations
    for (int i = 0; i < stars.length - 3; i += 4) {
      if (stars[i].opacity > 0.5) {
        final path = Path();
        path.moveTo(stars[i].x * size.width, stars[i].y * size.height);
        path.lineTo(stars[i + 1].x * size.width, stars[i + 1].y * size.height);
        path.lineTo(stars[i + 2].x * size.width, stars[i + 2].y * size.height);
        
        canvas.drawPath(path, linePaint);
      }
    }
  }

  @override
  bool shouldRepaint(ConstellationPainter oldDelegate) => true;
}