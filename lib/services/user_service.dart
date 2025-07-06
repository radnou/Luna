import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/user_model.dart';
import '../utils/zodiac_calculator.dart';

class UserService extends ChangeNotifier {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;
  
  UserModel? _currentUser;
  UserModel? get currentUser => _currentUser;
  
  // Load current user data
  Future<void> loadCurrentUser() async {
    final user = _auth.currentUser;
    if (user != null) {
      final doc = await _firestore.collection('users').doc(user.uid).get();
      if (doc.exists) {
        _currentUser = UserModel.fromFirestore(doc);
        notifyListeners();
      }
    }
  }
  
  // Update user profile
  Future<void> updateUserProfile(Map<String, dynamic> updates) async {
    final user = _auth.currentUser;
    if (user != null) {
      await _firestore.collection('users').doc(user.uid).update(updates);
      await loadCurrentUser();
    }
  }
  
  // Update birth details and calculate zodiac
  Future<void> updateBirthDetails({
    required DateTime dateOfBirth,
    String? birthTime,
    String? birthLocation,
  }) async {
    final user = _auth.currentUser;
    if (user != null) {
      final zodiacSign = ZodiacCalculator.getZodiacSign(dateOfBirth);
      
      await _firestore.collection('users').doc(user.uid).update({
        'dateOfBirth': Timestamp.fromDate(dateOfBirth),
        'birthTime': birthTime,
        'birthLocation': birthLocation,
        'zodiacSign': zodiacSign,
      });
      
      await loadCurrentUser();
    }
  }
  
  // Update personality profile
  Future<void> updatePersonalityProfile(PersonalityProfile profile) async {
    final user = _auth.currentUser;
    if (user != null) {
      await _firestore.collection('users').doc(user.uid).update({
        'personalityProfile': profile.toMap(),
      });
      await loadCurrentUser();
    }
  }
  
  // Update relationship goals
  Future<void> updateRelationshipGoals(List<String> goals) async {
    final user = _auth.currentUser;
    if (user != null) {
      await _firestore.collection('users').doc(user.uid).update({
        'relationshipGoals': goals,
      });
      await loadCurrentUser();
    }
  }
  
  // Complete onboarding
  Future<void> completeOnboarding() async {
    final user = _auth.currentUser;
    if (user != null) {
      await _firestore.collection('users').doc(user.uid).update({
        'isOnboarded': true,
        'lastActive': FieldValue.serverTimestamp(),
      });
      await loadCurrentUser();
    }
  }
  
  // Generate avatar based on zodiac sign
  Future<void> generateZodiacAvatar(String zodiacSign) async {
    final user = _auth.currentUser;
    if (user != null) {
      // This would typically call an AI service to generate an avatar
      // For now, we'll just set a placeholder avatar ID
      final avatarId = 'zodiac_${zodiacSign.toLowerCase()}_${DateTime.now().millisecondsSinceEpoch}';
      
      await _firestore.collection('users').doc(user.uid).update({
        'avatarId': avatarId,
      });
      await loadCurrentUser();
    }
  }
  
  // Update user preferences
  Future<void> updatePreferences(Map<String, dynamic> preferences) async {
    final user = _auth.currentUser;
    if (user != null) {
      await _firestore.collection('users').doc(user.uid).update({
        'preferences': preferences,
      });
      await loadCurrentUser();
    }
  }
}