import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../theme/luna_colors.dart';
import '../painters/constellation_painter.dart';

enum LunaProgressType { circular, linear, constellation }

/// Custom progress indicator with constellation animations
class LunaProgressIndicator extends StatefulWidget {
  final double? value;
  final LunaProgressType type;
  final double size;
  final double strokeWidth;
  final Color? color;
  final Color? backgroundColor;
  final List<Color>? gradientColors;
  final String? label;

  const LunaProgressIndicator({
    Key? key,
    this.value,
    this.type = LunaProgressType.circular,
    this.size = 48.0,
    this.strokeWidth = 4.0,
    this.color,
    this.backgroundColor,
    this.gradientColors,
    this.label,
  }) : super(key: key);

  @override
  State<LunaProgressIndicator> createState() => _LunaProgressIndicatorState();
}

class _LunaProgressIndicatorState extends State<LunaProgressIndicator>
    with TickerProviderStateMixin {
  late AnimationController _rotationController;
  late AnimationController _starController;
  late List<StarData> _stars;

  @override
  void initState() {
    super.initState();
    
    _rotationController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat();

    _starController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    )..repeat();

    // Generate stars for constellation effect
    _stars = List.generate(8, (index) {
      final angle = (index * math.pi * 2) / 8;
      return StarData(
        x: math.cos(angle),
        y: math.sin(angle),
        size: 2 + (index % 3) * 1.5,
        delayFactor: index * 0.125,
      );
    });
  }

  @override
  void dispose() {
    _rotationController.dispose();
    _starController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    switch (widget.type) {
      case LunaProgressType.circular:
        return _buildCircularProgress(context);
      case LunaProgressType.linear:
        return _buildLinearProgress(context);
      case LunaProgressType.constellation:
        return _buildConstellationProgress(context);
    }
  }

  Widget _buildCircularProgress(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final progressColor = widget.color ?? Theme.of(context).colorScheme.primary;
    final bgColor = widget.backgroundColor ??
        (isDark ? LunaColors.gray700 : LunaColors.gray300);

    if (widget.value == null) {
      // Indeterminate
      return SizedBox(
        width: widget.size,
        height: widget.size,
        child: AnimatedBuilder(
          animation: _rotationController,
          builder: (context, child) {
            return Transform.rotate(
              angle: _rotationController.value * 2 * math.pi,
              child: CustomPaint(
                painter: _CircularProgressPainter(
                  progress: null,
                  color: progressColor,
                  backgroundColor: bgColor,
                  strokeWidth: widget.strokeWidth,
                  gradientColors: widget.gradientColors,
                ),
              ),
            );
          },
        ),
      );
    }

    // Determinate
    return SizedBox(
      width: widget.size,
      height: widget.size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          CustomPaint(
            size: Size(widget.size, widget.size),
            painter: _CircularProgressPainter(
              progress: widget.value!,
              color: progressColor,
              backgroundColor: bgColor,
              strokeWidth: widget.strokeWidth,
              gradientColors: widget.gradientColors,
            ),
          ),
          if (widget.label != null)
            Text(
              widget.label!,
              style: Theme.of(context).textTheme.labelSmall,
            ),
        ],
      ),
    );
  }

  Widget _buildLinearProgress(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final progressColor = widget.color ?? Theme.of(context).colorScheme.primary;
    final bgColor = widget.backgroundColor ??
        (isDark ? LunaColors.gray700 : LunaColors.gray300);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.label != null) ...[
          Text(
            widget.label!,
            style: Theme.of(context).textTheme.labelMedium,
          ),
          const SizedBox(height: 8),
        ],
        Container(
          height: widget.strokeWidth,
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(widget.strokeWidth / 2),
          ),
          child: LayoutBuilder(
            builder: (context, constraints) {
              if (widget.value == null) {
                // Indeterminate
                return AnimatedBuilder(
                  animation: _rotationController,
                  builder: (context, child) {
                    return Stack(
                      children: [
                        Positioned(
                          left: constraints.maxWidth * _rotationController.value - 
                                constraints.maxWidth * 0.3,
                          child: Container(
                            width: constraints.maxWidth * 0.3,
                            height: widget.strokeWidth,
                            decoration: BoxDecoration(
                              gradient: widget.gradientColors != null
                                  ? LinearGradient(colors: widget.gradientColors!)
                                  : LinearGradient(
                                      colors: [
                                        progressColor.withOpacity(0),
                                        progressColor,
                                        progressColor.withOpacity(0),
                                      ],
                                    ),
                              borderRadius: BorderRadius.circular(widget.strokeWidth / 2),
                            ),
                          ),
                        ),
                      ],
                    );
                  },
                );
              }

              // Determinate
              return Align(
                alignment: Alignment.centerLeft,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  width: constraints.maxWidth * widget.value!.clamp(0.0, 1.0),
                  height: widget.strokeWidth,
                  decoration: BoxDecoration(
                    gradient: widget.gradientColors != null
                        ? LinearGradient(colors: widget.gradientColors!)
                        : null,
                    color: widget.gradientColors == null ? progressColor : null,
                    borderRadius: BorderRadius.circular(widget.strokeWidth / 2),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildConstellationProgress(BuildContext context) {
    return SizedBox(
      width: widget.size,
      height: widget.size,
      child: AnimatedBuilder(
        animation: _starController,
        builder: (context, child) {
          return CustomPaint(
            painter: ConstellationPainter(
              stars: _stars,
              animationValue: _starController.value,
              progress: widget.value,
              color: widget.color ?? LunaColors.starYellow,
            ),
          );
        },
      ),
    );
  }
}

class _CircularProgressPainter extends CustomPainter {
  final double? progress;
  final Color color;
  final Color backgroundColor;
  final double strokeWidth;
  final List<Color>? gradientColors;

  _CircularProgressPainter({
    required this.progress,
    required this.color,
    required this.backgroundColor,
    required this.strokeWidth,
    this.gradientColors,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width - strokeWidth) / 2;

    // Draw background circle
    final bgPaint = Paint()
      ..color = backgroundColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth;

    canvas.drawCircle(center, radius, bgPaint);

    // Draw progress arc
    final progressPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    if (gradientColors != null) {
      final gradient = SweepGradient(
        colors: gradientColors!,
        startAngle: -math.pi / 2,
        endAngle: -math.pi / 2 + 2 * math.pi,
      );
      progressPaint.shader = gradient.createShader(
        Rect.fromCircle(center: center, radius: radius),
      );
    } else {
      progressPaint.color = color;
    }

    if (progress == null) {
      // Indeterminate - draw partial arc
      const sweepAngle = math.pi * 0.75;
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        -math.pi / 2,
        sweepAngle,
        false,
        progressPaint,
      );
    } else {
      // Determinate - draw progress arc
      final sweepAngle = 2 * math.pi * progress!;
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        -math.pi / 2,
        sweepAngle,
        false,
        progressPaint,
      );
    }
  }

  @override
  bool shouldRepaint(_CircularProgressPainter oldDelegate) {
    return oldDelegate.progress != progress ||
        oldDelegate.color != color ||
        oldDelegate.backgroundColor != backgroundColor ||
        oldDelegate.strokeWidth != strokeWidth;
  }
}

class StarData {
  final double x;
  final double y;
  final double size;
  final double delayFactor;

  StarData({
    required this.x,
    required this.y,
    required this.size,
    required this.delayFactor,
  });
}