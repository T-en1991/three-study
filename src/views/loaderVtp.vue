<template>
  <div class="box">
    <div class="centerlines">
      <ul class="block" @click="chooseCenterline">
        <li v-for="(item,index) in centerlines" :style="{color:'#'+colors[index].toString(16)}" :data-name="'中心线'+index" :key="index">centerlines{{index+1}}</li>
      </ul>
    </div>
    <div ref="can"></div>
  </div>

</template>

<script lang="ts" setup>
import {nextTick, onMounted, ref} from 'vue'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import vtkXMLPolyDataReader from '@kitware/vtk.js/IO/XML/XMLPolyDataReader'
import {centerlines,colors} from '../common/centerline'
import * as events from "events"

const can = ref<HTMLDivElement>()

const threeState={
  scene: new THREE.Scene(),
  renderer: new THREE.WebGLRenderer({ antialias: true }),
  axesHelper: new THREE.AxesHelper(1),
  camera: new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000),
  groupCenterLine:new THREE.Group()
}
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
  threeState.groupCenterLine.name='中心线组'
  // 生成支架
  await generateSupportMesh()
  // 生成血管
  await generateBloodMesh()

  // 生成中心线
  generateCenterLines()

  // 生成套管
  generateTube()

  // 初始化光源
  initLight()


  // 初始化场景中心
  initSceneCenter()

  // 设置相机位置
  initCameraPosition()
  //初始化渲染器
  threeState.renderer.setSize(window.innerWidth, window.innerHeight)
  can.value?.appendChild(threeState.renderer.domElement)
  initOrbitControls1()
  initAxesHelper()
  await nextTick( ()=>{
    threeState.renderer.render(threeState.scene,threeState.camera)
  })
}

/**
*@author gute
*@Description 2024/5/28:批量创建中心线
*@params
*/
const generateCenterLines=()=>{
  const meshArr: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>[] = []
  for (let i=0;i<centerlines.length;i++){
    // 生成 TubeGeometry
    const tubeGeometry = createTubeGeometryFromPoints(centerlines[i])

    // 创建管道网格
    const tubeMaterial = new THREE.MeshBasicMaterial({ color: colors[i] ,transparent:true,side:THREE.DoubleSide,depthTest:true})

    const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial)
    tubeMesh.renderOrder=9
    tubeMesh.name='中心线'+i
    meshArr.push(tubeMesh)
    threeState.groupCenterLine.add(tubeMesh)
    // 将管道网格添加到场景中
    // threeState.scene.add(tubeMesh)
  }
  threeState.scene.add(threeState.groupCenterLine)
  // raycasterWatch(meshArr)

}

/**
*@author gute
*@Description 2024/5/30:选择中心线
*@params
*/
const chooseCenterline=(e:events)=>{
  console.log(e.target.dataset.name)
  console.log(threeState.scene,876)
  const elements=threeState.scene.children
  const len=elements.length
  for (let i=0;i<len;i++){
    if (elements[i].type==='Group'&&elements[i].name==='中心线组'){
      console.log(elements[i],2)
      const groups=elements[i].children
      const groupsLen=groups.length

      for (let j=0;j<groupsLen;j++){

        console.log(groups[j].name,2233)
        if (e.target.dataset.name===groups[j].name) {
          groups[j].renderOrder=11
          groups[j].material.depthTest=false
        }else{
          groups[j].renderOrder=9
          groups[j].material.depthTest=true
        }
      }
    }
  }

  threeState.renderer.render(threeState.scene,threeState.camera)
}


/**
*@author gute
*@Description 2024/5/28:创建tube体
*@params
*/
const createTubeGeometryFromPoints=(pointsString:number[], tubularSegments = 2000, radius = 0.05, radialSegments = 8, closed = false)=>{
  const points = parsePoints(pointsString)
  const path = createPath(points)
  const tubeGeometry = new THREE.TubeGeometry(path, tubularSegments, radius, radialSegments, closed)

  return tubeGeometry
}

