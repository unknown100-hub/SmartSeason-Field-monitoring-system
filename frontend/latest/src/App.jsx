import {
  startTransition,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useState,
} from 'react'
import './App.css'

const STORAGE_KEY = 'smartseason-dashboard-state'
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5000'

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'fields', label: 'Field registry' },
  { id: 'operations', label: 'Operations' },
  { id: 'reports', label: 'Reports' },
]

const STAGE_MAP = {
  planning: 'Planted',
  emergence: 'Planted',
  planted: 'Planted',
  vegetative: 'Growing',
  flowering: 'Growing',
  'grain fill': 'Growing',
  growing: 'Growing',
  'harvest ready': 'Ready',
  ready: 'Ready',
  harvested: 'Harvested',
}

function normalizeStage(stage) {
  if (!stage) {
    return 'Planted'
  }

  return STAGE_MAP[String(stage).trim().toLowerCase()] || 'Growing'
}

function computeFieldStatus(fieldLike) {
  const stage = normalizeStage(fieldLike.stage)
  const moisture = Number(fieldLike.moisture ?? 0)
  const ndvi = Number(fieldLike.ndvi ?? 0)
  const completion = Number(fieldLike.completion ?? 0)
  const harvestDate = fieldLike.harvestDate
  const harvestTime = harvestDate ? new Date(harvestDate).getTime() : Number.POSITIVE_INFINITY

  if (stage === 'Harvested' || completion >= 100) {
    return 'Completed'
  }

  if (moisture < 45 || ndvi < 0.6 || Date.now() > harvestTime) {
    return 'At Risk'
  }

  return 'Active'
}

function decorateField(field) {
  const stage = normalizeStage(field.stage)
  return {
    ...field,
    stage,
    status: computeFieldStatus({ ...field, stage }),
  }
}

function statusClassName(status) {
  return String(status).toLowerCase().replace(/\s+/g, '-')
}

const SEED_DATA = {
  team: [
    { id: 'u-001', name: 'Amina Njoroge', role: 'Regional agronomist', zone: 'North cluster', status: 'online' },
    { id: 'u-002', name: 'David Kiptoo', role: 'Field agent', zone: 'River belt', status: 'in-field' },
    { id: 'u-003', name: 'Miriam Chebet', role: 'Field agent', zone: 'Hillside plots', status: 'online' },
    { id: 'u-004', name: 'Brian Otieno', role: 'Irrigation lead', zone: 'Central farms', status: 'offline' },
  ],
  weather: {
    condition: 'Cloud cover with light showers',
    rainfallChance: 62,
    humidity: 78,
    wind: '14 km/h',
    advisory: 'Delay fertilizer application on low-drainage plots after 16:00.',
  },
  fields: [
    {
      id: 'fld-101',
      name: 'North Gate Block A',
      cropType: 'Maize',
      location: 'Trans Nzoia',
      hectares: 24,
      soilType: 'Loam',
      irrigationType: 'Drip',
      plantingDate: '2026-03-02',
      harvestDate: '2026-07-18',
      stage: 'Growing',
      moisture: 63,
      ndvi: 0.71,
      completion: 58,
      assigneeId: 'u-002',
      status: 'Active',
      lastUpdate: '2026-04-20T09:20:00',
    },
    {
      id: 'fld-102',
      name: 'Riverbank Orchard',
      cropType: 'Tomatoes',
      location: 'Uasin Gishu',
      hectares: 12,
      soilType: 'Sandy loam',
      irrigationType: 'Sprinkler',
      plantingDate: '2026-02-14',
      harvestDate: '2026-06-10',
      stage: 'Growing',
      moisture: 41,
      ndvi: 0.55,
      completion: 76,
      assigneeId: 'u-003',
      status: 'At Risk',
      lastUpdate: '2026-04-21T06:10:00',
    },
    {
      id: 'fld-103',
      name: 'Sunrise Demo Plot',
      cropType: 'Beans',
      location: 'Nakuru',
      hectares: 8,
      soilType: 'Clay loam',
      irrigationType: 'Rain-fed',
      plantingDate: '2026-03-20',
      harvestDate: '2026-06-30',
      stage: 'Planted',
      moisture: 74,
      ndvi: 0.82,
      completion: 32,
      assigneeId: 'u-002',
      status: 'Active',
      lastUpdate: '2026-04-20T15:45:00',
    },
    {
      id: 'fld-104',
      name: 'Central Pivot East',
      cropType: 'Wheat',
      location: 'Laikipia',
      hectares: 31,
      soilType: 'Silty clay',
      irrigationType: 'Pivot',
      plantingDate: '2026-01-29',
      harvestDate: '2026-05-26',
      stage: 'Ready',
      moisture: 52,
      ndvi: 0.67,
      completion: 84,
      assigneeId: 'u-004',
      status: 'Active',
      lastUpdate: '2026-04-19T12:00:00',
    },
  ],
  tasks: [
    {
      id: 'tsk-501',
      title: 'Inspect moisture variance on Block A',
      fieldId: 'fld-101',
      ownerId: 'u-002',
      dueDate: '2026-04-22',
      priority: 'Medium',
      status: 'In progress',
    },
    {
      id: 'tsk-502',
      title: 'Treat tomato field for early blight risk',
      fieldId: 'fld-102',
      ownerId: 'u-003',
      dueDate: '2026-04-21',
      priority: 'Critical',
      status: 'Pending',
    },
    {
      id: 'tsk-503',
      title: 'Validate harvest readiness on pivot east',
      fieldId: 'fld-104',
      ownerId: 'u-004',
      dueDate: '2026-04-24',
      priority: 'High',
      status: 'Pending',
    },
    {
      id: 'tsk-504',
      title: 'Update bean plot emergence photos',
      fieldId: 'fld-103',
      ownerId: 'u-002',
      dueDate: '2026-04-23',
      priority: 'Low',
      status: 'Done',
    },
  ],
  alerts: [
    {
      id: 'alt-301',
      fieldId: 'fld-102',
      severity: 'Critical',
      title: 'Low moisture and disease pressure',
      detail: 'Tomato canopy readings fell below threshold after two hot afternoons.',
      createdAt: '2026-04-21T05:50:00',
    },
    {
      id: 'alt-302',
      fieldId: 'fld-101',
      severity: 'Medium',
      title: 'Irrigation window moved',
      detail: 'Evening watering slot shortened due to pump maintenance.',
      createdAt: '2026-04-20T10:00:00',
    },
  ],
  activities: [
    {
      id: 'act-901',
      actorId: 'u-003',
      fieldId: 'fld-102',
      message: 'Flagged fungicide recommendation for supervisor review.',
      createdAt: '2026-04-21T06:20:00',
    },
    {
      id: 'act-902',
      actorId: 'u-002',
      fieldId: 'fld-101',
      message: 'Uploaded moisture scan and stand count.',
      createdAt: '2026-04-20T09:20:00',
    },
    {
      id: 'act-903',
      actorId: 'u-004',
      fieldId: 'fld-104',
      message: 'Requested combine calibration before harvest.',
      createdAt: '2026-04-19T12:15:00',
    },
  ],
  fieldUpdates: [
    {
      id: 'upd-201',
      fieldId: 'fld-102',
      agentId: 'u-003',
      stage: 'Growing',
      note: 'Observed uneven moisture on the western rows and signs of leaf stress.',
      createdAt: '2026-04-21T06:20:00',
    },
    {
      id: 'upd-202',
      fieldId: 'fld-101',
      agentId: 'u-002',
      stage: 'Growing',
      note: 'Stand count looks stable after irrigation adjustment yesterday evening.',
      createdAt: '2026-04-20T09:20:00',
    },
  ],
}

