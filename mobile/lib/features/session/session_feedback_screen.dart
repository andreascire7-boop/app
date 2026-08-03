import 'package:flutter/material.dart';

import '../../core/network/api_client.dart';
import '../../core/router/app_router.dart';
import '../../core/theme/app_theme.dart';
import '../onboarding/assessment_draft.dart' show bodyAreaOptions, bodyAreaLabel;

/// S10 (docs/product-design FASE 6): RPE, dolore ed energia raccolti insieme,
/// completabile in pochi secondi. Chiude il loop F4: la sottomissione innesca
/// l'autoregolazione lato backend/AI engine.
class SessionFeedbackScreen extends StatefulWidget {
  const SessionFeedbackScreen({super.key, required this.athleteId, required this.sessionId});

  final String athleteId;
  final String sessionId;

  @override
  State<SessionFeedbackScreen> createState() => _SessionFeedbackScreenState();
}

class _SessionFeedbackScreenState extends State<SessionFeedbackScreen> {
  final _apiClient = ApiClient();

  double _sessionRpe = 6;
  int _energyLevel = 6;
  bool _reportPain = false;
  String _painArea = bodyAreaOptions.first;
  int _painLevel = 3;

  bool _isSubmitting = false;
  String? _error;

  Future<void> _submit() async {
    setState(() {
      _isSubmitting = true;
      _error = null;
    });
    try {
      final result = await _apiClient.submitSessionFeedback(
        athleteId: widget.athleteId,
        sessionId: widget.sessionId,
        sessionRpe: _sessionRpe,
        energyLevel: _energyLevel,
        painArea: _reportPain ? _painArea : null,
        painLevel: _reportPain ? _painLevel : null,
      );

      if (!mounted) return;

      final adjustedNextSessionId = result['adjustedNextSessionId'];
      if (adjustedNextSessionId != null) {
        final explanation =
            (result['autoregulation'] as Map<String, dynamic>?)?['explanation'] as String? ?? '';
        await showDialog<void>(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Piano adattato'),
            content: Text(explanation),
            actions: [
              TextButton(onPressed: () => Navigator.pop(context), child: const Text('Ho capito')),
            ],
          ),
        );
      }

      if (!mounted) return;
      Navigator.of(context).pushNamedAndRemoveUntil(AppRoutes.home, (route) => false);
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Come è andata?'), automaticallyImplyLeading: false),
      body: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: ListView(
          children: [
            Text('Sforzo percepito (RPE): ${_sessionRpe.toStringAsFixed(0)}/10'),
            Slider(
              value: _sessionRpe,
              min: 0,
              max: 10,
              divisions: 10,
              label: _sessionRpe.toStringAsFixed(0),
              onChanged: (value) => setState(() => _sessionRpe = value),
            ),
            const SizedBox(height: AppSpacing.md),
            Text('Energia percepita: $_energyLevel/10'),
            Slider(
              value: _energyLevel.toDouble(),
              min: 1,
              max: 10,
              divisions: 9,
              label: '$_energyLevel',
              onChanged: (value) => setState(() => _energyLevel = value.round()),
            ),
            const SizedBox(height: AppSpacing.md),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Segnala dolore'),
              value: _reportPain,
              onChanged: (value) => setState(() => _reportPain = value),
            ),
            if (_reportPain) ...[
              DropdownButtonFormField<String>(
                value: _painArea,
                decoration: const InputDecoration(labelText: 'Zona'),
                items: bodyAreaOptions
                    .map((area) => DropdownMenuItem(value: area, child: Text(bodyAreaLabel(area))))
                    .toList(),
                onChanged: (value) => setState(() => _painArea = value!),
              ),
              const SizedBox(height: AppSpacing.sm),
              Text('Intensità dolore: $_painLevel/10'),
              Slider(
                value: _painLevel.toDouble(),
                min: 0,
                max: 10,
                divisions: 10,
                label: '$_painLevel',
                onChanged: (value) => setState(() => _painLevel = value.round()),
              ),
            ],
            const SizedBox(height: AppSpacing.lg),
            if (_error != null) ...[
              Text(_error!, style: const TextStyle(color: AppColors.danger)),
              const SizedBox(height: AppSpacing.md),
            ],
            ElevatedButton(
              onPressed: _isSubmitting ? null : _submit,
              child: _isSubmitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Text('Invia'),
            ),
          ],
        ),
      ),
    );
  }
}