/**
*@author gute
*@Description 2024/5/28:获取点
*@params
*/
const parsePoints=(pointsArray:number[])=> {
  // const pointsArray = pointsString.split(',').map(Number)
  const points = []
  for (let i = 0; i < pointsArray.length; i += 3) {
    points.push(new THREE.Vector3(pointsArray[i], pointsArray[i + 1], pointsArray[i + 2]))
  }
  return points
}

/**
*@author gute
*@Description 2024/5/28:获取路径
*@params
*/
const createPath=(points:any[]) =>{
  const path = new THREE.CatmullRomCurve3(points)
  return path
}

/**
 *@author gute
 *@Description 2024/5/28:控制器
 *@params
 */
const initOrbitControls1=()=>{
  const controls = new OrbitControls(threeState.camera, threeState.renderer.domElement )
  controls.addEventListener('change',function(){
    threeState.renderer.render(threeState.scene,threeState.camera)
  })
}

/**
*@author gute
*@Description 2024/5/28:生成血管
*@params
*/
const generateBloodMesh=async ()=>{
  const reader = vtkXMLPolyDataReader.newInstance()
  await reader.setUrl('/pro/aneurysm_mesh.vtp')
  await reader.loadData()
  const polyData = reader.getOutputData(0)
  // 提取点数据
  const points = polyData.getPoints()
  const pointData = polyData.getPointData()
  const polys=polyData.getPolys()
  const normalsArray = new Float32Array(pointData.getNormals().getData())

  const  connectivity= parsePolysData(polys.getData())
  const connectivityArray= new Uint32Array(connectivity.connectivity)

  // 创建Three.js中的几何体对象
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(points.getData())
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new THREE.BufferAttribute(normalsArray, 3)) // 添加法向量属性
  geometry.setIndex(new THREE.BufferAttribute(connectivityArray, 1)) // 设置多边形的连接性

  const material=new THREE.MeshPhongMaterial({
    side:THREE.DoubleSide,
    transparent:true,
    opacity:0.8,
    color:0x333333,
  })
  // geometry.computeVertexNormals()
  const mesh = new THREE.Mesh(geometry, material)
  mesh.renderOrder=10
  threeState.scene.add(mesh)
}

/**
 *@author gute
 *@Description 2024/5/29:初始化光源
 *@params
 */
const initLight=()=>{
  const light = new THREE.AmbientLight( 0x404040 ) // 柔和的白光
  light.intensity=100
  threeState.scene.add( light )

  const point=new THREE.PointLight(0xffffff,20,0,0)
  point.position.set( sceneCenter.value.x, sceneCenter.value.y,sceneCenter.value.z+100)
  threeState.scene.add(point)


  threeState.scene.add(new THREE.PointLightHelper(point))

}

/**
*@author gute
*@Description 2024/5/28:生成套管
*@params
*/
const generateTube=()=>{
  const tubeLength=parsePoints(centerlines[0])
  // tubeLength.length=420
  const taoguanPoints=tubeLength.slice(100,200+100)
  const taoguanPath=createPath(taoguanPoints)
  const taoguanGeometry = new THREE.TubeGeometry(taoguanPath, 64, 0.6, 8, closed)
// 创建管道网格
  const taoguanMaterial = new THREE.MeshBasicMaterial({ color: colors[0],side:THREE.DoubleSide,transparent:true,opacity:1 })
  const taoguanMesh = new THREE.Mesh(taoguanGeometry, taoguanMaterial)
  threeState.scene.add(taoguanMesh)
}



/**
 *@author gute
 *@Description 2024/5/28:生成支架
 *@params
 */
