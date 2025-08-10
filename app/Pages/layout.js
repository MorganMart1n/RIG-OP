import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './home';
import ProfileScreen from './profile';
import SupportScreen from './support';
import ReportScreen from './report';
import LoginScreen from './Login';
import CreateScreen from './Create';

const Tab = createBottomTabNavigator();
const Stack =createNativeStackNavigator();

function TabLayout() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Support" component={SupportScreen} />
      <Tab.Screen name="Report" component={ReportScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function Layout(){
  return(
  <Stack.Navigator screenOptions={{ headerShown: false}}>
    <Stack.Screen name="Login" component={LoginScreen}/>
      <Stack.Screen name="MainTabs" component={TabLayout}/>
        <Stack.Screen name="Create" component={CreateScreen}/>
</Stack.Navigator>
);

}
