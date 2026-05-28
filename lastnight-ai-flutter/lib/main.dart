import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math' as math;
import 'dart:typed_data';

import 'package:crypto/crypto.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  runApp(const LastNightApp());
}

const _bg = Color(0xFF05070D);
const _panel = Color(0xFF111520);
const _panel2 = Color(0xFF171B28);
const _purple = Color(0xFFD0BCFF);
const _violet = Color(0xFF8B5CF6);
const _cyan = Color(0xFF4CD7F6);
const _muted = Color(0xFFB9B2C8);
const _maxUploadFileBytes = 10 * 1024 * 1024;
const _maxUploadTotalBytes = 20 * 1024 * 1024;
const _maxUploadFiles = 8;

String _hashPassword(String password, String email) {
  return sha256.convert(utf8.encode('${email.toLowerCase()}:$password')).toString();
}

class LastNightApp extends StatefulWidget {
  const LastNightApp({super.key});

  @override
  State<LastNightApp> createState() => _LastNightAppState();
}

class _LastNightAppState extends State<LastNightApp> {
  final AppController controller = AppController();

  @override
  void initState() {
    super.initState();
    controller.restore();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, _) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          title: 'LastNight AI',
          theme: ThemeData(
            brightness: Brightness.dark,
            scaffoldBackgroundColor: _bg,
            useMaterial3: true,
            colorScheme: const ColorScheme.dark(
              primary: _purple,
              secondary: _cyan,
              surface: _panel,
            ),
            fontFamily: 'Inter',
          ),
          home: AppShell(controller: controller),
        );
      },
    );
  }
}

enum Screen { welcome, login, signup, dashboard, upload, panic, progress, results, profile }

class AppController extends ChangeNotifier {
  Screen screen = Screen.welcome;
  StudentProfile? profile;
  final BackendClient backend = BackendClient();

  String subject = '';
  String timeLeft = '1 night';
  List<StudyFile> files = [];
  AnalysisResponse? result;
  double progress = 0;
  List<String> logs = [];
  String? notice;

  Future<void> restore() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('lastnight.profile');
    if (raw != null) {
      profile = StudentProfile.fromJson(jsonDecode(raw) as Map<String, dynamic>);
      screen = Screen.dashboard;
      notifyListeners();
    }
  }

  Future<void> saveProfile(StudentProfile next) async {
    profile = next;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('lastnight.profile', jsonEncode(next.toJson()));
    screen = Screen.dashboard;
    notifyListeners();
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('lastnight.profile');
    profile = null;
    screen = Screen.welcome;
    notifyListeners();
  }

  void go(Screen next) {
    if (_requiresProfile(next) && profile == null) {
      screen = Screen.signup;
    } else {
      screen = next;
    }
    notifyListeners();
  }

  bool _requiresProfile(Screen next) {
    return {
      Screen.dashboard,
      Screen.upload,
      Screen.panic,
      Screen.progress,
      Screen.results,
      Screen.profile,
    }.contains(next);
  }

  void setSubject(String value) {
    subject = value;
    notifyListeners();
  }

  void setTimeLeft(String value) {
    timeLeft = value;
    notifyListeners();
  }

  void addFiles(List<StudyFile> nextFiles) {
    final keys = files.map((file) => '${file.name}-${file.sizeLabel}').toSet();
    files = [
      ...files,
      ...nextFiles.where((file) => !keys.contains('${file.name}-${file.sizeLabel}')),
    ];
    notice = null;
    notifyListeners();
  }

  void removeFile(StudyFile file) {
    files = files.where((item) => item.id != file.id).toList();
    notice = null;
    notifyListeners();
  }

  void setNotice(String? value) {
    notice = value;
    notifyListeners();
  }

  Future<void> analyze() async {
    if (subject.trim().isEmpty) {
      notice = 'Add your subject before launching the agent.';
      screen = Screen.upload;
      notifyListeners();
      return;
    }

    screen = Screen.progress;
    progress = 0;
    logs = [];
    notice = null;
    result = null;
    notifyListeners();

    final steps = [
      'Opening syllabus, notes, and PYQ material...',
      'Extracting repeated paper patterns...',
      'Ranking high-priority topics against deadline...',
      'Building viva, quiz, and revision outputs...',
    ];

    for (var index = 0; index < steps.length; index += 1) {
      logs = [...logs, steps[index]];
      progress = (index + 1) / (steps.length + 1);
      notifyListeners();
      await Future<void>.delayed(const Duration(milliseconds: 620));
    }

    try {
      result = await backend.analyze(
        subject: subject,
        timeLeft: timeLeft,
        profile: profile,
        files: files,
      );
      logs = [...logs, 'Shared LastNight backend returned synced analysis.'];
    } catch (_) {
      result = AnalysisResponse.mock(subject, timeLeft);
      logs = [...logs, 'Backend unavailable. Local Flutter fallback created a demo kit.'];
    }

    progress = 1;
    notifyListeners();
    await Future<void>.delayed(const Duration(milliseconds: 420));
    screen = Screen.results;
    notifyListeners();
  }
}

class StudentProfile {
  StudentProfile({
    required this.fullName,
    required this.email,
    required this.college,
    required this.degree,
    required this.branch,
    required this.semester,
    this.rollNumber = '',
    this.targetExam = '',
    this.avatarBase64,
    this.passwordHash,
  });

  final String fullName;
  final String email;
  final String college;
  final String degree;
  final String branch;
  final String semester;
  final String rollNumber;
  final String targetExam;
  final String? avatarBase64;
  final String? passwordHash;

