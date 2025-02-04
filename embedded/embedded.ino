#include <WiFi.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <ArduinoJson.h>
#include <time.h>
#include <vector>
#include <esp_timer.h>

/*
This is the embedded section using an ESP32. 
Originally, this code would have been split into multiple files, but due to limitations in the Arduino IDE, 
it is kept in a single file for simplicity.

This file performs several tasks:

1. Connects to WiFi.
2. Synchronizes the system time using an NTP server.
3. Sets up a BLE server to advertise itself as "ESP32".
4. Uses MyServerCallbacks to handle BLE connections.
5. Defines BLE characteristics and processes received data.

When data is received over BLE, the decibel data is collected in chunks, 
processed, and stored for playback.

Two tasks are then started:
- Each task plays back the processed audio levels by controlling LEDs using PWM.
- Hardware timers are used to trigger playback at the correct time, ensuring non-blocking execution 
  and avoiding watchdog resets.
- The playback is synchronized by pausing for 34013 microseconds, calculated from the sample rate 
  and wave file frequency (750 / 22050).

This ensures that the audio and LED lighting remain synchronized.
*/


#define SERVICE_UUID "35a3d836-c932-4b25-a881-80ab03c766b4"
#define CHARACTERISTIC_UUID "45193246-649b-4d84-ade9-17153d0e3211"
#define LED_PIN_1 18
#define LED_PIN_2 4

const char *ssid = "N3C777";
const char *password = "Example-Wifi-Password";

BLEServer *pServer = NULL;
BLECharacteristic *pCharacteristic = NULL;
bool deviceConnected = false;

std::string jsonBuffer = "";
long receivedTimestamp = 0;
std::vector<std::vector<int>> allNormalizedLevels;

TaskHandle_t task1Handle = NULL;
TaskHandle_t task2Handle = NULL;

esp_timer_handle_t timer1;
esp_timer_handle_t timer2;

bool task1Ready = false;
bool task2Ready = false;

class MyServerCallbacks : public BLEServerCallbacks
{
  void onConnect(BLEServer *pServer)
  {
    deviceConnected = true;
    Serial.println("Device connected!");
  }

  void onDisconnect(BLEServer *pServer)
  {
    deviceConnected = false;
    Serial.println("Device disconnected!");
    BLEDevice::startAdvertising();
  }
};

class MyCharacteristicCallbacks : public BLECharacteristicCallbacks
{
  void onWrite(BLECharacteristic *characteristic)
  {
    std::string value = characteristic->getValue();
    if (value.length() > 0)
    {
      Serial.print("Received chunk: ");
      Serial.println(value.c_str());
      if (value.find("<END>") != std::string::npos)
      {
        jsonBuffer += value.substr(0, value.find("<END>"));
        Serial.println("Complete JSON received:");
        Serial.println(jsonBuffer.c_str());
        StaticJsonDocument<2048> doc;
        DeserializationError error = deserializeJson(doc, jsonBuffer.c_str());
        if (error)
        {
          Serial.print("Failed to parse JSON: ");
          Serial.println(error.f_str());
        }
        else
        {
          receivedTimestamp = doc["timestamp"];
          JsonArray processedAudios = doc["decibelData"]["processed_audios"];
          if (processedAudios.size() > 0)
          {
            Serial.print("Number of audio files received: ");
            Serial.println(processedAudios.size());
            allNormalizedLevels.clear();
            for (JsonObject audio : processedAudios)
            {
              JsonArray levels = audio["normalized_levels"];
              std::vector<int> normalizedLevels;
              Serial.print("Processing audio_id: ");
              Serial.println(audio["audio_id"].as<int>());
              for (int level : levels)
              {
                normalizedLevels.push_back(level);
              }
              allNormalizedLevels.push_back(normalizedLevels);
            }
            if (allNormalizedLevels.size() > 0)
              task1Ready = true;
            if (allNormalizedLevels.size() > 1)
              task2Ready = true;
          }
          else
          {
            Serial.println("No audio files found in JSON.");
          }
        }
        jsonBuffer = "";
      }
      else
      {
        jsonBuffer += value;
      }
    }
  }
};

void IRAM_ATTR timer1Callback(void *arg)
{
  static int index1 = 0;
  std::vector<int> *levels = (std::vector<int> *)arg;
  if (index1 < levels->size())
  {
    ledcWrite(0, (*levels)[index1]);
    index1++;
  }
  else
  {
    esp_timer_stop(timer1);
    index1 = 0;
    task1Ready = false;
    Serial.println("Finished processing levels on LED 1.");
  }
}

void IRAM_ATTR timer2Callback(void *arg)
{
  static int index2 = 0;
  std::vector<int> *levels = (std::vector<int> *)arg;
  if (index2 < levels->size())
  {
    ledcWrite(10, (*levels)[index2]);
    index2++;
  }
  else
  {
    esp_timer_stop(timer2);
    index2 = 0;
    task2Ready = false;
    Serial.println("Finished processing levels on LED 2.");
  }
}

void processLevelsTask1(void *parameter)
{
  while (true)
  {
    if (task1Ready && time(nullptr) >= receivedTimestamp)
    {
      std::vector<int> &levels = allNormalizedLevels[0];
      esp_timer_create_args_t timer1Args = {
          .callback = &timer1Callback,
          .arg = &levels,
          .dispatch_method = ESP_TIMER_TASK,
          .name = "Timer1"};
      esp_timer_create(&timer1Args, &timer1);
      esp_timer_start_periodic(timer1, 34013); 
      task1Ready = false;
    }
    vTaskDelay(10 / portTICK_PERIOD_MS);
  }
}

void processLevelsTask2(void *parameter)
{
  while (true)
  {
    if (task2Ready && time(nullptr) >= receivedTimestamp)
    {
      std::vector<int> &levels = allNormalizedLevels[1];
      esp_timer_create_args_t timer2Args = {
          .callback = &timer2Callback,
          .arg = &levels,
          .dispatch_method = ESP_TIMER_TASK,
          .name = "Timer2"};
      esp_timer_create(&timer2Args, &timer2);
      esp_timer_start_periodic(timer2, 34013); 
      task2Ready = false;
    }
    vTaskDelay(10 / portTICK_PERIOD_MS);
  }
}

void setup()
{
  Serial.begin(115200);

  ledcSetup(0, 5000, 8);
  ledcAttachPin(LED_PIN_1, 0);

  ledcSetup(10, 5000, 8);
  ledcAttachPin(LED_PIN_2, 10);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi!");

  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  Serial.println("Synchronizing time...");
  while (time(nullptr) < 100000)
  {
    delay(100);
    Serial.print(".");
  }
  Serial.println("\nTime synchronized!");

  BLEDevice::init("ESP32");
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);

  pCharacteristic = pService->createCharacteristic(
      CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE);

  pCharacteristic->setValue("Hello from ESP32!");
  pCharacteristic->setCallbacks(new MyCharacteristicCallbacks());

  pService->start();

  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();

  Serial.println("ESP32 BLE is now advertising!");

  xTaskCreatePinnedToCore(processLevelsTask1, "Process Levels Task 1", 4096, NULL, 1, &task1Handle, 0);
  xTaskCreatePinnedToCore(processLevelsTask2, "Process Levels Task 2", 4096, NULL, 1, &task2Handle, 1);
}

void loop()
{
}
