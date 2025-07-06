import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/luna_colors.dart';
import '../theme/luna_typography.dart';

enum LunaButtonSize { small, medium, large }

enum LunaButtonVariant { primary, secondary, accent, ghost, outline }

/// Custom button widget with gradient fills and haptic feedback
class LunaButton extends StatefulWidget {
  final String text;
  final VoidCallback? onPressed;
  final LunaButtonSize size;
  final LunaButtonVariant variant;
  final bool isLoading;
  final Widget? icon;
  final bool fullWidth;
  final double? width;
  final EdgeInsetsGeometry? padding;

  const LunaButton({
    Key? key,
    required this.text,
    this.onPressed,
    this.size = LunaButtonSize.medium,
    this.variant = LunaButtonVariant.primary,
    this.isLoading = false,
    this.icon,
    this.fullWidth = false,
    this.width,
    this.padding,
  }) : super(key: key);

  @override
  State<LunaButton> createState() => _LunaButtonState();
}

class _LunaButtonState extends State<LunaButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.95,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _handleTapDown(TapDownDetails details) {
    if (widget.onPressed == null || widget.isLoading) return;
    
    setState(() => _isPressed = true);
    _animationController.forward();
    
    // Trigger haptic feedback
    HapticFeedback.lightImpact();
  }

  void _handleTapUp(TapUpDetails details) {
    if (widget.onPressed == null || widget.isLoading) return;
    
    setState(() => _isPressed = false);
    _animationController.reverse();
  }

  void _handleTapCancel() {
    setState(() => _isPressed = false);
    _animationController.reverse();
  }

  EdgeInsetsGeometry _getPadding() {
    if (widget.padding != null) return widget.padding!;
    
    switch (widget.size) {
      case LunaButtonSize.small:
        return const EdgeInsets.symmetric(horizontal: 16, vertical: 8);
      case LunaButtonSize.medium:
        return const EdgeInsets.symmetric(horizontal: 24, vertical: 12);
      case LunaButtonSize.large:
        return const EdgeInsets.symmetric(horizontal: 32, vertical: 16);
    }
  }

  TextStyle _getTextStyle(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    Color textColor;
    
    switch (widget.variant) {
      case LunaButtonVariant.primary:
      case LunaButtonVariant.secondary:
      case LunaButtonVariant.accent:
        textColor = LunaColors.white;
        break;
      case LunaButtonVariant.ghost:
      case LunaButtonVariant.outline:
        textColor = isDark ? LunaColors.gray50 : LunaColors.gray900;
        break;
    }
    
    switch (widget.size) {
      case LunaButtonSize.small:
        return LunaTypography.labelMedium(color: textColor);
      case LunaButtonSize.medium:
        return LunaTypography.labelLarge(color: textColor);
      case LunaButtonSize.large:
        return LunaTypography.titleMedium(color: textColor);
    }
  }

  double _getIconSize() {
    switch (widget.size) {
      case LunaButtonSize.small:
        return 16;
      case LunaButtonSize.medium:
        return 20;
      case LunaButtonSize.large:
        return 24;
    }
  }

  BoxDecoration _getDecoration(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    switch (widget.variant) {
      case LunaButtonVariant.primary:
        return BoxDecoration(
          gradient: LunaColors.primaryGradient,
          borderRadius: BorderRadius.circular(30),
          boxShadow: widget.onPressed != null && !widget.isLoading
              ? [
                  BoxShadow(
                    color: LunaColors.primary.withOpacity(0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ]
              : [],
        );
        
      case LunaButtonVariant.secondary:
        return BoxDecoration(
          gradient: LunaColors.secondaryGradient,
          borderRadius: BorderRadius.circular(30),
          boxShadow: widget.onPressed != null && !widget.isLoading
              ? [
                  BoxShadow(
                    color: LunaColors.secondary.withOpacity(0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ]
              : [],
        );
        
      case LunaButtonVariant.accent:
        return BoxDecoration(
          gradient: const LinearGradient(
            colors: [LunaColors.accent, LunaColors.accentLight],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(30),
          boxShadow: widget.onPressed != null && !widget.isLoading
              ? [
                  BoxShadow(
                    color: LunaColors.accent.withOpacity(0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ]
              : [],
        );
        
      case LunaButtonVariant.ghost:
        return BoxDecoration(
          color: _isPressed
              ? (isDark ? LunaColors.gray700 : LunaColors.gray100)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(30),
        );
        
      case LunaButtonVariant.outline:
        return BoxDecoration(
          border: Border.all(
            color: isDark ? LunaColors.gray600 : LunaColors.gray300,
            width: 1.5,
          ),
          borderRadius: BorderRadius.circular(30),
          color: _isPressed
              ? (isDark ? LunaColors.gray800 : LunaColors.gray50)
              : Colors.transparent,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDisabled = widget.onPressed == null || widget.isLoading;
    
    return GestureDetector(
      onTapDown: _handleTapDown,
      onTapUp: _handleTapUp,
      onTapCancel: _handleTapCancel,
      onTap: isDisabled ? null : widget.onPressed,
      child: AnimatedBuilder(
        animation: _scaleAnimation,
        builder: (context, child) {
          return Transform.scale(
            scale: _scaleAnimation.value,
            child: AnimatedOpacity(
              opacity: isDisabled ? 0.5 : 1.0,
              duration: const Duration(milliseconds: 200),
              child: Container(
                width: widget.fullWidth ? double.infinity : widget.width,
                padding: _getPadding(),
                decoration: _getDecoration(context),
                child: Row(
                  mainAxisSize: widget.fullWidth ? MainAxisSize.max : MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (widget.isLoading) ...[
                      SizedBox(
                        width: _getIconSize(),
                        height: _getIconSize(),
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            widget.variant == LunaButtonVariant.ghost ||
                                    widget.variant == LunaButtonVariant.outline
                                ? Theme.of(context).colorScheme.primary
                                : LunaColors.white,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                    ] else if (widget.icon != null) ...[
                      IconTheme(
                        data: IconThemeData(
                          size: _getIconSize(),
                          color: _getTextStyle(context).color,
                        ),
                        child: widget.icon!,
                      ),
                      const SizedBox(width: 8),
                    ],
                    Text(
                      widget.text,
                      style: _getTextStyle(context),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}