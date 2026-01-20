import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

const MapContainer = forwardRef(({ userLocation, stations, selectedStation, onStationClick }, ref) => {
  const mapDivRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const userMarkerRef = useRef(null)

  // 初始化地图
  useEffect(() => {
    if (!window.AMap || !mapDivRef.current || !userLocation) return

    // 创建地图实例
    const map = new window.AMap.Map(mapDivRef.current, {
      zoom: 15,
      center: [userLocation.lng, userLocation.lat],
      viewMode: '3D',
      pitch: 45,
      rotation: 0
    })

    // 添加地图控件
    map.addControl(new window.AMap.Scale())
    map.addControl(new window.AMap.ToolBar())
    map.addControl(new window.AMap.MapType())

    mapInstanceRef.current = map

    // 保存地图实例到ref
    useImperativeHandle(ref, () => ({
      getMapInstance: () => mapInstanceRef.current
    }))

    return () => {
      // 销毁地图实例
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy()
      }
    }
  }, [userLocation, ref])

  // 更新用户位置标记
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return

    // 移除旧的用户标记
    if (userMarkerRef.current) {
      mapInstanceRef.current.remove(userMarkerRef.current)
    }

    // 创建用户位置标记
    const userMarker = new window.AMap.Marker({
      position: [userLocation.lng, userLocation.lat],
      icon: new window.AMap.Icon({
        size: new window.AMap.Size(32, 32),
        image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
        imageSize: new window.AMap.Size(32, 32)
      }),
      title: '我的位置',
      offset: new window.AMap.Pixel(-16, -32)
    })

    mapInstanceRef.current.add(userMarker)
    userMarkerRef.current = userMarker
  }, [userLocation])

  // 更新充电站标记
  useEffect(() => {
    if (!mapInstanceRef.current || !stations || stations.length === 0) return

    // 移除旧的标记
    if (markersRef.current.length > 0) {
      mapInstanceRef.current.remove(markersRef.current)
      markersRef.current = []
    }

    // 创建新的标记
    const markers = stations.map(station => {
      const marker = new window.AMap.Marker({
        position: [station.lng, station.lat],
        icon: new window.AMap.Icon({
          size: new window.AMap.Size(28, 36),
          image: station.id === selectedStation?.id 
            ? 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png' 
            : 'https://webapi.amap.com/theme/v1.3/markers/n/mark_g.png',
          imageSize: new window.AMap.Size(28, 36)
        }),
        title: station.name,
        offset: new window.AMap.Pixel(-14, -36),
        extData: station
      })

      // 添加点击事件
      marker.on('click', () => {
        onStationClick(station)
      })

      return marker
    })

    mapInstanceRef.current.add(markers)
    markersRef.current = markers
  }, [stations, selectedStation, onStationClick])

  // 选中充电站时居中显示
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedStation) return

    mapInstanceRef.current.setCenter([selectedStation.lng, selectedStation.lat])
  }, [selectedStation])

  return <div ref={mapDivRef} className="map-container"></div>
})

MapContainer.displayName = 'MapContainer'

export default MapContainer