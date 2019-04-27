
/**
 * Constructor for the ElectoralVoteChart
 *
 * @param brushSelection an instance of the BrushSelection class
 */
function ElectoralVoteChart(brushSelection){

    var self = this;
    self.brushSelection = brushSelection;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
ElectoralVoteChart.prototype.init = function(){
    var self = this;
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};

    //Gets access to the div element created for this chart from HTML
    var divelectoralVotes = d3.select("#electoral-vote").classed("content", true);
    self.svgBounds = divelectoralVotes.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 100;

    //creates svg element within the div
    self.svg = divelectoralVotes.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
ElectoralVoteChart.prototype.chooseClass = function (party) {
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
 * Creates the stacked bar chart, text content and tool tips for electoral vote chart
 *
 * @param electionResult election data for the year selected
 * @param colorScale global quantile scale based on the winning margin between republicans and democrats
 */

ElectoralVoteChart.prototype.update = function(electionResult, colorScale){
    var self = this;
    // console.log(electionResult);

    // ******* TODO: PART II *******
    electionResult.forEach(function (d) {
        d.State = d.State;
        d.Abbreviation = d.Abbreviation;
        d.Total_EV = +d.Total_EV;
        d.D_Nominee = d.D_Nominee
        d.D_Percentage = +d.D_Percentage;
        d.D_Votes = +d.D_Votes;
        d.R_Nominee = d.R_Nominee;
        d.R_Percentage = +d.R_Percentage;
        d.R_Votes = +d.R_Votes;
        d.I_Nominee = d.I_Nominee;
        d.I_Percentage = +d.I_Percentage;
        d.I_Votes = +d.I_Votes;
        d.Year = +d.Year;
        d.Difference = d.R_Percentage - d.D_Percentage;
    });

    let fNom = electionResult.filter( d => d.I_Percentage > d.D_Percentage && d.I_Percentage > d.R_Percentage);
    let iNom = electionResult.filter( d => d.I_Percentage > d.D_Percentage && d.I_Percentage > d.R_Percentage);
    let rNom = electionResult.filter( d => d.R_Percentage > d.I_Percentage && d.R_Percentage > d.D_Percentage);
    let dNom = electionResult.filter( d => d.D_Percentage > d.R_Percentage && d.D_Percentage > d.I_Percentage);

    rNom.sort((a,b) => {
      return d3.ascending(a.Difference, b.Difference);
    });
    dNom.sort((a,b) => {
      return d3.ascending(a.Difference, b.Difference);
    });

    //Group the states based on the winning party for the state;
    //then sort them based on the margin of victory
    // Combine 3 arrays together:
    Array.prototype.push.apply(iNom,dNom);
    Array.prototype.push.apply(iNom,rNom);

    self.svg.selectAll("rect").remove()

    let xScale = d3.scaleLinear()
                   .domain([0, d3.sum(iNom, d => d.Total_EV)])
                   .range([0, self.svgWidth]);
    let maxs = d3.max(iNom, d => d.Total_EV);

    //Create the stacked bar chart.
    //Use the global color scale to color code the rectangles.
    //HINT: Use .electoralVotes class to style your bars.
    self.svg.selectAll("rect")
            .data(iNom)
            .enter()
            .append("rect")
            .attr("width", 0)
            .attr("height", 30)
            .attr("y", 25)
            .transition()
            .duration(1400)
            .attr("x", function(d, i){
              // Inspired from: https://www.hacksparrow.com/javascript-slice-with-examples.html
              return xScale(d3.sum(iNom.slice(0, i), d => d.Total_EV))
            })
            .attr("width", d => xScale(d.Total_EV))
            .attr("fill", function(d){
              if (d.I_Percentage > d.D_Percentage && d.I_Percentage > d.R_Percentage){
                return "#45AD6A";
              }else{
                return colorScale(d.R_Percentage - d.D_Percentage);
              }
            })
            .attr("class", "electoralVotes")

    let text1 = d3.sum(fNom, d => d.Total_EV);
    let text2 = d3.sum(rNom, d => d.Total_EV);
    let text3 = d3.sum(dNom, d => d.Total_EV);

    //Display total count of electoral votes won by the Democrat and Republican party
    //on top of the corresponding groups of bars.
    //HINT: Use the .electoralVoteText class to style your text elements;  Use this in combination with
    // chooseClass to get a color based on the party wherever necessary
    self.svg.selectAll("text").remove()
    if (fNom.length != 0){
      self.svg.append("text")
              .attr("x", 0)
              .attr("y", 15)
              .text(text1)
              .attr("class", "independent")
              .classed("electoralVotesNote", true)
              .style("animation", "animate 3s ease-out forwards")

      self.svg.append("text")
              .attr("x", xScale(text1))
              .attr("y", 15)
              .text(text3)
              .attr("class", "democrat")
              .classed("electoralVotesNote", true)
              .style("animation", "animate 3s ease-out forwards")

      self.svg.append("text")
              .attr("x", self.svgWidth)
              .attr("y", 15)
              .text(text2)
              .attr("class", "republican")
              .classed("electoralVotesNote", true)
              .style("animation", "animate 3s ease-out forwards")
    }else{
      self.svg.append("text")
              .attr("x", 0)
              .attr("y", 15)
              .text(text3)
              .attr("class", "democrat")
              .classed("electoralVotesNote", true)
              .style("animation", "animate 3s ease-out forwards")

      self.svg.append("text")
              .attr("x", self.svgWidth)
              .attr("y", 15)
              .text(text2)
              .attr("class", "republican")
              .classed("electoralVotesNote", true)
              .style("animation", "animate 3s ease-out forwards")
    }

    //Just above this, display the text mentioning the total number of electoral votes required
    // to win the elections throughout the country
    //HINT: Use .electoralVotesNote class to style this text element
    let needWin = parseInt((d3.sum(iNom, d => d.Total_EV))/2) + 1;
    self.svg.append("text")
            .attr("x", self.svgWidth/2)
            .attr("y", 15)
            .text(`Electoral Vote (${needWin} needed to win)`)
            .classed("electoralVotesNote", true)
            .style("animation", "animate 3s ease-out forwards")
            .attr("fill", "#565656")

    //Display a bar with minimal width in the center of the bar chart to indicate the 50% mark
    //HINT: Use .middlePoint class to style this bar.
    //HINT: Use the chooseClass method to style your elements based on party wherever necessary.
    self.svg.append("rect")
            .attr("width", 2)
            .attr("height", 44)
            .attr("x", self.svgWidth/2)
            .attr("y", 20)
            .attr("class", "middlePoint")
            .attr("fill", "#565656")

    //******* TODO: PART V *******
    //Implement brush on the bar chart created above.
    //Implement a call back method to handle the brush end event.
    //Call the update method of brushSelection and pass the data corresponding to brush selection.
    //HINT: Use the .brush class to style the brush.

    // Adapted from : https://www.d3-graph-gallery.com/graph/interactivity_brush.html
                   // http://bl.ocks.org/cdagli/3f6b27139323e59e0b445de1a04615c3
    self.svg.call(d3.brushX()
            .extent([[0,10],[self.svgWidth, 70]])
            .on("start brush", function(){
              let selectStates = d3.event.selection;
              let listState = [];
              iNom.map( (d, i) => {
                let bb = xScale(d3.sum(iNom.slice(0, i), d => d.Total_EV));
                if (bb > selectStates[0] && selectStates[1] > bb){
                  if(listState.includes(iNom[i].State) === false){
                    listState.push(iNom[i].State);
                  }
                }
              })
              self.brushSelection.update(listState);
            }))
            .attr("class", "brush");

        //     var selectionRange = d3.brushSelection(d3.select(".brush").node());
        //
      	// var selectionDomain = selectionRange.map(timeline.x.invert);
        //
        // areachart.x.domain([selectionDomain[0], selectionDomain[1]]);
        //
        // areachart.wrangleData();
};
