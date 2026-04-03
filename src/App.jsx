import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'interactive-calculator-saved'

const modes = [
  { id: 'site', title: 'Сайт под ключ', accent: 'from-violet', base: 45000 },
  { id: 'delivery', title: 'Доставка груза', accent: 'from-cyan', base: 1200 },
  { id: 'repair', title: 'Ремонт помещения', accent: 'from-pink', base: 8000 },
]

function readSavedQuotes() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function getCalculation(mode, values) {
  if (mode === 'site') {
    const design = values.pages * 4200
    const integrations = values.complexity * 12000
    const deadlineBoost = values.urgent ? 18000 : 0
    return {
      total: 45000 + design + integrations + deadlineBoost,
      description: `${values.pages} страниц, ${values.complexity} интеграций, ${values.urgent ? 'срочный запуск' : 'стандартный срок'}`,
    }
  }

  if (mode === 'delivery') {
    const routeCost = values.distance * 38
    const weightCost = values.weight * 120
    const expressCost = values.urgent ? 1600 : 0
    return {
      total: 1200 + routeCost + weightCost + expressCost,
      description: `${values.distance} км, ${values.weight} кг, ${values.urgent ? 'экспресс' : 'стандарт'}`,
    }
  }

  const squareCost = values.area * 1450
  const materialsCost = values.complexity * 9000
  const priorityCost = values.urgent ? 12000 : 0
  return {
    total: 8000 + squareCost + materialsCost + priorityCost,
    description: `${values.area} м², уровень сложности ${values.complexity}, ${values.urgent ? 'приоритетный выезд' : 'обычный график'}`,
  }
}

function sendRequest(payload) {
  console.log('[Analytics] lead_submit', payload)
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve({ success: true, id: `REQ-${Date.now().toString().slice(-5)}` })
    }, 900)
  })
}

