const ProgressBar = ({ seconds, total }) => {
    const percentage = seconds !== null ? ((total - seconds) / total) * 100 : 0;
    return (
      <div style={{ width: '100%', background: '#eee', height: '10px' }}>
        <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: "red"}}/>
      </div>
    )
  }
  
  export default ProgressBar