  String get firstName => fullName.trim().split(RegExp(r'\s+')).first;

  Map<String, dynamic> toJson() => {
        'fullName': fullName,
        'email': email,
        'college': college,
        'degree': degree,
        'branch': branch,
        'semester': semester,
        'rollNumber': rollNumber,
        'targetExam': targetExam,
        'avatarBase64': avatarBase64,
        'passwordHash': passwordHash,
      };

  factory StudentProfile.fromJson(Map<String, dynamic> json) {
    return StudentProfile(
      fullName: json['fullName'] as String? ?? '',
      email: json['email'] as String? ?? '',
      college: json['college'] as String? ?? '',
      degree: json['degree'] as String? ?? '',
      branch: json['branch'] as String? ?? '',
      semester: json['semester'] as String? ?? '',
      rollNumber: json['rollNumber'] as String? ?? '',
      targetExam: json['targetExam'] as String? ?? '',
      avatarBase64: json['avatarBase64'] as String?,
      passwordHash: json['passwordHash'] as String?,
    );
  }
}

enum StudyFileKind { syllabus, notes, pyq, slides, other }

class StudyFile {
  StudyFile({
    required this.name,
    required this.sizeLabel,
    required this.type,
    required this.kind,
    required this.sizeBytes,
    this.text = '',
    this.bytes,
  }) : id = DateTime.now().microsecondsSinceEpoch.toString() + name;

  final String id;
  final String name;
  final String sizeLabel;
  final String type;
  final StudyFileKind kind;
  final int sizeBytes;
  final String text;
  final Uint8List? bytes;

  String get mimeType {
    final extension = name.split('.').last.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'application/pdf';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'txt':
      case 'md':
      case 'csv':
        return 'text/plain';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default:
        return 'application/octet-stream';
    }
  }

  Map<String, dynamic> toApiJson() {
    return {
      'fileName': name,
      'fileSize': sizeLabel,
      'fileType': mimeType,
      'size': sizeBytes,
      'fileContent': text,
      'sourceKind': kind.name,
      if (bytes != null && bytes!.isNotEmpty) 'dataUrl': 'data:$mimeType;base64,${base64Encode(bytes!)}',
    };
  }
}

class BackendClient {
  String get baseUrl {
    const dartDefined = String.fromEnvironment('API_BASE_URL');
    if (dartDefined.isNotEmpty) return _normalize(dartDefined);
    if (kIsWeb) return 'http://127.0.0.1:3000/';
    if (Platform.isAndroid) return 'http://10.0.2.2:3000/';
    return 'http://127.0.0.1:3000/';
  }

  String _normalize(String value) => value.endsWith('/') ? value : '$value/';

  Future<AnalysisResponse> analyze({
    required String subject,
    required String timeLeft,
    required StudentProfile? profile,
    required List<StudyFile> files,
  }) async {
    final profileFile = profile == null
        ? null
        : {
            'fileName': 'Student Profile Context',
            'fileSize': 'profile',
            'fileType': 'profile-context',
            'sourceKind': 'profile',
            'fileContent': [
              'College: ${profile.college}',
              'Degree: ${profile.degree}',
              'Branch: ${profile.branch}',
              'Semester: ${profile.semester}',
              if (profile.targetExam.isNotEmpty) 'Target Exam: ${profile.targetExam}',
            ].join('\n'),
          };

    final payload = {
      'subjectName': subject,
      'timeLeft': timeLeft,
      'files': [
        if (profileFile != null) profileFile,
        ...files.map((file) => file.toApiJson()),
      ],
    };

    final response = await http
        .post(
          Uri.parse('${baseUrl}api/analyze'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(payload),
        )
        .timeout(const Duration(seconds: 24));

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw HttpException('Backend returned ${response.statusCode}');
    }

    return AnalysisResponse.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
  }
}

class AnalysisResponse {
  AnalysisResponse({
    required this.subjectName,
    required this.timeLeft,
    required this.summary,
    required this.strategyTitle,
    required this.strategyRating,
    required this.strategyDescription,
    required this.hacks,
    required this.topics,
    required this.questions,
    required this.notes,
    required this.viva,
    required this.quiz,
    required this.plan,
  });

  final String subjectName;
  final String timeLeft;
  final String summary;
  final String strategyTitle;
  final String strategyRating;
  final String strategyDescription;
  final List<String> hacks;
  final List<TopicResult> topics;
  final List<QuestionResult> questions;
  final List<NoteResult> notes;
  final List<VivaResult> viva;
  final List<QuizResult> quiz;
  final List<PlanResult> plan;

  factory AnalysisResponse.fromJson(Map<String, dynamic> json) {
    final strategy = json['examStrategy'] as Map<String, dynamic>? ?? {};
    return AnalysisResponse(
      subjectName: json['subjectName'] as String? ?? 'Study Kit',
      timeLeft: json['timeLeft'] as String? ?? '1 night',
      summary: json['summary'] as String? ?? '',
      strategyTitle: strategy['title'] as String? ?? 'OpenAI Triage Directive',
      strategyRating: strategy['rating'] as String? ?? 'URGENT',
      strategyDescription: strategy['description'] as String? ?? '',
      hacks: _strings(strategy['keyHacks']),
      topics: _list(json['highPriorityTopics'], TopicResult.fromJson),
      questions: _list(json['importantQuestions'], QuestionResult.fromJson),
      notes: _list(json['quickRevisionNotes'], NoteResult.fromJson),
      viva: _list(json['vivaQuestions'], VivaResult.fromJson),
      quiz: _list(json['quizQuestions'], QuizResult.fromJson),
      plan: _list(json['panicModeStudyPlan'], PlanResult.fromJson),
    );
  }

