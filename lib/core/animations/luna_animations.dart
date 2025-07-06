import 'package:flutter/material.dart';

/// Collection of animation utilities for LUNA app
class LunaAnimations {
  LunaAnimations._();

  // Standard durations
  static const Duration fast = Duration(milliseconds: 200);
  static const Duration normal = Duration(milliseconds: 300);
  static const Duration slow = Duration(milliseconds: 500);
  static const Duration verySlow = Duration(milliseconds: 1000);

  // Standard curves
  static const Curve defaultCurve = Curves.easeInOut;
  static const Curve bounceCurve = Curves.bounceOut;
  static const Curve elasticCurve = Curves.elasticOut;
  static const Curve smoothCurve = Curves.easeOutCubic;

  /// Fade in animation widget
  static Widget fadeIn({
    required Widget child,
    Duration duration = normal,
    Curve curve = defaultCurve,
    Duration? delay,
    Key? key,
  }) {
    return _DelayedAnimation(
      delay: delay,
      child: TweenAnimationBuilder<double>(
        key: key,
        tween: Tween(begin: 0.0, end: 1.0),
        duration: duration,
        curve: curve,
        builder: (context, value, child) {
          return Opacity(
            opacity: value,
            child: child,
          );
        },
        child: child,
      ),
    );
  }

  /// Slide in animation widget
  static Widget slideIn({
    required Widget child,
    Duration duration = normal,
    Curve curve = defaultCurve,
    Offset begin = const Offset(0, 0.1),
    Offset end = Offset.zero,
    Duration? delay,
    Key? key,
  }) {
    return _DelayedAnimation(
      delay: delay,
      child: TweenAnimationBuilder<Offset>(
        key: key,
        tween: Tween(begin: begin, end: end),
        duration: duration,
        curve: curve,
        builder: (context, value, child) {
          return Transform.translate(
            offset: Offset(
              value.dx * MediaQuery.of(context).size.width,
              value.dy * MediaQuery.of(context).size.height,
            ),
            child: child,
          );
        },
        child: child,
      ),
    );
  }

  /// Scale animation widget
  static Widget scale({
    required Widget child,
    Duration duration = normal,
    Curve curve = defaultCurve,
    double begin = 0.0,
    double end = 1.0,
    Duration? delay,
    Key? key,
  }) {
    return _DelayedAnimation(
      delay: delay,
      child: TweenAnimationBuilder<double>(
        key: key,
        tween: Tween(begin: begin, end: end),
        duration: duration,
        curve: curve,
        builder: (context, value, child) {
          return Transform.scale(
            scale: value,
            child: child,
          );
        },
        child: child,
      ),
    );
  }

  /// Combined fade and slide animation
  static Widget fadeSlideIn({
    required Widget child,
    Duration duration = normal,
    Curve curve = defaultCurve,
    Offset slideBegin = const Offset(0, 0.05),
    Duration? delay,
    Key? key,
  }) {
    return _DelayedAnimation(
      delay: delay,
      child: TweenAnimationBuilder<double>(
        key: key,
        tween: Tween(begin: 0.0, end: 1.0),
        duration: duration,
        curve: curve,
        builder: (context, value, child) {
          return Opacity(
            opacity: value,
            child: Transform.translate(
              offset: Offset(
                slideBegin.dx * (1 - value) * MediaQuery.of(context).size.width,
                slideBegin.dy * (1 - value) * MediaQuery.of(context).size.height,
              ),
              child: child,
            ),
          );
        },
        child: child,
      ),
    );
  }

  /// Staggered list animation
  static Widget staggeredList({
    required List<Widget> children,
    Duration itemDuration = fast,
    Duration staggerDelay = const Duration(milliseconds: 50),
    Curve curve = defaultCurve,
    Key? key,
  }) {
    return Column(
      key: key,
      children: List.generate(children.length, (index) {
        return fadeSlideIn(
          child: children[index],
          duration: itemDuration,
          curve: curve,
          delay: staggerDelay * index,
        );
      }),
    );
  }

