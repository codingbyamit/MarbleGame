// // src/screens/DifficultyScreen.js
// import React from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
// } from 'react-native';

// const { width } = Dimensions.get('window');

// function DifficultyScreen({ navigation }) {
//   const levels = [
//     {
//       key: 'easy',
//       emoji: '😊',
//       label: 'Easy',
//       desc: 'AI plays random valid moves',
//       color: '#4CAF50',
//     },
//     {
//       key: 'medium',
//       emoji: '🤔',
//       label: 'Medium',
//       desc: 'Minimax algorithm (depth 2)',
//       color: '#FF9800',
//     },
//     {
//       key: 'hard',
//       emoji: '😈',
//       label: 'Hard',
//       desc: 'Alpha-Beta pruning (depth 4)',
//       color: '#F44336',
//     },
//   ];

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>⚔️ Select Difficulty</Text>
//       <Text style={styles.subtitle}>Choose your AI opponent</Text>

//       {levels.map((item) => (
//         <TouchableOpacity
//           key={item.key}
//           style={[styles.card, { borderColor: item.color }]}
//           activeOpacity={0.8}
//           onPress={() =>
//             navigation.navigate('Game', {
//               mode: 'ai',
//               difficulty: item.key,
//             })
//           }
//         >
//           <Text style={styles.cardEmoji}>{item.emoji}</Text>
//           <View style={styles.cardText}>
//             <Text style={[styles.cardTitle, { color: item.color }]}>
//               {item.label}
//             </Text>
//             <Text style={styles.cardDesc}>{item.desc}</Text>
//           </View>
//           <Text style={styles.arrow}>›</Text>
//         </TouchableOpacity>
//       ))}

//       <TouchableOpacity
//         style={styles.backBtn}
//         onPress={() => navigation.goBack()}
//       >
//         <Text style={styles.backText}>← Back to Menu</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#0d0d1a',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 25,
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: 'bold',
//     color: '#FFD700',
//     marginBottom: 5,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#777',
//     marginBottom: 40,
//   },
//   card: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#1a1a2e',
//     borderWidth: 2,
//     borderRadius: 16,
//     paddingVertical: 20,
//     paddingHorizontal: 20,
//     width: width * 0.85,
//     marginBottom: 15,
//   },
//   cardEmoji: {
//     fontSize: 36,
//     marginRight: 15,
//   },
//   cardText: {
//     flex: 1,
//   },
//   cardTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   cardDesc: {
//     fontSize: 12,
//     color: '#999',
//     marginTop: 3,
//   },
//   arrow: {
//     fontSize: 30,
//     color: '#555',
//   },
//   backBtn: {
//     marginTop: 35,
//     paddingVertical: 12,
//     paddingHorizontal: 30,
//   },
//   backText: {
//     color: '#FFD700',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

// export default DifficultyScreen;


// src/screens/DifficultyScreen.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import soundManager from '../utils/SoundManager';

const { width } = Dimensions.get('window');

function DifficultyScreen({ navigation }) {
  const levels = [
    {
      key: 'easy',
      emoji: '😊',
      label: 'Easy',
      desc: 'AI plays random valid moves',
      color: '#4CAF50',
    },
    {
      key: 'medium',
      emoji: '🤔',
      label: 'Medium',
      desc: 'Minimax algorithm (depth 2)',
      color: '#FF9800',
    },
    {
      key: 'hard',
      emoji: '😈',
      label: 'Hard',
      desc: 'Alpha-Beta pruning (depth 4)',
      color: '#F44336',
    },
  ];

  const handleSelect = (key) => {
    soundManager.playButtonTap();
    navigation.navigate('Game', { mode: 'ai', difficulty: key });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚔️ Select Difficulty</Text>
      <Text style={styles.subtitle}>Choose your AI opponent</Text>

      {levels.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={[styles.card, { borderColor: item.color }]}
          activeOpacity={0.8}
          onPress={() => handleSelect(item.key)}
        >
          <Text style={styles.cardEmoji}>{item.emoji}</Text>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, { color: item.color }]}>
              {item.label}
            </Text>
            <Text style={styles.cardDesc}>{item.desc}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => {
          soundManager.playButtonTap();
          navigation.goBack();
        }}
      >
        <Text style={styles.backText}>← Back to Menu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d1a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    marginBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    width: width * 0.85,
    marginBottom: 15,
  },
  cardEmoji: {
    fontSize: 36,
    marginRight: 15,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardDesc: {
    fontSize: 12,
    color: '#999',
    marginTop: 3,
  },
  arrow: {
    fontSize: 30,
    color: '#555',
  },
  backBtn: {
    marginTop: 35,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  backText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DifficultyScreen;