  factory AnalysisResponse.mock(String subject, String timeLeft) {
    return AnalysisResponse(
      subjectName: subject,
      timeLeft: timeLeft,
      summary: 'Focus on repeated PYQs, high-mark definitions, diagrams, and active recall loops.',
      strategyTitle: 'LastNight Flutter Triage',
      strategyRating: timeLeft == '3 hours' ? 'CRITICAL' : 'URGENT',
      strategyDescription: 'Start with PYQs, mark repeated questions, memorize diagrams, then run short quizzes.',
      hacks: ['PYQ first', 'Diagram marks', 'Definitions', 'Timed recall'],
      topics: [
        TopicResult('Repeated PYQ Unit', '35%', 'Critical', ['Definitions', 'Architecture', 'Examples']),
        TopicResult('Compare and numerical set', '25%', 'High', ['Tables', 'Formula map', 'Short proofs']),
      ],
      questions: [
        QuestionResult('q1', 'Explain the most repeated mechanism in $subject with a diagram.', 'High likelihood', 'Define terms, draw the diagram first, explain flow, then limitations.'),
        QuestionResult('q2', 'Compare two major approaches and justify the better one.', 'Medium likelihood', 'Use a table covering complexity, reliability, memory, and use case.'),
      ],
      notes: [
        NoteResult('Five-minute recall card', ['Write definitions first.', 'Draw diagrams before prose.', 'Use PYQ wording.']),
      ],
      viva: [
        VivaResult('Why is this topic repeatedly asked?', 'It tests definitions, process understanding, and application in one answer.'),
      ],
      quiz: [
        QuizResult('What should be reviewed first?', ['Random pages', 'Repeated PYQs', 'Only examples', 'Appendix'], 1, 'PYQs reveal examiner patterns.'),
      ],
      plan: [
        PlanResult('Now', 'PYQ scan', 'Mark repeated questions and diagram-heavy topics.', 'Start here'),
        PlanResult('Next', 'Active recall', 'Practice answers aloud and run short quizzes.', 'Memory lock'),
      ],
    );
  }

  static List<String> _strings(dynamic value) {
    if (value is List) return value.map((item) => item.toString()).toList();
    return const [];
  }

  static List<T> _list<T>(dynamic value, T Function(Map<String, dynamic>) mapper) {
    if (value is! List) return const [];
    return value.whereType<Map<String, dynamic>>().map(mapper).toList();
  }
}

class TopicResult {
  TopicResult(this.name, this.weightage, this.importance, this.subtopics);
  final String name;
  final String weightage;
  final String importance;
  final List<String> subtopics;
  factory TopicResult.fromJson(Map<String, dynamic> json) => TopicResult(
        json['topicName'] as String? ?? '',
        json['weightage'] as String? ?? '',
        json['importance'] as String? ?? '',
        AnalysisResponse._strings(json['subtopics']),
      );
}

class QuestionResult {
  QuestionResult(this.id, this.question, this.frequency, this.answer);
  final String id;
  final String question;
  final String frequency;
  final String answer;
  factory QuestionResult.fromJson(Map<String, dynamic> json) => QuestionResult(
        json['id'] as String? ?? UniqueKey().toString(),
        json['question'] as String? ?? '',
        json['frequency'] as String? ?? '',
        json['expectedAnswer'] as String? ?? '',
      );
}

class NoteResult {
  NoteResult(this.heading, this.points);
  final String heading;
  final List<String> points;
  factory NoteResult.fromJson(Map<String, dynamic> json) => NoteResult(
        json['heading'] as String? ?? '',
        AnalysisResponse._strings(json['points']),
      );
}

class VivaResult {
  VivaResult(this.question, this.answer);
  final String question;
  final String answer;
  factory VivaResult.fromJson(Map<String, dynamic> json) => VivaResult(
        json['question'] as String? ?? '',
        json['instantAnswer'] as String? ?? '',
      );
}

class QuizResult {
  QuizResult(this.question, this.options, this.correctAnswerIndex, this.explanation);
  final String question;
  final List<String> options;
  final int correctAnswerIndex;
  final String explanation;
  factory QuizResult.fromJson(Map<String, dynamic> json) => QuizResult(
        json['question'] as String? ?? '',
        AnalysisResponse._strings(json['options']),
        json['correctAnswerIndex'] as int? ?? 0,
        json['explanation'] as String? ?? '',
      );
}

class PlanResult {
  PlanResult(this.timeSlot, this.title, this.description, this.focus);
  final String timeSlot;
  final String title;
  final String description;
  final String focus;
  factory PlanResult.fromJson(Map<String, dynamic> json) => PlanResult(
        json['timeSlot'] as String? ?? '',
        json['taskTitle'] as String? ?? '',
        json['taskDescription'] as String? ?? '',
        json['focusArea'] as String? ?? '',
      );
}

class AppShell extends StatelessWidget {
  const AppShell({required this.controller, super.key});
  final AppController controller;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          const Positioned.fill(child: CinematicSky()),
          SafeArea(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 320),
              child: _screen(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _screen() {
    switch (controller.screen) {
      case Screen.welcome:
        return WelcomeScreen(controller: controller);
      case Screen.login:
        return AuthScreen(controller: controller, isSignup: false);
      case Screen.signup:
        return AuthScreen(controller: controller, isSignup: true);
      case Screen.dashboard:
        return DashboardScreen(controller: controller);
      case Screen.upload:
        return UploadScreen(controller: controller);
      case Screen.panic:
        return PanicScreen(controller: controller);
      case Screen.progress:
        return ProgressScreen(controller: controller);
      case Screen.results:
        return ResultsScreen(controller: controller);
      case Screen.profile:
        return ProfileScreen(controller: controller);
    }
  }
}

class CinematicSky extends StatefulWidget {
  const CinematicSky({super.key});

