/**
 * Constructor for the TileChart
 */
function TileChart(){

    var self = this;
    self.init();
};

/**
 * Initializes the svg elements required to lay the tiles
 * and to populate the legend.
 */
TileChart.prototype.init = function(){
    var self = this;

    //Gets access to the div element created for this chart and legend element from HTML
    var divTileChart = d3.select("#tiles").classed("content", true);
    var legend = d3.select("#legend").classed("content",true);
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};

    var svgBounds = divTileChart.node().getBoundingClientRect();
    self.svgWidth = svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = self.svgWidth/2;
    var legendHeight = 90;

    //creates svg elements within the div
    self.legendSvg = legend.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",legendHeight)

    self.svg = divTileChart.append("svg")
                        .attr("width",self.svgWidth)
                        .attr("height",self.svgHeight)
                        .style("bgcolor","green")

};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
TileChart.prototype.chooseClass = function (party) {
    var self = this;
    if (party == "R"){
        return "republican";
    }
    else if (party== "D"){
        return "democrat";
    }
    else if (party == "I"){
        return "independent";
    }
}

/**
 * Renders the HTML content for tool tip.
 *
 * @param tooltip_data information that needs to be populated in the tool tip
 * @return text HTML content for tool tip
 */
TileChart.prototype.tooltip_render = function (tooltip_data) {
    var self = this;
    var text = "<h2 class ="  + self.chooseClass(tooltip_data.winner) + " >" + tooltip_data.state + "</h2>";
    text +=  "Electoral Votes: " + tooltip_data.electoralVotes;
    text += "<ul>"
    tooltip_data.result.forEach(function(row){
        text += "<li class = " + self.chooseClass(row.party)+ ">" + row.nominee+":\t\t"+row.votecount+"("+row.percentage+"%)" + "</li>"
    });
    text += "</ul>";
    return text;
}

/**
 * Creates tiles and tool tip for each state, legend for encoding the color scale information.
 *
 * @param electionResult election data for the year selected
 * @param colorScale global quantile scale based on the winning margin between republicans and democrats
 */
