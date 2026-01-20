import React from 'react'

const StationList = ({ stations, selectedStation, onStationSelect, onNavigate }) => {
  if (!stations || stations.length === 0) {
    return (
      <div className="control-panel">
        <h2>附近充电站</h2>
        <div className="loading">暂无充电站数据</div>
      </div>
    )
  }

  return (
    <div className="control-panel">
      <h2>附近充电站</h2>
      <div className="station-list">
        {stations.map(station => (
          <div
            key={station.id}
            className={`station-card ${selectedStation?.id === station.id ? 'selected' : ''}`}
            onClick={() => onStationSelect(station)}
          >
            <div className="station-name">{station.name}</div>
            <div className="station-info">{station.address}</div>
            <div className="station-info">
              {station.type || '未知类型'} · {station.count || '未知数量'}个充电桩
            </div>
            <div className="station-distance">
              距离: {station.distance}km
            </div>
            <div className="action-buttons">
              <button 
                className="btn btn-primary"
                onClick={(e) => {
                  e.stopPropagation()
                  onNavigate(station)
                }}
              >
                导航
              </button>
              <button 
                className="btn btn-secondary"
                onClick={(e) => {
                  e.stopPropagation()
                  // 可以添加收藏功能
                }}
              >
                收藏
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StationList