  @override
  State<CinematicSky> createState() => _CinematicSkyState();
}

class _CinematicSkyState extends State<CinematicSky> with SingleTickerProviderStateMixin {
  late final AnimationController _ticker;

  @override
  void initState() {
    super.initState();
    _ticker = AnimationController(vsync: this, duration: const Duration(seconds: 8))..repeat();
  }

  @override
  void dispose() {
    _ticker.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ticker,
      builder: (context, _) => CustomPaint(
        painter: SkyPainter(_ticker.value),
        child: const SizedBox.expand(),
      ),
    );
  }
}

class SkyPainter extends CustomPainter {
  SkyPainter(this.t);
  final double t;

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;
    final bgPaint = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [_bg, Color(0xFF080A14), Color(0xFF03050A)],
      ).createShader(rect);
    canvas.drawRect(rect, bgPaint);

    final random = math.Random(7);
    final starPaint = Paint()..color = Colors.white.withOpacity(0.35);
    for (var i = 0; i < 95; i += 1) {
      final x = random.nextDouble() * size.width;
      final y = random.nextDouble() * size.height * 0.72;
      final pulse = 0.16 + 0.2 * math.sin((t * math.pi * 2) + i);
      starPaint.color = Colors.white.withOpacity(pulse.clamp(0.06, 0.42));
      canvas.drawCircle(Offset(x, y), 0.8 + random.nextDouble() * 1.3, starPaint);
    }

    for (var i = 0; i < 2; i += 1) {
      final offset = ((t + i * 0.28) % 1.0) * (size.width + 420);
      final start = Offset(size.width + 120 - offset, size.height * (0.16 + i * 0.14) + offset * 0.12);
      final end = start + Offset(330, -118);
      final meteor = Paint()
        ..strokeWidth = 2.4
        ..strokeCap = StrokeCap.round
        ..shader = LinearGradient(
          colors: [_cyan.withOpacity(0.95), _purple.withOpacity(0.36), Colors.transparent],
        ).createShader(Rect.fromPoints(start, end));
      canvas.drawLine(start, end, meteor);
    }

    final grid = Paint()
      ..color = _cyan.withOpacity(0.08)
      ..strokeWidth = 1;
    final horizon = size.height * 0.72;
    for (var i = -12; i <= 12; i += 1) {
      canvas.drawLine(
        Offset(size.width / 2 + i * 26, horizon),
        Offset(size.width / 2 + i * 120, size.height + 80),
        grid,
      );
    }
  }

  @override
  bool shouldRepaint(covariant SkyPainter oldDelegate) => oldDelegate.t != t;
}

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({required this.controller, super.key});
  final AppController controller;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 48),
          const Icon(Icons.psychology, size: 58, color: _purple),
          const SizedBox(height: 28),
          const Text(
            'LastNight AI',
            style: TextStyle(fontSize: 46, fontWeight: FontWeight.w900, height: 0.95),
          ),
          const SizedBox(height: 16),
          const Text(
            'A fully Flutter exam survival agent for iOS and Android.',
            style: TextStyle(color: _muted, fontSize: 18, height: 1.45),
          ),
          const SizedBox(height: 28),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: const [
              _Chip(label: 'Upload PYQ'),
              _Chip(label: 'College profile'),
              _Chip(label: 'OpenAI backend'),
              _Chip(label: 'Offline fallback'),
            ],
          ),
          const SizedBox(height: 44),
          PrimaryButton(label: 'Create Account', onPressed: () => controller.go(Screen.signup)),
          const SizedBox(height: 12),
          SecondaryButton(label: 'Login', onPressed: () => controller.go(Screen.login)),
        ],
      ),
    );
  }
}

class AuthScreen extends StatefulWidget {
  const AuthScreen({required this.controller, required this.isSignup, super.key});
  final AppController controller;
  final bool isSignup;

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final name = TextEditingController();
  final email = TextEditingController();
  final password = TextEditingController();
  final college = TextEditingController();
  final degree = TextEditingController();
  final branch = TextEditingController();
  final semester = TextEditingController();
  final roll = TextEditingController();
  final targetExam = TextEditingController();
  String? avatarBase64;
  String? error;

  @override
  void dispose() {
    name.dispose();
    email.dispose();
    password.dispose();
    college.dispose();
    degree.dispose();
    branch.dispose();
    semester.dispose();
    roll.dispose();
    targetExam.dispose();
    super.dispose();
  }

