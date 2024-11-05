from flask import Flask, Response, jsonify, request
import pyaudio
import picamera
from PIL import Image
import speech_recognition as sr
import firebase_admin
from firebase_admin import firestore
from firebase_admin import credentials
import time
import threading
import pvporcupine
import struct
import subprocess
import requests
import vlc

from youtube_music import main_youtube_player #my script
from youtube_music import stop_play#own script

from Ebook import read_ebook, stop_read #my script
from gtts import gTTS
import io
import os

#----------------------------------------Initializations area-------------------------------------------

#Firestore database initialization
FIREBASE_CREDENTIALS_PATH = "path"
firebase_admin.initialize_app(credentials.Certificate(FIREBASE_CREDENTIALS_PATH))
db = firestore.client()

#Recognizer for speech to text
recognizer = sr.Recognizer()

#Flask server application instance
app = Flask(__name__)

#Esp ip for sending requests
ESP32_IP = "http://172.20.10.5:80"

#Porcupine access key - for hotword detection
access_key="access_key"

#Hotwords supported
MOVE_FORWARD = '/home/noemi/Licenta/licenta/code_by_me/hotwords/Move-forward_en_raspberry-pi_v3_0_0.ppn'
MOVE_BACKWARD = '/home/noemi/Licenta/licenta/code_by_me/hotwords/Move-backward_en_raspberry-pi_v3_0_0.ppn'
TURN_RIGHT = '/home/noemi/Licenta/licenta/code_by_me/hotwords/Turn-right_en_raspberry-pi_v3_0_0.ppn'
TURN_LEFT = '/home/noemi/Licenta/licenta/code_by_me/hotwords/Turn-left_en_raspberry-pi_v3_0_0.ppn'
HEY_REMY = '/home/noemi/Licenta/licenta/code_by_me/hotwords/Hey--remy_en_raspberry-pi_v3_0_0.ppn'
BYE_REMY = '/home/noemi/Licenta/licenta/code_by_me/hotwords/Bye-remy_en_raspberry-pi_v3_0_0.ppn'
PLAY_SONG = '/home/noemi/Licenta/licenta/code_by_me/hotwords/Play-song_en_raspberry-pi_v3_0_0.ppn'
STOP_SONG = '/home/noemi/Licenta/licenta/code_by_me/hotwords/Stop-song_en_raspberry-pi_v3_0_0.ppn'
STREAM_RADIO = '/home/noemi/Licenta/licenta/code_by_me/hotwords/Stream-radio_en_raspberry-pi_v3_0_0.ppn'
STOP_RADIO = '/home/noemi/Licenta/licenta/code_by_me/hotwords/Stop-radio_en_raspberry-pi_v3_0_0.ppn'
READ_BOOK = '/home/noemi/Licenta/licenta/code_by_me/hotwords/Read-Book_en_raspberry-pi_v3_0_0.ppn'
STOP_READING = '/home/noemi/Licenta/licenta/code_by_me/hotwords/Stop-Reading_en_raspberry-pi_v3_0_0.ppn'
CUSTOM_COMMANDS=[MOVE_FORWARD, MOVE_BACKWARD, TURN_RIGHT, TURN_LEFT, HEY_REMY, BYE_REMY, PLAY_SONG, STREAM_RADIO, STOP_RADIO, STOP_SONG, READ_BOOK, STOP_READING]

SENSITIVITIES = [0.5] * len(CUSTOM_COMMANDS)
SENSITIVITIES[11] = 0.7
#----------------------------------------------------------------------------------------------------------

#Code to update the Raspberry's IP address in the firestore database
def get_ip():
    try:
        result = subprocess.check_output(["hostname", "-I"])
        ip_address = result.decode('utf-8').strip().split()[0]
        return ip_address
    except subprocess.CalledProcessError as e:
        return 'An error occured'

def send_ip():
    ip_address = get_ip()
    ipConfig_docRef = db.collection('IpConfig').document('1')
    ip_data = {"raspyIp": ip_address.lower()}
    ipConfig_docRef.update(ip_data)

# Code to send a live camera feed to the app
def generate_frames():
    with picamera.PiCamera() as camera:
        camera.resolution = (400,400)
        camera.framerate = 24
        stream = io.BytesIO()
        
        for _ in camera.capture_continuous(stream, 'jpeg', use_video_port=True):
            try:
                stream.seek(0)
                frame_data = stream.read()
                image = Image.open(io.BytesIO(frame_data))
                image = image.transpose(Image.FLIP_TOP_BOTTOM) #Flip the image horizontally because camera is mounted upside down
                frame_data = io.BytesIO()
                image.save(frame_data, format='JPEG')
                frame_data = frame_data.getvalue()
                yield b'--frame\r\n Content-Type: image/jpeg\r\n\r\n' + frame_data + b'\r\n'
                stream.seek(0)
                stream.truncate()
            except Exception as e:
                print("Error generating frames", e)
                yield b'' 
        
