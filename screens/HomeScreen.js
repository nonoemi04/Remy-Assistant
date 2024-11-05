import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { getDocs, doc, collection, setDoc } from 'firebase/firestore';


const HomeScreen = ({ route }) => {
  const [avatar, setAvatar] = useState(require('../assets/avatar.png')); 
  const [name, setName] = useState(''); 
  const [age, setAge] = useState(''); 
  const [editingName, setEditingName] = useState(false); 
  const [editingAge, setEditingAge] = useState(false); 
  const [updateDataBaseNameFlag, setDataBaseNameFlag] = useState(false); 
  const [updateDataBaseAgeFlag, setDataBaseAgeFlag] = useState(false); 
  const [residence, setResidence] = useState(''); 
  const [birthDate, setBirthDate] = useState(''); 
  const [gender, setGender] = useState(''); 
  
  const [maritalStat, setMaritalStat] = useState(''); 
  const [husbandWife, setHusbandWife] = useState(''); 
  const [children, setChildren] = useState(''); 
  const [parentsNames, setParentsNames] = useState('');

  const {firestoreData, userId, firebaseAuth} = route.params.params;

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (updateDataBaseNameFlag) {
      updateDataBaseName();
    }
  }, [updateDataBaseNameFlag]); //This effect runs whenever the name is changed to send the updates to the database

  useEffect(() => {
    if (updateDataBaseAgeFlag) {
      updateDataBaseAge();
    }
  }, [updateDataBaseAgeFlag]); //This effect runs whenever the age is changed to send the updates to the database

  //Method used to retrieve the data regarding the patient from the database
  const fetchUserData = async () => {
    const appUsersRef = collection(firestoreData, 'AppUsers');

    const currentUserRef = doc(appUsersRef, userId);
    const patientCollectionRef = collection(currentUserRef, 'Patient');

    try {
      const querySnapshot = await getDocs(patientCollectionRef);

      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();

        if (docData['name'] && docData['name'] !== 'No name available at this time') {
          setName(docData['name']);
        }
        else setName('Input name');
        if (docData['age'] && docData['age'] !== 'No age available at this time') {
          setAge(docData['age']);
        }
        else setAge('Input age');
        setResidence(docData['residence'] || '');
        setBirthDate(docData['birthdate'] || '');
        setGender(docData['gender'] || '');
        setMaritalStat(docData['maritalstatus'] || '');
        setHusbandWife(docData['husbandwife'] || '');
        setChildren(docData['children'] || '');
        setParentsNames(docData['parents'] || '');
      }
    } catch(error) {
      Alert.alert(
        'An error occured. Please try logging in again.'
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
    );
    }
  };

  //Name change methods
  const handleNamePress = () => {
    setEditingName(true); 
  };

  const handleNameChange = (text) => {
    if (text === '') setName('Input name');
    else setName(text);
    setDataBaseNameFlag(!updateDataBaseNameFlag);
  };

  const updateDataBaseName = async () => {
    const appUsersRef = collection(firestoreData, 'AppUsers');
    const currentUserRef = doc(appUsersRef, userId);
    const patientCollectionRef = collection(currentUserRef, 'Patient');
    try {
      const querySnapshot = await getDocs(patientCollectionRef);

      if (!querySnapshot.empty) {
        const firstDocRef = querySnapshot.docs[0].ref;

        let newData = { name: 'No name available at this time' }; //Set default value in case the name field is empty
        if (name !== 'Input name') newData = { name: name }; // Set the name if the input field is not empty

        await setDoc(firstDocRef, newData, { merge: true });
        console.log("Document successfully written!");
      } else {
        console.log("No documents found in the collection.");
      }
    } catch (error) {
      Alert.alert(
        'An error occured while updating the data. Please try again.'
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
    );
    }
    setDataBaseNameFlag(!updateDataBaseNameFlag);
  };

  
  //Age change methods
  const handleAgePress = () => {
    setEditingAge(true); 
  };

  const handleAgeChange = (text) => {
    if (text === '') setAge('Input age');
    else setAge(text);
    setDataBaseAgeFlag(!updateDataBaseAgeFlag);
  };

  const updateDataBaseAge = async () => {
    const appUsersRef = collection(firestoreData, 'AppUsers');
    const currentUserRef = doc(appUsersRef, userId);
    const patientCollectionRef = collection(currentUserRef, 'Patient');
    try {
      const querySnapshot = await getDocs(patientCollectionRef);

      if (!querySnapshot.empty) {
        const firstDocRef = querySnapshot.docs[0].ref;

        let newData = { age: "No age available at this time" };
        if (age !== 'Input age') newData = { age: age }; 

        await setDoc(firstDocRef, newData, { merge: true });
        console.log("Document successfully written!");
      } else {
        console.log("No documents found in the collection.");
      }
    } catch (error) {
      Alert.alert(
        'An error occured while updating the data. Please try again.'
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
    );
    }
    setDataBaseAgeFlag(!updateDataBaseAgeFlag);
  };

  //Residence change method
  const updateDataBaseResidence = async () => {
    const appUsersRef = collection(firestoreData, 'AppUsers');
    const currentUserRef = doc(appUsersRef, userId);
    const patientCollectionRef = collection(currentUserRef, 'Patient');
    try {
      const querySnapshot = await getDocs(patientCollectionRef);

      if (!querySnapshot.empty) {
        const firstDocRef = querySnapshot.docs[0].ref;

        let newData = { residence: "No residence available at this time" };
        if (residence !== '') newData = { residence: residence };

        await setDoc(firstDocRef, newData, { merge: true });
        console.log("Document successfully written!");
      } else {
        console.log("No documents found in the collection.");
      }
    } catch (error) {
      Alert.alert(
        'An error occured while updating the data. Please try again.'
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
    );
    }
    fetchUserData();
  };

  //Birth date change method
  const updateDataBaseBirthDate = async () => {
    const appUsersRef = collection(firestoreData, 'AppUsers');
    const currentUserRef = doc(appUsersRef, userId);
    const patientCollectionRef = collection(currentUserRef, 'Patient');
    try {
      const querySnapshot = await getDocs(patientCollectionRef);

      if (!querySnapshot.empty) {
        const firstDocRef = querySnapshot.docs[0].ref;

        let newData = { birthdate: "No birth date available at this time" };
        if (birthDate !== '') newData = { birthdate: birthDate };

        await setDoc(firstDocRef, newData, { merge: true });
        console.log("Document successfully written!");
      } else {
        console.log("No documents found in the collection.");
      }
    } catch (error) {
      Alert.alert(
        'An error occured while updating the data. Please try again.'
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
    );
    }
    fetchUserData();
  };

  //Gender change method
  const updateDataBaseGender = async () => {
    const appUsersRef = collection(firestoreData, 'AppUsers');
    const currentUserRef = doc(appUsersRef, userId);
    const patientCollectionRef = collection(currentUserRef, 'Patient');
    try {
      const querySnapshot = await getDocs(patientCollectionRef);

      if (!querySnapshot.empty) {
        const firstDocRef = querySnapshot.docs[0].ref;

        let newData = { gender: "No gender available at this time" };
        if (gender !== '') newData = { gender: gender };

        await setDoc(firstDocRef, newData, { merge: true });
        console.log("Document successfully written!");
      } else {
        console.log("No documents found in the collection.");
      }
    } catch (error) {
      Alert.alert(
        'An error occured while updating the data. Please try again.'
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
    );
    }
    fetchUserData();
  };

  //Marital status change methos
  const updateDataBaseMaritalStat = async () => {
    const appUsersRef = collection(firestoreData, 'AppUsers');
    const currentUserRef = doc(appUsersRef, userId);
    const patientCollectionRef = collection(currentUserRef, 'Patient');
    try {
      const querySnapshot = await getDocs(patientCollectionRef);

      if (!querySnapshot.empty) {
        const firstDocRef = querySnapshot.docs[0].ref;

        let newData = { maritalstatus: "No marital status available at this time" };
        if (maritalStat !== '') newData = { maritalstatus: maritalStat };

        await setDoc(firstDocRef, newData, { merge: true });
        console.log("Document successfully written!");
      } else {
        console.log("No documents found in the collection.");
      }
    } catch (error) {
      Alert.alert(
        'An error occured while updating the data. Please try again.'
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
    );
    }
    fetchUserData();
  };

  //Husband/Wife change method
  const updateDataBaseHusbandWife = async () => {
    const appUsersRef = collection(firestoreData, 'AppUsers');
    const currentUserRef = doc(appUsersRef, userId);
    const patientCollectionRef = collection(currentUserRef, 'Patient');
    try {
      const querySnapshot = await getDocs(patientCollectionRef);

      if (!querySnapshot.empty) {
        const firstDocRef = querySnapshot.docs[0].ref;

        let newData = { husbandwife: "No husband/wife available at this time" };
        if (husbandWife !== '') newData = { husbandwife: husbandWife };

        await setDoc(firstDocRef, newData, { merge: true });
        console.log("Document successfully written!");
      } else {
        console.log("No documents found in the collection.");
      }
    } catch (error) {
      Alert.alert(
        'An error occured while updating the data. Please try again.'
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
    );
    }
    fetchUserData();
  };

  //Children database change
  const updateDataBaseChildren = async () => {
    const appUsersRef = collection(firestoreData, 'AppUsers');
    const currentUserRef = doc(appUsersRef, userId);
    const patientCollectionRef = collection(currentUserRef, 'Patient');
    try {
      const querySnapshot = await getDocs(patientCollectionRef);

      if (!querySnapshot.empty) {
        const firstDocRef = querySnapshot.docs[0].ref;

        let newData = { children: "No children available at this time" };
        if (children !== '') newData = { children: children };

        await setDoc(firstDocRef, newData, { merge: true });
        console.log("Document successfully written!");
      } else {
        console.log("No documents found in the collection.");
      }
    } catch (error) {
      Alert.alert(
        'An error occured while updating the data. Please try again.'
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
    );
    }
    fetchUserData();
  };

  //Parent names database change
  const updateDataBaseParentsNames = async () => {
    const appUsersRef = collection(firestoreData, 'AppUsers');
    const currentUserRef = doc(appUsersRef, userId);
    const patientCollectionRef = collection(currentUserRef, 'Patient');
    try {
      const querySnapshot = await getDocs(patientCollectionRef);

      if (!querySnapshot.empty) {
        const firstDocRef = querySnapshot.docs[0].ref;

        let newData = { parents: "No parents' names available at this time" };
        if (parentsNames !== '') newData = { parents: parentsNames };

        await setDoc(firstDocRef, newData, { merge: true });
        console.log("Document successfully written!");
      } else {
        console.log("No documents found in the collection.");
      }
    } catch (error) {
      Alert.alert(
        'An error occured while updating the data. Please try again.'
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
    );
    }
    fetchUserData();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileContainer}>
          <TouchableOpacity>
            <View style={styles.avatarContainer}>
              <ImageBackground
                source={avatar}
                style={styles.avatar}
              />
            </View>
          </TouchableOpacity>
          {editingName ? (
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              onSubmitEditing={() => handleNameChange(name)}
              autoFocus={true}
              onBlur={() => setEditingName(false)}
            />
          ) : (
            <TouchableOpacity onPress={handleNamePress}>
              <Text style={styles.nameText}>{name}</Text>
            </TouchableOpacity>
          )}

          {editingAge ? (
            <TextInput
              style={styles.ageInput}
              value={age}
              onChangeText={setAge}
              onSubmitEditing={() => handleAgeChange(age)}
              autoFocus={true}
              onBlur={() => setEditingAge(false)}
            />
          ) : (
            <TouchableOpacity onPress={handleAgePress}>
              <Text style={styles.ageText}>{age}</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.label}>Gender</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your gender..."
          value={gender}
          onChangeText={setGender}
          onSubmitEditing={updateDataBaseGender}
        />
        <Text style={styles.label}>Date of Birth</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your date of birth..."
          value={birthDate}
          onChangeText={setBirthDate}
          onSubmitEditing={updateDataBaseBirthDate}
        />
        <Text style={styles.label}>Location/Residence</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your location/residence..."
          value={residence}
          onChangeText={setResidence}
          onSubmitEditing={updateDataBaseResidence}
        />
        <View style={styles.familyContainer}>
          <Text style={styles.familyTitle}>Family</Text>
          <Text style={styles.familyLabel}>Marital status</Text>
          <TextInput
            style={styles.familyInput}
            placeholder="Enter your Marital status..."
            value={maritalStat}
            onChangeText={setMaritalStat}
            onSubmitEditing={updateDataBaseMaritalStat}
          />
          <Text style={styles.familyLabel}>Husband/Wife</Text>
          <TextInput
            style={styles.familyInput}
            placeholder="Enter your Husband/Wife..."
            value={husbandWife}
            onChangeText={setHusbandWife}
            onSubmitEditing={updateDataBaseHusbandWife}
          />
          <Text style={styles.familyLabel}>Children</Text>
          <TextInput
            style={styles.familyInput}
            placeholder="Enter your Children..."
            value={children}
            onChangeText={setChildren}
            onSubmitEditing={updateDataBaseChildren}
          />
          <Text style={styles.familyLabel}>Parent's names</Text>
          <TextInput
            style={styles.familyInput}
            placeholder="Enter your Parents' names..."
            value={parentsNames}
            onChangeText={setParentsNames}
            onSubmitEditing={updateDataBaseParentsNames}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  avatarContainer: {
    borderRadius: 70,
    overflow: 'hidden',
    marginTop: -70,
    borderColor: '#2F897C',
    borderWidth: 2.5,
  },
  avatar: {
    width: 140,
    height: 140,
  },
  nameInput: {
    fontSize: 25,
    fontWeight: 'bold',
    padding: 10,
  },
  nameText: {
    fontSize: 25,
    fontWeight: 'bold',
    padding: 10,
  },
  ageInput: {
    fontSize: 20,
    padding: 5,
  },
  ageText: {
    fontSize: 20,
    padding: 5,
  },
  label: {
    margin: 10,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginHorizontal: 10,
    paddingHorizontal: 10,
  },
  familyContainer: {
    backgroundColor: '#CCE7FF',
    padding: 20,
    marginHorizontal: 10,
    borderRadius: 5,
    marginTop: 20,
    marginBottom: 100,
  },
  familyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  familyLabel: {
    margin: 10,
  },
  familyInput: {
    height: 40,
    borderColor: '#2F897C',
    borderWidth: 2,
    marginHorizontal: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
});


export default HomeScreen;