  Future<void> _pickAvatar() async {
    final image = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 72, maxWidth: 900);
    if (image == null) return;
    final bytes = await image.readAsBytes();
    setState(() => avatarBase64 = base64Encode(bytes));
  }

  Future<void> _submit() async {
    if (email.text.trim().isEmpty || password.text.length < 6) {
      setState(() => error = 'Add email and a password with at least 6 characters.');
      return;
    }

    if (!widget.isSignup) {
      final saved = widget.controller.profile;
      if (saved == null || saved.email.toLowerCase() != email.text.trim().toLowerCase()) {
        setState(() => error = 'No local Flutter profile found for this email. Create one first.');
        return;
      }
      if (saved.passwordHash != null && saved.passwordHash != _hashPassword(password.text, email.text.trim())) {
        setState(() => error = 'Password does not match this local Flutter profile.');
        return;
      }
      widget.controller.go(Screen.dashboard);
      return;
    }

    if ([name, college, degree, branch, semester].any((field) => field.text.trim().isEmpty)) {
      setState(() => error = 'Fill name, college, degree, branch, and semester.');
      return;
    }

    await widget.controller.saveProfile(StudentProfile(
      fullName: name.text.trim(),
      email: email.text.trim().toLowerCase(),
      college: college.text.trim(),
      degree: degree.text.trim(),
      branch: branch.text.trim(),
      semester: semester.text.trim(),
      rollNumber: roll.text.trim(),
      targetExam: targetExam.text.trim(),
      avatarBase64: avatarBase64,
      passwordHash: _hashPassword(password.text, email.text.trim()),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.isSignup ? 'Create your Flutter study profile.' : 'Login to your study cockpit.';
    return SingleChildScrollView(
      padding: const EdgeInsets.all(22),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          IconButton(
            onPressed: () => widget.controller.go(Screen.welcome),
            icon: const Icon(Icons.arrow_back),
          ),
          const SizedBox(height: 8),
          Text(title, style: const TextStyle(fontSize: 34, fontWeight: FontWeight.w900, height: 1.05)),
          const SizedBox(height: 10),
          const Text('Profile photo is optional. College details help the AI study kit understand your exam context.', style: TextStyle(color: _muted)),
          const SizedBox(height: 22),
          if (widget.isSignup)
            Center(
              child: GestureDetector(
                onTap: _pickAvatar,
                child: CircleAvatar(
                  radius: 48,
                  backgroundColor: _purple.withOpacity(0.16),
                  backgroundImage: avatarBase64 == null ? null : MemoryImage(base64Decode(avatarBase64!)),
                  child: avatarBase64 == null ? const Icon(Icons.add_a_photo, color: _purple, size: 28) : null,
                ),
              ),
            ),
          const SizedBox(height: 18),
          if (widget.isSignup) AppField(controller: name, label: 'Full Name', icon: Icons.person),
          AppField(controller: email, label: 'Email', icon: Icons.email, keyboardType: TextInputType.emailAddress),
          AppField(controller: password, label: 'Password', icon: Icons.lock, obscure: true),
          if (widget.isSignup) ...[
            AppField(controller: college, label: 'College Name', icon: Icons.school),
            AppField(controller: degree, label: 'Degree', icon: Icons.workspace_premium),
            AppField(controller: branch, label: 'Branch', icon: Icons.hub),
            AppField(controller: semester, label: 'Semester / Year', icon: Icons.calendar_month),
            AppField(controller: roll, label: 'Roll Number', icon: Icons.badge),
            AppField(controller: targetExam, label: 'Target Exam', icon: Icons.flag),
          ],
          if (error != null) ErrorPanel(message: error!),
          const InfoPanel(text: 'Demo auth stores only a local password hash on this device. For production, plug this Flutter app into Clerk, Firebase Auth, Supabase, or your own backend auth.'),
          PrimaryButton(label: widget.isSignup ? 'Create Account' : 'Login', onPressed: _submit),
          const SizedBox(height: 10),
          SecondaryButton(
            label: widget.isSignup ? 'Already have account? Login' : 'New here? Create account',
            onPressed: () => widget.controller.go(widget.isSignup ? Screen.login : Screen.signup),
          ),
        ],
      ),
    );
  }
}

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({required this.controller, super.key});
  final AppController controller;

  @override
  Widget build(BuildContext context) {
    final profile = controller.profile;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(22),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TopBar(controller: controller),
          const SizedBox(height: 28),
          Text('Welcome back, ${profile?.firstName ?? 'Builder'}.', style: const TextStyle(fontSize: 34, fontWeight: FontWeight.w900)),
          const SizedBox(height: 8),
          Text(
            profile == null ? 'Your AI triage agent is on standby.' : '${profile.degree} ${profile.branch} • ${profile.semester} • ${profile.college}',
            style: const TextStyle(color: _muted),
          ),
          const SizedBox(height: 22),
          DashboardCard(
            icon: Icons.account_circle,
            title: 'College Profile',
            body: profile?.targetExam.isNotEmpty == true ? profile!.targetExam : 'Add target exam and college details',
            onTap: () => controller.go(Screen.profile),
          ),
          DashboardCard(
            icon: Icons.history_edu,
            title: 'Upload PYQs',
            body: 'Stage previous year papers with notes and syllabus.',
            onTap: () => controller.go(Screen.upload),
          ),
          DashboardCard(
            icon: Icons.bolt,
            title: 'New Exam Prep Triage',
            body: 'Generate questions, notes, viva prompts, quiz and study plan.',
            onTap: () => controller.go(Screen.upload),
          ),
        ],
      ),
    );
  }
}

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({required this.controller, super.key});
  final AppController controller;

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late final TextEditingController name;
  late final TextEditingController email;
  late final TextEditingController college;
  late final TextEditingController degree;
  late final TextEditingController branch;
  late final TextEditingController semester;
  late final TextEditingController roll;
  late final TextEditingController targetExam;
  String? avatarBase64;
  String? error;

  @override
  void initState() {
    super.initState();
    final profile = widget.controller.profile!;
    name = TextEditingController(text: profile.fullName);
    email = TextEditingController(text: profile.email);
    college = TextEditingController(text: profile.college);
    degree = TextEditingController(text: profile.degree);
    branch = TextEditingController(text: profile.branch);
    semester = TextEditingController(text: profile.semester);
    roll = TextEditingController(text: profile.rollNumber);
    targetExam = TextEditingController(text: profile.targetExam);
    avatarBase64 = profile.avatarBase64;
  }

  @override
  void dispose() {
    name.dispose();
    email.dispose();
    college.dispose();
    degree.dispose();
    branch.dispose();
    semester.dispose();
    roll.dispose();
    targetExam.dispose();
    super.dispose();
  }

  Future<void> _pickAvatar() async {
    final image = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 72, maxWidth: 900);
    if (image == null) return;
    final bytes = await image.readAsBytes();
    setState(() => avatarBase64 = base64Encode(bytes));
  }

  Future<void> _save() async {
    if (name.text.trim().isEmpty || email.text.trim().isEmpty || college.text.trim().isEmpty) {
      setState(() => error = 'Name, email, and college are required.');
      return;
    }

    await widget.controller.saveProfile(StudentProfile(
      fullName: name.text.trim(),
      email: email.text.trim(),
      college: college.text.trim(),
      degree: degree.text.trim(),
      branch: branch.text.trim(),
      semester: semester.text.trim(),
      rollNumber: roll.text.trim(),
      targetExam: targetExam.text.trim(),
      avatarBase64: avatarBase64,
      passwordHash: widget.controller.profile?.passwordHash,
    ));
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(22),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TopBar(controller: widget.controller),
          const SizedBox(height: 28),
          const Text('Profile and College Details', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900)),
          const SizedBox(height: 14),
          Center(
            child: GestureDetector(
              onTap: _pickAvatar,
              child: CircleAvatar(
                radius: 52,
                backgroundColor: _purple.withOpacity(0.16),
                backgroundImage: avatarBase64 == null ? null : MemoryImage(base64Decode(avatarBase64!)),
                child: avatarBase64 == null ? const Icon(Icons.add_a_photo, color: _purple, size: 30) : null,
              ),
            ),
          ),
          const SizedBox(height: 18),
          AppField(controller: name, label: 'Full Name', icon: Icons.person),
          AppField(controller: email, label: 'Email', icon: Icons.email),
          AppField(controller: college, label: 'College Name', icon: Icons.school),
          AppField(controller: degree, label: 'Degree', icon: Icons.workspace_premium),
          AppField(controller: branch, label: 'Branch', icon: Icons.hub),
          AppField(controller: semester, label: 'Semester / Year', icon: Icons.calendar_month),
          AppField(controller: roll, label: 'Roll Number', icon: Icons.badge),
          AppField(controller: targetExam, label: 'Target Exam', icon: Icons.flag),
          if (error != null) ErrorPanel(message: error!),
          PrimaryButton(label: 'Save Profile', onPressed: _save),
        ],
      ),
    );
  }
}

