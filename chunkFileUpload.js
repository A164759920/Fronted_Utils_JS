filetoBuffer(file) {
    // 传入的参数为file对象
    return new Promise((resolve, reject) => {
      const fs = new FileReader()
      fs.onload = (e) => {
        resolve(e.target.result)
      }
      fs.readAsArrayBuffer(file)
      fs.onerror = () => {
        reject(new Error("转换Buffer错误"))
      }
    })
  },
  async handleChangeFile(file) {
    const that = this
    const fileObj = file
    // 该部分成功则获取到buffer
    try {
      const buffer = await this.filetoBuffer(fileObj)
      // 对buffer文件进行切片处理
      const chunkSize = 5 * 1024 * 1024 //分片大小 1M
      const chunkList = []
      const chunkListLength = Math.ceil(fileObj.size / chunkSize)
      this.chunkListLength = chunkListLength
      const suffix = /\.([0-9A-z]+)$/.exec(fileObj.name)[1]  //文件后缀名
      // 根据buffer生成hash值 为什么这么做?
      const spark = new SparkMD5.ArrayBuffer()
      spark.append(buffer)
      const hash = spark.end() //生成hash串

      // 生成切片
      let chunkIndex = 0
      for (let i = 0; i < chunkListLength; i++) {
        const item = {
          chunk: fileObj.slice(chunkIndex, chunkIndex + chunkSize),
          fileName: `${hash}_${i}`
        }
        chunkIndex = chunkIndex + chunkSize
        chunkList.push(item)

      }
      // 保存数据
      that.chunkList = chunkList
      that.hash = hash
      that.fileType = suffix

    } catch (error) {
      console.log("handle转换错误", error)
    }
    that.sendUploadRequest()
  },
  sendUploadRequest() {
    const requestList = [] // 请求集合
    const that = this
    this.chunkList.forEach((item, index) => {
      const fn = () => {
        const formData = new FormData()
        formData.append('chunk', item.chunk, item.fileName)
        return axios({
          // url: 'http://124.221.249.177:8898/upload',
          url: 'http://127.0.0.1:8888/upload',
          method: 'post',
          headers: { 'Content-Type': 'multipart/form-data' },
          data: formData
        }).then(res => {
          // console.log("返回的结果", res.data)
          if (res.data.code === 0) { // 成功
            // console.log("切片上传成功")
            if (that.percentCount === 0) {
              //算百分比
              that.percentCount = parseInt((100 / that.chunkList.length).toFixed(0))
              // console.log("0时刻",that.percentCount)
            }
            that.percent = that.percentCount + that.percent
            console.log("当前进度:", that.percent)
            this.chunkList.splice(0, 1) //切掉已经上传的切片
          }
        })
      }
      requestList.push(fn)
    })
    let i = 0 //记录请求发送的个数
    const send = async () => {
      if (i >= requestList.length) {
        // 发送完毕
        const params = {
          hash: this.hash,
          fileType: this.fileType,
          fileLength: this.chunkListLength
        }
        console.log("发送完毕")
        const res = await
          axios.get('http://127.0.0.1:8888/merge', { params })
        // axios.get('http://124.221.249.177:8898/merge', { params })
        if (res.data.code === 0) {
          console.log("merge成功")

        }

      }
      try {
        await requestList[i]()  //执行upload任务
        i++
        send()
      } catch (error) {
        const myError = 0
      }
    }
    send()
  },
  uploadFile() {
    // 
    this.fileObjs.forEach(file => {
      this.handleChangeFile(file)
    })
  },