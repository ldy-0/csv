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
 * @param {String} input        file path
 * @param {WriteStream} ws      write stream
 * @param {String} [type='row'] average type
 * @param {Number} [start=0]    start position
 * @param {Function} done       callback
 */
 function average(input, ws, type = 'row', start = 0, done){
	toArray(input).then(arr => {
		if(type === 'row'){
			
			return arr.forEach(v => {
				if(/date/.test(v))
					return ;
				
				ws.write(`${v.slice(0, start)},${math.average(v,'row',start)}${os.EOL}`);
			});
			
		}else if(type === 'column'){
			
			return ws.write(`${arr[0]}${os.EOL}${math.average(arr,'column')}${os.EOL}`);
			
		}
		
	}).then(() => typeof done === 'function' ? done() : void(0) ).catch(err => console.log(err));
}

/**
 *
 * 将input文件夹下的所有csv文件中包含type的行复制至output文件或文件夹下。
 * 
 * @param {String} input    file folders path
 * @param {String} output   flie folders/file path
 * @param {String} type 	  extract keyword
 * @param {Function} [done] callback
 */
function extracts(input, output, type, done){
  let csvFiles;

  if(!fs.existsSync(input))
    throw new RangeError(`${input} folders do not exist`);

  fs.readdir(input, (err, files)=>{
    if(err){ return console.log(err); }

    csvFiles = files.filter(v => path.extname(v) === '.csv' ? true : false);
    // output is file
		let ws = fs.createWriteStream(output, { flags: 'a' });
		
		Promise.all(csvFiles.map(val => new Promise((resolve, reject)=>{
			if(path.extname(output) === '.csv'){
				return extract(`${input}/${val}`, ws, type, true, resolve);
			}
			
			extract(`${input}/${val}`, `${output}/${val}`, type, true, resolve);
			
		}))).then(v => typeof done === 'function' ? done() : void(0) );
		
  });
}

/**
 *
 * 从input文件中提取包含type值行(标题)至output文件
 *
 * @param {String} input 							input file path
 * @param {String|WriteStream} output output file path or write stream
 * @param {String} keyword 						extract keyword
 * @param {Boolean} [single=true] 		true提取标题，false不提取标题
 * @param {Function} [done]           callback
 */
function extract(input, output, keyword, single = true, done){
  if(typeof output === 'string' && !fs.existsSync(path.dirname(output))){
		fs.mkdirSync(path.dirname(output));
  }

  let ws = output.write ? output : fs.createWriteStream(output);

  readRow(input, row => {
		
    if(row.match(new RegExp(`(^|,)${keyword}(,|$)`)) || (single ? row.match(/date/g) : false ) ){
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
	 
	 return new Promise((resolve, reject) => {
		 readRow(input, row => arr.push(row.split(',')), () => resolve(arr));
	 });
 }

/**
 *
 * Read the content of each line of the csv file/读取csv文件每行内容
 *
 * @param {String} input 			file path
 * @param {Function} callback exect after of read an line
 * @param {Function} [done] 	callback function
 */
function readRow(input, callback, done){
  const rl = readline.createInterface({
    input: fs.createReadStream(input),
  });

  rl.on('line', callback);

  rl.on('close', done || function(){ return console.log('file closed');} );
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