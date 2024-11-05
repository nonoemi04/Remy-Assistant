import requests
from bs4 import BeautifulSoup
import vlc
import os
import threading
import time
from gtts import gTTS
import subprocess
import speech_recognition as sr

book_urls = {
    'journey to the center of the earth': 'https://www.learnoutloud.com/podcaststream/listen.php?url=http://librivox.org/rss/5332&all=1&title=75850',
    'white fang': 'https://www.learnoutloud.com/podcaststream/listen.php?url=http://librivox.org/rss/4677&all=1&title=35515',
    'arabian nights': 'https://www.learnoutloud.com/podcaststream/listen.php?url=http://librivox.org/rss/958&all=1&title=35147',
    'the great gatsby': 'https://www.learnoutloud.com/podcaststream/listen.php?url=https://librivox.org/rss/16113&all=1&title=114592',
    'moby dick': 'https://www.learnoutloud.com/podcaststream/listen.php?url=http://feeds.feedburner.com/mobydickbigread&all=1&title=46997',
    'pride and prejudice': 'https://www.learnoutloud.com/podcaststream/listen.php?url=http://librivox.org/rss/1480&all=1&title=18990',
    'jane eyre': 'https://www.learnoutloud.com/podcaststream/listen.php?url=http://librivox.org/rss/2192&all=1&title=34883',
    'the chronicles of narnia': 'https://www.learnoutloud.com/podcaststream/listen.php?url=https://www.ancientfaith.com/feeds/series/the_chronicles_of_narnia&all=1&title=45901'
}

recognizer = sr.Recognizer()
stop_event = threading.Event()

def stop_read():
    stop_event.set()
    print('stop reading')
        
def voice_speak(text):
    tts = gTTS(text=text, lang='en', slow=False)
    out_dir = '/home/noemi/Licenta/licenta/code_by_me/texttospeech'
    if not os.path.exists(out_dir):
        os.makedirs(out_dir)
    path="/home/noemi/Licenta/licenta/code_by_me/texttospeech/output.mp3"
    tts.save(path)
    os.system(f"mpg321 {path}")
    os.remove(path)

def get_links(book):
    try:
        url = book_urls.get(book)
        if not url:
            return None
        
        response = requests.get(url)
        print(response.status_code)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            mp3_links = []
            for li in soup.find_all('li', class_='playlistItem'):
                mp3_link = li.get('data-mp3')
                if mp3_link:
                    mp3_links.append(mp3_link)
            return mp3_links
    
    except requests.exceptions.RequestException as e:
        print(f"Request Exception: {e}")
        return None
    except Exception as e:
        print(f"Exception occurred: {e}")
        return None

def play_links(links):
    is_playing = False
    stop_playing = False
    
    try:
        for l in links:
            # Only play the next chapter after the current one ends and the playback is not stopped
            if not is_playing and not stop_playing:
                is_playing = True
                player = vlc.MediaPlayer(l)
                player.audio_set_volume(80)
                player.play()
                while True:
                    if stop_event.is_set():
                        player.stop()
                        stop_playing = True
                        break
                            
                    state = player.get_state()
                    if state == vlc.State.Ended or state == vlc.State.Error:
                        voice_speak("End of chapter")
                        is_playing = False
                        player =  None
                        break
                        
                        
    except Exception as e:
        voice_speak('Error playing. Try again.')
    
    finally:
        if player:
            player.stop()
            player.release()

def read_ebook():
    book = None
    try:
        with sr.Microphone() as mic:
            print('Listening...')
            recognizer.adjust_for_ambient_noise(mic, duration=0.2)
            audio = recognizer.listen(mic, timeout=5, phrase_time_limit=10)
            book = recognizer.recognize_google(audio, language="en-US")
        
        print(f"Recognized book: {book}")
        links = get_links(book.lower())
        
        if links:
            play_links(links)
        else:
            print(f"No links found for '{book}'.")
            voice_speak("This book is not supported yet.")
    
    except sr.WaitTimeoutError:
        print("Timeout waiting for audio input.")
    except sr.UnknownValueError:
        print("Could not understand audio.")
    except Exception as e:
        print(f"Error occurred: {e}")
        voice_speak("An error occurred. Please try again.")

