"use client"

import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface ChartData {
  type: 'line' | 'bar' | 'doughnut'
  data: {
    labels: string[]
    datasets: Array<{
      label?: string
      data: number[]
      borderColor?: string
      backgroundColor?: string | string[]
      borderWidth?: number
      tension?: number
    }>
  }
  options: {
    responsive: boolean
    plugins: {
      title: {
        display: boolean
        text: string
      }
    }
  }
}

interface ChartRendererProps {
  chartData: ChartData
  className?: string
}

export function ChartRenderer({ chartData, className = "" }: ChartRendererProps) {
  const renderChart = () => {
    switch (chartData.type) {
      case 'line':
        return <Line data={chartData.data} options={chartData.options} />
      case 'bar':
        return <Bar data={chartData.data} options={chartData.options} />
      case 'doughnut':
        return <Doughnut data={chartData.data} options={chartData.options} />
      default:
        return <div>Unsupported chart type</div>
    }
  }

  return (
    <div className={`w-full max-w-2xl mx-auto p-4 bg-white rounded-lg border ${className}`}>
      <div className="w-full h-64">
        {renderChart()}
      </div>
    </div>
  )
}

// Helper function to extract chart data from AI response
export function extractChartData(text: string): ChartData | null {
  const chartMatch = text.match(/\[CHART:(.*?)\]/)
  if (!chartMatch) return null
  
  try {
    const chartData = JSON.parse(chartMatch[1])
    return chartData
  } catch (error) {
    console.error('Failed to parse chart data:', error)
    return null
  }
}

// Helper function to remove chart markers from text
export function removeChartMarkers(text: string): string {
  return text.replace(/\[CHART:.*?\]/g, '').trim()
}