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
  // const geometry = new THREE.BoxGeometry(100,100,100)
  const geometry = new THREE.PlaneGeometry(2000,2000)

//纹理贴图加载器TextureLoader
  const texLoader = new THREE.TextureLoader()
// .load()方法加载图像，返回一个纹理对象Texture
//   const texture = texLoader.load('../../public/1.png')
  const texture = texLoader.load('./logo.png')
  console.log(texture)

  // 设置阵列模式
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
// uv两个方向纹理重复数量
  texture.repeat.set(12,12)//注意选择合适的阵列数量

// 添加一个辅助网格地面
  const gridHelper = new THREE.GridHelper(3000, 25, 0x004444, 0x004444)
  scene.add(gridHelper)

  const material = new THREE.MeshLambertMaterial({
    map:texture,
    transparent:true
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(0,0,0)

  // 旋转矩形平面
  mesh.rotateX(-Math.PI/2)

  scene.add(mesh)

  const axesHelper=new THREE.AxesHelper(300)
  scene.add(axesHelper)



  //添加环境光
  const ambient=new THREE.AmbientLight(0xffffff,5)
  scene.add(ambient)



  // 创建相机
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 20000)
  camera.position.set(1000,1000,1000)
  camera.lookAt(0,0,0)

  //创建渲染器
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  can.value?.appendChild(renderer.domElement)
  setTimeout(()=>{
    renderer.render(scene,camera)
  })

  const controls = new OrbitControls( camera, renderer.domElement )
  controls.addEventListener('change',function(){
    renderer.render(scene,camera)
  })
})


console.log(11)
</script>

<style scoped></style>

为什么光源设置没有效果
