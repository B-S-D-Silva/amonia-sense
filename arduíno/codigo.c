const int PINO_SENSOR_MQ2 = A0;

// --- Parâmetros da conversão para ppm (amônia, NH3) ---
const float RL = 5.0;                // resistor de carga do módulo, em kΩ
const float RAZAO_AR_LIMPO = 3.6;    // Rs/R0 em ar limpo para esta curva
const float CURVA_A = 102.2;         // curva NH3 (aproximação)
const float CURVA_B = -2.473;

// --- Limites (ppm) ---
const float LIMITE_ALERTA = 10.0;
const float LIMITE_CRITICO = 20.0;
const float PPM_MAXIMO = 50.0;

float R0 = 10.0;  // calculado na calibração

float calcularRs(int valorSensor) {
  return RL * (1023.0 - valorSensor) / valorSensor;
}

void setup() {
  Serial.begin(9600);

  Serial.println("Aquecendo e calibrando (mantenha em ar limpo)...");
  delay(60000);  // aquecimento; quanto mais tempo, melhor

  float somaRs = 0;
  for (int i = 0; i < 50; i++) {
    int leitura = analogRead(PINO_SENSOR_MQ2);
    if (leitura > 0) somaRs += calcularRs(leitura);
    delay(100);
  }
  R0 = (somaRs / 50.0) / RAZAO_AR_LIMPO;

  Serial.print("R0 calibrado: ");
  Serial.println(R0);
}

void loop() {
  int valorSensor = analogRead(PINO_SENSOR_MQ2);

  float ppm = 0;
  if (valorSensor > 0) {
    float rs = calcularRs(valorSensor);
    ppm = CURVA_A * pow(rs / R0, CURVA_B);
  }
  ppm = constrain(ppm, 0, PPM_MAXIMO);

  const char* status;
  if (ppm > LIMITE_CRITICO) {
    status = "CRITICO";
  } else if (ppm >= LIMITE_ALERTA) {
    status = "ALERTA";
  } else {
    status = "ESTAVEL";
  }

  Serial.print("Valor de Saída do Sensor: ");
  Serial.print(valorSensor);
  Serial.print(" -> ppm: ");
  Serial.print(ppm);
  Serial.print(" -> Status: ");
  Serial.println(status);

  delay(1000);
}