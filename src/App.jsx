import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'
import * as XLSX from 'xlsx'

function App() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [formData, setFormData] = useState({
    主系统: '',
    模块: '',
    子系统: '',
    项目简介: '',
    主要功能: '',
    需求方: '',
    负责人: '',
    开发参与人: '',
    预计完成时间: '',
    预计第一版测试时间: '',
    优先级: '5颗星',
    项目状态: '规划中',
    目前进度: '',
    网址: '',
    版本号: 'V0.1.0'
  })

  const fileInputRef = useRef(null)

  const statusOptions = ['规划中', '开发中', '测试中', '已上线']
  const priorityOptions = ['5颗星', '4颗星', '3颗星', '2颗星', '1颗星']

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('id', { ascending: false })
      
      if (error) throw error
      setProjects(data || [])
    } catch (err) {
      console.error('加载数据失败:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.项目状态 === filter)

  const stats = {
    total: projects.length,
    planning: projects.filter(p => p.项目状态 === '规划中').length,
    developing: projects.filter(p => p.项目状态 === '开发中').length,
    testing: projects.filter(p => p.项目状态 === '测试中').length,
    online: projects.filter(p => p.项目状态 === '已上线').length
  }

  function openAddModal() {
    setEditingProject(null)
    setFormData({
      主系统: '',
      模块: '',
      子系统: '',
      项目简介: '',
      主要功能: '',
      需求方: '',
      负责人: '',
      开发参与人: '',
      预计完成时间: '',
      预计第一版测试时间: '',
      优先级: '5颗星',
      项目状态: '规划中',
      目前进度: '',
      网址: '',
      版本号: 'V0.1.0'
    })
    setShowModal(true)
  }

  function openEditModal(project) {
    setEditingProject(project)
    setFormData({ ...project })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(formData)
          .eq('id', editingProject.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([formData])
        if (error) throw error
      }
      setShowModal(false)
      loadProjects()
    } catch (err) {
      alert('保存失败: ' + err.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('确定要删除这条记录吗？')) return
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
      if (error) throw error
      loadProjects()
    } catch (err) {
      alert('删除失败: ' + err.message)
    }
  }

  // 导出 Excel
  function exportToExcel() {
    const exportData = projects.map(p => ({
      '主系统': p.主系统,
      '模块': p.模块,
      '子系统': p.子系统,
      '项目简介': p.项目简介,
      '主要功能': p.主要功能,
      '需求方': p.需求方,
      '负责人': p.负责人,
      '开发参与人': p.开发参与人,
      '预计完成时间': p.预计完成时间,
      '预计第一版测试时间': p.预计第一版测试时间,
      '优先级': p.优先级,
      '项目状态': p.项目状态,
      '目前进度': p.目前进度,
      '网址': p.网址,
      '版本号': p.版本号
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '项目列表')
    
    // 设置列宽
    const colWidths = [
      { wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 30 }, { wch: 30 },
      { wch: 10 }, { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 15 },
      { wch: 10 }, { wch: 10 }, { wch: 30 }, { wch: 25 }, { wch: 12 }
    ]
    ws['!cols'] = colWidths
    
    XLSX.writeFile(wb, `项目列表_${new Date().toLocaleDateString()}.xlsx`)
  }

  // 导入 Excel
  async function importFromExcel(e) {
    const file = e.target.files[0]
    if (!file) return

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      if (jsonData.length === 0) {
        alert('Excel 文件为空')
        return
      }

      // 确认导入
      if (!confirm(`确定要导入 ${jsonData.length} 条记录吗？`)) return

      // 转换数据格式
      const projectsToInsert = jsonData.map(row => ({
        主系统: row['主系统'] || '',
        模块: row['模块'] || '',
        子系统: row['子系统'] || '',
        项目简介: row['项目简介'] || '',
        主要功能: row['主要功能'] || '',
        需求方: row['需求方'] || '',
        负责人: row['负责人'] || '',
        开发参与人: row['开发参与人'] || '',
        预计完成时间: row['预计完成时间'] || '',
        预计第一版测试时间: row['预计第一版测试时间'] || '',
        优先级: row['优先级'] || '3颗星',
        项目状态: row['项目状态'] || '规划中',
        目前进度: row['目前进度'] || '',
        网址: row['网址'] || '',
        版本号: row['版本号'] || 'V0.1.0'
      }))

      // 批量插入
      const { error } = await supabase
        .from('projects')
        .insert(projectsToInsert)

      if (error) throw error

      alert(`成功导入 ${projectsToInsert.length} 条记录`)
      loadProjects()
    } catch (err) {
      alert('导入失败: ' + err.message)
    }

    // 清空文件输入
    e.target.value = ''
  }

  function getStatusColor(status) {
    const colors = {
      '规划中': '#faad14',
      '开发中': '#1890ff',
      '测试中': '#722ed1',
      '已上线': '#13c2c2'
    }
    return colors[status] || '#8c8c8c'
  }

  function getPriorityColor(priority) {
    const colors = {
      '5颗星': '#ff4d4f',
      '4颗星': '#fa541c',
      '3颗星': '#faad14',
      '2颗星': '#52c41a',
      '1颗星': '#8c8c8c'
    }
    return colors[priority] || '#8c8c8c'
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">
          <h3>连接数据库失败</h3>
          <p>{error}</p>
          <p>请检查 Supabase 环境变量配置</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <header className="header">
        <h1>项目管理系统</h1>
        <div className="header-actions">
          <input
            type="file"
            ref={fileInputRef}
            accept=".xlsx,.xls"
            onChange={importFromExcel}
            style={{ display: 'none' }}
          />
          <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
            📥 导入 Excel
          </button>
          <button className="btn-secondary" onClick={exportToExcel}>
            📤 导出 Excel
          </button>
          <button className="btn-primary" onClick={openAddModal}>+ 新增项目</button>
        </div>
      </header>

      <div className="stats">
        <div className="stat-item">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">全部项目</span>
        </div>
        <div className="stat-item">
          <span className="stat-number" style={{ color: '#faad14' }}>{stats.planning}</span>
          <span className="stat-label">规划中</span>
        </div>
        <div className="stat-item">
          <span className="stat-number" style={{ color: '#1890ff' }}>{stats.developing}</span>
          <span className="stat-label">开发中</span>
        </div>
        <div className="stat-item">
          <span className="stat-number" style={{ color: '#722ed1' }}>{stats.testing}</span>
          <span className="stat-label">测试中</span>
        </div>
        <div className="stat-item">
          <span className="stat-number" style={{ color: '#13c2c2' }}>{stats.online}</span>
          <span className="stat-label">已上线</span>
        </div>
      </div>

      <div className="filter-bar">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          全部
        </button>
        {statusOptions.map(status => (
          <button
            key={status}
            className={`filter-btn ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="table-wrapper">
        <div className="table-container">
          <table className="project-table">
            <thead>
              <tr>
                <th>主系统</th>
                <th>模块</th>
                <th>子系统</th>
                <th>项目简介</th>
                <th>主要功能</th>
                <th>需求方</th>
                <th>负责人</th>
                <th>开发参与人</th>
                <th>预计完成</th>
                <th>预计测试</th>
                <th>优先级</th>
                <th>状态</th>
                <th>目前进度</th>
                <th>网址</th>
                <th>版本号</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map(project => (
                <tr key={project.id}>
                  <td>{project.主系统}</td>
                  <td>{project.模块}</td>
                  <td>{project.子系统}</td>
                  <td className="wrap-text">{project.项目简介}</td>
                  <td className="wrap-text">{project.主要功能}</td>
                  <td>{project.需求方}</td>
                  <td>{project.负责人}</td>
                  <td>{project.开发参与人}</td>
                  <td>{project.预计完成时间}</td>
                  <td>{project.预计第一版测试时间}</td>
                  <td>
                    <span className="priority-badge" style={{ backgroundColor: getPriorityColor(project.优先级) }}>
                      {project.优先级}
                    </span>
                  </td>
                  <td>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(project.项目状态) }}>
                      {project.项目状态}
                    </span>
                  </td>
                  <td className="wrap-text">{project.目前进度}</td>
                  <td>
                    {project.网址 ? (
                      <a href={project.网址} target="_blank" rel="noopener noreferrer">访问</a>
                    ) : '-'}
                  </td>
                  <td>{project.版本号}</td>
                  <td className="action-btns">
                    <button className="btn-edit" onClick={() => openEditModal(project)}>编辑</button>
                    <button className="btn-delete" onClick={() => handleDelete(project.id)}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProject ? '编辑项目' : '新增项目'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>主系统 *</label>
                  <input
                    type="text"
                    value={formData.主系统}
                    onChange={e => setFormData({...formData, 主系统: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>模块 *</label>
                  <input
                    type="text"
                    value={formData.模块}
                    onChange={e => setFormData({...formData, 模块: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>子系统 *</label>
                  <input
                    type="text"
                    value={formData.子系统}
                    onChange={e => setFormData({...formData, 子系统: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>项目简介</label>
                <textarea
                  value={formData.项目简介}
                  onChange={e => setFormData({...formData, 项目简介: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>主要功能</label>
                <textarea
                  value={formData.主要功能}
                  onChange={e => setFormData({...formData, 主要功能: e.target.value})}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>需求方 *</label>
                  <input
                    type="text"
                    value={formData.需求方}
                    onChange={e => setFormData({...formData, 需求方: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>负责人 *</label>
                  <input
                    type="text"
                    value={formData.负责人}
                    onChange={e => setFormData({...formData, 负责人: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>开发参与人</label>
                  <input
                    type="text"
                    value={formData.开发参与人}
                    onChange={e => setFormData({...formData, 开发参与人: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>预计完成时间</label>
                  <input
                    type="text"
                    value={formData.预计完成时间}
                    onChange={e => setFormData({...formData, 预计完成时间: e.target.value})}
                    placeholder="如：2024-08-30"
                  />
                </div>
                <div className="form-group">
                  <label>预计第一版测试时间</label>
                  <input
                    type="text"
                    value={formData.预计第一版测试时间}
                    onChange={e => setFormData({...formData, 预计第一版测试时间: e.target.value})}
                    placeholder="如：2024-07-15"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>优先级</label>
                  <select
                    value={formData.优先级}
                    onChange={e => setFormData({...formData, 优先级: e.target.value})}
                  >
                    {priorityOptions.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>项目状态</label>
                  <select
                    value={formData.项目状态}
                    onChange={e => setFormData({...formData, 项目状态: e.target.value})}
                  >
                    {statusOptions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>版本号</label>
                  <input
                    type="text"
                    value={formData.版本号}
                    onChange={e => setFormData({...formData, 版本号: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>目前进度</label>
                <textarea
                  value={formData.目前进度}
                  onChange={e => setFormData({...formData, 目前进度: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>网址</label>
                <input
                  type="text"
                  value={formData.网址}
                  onChange={e => setFormData({...formData, 网址: e.target.value})}
                  placeholder="如：http://example.com"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>取消</button>
                <button type="submit" className="btn-primary">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
