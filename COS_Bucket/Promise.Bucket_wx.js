/**
 * Written by SCY 23/03/11
 * promise风格 微信小程序内调用腾讯云存储桶
 */
const Bucket = "test-1313270013"; // 存储桶名称
const Region = "ap-nanjing"; // 存储桶地区
const AuthUrl = "http://127.0.0.1:8888/sts"; // 后端鉴权接口

// Promise异步封装存储桶工具函数
var COS = require("cos-wx-sdk-v5");
var cos = new COS({
  SimpleUploadMethod: "putObject",
  getAuthorization: function (options, callback) {
    wx.request({
      url: AuthUrl,
      data: {
        // 可从 options 取需要的参数
      },
      success: function (result) {
        var data = result.data.data;
        var credentials = data && data.credentials;
        if (!data || !credentials) return console.error("credentials invalid");
        callback({
          TmpSecretId: credentials.tmpSecretId,
          TmpSecretKey: credentials.tmpSecretKey,
          SecurityToken: credentials.sessionToken,
          StartTime: data.startTime,
          ExpiredTime: data.expiredTime,
        });
      },
    });
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
        Sign: false,
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
 * @param {查询前缀} Prefix
 * @returns {Array} 文件URL数组
 */
async function getURLbyBucketKey(Prefix) {
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

module.exports = {
  getURLbyBucketKey,
  COS_getBucket,
  COS_getObjectUrl,
  getTypeByfileName,
  Bucket,
  Region,
};
