// 全局变量
let map = null;
let userMarker = null;
let stationMarkers = [];
let currentStations = [];
let selectedStation = null;

// 工具函数 - 显示加载遮罩
function showLoading() {
    document.getElementById('loading-mask').classList.remove('hidden');
}

// 工具函数 - 隐藏加载遮罩
function hideLoading() {
    document.getElementById('loading-mask').classList.add('hidden');
}

// 工具函数 - 显示错误信息
function showError(message) {
    const stationList = document.getElementById('station-list');
    stationList.innerHTML = `<div class="error">${message}</div>`;
}

// 初始化地图
function initMap() {
    console.log('开始初始化地图');
    
    // 检查高德地图API是否加载成功
    if (typeof AMap === 'undefined') {
        console.error('高德地图API加载失败');
        showError('高德地图API加载失败，请检查网络或API Key');
        hideLoading();
        return;
    }
    
    // 创建地图实例
    map = new AMap.Map('map-container', {
        zoom: 15,
        resizeEnable: true
    });
    
    console.log('地图实例创建成功:', map);
    
    // 添加比例尺控件
    map.addControl(new AMap.Scale());
    
    // 添加缩放控件
    map.addControl(new AMap.ToolBar());
    
    // 地图加载完成事件
    map.on('complete', () => {
        console.log('地图加载完成');
        // 获取用户位置
        getCurrentLocation();
    });
    
    // 绑定搜索事件
    bindSearchEvent();
    
    // 绑定详情关闭事件
    bindDetailEvents();
}

// 获取用户当前位置
function getCurrentLocation() {
    showLoading();
    
    console.log('开始获取用户位置');
    
    // 使用HTML5 Geolocation API获取位置
    if (navigator.geolocation) {
        console.log('浏览器支持Geolocation API');
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('获取位置成功:', position);
                const { latitude, longitude } = position.coords;
                const userLocation = [longitude, latitude];
                
                // 定位到用户位置
                map.setCenter(userLocation);
                
                // 添加用户位置标记
                addUserMarker(userLocation);
                
                // 搜索附近充电站
                searchNearbyStations(userLocation);
            },
            (error) => {
                hideLoading();
                console.error('获取位置失败:', error);
                
                let errorMsg = '';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMsg = '用户拒绝了位置请求';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMsg = '位置信息不可用';
                        break;
                    case error.TIMEOUT:
                        errorMsg = '获取位置超时';
                        break;
                    default:
                        errorMsg = '获取位置时发生未知错误';
                        break;
                }
                
                console.error('位置获取错误信息:', errorMsg);
                
                // 默认使用北京位置
                const defaultLocation = [116.397428, 39.90923];
                map.setCenter(defaultLocation);
                addUserMarker(defaultLocation);
                searchNearbyStations(defaultLocation);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        hideLoading();
        console.error('浏览器不支持Geolocation API');
        // 默认使用北京位置
        const defaultLocation = [116.397428, 39.90923];
        map.setCenter(defaultLocation);
        addUserMarker(defaultLocation);
        searchNearbyStations(defaultLocation);
    }
}

// 添加用户位置标记
function addUserMarker(location) {
    if (userMarker) {
        map.remove(userMarker);
    }
    
    userMarker = new AMap.Marker({
        position: location,
        map: map,
        icon: new AMap.Icon({
            size: new AMap.Size(30, 30),
            image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
            imageSize: new AMap.Size(30, 30)
        }),
        title: '我的位置'
    });
}

// 搜索附近充电站
function searchNearbyStations(location) {
    showLoading();
    
    // 清空之前的标记
    clearStationMarkers();
    
    // 使用AMap.plugin确保PlaceSearch插件正确加载
    AMap.plugin('AMap.PlaceSearch', () => {
        console.log('开始搜索附近充电站，位置:', location);
        
        // 使用高德地图POI搜索
        const poiSearch = new AMap.PlaceSearch({
            type: '充电站', // 简化：直接使用充电站类型
            radius: 5000, // 搜索半径5公里
            pageSize: 20,
            pageIndex: 1,
            map: null // 不自动在地图上添加标记，我们自己控制
        });
        
        // 第一次搜索：使用searchNearBy
        poiSearch.searchNearBy('充电站', location, 5000, (status, result) => {
            console.log('searchNearBy搜索结果:', status, result);
            
            if (status === 'complete' && result.poiList && result.poiList.pois.length > 0) {
                // 按距离从近到远排序
                currentStations = result.poiList.pois.sort((a, b) => a.distance - b.distance);
                console.log('排序后的充电站:', currentStations);
                
                updateStationList();
                addStationMarkers(currentStations);
            } else {
                console.log('searchNearBy搜索失败或无结果，尝试使用search方法');
                
                // 第二次搜索：使用search方法作为备用
                poiSearch.search('充电站', {
                    location: location,
                    radius: 5000
                }, (status2, result2) => {
                    console.log('search方法搜索结果:', status2, result2);
                    
                    if (status2 === 'complete' && result2.poiList && result2.poiList.pois.length > 0) {
                        // 按距离从近到远排序
                        currentStations = result2.poiList.pois.sort((a, b) => a.distance - b.distance);
                        updateStationList();
                        addStationMarkers(currentStations);
                    } else {
                        console.error('两次搜索都失败:', result2);
                        showError('搜索附近充电站失败，尝试手动搜索或检查网络连接');
                    }
                });
            }
            
            // 确保在所有情况下都隐藏加载动画
            hideLoading();
        });
    });
}