class UploadScreen extends StatelessWidget {
  const UploadScreen({required this.controller, super.key});
  final AppController controller;

  Future<void> _pickFiles(StudyFileKind kind) async {
    final result = await FilePicker.platform.pickFiles(
      allowMultiple: true,
      withData: true,
      type: FileType.custom,
      allowedExtensions: const ['pdf', 'doc', 'docx', 'txt', 'md', 'csv', 'jpg', 'jpeg', 'png'],
    );
    if (result == null) return;

    var runningTotal = controller.files.fold<int>(0, (total, file) => total + file.sizeBytes);
    var skipped = 0;
    final accepted = <StudyFile>[];

    for (final file in result.files) {
      if (file.size > _maxUploadFileBytes ||
          controller.files.length + accepted.length >= _maxUploadFiles ||
          runningTotal + file.size > _maxUploadTotalBytes) {
        skipped += 1;
        continue;
      }

      final bytes = file.bytes;
      final text = bytes == null ? '' : _decodeText(bytes);
      accepted.add(StudyFile(
        name: file.name,
        sizeLabel: '${math.max(1, (file.size / 1024).round())} KB',
        type: file.extension?.toUpperCase() ?? 'FILE',
        kind: kind,
        sizeBytes: file.size,
        text: text,
        bytes: bytes,
      ));
      runningTotal += file.size;
    }

    if (accepted.isNotEmpty) controller.addFiles(accepted);
    if (skipped > 0) {
      controller.setNotice('$skipped file(s) skipped. Keep uploads under 10MB each, 20MB total, and 8 files per kit.');
    }
  }

  static String _decodeText(Uint8List bytes) {
    try {
      final decoded = utf8.decode(bytes, allowMalformed: true);
      return decoded.length > 12000 ? decoded.substring(0, 12000) : decoded;
    } catch (_) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    final profile = controller.profile;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(22),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TopBar(controller: controller),
          const SizedBox(height: 24),
          const Text('Triage Your Exam Materials', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900)),
          const SizedBox(height: 8),
          Text(
            profile == null ? 'Upload syllabus, notes and PYQs.' : '${profile.college} • ${profile.degree} ${profile.branch} • ${profile.semester}',
            style: const TextStyle(color: _muted),
          ),
          if (controller.notice != null) ...[
            const SizedBox(height: 12),
            InfoPanel(text: controller.notice!),
          ],
          const SizedBox(height: 18),
          AppField(
            label: 'Subject',
            icon: Icons.edit_note,
            initialValue: controller.subject,
            onChanged: controller.setSubject,
          ),
          GridView.count(
            crossAxisCount: MediaQuery.sizeOf(context).width > 720 ? 3 : 1,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 2.2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            children: [
              UploadTile(icon: Icons.description, title: 'Upload Syllabus', subtitle: 'PDF, DOCX, TXT', onTap: () => _pickFiles(StudyFileKind.syllabus)),
              UploadTile(icon: Icons.edit_document, title: 'Upload Notes', subtitle: 'Images or docs', onTap: () => _pickFiles(StudyFileKind.notes)),
              UploadTile(icon: Icons.history_edu, title: 'Upload PYQ Papers', subtitle: 'Past papers', onTap: () => _pickFiles(StudyFileKind.pyq)),
            ],
          ),
          const SizedBox(height: 18),
          ...controller.files.map((file) => FileRow(file: file, onRemove: () => controller.removeFile(file))),
          const SizedBox(height: 12),
          PrimaryButton(label: 'Select Panic Mode', onPressed: () => controller.go(Screen.panic)),
        ],
      ),
    );
  }
}

