import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';

const COLORS = {
  inputBackground: '#FFFFFF',
  border: '#E5E5EA',
  sendButton: '#007AFF',
  sendButtonDisabled: '#C7C7CC',
  placeholder: '#8E8E93',
  text: '#000000',
  white: '#FFFFFF',
};

interface ChatInputProps {
  onSend: (text: string) => void;
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmedText = text.trim();
    if (trimmedText.length > 0) {
      onSend(trimmedText);
      setText('');
    }
  };

  const isDisabled = text.trim().length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.placeholder}
          multiline
          maxLength={1000}
        />
      </View>
      <TouchableOpacity
        style={[
          styles.sendButton,
          isDisabled && styles.sendButtonDisabled,
        ]}
        onPress={handleSend}
        disabled={isDisabled}
      >
        <Text
          style={[
            styles.sendButtonText,
            isDisabled && styles.sendButtonTextDisabled,
          ]}
        >
          Send
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: COLORS.inputBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'flex-end',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  input: {
    fontSize: 16,
    color: COLORS.text,
    maxHeight: 80,
  },
  sendButton: {
    backgroundColor: COLORS.sendButton,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.sendButtonDisabled,
  },
  sendButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  sendButtonTextDisabled: {
    opacity: 0.5,
  },
});
