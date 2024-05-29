<template>
  <div class="box">
    <div ref="can"></div>
  </div>

</template>

<script lang="ts" setup>
import {nextTick, onMounted, ref} from 'vue'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import vtkXMLPolyDataReader from '@kitware/vtk.js/IO/XML/XMLPolyDataReader'
import {centerline1,centerline2,colors} from '../common/centerline'

const can = ref<HTMLDivElement>()
const lines=[centerline1,centerline2]

const threeState={
  scene: new THREE.Scene(),
  renderer: new THREE.WebGLRenderer({ antialias: true }),
  axesHelper: new THREE.AxesHelper(1),
  camera: new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
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
  // 生成支架
  const supportMesh= await generateSupportMesh()
  // 生成血管
  const bloodMesh= await generateBloodMesh()

  // 生成中心线
  generateCenterLines()

  // 生成套管
  generateTube()

  // 初始化场景中心
  initSceneCenter()
  // 将网格对象添加到场景中
  threeState.scene.add(supportMesh)
  threeState.scene.add(bloodMesh)
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
  const meshArr=[]
  for (let i=0;i<lines.length;i++){
    // 生成 TubeGeometry
    const tubeGeometry = createTubeGeometryFromPoints(lines[i])

    // 创建管道网格
    const tubeMaterial = new THREE.MeshBasicMaterial({ color: colors[i] ,transparent:true,opacity:0.5})
    const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial)
    meshArr.push(tubeMesh)
    // 将管道网格添加到场景中
    threeState.scene.add(tubeMesh)
  }
  raycasterWatch(meshArr)
}

/**
*@author gute
*@Description 2024/5/28:创建tube体
*@params
*/
const createTubeGeometryFromPoints=(pointsString:string, tubularSegments = 64, radius = 0.05, radialSegments = 8, closed = false)=>{
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
const parsePoints=(pointsString:string)=> {
  const pointsArray = pointsString.split(',').map(Number)
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
  await reader.setUrl('/pro/mesh.vtp')
  await reader.loadData()
  const polyData = reader.getOutputData(0)
  // 提取点数据
  const points = polyData.getPoints()
  const pointData = polyData.getPointData()
  const polys=polyData.getPolys()
  const normalsArray = new Float32Array(pointData.getNormals())
  const  connectivity= parsePolysData(polys.getData())
  const connectivityArray= new Uint32Array(connectivity.connectivity)

  // 创建Three.js中的几何体对象
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(points.getData())

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new THREE.BufferAttribute(normalsArray, 3)) // 添加法向量属性
  geometry.setIndex(new THREE.BufferAttribute(connectivityArray, 1)) // 设置多边形的连接性
  //region 这是线的
  // 创建Three.js中的网格对象
  // const material=new THREE.LineBasicMaterial(
  //     {
  //       transparent:true,
  //       linewidth:1,
  //       opacity:0.25,
  //     }
  // )
  // // 设置材质
  // const mesh = new THREE.LineSegments(new THREE.WireframeGeometry(geometry), material)

  //endregion

  // // //region  这是面的
  const material=new THREE.MeshStandardMaterial(
    {
      transparent:true,
      opacity:0.51,
      color:0xffffff,
      depthWrite:false
    }
  )
  // 设置材质
  const mesh = new THREE.Mesh(geometry, material)

  // // //endregion

  return mesh
}

/**
*@author gute
*@Description 2024/5/28:生成套管
*@params
*/
const generateTube=()=>{
  const a=parsePoints(lines[0])
  a.length=420
  const taoguanPoints=a
  const taoguanPath=createPath(taoguanPoints)
  const taoguanGeometry = new THREE.TubeGeometry(taoguanPath, 64, 0.6, 8, closed)
// 创建管道网格
  const taoguanMaterial = new THREE.MeshBasicMaterial({ color: colors[0],side:THREE.DoubleSide,transparent:true,opacity:0.5 })
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

const raycasterWatch=(meshArr:[])=>{
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
      // intersects[0].object.material.color.set(0xfff000)
      intersects[0].object.material.opacity=1
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
  .center-line{
    position: absolute;
    top:200px;
    left: 0;

  }
}

</style>

