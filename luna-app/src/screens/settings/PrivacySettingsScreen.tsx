import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../styles';
import LunaSecurityService, { PrivacySettings, DataRetention } from '../../services/luna-security.service';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'expo-router';
import { useHaptics } from '../../hooks/useHaptics';

interface SettingRowProps {
  icon: string;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon,
  title,
  description,
  value,
  onValueChange,
  disabled = false,
}) => {
  const { trigger } = useHaptics();

  const handleToggle = (newValue: boolean) => {
    trigger('impact');
    onValueChange(newValue);
  };

  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={24} color={colors.primary.main} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={handleToggle}
        trackColor={{ false: colors.neutral.gray3, true: colors.primary.light }}
        thumbColor={value ? colors.primary.main : colors.neutral.gray5}
        ios_backgroundColor={colors.neutral.gray3}
        disabled={disabled}
      />
    </View>
  );
};

export default function PrivacySettingsScreen() {
  const [settings, setSettings] = useState<PrivacySettings>({
    encryptConversations: true,
    allowDataAnalysis: true,
    shareInsightsWithPartner: false,
    deleteDataAfterDays: null,
    anonymizeData: false,
    exportDataAllowed: true,
  });
  const [dataRetention, setDataRetention] = useState<DataRetention>({
    conversationsRetentionDays: 365,
    journalRetentionDays: -1,
    insightsRetentionDays: 180,
    autoDeleteEnabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { user } = useAuth();
  const router = useRouter();
  const { trigger } = useHaptics();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const [privacySettings, retentionSettings] = await Promise.all([
        LunaSecurityService.getPrivacySettings(user.uid),
        LunaSecurityService.getDataRetentionSettings(user.uid),
      ]);
      
      setSettings(privacySettings);
      setDataRetention(retentionSettings);
    } catch (error) {
      console.error('Error loading privacy settings:', error);
      Alert.alert('Erreur', 'Impossible de charger les paramètres');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof PrivacySettings, value: any) => {
    if (!user?.uid) return;

    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      setSaving(true);
      await LunaSecurityService.updatePrivacySettings(user.uid, { [key]: value });
      trigger('success');
    } catch (error) {
      console.error('Error updating privacy setting:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder le paramètre');
      // Revert on error
      setSettings(settings);
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    Alert.alert(
      'Exporter mes données',
      'Tu recevras un fichier contenant toutes tes conversations, entrées de journal et insights. Continuer?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Exporter',
          onPress: async () => {
            try {
              if (!user?.uid) return;
              
              setLoading(true);
              const data = await LunaSecurityService.exportUserData(user.uid);
              
              // In a real app, save to file and share
              Alert.alert('Succès', 'Tes données ont été exportées avec succès!');
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Impossible d\'exporter les données');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAllData = async () => {
    Alert.alert(
      '⚠️ Supprimer toutes mes données',
      'Cette action est IRRÉVERSIBLE. Toutes tes conversations, entrées de journal et insights seront définitivement supprimés. Es-tu sûre?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Je comprends, supprimer',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmation finale',
              'Tape "SUPPRIMER" pour confirmer la suppression définitive de toutes tes données.',
              [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'SUPPRIMER',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      if (!user?.uid) return;
                      
                      setLoading(true);
                      await LunaSecurityService.deleteAllUserData(user.uid);
                      
                      Alert.alert('Données supprimées', 'Toutes tes données ont été supprimées.');
                      router.replace('/auth');
                    } catch (error: any) {
                      Alert.alert('Erreur', error.message || 'Impossible de supprimer les données');
                    } finally {
                      setLoading(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#F5F0FF', '#FFF0F5', '#F0F5FF']}
        style={styles.gradientBackground}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.primary.main} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confidentialité & Sécurité</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Protection des données</Text>
          
          <SettingRow
            icon="lock-closed"
            title="Chiffrer les conversations"
            description="Tes messages avec Luna seront cryptés"
            value={settings.encryptConversations}
            onValueChange={(value) => updateSetting('encryptConversations', value)}
          />

          <SettingRow
            icon="shield-checkmark"
            title="Anonymiser mes données"
            description="Remplace les infos personnelles dans les analyses"
            value={settings.anonymizeData}
            onValueChange={(value) => updateSetting('anonymizeData', value)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analyse et insights</Text>
          
          <SettingRow
            icon="analytics"
            title="Autoriser l'analyse"
            description="Luna peut analyser ton journal pour des insights"
            value={settings.allowDataAnalysis}
            onValueChange={(value) => updateSetting('allowDataAnalysis', value)}
          />

          <SettingRow
            icon="people"
            title="Partager avec partenaire"
            description="Ton/ta partenaire peut voir certains insights"
            value={settings.shareInsightsWithPartner}
            onValueChange={(value) => updateSetting('shareInsightsWithPartner', value)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gestion des données</Text>
          
          <SettingRow
            icon="download"
            title="Autoriser l'export"
            description="Tu peux télécharger toutes tes données"
            value={settings.exportDataAllowed}
            onValueChange={(value) => updateSetting('exportDataAllowed', value)}
          />

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleExportData}
            disabled={!settings.exportDataAllowed}
          >
            <BlurView intensity={90} tint="light" style={styles.actionButtonBlur}>
              <Ionicons name="cloud-download" size={20} color={colors.primary.main} />
              <Text style={styles.actionButtonText}>Exporter mes données</Text>
            </BlurView>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rétention des données</Text>
          
          <View style={styles.retentionInfo}>
            <View style={styles.retentionRow}>
              <Text style={styles.retentionLabel}>Conversations:</Text>
              <Text style={styles.retentionValue}>
                {dataRetention.conversationsRetentionDays === -1 
                  ? 'Jamais supprimées' 
                  : `${dataRetention.conversationsRetentionDays} jours`}
              </Text>
            </View>
            
            <View style={styles.retentionRow}>
              <Text style={styles.retentionLabel}>Journal:</Text>
              <Text style={styles.retentionValue}>
                {dataRetention.journalRetentionDays === -1 
                  ? 'Jamais supprimé' 
                  : `${dataRetention.journalRetentionDays} jours`}
              </Text>
            </View>
            
            <View style={styles.retentionRow}>
              <Text style={styles.retentionLabel}>Insights:</Text>
              <Text style={styles.retentionValue}>
                {dataRetention.insightsRetentionDays === -1 
                  ? 'Jamais supprimés' 
                  : `${dataRetention.insightsRetentionDays} jours`}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Zone dangereuse</Text>
          <Text style={styles.dangerDescription}>
            Actions irréversibles. Procède avec prudence.
          </Text>
          
          <TouchableOpacity 
            style={styles.dangerButton} 
            onPress={handleDeleteAllData}
          >
            <Ionicons name="trash" size={20} color={colors.error} />
            <Text style={styles.dangerButtonText}>Supprimer toutes mes données</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Luna prend ta vie privée très au sérieux. Tes données ne sont jamais vendues 
            ou partagées avec des tiers. Consulte notre politique de confidentialité pour plus de détails.
          </Text>
        </View>
      </ScrollView>

      {saving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator color={colors.white} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(147, 112, 219, 0.1)',
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  settingIcon: {
    width: 40,
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  settingTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  actionButton: {
    marginTop: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(147, 112, 219, 0.1)',
  },
  actionButtonText: {
    ...typography.button,
    color: colors.primary.main,
    marginLeft: spacing.sm,
  },
  retentionInfo: {
    backgroundColor: 'rgba(147, 112, 219, 0.05)',
    borderRadius: 12,
    padding: spacing.md,
  },
  retentionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  retentionLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  retentionValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  dangerZone: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    backgroundColor: 'rgba(255, 0, 0, 0.02)',
  },
  dangerTitle: {
    ...typography.h3,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  dangerDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
  },
  dangerButtonText: {
    ...typography.button,
    color: colors.error,
    marginLeft: spacing.sm,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  footerText: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  savingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});