# Federated Learning Demo with SecretFlow

---

## 项目结构

```text
fl-demo/
├─ backend/          # FastAPI 后端
│  └─ app/
│     └─ main.py
├─ frontend/         # React 前端
│  └─ src/
│     └─ api/        # 前端调用后端 API
└─ README.md
```
1. 环境准备

创建 Python 环境
```
conda create -n sf python=3.10 -y
conda activate sf
```

安装 SecretFlow Full + SFL
```
pip install "secretflow[full]==1.13.0b0"
pip install sfl
```

2. 前端环境准备
# 使用 nvm 安装
```
nvm install 20
nvm use 20
```

安装前端依赖
```
cd fl-demo/frontend
npm install
npm install recharts lucide-react
```

3. 启动

根目录下
```
npm start
```

```
http://127.0.0.1:5173/
```
