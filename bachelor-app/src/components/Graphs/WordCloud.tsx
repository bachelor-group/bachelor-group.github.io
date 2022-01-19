import React from 'react'

interface WordCloudProps {
    Width: number,
    Height: number

}

export const WordCloud = ({ Width, Height }: WordCloudProps) => {
    return (
        <div>
            <svg className="plot"></svg>
            <h1> WORK IN PROGRESS</h1>
        </div>
    );
}


export default WordCloud;