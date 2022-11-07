# 封装存储桶函数 ESM 导出

## 说明

    COS_前缀是对原SDK的promise封装
    非COS_前缀是根据业务逻辑的封装

- 推荐用法:
  导入：import \* as \_COS from "Promise.Bucket.js 的路径"

  示例使用：\_COS.COS_getBucketget()
