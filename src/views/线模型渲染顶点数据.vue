<template>
  <div ref='can'>

  </div>
</template>

<script setup lang='ts'>
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import { onMounted, ref } from 'vue'

  const can = ref<HTMLDivElement>()
  onMounted(()=>{

    //region 创建点模型

    //创建一个空的几何体对象
    const geometry=new THREE.BufferGeometry()
    //添加顶点数据
    const vertices=new Float32Array([
      0,0,0,
      -10,20,0,
      32,39,51,
      20,31,28,
      -10,11,0
    ])

    // 用于存储与BufferGeometry相关联的 attribute
    const attribute=new THREE.BufferAttribute(vertices,3)

    //设置几何体的顶点位置属性
    geometry.attributes.position=attribute

    const material=new THREE.LineDashedMaterial({
      color:0xFF0000,
    })

    // const line=new THREE.Line(geometry,material)//线
    const line=new THREE.LineLoop(geometry,material)//闭合



    //endregion



    // 创建场景
    const scene=new THREE.Scene()

    scene.add(line)

    //光源
    const light = new THREE.AmbientLight( 0x404040 ) // 柔和的白光
    scene.add(light)

    // 创建相机
    const camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)
    camera.position.set(100,100,100)
    camera.lookAt(0,0,0,)
    scene.add(camera)

    // 创建场景
    const render=new THREE.WebGLRenderer({
      antialias:true
    })
    render.setSize(window.innerWidth,window.innerHeight)
    render.setPixelRatio(window.devicePixelRatio)
    can?.value.appendChild(render.domElement)
    render.render(scene,camera)

    const axes=new THREE.AxesHelper(30)
    scene.add(axes)

    // 创建控制器
    const control=new OrbitControls(camera, render.domElement)
    control.addEventListener('change',()=>{

      render.render(scene,camera)
    })
  })
console.log(11)
</script>

<style scoped>

</style>
