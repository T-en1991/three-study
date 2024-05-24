<script setup lang="ts">
import {  useRouter } from 'vue-router'
import {  ref } from 'vue'

const router=useRouter()
const options=ref([
  {
    label:'study1',
    value:'study1'
  },{
    label:'stats性能监视器',
    value:'stats'
  },
  {
    label:'animationFrame',
    value:'animationFrame'
  },{
    label:'队列立体和相机适配体验',
    value:'队列立体和相机适配体验'
  },
  {
    label:'各种体',
    value:'各种体'
  },{
    label:'DatGui',
    value:'DatGui'
  },
  {
    label:'顶点和点模型',
    value:'顶点和点模型'
  },{
    label:'线模型渲染顶点数据',
    value:'线模型渲染顶点数据'
  },
  {
    label:'网格模型渲染顶点数据',
    value:'网格模型渲染顶点数据'
  },
  {
    label:'创建纹理贴图',
    value:'创建纹理贴图'
  },
  {
    label:'loaderGltf',
    value:'loaderGltf'
  },
  {
    label:'loaderStl',
    value:'loaderStl'
  },  {
    label:'loaderVtp',
    value:'loaderVtp'
  },
  {
    label:'loaderVtpMesh',
    value:'loaderVtpMesh'
  },
])
const select=ref('animationFrame')
const handleChange=()=>{
  router.push("/"+select.value)
}
</script>

<template>
      <nav>
        <select @change='handleChange' v-model='select'>
          <option v-for='item in options' :key='item.value' :value='item.value'>
            {{item.label}}
          </option>
        </select>
      </nav>

  <RouterView />
</template>

<style scoped>
nav{
  text-align: center;
}
</style>
