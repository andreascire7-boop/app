import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/empty_state.dart';
import '../../core/widgets/error_state.dart';
import '../../core/widgets/skeleton_box.dart';
import 'performance_test_types.dart';

/// Performance Lab: inserimento test fisici (velocità, agilità, potenza, forza)
/// e andamento nel tempo con confronto iniziale/intermedio/finale.
class PerformanceLabScreen extends StatefulWidget {
  const PerformanceLabScreen({super.key, required this.athleteId});

  final String athleteId;

  @override
  State<PerformanceLabScreen> createState() => _PerformanceLabScreenState();
}

class _PerformanceLabScreenState extends State<PerformanceLabScreen> {
  final _apiClient = ApiClient();
  bool _isLoading = true;
  String? _error;
  List<dynamic> _progress = [];

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
      final progress = await _apiClient.getPerformanceProgress(widget.athleteId);
      if (!mounted) return;
      setState(() {
        _progress = progress;
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

  Future<void> _openAddDialog() async {
    String testType = performanceTestTypes.first;
    final valueController = TextEditingController();
    final unitController = TextEditingController(text: defaultUnitFor(testType));
    final customNameController = TextEditingController();
    String? phase;
    bool isSubmitting = false;
    String? dialogError;

    await showDialog<void>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (dialogContext, setDialogState) {
          return AlertDialog(
            title: const Text('Nuovo test'),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  DropdownButtonFormField<String>(
                    value: testType,
                    decoration: const InputDecoration(labelText: 'Tipo di test'),
                    items: performanceTestTypes
                        .map((t) => DropdownMenuItem(value: t, child: Text(performanceTestTypeLabel(t))))
                        .toList(),
                    onChanged: (value) => setDialogState(() {
                      testType = value!;
                      unitController.text = defaultUnitFor(testType);
                    }),
                  ),
                  if (testType == 'CUSTOM_STRENGTH') ...[
                    const SizedBox(height: AppSpacing.sm),
                    TextField(
                      controller: customNameController,
                      decoration: const InputDecoration(labelText: 'Nome esercizio (es. Panca piana 1RM)'),
                    ),
                  ],
                  const SizedBox(height: AppSpacing.sm),
                  TextField(
                    controller: valueController,
                    decoration: const InputDecoration(labelText: 'Valore'),
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  TextField(
                    controller: unitController,
                    decoration: const InputDecoration(labelText: 'Unità (s, cm, kg...)'),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  DropdownButtonFormField<String?>(
                    value: phase,
                    decoration: const InputDecoration(labelText: 'Fase (opzionale)'),
                    items: [
                      const DropdownMenuItem(value: null, child: Text('Nessuna')),
                      ...testPhaseOptions.map((p) => DropdownMenuItem(value: p, child: Text(testPhaseLabel(p)))),
                    ],
                    onChanged: (value) => setDialogState(() => phase = value),
                  ),
                  if (dialogError != null) ...[
                    const SizedBox(height: AppSpacing.sm),
                    Text(dialogError!, style: const TextStyle(color: AppColors.danger)),
                  ],
                ],
              ),
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('Annulla')),
              ElevatedButton(
                onPressed: isSubmitting
                    ? null
                    : () async {
                        final value = double.tryParse(valueController.text.replaceAll(',', '.'));
                        if (value == null) {
                          setDialogState(() => dialogError = 'Inserisci un valore numerico valido.');
                          return;
                        }
                        setDialogState(() => isSubmitting = true);
                        try {
                          await _apiClient.createPerformanceTest(
                            athleteId: widget.athleteId,
                            testType: testType,
                            value: value,
                            unit: unitController.text,
                            customName: testType == 'CUSTOM_STRENGTH' ? customNameController.text : null,
                            phase: phase,
                          );
                          if (dialogContext.mounted) Navigator.pop(dialogContext);
                          await _load();
                        } on ApiException catch (e) {
                          setDialogState(() {
                            isSubmitting = false;
                            dialogError = e.message;
                          });
                        }
                      },
                child: const Text('Salva'),
              ),
            ],
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Performance Lab')),
      body: _buildBody(),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openAddDialog,
        icon: const Icon(Icons.add),
        label: const Text('Nuovo test'),
      ),
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
    if (_progress.isEmpty) {
      return const Center(
        child: EmptyState(
          icon: Icons.query_stats_outlined,
          title: 'Nessun test registrato',
          message: 'Registra i tuoi test fisici (sprint, agilità, potenza, forza) per vedere '
              'l\'andamento e il miglioramento nel tempo.',
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.md),
      itemCount: _progress.length,
      itemBuilder: (context, index) => _ProgressCard(group: _progress[index] as Map<String, dynamic>),
    );
  }
}

class _ProgressCard extends StatelessWidget {
  const _ProgressCard({required this.group});

  final Map<String, dynamic> group;

  @override
  Widget build(BuildContext context) {
    final testType = group['testType'] as String;
    final customName = group['customName'] as String?;
    final unit = group['unit'] as String;
    final improvement = group['improvementPercentage'];
    final series = (group['series'] as List<dynamic>).cast<Map<String, dynamic>>();

    final title = testType == 'CUSTOM_STRENGTH' ? (customName ?? performanceTestTypeLabel(testType)) : performanceTestTypeLabel(testType);
    final improvementColor = improvement == null
        ? AppColors.grey
        : (improvement as num) >= 0
            ? AppColors.success
            : AppColors.danger;

    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.navy)),
                ),
                if (improvement != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: improvementColor.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '${improvement > 0 ? '+' : ''}$improvement%',
                      style: TextStyle(color: improvementColor, fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            if (series.length > 1)
              SizedBox(height: 100, child: _MiniLineChart(series: series))
            else
              Text('Ultimo valore: ${series.last['value']} $unit', style: const TextStyle(color: AppColors.grey)),
            const SizedBox(height: AppSpacing.sm),
            _buildComparisonRow(group['comparison'] as Map<String, dynamic>?, unit),
          ],
        ),
      ),
    );
  }

  Widget _buildComparisonRow(Map<String, dynamic>? comparison, String unit) {
    if (comparison == null) return const SizedBox.shrink();
    final entries = <String, dynamic>{
      'Iniziale': comparison['iniziale'],
      'Intermedio': comparison['intermedio'],
      'Finale': comparison['finale'],
    };
    final chips = entries.entries.where((e) => e.value != null).map((e) {
      final value = (e.value as Map<String, dynamic>)['value'];
      return Chip(label: Text('${e.key}: $value $unit'));
    }).toList();
    if (chips.isEmpty) return const SizedBox.shrink();
    return Wrap(spacing: AppSpacing.xs, children: chips);
  }
}

class _MiniLineChart extends StatelessWidget {
  const _MiniLineChart({required this.series});

  final List<Map<String, dynamic>> series;

  @override
  Widget build(BuildContext context) {
    final spots = <FlSpot>[
      for (var i = 0; i < series.length; i++) FlSpot(i.toDouble(), (series[i]['value'] as num).toDouble()),
    ];

    return LineChart(
      LineChartData(
        gridData: const FlGridData(show: false),
        titlesData: const FlTitlesData(show: false),
        borderData: FlBorderData(show: false),
        lineTouchData: const LineTouchData(enabled: false),
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            color: AppColors.accent,
            barWidth: 3,
            dotData: const FlDotData(show: true),
            belowBarData: BarAreaData(show: true, color: AppColors.accent.withOpacity(0.08)),
          ),
        ],
      ),
    );
  }
}
