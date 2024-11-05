import { View, Text} from "react-native";
import React from "react";
import HomeScreen from "./HomeScreen"
import ActivityScreen from "./ActivityScreen";
import Settings from "./Settings";
import Controller from "./MoveControlScreen"
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Entypo } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Tab =createBottomTabNavigator();
const screenOptions = {
  tabBarShowLabel:false,
  headerShown:false,
  tabBarStyle:{
    bottom: 0,
    right: 0,
    left: 0,
    elevation: 0,
    height: 60,
    background: "#fff"
  }
}

const Root = ({route, navigation}) => { 
    return (
        <Tab.Navigator screenOptions={screenOptions}>
           <Tab.Screen 
             name="Home" 
             component={HomeScreen} 
             initialParams={route}
             options={{
               tabBarIcon: ({focused})=>{
                 return (
                   <View style={{alignItems: "center", justifyContent: "center"}}> 
                     <Entypo name="home" size={24} color={focused ? "#16247d": "#111"} />
                     <Text style={{fonSize: 12, color: "#16247d"}}>HOME</Text>
                   </View>
                 )
               }
             }}
           />
           <Tab.Screen 
             name="Activity" 
             component={ActivityScreen}
             initialParams={route}
             options={{
               tabBarIcon: ({focused})=>{
                 return (
                   <View style={{alignItems: "center", justifyContent: "center"}}> 
                    <Feather name="activity" size={24} color={focused ? "#16247d": "#111"} />
                     <Text style={{fonSize: 12, color: "#16247d"}}>ACTIVITIES</Text>
                   </View>
                 )
               }
             }}
           />
           <Tab.Screen 
            name="Controller" 
            component={Controller}
            initialParams={route}
              options={{
                tabBarIcon: ({ focused }) => {
                  return (
                    <View style={{ alignItems: "center", justifyContent: "center" }}> 
                      <MaterialCommunityIcons name="controller-classic-outline" size={24} color={focused ? "#16247d" : "#111"} />
                      <Text style={{ fontSize: 12, color: "#16247d" }}>CONTROL</Text>
                    </View>
                  );
                }
              }}
            />    
           <Tab.Screen 
             name="Settings" 
             component={Settings} 
             initialParams={route}
             options={{
               tabBarIcon: ({focused})=>{
                 return (
                   <View style={{alignItems: "center", justifyContent: "center"}}> 
                    <Ionicons name="settings" size={24}  color={focused ? "#16247d": "#111"} />
                     <Text style={{fonSize: 12, color: "#16247d"}}>SETTINGS</Text>
               </View>
                 )
               }
             }}
           />
        </Tab.Navigator>
     )
  }

   export default Root;