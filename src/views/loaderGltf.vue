<template>
  <div ref="can"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader'
import { Group } from 'three'

const can = ref<HTMLDivElement>()
onMounted(() => {
  //创建场景
  const scene = new THREE.Scene()
  //创建物体
  const loader=new GLTFLoader()

  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('../../../node_modules/three/examples/jsm/libs/draco/gltf/')  // 设置 Draco 解码器的路径
  loader.setDRACOLoader(dracoLoader)

  loader.load('../../../public/AVIFTest/forest_house.glb',function (gltf:any){
    console.log(gltf,1)
    scene.add(gltf.scene)
  })
  console.log(2)

  // 添加点光源
  const light = new THREE.PointLight( 0xff00ff, 10.0,10.0,0.0 )
  light.position.set( 100, 100, 100 )
  scene.add( light )


  //添加环境光
  const ambient=new THREE.AmbientLight(0xffffff,0.5)
  scene.add(ambient)


  // 创建相机
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 200)
  camera.position.set(10,10,10)
  camera.lookAt(0,0,0)

  //创建渲染器
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  can.value?.appendChild(renderer.domElement)
  renderer.render(scene,camera)

  const controls = new OrbitControls( camera, renderer.domElement )

  controls.addEventListener('change',function(){
    renderer.render(scene,camera)
  })
})


console.log(11)
</script>

<style scoped></style>

