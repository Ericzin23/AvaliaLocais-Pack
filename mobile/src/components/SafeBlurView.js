import React from 'react';
import { View } from 'react-native';

// Fallback-only Blur wrapper to avoid runtime errors; renders as plain View.
export default function SafeBlurView({ style, children }) {
  return <View style={style}>{children}</View>;
}
