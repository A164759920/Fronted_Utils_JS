# 微信小程序仿 Vue 实现事件监听器 转载

**✅ 实现跨页面的事件通信**

## 用法:

- **子页面-emit**
<code>
event.$emit({
name:'监听事件名称',
data:上报的数据,})
</code>

- **主页面-on**

<code>
event.$on({
    name:"监听事件名称",
    tg:this, // 目标对象，设置this即表示当前页面
    success:()=>{
        TODO:成功的回调
    }
})
</code>
