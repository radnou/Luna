import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/luna_colors.dart';
import '../theme/luna_typography.dart';

class LunaBottomNavItem {
  final IconData icon;
  final IconData? activeIcon;
  final String label;
  final Color? color;

  const LunaBottomNavItem({
    required this.icon,
    this.activeIcon,
    required this.label,
    this.color,
  });
}

/// Custom bottom navigation bar with cosmic design
class LunaBottomNavBar extends StatefulWidget {
  final List<LunaBottomNavItem> items;
  final int currentIndex;
  final ValueChanged<int> onTap;
  final Color? backgroundColor;
  final Color? selectedItemColor;
  final Color? unselectedItemColor;
  final double height;
  final bool showLabels;
  final bool enableHapticFeedback;

  const LunaBottomNavBar({
    Key? key,
    required this.items,
    required this.currentIndex,
    required this.onTap,
    this.backgroundColor,
    this.selectedItemColor,
    this.unselectedItemColor,
    this.height = 80,
    this.showLabels = true,
    this.enableHapticFeedback = true,
  }) : super(key: key);

  @override
  State<LunaBottomNavBar> createState() => _LunaBottomNavBarState();
}

class _LunaBottomNavBarState extends State<LunaBottomNavBar>
    with TickerProviderStateMixin {
  late List<AnimationController> _animationControllers;
  late List<Animation<double>> _scaleAnimations;
  late AnimationController _indicatorController;
  late Animation<double> _indicatorAnimation;

  @override
  void initState() {
    super.initState();
    
    _animationControllers = List.generate(
      widget.items.length,
      (index) => AnimationController(
        duration: const Duration(milliseconds: 200),
        vsync: this,
      ),
    );

    _scaleAnimations = _animationControllers.map((controller) {
      return Tween<double>(
        begin: 1.0,
        end: 1.2,
      ).animate(CurvedAnimation(
        parent: controller,
        curve: Curves.easeOutBack,
      ));
    }).toList();

    _indicatorController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );

    _indicatorAnimation = Tween<double>(
      begin: 0,
      end: widget.currentIndex.toDouble(),
    ).animate(CurvedAnimation(
      parent: _indicatorController,
      curve: Curves.easeInOut,
    ));

    // Animate the initially selected item
    if (widget.currentIndex < _animationControllers.length) {
      _animationControllers[widget.currentIndex].forward();
    }
  }

  @override
  void dispose() {
    for (final controller in _animationControllers) {
      controller.dispose();
    }
    _indicatorController.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(LunaBottomNavBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    
    if (oldWidget.currentIndex != widget.currentIndex) {
      // Animate indicator
      _indicatorAnimation = Tween<double>(
        begin: oldWidget.currentIndex.toDouble(),
        end: widget.currentIndex.toDouble(),
      ).animate(CurvedAnimation(
        parent: _indicatorController,
        curve: Curves.easeInOut,
      ));
      _indicatorController.forward(from: 0);

      // Animate items
      if (oldWidget.currentIndex < _animationControllers.length) {
        _animationControllers[oldWidget.currentIndex].reverse();
      }
      if (widget.currentIndex < _animationControllers.length) {
        _animationControllers[widget.currentIndex].forward();
      }
    }
  }

  void _handleTap(int index) {
    if (widget.enableHapticFeedback) {
      HapticFeedback.lightImpact();
    }
    widget.onTap(index);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor = widget.backgroundColor ??
        (isDark ? LunaColors.gray800 : LunaColors.white);
    final selectedColor = widget.selectedItemColor ??
        Theme.of(context).colorScheme.primary;
    final unselectedColor = widget.unselectedItemColor ??
        (isDark ? LunaColors.gray400 : LunaColors.gray500);

    return Container(
      height: widget.height,
      decoration: BoxDecoration(
        color: backgroundColor,
        boxShadow: [
          BoxShadow(
            color: LunaColors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Animated indicator
          AnimatedBuilder(
            animation: _indicatorAnimation,
            builder: (context, child) {
              return Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: LayoutBuilder(
                  builder: (context, constraints) {
                    final itemWidth = constraints.maxWidth / widget.items.length;
                    final indicatorPosition = _indicatorAnimation.value * itemWidth;
                    
                    return Transform.translate(
                      offset: Offset(indicatorPosition, 0),
                      child: Container(
                        width: itemWidth,
                        height: 3,
                        decoration: BoxDecoration(
                          gradient: LunaColors.cosmicGradient,
                          borderRadius: const BorderRadius.only(
                            bottomLeft: Radius.circular(3),
                            bottomRight: Radius.circular(3),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              );
            },
          ),
          // Nav items
          Row(
            children: List.generate(widget.items.length, (index) {
              final item = widget.items[index];
              final isSelected = index == widget.currentIndex;
              
              return Expanded(
                child: GestureDetector(
                  onTap: () => _handleTap(index),
                  behavior: HitTestBehavior.opaque,
                  child: Container(
                    color: Colors.transparent,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        AnimatedBuilder(
                          animation: _scaleAnimations[index],
                          builder: (context, child) {
                            return Transform.scale(
                              scale: _scaleAnimations[index].value,
                              child: Stack(
                                alignment: Alignment.center,
                                children: [
                                  // Glow effect for selected item
                                  if (isSelected)
                                    Container(
                                      width: 40,
                                      height: 40,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        gradient: RadialGradient(
                                          colors: [
                                            (item.color ?? selectedColor)
                                                .withOpacity(0.3),
                                            (item.color ?? selectedColor)
                                                .withOpacity(0.0),
                                          ],
                                        ),
                                      ),
                                    ),
                                  // Icon
                                  Icon(
                                    isSelected && item.activeIcon != null
                                        ? item.activeIcon
                                        : item.icon,
                                    color: isSelected
                                        ? (item.color ?? selectedColor)
                                        : unselectedColor,
                                    size: 24,
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                        if (widget.showLabels) ...[
                          const SizedBox(height: 4),
                          AnimatedDefaultTextStyle(
                            duration: const Duration(milliseconds: 200),
                            style: isSelected
                                ? LunaTypography.labelSmall(
                                    color: item.color ?? selectedColor,
                                  ).copyWith(fontWeight: FontWeight.w600)
                                : LunaTypography.labelSmall(
                                    color: unselectedColor,
                                  ),
                            child: Text(
                              item.label,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}

/// Floating action button that integrates with LunaBottomNavBar
class LunaFloatingNavButton extends StatefulWidget {
  final VoidCallback onPressed;
  final IconData icon;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final double size;
  final bool enableHapticFeedback;

  const LunaFloatingNavButton({
    Key? key,
    required this.onPressed,
    required this.icon,
    this.backgroundColor,
    this.foregroundColor,
    this.size = 56,
    this.enableHapticFeedback = true,
  }) : super(key: key);

  @override
  State<LunaFloatingNavButton> createState() => _LunaFloatingNavButtonState();
}

class _LunaFloatingNavButtonState extends State<LunaFloatingNavButton>
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

  void _handleTap() {
    if (widget.enableHapticFeedback) {
      HapticFeedback.mediumImpact();
    }
    widget.onPressed();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) {
        setState(() => _isPressed = true);
        _animationController.forward();
      },
      onTapUp: (_) {
        setState(() => _isPressed = false);
        _animationController.reverse();
        _handleTap();
      },
      onTapCancel: () {
        setState(() => _isPressed = false);
        _animationController.reverse();
      },
      child: AnimatedBuilder(
        animation: _scaleAnimation,
        builder: (context, child) {
          return Transform.scale(
            scale: _scaleAnimation.value,
            child: Container(
              width: widget.size,
              height: widget.size,
              decoration: BoxDecoration(
                gradient: LunaColors.cosmicGradient,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: LunaColors.cosmicPurple.withOpacity(0.4),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Icon(
                widget.icon,
                color: widget.foregroundColor ?? LunaColors.white,
                size: widget.size * 0.5,
              ),
            ),
          );
        },
      ),
    );
  }
}