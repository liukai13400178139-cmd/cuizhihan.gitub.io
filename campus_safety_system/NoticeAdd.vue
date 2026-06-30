<template>
  <div class="notice-add-container">
    <el-container>
      <el-header class="main-header">
        <div class="header-left">
          <h1>发布通知</h1>
        </div>
        <div class="header-right">
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </el-header>
      
      <el-container>
        <el-aside width="220px" class="main-sidebar">
          <div class="sidebar-logo">
            <div class="logo-icon">🛡️</div>
            <div class="logo-text">安全管理</div>
          </div>
          <el-menu :default-active="activeMenu" class="sidebar-menu" background-color="#1a1a2e" text-color="#fff" active-text-color="#4facfe">
            <el-menu-item index="dashboard" @click="goDashboard">
              <template #icon><span>📊</span></template>
              <span>数据大屏</span>
            </el-menu-item>
            <el-sub-menu index="danger">
              <template #title>
                <span>⚠️</span>
                <span>隐患管理</span>
              </template>
              <el-menu-item index="danger-list" @click="goDanger">隐患列表</el-menu-item>
              <el-menu-item index="danger-add" @click="goDangerAdd">上报隐患</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="drill">
              <template #title>
                <span>🚒</span>
                <span>应急演练</span>
              </template>
              <el-menu-item index="drill-list" @click="goDrill">演练列表</el-menu-item>
              <el-menu-item index="drill-add" @click="goDrillAdd">添加演练</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="notice" :default-active="activeSubMenu">
              <template #title>
                <span>🔔</span>
                <span>预警通知</span>
              </template>
              <el-menu-item index="notice-list" @click="goNotice">通知列表</el-menu-item>
              <el-menu-item index="notice-add" @click="goAdd">发布通知</el-menu-item>
            </el-sub-menu>
            <el-menu-item index="course" @click="goCourse">
              <template #icon><span>📚</span></template>
              <span>安全学习</span>
            </el-menu-item>
            <el-menu-item index="manual" @click="goManual">
              <template #icon><span>📖</span></template>
              <span>应急手册</span>
            </el-menu-item>
            <el-menu-item index="admin" @click="goAdmin" v-if="role === 'admin'">
              <template #icon><span>⚙️</span></template>
              <span>系统管理</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        
        <el-main class="main-content">
          <el-card class="form-card">
            <el-form :model="form" label-width="120px">
              <el-form-item label="通知标题" prop="title">
                <el-input v-model="form.title" placeholder="请输入通知标题"></el-input>
              </el-form-item>
              
              <el-form-item label="通知类型" prop="type">
                <el-select v-model="form.type" placeholder="请选择通知类型">
                  <el-option label="通知" value="notice"></el-option>
                  <el-option label="预警" value="warning"></el-option>
                  <el-option label="警示" value="alert"></el-option>
                  <el-option label="紧急通知" value="emergency"></el-option>
                </el-select>
              </el-form-item>
              
              <el-form-item label="紧急级别" prop="level">
                <el-radio-group v-model="form.level">
                  <el-radio label="normal">普通</el-radio>
                  <el-radio label="urgent">紧急</el-radio>
                  <el-radio label="special">特级</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item label="接收对象" prop="receiver">
                <el-select v-model="form.receiver" placeholder="请选择接收对象">
                  <el-option label="全部人员" value="all"></el-option>
                  <el-option label="教师" value="teacher"></el-option>
                  <el-option label="安保人员" value="security"></el-option>
                  <el-option label="指定人员" value="specific"></el-option>
                </el-select>
              </el-form-item>
              
              <el-form-item label="通知内容" prop="content">
                <el-textarea v-model="form.content" :rows="6" placeholder="请输入通知内容"></el-textarea>
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="submitForm">发布通知</el-button>
                <el-button @click="resetForm">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const activeMenu = ref('notice')
const activeSubMenu = ref('notice-add')
const role = ref(localStorage.getItem('role') || '')

const form = reactive({
  title: '',
  type: 'notice',
  level: 'normal',
  receiver: 'all',
  content: ''
})

const goDashboard = () => router.push('/dashboard')
const goDanger = () => router.push('/danger')
const goDangerAdd = () => router.push('/danger/add')
const goDrill = () => router.push('/drill')
const goDrillAdd = () => router.push('/drill/add')
const goNotice = () => router.push('/notice')
const goAdd = () => router.push('/notice/add')
const goCourse = () => router.push('/course')
const goManual = () => router.push('/manual')
const goAdmin = () => router.push('/admin')
const goBack = () => router.push('/notice')

const submitForm = () => {
  if (!form.title) {
    ElMessage.warning('请输入通知标题')
    return
  }
  if (!form.content) {
    ElMessage.warning('请输入通知内容')
    return
  }
  
  ElMessage.success('通知发布成功')
  router.push('/notice')
}

const resetForm = () => {
  form.title = ''
  form.type = 'notice'
  form.level = 'normal'
  form.receiver = 'all'
  form.content = ''
}
</script>

<style scoped>
.notice-add-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.main-header {
  background: linear-gradient(90deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.header-left h1 {
  font-size: 20px;
  margin: 0;
}

.main-sidebar {
  background: #1a1a2e;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 10px;
}

.logo-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.logo-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.sidebar-menu {
  height: calc(100% - 80px);
  border-right: none;
}

.sidebar-menu .el-menu-item,
.sidebar-menu .el-sub-menu__title {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  height: 48px;
  line-height: 48px;
  margin: 4px 8px;
  border-radius: 8px;
}

.sidebar-menu .el-menu-item:hover,
.sidebar-menu .el-sub-menu__title:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.sidebar-menu .el-menu-item.is-active,
.sidebar-menu .el-sub-menu.is-active .el-sub-menu__title {
  background-color: rgba(79, 172, 254, 0.2);
  color: #4facfe;
}

.main-content {
  padding: 30px;
}

.form-card {
  max-width: 600px;
  margin: 0 auto;
  padding: 30px;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-radio-group {
  display: flex;
  gap: 30px;
}
</style>