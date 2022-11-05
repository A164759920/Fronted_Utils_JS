// 腾讯云存储参考示例
// 前后端加密鉴权

/**假设后端返回数据如下 */
{
    data: {
        credentials: {
            tmpSecretId,
            tmpSecretKey,
            sessionToken
        }
        StartTime,
        ExpiredTime
    }
}


var cos = new COS({
    // getAuthorization 必选参数
    getAuthorization: function (options, callback) {
      // 异步获取临时密钥
      // 服务端 JS 和 PHP 例子：https://github.com/tencentyun/cos-js-sdk-v5/blob/master/server/
      // 服务端其他语言参考 COS STS SDK ：https://github.com/tencentyun/qcloud-cos-sts-sdk
      // STS 详细文档指引看：https://cloud.tencent.com/document/product/436/14048

      var url = 'http://127.0.0.1:8888/sts'; // url替换成您自己的后端服务
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onload = function (e) {
        try {
          var data = JSON.parse(e.target.responseText);
          console.log(data)
          var credentials = data.data.credentials;
        } catch (e) {
          console.log(e)
        }
        if (!data || !credentials) {
          return console.error('credentials invalid:\n' + JSON.stringify(data, null, 2))
        }
        callback({
          TmpSecretId: credentials.tmpSecretId,
          TmpSecretKey: credentials.tmpSecretKey,
          SecurityToken: credentials.sessionToken,
          // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
          StartTime: data.data.startTime, // 时间戳，单位秒，如：1580000000
          ExpiredTime: data.data.expiredTime, // 时间戳，单位秒，如：1580000000
        })
      }
      xhr.send()
    }
  });
  const file = e.target.files && e.target.files[0]
  cos.putObject({
    Bucket,
    Region,
    Key: "1.jpg",
    Body: file,
    SliceSize: 5 * 1024 * 1024
  }, (err, data) => {
    console.log("错误",err)
    console.log("数据",data)
  })
},