<template>
  <div class="box">
    <div ref="can"></div>
  </div>

</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import * as THREE from 'three'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"

const threeState={
  scene: new THREE.Scene(),
  renderer: new THREE.WebGLRenderer({ antialias: true }),
  axesHelper: new THREE.AxesHelper(1),
  camera: new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
}

const can = ref<HTMLDivElement>()

onMounted( () => {

  //创建物体
  const box = new THREE.BoxGeometry(10, 10, 10)
  const material=new THREE.MeshStandardMaterial({
    metalness:0.9
  })
  const cube = new THREE.Mesh(box, material)
  cube.position.set(0,0,0)
  threeState.scene.add(cube)

  const axesHelper=new THREE.AxesHelper(300)
  threeState.scene.add(axesHelper)

  // 添加点光源
  const light = new THREE.PointLight( 0xff00ff, 100.0,1000.0,0.0 )
  console.log(light,'light')
  light.position.set( 100, 100, 100 )
  threeState.scene.add( light )

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
  renderer.render(threeState.scene,camera)

  const controls = new OrbitControls( camera, renderer.domElement )

  controls.addEventListener('change',function(){
    renderer.render(threeState.scene,camera)
  })
})

console.log(1)
</script>

<style scoped lang="less">
.box{
  position: relative;
  top:0;
  left: 0;
  .center-line{
    position: absolute;
    top:200px;
    left: 0;

  }
}

</style>

