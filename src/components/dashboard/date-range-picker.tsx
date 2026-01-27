"use client"

import * as React from "react"

interface DateRangePickerProps {
    onDateRangeChange?: (startDate: Date | null, endDate: Date | null) => void
}

export function DateRangePicker({ onDateRangeChange }: DateRangePickerProps) {
    const [selectedRange, setSelectedRange] = React.useState<string>("all")
    const [isOpen, setIsOpen] = React.useState(false)
    const [showCustomCalendar, setShowCustomCalendar] = React.useState(false)
    const [customStartDate, setCustomStartDate] = React.useState<string>("")
    const [customEndDate, setCustomEndDate] = React.useState<string>("")
    const dropdownRef = React.useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                setShowCustomCalendar(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const options = [
        { value: "all", label: "Todos os Períodos" },
        { value: "today", label: "Hoje" },
        { value: "thisWeek", label: "Esta semana" },
        { value: "lastWeek", label: "Semana passada" },
        { value: "thisMonth", label: "Este mês" },
        { value: "lastMonth", label: "Mês passado" },
        { value: "last7days", label: "Últimos 7 dias" },
        { value: "last30days", label: "Últimos 30 dias" },
        { value: "last90days", label: "Últimos 90 dias" },
        { value: "custom", label: "Personalizado" },
    ]

    const handleRangeChange = (range: string) => {
        if (range === "custom") {
            setShowCustomCalendar(true)
            setSelectedRange(range)
            return
        }

        setSelectedRange(range)
        setIsOpen(false)
        setShowCustomCalendar(false)

        const now = new Date()
        let startDate: Date | null = null
        let endDate: Date | null = null

        switch (range) {
            case "today":
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                endDate = now
                break
            case "thisWeek":
                const dayOfWeek = now.getDay()
                const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
                startDate = new Date(now.getTime() - diff * 24 * 60 * 60 * 1000)
                startDate.setHours(0, 0, 0, 0)
                endDate = now
                break
            case "lastWeek":
                const lastWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                const lastWeekDay = lastWeekStart.getDay()
                const lastWeekDiff = lastWeekDay === 0 ? 6 : lastWeekDay - 1
                startDate = new Date(lastWeekStart.getTime() - lastWeekDiff * 24 * 60 * 60 * 1000)
                startDate.setHours(0, 0, 0, 0)
                endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000)
                endDate.setHours(23, 59, 59, 999)
                break
            case "last7days":
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                endDate = now
                break
            case "last30days":
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                endDate = now
                break
            case "last90days":
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
                endDate = now
                break
            case "thisMonth":
                startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                endDate = now
                break
            case "lastMonth":
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
                endDate = new Date(now.getFullYear(), now.getMonth(), 0)
                break
            case "all":
            default:
                startDate = null
                endDate = null
                break
        }

        if (onDateRangeChange) {
            onDateRangeChange(startDate, endDate)
        }
    }

    const handleCustomDateApply = () => {
        if (customStartDate && customEndDate) {
            const startDate = new Date(customStartDate)
            const endDate = new Date(customEndDate)
            endDate.setHours(23, 59, 59, 999)

            if (onDateRangeChange) {
                onDateRangeChange(startDate, endDate)
            }

            setIsOpen(false)
            setShowCustomCalendar(false)
        }
    }

    const selectedLabel = options.find(opt => opt.value === selectedRange)?.label || "Selecione"

    return (
        <div className="date-picker-container" ref={dropdownRef}>
            <button
                className="date-picker-button"
                onClick={() => setIsOpen(!isOpen)}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                {selectedLabel}
            </button>

            {isOpen && !showCustomCalendar && (
                <div className="date-picker-dropdown">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`date-picker-option ${selectedRange === option.value ? 'active' : ''}`}
                            onClick={() => handleRangeChange(option.value)}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}

            {isOpen && showCustomCalendar && (
                <div className="date-picker-dropdown" style={{ minWidth: '300px' }}>
                    <div style={{ padding: '1rem' }}>
                        <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>
                            Selecione o Período
                        </h4>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                                Data Inicial
                            </label>
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="input"
                                style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                                Data Final
                            </label>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="input"
                                style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => {
                                    setShowCustomCalendar(false)
                                    setSelectedRange("all")
                                }}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem',
                                    background: 'var(--surface-hover)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    color: 'var(--text-main)',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCustomDateApply}
                                disabled={!customStartDate || !customEndDate}
                                className="btn-primary"
                                style={{
                                    flex: 1,
                                    padding: '0.5rem',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    opacity: (!customStartDate || !customEndDate) ? 0.5 : 1,
                                    cursor: (!customStartDate || !customEndDate) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Aplicar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
