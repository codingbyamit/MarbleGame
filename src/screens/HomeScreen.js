// // src/screens/HomeScreen.js
// import React from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   StatusBar,
//   Dimensions,
// } from 'react-native';

// const { width } = Dimensions.get('window');

// function HomeScreen({ navigation }) {
//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#0d0d1a" />

//       {/* Logo Area */}
//       <View style={styles.logoArea}>
//         <Text style={styles.emoji}>🔮</Text>
//         <Text style={styles.title}>MARBLE</Text>
//         <Text style={styles.subtitle}>GAME</Text>
//         <View style={styles.line} />
//         <Text style={styles.tagline}>Hexagonal Strategy Board Game</Text>
//       </View>

//       {/* Buttons */}
//       <View style={styles.buttonArea}>
//         <TouchableOpacity
//           style={styles.primaryBtn}
//           activeOpacity={0.8}
//           onPress={() => navigation.navigate('Difficulty')}
//         >
//           <Text style={styles.btnText}>🤖  Play vs AI</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.secondaryBtn}
//           activeOpacity={0.8}
//           onPress={() =>
//             navigation.navigate('Game', {
//               mode: '2player',
//               difficulty: null,
//             })
//           }
//         >
//           <Text style={styles.btnText}>👥  2 Player Local</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.tertiaryBtn}
//           activeOpacity={0.8}
//           onPress={() => {}}
//         >
//           <Text style={styles.btnTextDim}>⚙️  Settings</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Footer */}
//       <Text style={styles.footer}>v1.0.0 • Made with ❤️</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#0d0d1a',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 30,
//   },
//   logoArea: {
//     alignItems: 'center',
//     marginBottom: 60,
//   },
//   emoji: {
//     fontSize: 60,
//     marginBottom: 10,
//   },
//   title: {
//     fontSize: 44,
//     fontWeight: '900',
//     color: '#FFD700',
//     letterSpacing: 10,
//   },
//   subtitle: {
//     fontSize: 32,
//     fontWeight: '200',
//     color: '#FFFFFF',
//     letterSpacing: 15,
//     marginTop: -5,
//   },
//   line: {
//     width: 60,
//     height: 2,
//     backgroundColor: '#FFD700',
//     marginVertical: 15,
//     borderRadius: 1,
//   },
//   tagline: {
//     fontSize: 13,
//     color: '#666',
//     letterSpacing: 2,
//   },
//   buttonArea: {
//     width: '100%',
//     alignItems: 'center',
//   },
//   primaryBtn: {
//     backgroundColor: '#FFD700',
//     paddingVertical: 17,
//     borderRadius: 30,
//     width: width * 0.75,
//     alignItems: 'center',
//     marginBottom: 14,
//     elevation: 8,
//     shadowColor: '#FFD700',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//   },
//   secondaryBtn: {
//     backgroundColor: 'transparent',
//     paddingVertical: 17,
//     borderRadius: 30,
//     width: width * 0.75,
//     alignItems: 'center',
//     marginBottom: 14,
//     borderWidth: 2,
//     borderColor: '#FFD700',
//   },
//   tertiaryBtn: {
//     backgroundColor: '#1a1a2e',
//     paddingVertical: 17,
//     borderRadius: 30,
//     width: width * 0.75,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#333',
//   },
//   btnText: {
//     fontSize: 17,
//     fontWeight: '700',
//     color: '#FFFFFF',
//   },
//   btnTextDim: {
//     fontSize: 17,
//     fontWeight: '600',
//     color: '#888',
//   },
//   footer: {
//     position: 'absolute',
//     bottom: 30,
//     fontSize: 12,
//     color: '#444',
//   },
// });

// export default HomeScreen;


// src/screens/HomeScreen.js
import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import soundManager from '../utils/SoundManager';

const { width } = Dimensions.get('window');

function HomeScreen({ navigation }) {
  useEffect(() => {
    soundManager.init();
  }, []);

  const handlePress = (action) => {
    soundManager.playButtonTap();
    action();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d0d1a" />

      {/* Logo Area */}
      <View style={styles.logoArea}>
        <Text style={styles.emoji}>🔮</Text>
        <Text style={styles.title}>MARBLE</Text>
        <Text style={styles.subtitle}>GAME</Text>
        <View style={styles.line} />
        <Text style={styles.tagline}>Hexagonal Strategy Board Game</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonArea}>
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.8}
          onPress={() => handlePress(() => navigation.navigate('Difficulty'))}
        >
          <Text style={styles.btnText}>🤖  Play vs AI</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          activeOpacity={0.8}
          onPress={() =>
            handlePress(() =>
              navigation.navigate('Game', {
                mode: '2player',
                difficulty: null,
              })
            )
          }
        >
          <Text style={styles.btnText}>👥  2 Player Local</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tertiaryBtn}
          activeOpacity={0.8}
          onPress={() => handlePress(() => navigation.navigate('Settings'))}
        >
          <Text style={styles.btnTextDim}>⚙️  Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>v1.0.0 • Made with ❤️</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d1a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 60,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 10,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: '200',
    color: '#FFFFFF',
    letterSpacing: 15,
    marginTop: -5,
  },
  line: {
    width: 60,
    height: 2,
    backgroundColor: '#FFD700',
    marginVertical: 15,
    borderRadius: 1,
  },
  tagline: {
    fontSize: 13,
    color: '#666',
    letterSpacing: 2,
  },
  buttonArea: {
    width: '100%',
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: '#FFD700',
    paddingVertical: 17,
    borderRadius: 30,
    width: width * 0.75,
    alignItems: 'center',
    marginBottom: 14,
    elevation: 8,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    paddingVertical: 17,
    borderRadius: 30,
    width: width * 0.75,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  tertiaryBtn: {
    backgroundColor: '#1a1a2e',
    paddingVertical: 17,
    borderRadius: 30,
    width: width * 0.75,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  btnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnTextDim: {
    fontSize: 17,
    fontWeight: '600',
    color: '#888',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    fontSize: 12,
    color: '#444',
  },
});

export default HomeScreen;
