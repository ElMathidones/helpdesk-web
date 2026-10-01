import type { ReportTimelineItem } from "../types/report"

interface ReportTimelineChartProps {
    items: ReportTimelineItem[]
}

const CHART_WIDTH = 1000
const CHART_HEIGHT = 280
const PADDING_LEFT = 48
const PADDING_RIGHT = 28
const PADDING_TOP = 30
const PADDING_BOTTOM = 48

function formatChartDate(value: string) {
    const [, month, day] = value.split("-")
    return `${day}/${month}`
}

export default function ReportTimelineChart({
    items,
}: ReportTimelineChartProps) {
    if (items.length === 0) {
        return (
            <p className="reports-empty-message">
                Nenhum chamado criado no período.
            </p>
        )
    }

    const plotWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT
    const plotHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM

    const maxValue = Math.max(...items.map((item) => item.created), 1)

    const timestamps = items.map((item) => {
        const [year, month, day] = item.date.split("-").map(Number)

        return Date.UTC(year, month - 1, day)
    })

    const firstTimestamp = Math.min(...timestamps)
    const lastTimestamp = Math.max(...timestamps)
    const timeRange = lastTimestamp - firstTimestamp

    const getX = (index: number) => {
        if (items.length === 1 || timeRange === 0) {
            return PADDING_LEFT + plotWidth / 2
        }

        const position =
            (timestamps[index] - firstTimestamp) / timeRange

        return PADDING_LEFT + position * plotWidth
    }

    const getY = (value: number) =>
        PADDING_TOP + plotHeight - (value / maxValue) * plotHeight

    const points = items
        .map((item, index) => `${getX(index)},${getY(item.created)}`)
        .join(" ")

    const areaPoints = [
        `${getX(0)},${PADDING_TOP + plotHeight}`,
        points,
        `${getX(items.length - 1)},${PADDING_TOP + plotHeight}`,
    ].join(" ")

    const yTicks = Array.from(
        { length: maxValue + 1 },
        (_, index) => index,
    )

    return (
        <div className="reports-chart-wrapper">
            <svg
                className="reports-line-chart"
                viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                role="img"
                aria-label="Gráfico de chamados criados por dia"
            >
                {yTicks.map((tick) => {
                    const y = getY(tick)

                    return (
                        <g key={tick}>
                            <line
                                className="reports-chart-grid-line"
                                x1={PADDING_LEFT}
                                x2={CHART_WIDTH - PADDING_RIGHT}
                                y1={y}
                                y2={y}
                            />

                            <text
                                className="reports-chart-axis-label"
                                x={PADDING_LEFT - 14}
                                y={y + 4}
                                textAnchor="end"
                            >
                                {tick}
                            </text>
                        </g>
                    )
                })}

                <polygon
                    className="reports-chart-area"
                    points={areaPoints}
                />

                <polyline
                    className="reports-chart-line"
                    points={points}
                />

                {items.map((item, index) => {
                    const x = getX(index)
                    const y = getY(item.created)

                    return (
                        <g key={item.date}>
                            <circle
                                className="reports-chart-point"
                                cx={x}
                                cy={y}
                                r="6"
                            />

                            <text
                                className="reports-chart-value"
                                x={x}
                                y={y - 14}
                                textAnchor="middle"
                            >
                                {item.created}
                            </text>

                            <text
                                className="reports-chart-axis-label"
                                x={x}
                                y={CHART_HEIGHT - 16}
                                textAnchor="middle"
                            >
                                {formatChartDate(item.date)}
                            </text>
                        </g>
                    )
                })}
            </svg>
        </div>
    )
}
