import 'package:flutter/material.dart';
import '../theme/luna_colors.dart';
import '../theme/luna_typography.dart';

enum LunaChatBubbleType { sent, received }

/// iMessage-style chat bubble with avatar support
class LunaChatBubble extends StatelessWidget {
  final String message;
  final LunaChatBubbleType type;
  final DateTime? timestamp;
  final String? avatarUrl;
  final String? avatarInitials;
  final bool showAvatar;
  final bool isFirstInGroup;
  final bool isLastInGroup;
  final Widget? footer;
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;

  const LunaChatBubble({
    Key? key,
    required this.message,
    required this.type,
    this.timestamp,
    this.avatarUrl,
    this.avatarInitials,
    this.showAvatar = true,
    this.isFirstInGroup = true,
    this.isLastInGroup = true,
    this.footer,
    this.onTap,
    this.onLongPress,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isSent = type == LunaChatBubbleType.sent;

    return Padding(
      padding: EdgeInsets.only(
        left: isSent ? 48 : 8,
        right: isSent ? 8 : 48,
        top: isFirstInGroup ? 8 : 2,
        bottom: isLastInGroup ? 8 : 2,
      ),
      child: Row(
        mainAxisAlignment:
            isSent ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isSent && showAvatar && isLastInGroup) ...[
            _buildAvatar(context),
            const SizedBox(width: 8),
          ] else if (!isSent && showAvatar) ...[
            const SizedBox(width: 40),
          ],
          Flexible(
            child: Column(
              crossAxisAlignment:
                  isSent ? CrossAxisAlignment.end : CrossAxisAlignment.start,
              children: [
                GestureDetector(
                  onTap: onTap,
                  onLongPress: onLongPress,
                  child: Container(
                    constraints: BoxConstraints(
                      maxWidth: MediaQuery.of(context).size.width * 0.7,
                    ),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 10,
                    ),
                    decoration: BoxDecoration(
                      gradient: isSent
                          ? LunaColors.primaryGradient
                          : null,
                      color: !isSent
                          ? (isDark ? LunaColors.gray700 : LunaColors.gray200)
                          : null,
                      borderRadius: BorderRadius.only(
                        topLeft: Radius.circular(isFirstInGroup ? 20 : 20),
                        topRight: Radius.circular(isFirstInGroup ? 20 : 20),
                        bottomLeft: Radius.circular(
                          isSent || !isLastInGroup ? 20 : 4,
                        ),
                        bottomRight: Radius.circular(
                          !isSent || !isLastInGroup ? 20 : 4,
                        ),
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: LunaColors.black.withOpacity(0.1),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Text(
                      message,
                      style: LunaTypography.bodyMedium(
                        color: isSent
                            ? LunaColors.white
                            : (isDark ? LunaColors.gray100 : LunaColors.gray800),
                      ),
                    ),
                  ),
                ),
                if (footer != null || (timestamp != null && isLastInGroup))
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: footer ?? _buildTimestamp(context),
                  ),
              ],
            ),
          ),
          if (isSent && showAvatar && isLastInGroup) ...[
            const SizedBox(width: 8),
            _buildAvatar(context),
          ] else if (isSent && showAvatar) ...[
            const SizedBox(width: 40),
          ],
        ],
      ),
    );
  }

  Widget _buildAvatar(BuildContext context) {
    if (avatarUrl != null) {
      return CircleAvatar(
        radius: 16,
        backgroundImage: NetworkImage(avatarUrl!),
      );
    }

    if (avatarInitials != null) {
      return CircleAvatar(
        radius: 16,
        backgroundColor: type == LunaChatBubbleType.sent
            ? LunaColors.primary
            : LunaColors.secondary,
        child: Text(
          avatarInitials!,
          style: LunaTypography.labelSmall(color: LunaColors.white),
        ),
      );
    }

    return CircleAvatar(
      radius: 16,
      backgroundColor: type == LunaChatBubbleType.sent
          ? LunaColors.primary
          : LunaColors.secondary,
      child: Icon(
        Icons.person,
        size: 16,
        color: LunaColors.white,
      ),
    );
  }

  Widget _buildTimestamp(BuildContext context) {
    if (timestamp == null) return const SizedBox.shrink();

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final time = _formatTime(timestamp!);

    return Text(
      time,
      style: LunaTypography.labelSmall(
        color: isDark ? LunaColors.gray400 : LunaColors.gray500,
      ),
    );
  }

  String _formatTime(DateTime dateTime) {
    final hour = dateTime.hour;
    final minute = dateTime.minute.toString().padLeft(2, '0');
    final period = hour >= 12 ? 'PM' : 'AM';
    final displayHour = hour > 12 ? hour - 12 : (hour == 0 ? 12 : hour);
    
    return '$displayHour:$minute $period';
  }
}

/// A typing indicator bubble
class LunaTypingIndicator extends StatefulWidget {
  final LunaChatBubbleType type;
  final String? avatarUrl;
  final String? avatarInitials;

  const LunaTypingIndicator({
    Key? key,
    this.type = LunaChatBubbleType.received,
    this.avatarUrl,
    this.avatarInitials,
  }) : super(key: key);

  @override
  State<LunaTypingIndicator> createState() => _LunaTypingIndicatorState();
}

class _LunaTypingIndicatorState extends State<LunaTypingIndicator>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late List<Animation<double>> _dotAnimations;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat();

    _dotAnimations = List.generate(3, (index) {
      return Tween<double>(
        begin: 0.0,
        end: 1.0,
      ).animate(
        CurvedAnimation(
          parent: _animationController,
          curve: Interval(
            index * 0.2,
            0.6 + index * 0.2,
            curve: Curves.easeInOut,
          ),
        ),
      );
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return LunaChatBubble(
      message: '',
      type: widget.type,
      avatarUrl: widget.avatarUrl,
      avatarInitials: widget.avatarInitials,
      footer: SizedBox(
        height: 30,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(3, (index) {
            return AnimatedBuilder(
              animation: _dotAnimations[index],
              builder: (context, child) {
                return Container(
                  margin: const EdgeInsets.symmetric(horizontal: 2),
                  child: Transform.translate(
                    offset: Offset(0, -10 * _dotAnimations[index].value),
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: widget.type == LunaChatBubbleType.sent
                            ? LunaColors.white.withOpacity(0.8)
                            : LunaColors.gray500,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                );
              },
            );
          }),
        ),
      ),
    );
  }
}