function loadDashboardState() {
  const seedState = structuredClone(SEED_DATA)

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        ...seedState,
        ...parsed,
        team: Array.isArray(parsed.team) ? parsed.team : seedState.team,
        weather: parsed.weather ?? seedState.weather,
        fields: Array.isArray(parsed.fields)
          ? parsed.fields.map(decorateField)
          : seedState.fields.map(decorateField),
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : seedState.tasks,
        alerts: Array.isArray(parsed.alerts) ? parsed.alerts : seedState.alerts,
        activities: Array.isArray(parsed.activities)
          ? parsed.activities
          : seedState.activities,
        fieldUpdates: Array.isArray(parsed.fieldUpdates)
          ? parsed.fieldUpdates
          : seedState.fieldUpdates,
      }
    }
  } catch {
    return {
      ...seedState,
      fields: seedState.fields.map(decorateField),
    }
  }

  return {
    ...seedState,
    fields: seedState.fields.map(decorateField),
  }
}

function formatDate(dateLike, options = {}) {
  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(new Date(dateLike))
}

function formatDateTime(dateLike) {
  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateLike))
}

function createFieldId() {
  return `fld-${Math.random().toString(36).slice(2, 8)}`
}

function createTaskId() {
  return `tsk-${Math.random().toString(36).slice(2, 8)}`
}

function createActivityId() {
  return `act-${Math.random().toString(36).slice(2, 8)}`
}

function createUpdateId() {
  return `upd-${Math.random().toString(36).slice(2, 8)}`
}

function downloadTextFile(filename, text, mimeType) {
  const blob = new Blob([text], { type: mimeType })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

async function fetchBackendFields() {
  const response = await fetch(`${API_BASE_URL}/api/fields`)
  if (!response.ok) {
    throw new Error('Failed to fetch fields from backend')
  }

  return response.json()
}

async function createBackendField(field) {
  const response = await fetch(`${API_BASE_URL}/api/fields`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(field),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.message || 'Failed to save field to backend')
  }

  return response.json()
}

async function fetchBackendFieldUpdates() {
  const response = await fetch(`${API_BASE_URL}/api/field-updates`)
  if (!response.ok) {
    throw new Error('Failed to fetch field updates from backend')
  }

  return response.json()
}

async function createBackendFieldUpdate(fieldId, update) {
  const response = await fetch(`${API_BASE_URL}/api/fields/${fieldId}/updates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(update),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.message || 'Failed to save field update')
  }

  return response.json()
}

async function updateBackendField(fieldId, field) {
  const response = await fetch(`${API_BASE_URL}/api/fields/${fieldId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(field),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.message || 'Failed to update field in backend')
  }

  return response.json()
}

