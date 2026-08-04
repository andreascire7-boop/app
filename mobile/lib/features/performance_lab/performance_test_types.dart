/// Tipi di test del Performance Lab, raggruppati come da specifica prodotto:
/// velocità, agilità, potenza, forza (custom).
const performanceTestTypes = [
  'SPRINT_5M',
  'SPRINT_10M',
  'TEST_505',
  'T_TEST',
  'SPIDER_TEST',
  'CMJ',
  'BROAD_JUMP',
  'CUSTOM_STRENGTH',
];

const _labels = {
  'SPRINT_5M': 'Sprint 5m',
  'SPRINT_10M': 'Sprint 10m',
  'TEST_505': '505 Test',
  'T_TEST': 'T-Test',
  'SPIDER_TEST': 'Spider Test',
  'CMJ': 'Countermovement Jump',
  'BROAD_JUMP': 'Broad Jump',
  'CUSTOM_STRENGTH': 'Test di forza personalizzato',
};

const _defaultUnits = {
  'SPRINT_5M': 's',
  'SPRINT_10M': 's',
  'TEST_505': 's',
  'T_TEST': 's',
  'SPIDER_TEST': 's',
  'CMJ': 'cm',
  'BROAD_JUMP': 'cm',
  'CUSTOM_STRENGTH': 'kg',
};

String performanceTestTypeLabel(String value) => _labels[value] ?? value;

String defaultUnitFor(String testType) => _defaultUnits[testType] ?? '';

const testPhaseOptions = ['INIZIALE', 'INTERMEDIO', 'FINALE'];

String testPhaseLabel(String value) => switch (value) {
      'INIZIALE' => 'Iniziale',
      'INTERMEDIO' => 'Intermedio',
      'FINALE' => 'Finale',
      _ => value,
    };
