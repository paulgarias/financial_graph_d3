
var margin = { top : 40, right:40, bottom:80, left:80 }

var height = 400 -margin.top - margin.bottom,
        width = 800 -margin.left -margin.right,
        barWidth = 50,
        barOffset = 5;

//var parseDate = d3.time.format("%Y-%m-%d").parse
//var parseDate = d3.time.format("%m-%d").parse
var parseDate = d3.timeFormat("%m-%d")

var myChart = d3.select('#chart').append('svg')
        .style('background','#FFF')
        // To provide the right dimensions of the svg element, recall that we have to add back the
        // top, left, bottom and right margins to the svg. These style attributes are then grouped
        // together (append('g') command)  and translated the left (x) and top (y) margins.
        .attr('width',width+margin.left+margin.right)
        .attr('height',height+margin.top+margin.bottom)

prev=1000
prevl = 1000

var colors = d3.scaleLinear()
	.domain([-prev/4,-1, 0, 1,prev/2])
	.range(['#EBBAB9','#CC2936','#000000','#b5ffe1','#002b58']) 

//var yScale = d3.scaleLinear()
//        .domain([0,prev])
//        .range([0,height/2]);
//
//var vGuideScale = d3.scaleLinear()
//        .domain([-prevl, prev])
//        .range([height,0])
//
//var vAxis = d3.axisLeft()
//        .scale(vGuideScale)
//        .ticks(10)
//
//var vGuide = d3.select('svg').append('g')
//        vAxis(vGuide)
//        vGuide.attr('transform','translate('+(margin.left-5)+','+margin.top+')')
//	vGuide.attr("font-size","15")
//        vGuide.selectAll('path')
//                .style( {fill : 'none', stroke:'#000'})
//        vGuide.selectAll('line')
//                .style( {fill : 'none', stroke:'#000'})
//
var tooltip = d3.select('body').append('div')
        .style('position','absolute')
        .style('padding','0 5px')
        .style('background','grey')
	.style('color','white')


d3.json("stocks.json", function(data) {
	// We need to extract the dates in order to build the xAxis
	datelist = []
	for (key in data) {
		datelist.push(new Date(data[key][key][0].date+"T12:00:00-05:00"))	
	}
	var yScale = d3.scaleLinear()
		.domain([0,prev])
		.range([0,height/2]);

	var vGuideScale = d3.scaleLinear()
		.domain([-prevl, prev])
		.range([height,0])

	var vAxis = d3.axisLeft()
		.scale(vGuideScale)
		.ticks(10)

	var vGuide = d3.select('svg').append('g')
		vAxis(vGuide)
		vGuide.attr('transform','translate('+(margin.left-5)+','+margin.top+')')
		vGuide.attr("font-size","15")
		vGuide.selectAll('path')
			.style( {fill : 'none', stroke:'#000'})
		vGuide.selectAll('line')
			.style( {fill : 'none', stroke:'#000'})
	


	var xS = d3.scaleBand().range([0,width]) 
		.domain(datelist.map(function (d) {return parseDate(d)}))
		.padding([0.05]);


	var xScale = d3.scaleBand()
		.domain(d3.range(0,datelist.length))
		.range([0,width])
		.padding([0.05]);


	var xAxis = d3.axisBottom()
		.scale(xS)

	myChart.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate("+(margin.left)+"," + (height+margin.top+5) + ")")
			.call(xAxis)
			.selectAll("text")
			.style("text-anchor", "end")
			.attr("dx", "-0.6em")
			.attr("dy", "0.20em")
			.attr("transform", "rotate(-70)" )
			.attr("font-size","15")

	console.log(data)
	function getData(dat) {
		listing = []
		for (kk in dat) {
			console.log(kk)
			for (key in dat[kk][kk]){
				if(key!=0){
					listing.push({day: kk, offset: dat[kk][kk][key].offset, name: dat[kk][kk][key].name, value: dat[kk][kk][key].value})	
				}
			}
		}
		return listing;
	}
	console.log(getData(data))

	var rects = d3.select('svg').append('g').selectAll('rect')
                .data(getData(data)).enter()
                .append('rect')
			.attr("width",xScale.bandwidth)
			.attr("height", function(d) {
				return Math.abs(yScale(d.value));
			})
			.attr("x", function(d,i) {
					return xScale(d.day);
			})
			.attr('y', function(d,i) {
                                if (d.value >= 0){
                                        return height/2.0-Math.abs(yScale(d.value))-yScale(d.offset)  ;
                                } else {
                                        return height/2.0+yScale(d.offset);
                                }
                        })
			.style("opacity",0.0)
			.style('fill',function(d,i) {
                                return colors(d.value);
                        }) 
			.attr('transform','translate('+margin.left+','+(margin.top)+')')
		 	.on('mouseover',function(d){
                        	tempColor = this.style.fill;
                        	d3.select(this)
                        	.style('opacity',0.5)
                        	.style('fill','yellow')
                        	tooltip.transition()
                        	        .style('opacity',0.8)
                        	        .duration(10)
                        	tooltip.html(Math.round(1000*d.value)/1000+" <br> "+d.name)
                        	        .style('left',(d3.event.pageX + 15) + 'px')
                        	        .style('top',(d3.event.pageY- 30) + 'px')
                	})
                	.on('mouseout', function(d) {
                	        tooltip.transition()
                	                .style('opacity',0.0)
                	                .style('pointer-events','none')
                	        d3.select(this)
                	        .style("opacity",1.0)
                	        .style("fill", tempColor)

                	})

	
	rects.transition()
		.style("opacity",1.0)
		.duration(500)
		.delay(function (d,i) {
			return d.day*100;
		})

})

