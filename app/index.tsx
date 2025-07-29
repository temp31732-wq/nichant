import React from 'react';
import { View, StyleSheet } from 'react-native';
import Calculator from '../src/components/Calculator';

export default function Index() {
  return (
    <View style={styles.container}>
      <Calculator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});