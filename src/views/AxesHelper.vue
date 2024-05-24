<template>
  <div ref="can"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'

const can = ref<HTMLDivElement>()
onMounted(() => {
  //创建场景
  const scene = new THREE.Scene()
  //创建物体
  const box = new THREE.BoxGeometry(10, 10, 10)
  const material = new THREE.MeshBasicMaterial({
    color: 0xffff00
  })
  const cube = new THREE.Mesh(box, material)
  cube.position.set(0,10,0)
  scene.add(cube)

  //辅助坐标系
  const axesHelper=new THREE.AxesHelper(100)
  scene.add(axesHelper)

  // 创建相机
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(100,100,100)
  camera.lookAt(0,0,0)


  //创建渲染器
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  can.value?.appendChild(renderer.domElement)
  renderer.render(scene,camera)

  //控制器
  const controls = new OrbitControls( camera, renderer.domElement )
  controls.addEventListener('change',function(){
    renderer.render(scene,camera)
  })
})


console.log(11)
</script>

<style scoped></style>
