// Promise异步封装存储桶工具函数

/**
 * 异步封装 获取存储桶列表
 * @param {String} Prefix
 * @returns {Promise}  resolve 存储桶数据
 */
function COS_getBucket(Bucket, Region, Prefix) {
  return new Promise((resolve, reject) => {
    cos.getBucket(
      {
        Bucket,
        Region,
        Prefix,
      },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          // 获取列表
          resolve(data.Contents);
        }
      }
    );
  });
}

/**
 * 根据存储对象Key返回对应的URL
 * @param {String} fileKey
 * @returns {Promise} resolve 可访问URL
 */
function COS_getObjectUrl(Bucket, Region, fileKey) {
  return new Promise((resolve, reject) => {
    cos.getObjectUrl(
      {
        Bucket,
        Region,
        Key: fileKey,
      },
      (err, data) => {
        if (err) {
          // console.log("获取URL失败", err)
          reject(err);
        } else {
          resolve(data.Url);
        }
      }
    );
  });
}

/**
 * 根据参数获取指定前缀文件夹下的存储对象URL
 * @param {String} Bucket  存储桶名称
 * @param {String} Region  存储桶地域
 * @param {查询前缀} Prefix
 * @returns {Array} 文件URL数组
 */
async function getURLbyBucketKey(Bucket, Region, Prefix) {
  // 配置参数
  try {
    const filesUrl = [];
    const KeyList = await COS_getBucket(Bucket, Region, Prefix);
    if (KeyList.length > 0) {
      KeyList.forEach(async (item) => {
        if (item.Size !== "0") {
          const fileUrl = await COS_getObjectUrl(Bucket, Region, item.Key);
          filesUrl.push(fileUrl);
        }
      });
    }
    return filesUrl;
  } catch (error) {
    console.log(error);
  }
}
