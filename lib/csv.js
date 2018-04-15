/**
 * @module csv
 * @author Yuan
 */
 
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');
const math = require('math');

/**
 *
 * 计算文件每行/列平均值
 *
 * @param {String} input
 * @param {WriteStream} ws
 * @param {String} [type='row']
 */
 function average(input, ws, type = 'row'){
	toArray(input).then(arr=>{
		if(type === 'row'){
			return arr.forEach(v=>/date/.test(v) ? void(0) : ws.write(`${v.slice(0,3)},${math.average(math.toNumber(v.slice(3)), 'row')}${os.EOL}`));
		}else if(type === 'column'){
			return ws.write(`${arr[0]}${os.EOL}${math.average(arr, 'column')}${os.EOL}`);
		}
		
	}).catch(err => console.log(err));
}

/**
 * FIXME: input folders -> file
 * 将input文件夹下的所有csv文件中包含type的行复制至output文件夹下。
 * 
 * @param {String} input  file folders path
 * @param {String} output flie folders path
 * @param {String} type 	extract keyword
 */
function extracts(input, output, type, done){
  let csvFiles;

  if(!fs.existsSync(input)){
    throw new RangeError(`${input} folders do not exist`);
  }

  fs.readdir(input, (err, files)=>{
    if(err){ return console.log(err); }

    csvFiles = files.filter(v => path.extname(v) === '.csv' ? true : false);

    csvFiles.map(val => extract(`${input}/${val}`, `${output}/${val}`, type, true, done));
  });
}

/**
 *
 * 从input文件中提取包含type值行(标题)至output文件
 *
 * @param {String} input 					file path
 * @param {String} output 				file path
 * @param {String} keyword 				extract keyword
 * @param {Boolean} [single=true] true提取标题，false不提取标题
 */
function extract(input, output, keyword, single = true, done){
  if (!fs.existsSync(path.dirname(output))) {
		fs.mkdirSync(path.dirname(output));
  }

  let ws = fs.createWriteStream(output);

  readRow(input, row=>{
    if(row.match(new RegExp(`,${keyword},`)) || (single ? row.match(/date/g) : false ) ){
      ws.write(row+os.EOL);
    }
		
  }, done);
	
}

/**
 *
 * Convert the content of csv file to array/csv文件内容转为数组
 *
 * @param {String} input file path
 * @return {Promise}
 */
 function toArray(input){
	 let arr = [];
	 
	 return new Promise((resolve, reject)=>{
		 readRow(input, row => arr.push(row.split(',')), () => resolve(arr));
	 });
 }

/**
 *
 * Read the content of each line of the csv file/读取csv文件每行内容
 *
 * @param {String} input 			file path
 * @param {Function} callback read an line and execte
 * @param {Function} [done] 	读取完毕关闭时执行的回调函数
 */
function readRow(input, callback, done){
  const rl = readline.createInterface({
    input: fs.createReadStream(input),
  });

  rl.on('line', callback);

  rl.on('close', done || function(){ return console.log('close');} );
}

/********************* @private *****************************/


/* @export */
module.exports = exports = {
	readRow,
	toArray,
	extract,
	extracts,
	average,
}