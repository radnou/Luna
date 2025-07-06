import 'dart:math' as math;
import 'dart:ui' as ui;
import 'package:flutter/material.dart';

/// Custom painter for various gradient effects
class GradientPainter extends CustomPainter {
  final List<Color> colors;
  final GradientType type;
  final double animationValue;
  final Alignment begin;
  final Alignment end;
  final double radius;

  GradientPainter({
    required this.colors,
    required this.type,
    this.animationValue = 0.0,
    this.begin = Alignment.topLeft,
    this.end = Alignment.bottomRight,
    this.radius = 1.0,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Rect.fromLTWH(0, 0, size.width, size.height);
    final paint = Paint();

    switch (type) {
      case GradientType.linear:
        paint.shader = LinearGradient(
          colors: colors,
          begin: begin,
          end: end,
        ).createShader(rect);
        break;

      case GradientType.radial:
        paint.shader = RadialGradient(
          colors: colors,
          radius: radius,
        ).createShader(rect);
        break;

      case GradientType.sweep:
        paint.shader = SweepGradient(
          colors: colors,
          startAngle: animationValue * 2 * math.pi,
          endAngle: animationValue * 2 * math.pi + 2 * math.pi,
        ).createShader(rect);
        break;

      case GradientType.animated:
        _paintAnimatedGradient(canvas, size, paint);
        return;

      case GradientType.mesh:
        _paintMeshGradient(canvas, size, paint);
        return;
    }

    canvas.drawRect(rect, paint);
  }

  void _paintAnimatedGradient(Canvas canvas, Size size, Paint paint) {
    final rect = Rect.fromLTWH(0, 0, size.width, size.height);
    
    // Create animated gradient with shifting colors
    final animatedColors = List.generate(colors.length, (index) {
      final hslColor = HSLColor.fromColor(colors[index]);
      final shiftedHue = (hslColor.hue + animationValue * 360) % 360;
      return hslColor.withHue(shiftedHue).toColor();
    });

    paint.shader = LinearGradient(
      colors: animatedColors,
      begin: Alignment(
        math.cos(animationValue * 2 * math.pi),
        math.sin(animationValue * 2 * math.pi),
      ),
      end: Alignment(
        -math.cos(animationValue * 2 * math.pi),
        -math.sin(animationValue * 2 * math.pi),
      ),
    ).createShader(rect);

    canvas.drawRect(rect, paint);
  }

  void _paintMeshGradient(Canvas canvas, Size size, Paint paint) {
    const gridSize = 4;
    final cellWidth = size.width / gridSize;
    final cellHeight = size.height / gridSize;

    for (int i = 0; i < gridSize; i++) {
      for (int j = 0; j < gridSize; j++) {
        final rect = Rect.fromLTWH(
          i * cellWidth,
          j * cellHeight,
          cellWidth,
          cellHeight,
        );

        final colorIndex = (i + j) % colors.length;
        final nextColorIndex = (colorIndex + 1) % colors.length;
        
        paint.shader = RadialGradient(
          colors: [
            colors[colorIndex],
            colors[nextColorIndex],
          ],
          center: Alignment(
            (i - gridSize / 2) / gridSize * 2,
            (j - gridSize / 2) / gridSize * 2,
          ),
          radius: 1.5,
        ).createShader(rect);

        canvas.drawRect(rect, paint);
      }
    }
  }

  @override
  bool shouldRepaint(GradientPainter oldDelegate) {
    return oldDelegate.animationValue != animationValue ||
        oldDelegate.colors != colors ||
        oldDelegate.type != type;
  }
}

enum GradientType {
  linear,
  radial,
  sweep,
  animated,
  mesh,
}

/// Widget that displays animated gradients
class AnimatedGradientContainer extends StatefulWidget {
  final List<Color> colors;
  final GradientType type;
  final Duration duration;
  final double? width;
  final double? height;
  final Widget? child;
  final Alignment begin;
  final Alignment end;
  final double radius;

  const AnimatedGradientContainer({
    Key? key,
    required this.colors,
    this.type = GradientType.animated,
    this.duration = const Duration(seconds: 3),
    this.width,
    this.height,
    this.child,
    this.begin = Alignment.topLeft,
    this.end = Alignment.bottomRight,
    this.radius = 1.0,
  }) : super(key: key);

  @override
  State<AnimatedGradientContainer> createState() => _AnimatedGradientContainerState();
}

class _AnimatedGradientContainerState extends State<AnimatedGradientContainer>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.duration,
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return CustomPaint(
          painter: GradientPainter(
            colors: widget.colors,
            type: widget.type,
            animationValue: _controller.value,
            begin: widget.begin,
            end: widget.end,
            radius: widget.radius,
          ),
          child: SizedBox(
            width: widget.width,
            height: widget.height,
            child: widget.child,
          ),
        );
      },
    );
  }
}