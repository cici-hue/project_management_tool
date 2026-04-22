-- Supabase 数据库初始化脚本
-- 在 Supabase SQL Editor 中执行

-- 创建项目表
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    主系统 TEXT NOT NULL,
    模块 TEXT NOT NULL,
    子系统 TEXT NOT NULL,
    项目简介 TEXT,
    主要功能 TEXT,
    需求方 TEXT NOT NULL,
    负责人 TEXT NOT NULL,
    开发参与人 TEXT,
    预计完成时间 TEXT,
    预计第一版测试时间 TEXT,
    优先级 TEXT DEFAULT 'P2',
    项目状态 TEXT DEFAULT '开发中',
    目前进度 TEXT,
    网址 TEXT,
    版本号 TEXT DEFAULT 'V0.1.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 插入示例数据
INSERT INTO projects (
    主系统, 模块, 子系统, 项目简介, 主要功能, 需求方, 负责人, 开发参与人,
    预计完成时间, 预计第一版测试时间, 优先级, 项目状态, 目前进度, 网址, 版本号
) VALUES (
    '工厂评估系统',
    '供应商管理',
    '准入评估',
    '用于新供应商准入评估的数字化平台',
    '供应商资质审核、现场评估、评分报告生成',
    '采购部',
    '张三',
    '张三(前端)+李四(后端)+王五(测试)',
    '2024-08-30',
    '2024-07-15',
    'P1',
    '测试中',
    '核心功能已完成，正在进行集成测试',
    'http://factory-eval.company.com',
    'V1.2.0'
);

-- 启用 RLS (Row Level Security)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 创建允许所有操作的策略（开发阶段，后续可改为认证用户）
CREATE POLICY "Allow all operations" ON projects
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 创建更新时间的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
