import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Modal, StyleSheet, ScrollView, Alert  } from 'react-native';
import { getDocs, doc, collection, deleteDoc, setDoc, query, where, getDoc } from 'firebase/firestore'; 
import Icon from 'react-native-vector-icons/FontAwesome';
import { LineChart } from "react-native-gifted-charts"

const Activity = ({ route }) => {
  const { firestoreData, userId, firebaseAuth, raspyIp, espIp } = route.params.params;

  const [play_question, setPlayQuestion] = useState(`http://${raspyIp}:5001/play-question`);
  const [play_given_question, setPlayGivenQuestion] = useState(`http://${raspyIp}:5001/play-given-question`);

  const [expandedq, setExpandedq] = useState(false);
  const [questions, setQuestions] = useState([]);

  const [expandedt, setExpandedt] = useState(false);
  const [tests, setTests] = useState([]);

  const [modalVisible, setModalVisible] = useState(false); 
  const [modalInput, setModalInput] = useState('');

  const [newQuestion, setNewQuestion] = useState('');
  
  const [currentItem, setCurrentItem] = useState(null);
  const [modalPrompt, setModalPrompt] = useState('');

  const [modalVisible2, setModalVisible2] = useState(false); 
  const [modalPrompt2, setModalPrompt2] = useState('');

  const [lineData, setLineData] = useState([{value: 0, dataPointText: '0'}]);
  const [lineData2, setLineData2] = useState([]);

  const [trendWay, setTrendWay] = useState('');

  useEffect(() => {
    fetchQuestions();
    fetchScores(); 
  }, [firestoreData, userId]); 

  useEffect(() =>{
     fetchScores(); 
  },[])

  const fetchQuestions = async () => {
    const appUsersRef = collection(firestoreData, 'AppUsers');
    const currentUserRef = doc(appUsersRef, userId);
    const questionsSubcollectionRef = collection(currentUserRef, 'Questions');
    const querySnapshot = await getDocs(questionsSubcollectionRef);

    const fetchedQuestions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      question: doc.data().question,
      answer: doc.data().answer,
      configAnswer: doc.data().configAnswer
    }));

    setQuestions(fetchedQuestions);
  };

  const fetchScores = async () => {
    const appUsersRef = collection(firestoreData, 'AppUsers');
    const currentUserRef = doc(appUsersRef, userId);
    const scoresSubcollectionRef = collection(currentUserRef, 'Assessments');
    const querySnapshot = await getDocs(scoresSubcollectionRef);

    const fetchedTests = querySnapshot.docs.map(doc => ({
      id: doc.id, 
      date: doc.data().date,
      score: doc.data().score,
      time: doc.data().time,
      testlog: doc.data().testlog,
      type: doc.data().type,
    }));

    setTests(fetchedTests);
    data = [{value: 0, dataPointText: '0'}];
    dataweek = [{value: 0, dataPointText: '0'}]
      for (let i = 0; i < fetchedTests.length; i++) {
        if (fetchedTests[i].type == 'daily')
          {
            currScore = fetchedTests[i].score;
            data.push({ value: currScore, dataPointText: currScore.toString() });}

        if (fetchedTests[i].type == 'weekly')
          { 
            currScore = fetchedTests[i].score;
            dataweek.push({ value: currScore, dataPointText: currScore.toString() });}
      }
    setLineData(data);
    setLineData2(dataweek);
    checkTrend();
};

  const toggleExpandq = () => {
    setExpandedq(!expandedq);
  };

  const toggleExpandt = () => {
    setExpandedt(!expandedt);
  };

  const addQuestion = async () => {
    const appUsersRef = collection(firestoreData, 'AppUsers'); 
    const currentUserRef = doc(appUsersRef, userId); 
    const questionsSubcollectionRef = collection(currentUserRef, "Questions"); 
    const patientCollectionRef = collection(currentUserRef, 'Patient');

    date = new Date();
    const timestamp = date.getTime(); 

    const docId = `${timestamp}`;

    if(newQuestion.includes('your name'))
      {
        const querySnapshot = await getDocs(patientCollectionRef);
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();

          await setDoc(doc(questionsSubcollectionRef, docId), {  
            question: newQuestion,
            answer: "No answer available at this time",
            configAnswer: docData['name']
          });
      }}
      else
      if(newQuestion.includes('your age') || newQuestion.includes('old are you'))
        {
          const querySnapshot = await getDocs(patientCollectionRef);
          if (!querySnapshot.empty) {

            const docData = querySnapshot.docs[0].data();
  
            await setDoc(doc(questionsSubcollectionRef, docId), {  
              question: newQuestion,
              answer: "No answer available at this time",
              configAnswer: docData['age']
            });
        }}
        else
      if(newQuestion.includes('your address') || newQuestion.includes('your residence'))
        {const querySnapshot = await getDocs(patientCollectionRef);
          if (!querySnapshot.empty) {
            const docData = querySnapshot.docs[0].data();
            await setDoc(doc(questionsSubcollectionRef, docId), {  
              question: newQuestion,
              answer: "No answer available at this time",
              configAnswer: docData['residence']
            });
        }}
        else
        if(newQuestion.includes('your date of birth') || newQuestion.includes('your birth date'))
          {const querySnapshot = await getDocs(patientCollectionRef);
            if (!querySnapshot.empty) {
              const docData = querySnapshot.docs[0].data();
    
              await setDoc(doc(questionsSubcollectionRef, docId), {  
                question: newQuestion,
                answer: "No answer available at this time",
                configAnswer: docData['birthdate']
              });
          }}
          else
        {await setDoc(doc(questionsSubcollectionRef, docId), {  
          question: newQuestion,
          answer: "No answer available at this time",
          configAnswer: "No configuration available at this time"
        });
        }

    fetchQuestions();
    
    setNewQuestion('');
  };

  const reloadQuestions = () => {
    fetchQuestions(); 
  };

  const askQuestions = async () => {
    const data = { userId: userId };
 
    try {
      const response = await fetch(play_question, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(data), 
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      Alert.alert(
        'Cannot play questions right now.',
        'Ensure that the robot is turned on',
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
    );
    }
  };

  
  const askGivenQuestion = async (item) => {
    const data = { userId: userId, question: item.question}; 

    try {
      const response = await fetch(play_given_question, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(data), 
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      Alert.alert(
        'Cannot play question right now.',
        'Ensure that the robot is turned on',
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
    );
    }
  };


  const handleDeleteQ = async (id) => {
    const appUsersRef = collection(firestoreData, 'AppUsers'); 
    const currentUserRef = doc(appUsersRef, userId); 
    const questionsSubcollectionRef = collection(currentUserRef, "Questions");

    const docToDeleteRef = doc(questionsSubcollectionRef, id); 

    await deleteDoc(docToDeleteRef);
    fetchQuestions();
  }

  const renderItemQuestions = ({ item, index }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderBottomWidth: index === questions.length - 1 ? 0 : 1, borderBottomColor: '#2F897C', backgroundColor: index % 2 === 0 ? 'white' : 'white', borderRadius: 10 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: 'bold' }}>{item.question}</Text>
        {expandedq && <Text>{item.answer}</Text>}
      </View>
      <TouchableOpacity onPress={() => { askGivenQuestion(item) }} style={{ padding: 5 }}>
        <Icon name="question" size={20} color="black" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => { answerConfiguration(item) }} style={{ padding: 5 }}>
        <Icon name="cog" size={20} color="black" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDeleteQ(item.id)} style={{ padding: 5 }}>
        <Icon name="trash" size={20} color="red" />
      </TouchableOpacity>
    </View>
  );

  const handleDeleteT = async (id) => {
    const appUsersRef = collection(firestoreData, 'AppUsers'); 
    const currentUserRef = doc(appUsersRef, userId); 
    const testSubcollectionRef = collection(currentUserRef, "Assessments"); 

    const docToDeleteRef = doc(testSubcollectionRef, id); 

    await deleteDoc(docToDeleteRef);
    fetchScores();
  }

  const handleDeleteDailyTests = async () => {
    const appUsersRef = collection(firestoreData, 'AppUsers'); 
    const currentUserRef = doc(appUsersRef, userId); 
    const testSubcollectionRef = collection(currentUserRef, "Assessments"); 

    const q = query(testSubcollectionRef, where('type', '==', 'daily'));
    const querySnapshot = await getDocs(q);

    const deleteDaily = querySnapshot.docs.map(doc => deleteDoc(doc.ref));

    await Promise.all(deleteDaily);

    fetchScores();
  }

  const handleDeleteWeeklyTests = async () => {
    const appUsersRef = collection(firestoreData, 'AppUsers'); 
    const currentUserRef = doc(appUsersRef, userId); 
    const testSubcollectionRef = collection(currentUserRef, "Assessments"); 

    const q = query(testSubcollectionRef, where('type', '==', 'weekly'));
    const querySnapshot = await getDocs(q);

    const deleteDaily = querySnapshot.docs.map(doc => deleteDoc(doc.ref));

    await Promise.all(deleteDaily);

    fetchScores();
  }

  const renderItemTests = ({ item, index }) => (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderBottomWidth: index === tests.length - 1 ? 0 : 1, borderBottomColor: '#2F897C', backgroundColor: index % 2 === 0 ? 'white' : 'white', borderRadius: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: 'bold' }}>Test taken on {item.date}</Text>
          {expandedt && <Text>Score is: {item.score}</Text>}
        </View>
        <TouchableOpacity onPress={() => { seeTestLog(item) }} style={{ padding: 5 }}>
        <Icon name="eye" size={20} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteT(item.id)} style={{ padding: 5 }}>
        <Icon name="trash" size={20} color="red" />
      </TouchableOpacity>
      </View>
    </View>
  );

  const answerConfiguration = async (item) => {
    setModalVisible(true); 
    setModalPrompt(item.configAnswer);
    setCurrentItem(item)
  };

  const seeTestLog = async (item) => {
    setModalVisible2(true)
    setModalPrompt2(item.testlog);
  };

  const handleAddConfig = async () => {
    const appUsersRef = collection(firestoreData, 'AppUsers');
    const currentUserRef = doc(appUsersRef, userId);
    const questionDocRef = doc(currentUserRef, 'Questions', currentItem.id);
    newData = { configAnswer: modalInput};
    try {
      await setDoc(questionDocRef, newData, { merge: true });
      console.log("Document successfully written!");
    } catch (error) {
      console.error("Error writing document: ", error);
    }
    setModalInput('');
    setModalVisible(false);
    fetchQuestions();
  };

  const getAssessmentScore = () => {
    testLog = ''
    score = 0
    for (let i = 0; i < questions.length; i++) {
      Question = questions[i].question;
      Answer = questions[i].answer;
      ConfigAnswer = questions[i].configAnswer

      testLog = testLog + "\nQuestion: " + Question;
      testLog = testLog + "\nAnswer: " + Answer;
      testLog = testLog + "\nConfig answer: " + ConfigAnswer;

      answerLowerCase = Answer.toLowerCase()
      answer = answerLowerCase.replace(/\s+/g, '');
      answer = answer.replace(/[,']/g, '');
      console.log(answer)
      configAnswerLowerCase = (ConfigAnswer).toLowerCase()
      wordsArray = configAnswerLowerCase.split(' ').filter(word => word !== '');
      wordsFound = 0
      wordsArray.forEach(word => {
        if(answer.includes(word)) wordsFound++;
      })

      if(wordsFound == wordsArray.length) { score++; testLog = testLog + "\nAnswer is correct\n";}
      else testLog = testLog + "\nAnswer is incorrect\n"
    }
    
    return [score, testLog];
  };

  const addWeekly = async() => {
    const appUsersRef = collection(firestoreData, 'AppUsers');
    const currentUserRef = doc(appUsersRef, userId);
    const assessmentDocRef = collection(currentUserRef, 'Assessments');
    weeklyScore = 0
    date = new Date();
    let timestamp = date.getTime(); 
    
    lineData.slice(-7).forEach(element => {
      weeklyScore = weeklyScore +element['value']
    });

    weeklyScore = Math.ceil(weeklyScore/7)
    let docId = `${timestamp}_${weeklyScore}`;

    await setDoc(doc(assessmentDocRef, docId), {
      type: "weekly",
      date: date.toISOString().split('T')[0],
      time: date.toTimeString().split(' ')[0],
      score: weeklyScore,
      testlog: 'Weekly assessment'
    });
  }

  const handleNewAssessment = async () => {
    fetchScores();
    if(lineData.length >= 15){
      Alert.alert(
        'You have reached the maximum number of assessments',
        'Please delete the storage.',
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
    );}
    else{
    const appUsersRef = collection(firestoreData, 'AppUsers');
    const currentUserRef = doc(appUsersRef, userId);
    const assessmentDocRef = collection(currentUserRef, 'Assessments');
    try{    
      date = new Date();

      [currScore, testLog] = getAssessmentScore();
      let timestamp = date.getTime(); 
      let docId = `${timestamp}_${currScore}`;

      await setDoc(doc(assessmentDocRef, docId), {
        type: "daily",
        date: date.toISOString().split('T')[0],
        time: date.toTimeString().split(' ')[0],
        score: currScore,
        testlog: testLog
      });

      fetchScores();
      // Add weekly assessment
      if (lineData.length % 7 == 0 && lineData.length != 0){
        addWeekly()
      }
      
    fetchScores();
  } catch (error) {
    console.error("Error writing document: ", error);}
  };
};

  const checkTrend = () =>
    {   l=lineData2.length
      if (l==0) setTrendWay("Please refresh the assessment")
      else
        if (l == 1)
          setTrendWay("No data about weekly assessments yet")
        else
        if(l >= 2)
          {
          if(lineData2[l-1]['value'] > lineData2[l-2]['value']) setTrendWay('Ascending trend. Mental status does not raise suspicions.')
            else
              if(lineData2[l-1]['value'] == lineData2[l-2]['value']) 
                { if( lineData2[l-2]['value'] > 6 ) setTrendWay('Constant trend. Mental status does not raise suspicions.')
                  else setTrendWay('Constant trend. However mental status is below the acceptable limits.')}
                else
                    {
                      if(lineData2[l-1]['value'] < 6) setTrendWay('Descending trend. Patient needs close monitoring.')
                        else
                      setTrendWay('Descending trend. Score is still in the acceptable limits. Monitoring is still advised.')}

    }
    }
  
  return (
    <View style={{ flex: 1, backgroundColor:'white' }}>
      <TouchableOpacity onPress={toggleExpandq} style={{ backgroundColor: '#2F897C', padding: 10, borderRadius: 10 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'white' }}>Questions</Text>
      </TouchableOpacity>
      {expandedq && (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, backgroundColor: 'white' }}>
            <TextInput
              value={newQuestion}
              onChangeText={setNewQuestion}
              placeholder="Enter new question"
              style={{ flex: 1, borderWidth: 1, borderColor: 'gray', padding: 5 }}
            />
          </View>
          <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 }}>
            <TouchableOpacity onPress={addQuestion} style={{ backgroundColor: '#CCE7FF', padding: 10, flex: 1, borderRadius: 10 }}>
              <Text style={{ fontSize: 16, textAlign: 'center', color: 'black' }}>Add Question</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={reloadQuestions} style={{ backgroundColor: '#54B6A8', padding: 10, flex: 1, marginLeft: 5, borderRadius: 10 }}>
              <Text style={{ fontSize: 16, textAlign: 'center', color: 'black' }}>Reload</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={askQuestions} style={{ backgroundColor: '#99CFFF', padding: 10, flex: 1, marginLeft: 5, borderRadius: 10 }}>
              <Text style={{ fontSize: 16, textAlign: 'center', color: 'black' }}>Ask Questions</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={questions}
            renderItem={renderItemQuestions} 
            keyExtractor={(item) => item.id.toString()}
            style={{ marginTop: 10 }} 
          />
        </View>
      )}
      <TouchableOpacity onPress={toggleExpandt} style={{ backgroundColor: '#2F897C', padding: 10, borderRadius: 10, marginTop: 5, marginBottom: 10 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'white' }}>Test Assessments and Evolution</Text>
      </TouchableOpacity>
      {expandedt && (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          <View style={{ alignItems: 'center', marginVertical: 10 }}>
          <View style={{ marginTop: -10, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 }}>
            <TouchableOpacity onPress={handleNewAssessment} style={{ backgroundColor: '#CCE7FF', padding: 10, borderRadius: 10 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16, color: 'black' }}>New Assessment</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteDailyTests} style={{ backgroundColor: '#54B6A8', padding: 10, borderRadius: 10, marginLeft:5 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16, color: 'black' }}>Delete daily</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteWeeklyTests} style={{ backgroundColor: '#54B6A8', padding: 10, borderRadius: 10, marginLeft:5 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16, color: 'black' }}>Delete weekly</Text>
            </TouchableOpacity>
          </View>
          </View>
          <FlatList
            data={tests}
            renderItem={renderItemTests} 
            keyExtractor={(item) => item.id.toString()}
            style={{ marginTop: 10, marginBottom: 10}} 
          />
        </View>
      )}
      <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
      <TouchableOpacity style={{ backgroundColor: '#CCE7FF', padding: 10, borderRadius: 10, marginTop: 10, marginLeft:20, marginRight:20, alignItems: 'center', justifyContent: 'center', }}>
        <Text style = {{ fontSize: 24, fontWeight: 'bold', color: '#0BA5A4',  marginBottom: 20}}> Daily assessment graph</Text>
      <View style={{backgroundColor: '#CCE7FF', alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 5}}>
          <LineChart
              initialSpacing={0}
              data={lineData.slice(-11)}
              spacing={30}
              textColor1="black"
              textShiftY={-8}
              textShiftX={-10}
              textFontSize={13}
              thickness={5}
              hideRules
              hideYAxisText
              yAxisColor="#0BA5A4"
              yAxisThickness={3}
              showVerticalLines
              verticalLinesColor="rgba(14,164,164,0.5)"
              xAxisColor="#0BA5A4"
              xAxisThickness={3}
              color="#0BA5A4"
          />
      </View>

      <Text style = {{ fontSize: 24, fontWeight: 'bold', color: '#0BA5A4',  marginBottom: 20}}> Weekly assessment graph</Text>
      <View style={{backgroundColor: '#CCE7FF', alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 5, marginTop: 25}}>
          <LineChart
              initialSpacing={0}
              data={lineData2.slice(-11)}
              spacing={30}
              textColor1="black"
              textShiftY={-8}
              textShiftX={-10}
              textFontSize={13}
              thickness={5}
              hideRules
              hideYAxisText
              yAxisColor="#0BA5A4"
              yAxisThickness={3}
              showVerticalLines
              verticalLinesColor="rgba(14,164,164,0.5)"
              xAxisColor="#0BA5A4"
              xAxisThickness={3}
              color="#0BA5A4"
          />
      </View>

      <TouchableOpacity style = {styles.button}>
      <Text style={{ fontWeight: 'bold', fontSize: 12, color: 'white',textAlign: 'center' }}>
        {trendWay}
      </Text>
      </TouchableOpacity>
      
      <TouchableOpacity style = {styles.button}>
      <Text style={{ fontWeight: 'bold', fontSize: 12, color: 'white', textAlign: 'center' }} onPress={checkTrend}>
        Refresh
      </Text>
      </TouchableOpacity>
      </TouchableOpacity>
      <View style={{ backgroundColor: '#fbf2c4', padding: 20, borderRadius: 40, margin: 20, marginTop: 20}}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', fontStyle:'italic', marginBottom: 10, textAlign: 'center' }}>Abbreviated Mental Test Score</Text>
        <Text style={{ fontSize: 15, marginTop: 10, textAlign: 'center'}}>
          This application implements the 'Abbreviated Mental Test Score' as method of assessment. It rapidly assesses the posibility of dementia for elderly people.
        </Text>
        <Text style={{ fontSize: 15, fontWeight: 'bold', marginTop: 20, textAlign: 'center'}}>
          Score between 10-6: Cognitive status doesn't raise problems
        </Text>
        <Text style={{ fontSize: 15, fontWeight: 'bold', marginTop: 20, textAlign: 'center'}}>
          Score of 6 and below: suggests delirium or dementia, although further tests are necessary to confirm the diagnosis
        </Text>
      </View>
      </ScrollView>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Configure the predefined answers  Current config: {modalPrompt}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Your answer"
              value={modalInput}
              onChangeText={setModalInput}
            />
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#54B6A8' }]} onPress={handleAddConfig}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#FF4C4C' }]} onPress={() => setModalVisible(false)}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible2}
        onRequestClose={() => {
          setModalVisible2(!modalVisible2);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView2}>
            <ScrollView >
            <Text style={styles.modalText}>Assessment information: {modalPrompt2}</Text>
            </ScrollView>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#FF4C4C' }]} onPress={() => setModalVisible2(false)}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0BA5A4',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    textAlign: 'center',
    marginTop: 5
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalView2: {
    width: 300,
    maxHeight: 400,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  modalButton: {
    width: '100%',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },
});

export default Activity;
