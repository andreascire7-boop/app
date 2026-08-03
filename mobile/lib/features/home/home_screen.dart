import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../../core/widgets/empty_state.dart';
import '../../core/widgets/skeleton_box.dart';

/// S6 (docs/product-design FASE 6): bottom nav Home · Programma · Nutrizione ·
/// Profilo. Home shows a loading skeleton, then either today's session or a
/// positive empty state on rest days — never a blank screen.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final tabs = [
      const _HomeTab(),
      const _PlaceholderTab(
        title: 'Programma',
        subtitle: 'Timeline macro/meso/microciclo — in arrivo (milestone M1.2, FASE 9).',
      ),
      const _PlaceholderTab(
        title: 'Nutrizione',
        subtitle: 'Hub nutrizionale — in arrivo (milestone M2.5, FASE 9).',
      ),
      const _PlaceholderTab(
        title: 'Profilo',
        subtitle: 'Impostazioni account e abbonamento — in arrivo (milestone M3.1, FASE 9).',
      ),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('S&C Intelligence')),
      body: IndexedStack(index: _selectedIndex, children: tabs),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_outlined), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.fitness_center_outlined), label: 'Programma'),
          BottomNavigationBarItem(icon: Icon(Icons.restaurant_outlined), label: 'Nutrizione'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: 'Profilo'),
        ],
      ),
    );
  }
}

class _HomeTab extends StatefulWidget {
  const _HomeTab();

  @override
  State<_HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<_HomeTab> {
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    // TODO(M1.1-M1.2): replace with a real call to the Core API for today's
    // readiness score and planned session (docs/product-design F2/F7).
    await Future.delayed(const Duration(milliseconds: 800));
    if (!mounted) return;
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Padding(
        padding: EdgeInsets.all(AppSpacing.lg),
        child: Column(
          children: [
            SkeletonBox(height: 96),
            SizedBox(height: AppSpacing.md),
            SkeletonBox(height: 140),
          ],
        ),
      );
    }

    return Center(
      child: EmptyState(
        icon: Icons.self_improvement,
        title: 'Oggi è un giorno di riposo pianificato',
        message: 'Il tuo prossimo allenamento è programmato per domani. '
            'Ne approfitti per il recupero: priorità al sonno.',
      ),
    );
  }
}

class _PlaceholderTab extends StatelessWidget {
  const _PlaceholderTab({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: EmptyState(icon: Icons.hourglass_empty, title: title, message: subtitle),
    );
  }
}
