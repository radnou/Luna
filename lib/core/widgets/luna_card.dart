import 'package:flutter/material.dart';
import '../theme/luna_colors.dart';
import '../painters/gradient_border_painter.dart';

enum LunaCardVariant { filled, outlined, gradient }

/// Custom card widget with rounded corners and gradient borders
class LunaCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final LunaCardVariant variant;
  final double borderRadius;
  final double? width;
  final double? height;
  final VoidCallback? onTap;
  final List<Color>? gradientColors;
  final double elevation;
  final Color? backgroundColor;
  final double borderWidth;

  const LunaCard({
    Key? key,
    required this.child,
    this.padding,
    this.margin,
    this.variant = LunaCardVariant.filled,
    this.borderRadius = 20.0,
    this.width,
    this.height,
    this.onTap,
    this.gradientColors,
    this.elevation = 0,
    this.backgroundColor,
    this.borderWidth = 2.0,
  }) : super(key: key);

  Widget _buildContent(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    Widget content = Container(
      width: width,
      height: height,
      padding: padding ?? const EdgeInsets.all(16),
      child: child,
    );

    switch (variant) {
      case LunaCardVariant.filled:
        return Container(
          decoration: BoxDecoration(
            color: backgroundColor ?? 
                (isDark ? LunaColors.gray800 : LunaColors.white),
            borderRadius: BorderRadius.circular(borderRadius),
            boxShadow: elevation > 0
                ? [
                    BoxShadow(
                      color: LunaColors.black.withOpacity(0.1),
                      blurRadius: elevation * 2,
                      offset: Offset(0, elevation),
                    ),
                  ]
                : null,
          ),
          child: content,
        );

      case LunaCardVariant.outlined:
        return Container(
          decoration: BoxDecoration(
            color: backgroundColor ?? 
                (isDark ? LunaColors.gray800.withOpacity(0.5) : LunaColors.white.withOpacity(0.5)),
            borderRadius: BorderRadius.circular(borderRadius),
            border: Border.all(
              color: isDark ? LunaColors.gray600 : LunaColors.gray300,
              width: borderWidth,
            ),
          ),
          child: content,
        );

      case LunaCardVariant.gradient:
        return CustomPaint(
          painter: GradientBorderPainter(
            gradient: LinearGradient(
              colors: gradientColors ?? LunaColors.cosmicGradient.colors,
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            strokeWidth: borderWidth,
            borderRadius: borderRadius,
          ),
          child: Container(
            decoration: BoxDecoration(
              color: backgroundColor ?? 
                  (isDark ? LunaColors.gray800 : LunaColors.white),
              borderRadius: BorderRadius.circular(borderRadius),
            ),
            child: content,
          ),
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final card = Container(
      margin: margin,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(borderRadius),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(borderRadius),
            child: _buildContent(context),
          ),
        ),
      ),
    );

    if (onTap != null) {
      return card;
    }

    return Container(
      margin: margin,
      child: _buildContent(context),
    );
  }
}

/// A specialized card for displaying content with a header
class LunaHeaderCard extends StatelessWidget {
  final Widget header;
  final Widget content;
  final EdgeInsetsGeometry? margin;
  final LunaCardVariant variant;
  final double borderRadius;
  final VoidCallback? onTap;
  final List<Color>? gradientColors;
  final Color? headerBackgroundColor;
  final EdgeInsetsGeometry? headerPadding;
  final EdgeInsetsGeometry? contentPadding;

  const LunaHeaderCard({
    Key? key,
    required this.header,
    required this.content,
    this.margin,
    this.variant = LunaCardVariant.filled,
    this.borderRadius = 20.0,
    this.onTap,
    this.gradientColors,
    this.headerBackgroundColor,
    this.headerPadding,
    this.contentPadding,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return LunaCard(
      margin: margin,
      variant: variant,
      borderRadius: borderRadius,
      onTap: onTap,
      gradientColors: gradientColors,
      padding: EdgeInsets.zero,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            decoration: BoxDecoration(
              color: headerBackgroundColor ??
                  (isDark 
                      ? LunaColors.gray700.withOpacity(0.5) 
                      : LunaColors.gray100.withOpacity(0.5)),
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(borderRadius),
                topRight: Radius.circular(borderRadius),
              ),
            ),
            padding: headerPadding ?? const EdgeInsets.all(16),
            child: header,
          ),
          Container(
            padding: contentPadding ?? const EdgeInsets.all(16),
            child: content,
          ),
        ],
      ),
    );
  }
}