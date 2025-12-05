import { View, ActivityIndicator, StyleSheet } from 'react-native';

const COLORS = {
  background: '#f5f5f5',
  primary: '#007AFF',
};

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