  /// Page transition animation
  static PageRouteBuilder<T> pageTransition<T>({
    required Widget page,
    Duration duration = normal,
    Curve curve = defaultCurve,
    LunaPageTransitionType type = LunaPageTransitionType.fadeScale,
  }) {
    return PageRouteBuilder<T>(
      pageBuilder: (context, animation, secondaryAnimation) => page,
      transitionDuration: duration,
      reverseTransitionDuration: duration,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        switch (type) {
          case LunaPageTransitionType.fade:
            return FadeTransition(
              opacity: animation.drive(CurveTween(curve: curve)),
              child: child,
            );
            
          case LunaPageTransitionType.slide:
            return SlideTransition(
              position: animation.drive(
                Tween(
                  begin: const Offset(1.0, 0.0),
                  end: Offset.zero,
                ).chain(CurveTween(curve: curve)),
              ),
              child: child,
            );
            
          case LunaPageTransitionType.scale:
            return ScaleTransition(
              scale: animation.drive(
                Tween(begin: 0.8, end: 1.0).chain(CurveTween(curve: curve)),
              ),
              child: child,
            );
            
          case LunaPageTransitionType.fadeScale:
            return FadeTransition(
              opacity: animation.drive(CurveTween(curve: curve)),
              child: ScaleTransition(
                scale: animation.drive(
                  Tween(begin: 0.9, end: 1.0).chain(CurveTween(curve: curve)),
                ),
                child: child,
              ),
            );
            
          case LunaPageTransitionType.rotation:
            return RotationTransition(
              turns: animation.drive(
                Tween(begin: 0.5, end: 1.0).chain(CurveTween(curve: curve)),
              ),
              child: FadeTransition(
                opacity: animation,
                child: child,
              ),
            );
        }
      },
    );
  }
}

enum LunaPageTransitionType {
  fade,
  slide,
  scale,
  fadeScale,
  rotation,
}

/// Helper widget for delayed animations
class _DelayedAnimation extends StatefulWidget {
  final Widget child;
  final Duration? delay;

  const _DelayedAnimation({
    Key? key,
    required this.child,
    this.delay,
  }) : super(key: key);

  @override
  State<_DelayedAnimation> createState() => _DelayedAnimationState();
}

class _DelayedAnimationState extends State<_DelayedAnimation> {
  bool _show = false;

  @override
  void initState() {
    super.initState();
    if (widget.delay == null) {
      _show = true;
    } else {
      Future.delayed(widget.delay!, () {
        if (mounted) {
          setState(() {
            _show = true;
          });
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return _show ? widget.child : const SizedBox.shrink();
  }
}

/// Pulse animation widget
class LunaPulseAnimation extends StatefulWidget {
  final Widget child;
  final Duration duration;
  final double minScale;
  final double maxScale;

  const LunaPulseAnimation({
    Key? key,
    required this.child,
    this.duration = const Duration(seconds: 2),
    this.minScale = 0.95,
    this.maxScale = 1.05,
  }) : super(key: key);

  @override
  State<LunaPulseAnimation> createState() => _LunaPulseAnimationState();
}

class _LunaPulseAnimationState extends State<LunaPulseAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.duration,
      vsync: this,
    )..repeat(reverse: true);

    _scaleAnimation = Tween<double>(
      begin: widget.minScale,
      end: widget.maxScale,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _scaleAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: widget.child,
        );
      },
    );
  }
}

/// Shimmer animation widget
class LunaShimmerAnimation extends StatefulWidget {
  final Widget child;
  final Duration duration;
  final Color baseColor;
  final Color highlightColor;

  const LunaShimmerAnimation({
    Key? key,
    required this.child,
    this.duration = const Duration(seconds: 1.5),
    this.baseColor = const Color(0xFFE0E0E0),
    this.highlightColor = const Color(0xFFF5F5F5),
  }) : super(key: key);

  @override
  State<LunaShimmerAnimation> createState() => _LunaShimmerAnimationState();
}

class _LunaShimmerAnimationState extends State<LunaShimmerAnimation>
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
        return ShaderMask(
          shaderCallback: (bounds) {
            return LinearGradient(
              colors: [
                widget.baseColor,
                widget.highlightColor,
                widget.baseColor,
              ],
              stops: const [0.0, 0.5, 1.0],
              begin: Alignment(-1.0 + 2.0 * _controller.value, 0.0),
              end: Alignment(1.0 + 2.0 * _controller.value, 0.0),
            ).createShader(bounds);
          },
          child: widget.child,
        );
      },
    );
  }
}