# Peptide Detection App

A real-time peptide detection and analysis platform that interfaces with Arduino-based biosensors, providing live electrochemical signal visualization, automated peptide identification, and a searchable peptide database.

## Architecture

- **Backend**: Node.js + Express, PostgreSQL, WebSocket (ws), SerialPort for Arduino
- **Frontend**: React, Recharts for real-time graphing, Tailwind CSS
- **Database**: PostgreSQL with four normalized tables
- **Hardware**: Arduino via USB serial (configurable port)

## Quick Start

### Prerequisites
- Docker & Docker Compose
- (Optional) Node.js 18+ for local development
- Arduino connected via USB for live sensor data

### With Docker
```bash
cp backend/.env.example backend/.env   # edit as needed
docker-compose up --build
```

Frontend → http://localhost:3000  
Backend API → http://localhost:5000/api  
WebSocket → ws://localhost:5000

### Local Development

**Backend**
```bash
cd backend
npm install
cp .env.example .env    # configure DB, JWT, serial port
npm run migrate         # run SQL migrations
npm run seed            # load sample peptides
npm run dev
```

**Frontend**
```bash
cd frontend
npm install
npm start
```

## Environment Variables (backend/.env)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Express server port |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USER` | `peptide_user` | DB username |
| `DB_PASSWORD` | `peptide_pass` | DB password |
| `DB_NAME` | `peptide_db` | DB name |
| `JWT_SECRET` | — | Secret for JWT signing |
| `ARDUINO_PORT` | `/dev/ttyUSB0` | Serial port for Arduino |
| `ARDUINO_BAUD` | `9600` | Baud rate |
| `NODE_ENV` | `development` | Environment |

## API Routes

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/peptides` | List/search peptides |
| GET | `/api/peptides/:id` | Peptide details |
| POST | `/api/analysis/sessions` | Start analysis session |
| GET | `/api/analysis/sessions` | List sessions |
| GET | `/api/analysis/sessions/:id` | Session + readings |
| POST | `/api/device/connect` | Connect Arduino |
| GET | `/api/device/status` | Device status |

WebSocket events: `sensor_reading`, `analysis_result`, `device_status`

## Project Structure

```
peptide-detection-app/
├── backend/          Node.js API + Arduino service
├── frontend/         React SPA
└── docker-compose.yml
```