class PanicScreen extends StatelessWidget {
  const PanicScreen({required this.controller, super.key});
  final AppController controller;

  @override
  Widget build(BuildContext context) {
    final options = const [
      ('3 hours', 'Deep Panic Mode', Icons.local_fire_department),
      ('6 hours', 'Extreme Crunch', Icons.hourglass_bottom),
      ('1 night', 'Survival Triage', Icons.dark_mode),
      ('2 days', 'Strategic Study', Icons.calendar_month),
    ];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(22),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TopBar(controller: controller),
          const SizedBox(height: 24),
          const Text('Panic Mode', style: TextStyle(fontSize: 34, fontWeight: FontWeight.w900)),
          const SizedBox(height: 8),
          const Text('Choose the time left before your exam.', style: TextStyle(color: _muted)),
          const SizedBox(height: 18),
          for (final option in options)
            GestureDetector(
              onTap: () => controller.setTimeLeft(option.$1),
              child: Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: controller.timeLeft == option.$1 ? _purple.withOpacity(0.16) : Colors.white.withOpacity(0.06),
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: controller.timeLeft == option.$1 ? _purple : Colors.white10),
                ),
                child: Row(
                  children: [
                    Icon(option.$3, color: controller.timeLeft == option.$1 ? _purple : _muted),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(option.$1.toUpperCase(), style: const TextStyle(fontWeight: FontWeight.w800)),
                          Text(option.$2, style: const TextStyle(color: _muted, fontSize: 12)),
                        ],
                      ),
                    ),
                    if (controller.timeLeft == option.$1) const Icon(Icons.check_circle, color: _cyan),
                  ],
                ),
              ),
            ),
          PrimaryButton(label: 'Ignite LastNight Agent', onPressed: controller.analyze),
        ],
      ),
    );
  }
}

class ProgressScreen extends StatelessWidget {
  const ProgressScreen({required this.controller, super.key});
  final AppController controller;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(22),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TopBar(controller: controller),
          const SizedBox(height: 32),
          const Text('Agent Scene Execution', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900)),
          const SizedBox(height: 12),
          LinearProgressIndicator(value: controller.progress, color: _cyan, backgroundColor: Colors.white10),
          const SizedBox(height: 20),
          Expanded(
            child: ListView(
              children: controller.logs
                  .map((log) => Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: Text('> $log', style: const TextStyle(color: _cyan, fontFamily: 'monospace')),
                      ))
                  .toList(),
            ),
          ),
        ],
      ),
    );
  }
}

class ResultsScreen extends StatelessWidget {
  const ResultsScreen({required this.controller, super.key});
  final AppController controller;

  @override
  Widget build(BuildContext context) {
    final result = controller.result;
    if (result == null) {
      return Center(child: PrimaryButton(label: 'Back To Upload', onPressed: () => controller.go(Screen.upload)));
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(22),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TopBar(controller: controller),
          const SizedBox(height: 22),
          Text(result.subjectName, style: const TextStyle(fontSize: 34, fontWeight: FontWeight.w900)),
          const SizedBox(height: 8),
          Text(result.summary, style: const TextStyle(color: _muted)),
          const SizedBox(height: 16),
          ResultCard(title: result.strategyTitle, body: result.strategyDescription, tag: result.strategyRating),
          SectionTitle('High Priority Topics'),
          ...result.topics.map((topic) => ResultCard(title: topic.name, body: topic.subtopics.join(' • '), tag: topic.weightage)),
          SectionTitle('Important Questions'),
          ...result.questions.map((question) => ResultCard(title: question.question, body: question.answer, tag: question.frequency)),
          SectionTitle('Quick Notes'),
          ...result.notes.map((note) => ResultCard(title: note.heading, body: note.points.join('\n'), tag: 'REVISION')),
          SectionTitle('Viva Prep'),
          ...result.viva.map((item) => ResultCard(title: item.question, body: item.answer, tag: 'VIVA')),
          SectionTitle('Study Plan'),
          ...result.plan.map((item) => ResultCard(title: '${item.timeSlot} • ${item.title}', body: item.description, tag: item.focus)),
          const SizedBox(height: 12),
          PrimaryButton(label: 'Create Another Kit', onPressed: () {
            controller.files = [];
            controller.result = null;
            controller.go(Screen.dashboard);
          }),
        ],
      ),
    );
  }
}

class TopBar extends StatelessWidget {
  const TopBar({required this.controller, super.key});
  final AppController controller;

  @override
  Widget build(BuildContext context) {
    final profile = controller.profile;
    return Row(
      children: [
        const Icon(Icons.psychology, color: _purple),
        const SizedBox(width: 8),
        const Expanded(child: Text('LastNight AI', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18))),
        if (profile != null)
          GestureDetector(
            onTap: () => controller.go(Screen.profile),
            child: CircleAvatar(
              radius: 18,
              backgroundColor: _purple.withOpacity(0.18),
              backgroundImage: profile.avatarBase64 == null ? null : MemoryImage(base64Decode(profile.avatarBase64!)),
              child: profile.avatarBase64 == null ? Text(_initials(profile.fullName), style: const TextStyle(fontWeight: FontWeight.bold, color: _purple)) : null,
            ),
          ),
      ],
    );
  }
}

