import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { theme } from '../styles/theme';

export const CreateListScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Create List" showBack />
      <View style={styles.content}>
        <Text style={styles.text}>Create List Screen - Coming Soon</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: theme.colors.text,
    fontSize: 16,
  },
}); 