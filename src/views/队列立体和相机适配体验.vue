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

    // 创建场景
    const scene=new THREE.Scene()

    // 创建物体
    const box=new THREE.BoxGeometry(10,10,10)
    const material=new THREE.MeshBasicMaterial({
      color:0xff00ff
    })
    // const cube=new THREE.Mesh(box,material)
    // cube.position.set(0,0,0)
    // scene.add(cube)

    const count=10
    for (let i=0;i<count;i++){
      const cube=new THREE.Mesh(box,material)
      cube.position.set(i*20,0,0)
      scene.add(cube)
    }


    // 创建相机
    const camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)
    camera.position.set(100,0,0)
    camera.lookAt(0,0,0,)
    scene.add(camera)

    // 创建场景
    const render=new THREE.WebGLRenderer()
    render.setSize(window.innerWidth,window.innerHeight)
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