// 清空充电站标记
function clearStationMarkers() {
    stationMarkers.forEach(marker => {
        map.remove(marker);
    });
    stationMarkers = [];
}

// 添加充电站标记
function addStationMarkers(stations) {
    stations.forEach((station, index) => {
        const marker = new AMap.Marker({
            position: [station.location.lng, station.location.lat],
            map: map,
            icon: new AMap.Icon({
                size: new AMap.Size(25, 25),
                image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
                imageSize: new AMap.Size(25, 25)
            }),
            title: station.name
        });
        
        // 绑定点击事件
        marker.on('click', () => {
            showStationDetail(station, index);
        });
        
        stationMarkers.push(marker);
    });
    
    // 如果有充电站，调整地图视野
    if (stations.length > 0) {
        const bounds = new AMap.Bounds();
        stations.forEach(station => {
            bounds.extend([station.location.lng, station.location.lat]);
        });
        // 包含用户位置
        bounds.extend(map.getCenter());
        map.setBounds(bounds, false, [20, 20, 20, 20]);
    }
}

// 更新充电站列表
function updateStationList() {
    const stationList = document.getElementById('station-list');
    const stationCount = document.getElementById('station-count');
    
    if (currentStations.length === 0) {
        stationList.innerHTML = '<div class="error">未找到附近的充电站</div>';
        stationCount.textContent = '0个结果';
        return;
    }
    
    stationCount.textContent = `${currentStations.length}个结果`;
    
    let html = '';
    currentStations.forEach((station, index) => {
        html += `
            <div class="station-item" data-index="${index}">
                <div class="station-name">${station.name}</div>
                <div class="station-address">${station.address}</div>
                <div class="station-info">
                    <span>${station.type}</span>
                    <span class="station-distance">${station.distance}米</span>
                </div>
            </div>
        `;
    });
    
    stationList.innerHTML = html;
    
    // 绑定列表点击事件
    document.querySelectorAll('.station-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            showStationDetail(currentStations[index], index);
        });
    });
}

// 显示充电站详情
function showStationDetail(station, index) {
    // 更新选中状态
    document.querySelectorAll('.station-item').forEach(item => {
        item.classList.remove('selected');
    });
    document.querySelector(`[data-index="${index}"]`).classList.add('selected');
    
    selectedStation = station;
    
    // 更新详情面板
    const detailPanel = document.getElementById('station-detail');
    const detailName = document.getElementById('detail-name');
    const detailContent = document.getElementById('detail-content');
    
    detailName.textContent = station.name;
    detailContent.innerHTML = `
        <p><strong>地址：</strong>${station.address}</p>
        <p><strong>距离：</strong>${station.distance}米</p>
        <p><strong>类型：</strong>${station.type}</p>
        <p><strong>电话：</strong>${station.tel || '暂无'}</p>
        <p><strong>营业时间：</strong>${station.businessArea || '暂无'}</p>
        <div class="detail-action">
            <button class="btn-primary" onclick="navigateToStation()">导航到这里</button>
            <button class="btn-secondary" onclick="hideStationDetail()">关闭</button>
        </div>
    `;
    
    // 显示详情面板
    detailPanel.classList.remove('hidden');
    
    // 地图定位到该充电站
    map.setCenter([station.location.lng, station.location.lat]);
    
    // 放大地图
    if (map.getZoom() < 17) {
        map.setZoom(17);
    }
}

// 隐藏充电站详情
function hideStationDetail() {
    document.getElementById('station-detail').classList.add('hidden');
    selectedStation = null;
    
    // 移除选中状态
    document.querySelectorAll('.station-item').forEach(item => {
        item.classList.remove('selected');
    });
}

// 导航到充电站
function navigateToStation() {
    if (!selectedStation) return;
    
    const { lng, lat } = selectedStation.location;
    const destination = `${lat},${lng}`;
    
    // 获取当前位置
    const currentCenter = map.getCenter();
    const origin = `${currentCenter.lat},${currentCenter.lng}`;
    
    // 使用高德地图导航
    const url = `https://uri.amap.com/navigation?from=${origin}&to=${destination}&mode=driving&policy=1&src=mypage`;
    window.open(url, '_blank');
}

// 搜索地址
function searchAddress() {
    const searchInput = document.getElementById('search-input');
    const keyword = searchInput.value.trim();
    
    if (!keyword) {
        alert('请输入搜索地址');
        return;
    }
    
    showLoading();
    
    // 使用高德地图地理编码
    AMap.plugin('AMap.Geocoder', () => {
        const geocoder = new AMap.Geocoder();
        
        geocoder.getLocation(keyword, (status, result) => {
            hideLoading();
            
            if (status === 'complete' && result.geocodes.length > 0) {
                const location = result.geocodes[0].location;
                
                // 定位到搜索位置
                map.setCenter([location.lng, location.lat]);
                
                // 搜索该位置附近的充电站
                searchNearbyStations([location.lng, location.lat]);
            } else {
                console.error('地理编码失败:', result);
                showError('搜索地址失败，请检查输入或稍后重试');
            }
        });
    });
}

// 绑定搜索事件
function bindSearchEvent() {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    
    // 点击搜索按钮
    searchBtn.addEventListener('click', searchAddress);
    
    // 回车搜索
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchAddress();
        }
    });
}

// 绑定详情事件
function bindDetailEvents() {
    const closeBtn = document.getElementById('close-detail');
    closeBtn.addEventListener('click', hideStationDetail);
}

// 页面加载完成后初始化
window.addEventListener('load', initMap);