@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

#Code for text to speech conversion
def voice_speak(text):
    tts = gTTS(text=text, lang='en', slow=False)
    out_dir = '/home/noemi/Licenta/licenta/code_by_me/texttospeech'
    if not os.path.exists(out_dir):
        os.makedirs(out_dir)
    path="/home/noemi/Licenta/licenta/code_by_me/texttospeech/output.mp3"
    tts.save(path)
    os.system(f"mpg321 {path}")
    os.remove(path)

#Code for speech to text conversion
def speech_to_text(user_id, question_id):
    current_user_docRef = db.collection('AppUsers').document(user_id)
    questions_subcollectionRef = current_user_docRef.collection('Questions')
    question_doc = questions_subcollectionRef.document(question_id)
    question_doc_snapshot = question_doc.get()
    question_doc_snapshot_data = question_doc_snapshot.to_dict() #retrieve the data
    
    if "No answer required" in question_doc_snapshot_data['question']:
        #Play the question out loud
        cfg_answer = question_doc_snapshot_data['configAnswer']
        voice_speak(cfg_answer)
    else:
        voice_speak('Please answer')
        try:
            with sr.Microphone() as mic:
                recognizer.adjust_for_ambient_noise(mic, duration=0.2)
                audio = recognizer.listen(mic, timeout=5, phrase_time_limit=10)
                try:
                    text = recognizer.recognize_google(audio, language="en-US")
                    update_data = {"answer": text.lower()}
                    question_doc.update(update_data)
                    return f"Question answered: {update_data}"
                except sr.UnknownValueError() as e:
                    update_data = {"answer": "Did not understand the answer"}
                    question_doc.update(update_data)
                    return "Did not understand the answer"
                except sr.RequestError as e:
                    update_data = {"answer": "Could not request results, try again later"}
                    question_doc.update(update_data)
                    return 'Could not request results, try again later'
                
        except sr.WaitTimeoutError as e:
                update_data = {"answer": "Response timed out"}
                question_doc.update(update_data)
                return 'Response timed out'
            
        except Exception as e:
                update_data = {"answer": "Error occured, please retry"}
                question_doc.update(update_data)
                return 'Error occured, please retry'
        
def retrieve_question(user_id):
    current_user_docRef = db.collection('AppUsers').document(user_id)
    questions_subcollectionRef = current_user_docRef.collection('Questions')
    question_docs = questions_subcollectionRef.stream()
    
    #Iterate thourgh all questions saved in the database for given user
    for doc in question_docs:
        yield {'question_id': doc.id,
               'questionData': doc.to_dict()}
    
@app.route('/play-question', methods=['POST'])
def play_question():
    try:
        data = request.json
        user_id = data.get("userId")
        
        #Retrieve the questions from the database
        for question_data in retrieve_question(user_id):
            question_id = question_data['question_id']
            question = question_data['questionData']['question']
            
            #Play the question out loud
            voice_speak(question)
             
            #Retrieve the text format of the speech
            state = speech_to_text(user_id, question_id)
            print(state)
            time.sleep(2)
            
        return jsonify({'message':'Data received successfully', 'data':data}), 200
    except Exception as e:
        return jsonify({'error':state}),400
    
@app.route('/play-given-question', methods=['POST'])
def play_question_given():
    try:
        data = request.json
        user_id = data.get("userId") #extract the current user ID
        question_given = data.get("question") #extract the given question
        
        for question_data in retrieve_question(user_id):
            question_id = question_data['question_id']
            question = question_data['questionData']['question']
            
            if question_given == question:
                voice_speak(question)
                
                state = speech_to_text(user_id, question_id)
                print(state)
                time.sleep(2)

        return jsonify({'message':'Data received successfully', 'data':data}), 200
    except Exception as e:
        return jsonify({'error':state}),400

#Code to capture hotwords and activate actions accordingly
def move_forward():
    response = requests.get(f"{ESP32_IP}/longerup")
    return response.text

def move_backward():
    response = requests.get(f"{ESP32_IP}/longerdown")
    return response.text

def turn_right():
    response = requests.get(f"{ESP32_IP}/right")
    return response.text

def turn_left():
    response = requests.get(f"{ESP32_IP}/left")
    return response.text

def stream_radio(channel):
    urls = {
        'digi fm': 'http://edge76.rdsnet.ro:84/digifm/digifm.mp3',
        'pro fm': 'http://edge126.rdsnet.ro:84/profm/profm.mp3',
        'kiss fm': 'http://live.kissfm.ro:9128/kissfm.aacp',
        'magic fm': 'http://live.magicfm.ro:9128/magicfm.aacp',
    }
    if channel in urls:
        player = vlc.MediaPlayer(urls[channel])
        player.audio_set_volume(30)
        player.play()
        return player
    return None

