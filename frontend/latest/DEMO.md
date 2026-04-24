# SmartSeason Demo Credentials

## 🎯 Demo Accounts

### Regional Agronomist
| Field | Value |
|-------|-------|
| **Role** | Regional agronomist |
| **ID** | u-001 |
| **Name** | Amina Njoroge |
| **Zone** | North cluster |
| **Status** | online |

### Field Agent
| Field | Value |
|-------|-------|
| **Role** | Field agent |
| **ID** | u-002 |
| **Name** | David Kiptoo |
| **Zone** | River belt |
| **Status** | in-field |

### Field Agent
| Field | Value |
|-------|-------|
| **Role** | Field agent |
| **ID** | u-003 |
| **Name** | Miriam Chebet |
| **Zone** | Hillside plots |
| **Status** | online |

### Irrigation Lead
| Field | Value |
|-------|-------|
| **Role** | Irrigation lead |
| **ID** | u-004 |
| **Name** | Brian Otieno |
| **Zone** | Central farms |
| **Status** | offline |

---

## 🌾 Demo Fields

### Field 1: North Gate Block A
| Field | Value |
|-------|-------|
| **ID** | fld-101 |
| **Name** | North Gate Block A |
| **Crop Type** | Maize |
| **Location** | Trans Nzoia |
| **Hectares** | 24 |
| **Soil Type** | Loam |
| **Irrigation** | Drip |
| **Planting Date** | 2026-03-02 |
| **Harvest Date** | 2026-07-18 |
| **Stage** | Growing |
| **Moisture** | 63% |
| **NDVI** | 0.72 |
| **Completion** | 45% |
| **Status** | Active |

### Field 2: Riverside Plot B
| Field | Value |
|-------|-------|
| **ID** | fld-102 |
| **Name** | Riverside Plot B |
| **Crop Type** | Wheat |
| **Location** | Nakuru |
| **Hectares** | 18 |
| **Soil Type** | Clay |
| **Irrigation** | Sprinkler |
| **Planting Date** | 2026-02-14 |
| **Harvest Date** | 2026-06-25 |
| **Stage** | Growing |
| **Moisture** | 58% |
| **NDVI** | 0.65 |
| **Completion** | 62% |
| **Status** | Active |

### Field 3: Hillside Section C
| Field | Value |
|-------|-------|
| **ID** | fld-103 |
| **Name** | Hillside Section C |
| **Crop Type** | Barley |
| **Location** | Baringo |
| **Hectares** | 15 |
| **Soil Type** | Sandy |
| **Irrigation** | Furrow |
| **Planting Date** | 2026-03-20 |
| **Harvest Date** | 2026-08-10 |
| **Stage** | Planted |
| **Moisture** | 52% |
| **NDVI** | 0.58 |
| **Completion** | 8% |
| **Status** | At Risk |

### Field 4: Central Block D
| Field | Value |
|-------|-------|
| **ID** | fld-104 |
| **Name** | Central Block D |
| **Crop Type** | Sorghum |
| **Location** | Kericho |
| **Hectares** | 22 |
| **Soil Type** | Loam |
| **Irrigation** | Drip |
| **Planting Date** | 2026-01-29 |
| **Harvest Date** | 2026-05-30 |
| **Stage** | Ready |
| **Moisture** | 48% |
| **NDVI** | 0.81 |
| **Completion** | 88% |
| **Status** | Active |

---

## 🌤️ Demo Weather Data

| Field | Value |
|-------|-------|
| **Condition** | Cloud cover with light showers |
| **Rainfall Chance** | 62% |
| **Humidity** | 78% |
| **Wind** | 14 km/h |
| **Advisory** | Delay fertilizer application on low-drainage plots after 16:00 |

---

## 📊 How to Use Demo Mode

1. **Start the backend** (if not running, data won't persist to database):
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend**:
   ```bash
   cd frontend/latest
   npm run dev
   ```

3. **Open the dashboard** at `http://localhost:5173`

4. **Select a role** from the dropdown in the top-right corner:
   - Regional agronomist (full access)
   - Field agent (limited to own fields)
   - Manager (view-only)

5. **Create a field** using the form on the right side:
   - Fill in all required fields
   - Click "Register new plot"
   - The field will be saved to localStorage (demo mode) or MySQL (when backend is online)

---

## 🔄 Reset Demo Data

Click the "Reset demo" button in the form header to restore all demo data to its original state.

---

## ⚠️ Note

When the backend is offline, data is stored in browser localStorage. To persist data to the actual MySQL database, ensure:
1. MySQL server is running
2. Database `smartseason` exists
3. Backend server is running on port 5000
4. Database credentials in `backend/.env` are correct