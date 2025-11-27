import { ScrollView, StyleSheet, View } from 'react-native';
import Message from '../components/Message';
import ChatInput from '../components/ChatInput';
import { Message as MessageType } from '../types/message';

const COLORS = {
  background: '#f5f5f5',
};

// Placeholder messages for preview
const PLACEHOLDER_MESSAGES: MessageType[] = [
  {
    id: '1',
    text: 'Hello! How can I help you today?',
    sender: 'ai',
    timestamp: new Date(Date.now() - 10000),
  },
  {
    id: '2',
    text: 'I need help with my personal training routine.',
    sender: 'user',
    timestamp: new Date(Date.now() - 8000),
  },
  {
    id: '3',
    text: 'I\'d be happy to help! What are your fitness goals? Are you looking to build muscle, lose weight, improve endurance, or something else?',
    sender: 'ai',
    timestamp: new Date(Date.now() - 5000),
  },
  {
    id: '4',
    text: 'I want to build muscle and get stronger.',
    sender: 'user',
    timestamp: new Date(Date.now() - 3000),
  },
  {
    id: '5',
    text: 'Great! Building muscle requires a combination of resistance training, proper nutrition, and adequate rest. How many days per week can you commit to working out?',
    sender: 'ai',
    timestamp: new Date(Date.now() - 1000),
  },
];

export default function ChatScreen() {
  const handleSend = (text: string) => {
    // Temporary handler - will be implemented in next steps
    console.log('Message sent:', text);
  };

  return (
    <View style={styles.container}>
      {/* Messages container */}
      <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
        {PLACEHOLDER_MESSAGES.map((message) => (
          <Message key={message.id} message={message} />
        ))}
      </ScrollView>

      {/* Input container */}
      <ChatInput onSend={handleSend} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 8,
  },
});