def capture_hotword():
    process = None
    porcupine = None
    pa = None
    audio_stream = None
    player = None
    
    youtube_play = False
    play_youtube_thread = None
    
    book_read = False
    book_read_thread = None
    

    try:
        porcupine = pvporcupine.create(access_key=access_key, keyword_paths=CUSTOM_COMMANDS, sensitivities=SENSITIVITIES)
        pa = pyaudio.PyAudio()

        audio_stream = pa.open(
            rate=porcupine.sample_rate,
            channels=1,
            format=pyaudio.paInt16,
            input=True,
            frames_per_buffer=porcupine.frame_length)

        print("Listening for the hotword...")

        while True:
            pcm = audio_stream.read(porcupine.frame_length)
            pcm = struct.unpack_from("h" * porcupine.frame_length, pcm)

            keyword_index = porcupine.process(pcm)
            if keyword_index >= 0:
                #Motion commands
                if keyword_index == 0:
                    print("Moving forward")
                    try:
                        move_forward()
                    except Exception:
                        voice_speak('It is not possible to send requests right now')
                        
                elif keyword_index == 1:
                    print("Moving backward")
                    try:
                        move_backward()
                    except Exception:
                        voice_speak('It is not possible to send requests right now')
                    
                elif keyword_index == 2:
                    print("Turning right")
                    try:
                        turn_right()
                    except Exception:
                        voice_speak('It is not possible to send requests right now')
                    
                elif keyword_index == 3:
                    print("Turning left")
                    try:
                        turn_left()
                    except Exception:
                        voice_speak('It is not possible to send requests right now')
                    
                #Start assistant
                elif keyword_index == 4:
                    if process == None: #assistant was never started on this device
                        print("Assistant run!")
                        process = subprocess.Popen(['googlesamples-assistant-pushtotalk'])
                        print(process)
                        
                    elif process.returncode == -15: #assistant was started and terminated in the meantime
                        print("Assistant run!")
                        process = subprocess.Popen(['googlesamples-assistant-pushtotalk'])
                        print(process)
                    
                    else:
                        print('Assistant is already running')
                #Stop assistant
                elif keyword_index == 5:
                    if process != None:
                        if process.returncode != -15:
                            print("Assistant stopped!")
                            process.terminate()
                            process.wait()
                            print(process)
                    else:
                        print("Assistant wasnt started yet")
                        voice_speak('The assistant wasnt started yet')
                        
                elif keyword_index == 6:
                     if youtube_play == False:
                        youtube_play = True
                        play_youtube_thread = threading.Thread(target=main_youtube_player)
                        play_youtube_thread.start()
                    
                elif keyword_index == 7:
                    channel = None
                    try:
                        with sr.Microphone() as mic:
                            print('Listening for radio')
                            recognizer.adjust_for_ambient_noise(mic, duration=0.2)
                            audio = recognizer.listen(mic, timeout = 5, phrase_time_limit = 10)
                            try:
                                channel = recognizer.recognize_google(audio, language="en-US")
                            
                            except sr.UnknownValueError() as e:
                                channel = None
                                voice_speak('I did not understand. Please repeat')
                            
                    except Exception:
                        channel = None
                        voice_speak('An error occured. Please retry')
                            
                    print(channel)
                    try: 
                        if channel != None:
                            player = stream_radio(channel.lower())
                            if player == None:
                                voice_speak('This radio broadcast is not supported yet')

                    except Exception:
                        voice_speak('An error occured while connecting to the radio. Please retry')
                                       
                elif keyword_index == 8:
                    if player == None:
                        voice_speak('Radio is currently not playing')
                    else:
                        player.stop()
                        player=None
                        
                elif keyword_index == 9:
                    if youtube_play == True:
                        stop_play()
                        youtube_play = False
                    else:
                        voice_speak('Currently nothing is playing')
                
                elif keyword_index == 10:
                    if book_read == False:
                        book_read = True
                        try:
                            book_read_thread = threading.Thread(target=read_ebook)
                            book_read_thread.start()
                        except Exception:
                            stop_read()
                            voice_speak('An error occured. Please try again')
                        
                elif keyword_index == 11:
                    if book_read == True:
                        stop_read()
                        book_read = False
                    else:
                        voice_speak('Currently no book is being read')
                        
                    
    except KeyboardInterrupt:
        print("Stopping the hotword detection.")

    finally:
        if porcupine is not None:
            porcupine.delete()

        if audio_stream is not None:
            audio_stream.close()

        if pa is not None:
            pa.terminate()

if __name__=='__main__':
    
    send_ip() #Updoad the ip to the database
    
    print("Start the flask server")
    flask_thread = threading.Thread(target=app.run, kwargs={'host': '0.0.0.0', 'port': 5001, 'threaded': True})
    flask_thread.start()
    
    time.sleep(3)
    
    print("Start  hotword listening")
    hotword_thread = threading.Thread(target=capture_hotword)
    hotword_thread.start()

    
    
