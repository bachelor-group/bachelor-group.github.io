import React from 'react'

interface LineChartProps {
    Width: number
    Height: number
}

export const LineChart = ({Width, Height}: LineChartProps) => {
    return (
        <div>
            <svg className="plot"></svg>
            <h1> WORK IN PROGRESS</h1>
        </div>
    );
}


export default LineChart;