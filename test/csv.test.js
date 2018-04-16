const csv = require('../lib/csv.js');
const fs = require('fs');

describe('# CSV', () => {
	
	describe('# csv.readRow', () => {
		it('csv.readRow()', done => {
			let i = 0;
			
			csv.readRow(`${__dirname}/data/china.csv`, row => {
				
				if(i++ === 0 && row !== 'date,hour,type,北京,天津,石家庄,唐山'){
					throw new Error('readRow test error!');
				}
				
			}, done);
			
		});
	});
	
	describe('# csv.toArray', () => {
		it('csv.toArray()', done => {
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
		it('', done => {
			let output = `${__dirname}/data/c.csv`;
			
			new Promise((resolve, reject) => {
				csv.extract(`${__dirname}/data/china.csv`, output, 'date', true, resolve);
			}).then(() => {
				
				csv.readRow(output, row => {
					if(/20170101/.test(row)){
						throw new Error('extract test error!');
					}
				}, done);
				
			});
			
		});
	});
	
	describe('# csv.extracts', () => {
		it('csv.extracts()', function(done){
			let input = `${__dirname}/data/城市_20170101-20170105`,
					output = `${__dirname}/dest`;
			
			csv.extracts(input, output, 'PM2.5', () => {
				
				csv.readRow(`${output}/china_cities_20170101.csv`, row => {
					if(!/date|(PM2\.5)/.test(row)){
						throw new Error('extracts test error!');
					}
				}, done);
				
			});
			
		});
	});
	
	//row average
	it('csv.average() should return ', ()=>{
		/* csv.average(`${__dirname}/dest/china_cities_20170101.csv`, fs.createWriteStream(`${__dirname}/china.csv`)); */
	});
	//column average
	it('csv.average() should return ', ()=>{
		/* csv.average(`${__dirname}/dest/china_cities_20170101.csv`, fs.createWriteStream(`${__dirname}/china.csv`), 'column'); */
	});
	
});