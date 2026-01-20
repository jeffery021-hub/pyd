import React, { useState } from 'react'

const AddStationForm = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: '',
    count: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // 简单验证
    if (!formData.name || !formData.address) {
      alert('请填写充电站名称和地址')
      return
    }

    // 转换count为数字
    const processedData = {
      ...formData,
      count: formData.count ? parseInt(formData.count) : undefined
    }

    onAdd(processedData)
  }

  return (
    <div className="form-container">
      <h2>添加充电站</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">充电站名称</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="请输入充电站名称"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">地址</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="请输入充电站地址"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">类型</label>
          <input
            type="text"
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            placeholder="例如：直流快充、交流慢充"
          />
        </div>

        <div className="form-group">
          <label htmlFor="count">充电桩数量</label>
          <input
            type="number"
            id="count"
            name="count"
            value={formData.count}
            onChange={handleChange}
            placeholder="请输入充电桩数量"
            min="1"
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            取消
          </button>
          <button type="submit" className="btn btn-primary">
            添加
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddStationForm