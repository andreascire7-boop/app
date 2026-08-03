import 'package:flutter/material.dart';

import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/error_state.dart';
import '../../core/widgets/skeleton_box.dart';

const _tierFeatures = {
  'FREE': ['Piano base statico', 'Nessun adattamento AI completo'],
  'PREMIUM': ['Motore AI completo', 'Calendario gare e tapering', 'Nutrizione', 'Prevenzione infortuni'],
  'PRO': ['Tutto Premium', 'Supporto prioritario', 'Export dati per il coach'],
  'B2B': ['Dashboard multi-atleta', 'Alert di rischio aggregati'],
};

/// S21 (docs/product-design FASE 6): feature bloccate mostrate ma disattivate
/// nel piano Free — trasparente, non nascosto. NOTA: nessun addebito reale
/// avviene qui — vedi mobile/README.md e backend SubscriptionsService.
class PaywallScreen extends StatefulWidget {
  const PaywallScreen({super.key, required this.athleteId});

  final String athleteId;

  @override
  State<PaywallScreen> createState() => _PaywallScreenState();
}

class _PaywallScreenState extends State<PaywallScreen> {
  final _apiClient = ApiClient();
  bool _isLoading = true;
  String? _error;
  List<dynamic> _plans = [];
  String? _currentPlanId;
  String? _subscribingPlanId;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final results = await Future.wait([
        _apiClient.listPlans(),
        _apiClient.getCurrentSubscription(widget.athleteId),
      ]);
      final plans = results[0] as List<dynamic>;
      final current = results[1] as Map<String, dynamic>?;
      if (!mounted) return;
      setState(() {
        _plans = plans;
        _currentPlanId = current?['planId'] as String?;
        _isLoading = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.message;
        _isLoading = false;
      });
    }
  }

  Future<void> _subscribe(String planId) async {
    setState(() => _subscribingPlanId = planId);
    try {
      await _apiClient.subscribeToPlan(athleteId: widget.athleteId, planId: planId);
      await _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Piano aggiornato.')),
      );
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _subscribingPlanId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Abbonamento')),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Padding(
        padding: EdgeInsets.all(AppSpacing.lg),
        child: Column(children: [SkeletonBox(height: 160), SizedBox(height: AppSpacing.sm), SkeletonBox(height: 160)]),
      );
    }
    if (_error != null) {
      return Center(child: ErrorState(message: _error!, onRetry: _load));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.lg),
      itemCount: _plans.length,
      itemBuilder: (context, index) {
        final plan = _plans[index] as Map<String, dynamic>;
        final tier = plan['tier'] as String;
        final isCurrent = plan['id'] == _currentPlanId;
        final features = _tierFeatures[tier] ?? [];

        return Card(
          margin: const EdgeInsets.only(bottom: AppSpacing.md),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: isCurrent ? const BorderSide(color: AppColors.accent, width: 2) : BorderSide.none,
          ),
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      plan['name'] as String,
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.navy),
                    ),
                    Text(
                      plan['price'] == 0 ? 'Gratis' : '€${plan['price']}/${plan['billingPeriod']}',
                      style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.accent),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.sm),
                ...features.map(
                  (f) => Padding(
                    padding: const EdgeInsets.only(bottom: 2),
                    child: Text('• $f', style: const TextStyle(color: AppColors.grey, fontSize: 13)),
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                ElevatedButton(
                  onPressed: isCurrent || _subscribingPlanId != null ? null : () => _subscribe(plan['id'] as String),
                  child: Text(
                    isCurrent
                        ? 'Piano attuale'
                        : (_subscribingPlanId == plan['id'] ? '...' : 'Abbonati'),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
