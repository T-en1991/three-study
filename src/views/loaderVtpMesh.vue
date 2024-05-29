<template>
  <div class="box">
    <ul class="center-line" @click="chooseLine">
      <li style="color: #8fd3f4" data-name="first">中心线1</li>
      <li style="color: #f68084" data-name="second">中心线2</li>
    </ul>
    <div ref="can"></div>
  </div>

</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import vtkXMLPolyDataReader from '@kitware/vtk.js/IO/XML/XMLPolyDataReader'
import {centerline2,centerline1} from '../common/centerline'


const can = ref<HTMLDivElement>()
const scene=ref<THREE.Scene>()

onMounted(async () => {

  const scene = new THREE.Scene()

  //region 这是中心线
// 定义管道路径tube0
  // 将字符串解析为点数组
  function parsePoints(pointsString:string) {
    const pointsArray = pointsString.split(',').map(Number)
    const points = []
    for (let i = 0; i < pointsArray.length; i += 3) {
      points.push(new THREE.Vector3(pointsArray[i], pointsArray[i + 1], pointsArray[i + 2]))
    }
    return points
  }

  // 创建路径
  function createPath(points:any[]) {
    const path = new THREE.CatmullRomCurve3(points)
    return path
  }

  // 创建管道几何体
  function createTubeGeometryFromPoints(pointsString:string, tubularSegments = 64, radius = 0.05, radialSegments = 8, closed = false) {
    const points = parsePoints(pointsString)
    const path = createPath(points)
    const tubeGeometry = new THREE.TubeGeometry(path, tubularSegments, radius, radialSegments, closed)
    return tubeGeometry
  }

  // 生成 TubeGeometry
  const tubeGeometry = createTubeGeometryFromPoints(centerline2)

// 创建管道网格
  const tubeMaterial = new THREE.MeshBasicMaterial({ color: 0x8fd3f4 ,transparent:true,opacity:0.5})
  const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial)

// 将管道网格添加到场景中
  scene.add(tubeMesh)


  //套管0

  const a=parsePoints(centerline2)
  a.length=420
  const taoguanPoints=a
  const taoguanPath=createPath(taoguanPoints)
  const taoguanGeometry = new THREE.TubeGeometry(taoguanPath, 64, 0.6, 8, closed)
// 创建管道网格
  const taoguanMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000,side:THREE.DoubleSide,transparent:true,opacity:0.5 })
  const taoguanMesh = new THREE.Mesh(taoguanGeometry, taoguanMaterial)
  scene.add(taoguanMesh)


  //这是中心线tube1
  // 生成 TubeGeometry
  const tubeGeometry1 = createTubeGeometryFromPoints(centerline1)

// 创建管道网格
  const tubeMaterial1 = new THREE.MeshBasicMaterial({ color: 0xf68084,transparent:true,opacity:0.5 })
  const tubeMesh1 = new THREE.Mesh(tubeGeometry1, tubeMaterial1)

// 将管道网格添加到场景中
  scene.add(tubeMesh1)

  //endregion


  //region 这是血管mesh
  const reader1 = vtkXMLPolyDataReader.newInstance()
  await reader1.setUrl('/pro/mesh.vtp')
  await reader1.loadData()
  const polyData1 = reader1.getOutputData(0)
  // 提取点数据
  const points1 = polyData1.getPoints()
  const pointData1 = polyData1.getPointData()
  const polys1=polyData1.getPolys()
  const normalsArray1 = new Float32Array(pointData1.getNormals())
  const  connectivity1= parsePolysData(polys1.getData())
  const connectivityArray1= new Uint32Array(connectivity1.connectivity)

  // 创建Three.js中的几何体对象
  const geometry1 = new THREE.BufferGeometry()
  const positions1 = new Float32Array(points1.getData())



  geometry1.setAttribute('position', new THREE.BufferAttribute(positions1, 3))
  geometry1.setAttribute('normal', new THREE.BufferAttribute(normalsArray1, 3)) // 添加法向量属性
  geometry1.setIndex(new THREE.BufferAttribute(connectivityArray1, 1)) // 设置多边形的连接性



  //region 这是线的
  // 创建Three.js中的网格对象
  const material1=new THREE.LineBasicMaterial(
      {
        transparent:true,
        linewidth:1,
        opacity:0.25,
      }
  )
  // 设置材质
  const mesh1 = new THREE.LineSegments(new THREE.WireframeGeometry(geometry1), material1)

  scene.add(mesh1)
  //endregion

  // // //region  这是面的
  // const material1=new THREE.MeshBasicMaterial(
  //   {
  //     transparent:true,
  //     opacity:0.51,
  //     depthWrite:false
  //   }
  // )
  // // 设置材质
  // const mesh1 = new THREE.Mesh(geometry1, material1)

  // // 将网格对象添加到场景中
  // scene.add(mesh1)
  // // //endregion


//endregion

  //region 这是支架mesh
  // 创建XML读取器，加载VTP文件，创建物体
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

  // 创建Three.js中的几何体对象
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(points.getData())



  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new THREE.BufferAttribute(normalsArray, 3)) // 添加法向量属性
  geometry.setIndex(new THREE.BufferAttribute(connectivityArray, 1)) // 设置多边形的连接性
  // geometry.setAttribute('offset', new THREE.BufferAttribute(offsetsArray, 3)) // 设置偏移信息

  // 创建Three.js中的网格对象
  const material=new THREE.MeshBasicMaterial(
      { vertexColors: true}
  )

  // 设置材质
  const mesh = new THREE.Mesh(geometry, material)
  mesh.geometry.attributes.color=new THREE.BufferAttribute(colors,3)

  // 计算模型的中心
  geometry.computeBoundingBox()
  const center = new THREE.Vector3()
  console.log(center,0)
  geometry.boundingBox.getCenter(center)
  // 将场景的原点移动到模型的中心
  scene.position.copy(center).negate()
  // 将网格对象添加到场景中
  scene.add(mesh)


  //endregion

  // 添加辅助坐标系
  const axesHelper=new THREE.AxesHelper(300)
  axesHelper.position.set(center.x,center.y,center.z)
  scene.add(axesHelper)


  // 创建相机
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0,0,center.z+20)
  camera.lookAt(center.x,center.y,center.z)

  //创建渲染器
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  can.value?.appendChild(renderer.domElement)
  setTimeout(()=>{
    renderer.render(scene,camera)

  })
  const controls = new OrbitControls( camera, renderer.domElement )

  controls.addEventListener('change',function(){
    renderer.render(scene,camera)
  })


  renderer.domElement.addEventListener('click', function (event) {
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
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera)
    //.intersectObjects([mesh1, mesh2, mesh3])对参数中的网格模型对象进行射线交叉计算
    // 未选中对象返回空数组[],选中一个对象，数组1个元素，选中两个对象，数组两个元素
    const intersects = raycaster.intersectObjects([tubeMesh, tubeMesh1])
    console.log("射线器返回的对象", intersects)
    // intersects.length大于0说明，说明选中了模型
    if (intersects.length > 0) {
      // 选中模型的第一个模型，设置为红色
      // intersects[0].object.material.color.set(0xfff000)
      intersects[0].object.material.opacity=1
    }
    renderer.render(scene,camera)
  })


})

const chooseLine=(e:any)=>{
  console.log(e.target.getAttribute('data-name'))
}

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

