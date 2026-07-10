# FallGuard AI — Product Requirements Document

**A Two-Stage Sensor-Fusion System for Real-Time Fall Detection in Elderly Individuals Living Alone**

---

| Field | Detail |
|---|---|
| Document Owner | Bhavya |
| Project Type | MCA Final Year Project — Full Stack + IoT + Agentic AI |
| Domain | HealthTech / Assistive IoT / Embedded AI |
| Version | 1.0 — MVP / Internet-Connected Release |
| Offline GSM Fallback | Planned for Version 2.0 |
| Status | Draft for Development |
| Last Updated | 21 June 2026 |

> *Confidential — Prepared for academic evaluation and development reference*

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals and Non-Goals](#3-goals-and-non-goals)
4. [Target Users and Personas](#4-target-users-and-personas)
5. [User Stories](#5-user-stories)
6. [System Architecture](#6-system-architecture)
7. [Functional Requirements](#7-functional-requirements)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [AI / Machine Learning Specification](#9-ai--machine-learning-specification)
10. [Data Model / Database Schema](#10-data-model--database-schema)
11. [API Specification](#11-api-specification)
12. [Hardware Specification](#12-hardware-specification)
13. [Companion Application — UX Specification](#13-companion-application--ux-specification)
14. [Technology Stack Summary](#14-technology-stack-summary)
15. [Testing Strategy](#15-testing-strategy)
16. [Project Timeline](#16-project-timeline)
17. [Risks and Mitigations](#17-risks-and-mitigations)
18. [Success Metrics](#18-success-metrics)
19. [Appendix](#19-appendix)

---

## 1. Executive Summary

FallGuard AI is a sensor-fusion fall detection system designed to protect elderly individuals who live alone. The system fuses motion data from a wrist-worn inertial sensor with confirmation data from a millimeter-wave (mmWave) radar sensor, processes both signals through an on-device CNN classifier, and — upon confirming a fall — sends a real-time alert over the internet to a dedicated family-facing mobile/web application.

The central engineering problem this project solves is the unacceptably high false-positive rate of commercial single-sensor fall detectors (40–60% in published evaluations). FallGuard AI addresses this with a **two-stage confirmation architecture**: an inertial measurement unit (IMU) detects an impact-like motion signature, and an independent mmWave radar confirms that a body is physically present and stationary near the floor before any alert is raised. A **30-second voice/button check-in window** further suppresses false alarms before they reach a caregiver.

**Version 1.0** (the subject of this document) is an internet-connected MVP. The hardware prototype runs tethered to a development laptop for power and programming, and alerts are delivered to the companion application exclusively over WiFi using HTTP/MQTT to a cloud backend. Offline GSM-based calling and SMS is explicitly scoped out of Version 1.0 and documented as a planned Version 2.0 capability.

This document specifies the problem, users, functional and non-functional requirements, system architecture, data model, AI/ML pipeline, hardware bill of materials, API contracts, application UX, testing strategy, project timeline, risks, and success metrics for FallGuard AI.

---

## 2. Problem Statement

### 2.1 Background

India is home to over 140 million people aged 60 and above, and this population is growing faster than the country's eldercare infrastructure. A large and increasing share of this group lives alone or with a spouse only, often because adult children have relocated to other cities or countries. For this demographic, a fall is one of the most dangerous and common medical events: the WHO identifies falls as the second leading cause of accidental injury death worldwide, and risk increases sharply with age.

The danger of a fall is rarely the fall itself — it is the absence of timely response. An elderly person who falls and is unable to get up may remain on the floor for hours before being discovered, leading to dehydration, pressure injuries, hypothermia, or complications from an initial injury that would otherwise have been minor.

### 2.2 Why Existing Solutions Fall Short

- Commercial wearable fall detectors (e.g. single-IMU pendants) report false-positive rates of **40–60%** in independent studies, causing alert fatigue — families eventually stop trusting or responding to alerts.
- Camera-based fall detection raises serious privacy concerns for in-home use and is frequently rejected by elderly users and their families on dignity grounds.
- Manual check-in apps depend on the elderly person remembering to respond, which fails precisely in the scenario they are meant to protect against — incapacitation.
- Existing affordable products in the Indian market are either basic SOS pendants requiring a manual button press (useless if the person is unconscious) or expensive imported systems with subscription costs that price out the target demographic.

### 2.3 Problem Statement (Formal)

> *There is no affordable, low-false-positive, dignity-preserving system available to Indian families that can automatically detect when an elderly person living alone has fallen, distinguish a genuine fall from routine movement with high confidence, and notify a remote family member in near real time.*

### 2.4 Opportunity

By combining two independent, privacy-preserving, non-camera sensing modalities (wrist IMU and ambient mmWave radar) with an on-device AI classifier and a lightweight cloud-connected alerting pipeline, it is possible to build a prototype that meaningfully reduces false positives compared to single-sensor systems, while remaining inexpensive enough to be built and demonstrated as a student project.

---

## 3. Goals and Non-Goals

### 3.1 Goals (Version 1.0)

1. Detect a fall event using on-device AI inference on IMU motion data with high recall (target ≥ 95% sensitivity on test fall scenarios).
2. Reduce false positives using a second, independent confirmation signal (mmWave radar) before any alert is generated.
3. Provide a manual override (physical button) that allows the user to cancel a false alarm within a defined countdown window.
4. Transmit a confirmed fall event to a backend server over WiFi with end-to-end latency under 5 seconds under normal network conditions.
5. Deliver the alert to a dedicated companion application (web and/or mobile) with the event details — timestamp, confidence score, and device status.
6. Demonstrate the complete pipeline — sensor → edge inference → confirmation logic → cloud → application — as a working, demoable prototype on a breadboard, tethered to a laptop for power.
7. Log all events (true alerts, cancelled alerts, and system status) for later analysis and demonstration of system behaviour.

### 3.2 Non-Goals — Explicitly Out of Scope for Version 1.0

- **Offline operation:** the system requires an active WiFi connection in Version 1.0. No cellular (GSM/SIM800L) fallback, no SMS, and no voice calling are included.
- **Wearable form factor:** the wristband is not built as a finished, battery-powered, enclosed wearable. It remains a breadboard prototype tethered to a laptop for power and serial debugging.
- **Ambient room sensors** for daily routine / activity-pattern anomaly detection (e.g. PIR-based "no motion for 4 hours" monitoring) are not part of Version 1.0. The mmWave radar in this version is used exclusively for fall confirmation, not general activity tracking.
- Multi-user / multi-elder support, caregiver role management, and subscription billing are not included.
- Regulatory medical-device certification (CDSCO) is out of scope for an academic prototype.

### 3.3 Version 2.0 Preview (Reference Only)

Version 2.0 is expected to introduce a GSM/SIM800L module for offline SMS and voice-call alerting when WiFi is unavailable, a finished wearable enclosure with onboard battery, and ambient room sensors for broader wellness monitoring. These are noted here for roadmap context only; this PRD specifies Version 1.0 in full detail.

---

## 4. Target Users and Personas

### 4.1 Primary User — The Monitored Individual

| Attribute | Description |
|---|---|
| Name (persona) | Kamala, 71 |
| Living situation | Lives alone in a tier-2 city; one adult child lives in another city |
| Technical comfort | Low to moderate; cannot be expected to operate a complex app |
| Core need | Continue living independently without feeling under surveillance or like a burden |
| Key concern | Dignity — does not want a camera in her home, and does not want frequent false alarms worrying her family |

### 4.2 Secondary User — The Remote Caregiver

| Attribute | Description |
|---|---|
| Name (persona) | Arjun, 38 |
| Relationship | Son of the monitored individual, lives in another city for work |
| Technical comfort | High — comfortable with a mobile app, expects real-time and reliable notifications |
| Core need | Confidence that he will be notified quickly and accurately if something happens to his mother |
| Key concern | Trust in the system — repeated false alarms will cause him to stop trusting and ignore the app |

### 4.3 Tertiary User — The Project Evaluator

For the academic context, a third user group exists: the faculty evaluation panel who will assess the system's technical depth, including sensor fusion logic, AI model training methodology, API design, and application usability.

---

## 5. User Stories

| ID | User Story | Acceptance Criteria |
|---|---|---|
| US-1 | As Kamala, I want the system to detect when I fall, even if I cannot press a button, so that help can be alerted automatically. | A simulated fall (sharp IMU spike + mmWave static-body confirmation) results in an alert event being created without any button press. |
| US-2 | As Kamala, I want to be able to cancel a false alarm quickly, so my family is not unnecessarily worried. | Pressing the physical button within the countdown window cancels the pending alert and no notification is sent to the app. |
| US-3 | As Arjun, I want to receive a real-time notification when a fall is confirmed, so I can act immediately. | A confirmed fall event appears in the companion application within 5 seconds of confirmation, including timestamp and event status. |
| US-4 | As Arjun, I want to see the device's connectivity status in the app, so I know if the system might be failing silently. | The app displays a live "device online/offline" indicator based on periodic heartbeat messages from the ESP32. |
| US-5 | As Arjun, I want to view a history of past events (confirmed and cancelled) to understand patterns over time. | The app's history view lists all logged events with timestamp, type (confirmed/cancelled/test), and resolution status. |
| US-6 | As the project evaluator, I want to see the AI model's decision process and confidence scores. | The app or a debug view exposes the CNN's class probabilities and the mmWave confirmation status for each event. |

---

## 6. System Architecture

### 6.1 High-Level Overview

The system is composed of four logical layers:

1. **Sensing Layer** — IMU + mmWave radar wired to an ESP32-S3
2. **Edge Intelligence Layer** — on-device CNN inference and confirmation-window logic running on the ESP32-S3 firmware
3. **Connectivity and Backend Layer** — WiFi → HTTPS/MQTT → cloud API → database
4. **Application Layer** — web/mobile companion app consumed by the caregiver

### 6.2 Component Summary

| Layer | Components |
|---|---|
| Sensing Layer | MPU-6050 IMU (I2C) · Hi-Link HLK-LD2410B mmWave radar (UART) · Push button (GPIO, interrupt-driven) |
| Edge Intelligence Layer | ESP32-S3 microcontroller · TensorFlow Lite Micro runtime · Quantized CNN fall classifier (~140 KB) · Confirmation state machine (30-second countdown timer) |
| Connectivity Layer | ESP32-S3 onboard WiFi (802.11 b/g/n) · HTTPS REST client · MQTT client (optional) · NTP time sync |
| Backend / Cloud Layer | FastAPI (Python) REST API · PostgreSQL database · WebSocket server for real-time push · Hosted on Render/Railway |
| Application Layer | React (web) and/or React Native (mobile) companion app · Real-time event feed via WebSocket · JWT authentication |

### 6.3 End-to-End Data Flow — Fall Event

```
1.  MPU-6050 streams accel + gyro data to ESP32-S3 over I2C at 100 Hz
2.  ESP32 buffers a rolling 2-second window (200 samples × 6 axes)
3.  CNN classifies the window → fall class detected above threshold
4.  ESP32 queries HLK-LD2410B over UART for static presence confirmation
5.  Both sensors confirm → event marked FUSION_CONFIRMED
6.  ESP32 starts 30-second countdown + triggers voice check-in prompt (via laptop TTS)
7a. [Button pressed within 30s] → event marked CANCELLED → CANCELLED log sent to backend
7b. [No button press within 30s] → event marked CONFIRMED_FALL
8.  ESP32 sends HTTPS POST to /api/v1/events with event payload
9.  Backend persists event in PostgreSQL
10. Backend pushes event over WebSocket to connected caregiver app sessions
11. (Optional) Backend triggers Firebase Cloud Messaging push notification
12. Caregiver app displays full-screen alert with event details and quick actions
```

---

## 7. Functional Requirements

### 7.1 Firmware / Edge Device Requirements

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-1 | The firmware shall sample the MPU-6050 at a fixed rate of 100 Hz over I2C. | P0 | Sampling jitter must stay under ±5 ms |
| FR-2 | The firmware shall maintain a rolling buffer of the most recent 200 samples (2 seconds) across all 6 IMU axes. | P0 | Circular buffer in firmware memory |
| FR-3 | The firmware shall run on-device CNN inference using TensorFlow Lite Micro on every buffer update (or at minimum every 200 ms). | P0 | Quantized INT8 model, target inference < 20 ms |
| FR-4 | The firmware shall classify each window into one of 7 classes: forward fall, backward fall, lateral fall, sitting fast, bending, walking, intentional lying down. | P0 | See Section 9 for model details |
| FR-5 | On a fall-class detection above the configured confidence threshold, the firmware shall query the HLK-LD2410B for body presence confirmation within 1.5 seconds. | P0 | UART read of presence/distance frame |
| FR-6 | If both IMU and mmWave confirm, the firmware shall enter a 30-second PENDING_CONFIRMATION state and emit a check-in signal. | P0 | Signal is a serial message picked up by a laptop-side TTS script in V1 |
| FR-7 | The firmware shall monitor a GPIO-connected push button throughout the PENDING_CONFIRMATION state. | P0 | Interrupt-driven, debounced in software |
| FR-8 | If the button is pressed during the countdown, the firmware shall cancel the alert and log a CANCELLED event. | P0 | |
| FR-9 | If the countdown expires without a button press, the firmware shall transmit a CONFIRMED_FALL event to the backend over HTTPS. | P0 | Must include device ID, timestamp, model confidence, and event ID |
| FR-10 | The firmware shall send a periodic heartbeat every 30 seconds to the backend indicating the device is online. | P1 | Used by the app to display device connectivity status |
| FR-11 | The firmware shall reconnect automatically to WiFi if the connection drops, with exponential backoff retry. | P1 | Prevents silent failure if router restarts |
| FR-12 | The firmware shall queue up to 10 unsent events locally in RAM if the network is temporarily unavailable, and flush them once connectivity resumes. | P2 | Protects against momentary WiFi drops |

### 7.2 Backend API Requirements

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-13 | The backend shall expose a REST endpoint to receive fall event submissions from registered devices. | P0 | `POST /api/v1/events` |
| FR-14 | The backend shall expose a REST endpoint to receive device heartbeat/status updates. | P0 | `POST /api/v1/devices/{device_id}/heartbeat` |
| FR-15 | The backend shall authenticate device requests using a per-device API key issued at registration. | P0 | Prevents spoofed event injection |
| FR-16 | The backend shall persist all events (confirmed, cancelled, test) with full metadata to the database. | P0 | See Section 10 for schema |
| FR-17 | The backend shall push newly confirmed events to connected application clients in real time over WebSocket. | P0 | Sub-5-second delivery target |
| FR-18 | The backend shall expose authenticated REST endpoints for the application to fetch event history, device status, and account/family data. | P0 | JWT-based auth for app users |
| FR-19 | The backend shall support user registration and login for caregiver accounts. | P0 | Email/password with bcrypt hashing |
| FR-20 | The backend shall allow a caregiver to acknowledge/resolve a confirmed event from the app. | P1 | Updates event status to ACKNOWLEDGED with timestamp |
| FR-21 | The backend shall send a push notification (FCM) to the caregiver's registered device(s) on a confirmed fall, in addition to the WebSocket push. | P1 | Redundant delivery path for backgrounded app |

### 7.3 Application (Companion App) Requirements

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-22 | The application shall display a real-time alert screen immediately when a CONFIRMED_FALL event is received. | P0 | Full-screen, high-visibility alert with sound |
| FR-23 | The alert screen shall display the event timestamp, model confidence score, and device status. | P0 | |
| FR-24 | The application shall provide an "Acknowledge / I'm handling it" action on the alert screen. | P0 | Updates backend event status |
| FR-25 | The application shall display a chronological history of all past events with filter by status. | P0 | Confirmed / Cancelled / Test |
| FR-26 | The application shall display the live online/offline status of the registered device based on heartbeat recency. | P1 | Offline if no heartbeat within 90 seconds |
| FR-27 | The application shall support caregiver account login and registration. | P0 | |
| FR-28 | The application shall display the AI model's class probability breakdown for each event. | P2 | For technical/demo transparency during evaluation |

---

## 8. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Latency** | End-to-end latency from CONFIRMED_FALL on-device to alert visible in the app shall not exceed 5 seconds under normal WiFi conditions (RTT < 100 ms to backend). |
| **Reliability** | The fall classifier shall achieve a minimum sensitivity (recall) of 95% and a false positive rate below 5% on the held-out test set described in Section 9. |
| **Availability** | The backend API shall target 99% uptime during the demonstration and evaluation period. |
| **Security** | All device-to-backend and app-to-backend traffic shall use HTTPS/TLS. Device API keys and user passwords shall never be stored or transmitted in plaintext. |
| **Scalability** | The data model shall support multiple devices per family account and multiple family members per device, even though the V1 demo uses a single device/single caregiver setup. |
| **Usability** | The companion app shall require no more than 2 taps to acknowledge a confirmed alert from the moment the notification is received. |
| **Maintainability** | Firmware, backend, and frontend shall be organised as three independently deployable/buildable codebases with clear API contracts between them. |
| **Power (prototype)** | The breadboard prototype draws power from the laptop's USB port (5V); no power budget constraints apply in V1. |
| **Portability** | The mobile/web application shall be built using a single React-based codebase to minimize duplicated UI logic. |

---

## 9. AI / Machine Learning Specification

### 9.1 Model Purpose

The core AI component is a **1D Convolutional Neural Network (CNN)** that classifies a 2-second window of 6-axis IMU motion data into one of seven movement classes. This model is the Stage 1 detector in the two-stage fusion architecture. Stage 2 (mmWave confirmation) is a rule-based threshold check — not a trained model — described in Section 9.6.

### 9.2 Input Representation

- **Window size:** 200 timesteps (2 seconds at 100 Hz)
- **Channels:** 6 — `accel-X, accel-Y, accel-Z, gyro-X, gyro-Y, gyro-Z`
- **Input tensor shape:** `(200, 6)`
- **Normalization:** per-channel z-score normalization computed from training set statistics, applied identically at inference time

### 9.3 Output Classes

| # | Class | Description |
|---|---|---|
| 1 | Forward fall | Sharp forward acceleration spike followed by near-zero motion |
| 2 | Backward fall | Negative Z-axis spike with rotational (roll) component, then stillness |
| 3 | Lateral fall | High X-axis acceleration with a secondary impact peak (head/shoulder contact) |
| 4 | Sitting down fast | Spike similar to a fall but immediately followed by stable supported stillness |
| 5 | Bending / picking up object | Slow acceleration curve that returns to a vertical baseline within the window |
| 6 | Normal walking | Rhythmic, periodic acceleration signature with consistent gait frequency |
| 7 | Intentional lying down | Slow, controlled descent curve, distinct from a sharp fall impact |

### 9.4 Model Architecture

```
Input: (200, 6)
  │
  ├── Conv1D(32 filters, kernel=5, ReLU)
  ├── MaxPooling1D(pool_size=2)
  ├── Conv1D(64 filters, kernel=3, ReLU)
  ├── Dropout(rate=0.3)
  ├── Flatten
  ├── Dense(128, ReLU)
  └── Dense(7, Softmax)  ← class probabilities output
```

**Loss function:** Categorical cross-entropy  
**Optimizer:** Adam  
**Framework:** TensorFlow / Keras  
**Deployment format:** TensorFlow Lite (INT8 quantized) via TFLite Micro on ESP32-S3

### 9.5 Training Data and Methodology

1. **Primary public datasets:**
   - **FallAllD** — 576 subjects, multi-sensor (publicly available for academic research)
   - **MobiAct** — 66 subjects, 4 fall types + 9 activities of daily living
   - **SisFall** — 38 subjects, accelerometer + gyroscope

2. **Supplementary self-collected data:** 50–100 manually recorded samples using the project's own MPU-6050 hardware and wiring, to adapt the model to the specific sensor placement and noise characteristics of the prototype. Documented as an original contribution.

3. **Data split:** 70% training / 15% validation / 15% held-out test — split by subject (not by window) to prevent data leakage.

4. **Training environment:** Google Colab (free-tier GPU)

5. **Post-training quantization:** Keras model → TFLite format → INT8 quantization using the TFLite Converter, reducing model size from ~2 MB to under 200 KB.

### 9.6 Stage 2 — mmWave Confirmation Logic (Rule-Based, Not ML)

The HLK-LD2410B reports presence state (moving / static / none) and target distance over its UART data frame. The confirmation rule for V1:

> A fall classification from Stage 1 is escalated to **FUSION_CONFIRMED** only if the HLK-LD2410B reports a **static presence state continuously for at least 1.5 seconds** following the Stage 1 detection.

This is intentionally deterministic for the prototype. Future versions may incorporate the sensor's distance and energy-gate data into a trained confirmation model.

### 9.7 Target Performance Metrics

| Metric | Target | Rationale |
|---|---|---|
| Sensitivity (Recall) — fall classes | ≥ 95% | Missing a real fall is the worst-case failure mode; recall is prioritized over precision for Stage 1 |
| False Positive Rate (post-fusion) | < 5% | Achieved primarily through Stage 2 fusion + 30s confirmation window |
| On-device inference latency | < 20 ms | Must run within the 200 ms buffer update cycle on the ESP32-S3 |
| Quantized model size | < 200 KB | Must fit comfortably in ESP32-S3 flash alongside firmware and WiFi stack |

---

## 10. Data Model / Database Schema

The backend uses **PostgreSQL**. The following tables constitute the core schema for Version 1.0.

### 10.1 Entity Overview

- **`users`** — caregiver accounts (the people using the companion app)
- **`devices`** — registered FallGuard hardware units, linked to one or more users
- **`events`** — the core log of fall detections, cancellations, and test events
- **`device_heartbeats`** — periodic online/status pings from a device

### 10.2 Table: `users`

| Column | Type | Description |
|---|---|---|
| `id` | UUID, PK | Primary key |
| `full_name` | VARCHAR(120) | Caregiver's display name |
| `email` | VARCHAR(160), UNIQUE | Login identifier |
| `password_hash` | VARCHAR(255) | Bcrypt-hashed password |
| `phone_number` | VARCHAR(20) | Optional; for future V2 SMS/calling features |
| `created_at` | TIMESTAMP | Account creation time |

### 10.3 Table: `devices`

| Column | Type | Description |
|---|---|---|
| `id` | UUID, PK | Primary key |
| `device_name` | VARCHAR(120) | Human-readable label, e.g. "Kamala's Device" |
| `api_key_hash` | VARCHAR(255) | Hashed API key used by the ESP32 firmware to authenticate |
| `owner_user_id` | UUID, FK → `users.id` | Primary caregiver account linked to this device |
| `last_heartbeat_at` | TIMESTAMP, NULLABLE | Updated on every heartbeat; drives online/offline status in the app |
| `created_at` | TIMESTAMP | Device registration time |

### 10.4 Table: `events`

| Column | Type | Description |
|---|---|---|
| `id` | UUID, PK | Primary key |
| `device_id` | UUID, FK → `devices.id` | Originating device |
| `event_type` | ENUM | `CONFIRMED_FALL` · `CANCELLED` · `TEST` |
| `model_confidence` | FLOAT | Stage 1 CNN softmax confidence for the detected fall class |
| `fall_class` | VARCHAR(40) | e.g. `forward_fall`, `backward_fall`, `lateral_fall` |
| `mmwave_confirmed` | BOOLEAN | Whether Stage 2 fusion confirmed body presence |
| `status` | ENUM | `PENDING` · `CONFIRMED` · `ACKNOWLEDGED` · `CANCELLED` |
| `acknowledged_by` | UUID, FK → `users.id`, NULLABLE | Caregiver who acknowledged the event |
| `acknowledged_at` | TIMESTAMP, NULLABLE | When the event was acknowledged |
| `created_at` | TIMESTAMP | Event creation time (device-reported, NTP-synced) |

### 10.5 Table: `device_heartbeats`

| Column | Type | Description |
|---|---|---|
| `id` | UUID, PK | Primary key |
| `device_id` | UUID, FK → `devices.id` | Reporting device |
| `wifi_rssi` | INTEGER, NULLABLE | WiFi signal strength at time of heartbeat |
| `uptime_seconds` | INTEGER | Device uptime since last boot |
| `received_at` | TIMESTAMP | Server-side receipt timestamp |

---

## 11. API Specification

All endpoints are versioned under `/api/v1`. Device-originated endpoints authenticate via a per-device API key in the `X-Device-Key` header. User-originated endpoints authenticate via a JWT bearer token obtained at login.

### 11.1 Device → Backend Endpoints

#### `POST /api/v1/events`

Submits a confirmed or cancelled fall event from the device firmware.

```
Header:  X-Device-Key: <device API key>

Request body:
{
  "event_type": "CONFIRMED_FALL",
  "fall_class": "forward_fall",
  "model_confidence": 0.94,
  "mmwave_confirmed": true,
  "client_timestamp": "2026-06-21T14:32:10Z"
}

Response 201:
{
  "event_id": "<uuid>",
  "status": "CONFIRMED",
  "received_at": "2026-06-21T14:32:11Z"
}

Response 401: Invalid or missing device API key
```

#### `POST /api/v1/devices/{device_id}/heartbeat`

Reports device liveness and basic diagnostics.

```
Header:  X-Device-Key: <device API key>

Request body:
{
  "wifi_rssi": -52,
  "uptime_seconds": 184302
}

Response 200:
{
  "acknowledged": true,
  "server_time": "2026-06-21T14:32:11Z"
}
```

### 11.2 Application → Backend Endpoints

| Method & Path | Auth | Purpose |
|---|---|---|
| `POST /api/v1/auth/register` | None | Create a new caregiver account |
| `POST /api/v1/auth/login` | None | Authenticate and receive a JWT |
| `GET /api/v1/devices` | JWT | List devices linked to the authenticated user |
| `GET /api/v1/events?status=&limit=` | JWT | Fetch event history with optional filters |
| `PATCH /api/v1/events/{event_id}/acknowledge` | JWT | Mark an event as acknowledged by the current user |
| `GET /api/v1/devices/{device_id}/status` | JWT | Get live online/offline status and last heartbeat info |
| `WS /ws/events` | JWT (query param `token`) | WebSocket channel pushing new events in real time |

### 11.3 Real-Time Delivery Strategy

The backend maintains a WebSocket connection per active application session. When a new `CONFIRMED_FALL` event is persisted, the backend immediately publishes the event payload to all WebSocket connections belonging to users linked to that device.

As a redundant delivery path (in case the app is backgrounded or the WebSocket has dropped), the backend also triggers a **Firebase Cloud Messaging** push notification to the user's registered mobile device tokens.

---

## 12. Hardware Specification

> The Version 1.0 prototype is a **tethered breadboard build**, not a finished wearable. It is powered and programmed via a laptop USB connection. All alerting happens over WiFi.

### 12.1 Bill of Materials

| # | Component | Exact Use | Approx. Cost |
|---|---|---|---|
| 1 | **ESP32-S3 DevKit** | Microcontroller running the CNN fall classifier on-device via TFLite Micro. Connects to the laptop via USB for power and programming. Sends confirmed fall events to the backend over its built-in WiFi (802.11 b/g/n). | ₹700–900 |
| 2 | **MPU-6050 IMU Module (GY-521)** | Captures 3-axis accelerometer + 3-axis gyroscope data at 100 Hz. This is the raw signal your Stage 1 CNN reads to classify fall vs. normal movement. Connects via I2C (VCC, GND, SDA, SCL). | ₹80–150 |
| 3 | **Hi-Link HLK-LD2410B — 24GHz mmWave Radar** | Stage 2 confirmation sensor. After the IMU flags a possible fall, this sensor independently confirms whether a body is stationary nearby. Detects static human presence even without movement (unlike PIR). Connects via UART (VCC, GND, TX, RX). | ₹400–700 |
| 4 | **6mm Momentary Push Button** | The "I'm okay" cancel button. During the 30-second confirmation window after a fall is detected, pressing this button cancels the alert before it reaches the caregiver app. Wired to one GPIO pin + GND on the ESP32. | ₹10–30 |
| 5 | **Half-size Breadboard** | Prototyping platform for all sensor and button connections. No soldering required. | ₹80–120 |
| 6 | **Jumper Wire Kit (M-M and M-F, 40 each)** | All wiring between ESP32-S3, MPU-6050, HLK-LD2410B, and push button. M-M for breadboard rows, M-F for breakout module header pins. | ₹100–150 |
| 7 | **USB-A to USB-C Data Cable** | Powers the ESP32-S3 and enables code flashing from the laptop. Also carries serial monitor output for debugging. Must be a data-capable cable, not charge-only. | ₹100–200 |

**Total estimated hardware cost: ₹1,470 – ₹2,250**

### 12.2 Wiring Summary

| Connection | Pins |
|---|---|
| MPU-6050 → ESP32-S3 (I2C) | VCC → 3.3V · GND → GND · SDA → GPIO 21 · SCL → GPIO 22 |
| HLK-LD2410B → ESP32-S3 (UART) | VCC → 5V · GND → GND · TX → ESP32 RX · RX → ESP32 TX |
| Push button → ESP32-S3 (GPIO) | One leg → GPIO pin (internal pull-up enabled in firmware) · Other leg → GND |

### 12.3 Power Considerations

Because the prototype is tethered to a laptop, no battery management is required for V1. The laptop's USB port supplies sufficient current (typically 500–900 mA) for all three components combined.

> **Standalone demo note:** if a non-tethered demo is ever required, a 5V/2A USB power bank can substitute for the laptop with no firmware changes.

---

## 13. Companion Application — UX Specification

### 13.1 Core Screens

| Screen | Purpose and Key Elements |
|---|---|
| **Login / Register** | Email and password fields; standard auth flow |
| **Home / Dashboard** | Shows linked device(s), current online/offline status, last heartbeat time, and a prominent "All Clear" or "Active Alert" state banner |
| **Active Alert Screen** | Full-screen, high-contrast layout shown immediately when a `CONFIRMED_FALL` event arrives; displays timestamp, fall type, model confidence, and two large action buttons: "Acknowledge / I'm Handling It" and "View Details" |
| **Event History** | Reverse-chronological list of all past events with status badges (Confirmed / Cancelled / Test); tapping an event opens a detail view |
| **Event Detail View** | Shows the AI model's class probability breakdown, the mmWave confirmation result, and resolution metadata if acknowledged |
| **Device Settings** | Displays device name, linked API key (masked), and diagnostics (WiFi signal strength, uptime) pulled from the latest heartbeat |

### 13.2 Notification Behaviour

- On receiving a `CONFIRMED_FALL` push (WebSocket while foregrounded, FCM while backgrounded), the app shall surface a high-priority system-level notification.
- Tapping the notification shall deep-link directly to the Active Alert Screen for that specific event.
- The app shall play an audible alert tone when a fall event is received while the app is in the foreground.

### 13.3 Visual Design Principles

- **High contrast and large touch targets** — this app may be used in moments of stress by a caregiver who needs to act quickly.
- **Clear state differentiation** — a calm "All Clear" state (soft green) must be visually unmistakable from an urgent "Active Alert" state (red, full-screen, animated).
- **No friction in the acknowledge flow** — speed of action matters more than confirmation dialogs in this context.

---

## 14. Technology Stack Summary

| Layer | Technology Choices |
|---|---|
| **Firmware** | C++ (Arduino framework for ESP32-S3) · TensorFlow Lite Micro · ArduinoJson (payload serialization) · WiFiClientSecure (HTTPS) |
| **AI/ML Training** | Python · TensorFlow / Keras · NumPy / Pandas (preprocessing) · Google Colab (training environment) · TFLite Converter (INT8 quantization) |
| **Backend API** | Python · FastAPI · Uvicorn (ASGI server) · SQLAlchemy (ORM) · Pydantic (request/response validation) · python-jose (JWT) · passlib/bcrypt (password hashing) |
| **Database** | PostgreSQL — managed instance via Render, Railway, or Supabase |
| **Real-Time Delivery** | FastAPI native WebSocket support · Firebase Cloud Messaging (push notification redundancy) |
| **Frontend (App)** | React (web) and/or React Native with Expo (mobile) · Axios for REST calls · Native WebSocket client · Context API or Redux for state |
| **Hosting / Deployment** | Backend: Render or Railway (free tier) · Frontend: Vercel (web) or Expo Go (mobile demo) · DB: managed PostgreSQL on same provider |
| **Dev Tools** | Arduino IDE or PlatformIO (firmware) · Postman (API testing) · GitHub (version control — three repos: `/firmware`, `/backend`, `/app`) |

---

## 15. Testing Strategy

### 15.1 AI Model Validation

- **Held-out test set evaluation:** confusion matrix across all 7 classes, with particular focus on the fall-vs-sitting-fast and fall-vs-bending confusion pairs (the hardest to distinguish).
- **Cross-subject validation:** evaluate on subjects not seen during training to avoid inflated accuracy from overfitting to individual movement styles.
- **On-device validation:** after TFLite INT8 quantization, re-run the test set through the quantized model to confirm accuracy degradation remains within acceptable bounds (target: < 2% drop versus the float32 model).

### 15.2 Firmware / Hardware Testing

- **Unit-level:** verify I2C communication with the MPU-6050 and UART communication with the HLK-LD2410B independently using serial-monitor diagnostic output before integrating the full pipeline.
- **Integration:** simulate fall scenarios by hand (dropping the breadboard-mounted IMU onto a cushioned surface) and verify correct state machine transitions: `IDLE → PENDING_CONFIRMATION → FUSION_CONFIRMED → COUNTDOWN → CONFIRMED/CANCELLED`.
- **False-positive scenario testing:** deliberately perform non-fall high-acceleration movements (sitting down quickly, picking up an object) and verify the system does not escalate to a confirmed alert.
- **Network resilience:** disconnect WiFi mid-test to verify the firmware's reconnect/backoff logic and local event queuing (FR-11 and FR-12).

### 15.3 Backend API Testing

- Endpoint-level testing using Postman or automated `pytest + httpx` test suites for each REST endpoint, covering valid and invalid (malformed, unauthenticated, unauthorized) requests.
- WebSocket delivery testing: confirm an event POSTed to `/api/v1/events` is pushed to a connected WebSocket client within the 5-second latency target.

### 15.4 Application Testing

- Manual UX testing of the full alert flow: trigger a fall on the hardware → confirm the alert appears in the app within the latency target → confirm the acknowledge action correctly updates state on the backend.
- Cross-platform testing if both web and mobile clients are built.

### 15.5 End-to-End Demo Script (For Evaluation)

1. Power on the prototype; confirm the device registers a heartbeat and shows **"Online"** in the app.
2. Perform a deliberate **non-fall motion** (e.g. sitting down quickly); confirm no alert escalates — demonstrating false-positive suppression.
3. Perform a **simulated fall motion**; confirm the check-in prompt triggers; **press the cancel button** within the window; confirm a `CANCELLED` event appears in history but no alert notification fires.
4. Perform a **simulated fall motion** again; do **not** press the button; confirm a `CONFIRMED_FALL` alert appears in the app within 5 seconds, with correct metadata.
5. **Acknowledge** the alert from the app and confirm the status updates correctly in the event history.

---

## 16. Project Timeline

> Suggested schedule for an MCA academic semester

| Phase | Duration | Key Deliverables |
|---|---|---|
| **Phase 1 — Research & Setup** | Week 1–2 | Finalize hardware procurement; set up Arduino IDE/PlatformIO; verify individual sensor communication (I2C, UART) in isolation |
| **Phase 2 — Data & Model** | Week 3–5 | Download and preprocess public datasets; collect supplementary self-recorded samples; train, validate, and quantize the CNN classifier |
| **Phase 3 — Firmware Integration** | Week 6–8 | Implement the full on-device pipeline: buffering, inference, mmWave fusion, confirmation state machine, button handling |
| **Phase 4 — Backend Development** | Week 7–9 (parallel) | Build FastAPI service, database schema, authentication, WebSocket delivery, device registration flow |
| **Phase 5 — Connectivity Integration** | Week 9–10 | Connect firmware to backend over WiFi/HTTPS; validate end-to-end event delivery and latency |
| **Phase 6 — Application Development** | Week 8–11 (parallel) | Build companion app screens, real-time event subscription, authentication, history and detail views |
| **Phase 7 — Testing & Refinement** | Week 12–13 | Execute the full testing strategy; tune confidence thresholds and confirmation window based on observed false-positive/negative rates |
| **Phase 8 — Documentation & Demo Prep** | Week 14 | Finalize PRD, prepare demo script, record fallback demo video in case of live-demo hardware issues |

---

## 17. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| CNN model overfits to self-recorded data, performing poorly on unfamiliar movement styles | False negatives during live demo | Prioritize the larger public datasets for training; treat self-recorded data as augmentation, not the primary training source; validate on a cross-subject held-out set |
| WiFi instability during live demonstration | Alert delivery fails or is delayed during evaluation | Use a dedicated mobile hotspot as backup network; demonstrate local event-queue/retry logic (FR-12) as a resilience talking point |
| mmWave sensor false-negatives due to placement/orientation | Genuine falls stuck at PENDING_CONFIRMATION and never escalated | Test sensor placement extensively during Phase 3; consider a timeout-based fallback (escalate via IMU alone if mmWave does not respond within X seconds) as a safety net |
| ESP32-S3 inference timing exceeds 200 ms buffer cycle under real conditions | Missed windows, degraded responsiveness | Profile inference time early in Phase 3; fall back to a smaller/shallower CNN architecture if needed |
| Scope creep toward V2 features consuming time meant for core V1 functionality | Incomplete or rushed core deliverable | This PRD explicitly fixes V1 scope (Section 3.2); any V2 work should only be attempted after all P0 requirements are demonstrably working |
| Backend hosting free-tier cold starts affecting demo reliability | WebSocket delivery delays during evaluation | Run a local backend instance as a fallback during the live demo, with the hosted version as primary |

---

## 18. Success Metrics

### 18.1 Technical Success Criteria

1. Stage 1 CNN achieves **≥ 95% recall** on fall classes and **≥ 90% overall classification accuracy** on the held-out test set.
2. Post-fusion false positive rate is demonstrably lower than Stage 1 alone, measured across at least 20 deliberate non-fall test movements.
3. End-to-end latency from confirmed fall to visible app alert is consistently **under 5 seconds** across at least 10 live test runs.
4. The full demo script in Section 15.5 executes successfully without manual intervention beyond the specified user actions.

### 18.2 Academic / Project Success Criteria

- The system demonstrates clear technical depth across all required full-stack layers: embedded firmware, AI/ML model development, backend API design, database design, and frontend application development.
- The two-stage sensor fusion architecture and its false-positive reduction rationale can be clearly articulated and demonstrated live, distinguishing this project from a basic single-sensor fall detector.
- The codebase is organised, documented, and version-controlled in a way that supports straightforward continuation into Version 2.0 without architectural rework.

---

## 19. Appendix

### 19.1 Glossary

| Term | Definition |
|---|---|
| **IMU** | Inertial Measurement Unit — a sensor combining an accelerometer and gyroscope to measure motion and orientation |
| **mmWave Radar** | Millimeter-wave radar — detects human presence and micro-movements without a camera |
| **TFLite Micro** | TensorFlow Lite for Microcontrollers — a runtime for executing quantized neural network models on resource-constrained embedded devices |
| **Sensor Fusion** | Combining data from multiple independent sensors to produce a more reliable result than any single sensor alone |
| **False Positive** | A system-generated fall alert where no actual fall occurred |
| **False Negative** | A real fall event that the system fails to detect or alert on — the most safety-critical failure mode |
| **JWT** | JSON Web Token — a compact, signed token format used for stateless user authentication |
| **FCM** | Firebase Cloud Messaging — Google's push notification delivery service |
| **UART** | Universal Asynchronous Receiver/Transmitter — a serial communication protocol used to connect the mmWave radar to the ESP32 |
| **I2C** | Inter-Integrated Circuit — a serial communication protocol used to connect the MPU-6050 to the ESP32 |

### 19.2 Reference Datasets

- **FallAllD** — multi-sensor fall detection dataset, 576 subjects. Publicly available for academic research.
- **MobiAct** — mobile-sensor activity and fall dataset, 66 subjects, 4 fall types and 9 activities of daily living.
- **SisFall** — accelerometer and gyroscope fall dataset, 38 subjects.

### 19.3 Open Questions for Development Phase

1. **MQTT vs. HTTPS REST** for firmware-to-backend event submission — REST is simpler for this project's scale, but MQTT may be revisited for battery-conscious design in Version 2.0.
2. **Mobile-first vs. web-first** for the companion application — recommended default is a responsive React web app for V1, since it is faster to demo across any evaluator's device without requiring app installation.
3. **Confidence threshold calibration** — the document assumes a tunable threshold rather than fixing a specific number. This should be calibrated empirically after real model training data and self-recorded samples are available.

---

*End of Document — FallGuard AI Product Requirements Document, Version 1.0*
