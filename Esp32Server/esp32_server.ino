#include <WiFi.h>
#include <TB6612_ESP32.h>

//Hotspot connection credentials 
const char* ssid = "your_network_id";
const char* password = "your_network_password";

//Set a static IP to the board
IPAddress staticIP(172, 20, 10, 5); 
IPAddress gateway(172, 20, 10, 1); 
IPAddress subnet(255, 255, 255, 0);   
IPAddress dns(8, 8, 8, 8);            

//Web server listening on port 80
WiFiServer server(80);

// Function declarations
void handleUp(WiFiClient client);
void handleUpLonger(WiFiClient client);
void handleDown(WiFiClient client);
void handleDownLonger(WiFiClient client);
void handleLeft(WiFiClient client);
void handleRight(WiFiClient client);

//Motor Driver pin definitions
#define AIN1 13 
#define BIN1 12 
#define AIN2 14 
#define BIN2 27 
#define PWMA 26 
#define PWMB 25 
#define STBY 33 
#define RED_PIN 5
#define GREEN_PIN 17
#define BLUE_PIN 18

const int offsetA = 1;
const int offsetB = 1;

Motor motor1 = Motor(AIN1, AIN2, PWMA, offsetA, STBY,5000 ,8,1 );
Motor motor2 = Motor(BIN1, BIN2, PWMB, offsetB, STBY,5000 ,8,2 );

void setup() {
  Serial.begin(115200);
 
  Serial.print("Connecting to ");
  Serial.println(ssid);
  
  WiFi.config(staticIP, gateway, subnet, dns);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi...");
  }
  
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  
  server.begin();
  Serial.println("HTTP server started");

  //Set LED's pins modes
  pinMode(RED_PIN, OUTPUT);

  pinMode(GREEN_PIN, OUTPUT);

  pinMode(BLUE_PIN, OUTPUT);
}

void loop() {
  WiFiClient client = server.available();

  //Values are reversed, 0 actually meaning 255
  analogWrite(RED_PIN,   0);
  analogWrite(GREEN_PIN, 0);
  analogWrite(BLUE_PIN,  255);
  
  if (client) {
    Serial.println("New client");
    String currentLine = "";

    while (client.connected()) {
      if (client.available()) {
        char c = client.read();
        currentLine += c;
        Serial.println(c);
        if (c == '\n') {
          if (currentLine.startsWith("GET /up")) {
            handleUp(client);
          } else if (currentLine.startsWith("GET /down")) {
            handleDown(client);
          } else if (currentLine.startsWith("GET /left")) {
            handleLeft(client);
          } else if (currentLine.startsWith("GET /right")) {
            handleRight(client);
          } else if (currentLine.startsWith("GET /longerup")) {
            handleUpLonger(client);
          } else if (currentLine.startsWith("GET /longerdown")) {
            handleDownLonger(client);
          }
          break;
        }
      }
    }
    
    // Close the connection after request handled
    client.stop();
    
    Serial.println("Client disconnected.");
  }
}

void handleUp(WiFiClient client) {
  forward(motor1, motor2, -150);      
  delay(300);
  brake(motor1, motor2);  
  Serial.println("Up action handled");
  client.println("HTTP/1.1 200 OK");
  client.println("Content-type:text/plain");
  client.println("Connection: close");
  client.println();
  client.println("Up action handled");
}

void handleUpLonger(WiFiClient client) {
  forward(motor1, motor2, -150);   
  delay(1000);
  brake(motor1, motor2);   
  Serial.println("Up action handled");
  client.println("HTTP/1.1 200 OK");
  client.println("Content-type:text/plain");
  client.println("Connection: close");
  client.println();
  client.println("Up action handled");
}

void handleDown(WiFiClient client) {
  forward(motor1, motor2, 150);   
  delay(300);
  brake(motor1, motor2);  
  Serial.println("Down action handled");
  client.println("HTTP/1.1 200 OK");
  client.println("Content-type:text/plain");
  client.println("Connection: close");
  client.println();
  client.println("Down action handled");
}

void handleDownLonger(WiFiClient client) {
  forward(motor1, motor2, 150);     
  delay(1000);
  brake(motor1, motor2);  
  Serial.println("Down action handled");
  client.println("HTTP/1.1 200 OK");
  client.println("Content-type:text/plain");
  client.println("Connection: close");
  client.println();
  client.println("Down action handled");
}

void handleLeft(WiFiClient client) {
  right(motor1, motor2, 255); 
  delay(500);
  brake(motor1, motor2); 
  Serial.println("Left action handled");
  client.println("HTTP/1.1 200 OK");
  client.println("Content-type:text/plain");
  client.println("Connection: close");
  client.println();
  client.println("Left action handled");
}

void handleRight(WiFiClient client) {
  left(motor1, motor2, 255); 
  delay(500);
  brake(motor1, motor2);   
  Serial.println("Right action handled");
  client.println("HTTP/1.1 200 OK");
  client.println("Content-type:text/plain");
  client.println("Connection: close");
  client.println();
  client.println("Right action handled");
}