async function deleteBackendField(fieldId) {
  const response = await fetch(`${API_BASE_URL}/api/fields/${fieldId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.message || 'Failed to delete field from backend')
  }
}

function App() {
  const [dashboard, setDashboard] = useState(loadDashboardState)
  const [activeView, setActiveView] = useState('overview')
  const [selectedFieldId, setSelectedFieldId] = useState('fld-102')
  const [fieldStatusFilter, setFieldStatusFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [roleView, setRoleView] = useState('Admin')
  const [activeAgentId, setActiveAgentId] = useState('u-002')
  const [backendHealth, setBackendHealth] = useState({
    state: 'checking',
    label: 'Checking API',
  })
  const [saveState, setSaveState] = useState({
    kind: 'idle',
    message: 'Fields will sync to MySQL when the backend is online.',
  })
  const [formMode, setFormMode] = useState('create')
  const [fieldForm, setFieldForm] = useState({
    name: '',
    cropType: '',
    location: '',
    hectares: '',
    soilType: '',
    irrigationType: '',
    plantingDate: '',
    harvestDate: '',
    assigneeId: 'u-002',
  })
  const [agentUpdateForm, setAgentUpdateForm] = useState({
    stage: '',
    note: '',
  })

  const deferredSearch = useDeferredValue(searchTerm.trim().toLowerCase())
  const persistState = useEffectEvent((nextState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState))
  })

  useEffect(() => {
    persistState(dashboard)
  }, [dashboard])

  useEffect(() => {
    let cancelled = false

    async function checkBackendHealth() {
      try {
        const response = await fetch(`${API_BASE_URL}/health`)
        if (!response.ok) {
          throw new Error('Health check failed')
        }

        await response.json()

        if (!cancelled) {
          const [backendFields, backendFieldUpdates] = await Promise.all([
            fetchBackendFields(),
            fetchBackendFieldUpdates(),
          ])
          setBackendHealth({
            state: 'online',
            label: 'API connected',
          })
          setDashboard((current) => ({
            ...current,
            fields:
              backendFields.length > 0
                ? backendFields.map(decorateField)
                : current.fields.map(decorateField),
            fieldUpdates:
              backendFieldUpdates.length > 0 ? backendFieldUpdates : current.fieldUpdates,
          }))
          if (backendFields.length > 0) {
            setSelectedFieldId(backendFields[0].id)
            setAgentUpdateForm({
              stage: backendFields[0].stage ?? '',
              note: '',
            })
          }
        }
      } catch {
        if (!cancelled) {
          setBackendHealth({
            state: 'offline',
            label: 'Mock mode active',
          })
        }
      }
    }

    checkBackendHealth()

    return () => {
      cancelled = true
    }
  }, [])

  const fieldAgents = dashboard.team.filter((member) =>
    member.role.toLowerCase().includes('field agent'),
  )
  const activeAgent =
    dashboard.team.find((member) => member.id === activeAgentId) ?? fieldAgents[0]
  const scopedFields =
    roleView === 'Field agent'
      ? dashboard.fields.filter((field) => field.assigneeId === activeAgent?.id)
      : dashboard.fields
  const scopedTasks =
    roleView === 'Field agent'
      ? dashboard.tasks.filter((task) => task.ownerId === activeAgent?.id)
      : dashboard.tasks
  const scopedAlerts =
    roleView === 'Field agent'
      ? dashboard.alerts.filter((alert) =>
          scopedFields.some((field) => field.id === alert.fieldId),
        )
      : dashboard.alerts
  const scopedActivities =
    roleView === 'Field agent'
      ? dashboard.activities.filter((activity) => activity.actorId === activeAgent?.id)
      : dashboard.activities
  const scopedFieldUpdates =
    roleView === 'Field agent'
      ? dashboard.fieldUpdates.filter((update) => update.agentId === activeAgent?.id)
      : dashboard.fieldUpdates

  const selectedField =
    scopedFields.find((field) => field.id === selectedFieldId) ?? scopedFields[0]

  const visibleFields = scopedFields
    .filter((field) => {
      if (fieldStatusFilter === 'All') {
        return true
      }

      return field.status === fieldStatusFilter
    })
    .filter((field) => {
      if (!deferredSearch) {
        return true
      }

      const haystack = [
        field.name,
        field.cropType,
        field.location,
        field.stage,
        field.status,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(deferredSearch)
    })

  const monitoredHectares = scopedFields.reduce(
    (total, field) => total + Number(field.hectares),
    0,
  )
  const atRiskCount = scopedFields.filter((field) => field.status === 'At Risk').length
  const pendingTasks = scopedTasks.filter((task) => task.status !== 'Done').length
  const averageCompletion = Math.round(
    scopedFields.length > 0
      ? scopedFields.reduce((total, field) => total + field.completion, 0) /
          scopedFields.length
      : 0,
  )
  const reportCoverage = Math.round(
    scopedFields.length > 0 ? (scopedActivities.length / (scopedFields.length * 2)) * 100 : 0,
  )

  const sortedTasks = [...scopedTasks].sort(
    (left, right) => new Date(left.dueDate) - new Date(right.dueDate),
  )
  const sortedAlerts = [...scopedAlerts].sort(
    (left, right) => new Date(right.createdAt) - new Date(left.createdAt),
  )
  const sortedActivities = [...scopedActivities].sort(
    (left, right) => new Date(right.createdAt) - new Date(left.createdAt),
  )
  const sortedFieldUpdates = [...scopedFieldUpdates].sort(
    (left, right) => new Date(right.createdAt) - new Date(left.createdAt),
  )
  const scopeLabel =
    roleView === 'Field agent'
      ? `${activeAgent?.name ?? 'Selected agent'} workspace`
      : 'All fields workspace'
  const scopeDescription =
    roleView === 'Field agent'
      ? 'Focused on assigned fields, alerts, and work for one agent at a time.'
      : 'A complete operational view across every monitored field.'
  const nextPriorityTask = sortedTasks[0]
  const newestAlert = sortedAlerts[0]

  function getUser(userId) {
    return dashboard.team.find((member) => member.id === userId)
  }

  function getField(fieldId) {
    return dashboard.fields.find((field) => field.id === fieldId)
  }

  function handleSelectField(fieldId) {
    const nextField = dashboard.fields.find((field) => field.id === fieldId)
    setSelectedFieldId(fieldId)
    setAgentUpdateForm({
      stage: nextField?.stage ?? '',
      note: '',
    })
  }

  function resetAgentUpdateForm(nextStage = selectedField?.stage ?? '') {
    setAgentUpdateForm({
      stage: nextStage,
      note: '',
    })
  }

  function populateFieldForm(field) {
    setFieldForm({
      name: field.name,
      cropType: field.cropType,
      location: field.location,
      hectares: String(field.hectares),
      soilType: field.soilType,
      irrigationType: field.irrigationType,
      plantingDate: field.plantingDate?.slice(0, 10) ?? '',
      harvestDate: field.harvestDate?.slice(0, 10) ?? '',
      assigneeId: field.assigneeId,
    })
    setFormMode('edit')
    setActiveView('fields')
  }

  function resetFieldForm(nextAssigneeId = fieldForm.assigneeId) {
    setFieldForm({
      name: '',
      cropType: '',
      location: '',
      hectares: '',
      soilType: '',
      irrigationType: '',
      plantingDate: '',
      harvestDate: '',
      assigneeId: nextAssigneeId,
    })
    setFormMode('create')
  }
  async function handleCreateField(event) {
    event.preventDefault()

    const nextFieldId = createFieldId()
    const assignedMember = getUser(fieldForm.assigneeId)
    const createdAt = new Date().toISOString()
    const newField = {
      id: nextFieldId,
      name: fieldForm.name,
      cropType: fieldForm.cropType,
      location: fieldForm.location,
      hectares: Number(fieldForm.hectares),
      soilType: fieldForm.soilType,
      irrigationType: fieldForm.irrigationType,
      plantingDate: fieldForm.plantingDate,
      harvestDate: fieldForm.harvestDate,
      stage: 'Planted',
      moisture: 56,
      ndvi: 0.6,
      completion: 12,
      assigneeId: fieldForm.assigneeId,
      status: 'Active',
      lastUpdate: createdAt,
    }

    const nextTask = {
      id: createTaskId(),
      title: `Baseline visit for ${fieldForm.name}`,
      fieldId: nextFieldId,
      ownerId: fieldForm.assigneeId,
      dueDate: fieldForm.plantingDate || new Date().toISOString().slice(0, 10),
      priority: 'High',
      status: 'Pending',
    }

    const nextActivity = {
      id: createActivityId(),
      actorId: fieldForm.assigneeId,
      fieldId: nextFieldId,
      message: `Field created and assigned to ${assignedMember?.name ?? 'team member'}.`,
      createdAt,
    }

    let persistedField = decorateField(newField)

    if (backendHealth.state === 'online') {
      try {
        persistedField = decorateField(await createBackendField(newField))
        setSaveState({
          kind: 'success',
          message: 'Field saved to MySQL and loaded back into the dashboard.',
        })
      } catch (error) {
        setSaveState({
          kind: 'error',
          message: error.message,
        })
      }
    } else {
      setSaveState({
        kind: 'warning',
        message: 'Backend is offline, so this field was saved only in the browser.',
      })
    }

    setDashboard((current) => ({
      ...current,
      fields: [persistedField, ...current.fields.filter((field) => field.id !== persistedField.id)],
      tasks: [nextTask, ...current.tasks],
      activities: [nextActivity, ...current.activities],
    }))

    handleSelectField(persistedField.id)
    setActiveView('fields')
    resetFieldForm(fieldForm.assigneeId)
  }

  async function handleSubmitField(event) {
    if (formMode === 'edit' && selectedField) {
      event.preventDefault()

      const updatedField = decorateField({
        ...selectedField,
        name: fieldForm.name,
        cropType: fieldForm.cropType,
        location: fieldForm.location,
        hectares: Number(fieldForm.hectares),
        soilType: fieldForm.soilType,
        irrigationType: fieldForm.irrigationType,
        plantingDate: fieldForm.plantingDate,
        harvestDate: fieldForm.harvestDate,
        assigneeId: fieldForm.assigneeId,
        lastUpdate: new Date().toISOString(),
      })

      let persistedField = updatedField

      if (backendHealth.state === 'online') {
        try {
        persistedField = decorateField(
          await updateBackendField(selectedField.id, updatedField),
        )
          setSaveState({
            kind: 'success',
            message: 'Field changes saved to MySQL.',
          })
        } catch (error) {
          setSaveState({
            kind: 'error',
            message: error.message,
          })
          return
        }
      } else {
        setSaveState({
          kind: 'warning',
          message: 'Backend is offline, so edits were saved only in the browser.',
        })
      }

      setDashboard((current) => ({
        ...current,
        fields: current.fields.map((field) =>
        field.id === selectedField.id ? decorateField(persistedField) : decorateField(field),
        ),
        activities: [
          {
            id: createActivityId(),
            actorId: persistedField.assigneeId,
            fieldId: persistedField.id,
            message: `Updated field record for ${persistedField.name}.`,
            createdAt: new Date().toISOString(),
          },
          ...current.activities,
        ],
      }))

      handleSelectField(persistedField.id)
      resetFieldForm(persistedField.assigneeId)
      return
    }

    await handleCreateField(event)
  }

  async function handleDeleteField() {
    if (!selectedField) {
      return
    }

    if (!window.confirm(`Delete ${selectedField.name}?`)) {
      return
    }

    if (backendHealth.state === 'online') {
      try {
        await deleteBackendField(selectedField.id)
        setSaveState({
          kind: 'success',
          message: 'Field deleted from MySQL.',
        })
      } catch (error) {
        setSaveState({
          kind: 'error',
          message: error.message,
        })
        return
      }
    } else {
      setSaveState({
        kind: 'warning',
        message: 'Backend is offline, so deletion only affected browser data.',
      })
    }

    setDashboard((current) => {
      const remainingFields = current.fields.filter((field) => field.id !== selectedField.id)
      return {
        ...current,
        fields: remainingFields,
        tasks: current.tasks.filter((task) => task.fieldId !== selectedField.id),
        alerts: current.alerts.filter((alert) => alert.fieldId !== selectedField.id),
        activities: current.activities.filter((activity) => activity.fieldId !== selectedField.id),
      }
    })

    const nextSelectedField = dashboard.fields.find((field) => field.id !== selectedField.id)
    handleSelectField(nextSelectedField?.id ?? '')
    resetFieldForm()
  }

  function handleTaskStatusChange(taskId) {
    setDashboard((current) => {
      const nextTasks = current.tasks.map((task) => {
        if (task.id !== taskId) {
          return task
        }

        const nextStatus =
          task.status === 'Pending'
            ? 'In progress'
            : task.status === 'In progress'
              ? 'Done'
              : 'Pending'

        return { ...task, status: nextStatus }
      })

      const changedTask = nextTasks.find((task) => task.id === taskId)

      const nextActivities = changedTask
        ? [
            {
              id: createActivityId(),
              actorId: changedTask.ownerId,
              fieldId: changedTask.fieldId,
              message: `Task updated to ${changedTask.status.toLowerCase()}: ${changedTask.title}.`,
              createdAt: new Date().toISOString(),
            },
            ...current.activities,
          ]
        : current.activities

      return {
        ...current,
        tasks: nextTasks,
        activities: nextActivities,
      }
    })
  }

  function handleFieldPulse(fieldId) {
    setDashboard((current) => ({
      ...current,
      fields: current.fields.map((field) => {
        if (field.id !== fieldId) {
          return decorateField(field)
        }

        const nextMoisture = Math.max(25, Math.min(90, field.moisture + 6))
        return decorateField({
          ...field,
          moisture: nextMoisture,
          completion: Math.min(100, field.completion + 4),
          lastUpdate: new Date().toISOString(),
        })
      }),
      activities: [
        {
          id: createActivityId(),
          actorId: selectedField?.assigneeId ?? 'u-002',
          fieldId,
          message: 'Logged a quick field pulse with fresh moisture readings.',
          createdAt: new Date().toISOString(),
        },
        ...current.activities,
      ],
    }))
  }

  async function handleSubmitAgentUpdate(event) {
    event.preventDefault()

    if (!selectedField || !activeAgent) {
      return
    }

    const createdAt = new Date().toISOString()
    const nextUpdate = {
      id: createUpdateId(),
      fieldId: selectedField.id,
      agentId: activeAgent.id,
      stage: agentUpdateForm.stage,
      note: agentUpdateForm.note,
      createdAt,
    }

    let persistedUpdate = nextUpdate
    let persistedField = decorateField({
      ...selectedField,
      stage: agentUpdateForm.stage,
      lastUpdate: createdAt,
    })

    if (backendHealth.state === 'online') {
      try {
        const payload = await createBackendFieldUpdate(selectedField.id, {
          agentId: activeAgent.id,
          stage: agentUpdateForm.stage,
          note: agentUpdateForm.note,
          createdAt,
        })
        persistedUpdate = payload.update
        persistedField = decorateField(payload.field)
        setSaveState({
          kind: 'success',
          message: 'Field stage and observation saved successfully.',
        })
      } catch (error) {
        setSaveState({
          kind: 'error',
          message: error.message,
        })
        return
      }
    } else {
      setSaveState({
        kind: 'warning',
        message: 'Backend is offline, so the field update was saved only in the browser.',
      })
    }

    setDashboard((current) => ({
      ...current,
      fields: current.fields.map((field) =>
        field.id === selectedField.id ? persistedField : field,
      ),
      fieldUpdates: [persistedUpdate, ...current.fieldUpdates],
      activities: [
        {
          id: createActivityId(),
          actorId: activeAgent.id,
          fieldId: selectedField.id,
          message: `Updated ${selectedField.name} to ${agentUpdateForm.stage.toLowerCase()} and added an observation.`,
          createdAt,
        },
        ...current.activities,
      ],
    }))

    handleSelectField(selectedField.id)
    resetAgentUpdateForm(agentUpdateForm.stage)
  }

  function handleExportJson() {
    downloadTextFile(
      'smartseason-dashboard.json',
      JSON.stringify(dashboard, null, 2),
      'application/json',
    )
  }

  function handleExportCsv() {
    const rows = [
      [
        'Field',
        'Crop',
        'Location',
        'Hectares',
        'Stage',
        'Risk',
        'Completion',
        'Assignee',
      ],
      ...dashboard.fields.map((field) => [
        field.name,
        field.cropType,
        field.location,
        field.hectares,
        field.stage,
        field.status,
        `${field.completion}%`,
        getUser(field.assigneeId)?.name ?? 'Unassigned',
      ]),
    ]

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
          .join(','),
      )
      .join('\n')

    downloadTextFile('smartseason-fields.csv', csv, 'text/csv;charset=utf-8')
  }

  function handleResetDemo() {
    setDashboard(structuredClone(SEED_DATA))
    handleSelectField('fld-102')
  }

  return (
    <div className="dashboard-shell">
      <aside className={`sidebar ${drawerOpen ? 'open' : ''}`}>
        <div className="brand-block">
          <p className="eyebrow">SmartSeason</p>
          <h1>Field Monitoring Hub</h1>
          <p className="sidebar-copy">
            Live crop oversight, team coordination, and reporting in one operating
            view.
          </p>
        </div>

        <nav className="nav-list" aria-label="Dashboard sections">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activeView === item.id ? 'nav-item active' : 'nav-item'}
              onClick={() => {
                startTransition(() => setActiveView(item.id))
                setDrawerOpen(false)
              }}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-panel">
          <span className={`status-dot ${backendHealth.state}`} />
          <div>
            <strong>{backendHealth.label}</strong>
            <p>Using {API_BASE_URL} when backend endpoints are available.</p>
          </div>
        </div>

        <div className="sidebar-panel weather-card">
          <p className="mini-label">Weather brief</p>
          <strong>{dashboard.weather.condition}</strong>
          <p>{dashboard.weather.advisory}</p>
          <div className="weather-grid">
            <span>Rain {dashboard.weather.rainfallChance}%</span>
            <span>Humidity {dashboard.weather.humidity}%</span>
            <span>Wind {dashboard.weather.wind}</span>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <button
            type="button"
            className="menu-button"
            onClick={() => setDrawerOpen((open) => !open)}
          >
            Menu
          </button>

          <div>
            <p className="eyebrow">Crop season dashboard</p>
            <h2>Operations snapshot for {formatDate(new Date())}</h2>
            <p className="topbar-subtitle">{scopeLabel}. {scopeDescription}</p>
          </div>

          <div className="topbar-actions">
            <label className="pill-input">
              <span>View</span>
              <select
                value={roleView}
                onChange={(event) => {
                  const nextRole = event.target.value
                  setRoleView(nextRole)

                  if (nextRole === 'Field agent') {
                    const nextAgentId = activeAgent?.id ?? fieldAgents[0]?.id
                    const nextField = dashboard.fields.find(
                      (field) => field.assigneeId === nextAgentId,
                    )
                    handleSelectField(nextField?.id ?? '')
                    return
                  }

                  handleSelectField(dashboard.fields[0]?.id ?? '')
                }}
              >
                <option>Admin</option>
                <option>Field agent</option>
                <option>Supervisor</option>
              </select>
            </label>
            {roleView === 'Field agent' && (
              <label className="pill-input">
                <span>Agent</span>
                <select
                  value={activeAgent?.id ?? ''}
                  onChange={(event) => {
                    const nextAgentId = event.target.value
                    setActiveAgentId(nextAgentId)
                    const nextField = dashboard.fields.find(
                      (field) => field.assigneeId === nextAgentId,
                    )
                    handleSelectField(nextField?.id ?? '')
                  }}
                >
                  {fieldAgents.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button type="button" className="ghost-button" onClick={handleExportJson}>
              Export JSON
            </button>
          </div>
        </header>

        <section className="hero-banner">
          <div>
            <p className="mini-label">Season health</p>
            <h3>
              {roleView === 'Field agent'
                ? `${averageCompletion}% completion across assigned fields`
                : `${averageCompletion}% campaign completion across active plots`}
            </h3>
            <p>
              {roleView === 'Field agent'
                ? `${activeAgent?.name ?? 'Selected agent'} is tracking ${scopedFields.length} assigned field${scopedFields.length === 1 ? '' : 's'}, with ${atRiskCount} currently at risk.`
                : `${atRiskCount} fields are currently at risk, while ${scopedFields.length - atRiskCount} remain active or completed.`}
            </p>
            <p className={`sync-message ${saveState.kind}`}>{saveState.message}</p>
          </div>
          <div className="hero-metrics">
            <article>
              <span>Total hectares</span>
              <strong>{monitoredHectares}</strong>
            </article>
            <article>
              <span>Pending tasks</span>
              <strong>{pendingTasks}</strong>
            </article>
            <article>
              <span>Report coverage</span>
              <strong>{reportCoverage}%</strong>
            </article>
          </div>
        </section>

        <section className="scope-strip" aria-label="Quick context">
          <article className="scope-card">
            <span className="scope-label">Current scope</span>
            <strong>{scopeLabel}</strong>
            <p>{scopeDescription}</p>
          </article>
          <article className="scope-card">
            <span className="scope-label">Next action</span>
            <strong>{nextPriorityTask?.title ?? 'No task pending'}</strong>
            <p>
              {nextPriorityTask
                ? `Due ${formatDate(nextPriorityTask.dueDate)}`
                : 'Everything in this view is currently clear.'}
            </p>
          </article>
          <article className="scope-card">
            <span className="scope-label">Latest alert</span>
            <strong>{newestAlert?.title ?? 'No active alert'}</strong>
            <p>
              {newestAlert
                ? `${getField(newestAlert.fieldId)?.name ?? 'Field'} needs review`
                : 'No open watch item in this scope right now.'}
            </p>
          </article>
        </section>

        <section className="content-grid">
          <div className="primary-column">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="mini-label">Overview</p>
                  <h3>Performance indicators</h3>
                  <p className="section-intro">
                    A quick read on coverage, work backlog, and field status before you dive into details.
                  </p>
                </div>
              </div>
              <div className="metric-grid">
                <article className="metric-card sunrise">
                  <span>{roleView === 'Field agent' ? 'Assigned fields' : 'Field coverage'}</span>
                  <strong>
                    {scopedFields.length} {roleView === 'Field agent' ? 'assigned' : 'active'} fields
                  </strong>
                  <p>
                    {roleView === 'Field agent'
                      ? 'This view is limited to fields assigned to the selected agent.'
                      : 'Every registered plot is visible with status, owner, and lifecycle data.'}
                  </p>
                </article>
                <article className="metric-card moss">
                  <span>{roleView === 'Field agent' ? 'Agent tasks' : 'Open interventions'}</span>
                  <strong>{pendingTasks} actions queued</strong>
                  <p>
                    {roleView === 'Field agent'
                      ? 'Pending work is scoped to the selected agent and their assigned fields.'
                      : 'Priority tasks are sequenced by due date and owner.'}
                  </p>
                </article>
                <article className="metric-card clay">
                  <span>{roleView === 'Field agent' ? 'At-risk fields' : 'Fields at risk'}</span>
                  <strong>{atRiskCount}</strong>
                  <p>
                    {roleView === 'Field agent'
                      ? 'Only alerts touching the selected agent’s assigned field area are shown.'
                      : 'Escalations are surfaced instantly for fast supervisor response.'}
                  </p>
                </article>
              </div>
            </section>

            {(activeView === 'overview' || activeView === 'fields') && (
              <section className="panel">
                <div className="panel-header field-toolbar">
                  <div>
                    <p className="mini-label">Registry</p>
                    <h3>{roleView === 'Field agent' ? 'Assigned fields' : 'Field portfolio'}</h3>
                    <p className="section-intro">
                      Search, filter, and select a field to review its condition or make changes.
                    </p>
                  </div>
                  <div className="toolbar-controls">
                    <input
                      type="search"
                      className="search-input"
                      placeholder="Search field, crop, stage, location"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                    />
                    <select
                      value={fieldStatusFilter}
                      onChange={(event) => setFieldStatusFilter(event.target.value)}
                    >
                      <option>All</option>
                      <option>Active</option>
                      <option>At Risk</option>
                      <option>Completed</option>
                    </select>
                  </div>
                </div>

                <div className="field-table">
                  <div className="table-head">
                    <span>Field</span>
                    <span>Status</span>
                    <span>Stage</span>
                    <span>Owner</span>
                    <span>Updated</span>
                  </div>
                  {visibleFields.map((field) => {
                    const assignee = getUser(field.assigneeId)
                    return (
                      <button
                        key={field.id}
                        type="button"
                        className={
                          selectedField?.id === field.id
                            ? 'table-row selected'
                            : 'table-row'
                        }
                        onClick={() => handleSelectField(field.id)}
                      >
                        <span>
                          <strong>{field.name}</strong>
                          <small>
                            {field.cropType} • {field.location} • {field.hectares} ha
                          </small>
                        </span>
                        <span>
                          <mark className={`tag ${statusClassName(field.status)}`}>
                            {field.status}
                          </mark>
                          <small>Moisture {field.moisture}%</small>
                        </span>
                        <span>{field.stage}</span>
                        <span>{assignee?.name ?? 'Unassigned'}</span>
                        <span>{formatDateTime(field.lastUpdate)}</span>
                      </button>
                    )
                  })}
                  {visibleFields.length === 0 && (
                    <div className="empty-state">
                      No fields match this role and filter combination yet.
                    </div>
                  )}
                </div>
              </section>
            )}

            {(activeView === 'overview' || activeView === 'operations') && (
              <section className="panel">
                <div className="panel-header">
                  <div>
                    <p className="mini-label">Operations</p>
                    <h3>{roleView === 'Field agent' ? 'Assigned work queue' : 'Work queue'}</h3>
                    <p className="section-intro">
                      Tasks are ordered by due date so the most urgent work stays visible.
                    </p>
                  </div>
                  <button type="button" className="ghost-button" onClick={handleExportCsv}>
                    Export CSV
                  </button>
                </div>
                <div className="task-list">
                  {sortedTasks.map((task) => {
                    const field = getField(task.fieldId)
                    const owner = getUser(task.ownerId)
                    return (
                      <article key={task.id} className="task-card">
                        <div>
                          <p className="task-title">{task.title}</p>
                          <p className="task-meta">
                            {field?.name} • {owner?.name} • Due {formatDate(task.dueDate)}
                          </p>
                        </div>
                        <div className="task-actions">
                          <span className={`tag priority-${task.priority.toLowerCase()}`}>
                            {task.priority}
                          </span>
                          <button
                            type="button"
                            className="ghost-button"
                            onClick={() => handleTaskStatusChange(task.id)}
                          >
                            {task.status}
                          </button>
                        </div>
                      </article>
                    )
                  })}
                  {sortedTasks.length === 0 && (
                    <div className="empty-state">No tasks are assigned in this view right now.</div>
                  )}
                </div>
              </section>
            )}

            {(activeView === 'overview' || activeView === 'reports') && (
              <section className="panel">
                <div className="panel-header">
                  <div>
                    <p className="mini-label">Reports</p>
                    <h3>Executive rollup</h3>
                    <p className="section-intro">
                      High-level reporting for handoff conversations, reviews, and planning.
                    </p>
                  </div>
                </div>
                <div className="report-grid">
                  <article className="report-card">
                    <span>Completion trend</span>
                    <strong>{averageCompletion}%</strong>
                    <p>
                      {roleView === 'Field agent'
                        ? 'Average progress across the selected agent’s assigned fields.'
                        : 'Average field progress against the current cropping plan.'}
                    </p>
                  </article>
                  <article className="report-card">
                    <span>Incident load</span>
                    <strong>{sortedAlerts.length} alerts</strong>
                    <p>
                      {roleView === 'Field agent'
                        ? 'This report only counts incidents on assigned fields.'
                        : 'Alerts remain concentrated on irrigation timing and disease pressure.'}
                    </p>
                  </article>
                  <article className="report-card">
                    <span>{roleView === 'Field agent' ? 'My updates' : 'Team responsiveness'}</span>
                    <strong>{sortedActivities.length} recent logs</strong>
                    <p>
                      {roleView === 'Field agent'
                        ? 'Recent field updates created by the selected agent.'
                        : 'Field agents are actively updating records and intervention tasks.'}
                    </p>
                  </article>
                </div>
              </section>
            )}
          </div>

          <div className="secondary-column">
            <section className="panel detail-panel">
              <div className="panel-header">
                <div>
                  <p className="mini-label">
                    {roleView === 'Field agent' ? 'Assigned field' : 'Selected field'}
                  </p>
                  <h3>{selectedField?.name ?? 'No field selected'}</h3>
                  <p className="section-intro">
                    {selectedField
                      ? 'Use this panel to inspect the field quickly and take the next action.'
                      : 'Choose a field from the list to inspect its current status.'}
                  </p>
                </div>
                {selectedField && (
                  <div className="detail-actions">
                    {roleView !== 'Field agent' && (
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => populateFieldForm(selectedField)}
                      >
                        Edit field
                      </button>
                    )}
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => handleFieldPulse(selectedField.id)}
                    >
                      Log pulse
                    </button>
                    {roleView !== 'Field agent' && (
                      <button
                        type="button"
                        className="danger-button"
                        onClick={handleDeleteField}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>

              {selectedField && (
                <>
                  <div className="detail-hero">
                    <div>
                      <mark className={`tag ${statusClassName(selectedField.status)}`}>
                        {selectedField.status}
                      </mark>
                      <p className="detail-location">
                        {selectedField.cropType} • {selectedField.location}
                      </p>
                    </div>
                    <strong>{selectedField.completion}%</strong>
                  </div>

                  <div className="detail-stats">
                    <article>
                      <span>Moisture</span>
                      <strong>{selectedField.moisture}%</strong>
                    </article>
                    <article>
                      <span>NDVI</span>
                      <strong>{selectedField.ndvi}</strong>
                    </article>
                    <article>
                      <span>Harvest target</span>
                      <strong>{formatDate(selectedField.harvestDate)}</strong>
                    </article>
                  </div>

                  <div className="timeline">
                    <div>
                      <span>Planting</span>
                      <strong>{formatDate(selectedField.plantingDate)}</strong>
                    </div>
                    <div>
                      <span>Lifecycle stage</span>
                      <strong>{selectedField.stage}</strong>
                    </div>
                    <div>
                      <span>Owner</span>
                      <strong>{getUser(selectedField.assigneeId)?.name ?? 'Unassigned'}</strong>
                    </div>
                  </div>

                  {roleView === 'Field agent' && (
                    <form className="agent-update-form" onSubmit={handleSubmitAgentUpdate}>
                      <div className="agent-update-head">
                        <div>
                          <p className="mini-label">Field update</p>
                          <h3>Update stage and observation</h3>
                        </div>
                      </div>
                      <label>
                        <span>Current stage</span>
                        <select
                          value={agentUpdateForm.stage}
                          onChange={(event) =>
                            setAgentUpdateForm((current) => ({
                              ...current,
                              stage: event.target.value,
                            }))
                          }
                        >
                          <option value="Planted">Planted</option>
                          <option value="Growing">Growing</option>
                          <option value="Ready">Ready</option>
                          <option value="Harvested">Harvested</option>
                        </select>
                      </label>
                      <label>
                        <span>Observation note</span>
                        <textarea
                          required
                          rows="4"
                          placeholder="Add your field observation, issue, or recommendation."
                          value={agentUpdateForm.note}
                          onChange={(event) =>
                            setAgentUpdateForm((current) => ({
                              ...current,
                              note: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <button type="submit" className="submit-button">
                        Save field update
                      </button>
                    </form>
                  )}
                </>
              )}
              {!selectedField && (
                <div className="empty-state">
                  No field is available in this view yet. Try changing the role, agent, or filters.
                </div>
              )}
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="mini-label">Alerts</p>
                  <h3>Priority watchlist</h3>
                  <p className="section-intro">
                    Items here need review first because they can affect crop performance or timing.
                  </p>
                </div>
              </div>
              <div className="stack-list">
                {sortedAlerts.map((alert) => (
                  <article key={alert.id} className="stack-card">
                    <div className="stack-header">
                      <strong>{alert.title}</strong>
                      <mark className={`tag ${alert.severity.toLowerCase()}`}>
                        {alert.severity}
                      </mark>
                    </div>
                    <p>{alert.detail}</p>
                    <small>
                      {getField(alert.fieldId)?.name} • {formatDateTime(alert.createdAt)}
                    </small>
                  </article>
                ))}
                {sortedAlerts.length === 0 && (
                  <div className="empty-state">No alerts are open in this view right now.</div>
                )}
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="mini-label">
                    {roleView === 'Field agent' ? 'My update history' : 'Agent monitoring'}
                  </p>
                  <h3>
                    {roleView === 'Field agent' ? 'Recent field updates' : 'Updates across agents'}
                  </h3>
                  <p className="section-intro">
                    {roleView === 'Field agent'
                      ? 'Your latest stage changes and observations appear here in time order.'
                      : 'Track stage changes and notes submitted by field agents across all fields.'}
                  </p>
                </div>
              </div>
              <div className="stack-list">
                {sortedFieldUpdates.slice(0, 6).map((update) => (
                  <article key={update.id} className="stack-card">
                    <div className="stack-header">
                      <strong>{getUser(update.agentId)?.name ?? update.agentName ?? 'Agent'}</strong>
                      <small>{formatDateTime(update.createdAt)}</small>
                    </div>
                    <p>{update.note}</p>
                    <small>
                      {(getField(update.fieldId)?.name ?? update.fieldName ?? 'Field')} • Stage:{' '}
                      {update.stage}
                    </small>
                  </article>
                ))}
                {sortedFieldUpdates.length === 0 && (
                  <div className="empty-state">
                    No field updates have been submitted in this view yet.
                  </div>
                )}
              </div>
            </section>

            {roleView !== 'Field agent' && (
              <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="mini-label">{formMode === 'edit' ? 'Edit field' : 'Add field'}</p>
                  <h3>{formMode === 'edit' ? 'Update selected plot' : 'Register a new plot'}</h3>
                  <p className="section-intro">
                    {formMode === 'edit'
                      ? 'Update the most important field details and save them back to the dashboard.'
                      : 'Fill in the basics below to add a new monitored field and create its first task.'}
                  </p>
                </div>
                <div className="detail-actions">
                  {formMode === 'edit' && (
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => resetFieldForm(selectedField?.assigneeId ?? 'u-002')}
                    >
                      Cancel edit
                    </button>
                  )}
                  <button type="button" className="ghost-button" onClick={handleResetDemo}>
                    Reset demo
                  </button>
                </div>
              </div>

              <form className="field-form" onSubmit={handleSubmitField}>
                <label>
                  <span>Field name</span>
                  <input
                    required
                    placeholder="e.g. South Ridge Plot 3"
                    value={fieldForm.name}
                    onChange={(event) =>
                      setFieldForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Crop type</span>
                  <input
                    required
                    placeholder="e.g. Maize"
                    value={fieldForm.cropType}
                    onChange={(event) =>
                      setFieldForm((current) => ({
                        ...current,
                        cropType: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Location</span>
                  <input
                    required
                    placeholder="County or farm location"
                    value={fieldForm.location}
                    onChange={(event) =>
                      setFieldForm((current) => ({
                        ...current,
                        location: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Hectares</span>
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="0"
                    value={fieldForm.hectares}
                    onChange={(event) =>
                      setFieldForm((current) => ({
                        ...current,
                        hectares: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Soil type</span>
                  <input
                    required
                    placeholder="e.g. Sandy loam"
                    value={fieldForm.soilType}
                    onChange={(event) =>
                      setFieldForm((current) => ({
                        ...current,
                        soilType: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Irrigation</span>
                  <input
                    required
                    placeholder="e.g. Drip"
                    value={fieldForm.irrigationType}
                    onChange={(event) =>
                      setFieldForm((current) => ({
                        ...current,
                        irrigationType: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Planting date</span>
                  <input
                    required
                    type="date"
                    value={fieldForm.plantingDate}
                    onChange={(event) =>
                      setFieldForm((current) => ({
                        ...current,
                        plantingDate: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Harvest date</span>
                  <input
                    required
                    type="date"
                    value={fieldForm.harvestDate}
                    onChange={(event) =>
                      setFieldForm((current) => ({
                        ...current,
                        harvestDate: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="full-span">
                  <span>Assigned lead</span>
                  <select
                    value={fieldForm.assigneeId}
                    onChange={(event) =>
                      setFieldForm((current) => ({
                        ...current,
                        assigneeId: event.target.value,
                      }))
                    }
                  >
                    {dashboard.team.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} • {member.role}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="form-tip full-span">
                  Tip: choose the field agent responsible for the first visit so the dashboard stays organized from the start.
                </p>

                <button type="submit" className="submit-button full-span">
                  {formMode === 'edit' ? 'Save changes' : 'Create field and first task'}
                </button>
              </form>
              </section>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
