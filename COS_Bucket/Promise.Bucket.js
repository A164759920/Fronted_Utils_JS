const Bucket = "test-1313270013";
const Region = "ap-nanjing";

// Promise异步封装存储桶工具函数
const COS = require("cos-js-sdk-v5");
var cos = new COS({
  // getAuthorization 必选参数
  getAuthorization: function (options, callback) {
    // 异步获取临时密钥
    // 服务端 JS 和 PHP 例子：https://github.com/tencentyun/cos-js-sdk-v5/blob/master/server/
    // 服务端其他语言参考 COS STS SDK ：https://github.com/tencentyun/qcloud-cos-sts-sdk
    // STS 详细文档指引看：https://cloud.tencent.com/document/product/436/14048

    var url = "http://127.0.0.1:8888/sts"; // url替换成您自己的后端服务
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = function (e) {
      try {
        var data = JSON.parse(e.target.responseText);
        // console.log(data);
        var credentials = data.data.credentials;
      } catch (e) {
        // console.log(e);
      }
      if (!data || !credentials) {
        return console.error(
          "credentials invalid:\n" + JSON.stringify(data, null, 2)
        );
      }
      callback({
        TmpSecretId: credentials.tmpSecretId,
        TmpSecretKey: credentials.tmpSecretKey,
        SecurityToken: credentials.sessionToken,
        // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
        StartTime: data.data.startTime, // 时间戳，单位秒，如：1580000000
        ExpiredTime: data.data.expiredTime, // 时间戳，单位秒，如：1580000000
      });
    };
    xhr.send();
  },
});

/**
 * 字符串分割获取文件后缀
 * @param {String} fileName
 * @returns {String} 文件类型
 */
function getTypeByfileName(fileName) {
  const fileType = fileName.split(".").slice(-1).toLowerCase();
  console.log("文件类型", fileType);
  return fileType;
}

/**
 * 异步封装 获取存储桶列表
 * @param {String} Prefix
 * @returns {Promise}  resolve 存储桶数据
 */
function COS_getBucket(Prefix) {
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
function COS_getObjectUrl(fileKey) {
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
async function getURLbyBucketKey( Prefix) {
  try {
    const KeyList = await COS_getBucket(Prefix);
    const asyncTask = [];
    // 工厂创建获取URL的promise
    KeyList.forEach((item) => {
      if (item.Size !== "0") {
        const aTask = COS_getObjectUrl(item.Key);
        asyncTask.push(aTask);
      }
    });
    try {
      const res = await Promise.allSettled(asyncTask);
      if (res) {
        const urlList = [];
        res.forEach((item) => {
          if (item.value) {
            urlList.push(item.value);
          }
        });
        return urlList;
      }
      // const res = await Promise.all(asyncTask)
      // if (res) {
      //   return res
      // }
    } catch (error) {
      console.log(error);
      return error;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
}

export {
  getURLbyBucketKey,
  COS_getBucket,
  COS_getObjectUrl,
  getTypeByfileName,
  Bucket,
  Region,
};
