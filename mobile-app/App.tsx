import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ScannerScreen } from './src/screens/ScannerScreen';
import { CollectionScreen } from './src/screens/CollectionScreen';
import { DetailsScreen } from './src/screens/DetailsScreen';
import CreateListScreen from './src/screens/CreateListScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen 
              name="Scanner" 
              component={ScannerScreen}
              options={{ title: 'Scan Funko' }}
            />
            <Stack.Screen 
              name="Collection" 
              component={CollectionScreen}
              options={{ title: 'My Collection' }}
            />
            <Stack.Screen 
              name="Details" 
              component={DetailsScreen}
              options={{ title: 'Funko Details' }}
            />
            <Stack.Screen 
              name="CreateList" 
              component={CreateListScreen}
              options={{ title: 'Create List' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
} 