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

    //region 创建网格模型

    //创建一个空的几何体对象
    const geometry=new THREE.BufferGeometry()
    //添加顶点数据（每个顶点都有数据）
    const vertices=new Float32Array([
     0,0,0,
      0,0,10,
      0,10,10,
      0,10,10,
      0,10,0,
      0,0,0
    ])

    // 用于存储与BufferGeometry相关联的 attribute
    const attribute=new THREE.BufferAttribute(vertices,3)

    //设置几何体的顶点位置属性
    geometry.attributes.position=attribute

    const normals=new Float32Array([
      0,0,1,//顶点法向量
      0,0,1,
      0,0,1,
      0,0,1,
      0,0,1,
      0,0,1,
    ])

    geometry.attributes.normal=new THREE.BufferAttribute(normals,3)

    geometry.scale(2,3,4)
    geometry.translate(20,0,0)
    geometry.rotateX(45)
    const material=new THREE.MeshBasicMaterial({
      color:0xFF0000,
      side:THREE.DoubleSide,//双面可见,
      wireframe:false
    })

    const mesh=new THREE.Mesh(geometry,material)//线



    //endregion


    //region 创建网格模型

    //创建一个空的几何体对象
    // const geometry=new THREE.BufferGeometry()
    // //添加顶点数据
    // const vertices=new Float32Array([
    //   0,0,0,
    //   0,0,10,
    //   0,10,10,
    //   0,10,0,
    // ])
    // // 用于存储与BufferGeometry相关联的 attribute
    // const attribute=new THREE.BufferAttribute(vertices,3)
    //
    // geometry.attributes.position=attribute
    //
    // //类型化数组创建顶点数据
    // const indexes=new Uint16Array(
    //   [0,1,2,2,3,0]
    // )
    //
    // geometry.index=new THREE.BufferAttribute(indexes,1)

    //
    //
    // //设置几何体的顶点位置属性
    //
    //
    // const material=new THREE.MeshBasicMaterial({
    //   color:0xFF0000,
    //   side:THREE.DoubleSide//双面可见
    // })
    //
    // const mesh=new THREE.Mesh(geometry,material)//线



    //endregion


    // 创建场景
    const scene=new THREE.Scene()

    scene.add(mesh)

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
    // render.setPixelRatio(window.devicePixelRatio)
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
