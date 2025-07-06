import 'package:flutter/material.dart';
import '../constants/app_theme.dart';
import '../utils/zodiac_calculator.dart';

class ZodiacAvatar extends StatelessWidget {
  final String zodiacSign;
  final double size;
  final bool showBorder;
  
  const ZodiacAvatar({
    Key? key,
    required this.zodiacSign,
    this.size = 100,
    this.showBorder = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final element = ZodiacCalculator.getZodiacElement(zodiacSign);
    final symbol = ZodiacCalculator.getZodiacSymbol(zodiacSign);
    final colors = _getElementColors(element);
    
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [
            colors[0].withOpacity(0.8),
            colors[1].withOpacity(0.6),
            colors[0].withOpacity(0.3),
          ],
          stops: const [0.0, 0.5, 1.0],
        ),
        border: showBorder
            ? Border.all(
                color: colors[0],
                width: 3,
              )
            : null,
        boxShadow: [
          BoxShadow(
            color: colors[0].withOpacity(0.3),
            blurRadius: 20,
            spreadRadius: 5,
          ),
        ],
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Background pattern
          CustomPaint(
            size: Size(size, size),
            painter: _ConstellationPatternPainter(
              color: colors[0].withOpacity(0.3),
              zodiacSign: zodiacSign,
            ),
          ),
          
          // Zodiac symbol
          Container(
            width: size * 0.6,
            height: size * 0.6,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppTheme.backgroundColor.withOpacity(0.3),
            ),
            child: Center(
              child: Text(
                symbol,
                style: TextStyle(
                  fontSize: size * 0.4,
                  color: Colors.white,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  List<Color> _getElementColors(String element) {
    switch (element) {
      case 'Fire':
        return [const Color(0xFFFF6B6B), const Color(0xFFFF9F40)];
      case 'Earth':
        return [const Color(0xFF4ECDC4), const Color(0xFF44A08D)];
      case 'Air':
        return [const Color(0xFF6C5CE7), const Color(0xFFA29BFE)];
      case 'Water':
        return [const Color(0xFF54A0FF), const Color(0xFF48DBF8)];
      default:
        return [AppTheme.primaryColor, AppTheme.secondaryColor];
    }
  }
}

class _ConstellationPatternPainter extends CustomPainter {
  final Color color;
  final String zodiacSign;

  _ConstellationPatternPainter({
    required this.color,
    required this.zodiacSign,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 1.0
      ..style = PaintingStyle.stroke;

    final dotPaint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    // Create constellation pattern based on zodiac sign
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    // Draw constellation dots and lines based on zodiac
    final constellationPoints = _getConstellationPoints(zodiacSign, center, radius);
    
    // Draw lines
    for (int i = 0; i < constellationPoints.length - 1; i++) {
      canvas.drawLine(constellationPoints[i], constellationPoints[i + 1], paint);
    }
    
    // Draw dots
    for (final point in constellationPoints) {
      canvas.drawCircle(point, 3, dotPaint);
    }
  }

  List<Offset> _getConstellationPoints(String zodiacSign, Offset center, double radius) {
    // Simple constellation patterns for each zodiac sign
    switch (zodiacSign) {
      case 'Aries':
        return [
          center + Offset(0, -radius * 0.7),
          center + Offset(-radius * 0.3, -radius * 0.3),
          center + Offset(radius * 0.3, -radius * 0.3),
          center + Offset(0, -radius * 0.7),
        ];
      case 'Taurus':
        return [
          center + Offset(-radius * 0.5, -radius * 0.5),
          center + Offset(0, -radius * 0.7),
          center + Offset(radius * 0.5, -radius * 0.5),
          center + Offset(radius * 0.3, 0),
          center + Offset(-radius * 0.3, 0),
        ];
      case 'Gemini':
        return [
          center + Offset(-radius * 0.4, -radius * 0.6),
          center + Offset(-radius * 0.2, 0),
          center + Offset(-radius * 0.4, radius * 0.6),
          center + Offset(radius * 0.4, radius * 0.6),
          center + Offset(radius * 0.2, 0),
          center + Offset(radius * 0.4, -radius * 0.6),
        ];
      default:
        // Default star pattern
        return [
          center + Offset(0, -radius * 0.7),
          center + Offset(radius * 0.5, 0),
          center + Offset(0, radius * 0.7),
          center + Offset(-radius * 0.5, 0),
          center + Offset(0, -radius * 0.7),
        ];
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}