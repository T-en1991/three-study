<template>
  <div class="box">
    <div ref="can"></div>
  </div>

</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import vtkXMLPolyDataReader from '@kitware/vtk.js/IO/XML/XMLPolyDataReader'

const can = ref<HTMLDivElement>()
const scene = ref<THREE.Scene>(new THREE.Scene())
const renderer = ref<THREE.WebGLRenderer>(new THREE.WebGLRenderer({ antialias: true }))
const axesHelper = ref<THREE.AxesHelper>(new THREE.AxesHelper(300))
const camera = ref<THREE.PerspectiveCamera>(new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000))
const sceneCenter=ref<THREE.Vector3>(new THREE.Vector3(0,0,0))

onMounted( () => {
  init()
})
/**
 *@author gute
 *@Description 2024/5/28:初始化函数
 *@params
 */
const init=async ()=>{

  // axesHelper.value.scale.set(300,300,300)
  // axesHelper.value.position.set(0,0,0)
  console.log(renderer.value,111)
  // const supportMesh= await generateSupportMesh()
  const reader = vtkXMLPolyDataReader.newInstance()
  await reader.setUrl('/pro/fd.vtp')
  await reader.loadData()
  // 获取VTP数据对象
  const polyData = reader.getOutputData(0)
  // 提取点数据
  const points = polyData.getPoints()
  const pointData = polyData.getPointData()
  const polys=polyData.getPolys()
  const normalsArray = new Float32Array(pointData.getNormals())
  const  connectivity = parsePolysData(polys.getData())
  const connectivityArray= new Uint32Array(connectivity.connectivity)

  const gapDistance=pointData.getArrayByName('gap_distance').getData()
  // const metalCoverageRatio=pointData.getArrayByName('metal_coverage_ratio').getData()
  // const poreDensity=pointData.getArrayByName('pore_density').getData()

  //创建Three.js中的几何体对象
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(points.getData())

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new THREE.BufferAttribute(normalsArray, 3)) // 添加法向量属性
  geometry.setIndex(new THREE.BufferAttribute(connectivityArray, 1)) // 设置多边形的连接性
  // geometry.setAttribute('offset', new THREE.BufferAttribute(offsetsArray, 3)) // 设置偏移信息

  // 计算模型的中心
  geometry.computeBoundingBox()
  sceneCenter.value = new THREE.Vector3()
  console.log(sceneCenter.value,0)
  geometry.boundingBox.getCenter(sceneCenter.value)

  // 创建Three.js中的网格对象
  const material=new THREE.MeshBasicMaterial()

  const supportMesh = new THREE.Mesh(geometry, material)



  console.log(supportMesh,22)
  // 将场景的原点移动到模型的中心
  scene.value.position.copy(sceneCenter.value).negate()
  // 将网格对象添加到场景中
  scene.value.add(supportMesh)
  camera.value.position.set(0,0,sceneCenter.value.z+20)
  camera.value.lookAt(sceneCenter.value.x,sceneCenter.value.y,sceneCenter.value.z)

  renderer.value.setSize(window.innerWidth, window.innerHeight)
  can.value?.appendChild(renderer.value.domElement)
  console.log(scene.value,camera.value,renderer.value,sceneCenter.value,333)

  setTimeout(()=>{
    renderer.value.render(scene.value,camera.value)

  },1000)
  // orbitControls1()
}

/**
*@author gute
*@Description 2024/5/28:控制器
*@params
*/
const orbitControls1=()=>{
  const controls = new OrbitControls(camera.value, renderer.value.domElement )
  controls.addEventListener('change',function(){
    renderer.value.render(scene.value,camera.value)
  })
}

/**
*@author gute
*@Description 2024/5/28:生成支架
*@params
*/
const generateSupportMesh=async ()=>{
  const reader = vtkXMLPolyDataReader.newInstance()
  await reader.setUrl('/pro/fd.vtp')
  await reader.loadData()
  // 获取VTP数据对象
  const polyData = reader.getOutputData(0)
  // 提取点数据
  const points = polyData.getPoints()
  const pointData = polyData.getPointData()
  const polys=polyData.getPolys()
  const normalsArray = new Float32Array(pointData.getNormals())
  const  connectivity = parsePolysData(polys.getData())
  const connectivityArray= new Uint32Array(connectivity.connectivity)

  const gapDistance=pointData.getArrayByName('gap_distance').getData()
  // const metalCoverageRatio=pointData.getArrayByName('metal_coverage_ratio').getData()
  // const poreDensity=pointData.getArrayByName('pore_density').getData()

      //创建Three.js中的几何体对象
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(points.getData())

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new THREE.BufferAttribute(normalsArray, 3)) // 添加法向量属性
  geometry.setIndex(new THREE.BufferAttribute(connectivityArray, 1)) // 设置多边形的连接性
  // geometry.setAttribute('offset', new THREE.BufferAttribute(offsetsArray, 3)) // 设置偏移信息

  // 计算模型的中心
  geometry.computeBoundingBox()
  sceneCenter.value = new THREE.Vector3()
  console.log(sceneCenter.value,0)
  geometry.boundingBox.getCenter(sceneCenter.value)

  // 创建Three.js中的网格对象
  const material=new THREE.MeshBasicMaterial()

  // 设置材质
  const mesh = new THREE.Mesh(geometry, material)

  return mesh


}

/**
*@author gute
*@Description 2024/5/28:解析polysData数据，获得链接信息
*@params
 * polysData：数据
*/
const parsePolysData=(polysData:Array<number>)=> {
  let connectivity = []
  // let offsets = []
  let index = 0
  let mid=0
  while (index < polysData.length) {
    const numVertices = polysData[index]
    // offsets.push(numVertices+mid)
    for (let i = 0; i < numVertices; i++) {
      connectivity.push(polysData[index + i + 1])
    }
    mid+=3
    index += numVertices + 1
  }

  return { connectivity }
}

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

