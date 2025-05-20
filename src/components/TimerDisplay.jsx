const TimerDisplay = ({left, fase}) => {

    const format = (ms) => {
        if(ms === null) return " ";
        const totalSec = Math.floor(ms / 1000)
        const minutes = Math.floor(totalSec / 60)
        const seconds = totalSec % 60
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
      }

    return (
        <div>
        <h2>{format(left)}</h2>
        <span>{fase === 'focus' ? 'Focus' : 'Pausa'}</span>
        </div>
    )
}

export default TimerDisplay