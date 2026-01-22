import { useEffect, useRef, useState } from 'react'
import MapContainer from './components/MapContainer'
import StationList from './components/StationList'
import AddStationForm from './components/AddStationForm'
import { getLocalStations, saveLocalStation } from './utils/storage'

function App() {
  const [stations, setStations] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [selectedStation, setSelectedStation] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [amapLoaded, setAmapLoaded] = useState(false)
  const [error, setError] = useState(null)
  const mapRef = useRef(null)

  // 获取用户位置
  const getUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          setIsLoading(false)
        },
        (error) => {
          console.error('获取位置失败:', error)
          // 默认位置（北京）
          const defaultLocation = { lat: 39.9042, lng: 116.4074 }
          setUserLocation(defaultLocation)
          setIsLoading(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      )
    } else {
      // 默认位置（北京）
      const defaultLocation = { lat: 39.9042, lng: 116.4074 }
      setUserLocation(defaultLocation)
      setIsLoading(false)
    }
  }

  // 检查高德地图是否加载成功
  const checkAmapLoaded = () => {
    if (window.AMap) {
      setAmapLoaded(true)
      setError(null)
    } else {
      setError('高德地图加载失败，请检查网络连接或刷新页面重试')
      setIsLoading(false)
    }
  }

  // 计算两点之间的距离（单位：km）
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371 // 地球半径（单位：km）
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c
    return distance.toFixed(2)
  }

  // 搜索附近充电站
  const searchNearbyStations = () => {
    if (!window.AMap || !userLocation) return

    // 模拟数据 - 实际项目中应使用高德地图POI搜索API
    const mockStations = [
      { id: 1, name: '国家电网充电站', address: '北京市朝阳区建国路88号', lat: 39.9052, lng: 116.4084, type: '直流快充', count: 8, price: 1.8, available: true, queue: 0, payment: ['支付宝', '微信', '银联'] },
      { id: 2, name: '特来电充电站', address: '北京市朝阳区东三环中路39号', lat: 39.9032, lng: 116.4064, type: '交流慢充', count: 12, price: 1.5, available: true, queue: 2, payment: ['支付宝', '微信'] },
      { id: 3, name: '星星充电', address: '北京市朝阳区朝阳门外大街18号', lat: 39.9102, lng: 116.4104, type: '交直流混合', count: 10, price: 1.6, available: true, queue: 1, payment: ['支付宝', '微信', '银联', '充电卡'] },
      { id: 4, name: '小鹏超级充电站', address: '北京市朝阳区建国门外大街1号', lat: 39.9022, lng: 116.4094, type: '直流快充', count: 6, price: 1.9, available: true, queue: 0, payment: ['小鹏APP', '支付宝', '微信'] },
      { id: 5, name: '蔚来换电站', address: '北京市朝阳区东四环中路62号', lat: 39.9082, lng: 116.4054, type: '换电', count: 2, price: 2.0, available: false, queue: 3, payment: ['蔚来APP', '支付宝', '微信'] }
    ]

    // 获取本地存储的充电站
    const localStations = getLocalStations()
    const allStations = [...mockStations, ...localStations]

    // 计算距离并排序
    const stationsWithDistance = allStations.map(station => ({
      ...station,
      distance: calculateDistance(userLocation.lat, userLocation.lng, station.lat, station.lng)
    })).sort((a, b) => a.distance - b.distance)

    setStations(stationsWithDistance)
  }

  // 添加新充电站
  const handleAddStation = (stationData) => {
    if (!userLocation) return

    const newStation = {
      id: Date.now(),
      ...stationData,
      lat: stationData.lat || userLocation.lat,
      lng: stationData.lng || userLocation.lng,
      distance: calculateDistance(userLocation.lat, userLocation.lng, stationData.lat || userLocation.lat, stationData.lng || userLocation.lng)
    }

    saveLocalStation(newStation)
    setStations(prev => [...prev, newStation].sort((a, b) => a.distance - b.distance))
    setShowAddForm(false)
  }

  // 导航到充电站
  const navigateToStation = (station) => {
    if (!userLocation) return

    const { lat, lng, name } = station
    const url = `https://uri.amap.com/navigation?from=${userLocation.lng},${userLocation.lat},我的位置&to=${lng},${lat},${encodeURIComponent(name)}&mode=car&policy=1&src=mypage&coordinate=gaode`
    window.open(url, '_blank')
  }

  // 初始化
  useEffect(() => {
    getUserLocation()
    // 检查高德地图是否加载成功
    const checkInterval = setInterval(() => {
      checkAmapLoaded()
    }, 500)
    
    // 5秒后停止检查
    const timeout = setTimeout(() => {
      clearInterval(checkInterval)
      if (!window.AMap) {
        setError('高德地图加载超时，请检查网络连接或刷新页面重试')
        setIsLoading(false)
      }
    }, 5000)
    
    return () => {
      clearInterval(checkInterval)
      clearTimeout(timeout)
    }
  }, [])

  // 位置变化时搜索充电站
  useEffect(() => {
    if (userLocation) {
      searchNearbyStations()
    }
  }, [userLocation])

  return (
    <div className="app-container">
      <div className="header">
        <h1>充电站导航</h1>
      </div>

      {error ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - 60px)',
          padding: '20px',
          textAlign: 'center',
          color: '#f5222d'
        }}>
          <div style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '500' }}>{error}</div>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            刷新页面
          </button>
        </div>
      ) : (
        <>
          <MapContainer
            ref={mapRef}
            userLocation={userLocation}
            stations={stations}
            selectedStation={selectedStation}
            onStationClick={setSelectedStation}
          />

          {!isLoading && (
            <>
              <StationList
                stations={stations}
                selectedStation={selectedStation}
                onStationSelect={setSelectedStation}
                onNavigate={navigateToStation}
              />

              <button 
                className="add-station-btn"
                onClick={() => setShowAddForm(true)}
                aria-label="添加充电站"
              >
                +
              </button>
            </>
          )}

          {showAddForm && (
            <AddStationForm
              onAdd={handleAddStation}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {isLoading && (
            <div className="loading">
              <div className="loading-spinner"></div>
              <span>正在加载应用...</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default App