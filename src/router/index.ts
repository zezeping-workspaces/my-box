import { createRouter, createWebHistory } from 'vue-router'
// 定义路由
const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('../views/home/index.vue') // 懒加载组件
    },
    {
        path: '/preferences',
        name: 'preferences',
        component: () => import('../views/preferences/index.vue'), // 懒加载组件
        redirect: '/preferences/base',
        children: [
            {
                path: 'base',
                name: 'preferences/base',
                component: () => import('../views/preferences/base/index.vue')
            }
        ]
    },
    {
        path: '/snippet',
        name: 'snippet',
        component: () => import('../views/snippet/index.vue')
    },
    {
        path: '/dicStock',
        name: 'dicStock',
        component: () => import('../views/dicStock/index.vue')
    },
    {
        path: '/stock',
        name: 'stock',
        component: () => import('../views/stock/index.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router