//Declaracion de variables 
var data_url =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";

var chartWidth = 1000;
var chartHeight = 600;

var legendWidth = 500;
var legendHeight = 300;

var svgContainer = d3
  .select("#map")
  .append("svg")
  .attr("width", chartWidth)
  .attr("height", chartHeight);

var svgLegend = 
d3.select("#legend")
.append("svg")
.attr("width", legendWidth)
.attr("height", legendHeight);

var tooltip = d3
  .select(".visHolder")
  .append("div")
  .attr("id","tooltip")
  .style("opacity", 0);

function sumBySize(d) {
  return d.value;
}

var fader = function (color) {
    return d3.interpolateRgb(color, "#fff")(0.4);
  },
  color = d3.scaleOrdinal(d3.schemeCategory10.map(fader));

//funcion principal donde se captura la promesa
async function rendertreemap() {
  var response = await d3.json(data_url, function (err, data) {
    if (err) throw err;

    return data;
  });

  var treemap = d3.treemap().size([chartWidth, chartHeight]).paddingInner(1);
//transformar informacion a manera herarquica o de arbol
  var root = d3
    .hierarchy(response)
    .eachBefore(function (d) {
      d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
    })
    .sum(sumBySize)
    .sort(function (a, b) {
      return b.height - a.height || b.value - a.value;
    });


  treemap(root);
//adjunto celdas al grupo
  var cells = svgContainer
    .selectAll(".cell")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("class", "cell")
    .attr('transform', function (d) {
      return 'translate(' + d.x0 + ',' + d.y0 + ')';
    });
//pinto los rectangulos
  cells
    .append("rect")
    .attr("width", function (d) {
      return d.x1 - d.x0;
    })
    .attr("height", function (d) {
      return d.y1 - d.y0;
    })
    .attr("fill", function (d) {
      return color(d.data.category);
    })
    .attr("class","tile")
    .attr("data-name",function(d){ return d.data.name})
    .attr("data-category",function(d){ return d.data.category})
    .attr("data-value",function(d){return d.data.value})
    //Tooltip informativo
    .on("mouseover", (d, i) => {
      tooltip
        .transition()
        .duration(200)
        .attr("data-value", i.data.value)
        .style("opacity", 0.9)
        .style("left", i.x0  + 150 + "px")
        .style("top", i.y0  + 30+ "px");
      console.log(i);
      tooltip.html(
        i.data.name +
          " <br>" +
         i.data.category +
          "<br>" +
          i.data.value +
          "<br>"
      );
    })
    .on("mouseout", (d, i) => {
      tooltip.transition().duration(200).style("opacity", 0);
    });
//Pinto los textos encima de los rectangulos
    cells
    .append('text')
    .attr('class', 'tile-text')
    .selectAll('tspan')
    .data(function (d) {
      return d.data.name.split(/(?=[A-Z][^A-Z])/g);
    })
    .enter()
    .append('tspan')
    .attr('x', 2)
    .attr('y', function (d, i) {
      return 12 + i * 10;
    })
    .attr("font-size", 9)
    .attr("font-style","italic")
    .text(function (d) {
      return d;
    });
  //visualizacion de la leyenda
  var ArrayLegend = root.leaves().map(function (nodes) {
    return nodes.data.category;
  });
  ArrayLegend = ArrayLegend.filter(function (category, index, self) {
    return self.indexOf(category) === index;
  });
 
    const TamCuadrado = 20;
    const EspaciadoLegend = 150;

    var legendElemsPerRow = Math.floor(legendWidth / EspaciadoLegend);
  
    var legendElem = svgLegend
      .append('g')
      .attr('transform', 'translate(60,' + 20 + ')')
      .selectAll('g')
      .data(ArrayLegend)
      .enter()
      .append('g')
      .attr('transform', function (d, i) {
        return (
          'translate(' +
          (i % legendElemsPerRow) * EspaciadoLegend +
          ',' +
          (Math.floor(i / legendElemsPerRow) * TamCuadrado +
            10 * Math.floor(i / legendElemsPerRow)) +
          ')'
        );
      });
  
    legendElem
      .append('rect')
      .attr('width', TamCuadrado)
      .attr('height', TamCuadrado)
      .attr('class', 'legend-item')
      .attr('fill', function (d) {
        return color(d);
      });
  
    legendElem
      .append('text')
      .attr('x', TamCuadrado + 4)
      .attr('y', TamCuadrado + -2)
      .text(function (d) {
        return d;
      });
}

rendertreemap();
