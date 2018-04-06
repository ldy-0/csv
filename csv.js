/**
 * @module csv
 * @author Yuan
 */
 
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');


/**
  * 将input文件夹下的所有csv文件中PM2.5信息复制至outpath文件夹对应csv文件下。
  * @param {String} input 文件夹
  * @param {String} outpath 文件夹
  * @param {String} type 提取类型
  */
function extracts(input, outpath, type){
  let csvFiles;

  if(!fs.existsSync(input)){
    throw new RangeError(`不存在 ${input} 文件夹`);
  }

  fs.readdir(input, (err, files)=>{
    if(err){ return console.log(err); }

    csvFiles = files.filter(function(val, index, arr){
      return path.extname(val) === '.csv' ? true : false;
    });

    csvFiles.map((val, index, arr)=>extract(`${input}/${val}`, `${outpath}/${val}`, type) );
    //
  });
}

/**
  * 从input文件中提取type类型值及标题至outpath文件
  * @param {String} input 文件
  * @param {String} outpath 文件
  * @param {String} type 提取类型
  * @param {Boolean} [single=true] true提取标题，false不提取标题
  */
function extract(input, outpath, type, single = true){
  if (!fs.existsSync(path.dirname(outpath))) {
    fs.mkdirSync(path.dirname(outpath).match(/\/(.+)$/)[1]);
  }

  let ws = fs.createWriteStream(outpath);

  readRow(input, row=>{
    if(row.match(new RegExp(`,${type},`)) || (single ? row.match(/date/g) : false ) ){
      ws.write(row+os.EOL);
    }
  });
}


/**
  * 按行读取文件
  * @param {String} input 文件
  * @param {Function} callback 读取一行后执行的回调函数
  * @param {Function} [done] 读取完毕关闭时执行的回调函数
  */
function readRow(input, callback, done){
  const rl = readline.createInterface({
    input: fs.createReadStream(input),
  });

  rl.on('line', callback);

  rl.on('close', done || function(){ return console.log('close');} );
}


/* @export */
module.exports = exports = {
	extracts,
}