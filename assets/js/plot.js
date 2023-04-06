import { getGraph } from "./graphUpdate.js";
import { getState} from "./state.js";
import { drawStateDistribution,updateStateDistribution,drawPieChart,updatePieChart, drawAreaChart, updateAreaChart, updateBarChart } from "./draw.js";
import { getColors } from "./visuals.js";
export const plots = {
  line: {
    type:'line chart',
    draw: (id) => drawStateDistribution(id),
    update: (id) => updateStateDistribution(id),
    reset: () => setSumOfOpinions([sumOpinions()]),
    drawData: (svg,x,y,data) =>{
      const state = getState();
      const color = getColors()
      for (let i=0;i<state.numberOfColors;i++){
        const line = d3.line()
            .x((d,j) => x(j))
            .y(d => y(d[i]))
            .curve(d3.curveCardinal)
        svg
          .append('path')
          .datum(data)
          .attr('fill','none')
          .attr('clip-path', 'url(#clip)')
          .attr('stroke',color[i])
          .attr('stroke-width',1.5)
          .attr("d",line) 
          .attr('class', 'chartLine')
          .attr('id','chartLine' + i)
    }
  },
},
  area:{
    type:'Area',
    draw: (id) => drawStateDistribution(id),
    update: (id) => updateStateDistribution(id),
    reset: () => setSumOfOpinions([sumOpinions()]),
    drawData: (svg,x,y,data) => {
      const colors = getColors()
      const keys = Object.keys(data[0]);
    
      const stackedData = d3.stack()
        .keys(keys)
        .value((d, key) => d[key])
        (data);
      // Show the areas
      svg.selectAll(".layer")
      .data(stackedData)
      .enter()
      .append("path")
      .attr("class", "layer")
      .attr('id',function(d, i) { return 'chartArea' + i})
      .attr("fill", function(d, i) { return colors[i]})
      .attr("d", d3.area()
        .x( (d,j) => { return x(j)})
        .y0(d => { return y(d[0])})
        .y1(d => {return y(d[1])})
      )
    }
  },
  bar:{
    type:'Bar',
    draw: (id) => drawAreaChart(id),
    update: (id) => updateBarChart(id),
    reset: () => setSumOfOpinions([sumOpinions()]),
  },
  pieChart:{
    type:'pie chart',
    draw: (id) => drawPieChart(id),
    update: (id) => updatePieChart(id),
    reset: () => {},
  },

}
export function changeOpinionSum(newChanges){
  const sumOfOpinions = getSumOfOpinions();
  const state = getState();
  const lastElement = sumOfOpinions[sumOfOpinions.length-1]
  for (const changes of newChanges){
    for (const datum in plotData){
      const array = plotData[datum].data
      if (datum ==="splitChanges" || datum === "absolutesplitChanges"){
        array[array.length] = Object.assign({},array[0])
      } else {
        array[array.length] = Object.assign({},array[array.length-1])
      }
    }
    for (const vertex in changes){
      for(const datum in plotData){
        const array = plotData[datum].data
        plotData[datum].update(array[array.length-1],changes[vertex])
      }
    }
  }

}
function splitChanges(){
  const state = getState();
  const opinionChange = {}
  for (let i=0;i<state.numberOfColors;i++){
    opinionChange[i] = 0;
  }
    return opinionChange
}
export const plotData = {
  sumOfOpinions:{
    data: [sumOpinions()],
    reset: function() {
      this.data = [sumOpinions()];
    },
    update: function(array,change) {
      array[change[0]]--;
      array[change[1]]++;
    },
    text: 'state dist.'
  },
  splitChanges:{
    data:[splitChanges()],
    reset: function() {
      this.data = [splitChanges()];
    },
    update: function(array,change) {
      array[change[0]]--;
      array[change[1]]++;
    },
    text: 'changes'
  },
}
export function sumOpinions(){
  const state = getState();
  const opinionSum = {};
  for (let i =0; i<state.numberOfColors;i++){
    opinionSum[i] = 0;
  }
  const graph = getGraph();
  for (const node in graph.vertices){
    opinionSum[graph.vertices[node].level]++;
  }
  return opinionSum
}

export var sumOfOpinions = [];

export function getSumOfOpinions(){
  return sumOfOpinions;
}

export function setSumOfOpinions(newSum){
  sumOfOpinions = newSum;
}
