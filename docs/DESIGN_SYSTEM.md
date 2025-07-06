# LUNA Design System Documentation

## Overview
The LUNA design system provides a cohesive set of UI components, themes, and utilities for building a mystical, cosmic-themed mobile application. The system emphasizes smooth animations, gradient effects, and celestial visual elements.

## Color Palette

### Primary Colors
- **Primary**: `#6B46C1` - Deep purple
- **Secondary**: `#EC4899` - Vibrant pink
- **Accent**: `#F59E0B` - Warm amber

### Cosmic Colors
- **Cosmic Purple**: `#7C3AED`
- **Cosmic Pink**: `#E879F9`
- **Cosmic Blue**: `#60A5FA`
- **Star Yellow**: `#FDE047`
- **Moon Glow**: `#F3F4F6`

### Gradients
- **Primary Gradient**: Primary → Cosmic Purple
- **Secondary Gradient**: Secondary → Cosmic Pink
- **Cosmic Gradient**: Cosmic Purple → Cosmic Pink → Cosmic Blue
- **Night Sky Gradient**: Dark gradient for backgrounds

## Typography

### Font Families
- **Headers**: Playfair Display (serif)
- **Body**: Inter (sans-serif)
- **Accent**: Dancing Script (cursive)

### Text Styles
The typography system includes:
- Display (Large, Medium, Small)
- Headline (Large, Medium, Small)
- Title (Large, Medium, Small)
- Body (Large, Medium, Small)
- Label (Large, Medium, Small)
- Accent (Large, Medium, Small)

## Components

### LunaButton
A customizable button with gradient fills and haptic feedback.

```dart
LunaButton(
  text: 'Click Me',
  onPressed: () {},
  variant: LunaButtonVariant.primary,
  size: LunaButtonSize.medium,
  icon: Icon(LunaIcons.star),
  isLoading: false,
  fullWidth: false,
)
```

**Variants:**
- `primary` - Primary gradient background
- `secondary` - Secondary gradient background
- `accent` - Accent gradient background
- `ghost` - Transparent background
- `outline` - Border only

**Sizes:**
- `small`, `medium`, `large`

### LunaCard
A versatile card component with rounded corners and optional gradient borders.

```dart
LunaCard(
  variant: LunaCardVariant.gradient,
  child: Text('Card Content'),
  borderRadius: 20.0,
  onTap: () {},
)
```

**Variants:**
- `filled` - Solid background
- `outlined` - Border outline
- `gradient` - Gradient border

### LunaChatBubble
iMessage-style chat bubbles with avatar support.

```dart
LunaChatBubble(
  message: 'Hello!',
  type: LunaChatBubbleType.sent,
  timestamp: DateTime.now(),
  avatarInitials: 'JD',
  showAvatar: true,
)
```

**Features:**
- Sent/received message types
- Avatar support (image or initials)
- Timestamp display
- Message grouping
- Typing indicator animation

### LunaProgressIndicator
Progress indicators with constellation animations.

```dart
LunaProgressIndicator(
  type: LunaProgressType.constellation,
  value: 0.5, // Optional for determinate
  size: 48.0,
)
```

**Types:**
- `circular` - Standard circular progress
- `linear` - Horizontal progress bar
- `constellation` - Animated star constellation

### LunaBottomNavBar
Custom bottom navigation with cosmic design.

```dart
LunaBottomNavBar(
  currentIndex: 0,
  onTap: (index) {},
  items: [
    LunaBottomNavItem(
      icon: LunaIcons.home,
      label: 'Home',
    ),
  ],
)
```

**Features:**
- Animated selection indicator
- Icon scaling animation
- Haptic feedback
- Optional labels
- Floating action button support

## Custom Painters

### ConstellationBackgroundPainter
Creates animated starfield backgrounds with constellation connections.

```dart
ConstellationBackground(
  starCount: 50,
  showGradient: true,
  animationSpeed: 0.5,
  child: YourContent(),
)
```

### GradientPainter
Supports various gradient effects:
- Linear gradients
- Radial gradients
- Sweep gradients
- Animated color-shifting gradients
- Mesh gradients

## Animations

### LunaAnimations Utility Class
Provides common animation patterns:

```dart
// Fade in
LunaAnimations.fadeIn(
  child: YourWidget(),
  duration: LunaAnimations.normal,
)

// Slide in
LunaAnimations.slideIn(
  child: YourWidget(),
  begin: Offset(0, 0.1),
)

// Combined fade and slide
LunaAnimations.fadeSlideIn(
  child: YourWidget(),
)

// Staggered list
LunaAnimations.staggeredList(
  children: widgets,
  staggerDelay: Duration(milliseconds: 50),
)
```

### Animation Widgets
- **LunaPulseAnimation**: Gentle pulsing effect
- **LunaShimmerAnimation**: Loading shimmer effect
- **AnimatedGradientContainer**: Animated gradient backgrounds

## Icons

### LunaIcons
A curated set of lunar and astrology-themed icons:

**Moon Phases:**
- `newMoon`, `crescentMoon`, `halfMoon`, `fullMoon`, `waningMoon`

**Celestial:**
- `star`, `stars`, `constellation`, `galaxy`, `sun`, `planet`, `comet`

**Mystical:**
- `magic`, `sparkle`, `crystal`, `tarot`, `oracle`, `meditation`

**Navigation:**
- `home`, `discover`, `insights`, `journal`, `profile`, `settings`

### LunaIcon Widget
Enhanced icon widget with glow effects:

```dart
LunaIcon(
  icon: LunaIcons.star,
  size: 32,
  showGlow: true,
  glowRadius: 8.0,
  color: LunaColors.starYellow,
)
```

## Theme Configuration

### Light Theme
- Clean white backgrounds
- Subtle shadows
- Vibrant accent colors
- High contrast text

### Dark Theme
- Deep gray backgrounds
- Cosmic color palette
- Glowing effects
- Reduced eye strain

### Theme Switching
```dart
MaterialApp(
  theme: LunaTheme.lightTheme,
  darkTheme: LunaTheme.darkTheme,
  themeMode: ThemeMode.system,
)
```

## Usage Guidelines

### 1. Consistency
- Always use the predefined color palette
- Stick to the typography system
- Maintain consistent spacing (8pt grid)

### 2. Accessibility
- Ensure sufficient color contrast
- Provide haptic feedback for interactions
- Support both light and dark themes

### 3. Performance
- Use animations sparingly
- Optimize gradient usage
- Lazy load heavy visual effects

### 4. Responsive Design
- Components adapt to screen size
- Text scales appropriately
- Touch targets meet minimum size requirements (44x44)

## Demo Application
Run the design system demo to see all components in action:

```dart
import 'package:luna/design_system_demo.dart';

void main() {
  runApp(const DesignSystemDemo());
}
```

The demo showcases:
- All component variants
- Theme switching
- Animation examples
- Interactive elements
- Responsive layouts