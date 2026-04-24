# SmartSeason Field Monitoring System

A comprehensive field monitoring dashboard for agricultural management, built with React frontend and Express.js backend with MySQL database.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Database Setup

1. **Create the database:**
   ```sql
   CREATE DATABASE smartseason;
   ```

2. **Configure environment:**
   Edit `backend/.env` with your MySQL credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=smartseason
   DB_PORT=3306
   PORT=5000
   ```

### Backend Setup

```bash
cd SmartSeason-Field-monitoring-system/backend
npm install
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

```bash
cd SmartSeason-Field-monitoring-system/frontend/latest
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` (or next available port)

---

## 📋 Project Structure

```
SmartSeason-Field-monitoring-system/
├── backend/
│   ├── config/
│   │   └── db.js           # Database connection configuration
│   ├── controllers/
│   │   ├── fieldcontroller.js
│   │   └── usercontroller.js
│   ├── middleware/
│   │   ├── auth.js         # Authentication middleware
│   │   └── roleGuard.js    # Role-based access control
│   ├── models/
│   │   ├── fieldmodel.js   # Sequelize field model
│   │   ├── fieldUpdate.js   # Field update model
│   │   ├── fieldassignment.js
│   │   └── user.js         # User model
│   ├── routes/
│   │   ├── auth.js         # Authentication routes
│   │   └── fieldroute.js   # Field CRUD routes
│   ├── server/
│   │   └── server.js       # Main Express server
│   ├── statusengine/
│   │   └── statusEngine.js # Field status computation
│   ├── .env                # Environment variables
│   └── package.json
│
├── frontend/
│   └── latest/
│       ├── src/
│       │   ├── App.jsx     # Main React component
│       │   ├── App.css    # Dashboard styles
│       │   ├── main.jsx   # React entry point
│       │   └── index.css  # Global styles
│       ├── index.html
│       ├── vite.config.js
│       └── package.json
│
└── README.md
```

---

## 🏗️ Design Decisions

### 1. Architecture
- **Frontend**: React 19 with Vite for fast development and bundling
- **Backend**: Express.js 5 with RESTful API design
- **Database**: MySQL with mysql2 driver for async/await support
- **ORM**: Sequelize for database abstraction (optional, raw SQL also supported)

### 2. API Communication
- RESTful endpoints between frontend and backend
- CORS enabled for cross-origin requests
- JSON payload format for all requests

### 3. Data Model
- **Fields Table**: Stores field information (name, crop type, location, hectares, etc.)
- **Field Updates Table**: Tracks field observations and stage changes
- **Auto-timestamps**: `created_at` and `updated_at` fields with auto-update

### 4. Field Status Computation
Fields are automatically categorized based on:
- **Stage**: Planted → Growing → Ready → Harvested
- **Moisture**: < 45% = At Risk
- **NDVI**: < 0.6 = At Risk
- **Completion**: 100% = Completed

### 5. Frontend Features
- Role-based views (Regional agronomist, Field agent, Manager)
- Real-time field status dashboard
- Field creation and update forms
- Activity and alert tracking
- Team member management

---

## 📌 Assumptions Made

### 1. Database
- MySQL is the primary database (not PostgreSQL or MongoDB)
- Database user has sufficient privileges to create tables
- Date fields are stored in `YYYY-MM-DD` format

### 2. Authentication
- Simple role-based access (no JWT implementation yet)
- Demo mode available when backend is offline

### 3. Field IDs
- Field IDs follow pattern: `fld-{random}` (e.g., `fld-a1b2c3`)
- Task IDs follow pattern: `tsk-{random}`
- Activity IDs follow pattern: `act-{random}`

### 4. Default Values
- Default assignee: `u-002` (Field agent)
- Default moisture: 56%
- Default NDVI: 0.6
- Default completion: 12%
- Default risk level: Moderate
- Default stage: Planted

### 5. Frontend State
- State persisted in localStorage for demo mode
- Backend connection status checked on load
- Fallback to mock data when backend unavailable

---

## 🔧 API Endpoints

### Health Check
```
GET /health
```

### Fields
```
GET    /api/fields           # Get all fields
POST   /api/fields           # Create new field
GET    /api/fields/:id       # Get single field
PUT    /api/fields/:id       # Update field
DELETE /api/fields/:id       # Delete field
```

### Field Updates
```
GET    /api/field-updates              # Get all field updates
POST   /api/fields/:id/updates         # Create field update
```

---

## 🧪 Testing

### Test Backend Health
```bash
curl http://localhost:5000/health
```

### Test Field Creation
```bash
curl -X POST http://localhost:5000/api/fields ^
  -H "Content-Type: application/json" ^
  -d "{\"id\": \"test-001\", \"name\": \"Test Field\", \"cropType\": \"Maize\", \"location\": \"Trans Nzoia\", \"hectares\": 10.5, \"soilType\": \"Loam\", \"irrigationType\": \"Drip\", \"plantingDate\": \"2024-01-01\", \"harvestDate\": \"2024-06-01\"}"
```

---

## 📝 Environment Variables

### Backend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| DB_HOST | MySQL host | localhost |
| DB_USER | MySQL username | root |
| DB_PASSWORD | MySQL password | - |
| DB_NAME | Database name | smartseason |
| DB_PORT | MySQL port | 3306 |
| PORT | Server port | 5000 |

### Frontend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_BASE_URL | Backend API URL | http://localhost:5000 |

---

## 🔍 Troubleshooting

### Port Already in Use
If you get "Port 5000 is in use", either:
1. Kill the existing process: `taskkill /F /IM node.exe`
2. Or change the port in `.env`

### Database Connection Failed
1. Verify MySQL is running
2. Check credentials in `backend/.env`
3. Ensure database `smartseason` exists

### Frontend Can't Connect to Backend
1. Check backend is running on port 5000
2. Verify CORS settings in backend
3. Check firewall settings

---

## 📄 License

ISC License 
