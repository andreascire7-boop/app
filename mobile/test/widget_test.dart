import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:sc_platform_mobile/main.dart';

void main() {
  testWidgets('app boots and shows the splash screen', (WidgetTester tester) async {
    await tester.pumpWidget(const ScPlatformApp());

    expect(find.textContaining('S&C Intelligence'), findsOneWidget);
  });
}
