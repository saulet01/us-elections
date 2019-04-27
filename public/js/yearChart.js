/**
 * Constructor for the Year Chart
 *
 * @param electoralVoteChart instance of ElectoralVoteChart
 * @param tileChart instance of TileChart
 * @param votePercentageChart instance of Vote Percentage Chart
 * @param electionInfo instance of ElectionInfo
 * @param electionWinners data corresponding to the winning parties over mutiple election years
 */
function YearChart(electoralVoteChart, tileChart, votePercentageChart, electionWinners) {
    var self = this;

    self.electoralVoteChart = electoralVoteChart;
    self.tileChart = tileChart;
    self.votePercentageChart = votePercentageChart;
    self.electionWinners = electionWinners;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
YearChart.prototype.init = function(){

    var self = this;
    self.margin = {top: 10, right: 20, bottom: 30, left: 50};
    var divyearChart = d3.select("#year-chart").classed("fullView", true);

    //Gets access to the div element created for this chart from HTML
    self.svgBounds = divyearChart.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 100;

    //creates svg element within the div
    self.svg = divyearChart.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
YearChart.prototype.chooseClass = function (party) {
    var self = this;
    if (party == "R") {
        return "yearChart republican";
    }
    else if (party == "D") {
        return "yearChart democrat";
    }
    else if (party == "I") {
        return "yearChart independent";
    }
}


/**
 * Creates a chart with circles representing each election year, populates text content and other required elements for the Year Chart
 */
YearChart.prototype.update = function(){
    var self = this;

    //Domain definition for global color scale
    var domain = [-60,-50,-40,-30,-20,-10,0,10,20,30,40,50,60 ];

    //Color range for global color scale
    var range = ["#0066CC", "#0080FF", "#3399FF", "#66B2FF", "#99ccff", "#CCE5FF", "#ffcccc", "#ff9999", "#ff6666", "#ff3333", "#FF0000", "#CC0000"];

    //Global colorScale to be used consistently by all the charts
    self.colorScale = d3.scaleQuantile()
        .domain(domain).range(range);

    //Style the chart by adding a dashed line that connects all these years.
    //HINT: Use .lineChart to style this dashed line
    self.svg.append("line")
             .attr("x1", 30)
             .attr("y1", 40)
             .attr("x2", self.svgWidth)
             .attr("y2", 40)
             .attr("class", "lineChart")

      // ******* TODO: PART I *******
     // Create the chart by adding circle elements representing each election year
     //The circles should be colored based on the winning party for that year
     //HINT: Use the .yearChart class to style your circle elements
     //HINT: Use the chooseClass method to choose the color corresponding to the winning party.
    self.svg.selectAll("circle")
            .data(self.electionWinners)
            .enter()
            .append("circle")
            .attr("cy", 40)
            .attr("cx", (d, index) => {
              return index*60 + 45;
            })
            .attr("class", d => self.chooseClass(d.PARTY))
            .attr("r", 10)

    //Clicking on any specific year should highlight that circle and  update the rest of the visualizations
    //HINT: Use .highlighted class to style the highlighted circle
    self.svg.selectAll("circle")
            .on("mouseover", function () {
              d3.select(this).classed("highlighted", true)
            })
            .on("mouseout", function () {
              d3.select(this).classed("highlighted", false)
            })
            .on("click", function(event){
              let dParty = d3.select(this).datum().PARTY;
              let dYEAR = d3.select(this).datum().YEAR;

              // Show Selected Year with appropriate color party
              if(dParty.toString() == "R"){
                d3.select(".yearShow").html(`Selected Year: <span class="republican">${dYEAR}</span>`)
              }else{
                d3.select(".yearShow").html(`Selected Year: <span class="democrat">${dYEAR}</span>`)
              }

              //Election information corresponding to that year should be loaded and passed to
              // the update methods of other visualizations
              let passingData = d3.csv("data/election-results-" + d3.select(this).datum().YEAR + ".csv", function(data){
                self.electoralVoteChart.update(data, self.colorScale);
                self.votePercentageChart.update(data);
                self.tileChart.update(data, self.colorScale);
              });
            })

    //Append text information of each year right below the corresponding circle
    //HINT: Use .yeartext class to style your text elements
    self.svg.selectAll("text")
            .data(self.electionWinners)
            .enter()
            .append("text")
            .attr("x", (d, index) => {
              return index*60 + 45;
            })
            .attr("y", 75)
            .text(d => d.YEAR)
            .attr("class", "yeartext")
};
