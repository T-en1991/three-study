<template>
  <div ref="can"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'

const can = ref<HTMLDivElement>()
onMounted(() => {
  //创建场景
  const scene = new THREE.Scene()
  const stats=new Stats()
  can.value?.appendChild(stats.domElement)
  //创建物体
  const box = new THREE.BoxGeometry(10, 10, 10)
  const material = new THREE.MeshLambertMaterial({
    color: 0xff0000,
    transparent:true,
    opacity:1
  })
  const cube = new THREE.Mesh(box, material)
  cube.position.set(0,0,0)
  scene.add(cube)

  const axesHelper=new THREE.AxesHelper(30)
  scene.add(axesHelper)


  //添加环境光
  const ambient=new THREE.AmbientLight(0xffffff,0.5)
  scene.add(ambient)

  // 创建相机
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 200)
  camera.position.set(100,100,100)
  camera.lookAt(0,0,0)

  //创建渲染器
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  can.value?.appendChild(renderer.domElement)
  renderer.render(scene,camera)


  // 渲染循环
  function render(){
    stats.update()
    cube.rotateY(0.01)
    renderer.render(scene,camera)
    requestAnimationFrame(render)
  }

  render()

  const controls = new OrbitControls( camera, renderer.domElement )
  controls.addEventListener('change',function(){
    renderer.render(scene,camera)
  })

  // resize
  window.onresize=function(){
    renderer.setSize(window.innerWidth,window.innerHeight)
    camera.aspect=window.innerWidth/window.innerHeight
    camera.updateProjectionMatrix()

  }
})


console.log(11)
</script>

<style scoped></style>

为什么光源设置没有效果
