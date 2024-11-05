import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { initializeApp} from "firebase/app";
import { initializeAuth, getReactNativePersistence, createUserWithEmailAndPassword, signInWithEmailAndPassword} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {  getFirestore, addDoc, query, where, collection, getDocs, doc, getDoc} from 'firebase/firestore';
import { FontAwesome } from '@expo/vector-icons';

//Generate firebase crentials and initialize the needed services
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

const FIREBASE_APP = initializeApp(firebaseConfig);
const FIREBASE_FIRESTORE = getFirestore(FIREBASE_APP);
const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
  
      const user = userCredential.user;
      
      const appUsersRef = collection(FIREBASE_FIRESTORE, 'AppUsers');
      const q = query(appUsersRef, where('email', '==', user.email));
      const querySnapshot = await getDocs(q);

      const userIds = [];
      querySnapshot.forEach((doc) => {
      userIds.push(doc.id);
  });
    const ipConfigRef = collection(FIREBASE_FIRESTORE, 'IpConfig');
    const ipDocRef = doc(ipConfigRef, '1');
    const ipDoc = await getDoc(ipDocRef)
    const data = ipDoc.data();
    navigation.navigate('Remy App', {firestoreData: FIREBASE_FIRESTORE, userId: userIds[0], firebaseAuth: FIREBASE_AUTH, raspyIp: data.raspyIp, espIp: data.espIP} );

    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        Alert.alert(
            'Invalid credentials',
            'Please recheck the credentials.',
            [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
        );
      }else
        if (error.code === "auth/missing-password") {
          Alert.alert(
              'Password missing',
              'Please fill in the password field.',
              [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
          );
        }
        else
        if (error.code === "auth/invalid-email") {
          Alert.alert(
              'Invalid email',
              'Please enter a valid email address.',
              [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
          );
        }
        else {
          Alert.alert(
              'Sign Up Error',
              'An error occurred while signing up. Please try again later.',
              [{ text: 'OK', onPress: () => console.log(error) }]
          );
      }
    }
  };

  
  const handleSignUp = async () => {
    console.log("sign up");

    try {
        const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
        
        const user = userCredential.user;

        const appUsersRef = collection(FIREBASE_FIRESTORE, 'AppUsers'); 
        const newUserRef = await addDoc(appUsersRef, {
          email: user.email,
          password: password
        });

        const newUserId = newUserRef.id; 
        const questionsSubcollection = collection(newUserRef, "Questions"); 
        const questionsSubcollectionRef = await addDoc(questionsSubcollection, {
          info:"No question nor answers available at this time"});  
        
        const assessmentSubcollection = collection(newUserRef, "Assessments"); 
        const assessmentSubcollectionRef = await addDoc(assessmentSubcollection, {
          info:"No assessments available at this time"});  
        
        const patientSubcollection = collection(newUserRef, "Patient");
        const patientSubcollectionRef = await addDoc(patientSubcollection, {
          age:"No age available at this time",
          birthdate:"No birth date available at this time",
          name:"No name available at this time",
          residence:"No residence available at this time",
          gender: "No gender available at this time",
          children: "No children available at this time",
          husbandwife: "No husband/wife available at this time",
          maritalstatus: "No marital status available at this time", 
          parents: "No parents available at this time",
        });  
        
        const ipConfigRef = collection(FIREBASE_FIRESTORE, 'IpConfig');
        const ipDocRef = doc(ipConfigRef, '1');
        const ipDoc = await getDoc(ipDocRef)
        const data = ipDoc.data();
        console.log(data)
        navigation.navigate('Remy App', {firestoreData: FIREBASE_FIRESTORE, userId: newUserId, firebaseAuth: FIREBASE_AUTH, raspyIp: data.raspyIp, espIp: data.espIP}); //send route params: firestoreData, userId, firebaseAuth, raspyIp, espIp

    } catch (error) {
        if (error.code === "auth/email-already-in-use") {
            Alert.alert(
                'Email Exists',
                'The provided email already exists. Please use a different email.',
                [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
            );
        } else 
        if (error.code === "auth/invalid-email") {
          Alert.alert(
              'Invalid email',
              'Please enter a valid email address.',
              [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
          );
        }else
        if (error.code === "auth/weak-password") {
          Alert.alert(
              'Password too weak',
              'Password should be at least 6 characters long. Please try again.',
              [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
          );
        }else
        if (error.code === "auth/missing-password") {
          Alert.alert(
              'Password missing',
              'Please fill in the password field.',
              [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
          );
        }else
        {
            Alert.alert(
                'Sign Up Error',
                'An error occurred while signing up. Please try again later.',
                [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
            );
        }
    }
};

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <Text style={styles.logo}>Remy Assistant</Text>
        <View style={styles.inputView}>
          <FontAwesome name="envelope" size={24} color="black" style={styles.icon} />
          <TextInput
            style={styles.inputText}
            placeholder="Email"
            placeholderTextColor="#999"
            onChangeText={(text) => setEmail(text)}
          />
        </View>
        <View style={styles.inputView}>
          <FontAwesome name="lock" size={24} color="black" style={styles.icon} />
          <TextInput
            secureTextEntry
            style={styles.inputText}
            placeholder="Password"
            placeholderTextColor="#999"
            onChangeText={(text) => setPassword(text)}
          />
        </View>
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.loginText}>LOGIN</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerBtn} onPress={handleSignUp}>
          <Text style={styles.registerText}>REGISTER</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0F0FF',
  },
  overlay: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  logo: {
    fontWeight: 'bold',
    fontSize: 32,
    color: '#2F897C',
    marginBottom: 20,
  },
  inputView: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  inputText: {
    flex: 1,
    height: 40,
  },
  loginBtn: {
    width: '100%',
    backgroundColor: '#2F897C',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  loginText: {
    color: 'white',
  },
  registerBtn: {
    width: '100%',
    backgroundColor: '#2F897C',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  registerText: {
    color: 'white',
  },

});

export default LoginScreen;
