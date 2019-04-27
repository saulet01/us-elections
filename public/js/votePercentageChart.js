/**
 * Constructor for the Vote Percentage Chart
 */
function VotePercentageChart(){

    var self = this;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
VotePercentageChart.prototype.init = function(){
    var self = this;
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};
    var divvotesPercentage = d3.select("#votes-percentage").classed("content", true);

    //Gets access to the div element created for this chart from HTML
    self.svgBounds = divvotesPercentage.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 170;

    //creates svg element within the div
    self.svg = divvotesPercentage.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
VotePercentageChart.prototype.chooseClass = function (party) {
    var self = this;
    if (party == "R"){
        return "republican";
    }
    else if (party == "D"){
        return "democrat";
    }
    else if (party == "I"){
        return "independent";
    }
}

/**
 * Renders the HTML content for tool tip
 *
 * @param tooltip_data information that needs to be populated in the tool tip
 * @return text HTML content for toop tip
 */
VotePercentageChart.prototype.tooltip_render = function (tooltip_data) {
    var self = this;
    var text = "<ul>";
    tooltip_data.result.forEach(function(row){
        text += "<li class = " + self.chooseClass(row.party)+ ">" + row.nominee+":\t\t"+row.votecount+"("+row.percentage+"%)" + "</li>"
    });
    text += "</ul>";

    // console.log(text);
    return text;
}

/**
 * Creates the stacked bar chart, text content and tool tips for Vote Percentage chart
 *
 * @param electionResult election data for the year selected
 */
VotePercentageChart.prototype.update = function(electionResult){
    var self = this;
    electionResult.forEach(function (d) {
        d.State = d.State;
        d.Abbreviation = d.Abbreviation;
        d.Total_EV = +d.Total_EV;
        d.D_Nominee = d.D_Nominee;
        d.D_Percentage = +d.D_Percentage;
        d.D_Votes = +d.D_Votes;
        d.R_Nominee = d.R_Nominee;
        d.R_Percentage = +d.R_Percentage;
        d.R_Votes = +d.R_Votes;
        d.I_Nominee = d.I_Nominee;
        d.I_Percentage = +d.I_Percentage;
        d.I_Votes = +d.I_Votes;
        d.Year = +d.Year;
    });

    let totalPercentage = d3.sum(electionResult, d => d.D_Percentage + d.R_Percentage + d.I_Percentage);
    // console.log(totalPercentage);
    let perScale = d3.scaleLinear().domain([0, totalPercentage]);
    let sum1 = d3.sum(electionResult, d => d.I_Percentage);
    let option1 = perScale(sum1) * 100;
    // console.log(option1)
    let sum2 = d3.sum(electionResult, d => d.D_Percentage);
    let option2 = perScale(sum2) * 100;
    let sum3 = d3.sum(electionResult, d => d.R_Percentage);
    let option3 = perScale(sum3) * 100;
    //for reference:https://github.com/Caged/d3-tip
    //Use this tool tip element to handle any hover over the chart
    tip = d3.tip().attr('class', 'd3-tip')
        .direction('s')
        .offset(function() {
            return [0,0];
        })
        .html(function(d) {
          if(sum1 != 0){
            tooltip_data = {
             "result":[
                 {"nominee": electionResult[0].I_Nominee,"votecount": d3.sum(electionResult, d => d.I_Votes),"percentage": option1.toFixed(1),"party":"I"},
                 {"nominee": electionResult[0].D_Nominee,"votecount": d3.sum(electionResult, d => d.D_Votes),"percentage": option2.toFixed(1),"party":"D"},
                 {"nominee": electionResult[0].R_Nominee,"votecount": d3.sum(electionResult, d => d.R_Votes),"percentage": option3.toFixed(1),"party":"R"}
               ]
             }
          }else{
            tooltip_data = {
             "result":[
                 {"nominee": electionResult[0].D_Nominee,"votecount": d3.sum(electionResult, d => d.D_Votes),"percentage": option2.toFixed(1),"party":"D"},
                 {"nominee": electionResult[0].R_Nominee,"votecount": d3.sum(electionResult, d => d.R_Votes),"percentage": option3.toFixed(1),"party":"R"}
               ]
             }
          }
             let tooltipHTML = VotePercentageChart.prototype.tooltip_render(tooltip_data);
             // console.log(tooltipHTML);
             return tooltipHTML;
        });
    // ******* TODO: PART III *******

    let newData = [];
    for (let i=0; i < electionResult.length; i++){
      newData.push({
        I_Percentage: electionResult[i].I_Percentage,
        D_Percentage: electionResult[i].D_Percentage,
        R_Percentage: electionResult[i].R_Percentage,
      });
    }
    let xScale = d3.scaleLinear()
                   .domain([0, totalPercentage])
                   .range([0, self.svgWidth]);

    // console.log(newData.map( d => d));
    // Add a rect for each data value
    let newList = [];
    newList.push(sum1);
    newList.push(sum2);
    newList.push(sum3);
    // console.log(newList);
    let color1 = [];
    color1.push("#45AD6A");
    color1.push("#3182bd");
    color1.push("#de2d26");

    function formula(number){
      let ss = perScale(newList[number]) * 100;
      return ss.toFixed(1);
    }

    self.svg.selectAll("rect").remove()
    let rect2 = self.svg.selectAll("rect")
            .data(newList)
            .enter()

    //Create the stacked bar chart.
    //Use the global color scale to color code the rectangles.
    //HINT: Use .votesPercentage class to style your bars.
     rect2.append("rect")
          .attr("width", 0)
          .attr("height", 40)
          .attr("y", 70)
          .transition()
          .duration(1400)
          .attr("x", function(d, i){
            return xScale(d3.sum(newList.slice(0, i), (d,i) => newList[i]))
          })
          .attr("width", function(d,i){
            return xScale(d3.sum(newList, (d,i) => newList[i]))
          })
          .attr("y", 70)
          .attr("height", 40)
          .attr("fill", (d, i) => color1[i])
          .attr("class", "votesPercentage");

    //Call the tool tip on hover over the bars to display stateName, count of electoral votes.
    //then, vote percentage and number of votes won by each party.

    //HINT: Use the chooseClass method to style your elements based on party wherever necessary.
    self.svg.selectAll("rect")
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)

   self.svg.call(tip);
   self.svg.selectAll("text").remove()
   //Display the total percentage of votes won by each party
   //on top of the corresponding groups of bars.
   //HINT: Use the .votesPercentageText class to style your text elements;  Use this in combination with
   // chooseClass to get a color based on the party wherever necessary
   if(newList[0] != 0){
     self.svg.append("text")
             .attr("x", 0)
             .attr("y", 60)
             .text(formula(0) + "%")
             .attr("class", "independent")
             .classed("votesPercentageText", true)
             .style("animation", "animate 3s ease-out forwards")

     self.svg.append("text")
             .attr("x", xScale(newList[0]) + 20)
             .attr("y", 60)
             .text(formula(1) + "%")
             .attr("class", "democrat")
             .classed("votesPercentageText", true)
             .style("animation", "animate 3s ease-out forwards")

     self.svg.append("text")
             .attr("x", self.svgWidth)
             .attr("y", 60)
             .text(formula(2) + "%")
             .attr("class", "republican")
             .classed("votesPercentageText", true)
             .style("animation", "animate 3s ease-out forwards")

     self.svg.append("text")
             .attr("x", 0)
             .attr("y", 15)
             .text(electionResult[0].I_Nominee)
             .attr("class", self.chooseClass("I"))
             .classed("votesPercentageText", true)
             .style("animation", "animate 3s ease-out forwards")

     self.svg.append("text")
             .attr("x", xScale(newList[0]) + 150)
             .attr("y", 15)
             .text(electionResult[0].D_Nominee)
             .attr("class", self.chooseClass("D"))
             .classed("votesPercentageText", true)
             .style("animation", "animate 3s ease-out forwards")

     self.svg.append("text")
             .attr("x", self.svgWidth)
             .attr("y", 15)
             .text(electionResult[0].R_Nominee)
             .attr("class", self.chooseClass("R"))
             .classed("votesPercentageText", true)
             .style("animation", "animate 3s ease-out forwards")
   }else{
     self.svg.append("text")
             .attr("x", 0)
             .attr("y", 60)
             .text(formula(1) + "%")
             .attr("class", "democrat")
             .classed("votesPercentageText", true)
             .style("animation", "animate 3s ease-out forwards")

     self.svg.append("text")
             .attr("x", self.svgWidth)
             .attr("y", 60)
             .text(formula(2) + "%")
             .attr("class", "republican")
             .classed("votesPercentageText", true)
             .style("animation", "animate 3s ease-out forwards")

     self.svg.append("text")
             .attr("x", 100)
             .attr("y", 15)
             .text(electionResult[0].D_Nominee)
             .attr("class", self.chooseClass("D"))
             .classed("votesPercentageText", true)
             .style("animation", "animate 3s ease-out forwards")

     self.svg.append("text")
             .attr("x", self.svgWidth)
             .attr("y", 15)
             .text(electionResult[0].R_Nominee)
             .attr("class", self.chooseClass("R"))
             .classed("votesPercentageText", true)
             .style("animation", "animate 3s ease-out forwards")
   }
   //Just above this, display the text mentioning details about this mark on top of this bar
   //HINT: Use .votesPercentageNote class to style this text element
   self.svg.append("text")
           .attr("x", self.svgWidth/2)
           .attr("y", 60)
           .text(`Popular Vote(50%)`)
           .classed("votesPercentageNote", true)
           .style("animation", "animate 3s ease-out forwards")

   //Display a bar with minimal width in the center of the bar chart to indicate the 50% mark
   //HINT: Use .middlePoint class to style this bar.
   self.svg.append("rect")
           .attr("width", 2)
           .attr("height", 50)
           .attr("x", self.svgWidth/2)
           .attr("y", 65)
           .attr("class", "middlePoint")
};