export default function App() {
  const [mode, setMode] = useState('site')
  const [values, setValues] = useState({
    pages: 6,
    complexity: 2,
    urgent: true,
    distance: 120,
    weight: 8,
    area: 32,
  })
  const [savedQuotes, setSavedQuotes] = useState(readSavedQuotes)
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' })
  const [formError, setFormError] = useState('')
  const [requestStatus, setRequestStatus] = useState('')

  const activeMode = useMemo(
    () => modes.find((item) => item.id === mode) || modes[0],
    [mode],
  )

  const result = useMemo(() => getCalculation(mode, values), [mode, values])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedQuotes))
  }, [savedQuotes])

  const saveQuote = () => {
    setSavedQuotes((current) => [
      {
        id: Date.now(),
        title: activeMode.title,
        total: result.total,
        description: result.description,
      },
      ...current,
    ].slice(0, 6))
  }

  const validateForm = () => {
    if (formData.name.trim().length < 2) {
      return 'Укажи имя — минимум 2 символа.'
    }
    if (!/^\+?\d[\d\s()-]{8,}$/.test(formData.phone.trim())) {
      return 'Телефон выглядит некорректно.'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return 'Email нужно ввести в корректном формате.'
    }
    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const error = validateForm()
    if (error) {
      setFormError(error)
      return
    }

    setFormError('')
    setRequestStatus('Отправляем заявку...')
    const response = await sendRequest({ ...formData, service: activeMode.title, quote: result.total })
    setRequestStatus(`Заявка ${response.id} отправлена. Я свяжусь с тобой в ближайшее время.`)
    setFormData({ name: '', phone: '', email: '' })
  }

  return (
    <div className="calculator-shell">
      <header className="hero-block">
        <p className="eyebrow">Interactive calculator</p>
        <h1>Калькулятор стоимости услуг с real-time расчётом и формой заявки</h1>
        <p className="hero-text">
          Три сценария расчёта, сохранение результатов, анимация итоговой суммы и
          имитация отправки заявки на backend.
        </p>
      </header>

      <main className="workspace-grid">
        <section className="panel">
          <div className="mode-switch">
            {modes.map((item) => (
              <button
                type="button"
                key={item.id}
                className={item.id === mode ? `mode-btn active ${item.accent}` : 'mode-btn'}
                onClick={() => setMode(item.id)}
              >
                {item.title}
              </button>
            ))}
          </div>

          <div className="controls-grid">
            {mode === 'site' && (
              <>
                <RangeControl
                  label="Количество страниц"
                  value={values.pages}
                  min={1}
                  max={20}
                  step={1}
                  unit="стр."
                  onChange={(value) => setValues((prev) => ({ ...prev, pages: value }))}
                />
                <RangeControl
                  label="Интеграции / сложность"
                  value={values.complexity}
                  min={1}
                  max={5}
                  step={1}
                  unit="ур."
                  onChange={(value) => setValues((prev) => ({ ...prev, complexity: value }))}
                />
              </>
            )}

            {mode === 'delivery' && (
              <>
                <RangeControl
                  label="Расстояние"
                  value={values.distance}
                  min={10}
                  max={1200}
                  step={10}
                  unit="км"
                  onChange={(value) => setValues((prev) => ({ ...prev, distance: value }))}
                />
                <RangeControl
                  label="Вес груза"
                  value={values.weight}
                  min={1}
                  max={80}
                  step={1}
                  unit="кг"
                  onChange={(value) => setValues((prev) => ({ ...prev, weight: value }))}
                />
              </>
            )}

            {mode === 'repair' && (
              <>
                <RangeControl
                  label="Площадь объекта"
                  value={values.area}
                  min={8}
                  max={180}
                  step={2}
                  unit="м²"
                  onChange={(value) => setValues((prev) => ({ ...prev, area: value }))}
                />
                <RangeControl
                  label="Сложность ремонта"
                  value={values.complexity}
                  min={1}
                  max={5}
                  step={1}
                  unit="ур."
                  onChange={(value) => setValues((prev) => ({ ...prev, complexity: value }))}
                />
              </>
            )}

            <label className="urgent-toggle">
              <input
                type="checkbox"
                checked={values.urgent}
                onChange={(event) => setValues((prev) => ({ ...prev, urgent: event.target.checked }))}
              />
              <span>Нужен ускоренный запуск / приоритетная обработка</span>
            </label>
          </div>

          <div className="result-card" key={`${mode}-${result.total}-${values.urgent}`}>
            <p>Итоговый расчёт</p>
            <strong>{result.total.toLocaleString('ru-RU')} ₽</strong>
            <span>{result.description}</span>
            <button type="button" className="save-btn" onClick={saveQuote}>
              Сохранить расчёт
            </button>
          </div>
        </section>

        <aside className="panel">
          <h2>Форма заявки</h2>
          <form className="lead-form" onSubmit={handleSubmit}>
            <label>
              Имя
              <input
                type="text"
                value={formData.name}
                onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Мария"
              />
            </label>

            <label>
              Телефон
              <input
                type="tel"
                value={formData.phone}
                onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="+7 900 000-00-00"
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={formData.email}
                onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="mail@example.com"
              />
            </label>

            <button type="submit" className="submit-btn">
              Отправить заявку
            </button>
          </form>

          {formError && <p className="error-banner">{formError}</p>}
          {requestStatus && <p className="success-banner">{requestStatus}</p>}

          <div className="saved-list">
            <div className="saved-head">
              <h2>Сохранённые расчёты</h2>
              <span>{savedQuotes.length}</span>
            </div>

            {savedQuotes.length === 0 ? (
              <p className="empty-text">Пока нет сохранённых сценариев.</p>
            ) : (
              savedQuotes.map((quote) => (
                <article className="saved-card" key={quote.id}>
                  <div>
                    <p>{quote.title}</p>
                    <span>{quote.description}</span>
                  </div>
                  <strong>{quote.total.toLocaleString('ru-RU')} ₽</strong>
                </article>
              ))
            )}
          </div>
        </aside>
      </main>
    </div>
  )
}

function RangeControl({ label, value, min, max, step, unit, onChange }) {
  return (
    <label className="range-card">
      <div className="range-top">
        <span>{label}</span>
        <strong>{value} {unit}</strong>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}
