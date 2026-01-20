// 本地存储键名
const STATIONS_KEY = 'charging_stations'

// 获取本地存储的充电站
export const getLocalStations = () => {
  try {
    const stationsJson = localStorage.getItem(STATIONS_KEY)
    return stationsJson ? JSON.parse(stationsJson) : []
  } catch (error) {
    console.error('获取本地充电站数据失败:', error)
    return []
  }
}

// 保存充电站到本地存储
export const saveLocalStation = (station) => {
  try {
    const stations = getLocalStations()
    // 检查是否已存在相同ID的充电站
    const existingIndex = stations.findIndex(s => s.id === station.id)
    
    if (existingIndex >= 0) {
      // 更新现有充电站
      stations[existingIndex] = station
    } else {
      // 添加新充电站
      stations.push(station)
    }
    
    localStorage.setItem(STATIONS_KEY, JSON.stringify(stations))
    return true
  } catch (error) {
    console.error('保存充电站数据失败:', error)
    return false
  }
}

// 删除本地存储的充电站
export const deleteLocalStation = (stationId) => {
  try {
    const stations = getLocalStations()
    const filteredStations = stations.filter(s => s.id !== stationId)
    localStorage.setItem(STATIONS_KEY, JSON.stringify(filteredStations))
    return true
  } catch (error) {
    console.error('删除充电站数据失败:', error)
    return false
  }
}

// 清空本地存储的充电站
export const clearLocalStations = () => {
  try {
    localStorage.removeItem(STATIONS_KEY)
    return true
  } catch (error) {
    console.error('清空充电站数据失败:', error)
    return false
  }
}