<template>
  <div ref="can"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import vtkXMLPolyDataReader from '@kitware/vtk.js/IO/XML/XMLPolyDataReader'

const can = ref<HTMLDivElement>()

onMounted(() => {
  //创建场景
  const scene = new THREE.Scene()


  // 创建XML读取器，加载VTP文件，创建物体
  const reader = vtkXMLPolyDataReader.newInstance()
  reader.setUrl('/mesh.vtp').then(() => {
    reader.loadData().then(() => {
      // 获取VTP数据对象
      const polyData = reader.getOutputData(0)

      // 提取点数据
      const points = polyData.getPoints()
      const pointData = polyData.getPointData()
      const polys=polyData.getPolys()
      const normalsArray = new Float32Array(pointData.getNormals())
      const  { connectivity, offsets } = parsePolysData(polys.getData())
      const connectivityArray= new Uint32Array(connectivity)
      // const offsetsArray=new Uint32Array(offsets)



      // 创建Three.js中的几何体对象
      const geometry = new THREE.BufferGeometry()
      const positions = new Float32Array(points.getData())



      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('normal', new THREE.BufferAttribute(normalsArray, 3)) // 添加法向量属性
      geometry.setIndex(new THREE.BufferAttribute(connectivityArray, 1)) // 设置多边形的连接性
      // geometry.setAttribute('offset', new THREE.BufferAttribute(offsetsArray, 3)) // 设置偏移信息

      // 创建Three.js中的网格对象
      const material=new THREE.MeshBasicMaterial(
        {
          transparent:true,
          opacity:1
        }
      )

      // 设置材质
      const mesh = new THREE.Mesh(geometry, material)

      // 计算模型的中心
      geometry.computeBoundingBox()
      const center = new THREE.Vector3()
      geometry.boundingBox.getCenter(center)
      // 将场景的原点移动到模型的中心
      scene.position.copy(center).negate()
      // 将网格对象添加到场景中
      scene.add(mesh)

      // 添加辅助坐标系
      const axesHelper=new THREE.AxesHelper(300)
      axesHelper.position.set(center.x,center.y,center.z)
      scene.add(axesHelper)


      // 创建相机
      const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
      camera.position.set(0,0,center.z)
      camera.lookAt(center.x,center.y,center.z)

      //创建渲染器
      const renderer = new THREE.WebGLRenderer({
        logarithmicDepthBuffer: true
      })
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
  })



})

const parsePolysData=(polysData:Array<number>)=> {
  let connectivity = []
  let offsets = []
  let index = 0
  let mid=0
  while (index < polysData.length) {
    const numVertices = polysData[index]
    offsets.push(numVertices+mid)
    for (let i = 0; i < numVertices; i++) {
      connectivity.push(polysData[index + i + 1])
    }
    mid+=3
    index += numVertices + 1
  }

  return { connectivity, offsets }
}
</script>

<style scoped></style>

