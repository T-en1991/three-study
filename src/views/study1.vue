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
  // const material = new THREE.MeshLambertMaterial({
  //   color: 0xff0000,
  //   transparent:true,
  //   opacity:1
  // })
  const material=new THREE.MeshStandardMaterial({
    metalness:0.9
  })
  const cube = new THREE.Mesh(box, material)
  cube.position.set(0,0,0)
  scene.add(cube)

  const axesHelper=new THREE.AxesHelper(300)
  scene.add(axesHelper)

  // 添加点光源
  const light = new THREE.PointLight( 0xff00ff, 100.0,1000.0,0.0 )
  console.log(light,'light')
  light.position.set( 100, 100, 100 )
  scene.add( light )


  //添加环境光
  const ambient=new THREE.AmbientLight(0xffffff,0.5)
  scene.add(ambient)

  //添加平行光
  const directionalLight = new THREE.DirectionalLight(0x0000ff, 1)
  directionalLight.position.set(10,50,150)
  scene.add(directionalLight)


  // 可视化平行光
  const helper = new THREE.DirectionalLightHelper( directionalLight, 5 )
  scene.add( helper )

  // 创建相机
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 200)
  camera.position.set(100,100,100)
  camera.lookAt(0,0,0)

  //创建渲染器
  const renderer = new THREE.WebGLRenderer({

  })
  renderer.setClearColor(0xb9d3ff, 0.4) //设置背景颜色和透明度
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

为什么光源设置没有效果