String _initials(String value) {
  return value
      .trim()
      .split(RegExp(r'\s+'))
      .take(2)
      .map((part) => part.isEmpty ? '' : part[0].toUpperCase())
      .join();
}

class DashboardCard extends StatelessWidget {
  const DashboardCard({required this.icon, required this.title, required this.body, required this.onTap, super.key});
  final IconData icon;
  final String title;
  final String body;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
        padding: const EdgeInsets.all(18),
        decoration: _cardDecoration(),
        child: Row(
          children: [
            Icon(icon, color: _cyan, size: 28),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                  const SizedBox(height: 3),
                  Text(body, style: const TextStyle(color: _muted, fontSize: 13)),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios, size: 16, color: _muted),
          ],
        ),
      ),
    );
  }
}

class UploadTile extends StatelessWidget {
  const UploadTile({required this.icon, required this.title, required this.subtitle, required this.onTap, super.key});
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: _cardDecoration(),
        child: Row(
          children: [
            Icon(icon, color: _cyan, size: 30),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.w800)),
                  Text(subtitle, style: const TextStyle(color: _muted, fontSize: 12)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class FileRow extends StatelessWidget {
  const FileRow({required this.file, required this.onRemove, super.key});
  final StudyFile file;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: _cardDecoration(),
      child: Row(
        children: [
          Icon(file.kind == StudyFileKind.pyq ? Icons.history_edu : Icons.article, color: file.kind == StudyFileKind.pyq ? _cyan : _purple),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(file.name, maxLines: 1, overflow: TextOverflow.ellipsis),
                Text('${file.sizeLabel} • ${file.kind.name.toUpperCase()}', style: const TextStyle(color: _muted, fontSize: 12)),
              ],
            ),
          ),
          IconButton(onPressed: onRemove, icon: const Icon(Icons.close, color: Colors.redAccent)),
        ],
      ),
    );
  }
}

class ResultCard extends StatelessWidget {
  const ResultCard({required this.title, required this.body, required this.tag, super.key});
  final String title;
  final String body;
  final String tag;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: _cardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(child: Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15))),
              const SizedBox(width: 8),
              Text(tag, style: const TextStyle(color: _cyan, fontSize: 11, fontFamily: 'monospace')),
            ],
          ),
          const SizedBox(height: 8),
          Text(body, style: const TextStyle(color: _muted, height: 1.35)),
        ],
      ),
    );
  }
}

class SectionTitle extends StatelessWidget {
  const SectionTitle(this.title, {super.key});
  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 16, bottom: 10),
      child: Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
    );
  }
}

class AppField extends StatelessWidget {
  const AppField({
    required this.label,
    required this.icon,
    this.controller,
    this.initialValue,
    this.onChanged,
    this.obscure = false,
    this.keyboardType,
    super.key,
  });

  final TextEditingController? controller;
  final String? initialValue;
  final ValueChanged<String>? onChanged;
  final String label;
  final IconData icon;
  final bool obscure;
  final TextInputType? keyboardType;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        controller: controller,
        initialValue: controller == null ? initialValue : null,
        onChanged: onChanged,
        obscureText: obscure,
        keyboardType: keyboardType,
        style: const TextStyle(color: Colors.white),
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: Icon(icon, color: _muted),
          filled: true,
          fillColor: Colors.black.withOpacity(0.36),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(18), borderSide: BorderSide.none),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(18), borderSide: const BorderSide(color: Colors.white10)),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(18), borderSide: const BorderSide(color: _purple)),
        ),
      ),
    );
  }
}

class PrimaryButton extends StatelessWidget {
  const PrimaryButton({required this.label, required this.onPressed, super.key});
  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: FilledButton(
        onPressed: onPressed,
        style: FilledButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 16),
          backgroundColor: _violet,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        ),
        child: Text(label.toUpperCase(), style: const TextStyle(letterSpacing: 1.2, fontWeight: FontWeight.w900)),
      ),
    );
  }
}

class SecondaryButton extends StatelessWidget {
  const SecondaryButton({required this.label, required this.onPressed, super.key});
  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 16),
          side: const BorderSide(color: Colors.white24),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        ),
        child: Text(label),
      ),
    );
  }
}

class InfoPanel extends StatelessWidget {
  const InfoPanel({required this.text, super.key});
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: _cyan.withOpacity(0.08), borderRadius: BorderRadius.circular(16), border: Border.all(color: _cyan.withOpacity(0.16))),
      child: Text(text, style: const TextStyle(color: _muted, fontSize: 12)),
    );
  }
}

class ErrorPanel extends StatelessWidget {
  const ErrorPanel({required this.message, super.key});
  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.redAccent.withOpacity(0.12), borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.redAccent.withOpacity(0.24))),
      child: Text(message, style: const TextStyle(color: Colors.redAccent)),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.06),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: Colors.white10),
      ),
      child: Text(label, style: const TextStyle(fontSize: 12, color: _muted)),
    );
  }
}

BoxDecoration _cardDecoration() {
  return BoxDecoration(
    color: _panel.withOpacity(0.86),
    borderRadius: BorderRadius.circular(22),
    border: Border.all(color: Colors.white10),
    boxShadow: [
      BoxShadow(color: Colors.black.withOpacity(0.25), blurRadius: 28, offset: const Offset(0, 16)),
    ],
  );
}
