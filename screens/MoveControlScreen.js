import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import {WebView} from 'react-native-webview';
import { Alert } from 'react-native';
import { set } from 'firebase/database';

const MoveControl = ({ route }) => {
  const { firestoreData, userId, firebaseAuth, raspyIp, espIp } = route.params.params;
  
  const [isSending, setIsSending] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [raspyUrl, setRaspyUrl] = useState(`http://${raspyIp}:5001/video_feed`); // Initialize the URL state with video_feed
  const [espUrl, setEspUrl] = useState(`http://${espIp}:80`); 
  
  const sendRequest = async (endpoint) => {
    try {
      const response = await fetch(`${espUrl}/${endpoint}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      console.log(`Request to ${endpoint} sent successfully`);
    } catch (error) {
      Alert.alert(
        'Cannot control the robot right now.',
        'Ensure that the robot is turned on',
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
    );
    }
  };

  const handlePressIn = (endpoint) => {
    setIsSending(true);
    console.log(isSending);
    sendRequest(endpoint);
  };

  const handleLongPress = (endpoint) => {
    setIsSending(true);
    sendRequest(endpoint);
    const id = setInterval(() => {
      sendRequest(endpoint);
    }, 200); 
    setIntervalId(id);
  };

  const handlePressOut = () => {
    setIsSending(false);
    console.log(isSending);
    clearInterval(intervalId);
    setIntervalId(null);
  };

  const handleWebViewError = (error) => {
    console.log(error);
    Alert.alert(
      'Could not connect to robot',
      'Make sure it is turned on.',
      [
        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        { text: 'Retry', onPress: () => {setRaspyUrl(`http://${raspyIp}:5001/video_feed`); console.log("retry")}},
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
    <View style={styles.webViewContainer}>
      <WebView
        key = {raspyUrl}
        style={styles.webView}
        source={{ uri: raspyUrl }}
        onLoad={() => console.log('loaded')} 
        onError={handleWebViewError}
      /> 
    </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.buttonWrapper, styles.topButton, isSending && styles.buttonPressed]}
          onPressIn={() => handlePressIn('up')}
          onPressOut={handlePressOut}
          onLongPress={() => handleLongPress('up')}
        >
          <Text style={styles.buttonText}>↑</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buttonWrapper, styles.bottomButton, isSending && styles.buttonPressed]}
          onPressIn={() => handlePressIn('down')}
          onPressOut={handlePressOut}
          onLongPress={() => handleLongPress('down')}
        >
          <Text style={styles.buttonText}>↓</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buttonWrapper, styles.leftButton, isSending && styles.buttonPressed]}
          onPressIn={() => handlePressIn('left')}
          onPressOut={handlePressOut}
          onLongPress={() => handleLongPress('left')}
        >
          <Text style={styles.buttonText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buttonWrapper, styles.rightButton, isSending && styles.buttonPressed]}
          onPressIn={() => handlePressIn('right')}
          onPressOut={handlePressOut}
          onLongPress={() => handleLongPress('right')}
        >
          <Text style={styles.buttonText}>→</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webViewContainer: {
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  webView: {
    width: 300,
    height: 300,
  },
  buttonContainer: {
    position: 'absolute',
    top: 500, 
    left: 170,
    width: 100,
    height: 100,
    marginTop: 20,
  },
  buttonWrapper: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#2F897C', 
    borderWidth: 2
  },
  buttonText: {
    fontSize: 24,
  },
  topButton: {
    top: 0,
    left: 10,
  },
  bottomButton: {
    bottom: -50,
    left: 10,
  },
  leftButton: {
    top: 50,
    left: -40,
  },
  rightButton: {
    top: 50,
    right: -10,
  },
  buttonPressed: {
    backgroundColor: 'lightgray',
  },
});

export default MoveControl;