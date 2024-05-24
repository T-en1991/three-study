<template>
  <div ref='can'>

  </div>
</template>

<script setup lang='ts'>
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import { onMounted, ref } from 'vue'
import * as dat from 'dat.gui'


const can = ref<HTMLDivElement>()

  onMounted(()=>{

    const gui = new dat.GUI()
    // const obj={
    //   x:30,
    //   y:22,
    //   z:0
    // }
    // gui.add(obj,'x',1,100)
    // gui.add(obj,'y',1,100)
    // gui.add(obj,'z',1,100)

    // 创建场景
    const scene=new THREE.Scene()

    // 创建长方体
    const box=new THREE.BoxGeometry(10,10,10)


    const obj={
      x:30,
      color:0xff0000
    }

    const material=new THREE.MeshBasicMaterial({
      color:0xff00ff,
    })
    const cube=new THREE.Mesh(box,material)
    cube.position.set(0,0,0)
    scene.add(cube)


    gui.add(obj,'x',-100,100).name('物体X').step(10).onChange((val)=>{
      cube.position.x=val
    })

    gui.addColor(obj,'color').name('光照').onChange((val)=>{
      cube.material.color.set(val)
    })

    //光源
    const light = new THREE.AmbientLight( 0x404040 ) // 柔和的白光
    scene.add(light)




    // 创建相机
    const camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)
    camera.position.set(100,100,100)
    camera.lookAt(0,0,0,)
    scene.add(camera)




    // 创建场景
    const renderer=new THREE.WebGLRenderer({
      antialias:true
    })
    renderer.setSize(window.innerWidth,window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    can?.value.appendChild(renderer.domElement)
    renderer.render(scene,camera)

    const axes=new THREE.AxesHelper(30)
    scene.add(axes)

    function render(){
      renderer.render(scene,camera)
      requestAnimationFrame(render)
    }

    render()

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
