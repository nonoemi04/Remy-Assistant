import os
import googleapiclient.discovery
from pytube import YouTube
import vlc
import speech_recognition as sr
import threading
from gtts import gTTS

recognizer = sr.Recognizer()

#Youtube api key
API_KEY = 'key'
#Event to stop the playback
stop_event = threading.Event()

def voice_speak(text):
    tts = gTTS(text=text, lang='en', slow=False)
    out_dir = '/home/noemi/Licenta/licenta/code_by_me/texttospeech'
    if not os.path.exists(out_dir):
        os.makedirs(out_dir)
    path="/home/noemi/Licenta/licenta/code_by_me/texttospeech/output.mp3"
    tts.save(path)
    os.system(f"mpg321 {path}")
    os.remove(path)

def stop_play():
    stop_event.set()
    print('stop event')
    
def search_youtube(query):
    youtube = googleapiclient.discovery.build('youtube', 'v3', developerKey=API_KEY)
    request = youtube.search().list(
        part='snippet',
        q=query,
        type='video',
        maxResults=1
    )
    response = request.execute()
    print(response)
    if 'items' in response and len(response['items']) > 0:
        return response['items'][0]['id']['videoId']
    return None

def download_audio(video_id, output_path='downloads'):
    youtube_url = f"https://www.youtube.com/watch?v={video_id}"
    yt = YouTube(youtube_url)
    audio_stream = yt.streams.filter(only_audio=True).first()
    if not os.path.exists(output_path):
        os.makedirs(output_path)
    audio_file = audio_stream.download(output_path=output_path)
    return audio_file

def play_audio(file_path):
    player = vlc.MediaPlayer(file_path)
    player.audio_set_volume(30)
    player.play()
    
    while True:
        if stop_event.is_set():
            player.stop()
            break
        
        state = player.get_state()
        if state == vlc.State.Ended or state == vlc.State.Error:
            print('stop')
            break
    os.remove(file_path)
        
def main_youtube_player():
    stop_event.clear()
    query = None
    try:
        with sr.Microphone() as mic:
            print('listening')
            recognizer.adjust_for_ambient_noise(mic, duration=0.2)
            audio = recognizer.listen(mic, timeout = 5, phrase_time_limit = 10)
            query = recognizer.recognize_google(audio, language="en-US")
    except Exception:
           voice_speak("An error occured. Please try again")
    print(query)
    try:
        video_id = search_youtube(query)
        if video_id:
            audio_file_path = download_audio(video_id)
            play_audio(audio_file_path)
        else:
            voice_speak("Could not find any results")
    
    except Exception:
        voice_speak("An error occured. Please try again")
