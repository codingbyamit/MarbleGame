// // App.js
// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import HomeScreen from './src/screens/HomeScreen';
// import GameScreen from './src/screens/GameScreen';
// import DifficultyScreen from './src/screens/DifficultyScreen';

// const Stack = createStackNavigator();

// function App() {
//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <NavigationContainer>
//         <Stack.Navigator
//           screenOptions={{ headerShown: false }}
//           initialRouteName="Home"
//         >
//           <Stack.Screen name="Home" component={HomeScreen} />
//           <Stack.Screen name="Difficulty" component={DifficultyScreen} />
//           <Stack.Screen name="Game" component={GameScreen} />
//         </Stack.Navigator>
//       </NavigationContainer>
//     </GestureHandlerRootView>
//   );
// }

// export default App;

// App.js
// import React, { useEffect } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import HomeScreen from './src/screens/HomeScreen';
// import GameScreen from './src/screens/GameScreen';
// import DifficultyScreen from './src/screens/DifficultyScreen';
// import SoundManager from './src/utils/SoundManager';   // ⭐ ADD

// const Stack = createStackNavigator();

// function App() {
//   // ⭐ ADD: Load sounds on app start
//   useEffect(() => {
//     SoundManager.loadSounds();
//     return () => {
//       SoundManager.release();
//     };
//   }, []);

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <NavigationContainer>
//         <Stack.Navigator
//           screenOptions={{ headerShown: false }}
//           initialRouteName="Home"
//         >
//           <Stack.Screen name="Home" component={HomeScreen} />
//           <Stack.Screen name="Difficulty" component={DifficultyScreen} />
//           <Stack.Screen name="Game" component={GameScreen} />
//         </Stack.Navigator>
//       </NavigationContainer>
//     </GestureHandlerRootView>
//   );
// }

// export default App;


// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import DifficultyScreen from './src/screens/DifficultyScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createStackNavigator();

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName="Home"
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Difficulty" component={DifficultyScreen} />
          <Stack.Screen name="Game" component={GameScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default App;
