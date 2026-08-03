import 'package:flutter/material.dart';

import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/skeleton_box.dart';
import '../subscription/paywall_screen.dart';

/// Sezione Profilo/Abbonamento (S20-S21, docs/product-design FASE 6).
/// Impostazioni account complete non ancora implementate (FASE 9 M3.1) —
/// qui solo lo stato dell'abbonamento e l'accesso al paywall.
class ProfileTab extends StatefulWidget {
  const ProfileTab({super.key, required this.athleteId});

  final String athleteId;

  @override
  State<ProfileTab> createState() => _ProfileTabState();
}

class _ProfileTabState extends State<ProfileTab> {
  final _apiClient = ApiClient();
  bool _isLoading = true;
  Map<String, dynamic>? _subscription;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    final subscription = await _apiClient.getCurrentSubscription(widget.athleteId);
    if (!mounted) return;
    setState(() {
      _subscription = subscription;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Padding(
        padding: EdgeInsets.all(AppSpacing.lg),
        child: SkeletonBox(height: 96),
      );
    }

    final planName = (_subscription?['plan'] as Map<String, dynamic>?)?['name'] as String? ?? 'Free';

    return Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Card(
        child: ListTile(
          leading: const Icon(Icons.workspace_premium_outlined, color: AppColors.navy),
          title: Text('Piano attuale: $planName'),
          subtitle: const Text('Tocca per gestire il tuo abbonamento'),
          trailing: const Icon(Icons.chevron_right),
          onTap: () {
            Navigator.of(context)
                .push(MaterialPageRoute(builder: (_) => PaywallScreen(athleteId: widget.athleteId)))
                .then((_) => _load());
          },
        ),
      ),
    );
  }
}
