import 'package:cloud_firestore/cloud_firestore.dart';

class UserModel {
  final String uid;
  final String email;
  final String displayName;
  final String? photoUrl;
  final DateTime dateOfBirth;
  final String? birthTime;
  final String? birthLocation;
  final String zodiacSign;
  final String? ascendant;
  final String? moonSign;
  final PersonalityProfile? personalityProfile;
  final List<String> relationshipGoals;
  final Map<String, dynamic>? preferences;
  final DateTime createdAt;
  final DateTime? lastActive;
  final bool isOnboarded;
  final String? avatarId;

  UserModel({
    required this.uid,
    required this.email,
    required this.displayName,
    this.photoUrl,
    required this.dateOfBirth,
    this.birthTime,
    this.birthLocation,
    required this.zodiacSign,
    this.ascendant,
    this.moonSign,
    this.personalityProfile,
    required this.relationshipGoals,
    this.preferences,
    required this.createdAt,
    this.lastActive,
    required this.isOnboarded,
    this.avatarId,
  });

  factory UserModel.fromFirestore(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    return UserModel(
      uid: doc.id,
      email: data['email'] ?? '',
      displayName: data['displayName'] ?? '',
      photoUrl: data['photoUrl'],
      dateOfBirth: (data['dateOfBirth'] as Timestamp).toDate(),
      birthTime: data['birthTime'],
      birthLocation: data['birthLocation'],
      zodiacSign: data['zodiacSign'] ?? '',
      ascendant: data['ascendant'],
      moonSign: data['moonSign'],
      personalityProfile: data['personalityProfile'] != null
          ? PersonalityProfile.fromMap(data['personalityProfile'])
          : null,
      relationshipGoals: List<String>.from(data['relationshipGoals'] ?? []),
      preferences: data['preferences'],
      createdAt: (data['createdAt'] as Timestamp).toDate(),
      lastActive: data['lastActive'] != null
          ? (data['lastActive'] as Timestamp).toDate()
          : null,
      isOnboarded: data['isOnboarded'] ?? false,
      avatarId: data['avatarId'],
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'email': email,
      'displayName': displayName,
      'photoUrl': photoUrl,
      'dateOfBirth': Timestamp.fromDate(dateOfBirth),
      'birthTime': birthTime,
      'birthLocation': birthLocation,
      'zodiacSign': zodiacSign,
      'ascendant': ascendant,
      'moonSign': moonSign,
      'personalityProfile': personalityProfile?.toMap(),
      'relationshipGoals': relationshipGoals,
      'preferences': preferences,
      'createdAt': Timestamp.fromDate(createdAt),
      'lastActive': lastActive != null ? Timestamp.fromDate(lastActive!) : null,
      'isOnboarded': isOnboarded,
      'avatarId': avatarId,
    };
  }
}

class PersonalityProfile {
  final Map<String, int> traits;
  final List<String> strengths;
  final List<String> growthAreas;
  final String communicationStyle;
  final String attachmentStyle;
  final List<String> values;
  final List<String> interests;

  PersonalityProfile({
    required this.traits,
    required this.strengths,
    required this.growthAreas,
    required this.communicationStyle,
    required this.attachmentStyle,
    required this.values,
    required this.interests,
  });

  factory PersonalityProfile.fromMap(Map<String, dynamic> map) {
    return PersonalityProfile(
      traits: Map<String, int>.from(map['traits'] ?? {}),
      strengths: List<String>.from(map['strengths'] ?? []),
      growthAreas: List<String>.from(map['growthAreas'] ?? []),
      communicationStyle: map['communicationStyle'] ?? '',
      attachmentStyle: map['attachmentStyle'] ?? '',
      values: List<String>.from(map['values'] ?? []),
      interests: List<String>.from(map['interests'] ?? []),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'traits': traits,
      'strengths': strengths,
      'growthAreas': growthAreas,
      'communicationStyle': communicationStyle,
      'attachmentStyle': attachmentStyle,
      'values': values,
      'interests': interests,
    };
  }
}