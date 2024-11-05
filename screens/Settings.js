import React, { useEffect, useState } from 'react';
import { View, TextInput, Alert, StyleSheet, KeyboardAvoidingView, ScrollView, Text, Platform, TouchableOpacity } from 'react-native';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, sendEmailVerification } from 'firebase/auth';
import { getDocs, collection, setDoc, doc, deleteDoc} from 'firebase/firestore';
import { query, where } from 'firebase/firestore';
const Settings = ({route, navigation}) => {
    const {firebaseAuth, firestoreData, userId} = route.params.params;
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [verifEmail, setVerifEmail] = useState('');

    useEffect(() => {
        checkVerifEmail();
    },[]);
    

    const handleChangePassword = async () => {
       console.log(firebaseAuth.currentUser);
       
        
        const user = firebaseAuth.currentUser;
        
        if (user && currentPassword && newPassword) {
            try {
                const credential = EmailAuthProvider.credential(
                    user.email,
                    currentPassword
                );
                await reauthenticateWithCredential(user, credential);

                await updatePassword(user, newPassword);
                Alert.alert('Success', 'Password updated successfully');
                
                try { 
                    const appUsersRef = collection(firestoreData, 'AppUsers'); 
                    const q = query(appUsersRef, where('email', '==', user.email)); 
                    const querySnapshot = await getDocs(q); 
                    console.log("Document data:", querySnapshot.docs.map((doc) => doc.data()));
                    if (!querySnapshot.empty) {
                      const firstDocRef = querySnapshot.docs[0].ref;
              
                      let newData = { password: newPassword }; 
                     
                      await setDoc(firstDocRef, newData, { merge: true });
                      console.log("Document successfully written!");
                    } else {
                      console.log("No documents found in the collection.");
                    }
                  } catch (error) {s
                    console.error("Error writing document: ", error);
                  }
            } catch (error) {

                if(error.code .code === 'auth/invalid-credential')
                    Alert.alert('Invalid current password. Try again.');
            }
        } else {
            Alert.alert('Please fill in all fields');
        }
    };

    const deleteAccount = async () => {
        //delete entry from database
        try {
            const docRef = doc(firestoreData, 'AppUsers', userId); 
            await deleteDoc(docRef); 
            console.log(`Document with ID ${userId} deleted successfully.`);
        } catch (error) {
            console.error("Error deleting document:", error);
        }

        const user = firebaseAuth.currentUser;
        if (user) {
            try {
                await user.delete();
                Alert.alert('Success', 'Account deleted successfully');
            } catch (error) {
                console.error('Error deleting account: ', error);
                Alert.alert('Error deleting account. Try again.');
            }
        }
        navigation.navigate('Login'); 
    };

    const checkVerifEmail = async () => {   
        user = firebaseAuth.currentUser;
        console.log(user);
        if (user) {
            if (user.emailVerified) {
                setVerifEmail('Email is verified');
                console.log(verifEmail);
            } else {
                setVerifEmail('Email is not verified');
                console.log(verifEmail);
            }
        }
    };

    const verifyEmail = async () => {   
        user = firebaseAuth.currentUser;
        if (user) {
            try {
                await sendEmailVerification(user);
                Alert.alert('Verification email sent');
            } catch (error) {
                console.error('Error sending verification email: ', error);
                Alert.alert('Error sending verification email. Try again.');
            }
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.resetContainer}>
                    <Text style={styles.passwordTitle}>Change Password</Text>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Current Password"
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry
                    />
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="New Password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                    />
                    <TouchableOpacity 
                        style = {styles.submitButton}
                        onPress={handleChangePassword}
                    >
                        <Text style={{color: 'white', textAlign: 'center'}}>Change Password</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.verifyContainer}>
                    <Text style={styles.passwordTitle}>Verify email</Text>
                    <TouchableOpacity style={{textAlign: 'center', backgroundColor: '#fff', padding: 10, borderRadius: 5, margin: 3, borderColor: '#2F897C', borderWidth: 2}}>
                        <Text style={{color: 'black', textAlign: 'center'}}>Current status : {verifEmail}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style = {styles.submitButton}
                        onPress={verifyEmail}
                    >
                        <Text style={{color: 'white', textAlign: 'center'}}>Verify email</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.deleteContainer}>
                    <Text style={styles.passwordTitle}>Delete account</Text>
                    <TouchableOpacity
                        style={{color: 'red', textAlign: 'center', backgroundColor: '#e5c185', padding: 10, borderRadius: 5, margin: 3}}
                    >
                        <Text style={{color: 'red', textAlign: 'center', fontStyle: 'italic', fontWeight: 'bold',}}> Disclaimer: Deleting this account will erase all the data related to it</Text> 
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style = {styles.submitButton}
                        onPress={deleteAccount}
                    >
                        <Text style={{color: 'white', textAlign: 'center'}}>Delete account</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    submitButton: {
        backgroundColor: '#2F897C',
        color: 'white',
        paddingVertical: 8, 
        paddingHorizontal: 20, 
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center', 
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    resetContainer: {
        backgroundColor: '#CCE7FF',
        padding: 20,
        marginHorizontal: 10,
        borderRadius: 5,
        marginTop: 60,
    },
    deleteContainer: {
        backgroundColor: '#fbf2c4',
        padding: 20,
        marginHorizontal: 10,
        borderRadius: 5,
        marginTop: 40,
    },
    verifyContainer: {
        backgroundColor: '#CCE7FF',
        padding: 20,
        marginHorizontal: 10,
        borderRadius: 5,
        marginTop: 40,
    },
    passwordTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    passwordInput: {
        height: 40,
        borderColor: '#2F897C',
        borderWidth: 2,
        marginHorizontal: 5,
        paddingHorizontal: 10,
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
});

export default Settings;
