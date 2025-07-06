import 'package:flutter/material.dart';
import 'core/theme/theme.dart';
import 'core/widgets/widgets.dart';
import 'core/icons/luna_icons.dart';
import 'core/painters/painters.dart';
import 'core/animations/luna_animations.dart';

/// Demo app to showcase LUNA design system components
class DesignSystemDemo extends StatefulWidget {
  const DesignSystemDemo({Key? key}) : super(key: key);

  @override
  State<DesignSystemDemo> createState() => _DesignSystemDemoState();
}

class _DesignSystemDemoState extends State<DesignSystemDemo> {
  ThemeMode _themeMode = ThemeMode.light;
  int _selectedNavIndex = 0;
  double _progressValue = 0.3;

  void _toggleTheme() {
    setState(() {
      _themeMode = _themeMode == ThemeMode.light 
          ? ThemeMode.dark 
          : ThemeMode.light;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'LUNA Design System',
      theme: LunaTheme.lightTheme,
      darkTheme: LunaTheme.darkTheme,
      themeMode: _themeMode,
      home: Scaffold(
        body: ConstellationBackground(
          child: SafeArea(
            child: CustomScrollView(
              slivers: [
                SliverAppBar(
                  title: Text(
                    'LUNA Design System',
                    style: LunaTypography.headlineMedium(),
                  ),
                  actions: [
                    IconButton(
                      icon: Icon(_themeMode == ThemeMode.light 
                          ? LunaIcons.newMoon 
                          : LunaIcons.fullMoon),
                      onPressed: _toggleTheme,
                    ),
                  ],
                  floating: true,
                  backgroundColor: Colors.transparent,
                  elevation: 0,
                ),
                SliverPadding(
                  padding: const EdgeInsets.all(16),
                  sliver: SliverList(
                    delegate: SliverChildListDelegate([
                      _buildSection(
                        'Typography',
                        _buildTypographyDemo(),
                      ),
                      _buildSection(
                        'Buttons',
                        _buildButtonsDemo(),
                      ),
                      _buildSection(
                        'Cards',
                        _buildCardsDemo(),
                      ),
                      _buildSection(
                        'Chat Bubbles',
                        _buildChatBubblesDemo(),
                      ),
                      _buildSection(
                        'Progress Indicators',
                        _buildProgressIndicatorsDemo(),
                      ),
                      _buildSection(
                        'Icons',
                        _buildIconsDemo(),
                      ),
                      _buildSection(
                        'Animations',
                        _buildAnimationsDemo(),
                      ),
                      const SizedBox(height: 100),
                    ]),
                  ),
                ),
              ],
            ),
          ),
        ),
        bottomNavigationBar: LunaBottomNavBar(
          currentIndex: _selectedNavIndex,
          onTap: (index) => setState(() => _selectedNavIndex = index),
          items: const [
            LunaBottomNavItem(
              icon: LunaIcons.home,
              label: 'Home',
            ),
            LunaBottomNavItem(
              icon: LunaIcons.discover,
              label: 'Discover',
            ),
            LunaBottomNavItem(
              icon: LunaIcons.insights,
              label: 'Insights',
            ),
            LunaBottomNavItem(
              icon: LunaIcons.journal,
              label: 'Journal',
            ),
            LunaBottomNavItem(
              icon: LunaIcons.profile,
              label: 'Profile',
            ),
          ],
        ),
        floatingActionButton: LunaFloatingNavButton(
          icon: LunaIcons.add,
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Floating button pressed!')),
            );
          },
        ),
        floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      ),
    );
  }

  Widget _buildSection(String title, Widget content) {
    return LunaAnimations.fadeSlideIn(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: Text(
              title,
              style: LunaTypography.headlineSmall(),
            ),
          ),
          content,
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildTypographyDemo() {
    return LunaCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Display Large', style: LunaTypography.displayLarge()),
          Text('Display Medium', style: LunaTypography.displayMedium()),
          Text('Display Small', style: LunaTypography.displaySmall()),
          const Divider(height: 32),
          Text('Headline Large', style: LunaTypography.headlineLarge()),
          Text('Headline Medium', style: LunaTypography.headlineMedium()),
          Text('Headline Small', style: LunaTypography.headlineSmall()),
          const Divider(height: 32),
          Text('Body Large', style: LunaTypography.bodyLarge()),
          Text('Body Medium', style: LunaTypography.bodyMedium()),
          Text('Body Small', style: LunaTypography.bodySmall()),
          const Divider(height: 32),
          Text('Accent Large', style: LunaTypography.accentLarge()),
          Text('Accent Medium', style: LunaTypography.accentMedium()),
          Text('Accent Small', style: LunaTypography.accentSmall()),
        ],
      ),
    );
  }

  Widget _buildButtonsDemo() {
    return Column(
      children: [
        Wrap(
          spacing: 16,
          runSpacing: 16,
          children: [
            LunaButton(
              text: 'Primary',
              onPressed: () {},
              variant: LunaButtonVariant.primary,
            ),
            LunaButton(
              text: 'Secondary',
              onPressed: () {},
              variant: LunaButtonVariant.secondary,
            ),
            LunaButton(
              text: 'Accent',
              onPressed: () {},
              variant: LunaButtonVariant.accent,
            ),
            LunaButton(
              text: 'Ghost',
              onPressed: () {},
              variant: LunaButtonVariant.ghost,
            ),
            LunaButton(
              text: 'Outline',
              onPressed: () {},
              variant: LunaButtonVariant.outline,
            ),
          ],
        ),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            LunaButton(
              text: 'Small',
              onPressed: () {},
              size: LunaButtonSize.small,
            ),
            LunaButton(
              text: 'Medium',
              onPressed: () {},
              size: LunaButtonSize.medium,
            ),
            LunaButton(
              text: 'Large',
              onPressed: () {},
              size: LunaButtonSize.large,
            ),
          ],
        ),
        const SizedBox(height: 16),
        LunaButton(
          text: 'Full Width Button',
          onPressed: () {},
          fullWidth: true,
        ),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            LunaButton(
              text: 'With Icon',
              icon: const Icon(LunaIcons.star),
              onPressed: () {},
            ),
            LunaButton(
              text: 'Loading',
              isLoading: true,
              onPressed: () {},
            ),
            LunaButton(
              text: 'Disabled',
              onPressed: null,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildCardsDemo() {
    return Column(
      children: [
        LunaCard(
          variant: LunaCardVariant.filled,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Filled Card', style: LunaTypography.titleLarge()),
              const SizedBox(height: 8),
              Text(
                'This is a filled card with standard styling.',
                style: LunaTypography.bodyMedium(),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        LunaCard(
          variant: LunaCardVariant.outlined,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Outlined Card', style: LunaTypography.titleLarge()),
              const SizedBox(height: 8),
              Text(
                'This is an outlined card with border styling.',
                style: LunaTypography.bodyMedium(),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        LunaCard(
          variant: LunaCardVariant.gradient,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Gradient Border Card', style: LunaTypography.titleLarge()),
              const SizedBox(height: 8),
              Text(
                'This card has a beautiful gradient border.',
                style: LunaTypography.bodyMedium(),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        LunaHeaderCard(
          header: Text('Header Card', style: LunaTypography.titleMedium()),
          content: Text(
            'This card has a distinct header section.',
            style: LunaTypography.bodyMedium(),
          ),
          variant: LunaCardVariant.gradient,
        ),
      ],
    );
  }

  Widget _buildChatBubblesDemo() {
    return Column(
      children: [
        LunaChatBubble(
          message: 'Hello! This is a sent message.',
          type: LunaChatBubbleType.sent,
          timestamp: DateTime.now(),
          avatarInitials: 'ME',
        ),
        LunaChatBubble(
          message: 'And this is a received message with a longer text to show how it wraps.',
          type: LunaChatBubbleType.received,
          timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
          avatarInitials: 'AI',
        ),
        LunaChatBubble(
          message: 'Messages in a group...',
          type: LunaChatBubbleType.received,
          isFirstInGroup: true,
          isLastInGroup: false,
          showAvatar: false,
          avatarInitials: 'AI',
        ),
        LunaChatBubble(
          message: '...have connected bubbles.',
          type: LunaChatBubbleType.received,
          isFirstInGroup: false,
          isLastInGroup: true,
          avatarInitials: 'AI',
        ),
        const LunaTypingIndicator(
          type: LunaChatBubbleType.received,
          avatarInitials: 'AI',
        ),
      ],
    );
  }

  Widget _buildProgressIndicatorsDemo() {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            Column(
              children: [
                const LunaProgressIndicator(
                  type: LunaProgressType.circular,
                ),
                const SizedBox(height: 8),
                Text('Circular', style: LunaTypography.labelSmall()),
              ],
            ),
            Column(
              children: [
                LunaProgressIndicator(
                  type: LunaProgressType.circular,
                  value: _progressValue,
                  label: '${(_progressValue * 100).toInt()}%',
                ),
                const SizedBox(height: 8),
                Text('With Value', style: LunaTypography.labelSmall()),
              ],
            ),
            Column(
              children: [
                const LunaProgressIndicator(
                  type: LunaProgressType.constellation,
                  size: 60,
                ),
                const SizedBox(height: 8),
                Text('Constellation', style: LunaTypography.labelSmall()),
              ],
            ),
          ],
        ),
        const SizedBox(height: 32),
        LunaProgressIndicator(
          type: LunaProgressType.linear,
          value: _progressValue,
          label: 'Loading Progress',
        ),
        const SizedBox(height: 16),
        const LunaProgressIndicator(
          type: LunaProgressType.linear,
          label: 'Indeterminate Progress',
        ),
        const SizedBox(height: 16),
        Slider(
          value: _progressValue,
          onChanged: (value) => setState(() => _progressValue = value),
          activeColor: LunaColors.primary,
        ),
      ],
    );
  }

  Widget _buildIconsDemo() {
    return Wrap(
      spacing: 24,
      runSpacing: 24,
      children: [
        _buildIconItem('New Moon', LunaIcons.newMoon),
        _buildIconItem('Full Moon', LunaIcons.fullMoon),
        _buildIconItem('Stars', LunaIcons.stars),
        _buildIconItem('Constellation', LunaIcons.constellation),
        _buildIconItem('Magic', LunaIcons.magic),
        _buildIconItem('Crystal', LunaIcons.crystal),
        _buildIconItem('Meditation', LunaIcons.meditation),
        _buildIconItem('Energy', LunaIcons.energy),
        _buildIconItem('Aurora', LunaIcons.aurora),
        _buildIconItem('Compass', LunaIcons.compass),
        _buildIconItem('Third Eye', LunaIcons.thirdEye),
        _buildIconItem('Infinity', LunaIcons.infinity),
      ],
    );
  }

  Widget _buildIconItem(String label, IconData icon) {
    return Column(
      children: [
        LunaIcon(
          icon: icon,
          size: 32,
          showGlow: true,
          color: LunaColors.primary,
        ),
        const SizedBox(height: 4),
        Text(label, style: LunaTypography.labelSmall()),
      ],
    );
  }

  Widget _buildAnimationsDemo() {
    return Column(
      children: [
        LunaPulseAnimation(
          child: LunaCard(
            variant: LunaCardVariant.gradient,
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Text(
                  'Pulse Animation',
                  style: LunaTypography.titleLarge(),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 16),
        LunaShimmerAnimation(
          baseColor: LunaColors.gray300,
          highlightColor: LunaColors.gray100,
          child: Container(
            height: 100,
            decoration: BoxDecoration(
              color: LunaColors.gray300,
              borderRadius: BorderRadius.circular(20),
            ),
          ),
        ),
        const SizedBox(height: 16),
        const AnimatedGradientContainer(
          colors: LunaColors.cosmicGradient.colors,
          height: 100,
          child: Center(
            child: Text(
              'Animated Gradient',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

void main() {
  runApp(const DesignSystemDemo());
}