<template>
  <div ref='can'>

  </div>
</template>

<script setup lang='ts'>
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import { onMounted, ref } from 'vue'

  const can = ref<HTMLDivElement>()
// class CustomSinCurve extends THREE.Curve {
//
//   constructor( scale = 1 ) {
//
//     super()
//
//     this.scale = scale
//
//   }
//
//   getPoint( t, optionalTarget = new THREE.Vector3() ) {
//
//     const tx = t * 3 - 1.5
//     const ty = Math.sin( 2 * Math.PI * t )
//     const tz = 0
//     console.log(tx, ty, tz,999)
//     return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.scale )
//   }
//
// }
  onMounted(()=>{

    // 创建场景
    const scene=new THREE.Scene()

    // 创建长方体
    const box=new THREE.BoxGeometry(10,10,10)

    //创建圆柱缓冲几何体
    // const box=new THREE.CylinderGeometry(50,50,10,1000)

    // 圆形缓冲几何体
    // const box=new THREE.CircleGeometry(50,32)

    //管道缓冲几何体
    // const path = new CustomSinCurve( 10 )
    // console.log(path,888)
    // const box = new THREE.TubeGeometry( path, 20, 2, 8, false )

    //平面缓冲几何体
    // const box = new THREE.PlaneGeometry( 1, 1 )

    const material=new THREE.MeshBasicMaterial({
      color:0xff00ff,
      side:THREE.DoubleSide//双面可见
    })
    const cube=new THREE.Mesh(box,material)
    cube.position.set(0,0,0)
    scene.add(cube)

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