TileChart.prototype.update = function(electionResult, colorScale){
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
        d.Row = +d.Row;
        d.Column = +d.Column;
    });

    let maxRow = d3.max(electionResult, d => d.Row) + 1;
    let rowScale = d3.scaleLinear().range([0, self.svgHeight]).domain([0, maxRow])
    let maxCol = d3.max(electionResult, d => d.Column) + 1;
    let colScale = d3.scaleLinear().range([0, self.svgWidth]).domain([0, maxCol])
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

    function stateWinner(I_Percentage, D_Percentage, R_Percentage){
      if(I_Percentage > D_Percentage && I_Percentage > R_Percentage){
        return "I";
      }else if(R_Percentage > I_Percentage && R_Percentage > D_Percentage){
        return "R";
      }else if(D_Percentage > R_Percentage && D_Percentage > I_Percentage){
        return "D";
      }
    }
    //Calculates the maximum number of columns to be laid out on the svg
    self.maxColumns = d3.max(electionResult,function(d){
                                return parseInt(d["Space"]);
                            });

    //Calculates the maximum number of rows to be laid out on the svg
    self.maxRows = d3.max(electionResult,function(d){
                                return parseInt(d["Row"]);
                        });
    //for reference:https://github.com/Caged/d3-tip
    //Use this tool tip element to handle any hover over the chart
    tip = d3.tip().attr('class', 'd3-tip')
        .direction('se')
        .offset(function() {
            return [0,0];
        })
        .html(function(d) {
          if(sum1 != 0){
            tooltip_data = {
              "state": d.State,
                "winner": stateWinner(d.I_Percentage, d.D_Percentage, d.R_Percentage),
                "electoralVotes" : d.Total_EV,
                "result":[
                 {"nominee": electionResult[0].I_Nominee,"votecount": d3.sum(electionResult, d => d.I_Votes),"percentage": option1.toFixed(1),"party":"I"},
                 {"nominee": electionResult[0].D_Nominee,"votecount": d3.sum(electionResult, d => d.D_Votes),"percentage": option2.toFixed(1),"party":"D"},
                 {"nominee": electionResult[0].R_Nominee,"votecount": d3.sum(electionResult, d => d.R_Votes),"percentage": option3.toFixed(1),"party":"R"}
              ]
            }
          }else{
            tooltip_data = {
              "state": d.State,
                "winner": stateWinner(d.I_Percentage, d.D_Percentage, d.R_Percentage),
                "electoralVotes" : d.Total_EV,
                "result":[
                 {"nominee": electionResult[0].D_Nominee,"votecount": d3.sum(electionResult, d => d.D_Votes),"percentage": option2.toFixed(1),"party":"D"},
                 {"nominee": electionResult[0].R_Nominee,"votecount": d3.sum(electionResult, d => d.R_Votes),"percentage": option3.toFixed(1),"party":"R"}
              ]
            }
          }

            /* populate data in the following format
             * tooltip_data = {
             * "state": State,
             * "winner":d.State_Winner
             * "electoralVotes" : Total_EV
             * "result":[
             * {"nominee": D_Nominee_prop,"votecount": D_Votes,"percentage": D_Percentage,"party":"D"} ,
             * {"nominee": R_Nominee_prop,"votecount": R_Votes,"percentage": R_Percentage,"party":"R"} ,
             * {"nominee": I_Nominee_prop,"votecount": I_Votes,"percentage": I_Percentage,"party":"I"}
             * ]
             * }
             * pass this as an argument to the tooltip_render function then,
             * return the HTML content returned from that method.
             * */
             let tooltipHTML = TileChart.prototype.tooltip_render(tooltip_data);
             // console.log(tooltipHTML);
             return tooltipHTML;
        });

    //Creates a legend element and assigns a scale that needs to be visualized
    self.legendSvg.append("g")
        .attr("class", "legendQuantile")
        .attr("transform", "translate(25,0)");

    var legendQuantile = d3.legendColor()
        .shapeWidth(70)
        .cells(10)
        .orient('horizontal')
        .scale(colorScale);

    self.legendSvg.select(".legendQuantile")
                  .call(legendQuantile)

    // ******* TODO: PART IV *******
    //Tansform the legend element to appear in the center and make a call to this element for it to display.
    //Lay rectangles corresponding to each state according to the 'row' and 'column' information in the data.
    self.svg.selectAll("rect").remove()
    self.svg.selectAll("rect")
            .data(electionResult)
            .enter()
            .append("rect")
            .attr("height", self.svgHeight / maxRow)
            .attr("width", self.svgWidth / maxCol)
            .attr("y", d => rowScale(d.Row))
            .attr("x", d => colScale(d.Column))
            .attr("fill", function(d){
              if (d.I_Percentage > d.D_Percentage && d.I_Percentage > d.R_Percentage){
                return "#45AD6A";
              }else{
                //Use global color scale to color code the tiles.
                return colorScale(d.R_Percentage - d.D_Percentage);
              }
            })
            //HINT: Use .tile class to style your tiles;
            .classed("tile", true)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
     self.svg.call(tip);
     self.svg.selectAll("text").remove()
     let textTile = self.svg.selectAll("text")
                            .data(electionResult)
                            .enter()

      //Display the state abbreviation and number of electoral votes on each of these rectangles
      textTile.append("text")
              .attr("x", d => colScale(d.Column) + 40)
              .attr("y", d => rowScale(d.Row) + 28)
              .text(d => d.Abbreviation)
              .classed("tilestext", true)
              .style("animation", "animate 3s ease-out forwards")


      // .tilestext to style the text corresponding to tiles
      textTile.append("text")
              .attr("x", d => colScale(d.Column) + 40)
              .attr("y", d => rowScale(d.Row) + 46)
              .text(d => d.Total_EV)
              .classed("tilestext", true)
              .style("animation", "animate 3s ease-out forwards")

    let indiv = d3.sum(electionResult, d => d.I_Percentage);
    let dem1 = d3.sum(electionResult, d => d.D_Percentage);
    let rep1 = d3.sum(electionResult, d => d.R_Percentage);
    let DNom = electionResult[0].D_Nominee;
    let RNom = electionResult[0].R_Nominee;

    // Show Presidential Election Winner by providing Full Name, photo from "Pictures" folder, text (from Wikipedia) and Source
    function PresidentShow(party){
      d3.select("#hiding1").style("display", "inline-block");
      presidentInformation.map( d => {
        if (party == d.Name){
          d3.select("#presidentName").text(d.Full)
          d3.select("#presidentImage").attr("src", `pictures/${party}.jpg`).attr("alt", d.Full)
          d3.select("#textPresident").text(d.Text)
          d3.select("#presidentLink").attr("href", d.Source).text(d.Source);
          if(d.Party == "Democratic"){
            d3.select("#presidentWinner").attr("class", "display-5 text-center text-primary");
            d3.select("#presidentParty").attr("href", d.Source).attr("class", "badge badge-primary").text(d.Party + " Party")
          }else{
            d3.select("#presidentWinner").attr("class", "display-5 text-center text-danger");
            d3.select("#presidentParty").attr("href", d.Source).attr("class", "badge badge-danger").text(d.Party + " Party");
          }
        }
      })
    }

    if(indiv >= dem1 && indiv >= rep1){

    }else if(dem1 >= indiv && dem1 >= rep1){
      PresidentShow(DNom)
    }
    else if(rep1 >= dem1 && rep1 >= indiv){
      PresidentShow(RNom)
    }

};
