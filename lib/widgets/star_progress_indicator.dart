import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../constants/app_theme.dart';

class StarProgressIndicator extends StatelessWidget {
  final int current;
  final int total;
  
  const StarProgressIndicator({
    Key? key,
    required this.current,
    required this.total,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 40,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(total, (index) {
          final isCompleted = index < current;
          final isCurrent = index == current - 1;
          
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: Icon(
              isCompleted ? Icons.star_rounded : Icons.star_outline_rounded,
              size: isCurrent ? 28 : 24,
              color: isCompleted
                  ? AppTheme.accentColor
                  : AppTheme.accentColor.withOpacity(0.3),
            ).animate(target: isCompleted ? 1 : 0)
              .scale(
                begin: 0.8,
                end: 1.0,
                duration: 300.ms,
              )
              .shimmer(
                duration: 1.seconds,
                delay: (index * 100).ms,
              ),
          );
        }),
      ),
    );
  }
}