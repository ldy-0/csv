const csv = require('../lib/csv.js');
const fs = require('fs');

describe('# CSV', () => {
	
	describe('# csv.readRow', () => {
    
		it('test readRow', done => {
			let i = 0;
			
			csv.readRow(`${__dirname}/data/china.csv`, row => {
				
				if(i++ === 0 && row !== 'date,hour,type,北京,天津,石家庄,唐山'){
					throw new Error('readRow test error!');
				}
				
			}, done);
			
		});
    
	});
	
	describe('# csv.toArray', () => {
		it('test toArray', done => {
			let arr_str = 'date,hour,type,北京,天津,石家庄,唐山,20170101,9.947368421052632,NaN,430.2105263157895,188.47368421052633,281.27777777777777,180.16666666666666';
			
			csv.toArray(`${__dirname}/data/china.csv`).then(arr => {
				
				if(arr.toString() !== arr_str){
					throw new Error('toArray test error!');
				}
				
				done();
				
			}).catch(done);
			
		});
	});
	
	describe('# csv.extract', () => {
		it('output is string', done => {
			let output = `${__dirname}/data/c.csv`;
			
			new Promise((resolve, reject) => {
				csv.extract(`${__dirname}/data/china.csv`, output, 'date', true, resolve);
			}).then(() => {
				
				csv.readRow(output, row => {
					if(/20170101/.test(row))
						throw new Error('extract test error!');
						
				}, done);
				
			});
			
		});
		
		it('output is WriteStream', done => {
			let output = `${__dirname}/data/extract_ws.csv`,
					ws = fs.createWriteStream(output, { flags: 'a' });
			
			new Promise((resolve, reject) => {
				csv.extract(`${__dirname}/data/china.csv`, ws, 'date', true, resolve);
			}).then(() => {
				
				csv.readRow(output, row => {
					if(/20170101/.test(row))
						throw new Error('extract test error!');
						
				}, done);
				
			});
			
		});
	});
	
	describe('# csv.extracts', () => {
		it('output folder', done => {
			let input = `${__dirname}/data/城市_20170101-20170105`,
					output = `${__dirname}/data/dest`;
			
			csv.extracts(input, output, 'PM2.5', () => {
				
				csv.readRow(`${output}/china_cities_20170101.csv`, row => {
					if(!/date|(PM2\.5)/.test(row)){
						throw new Error('extracts test error!');
					}
				}, done);
				
			});
			
		});
		
		it("output file", done => {
			let input = `${__dirname}/data/城市_20170101-20170105`,
					output = `${__dirname}/data/extracts.csv`;
			
			csv.extracts(input, output, 'PM2.5', () => {
				
				csv.readRow(output, row => {
					if(!/date|(PM2\.5)/.test(row)){
						throw new Error('extracts test error!');
					}
				}, done);
				
			});
			
		});
	});
	
	describe('average', () => {
		it('test row average', done => {
			let input = `${__dirname}/data/dest/china_cities_20170101.csv`,
					output = `${__dirname}/data/rowAverage.csv`,
					i = 0;
			
			csv.average(input, fs.createWriteStream(output), 'row', 3, () => {
				
				csv.readRow(output, row => {
					if(i++ === 0 && row !== '20170101,0,PM2.5,121.03963414634147'){
						throw new Error('average test error');
					}
				}, done);
				
			}); 
			
		});
		//column average
		it('test column average', done => {
			let input = `${__dirname}/data/rowAverage.csv`,
					output = `${__dirname}/data/columnAverage.csv`,
					i = 0;
			
			csv.average(input, fs.createWriteStream(output), 'column', 0, () => {
				
				csv.readRow(output, row => {
					if(i++ === 1 && row !== '20170101,9.947368421052632,NaN,117.03168703028668'){
						throw new Error('column average test error!');
					}
				}, done);
				
			});
			
		});
	});
	
	describe('# csv.alter', () => {
		let input = `${__dirname}/data/rowAverage.csv`,
				output = `${__dirname}/data/alter.csv`;
		
		it('', done => {
			csv.alter(input, output, [0, 3], [val=>val.substr(0, 4), val=> Math.round(val)], done);
		});
	});
	
});