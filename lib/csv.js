/**
 * @module csv
 * @author Yuan
 */
 
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');
const math = require('./matrix');

/**/
const CSV = {
  readRow,
  toArray,
  extract,
  extracts,
  average,
  averages,
  alter,
};

/**
 * FIXME: split_arr is function
 * 修改文件行内容
 *
 * @param {String} input
 * @param {String} output
 * @param {Array} split_arr
 * @param {Array} operate_arr
 * @param {Function} [done]
 */
 function alter(input, output, split_arr, operate_arr, done){
   let ws = fs.createWriteStream(output, { flags: 'a' });
   
   readRow(input, row => {
     if(/date/.test(row)){
       return ws.write(row+os.EOL);
     }
     
     let arr = math.alter(row.split(','), split_arr, operate_arr);
     
     ws.write(arr+os.EOL);
   }, done);
 }
 
/**
 *
 * Calculation the average of all files in the input folder
 * 计算input文件夹下所有文件的平均值
 *
 * @param {String} input        folder path
 * @param {String} output       file path
 * @param {String} [type='row']
 * @param {Integer} [start=0]
 * @param {Function} done
 */
 function averages(input, output, type='row', start = 0, done){
   if(!fs.existsSync(input)){
     throw new Error('The folder is not exists');
   }
   
   fs.readdir(input, (err, files) => {
     if(err){ return console.log(err); }
     
     let ws = fs.createWriteStream(output);
     
     files.forEach(v => average(`${input}/${v}`, ws, type, start) );
     
   });
   
 }

/**
 *
 * Calculation the row / column average of each file/计算文件每行/列平均值
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
 * Extract all the lines of the type in all CSV files under the input folder to the output file or folder/将input文件夹下的所有csv文件中包含type的行复制至output文件或文件夹中。
 * 
 * @param {String} input    file folders path
 * @param {String} output   flie/folders
 * @param {String} type     extract keyword
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
 * extract the row of contains the keyword value(title) from the input file to output file/从input文件中提取包含type值行(标题)至output文件
 *
 * @param {String} input          input file path
 * @param {String|WriteStream}    output output file path or write stream
 * @param {String} keyword        extract keyword
 * @param {Boolean} [single=true] true:extract title，false: no extract title
 * @param {Function} [done]       callback
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
 * @param {String} input       file path
 * @param {Function} callback exect after of read an line
 * @param {Function} [done]   callback function
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
module.exports = exports = CSV
