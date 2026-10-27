const int PINO_SENSOR_MQ2 = A0;

// --- Parâmetros da conversão para ppm ---
const float RL = 5.0;    // resistor de carga do módulo, em kΩ (confira no seu módulo)
const float R0 = 10.0;   // Rs medido em ar limpo, em kΩ (calibre o seu)
const float CURVA_A = 574.25;  // curva do GLP (MQ-2)
const float CURVA_B = -2.222;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int valorSensor = analogRead(PINO_SENSOR_MQ2);

  float ppm = 0;
  if (valorSensor > 0) {
    float rs = RL * (1023.0 - valorSensor) / valorSensor;
    float razao = rs / R0;
    ppm = CURVA_A * pow(razao, CURVA_B);
  }

  Serial.print(valorSensor);
  Serial.println(ppm);

  delay(1000);
}