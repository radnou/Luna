import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Text,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '@styles/index';
import { ChatHeader } from '@components/chat/ChatHeader';
import { ChatBubble } from '@components/chat/ChatBubble';
import { ChatInput } from '@components/chat/ChatInput';
import { TypingIndicator } from '@components/chat/TypingIndicator';
import { QuickReplies } from '@components/chat/QuickReplies';
import ChatService from '@services/chat.service';
import AIService from '@services/ai.service';
import { useAuth } from '@hooks/useAuth';
import { useRouter } from 'expo-router';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    mood?: string;
    suggestions?: string[];
  };
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    initializeChat();
    return () => {
      ChatService.cleanup();
    };
  }, []);

  const initializeChat = async () => {
    try {
      if (!user?.uid) return;
      
      // Create or get existing chat session
      const sessions = await ChatService.getChatSessions(user.uid);
      let roomId = sessions[0]?.id;
      
      if (!roomId) {
        roomId = await ChatService.createChatSession(user.uid, 'Chat avec Luna');
      }
      
      setChatRoomId(roomId);
      
      // Listen to messages
      const unsubscribe = ChatService.listenToMessages(roomId, (newMessages) => {
        setMessages(newMessages);
        scrollToBottom();
      });
      
      setLoading(false);
      
      // Get initial quick replies
      const replies = await ChatService.getQuickReplies('initial');
      setQuickReplies(replies);
      
    } catch (error) {
      console.error('Error initializing chat:', error);
      setLoading(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!chatRoomId || !user?.uid) return;
    
    try {
      setIsTyping(true);
      setQuickReplies([]);
      
      // Check for crisis keywords
      const needsCrisisSupport = await AIService.detectCrisisSupport(text);
      if (needsCrisisSupport) {
        const resources = AIService.getCrisisResources();
        Alert.alert(
          'Tu n\'es pas seule 💙',
          resources.message,
          [
            { text: 'Voir les ressources', onPress: () => showCrisisResources(resources) },
            { text: 'Continuer', style: 'cancel' }
          ]
        );
      }
      
      // Send message and get response
      const response = await ChatService.sendMessage(chatRoomId, text);
      
      // Update quick replies based on response
      if (response.metadata?.suggestions) {
        const replies = response.metadata.suggestions.map((text, index) => ({
          id: `reply-${index}`,
          text
        }));
        setQuickReplies(replies);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le message. Réessaye plus tard.');
    } finally {
      setIsTyping(false);
    }
  };

  const showCrisisResources = (resources: any) => {
    Alert.alert(
      'Ressources d\'aide',
      resources.resources.map((r: any) => `${r.name}: ${r.number || r.text}`).join('\n\n'),
      [{ text: 'OK' }]
    );
  };

  const handleQuickReply = (reply: any) => {
    sendMessage(reply.text);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    return (
      <ChatBubble
        message={item}
        showAvatar={item.role === 'assistant' && (index === 0 || messages[index - 1]?.role !== 'assistant')}
        isNewMessage={index === messages.length - 1}
      />
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Luna arrive...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F5F0FF', '#FFF0F5', '#F0F5FF']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <ChatHeader
        onBack={() => router.back()}
        onOptions={() => {}}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
          ListFooterComponent={
            <>
              {isTyping && <TypingIndicator />}
              {quickReplies.length > 0 && (
                <QuickReplies
                  replies={quickReplies}
                  onPress={handleQuickReply}
                  visible={!isTyping}
                />
              )}
            </>
          }
        />
        
        <ChatInput
          onSendMessage={sendMessage}
          onAttachment={() => {}}
          onVoiceNote={() => {}}
          disabled={isTyping}
        />
      </KeyboardAvoidingView>
    </View>
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
  keyboardAvoid: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.primary.main,
    marginTop: spacing.md,
  },
});