import './Loading.scss'

const Loading = () => (
  <div className="loading-container">
    <div className="spin-container">
      <img src="/loading-skull.svg" alt="" />
    </div>
    <span>Loading...</span>
  </div>
)

export default Loading
