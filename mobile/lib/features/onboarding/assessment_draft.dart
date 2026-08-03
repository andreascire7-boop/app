/// Local draft of the onboarding assessment (S3-S5, docs/product-design FASE 6),
/// submitted to the Core API only once the athlete completes the flow.
class InjuryDraft {
  InjuryDraft({required this.bodyArea, required this.severity, this.description});

  final String bodyArea; // matches the BodyArea Prisma enum (FASE 5)
  final int severity; // 0-10
  final String? description;
}

class AssessmentDraft {
  String? primarySport; // TENNIS | PADEL | BOTH
  String? level; // BEGINNER | INTERMEDIATE | ADVANCED | SEMI_PRO | PRO
  int weeklyAvailabilityDays = 3;
  String goalPrimary = '';
  final List<InjuryDraft> injuries = [];

  bool get canProceedFromSportStep => primarySport != null && level != null;
}

const sportOptions = ['TENNIS', 'PADEL', 'BOTH'];
const levelOptions = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'SEMI_PRO', 'PRO'];
const bodyAreaOptions = ['SPALLA', 'GOMITO', 'LOMBARE', 'GINOCCHIO', 'CAVIGLIA', 'ALTRO'];

String sportLabel(String value) => switch (value) {
      'TENNIS' => 'Tennis',
      'PADEL' => 'Padel',
      'BOTH' => 'Entrambi',
      _ => value,
    };

String levelLabel(String value) => switch (value) {
      'BEGINNER' => 'Principiante',
      'INTERMEDIATE' => 'Intermedio',
      'ADVANCED' => 'Avanzato',
      'SEMI_PRO' => 'Semi-professionista',
      'PRO' => 'Professionista',
      _ => value,
    };

String bodyAreaLabel(String value) => switch (value) {
      'SPALLA' => 'Spalla',
      'GOMITO' => 'Gomito',
      'LOMBARE' => 'Lombare',
      'GINOCCHIO' => 'Ginocchio',
      'CAVIGLIA' => 'Caviglia',
      'ALTRO' => 'Altro',
      _ => value,
    };
