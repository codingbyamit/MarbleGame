// src/screens/SettingsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Dimensions,
} from 'react-native';
import soundManager from '../utils/SoundManager';

const { width } = Dimensions.get('window');

function SettingsScreen({ navigation }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(3); // 1-5 scale

  useEffect(() => {
    soundManager.init();
  }, []);

  const toggleSound = (val) => {
    setSoundEnabled(val);
    soundManager.setSoundEnabled(val);
    if (val) soundManager.playButtonTap();
  };

  const changeVolume = (newVol) => {
    setVolume(newVol);
    const normalized = newVol / 5;
    soundManager.setVolume(normalized);
    soundManager.playMarbleSelect();
  };

  const rows = [
    {
      label: '🔊 Sound Effects',
      desc: 'Marble clicks, push, win sounds',
      control: (
        <Switch
          value={soundEnabled}
          onValueChange={toggleSound}
          trackColor={{ false: '#333', true: '#FFD700' }}
          thumbColor={soundEnabled ? '#fff' : '#888'}
        />
      ),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ Settings</Text>

      {/* Sound toggle */}
      {rows.map((row, i) => (
        <View key={i} style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>{row.label}</Text>
            <Text style={styles.rowDesc}>{row.desc}</Text>
          </View>
          {row.control}
        </View>
      ))}

      {/* Volume bar */}
      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.rowLabel}>🎚️ Volume</Text>
          <Text style={styles.rowDesc}>
            {['🔇', '🔈', '🔉', '🔊', '📢'][volume - 1]} Level {volume}/5
          </Text>
        </View>
        <View style={styles.volButtons}>
          {[1, 2, 3, 4, 5].map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.volDot, volume >= v && styles.volDotActive]}
              onPress={() => changeVolume(v)}
            />
          ))}
        </View>
      </View>

      {/* Sound test buttons */}
      <Text style={styles.sectionTitle}>Test Sounds</Text>
      <View style={styles.testGrid}>
        {[
          { label: '🖱️ Click', fn: () => soundManager.playMarbleClick() },
          { label: '✅ Select', fn: () => soundManager.playMarbleSelect() },
          { label: '➡️ Move', fn: () => soundManager.playMarbleMove() },
          { label: '👊 Push', fn: () => soundManager.playMarblePush() },
          { label: '💥 Fall', fn: () => soundManager.playMarbleFall() },
          { label: '🏆 Win', fn: () => soundManager.playWin() },
        ].map((btn, i) => (
          <TouchableOpacity
            key={i}
            style={styles.testBtn}
            onPress={btn.fn}
            activeOpacity={0.7}
          >
            <Text style={styles.testBtnText}>{btn.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => {
          soundManager.playButtonTap();
          navigation.goBack();
        }}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d1a',
    paddingHorizontal: 25,
    paddingTop: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 35,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#2a2a40',
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  rowDesc: {
    color: '#777',
    fontSize: 12,
    marginTop: 3,
  },
  volButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  volDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#555',
  },
  volDotActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  sectionTitle: {
    color: '#666',
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 12,
    marginLeft: 4,
  },
  testGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 30,
  },
  testBtn: {
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#FFD700',
    width: (width - 70) / 3,
    alignItems: 'center',
  },
  testBtnText: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '600',
  },
  backBtn: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  backText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;
