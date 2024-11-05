// App.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import your custom screens
import LoginScreen from './screens/LoginScreen';
import Root from './screens/Root';

const Stack = createStackNavigator();

const App = () => {
  return (
     <NavigationContainer>
       <Stack.Navigator initialRouteName="Login">
         <Stack.Screen name="Login" component={LoginScreen} />
         <Stack.Screen name="Remy App" component={Root} />
        
       </Stack.Navigator>
     </NavigationContainer>
  );
};

export default App;
