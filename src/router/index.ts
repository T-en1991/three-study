import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path:'/',
      redirect:'/study1'
    },
    {
      path: '/study1',
      name: 'study1',
      component: () => import('../views/study1.vue')
    }  ,
    {
      path: '/animationFrame',
      name: 'animationFrame',
      component: () => import('../views/AnimationFrame.vue')
    },
    {
      path: '/stats',
        name: 'stats',
      component: () => import('../views/Stats.vue')
    },
    {
      path: '/队列立体和相机适配体验',
      name: '队列立体和相机适配体验',
      component: () => import('../views/队列立体和相机适配体验.vue')
    },
    {
      path: '/各种体',
      name: '各种体',
      component: () => import('../views/各种体.vue')
    },
    {
      path: '/DatGui',
      name: 'DatGui',
      component: () => import('../views/DatGui.vue')
    },
    {
      path: '/顶点和点模型',
      name: '顶点和点模型',
      component: () => import('../views/顶点和点模型.vue')
    },
    {
      path: '/线模型渲染顶点数据',
      name: '线模型渲染顶点数据',
      component: () => import('../views/线模型渲染顶点数据.vue')
    },
    {
      path: '/网格模型渲染顶点数据',
      name: '网格模型渲染顶点数据',
      component: () => import('../views/网格模型渲染顶点数据.vue')
    },
    {
      path: '/创建纹理贴图',
      name: '创建纹理贴图',
      component: () => import('../views/创建纹理贴图.vue')
    },
    {
      path: '/loaderGltf',
      name: 'loaderGltf',
      component: () => import('../views/loaderGltf.vue')
    },
    {
      path: '/loaderStl',
      name: 'loaderStl',
      component: () => import('../views/loaderStl.vue')
    },    {
      path: '/loaderVtp',
      name: 'loaderVtp',
      component: () => import('../views/loaderVtp.vue')
    },  {
      path: '/loaderVtpMesh',
      name: 'loaderVtpMesh',
      component: () => import('../views/loaderVtpMesh.vue')
    },
  ]
})

export default router