const generateSupportMesh=async ()=>{
  const reader = vtkXMLPolyDataReader.newInstance()
  await reader.setUrl('/pro/fd_binary.vtp')
  await reader.loadData()
  // 获取VTP数据对象
  const polyData = reader.getOutputData(0)

  // 提取点数据
  const points = polyData.getPoints()
  const pointData = polyData.getPointData()
  const polys=polyData.getPolys()
  const normalsArray = new Float32Array(pointData.getNormals().getData())
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



  const colorArr=[]
  const color1=new THREE.Color(0x0000ff)
  const color2=new THREE.Color(0x00ff00)
  const color3=new THREE.Color(0xff0000)
  for (let i=0;i<gapDistance.length;i++){
    const a= pointData.getArrayByName('gap_distance').getRange()[1]-pointData.getArrayByName('gap_distance').getRange()[0]
    const p=gapDistance[i]/a
    let c=null
    if (p<=0.5){
      c=color1.clone().lerp(color2, p*2)
    }else{
      c=color2.clone().lerp(color3, (p-0.5)*2)
    }
    colorArr.push(c.r,c.g,c.b)
  }
  const colors=new Float32Array(colorArr)

  // 创建Three.js中的网格对象
  const material=new THREE.MeshBasicMaterial({ vertexColors: true})

  // 设置材质
  const mesh = new THREE.Mesh(geometry, material)
  mesh.geometry.attributes.color=new THREE.BufferAttribute(colors,3)
  threeState.scene.add(mesh)


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

/**
*@author gute
*@Description 2024/5/28:将场景的原点移动到模型的中心
*@params
*/
const initSceneCenter=()=>{
  threeState.scene.position.copy(sceneCenter.value).negate()
}
/**
*@author gute
*@Description 2024/5/28:初始化相机
*@params
*/
const initCameraPosition=()=>{
  threeState.camera.position.set(0,0,sceneCenter.value.z+20)
  threeState.camera.lookAt(sceneCenter.value.x,sceneCenter.value.y,sceneCenter.value.z)
}

/**
*@author gute
*@Description 2024/5/28:初始化赋值坐标
*@params
*/
const initAxesHelper=()=>{
  threeState.axesHelper.scale.set(300,300,300)
  threeState.axesHelper.position.set(sceneCenter.value.x,sceneCenter.value.y,sceneCenter.value.z)
  threeState.scene.add(threeState.axesHelper)
}

/**
*@author gute
*@Description 2024/5/30:选择中心线
*@params
*/
const raycasterWatch=(meshArr:THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>[])=>{
  threeState.renderer.domElement.addEventListener('click', function (event) {
    // .offsetY、.offsetX以canvas画布左上角为坐标原点,单位px
    const px = event.offsetX
    const py = event.offsetY
    //屏幕坐标px、py转WebGL标准设备坐标x、y
    //width、height表示canvas画布宽高度
    const x = (px / window.innerWidth) * 2 - 1
    const y = -(py / window.innerHeight) * 2 + 1
    //创建一个射线投射器`Raycaster`
    const raycaster = new THREE.Raycaster()
    //.setFromCamera()计算射线投射器`Raycaster`的射线属性.ray
    // 形象点说就是在点击位置创建一条射线，射线穿过的模型代表选中
    raycaster.setFromCamera(new THREE.Vector2(x, y), threeState.camera)
    //.intersectObjects([mesh1, mesh2, mesh3])对参数中的网格模型对象进行射线交叉计算
    // 未选中对象返回空数组[],选中一个对象，数组1个元素，选中两个对象，数组两个元素
    const intersects = raycaster.intersectObjects(meshArr)
    console.log("射线器返回的对象", intersects)
    // intersects.length大于0说明，说明选中了模型
    if (intersects.length > 0) {
      // 选中模型的第一个模型，设置为红色
      intersects[0].object.renderOrder=11
      intersects[0].object.material.depthTest=false
    }
    threeState.renderer.render(threeState.scene,threeState.camera)
  })
}

</script>

<style scoped lang="less">
.box{
  position: relative;
  top:0;
  left: 0;
  .centerlines{
    position: absolute;
    top:200px;
    left: 0;
    .block{
      cursor: pointer;
    }
  }
}

</style>

