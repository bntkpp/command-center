import { useState } from 'react'
import { Clock, Pencil, Plus, Trash2, RotateCcw, Check } from 'lucide-react'
import { useSchedule } from '../hooks/useSchedule'
import { useSettings } from '../hooks/useSettings'
import {
  AREA_STYLES,
  SCHEDULE_AREAS,
  TASK_AREAS,
  type ScheduleArea,
  type ScheduleBlock,
  type TaskArea,
} from '../utils/constants'
import { formatDuration, hhmmToMinutes } from '../utils/timeHelpers'

function resolveAreaLabel(
  area: ScheduleArea,
  labelsByTaskArea: Record<TaskArea, string>,
  fallback: string
): string {
  if ((TASK_AREAS as readonly string[]).includes(area)) {
    return labelsByTaskArea[area as TaskArea] ?? fallback
  }
  return fallback
}

export function Schedule() {
  const {
    blocks,
    currentBlock,
    nextBlock,
    minutesToNext,
    nowMins,
    updateBlock,
    addBlock,
    removeBlock,
    resetTemplate,
  } = useSchedule()
  const [editing, setEditing] = useState(false)

  return (
    <section className="border-cc-border bg-cc-surface/80 flex flex-col gap-5 rounded-2xl border p-6 backdrop-blur md:p-7">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-cc-muted inline-flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase">
            <Clock size={12} className="text-cc-accent" />
            Bloques del día
          </span>
          <h2 className="text-cc-text mt-1 text-xl font-semibold tracking-tight md:text-2xl">
            Estructura horaria
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {editing && (
            <button
              type="button"
              onClick={resetTemplate}
              className="text-cc-muted hover:text-cc-text-soft border-cc-border hover:border-cc-border-strong inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition"
              title="Restaurar template"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition ${
              editing
                ? 'bg-cc-accent/15 text-cc-accent border-cc-accent/40'
                : 'text-cc-muted hover:text-cc-text-soft border-cc-border hover:border-cc-border-strong'
            }`}
          >
            {editing ? <Check size={12} /> : <Pencil size={12} />}
            {editing ? 'Listo' : 'Editar'}
          </button>
        </div>
      </header>

      <NowBanner
        currentBlock={currentBlock}
        nextBlock={nextBlock}
        minutesToNext={minutesToNext}
      />

      <ul className="flex flex-col">
        {blocks.map((block, i) => (
          <BlockRow
            key={block.id}
            block={block}
            isLast={i === blocks.length - 1}
            isCurrent={currentBlock?.id === block.id}
            isPast={hhmmToMinutes(block.timeEnd) <= nowMins}
            editing={editing}
            onChange={(patch) => updateBlock(block.id, patch)}
            onRemove={() => removeBlock(block.id)}
          />
        ))}
      </ul>

      {editing && (
        <button
          type="button"
          onClick={addBlock}
          className="text-cc-muted hover:text-cc-text-soft border-cc-border hover:border-cc-border-strong inline-flex items-center justify-center gap-2 rounded-lg border border-dashed py-2.5 text-sm transition"
        >
          <Plus size={14} />
          Agregar bloque
        </button>
      )}
    </section>
  )
}

function NowBanner({
  currentBlock,
  nextBlock,
  minutesToNext,
}: {
  currentBlock: ScheduleBlock | null
  nextBlock: ScheduleBlock | null
  minutesToNext: number | null
}) {
  if (!currentBlock && !nextBlock) {
    return (
      <div className="border-cc-border bg-cc-surface-2/40 rounded-xl border border-dashed px-4 py-3">
        <span className="text-cc-muted text-sm">
          Fuera del horario planificado.
        </span>
      </div>
    )
  }

  const block = currentBlock ?? nextBlock!
  const styles = AREA_STYLES[block.area]

  return (
    <div className="border-cc-border bg-cc-surface-2/60 relative overflow-hidden rounded-xl border px-4 py-3.5">
      <div
        aria-hidden
        className={`absolute top-0 left-0 h-full w-1 ${styles.stripe}`}
      />
      <div className="ml-2 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col">
          <span className="text-cc-muted font-mono text-[10px] tracking-widest uppercase">
            {currentBlock ? 'Ahora' : 'Próximo'}
          </span>
          <span className="text-cc-text mt-0.5 text-base font-medium">
            {block.label}{' '}
            <span className="text-cc-muted font-mono text-sm">
              {block.timeStart}–{block.timeEnd}
            </span>
          </span>
        </div>
        {currentBlock && nextBlock && minutesToNext !== null && (
          <span className="text-cc-text-soft font-mono text-xs tracking-wide">
            En {formatDuration(minutesToNext)} → {nextBlock.label}
          </span>
        )}
        {!currentBlock && minutesToNext !== null && (
          <span className="text-cc-text-soft font-mono text-xs tracking-wide">
            Empieza en {formatDuration(minutesToNext)}
          </span>
        )}
      </div>
    </div>
  )
}

function BlockRow({
  block,
  isLast,
  isCurrent,
  isPast,
  editing,
  onChange,
  onRemove,
}: {
  block: ScheduleBlock
  isLast: boolean
  isCurrent: boolean
  isPast: boolean
  editing: boolean
  onChange: (patch: Partial<ScheduleBlock>) => void
  onRemove: () => void
}) {
  const styles = AREA_STYLES[block.area]
  const { settings } = useSettings()
  const displayAreaLabel = resolveAreaLabel(
    block.area,
    settings.areaLabels,
    styles.label
  )
  const Icon = styles.Icon

  return (
    <li
      className={`relative flex items-stretch gap-3 ${
        isPast && !isCurrent ? 'opacity-45' : ''
      }`}
    >
      {/* Time gutter */}
      <div className="flex w-16 shrink-0 flex-col items-end pt-2 font-mono text-xs tabular-nums">
        {editing ? (
          <div className="flex flex-col items-end gap-1">
            <input
              type="time"
              value={block.timeStart}
              onChange={(e) => onChange({ timeStart: e.target.value })}
              className="bg-cc-surface-2 border-cc-border text-cc-text-soft w-[68px] rounded-md border px-1 py-0.5 text-right text-[11px] outline-none"
            />
            <input
              type="time"
              value={block.timeEnd}
              onChange={(e) => onChange({ timeEnd: e.target.value })}
              className="bg-cc-surface-2 border-cc-border text-cc-muted w-[68px] rounded-md border px-1 py-0.5 text-right text-[11px] outline-none"
            />
          </div>
        ) : (
          <>
            <span className="text-cc-text-soft">{block.timeStart}</span>
            <span className="text-cc-muted text-[10px]">{block.timeEnd}</span>
          </>
        )}
      </div>

      {/* Timeline rail */}
      <div className="relative flex w-3 shrink-0 flex-col items-center pt-3">
        <span
          className={`block h-3 w-3 rounded-full border-2 ${
            isCurrent
              ? 'border-cc-accent bg-cc-accent ring-cc-accent/30 animate-pulse ring-4'
              : 'border-cc-border-strong bg-cc-surface-2'
          }`}
        />
        {!isLast && (
          <span className="bg-cc-border absolute top-6 bottom-0 w-px" />
        )}
      </div>

      {/* Content */}
      <div
        className={`mb-2 flex-1 rounded-xl border transition ${
          isCurrent
            ? 'border-cc-accent/40 bg-cc-accent/5'
            : 'border-cc-border bg-cc-surface-2/40'
        }`}
      >
        <div className="flex items-center gap-3 px-3 py-2.5">
          <span
            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${styles.iconWrap}`}
            aria-hidden
          >
            <Icon size={14} strokeWidth={2.25} />
          </span>

          {editing ? (
            <>
              <input
                type="text"
                value={block.label}
                onChange={(e) => onChange({ label: e.target.value })}
                className="text-cc-text bg-transparent flex-1 text-sm outline-none"
              />
              <select
                value={block.area}
                onChange={(e) =>
                  onChange({ area: e.target.value as ScheduleArea })
                }
                className="bg-cc-surface-2 border-cc-border text-cc-text-soft rounded-md border px-2 py-1 text-xs outline-none"
              >
                {SCHEDULE_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={onRemove}
                className="text-cc-muted hover:text-cc-danger transition"
                title="Eliminar bloque"
              >
                <Trash2 size={14} />
              </button>
            </>
          ) : (
            <>
              <span
                className={`text-cc-text flex-1 text-sm ${
                  isCurrent ? 'font-medium' : ''
                }`}
              >
                {block.label}
              </span>
              <span
                className={`hidden shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-medium tracking-widest uppercase sm:inline-flex ${styles.chip}`}
              >
                {displayAreaLabel}
              </span>
            </>
          )}
        </div>
      </div>
    </li>
  )
}
