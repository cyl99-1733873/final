const margin = {top: 50, right: 50, bottom: 50, left: 50}
, width = 800 - margin.left - margin.right // Use the window's width
, height = 600 - margin.top - margin.bottom // Use the window's height

const tooltipMargin = {top: 20, right: 20, bottom: 20, left: 50}
, tooltipWidth = 400 - tooltipMargin.left - tooltipMargin.right // Use the window's width
, tooltipHeight = 400 - tooltipMargin.top - tooltipMargin.bottom // Use the window's height

// load data
d3.csv('Cumulative Number of Cases.csv').then((data) => {
  d3.csv('top_deaths.csv').then((topDeath) => {
    // append the div which will be the tooltip
    // append tooltipSvg to this div
    const div = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)

    // make an svg and append it to body
    const svg = d3.select('body').append("svg")
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)

    const tooltipSvg = div.append("svg")
        .attr('id', 'tooltipSvg')
        .attr('width', tooltipWidth + tooltipMargin.left + tooltipMargin.right)
        .attr('height', tooltipHeight + tooltipMargin.top + tooltipMargin.bottom)

    let allDates = d3.map(data, function(d) { return(d.dates) }).keys()
    const xScale = d3.scaleBand()
        .domain(allDates)
        .range([margin.left, width + margin.left]);

    const xAxis = svg.append("g")
      .attr("transform", "translate(0," + (height + margin.top) + ")")
      .call(d3.axisBottom(xScale))
      .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-65)" );

    // get min and max number of deaths
    const deathLimits = d3.extent(data, d => +d['deaths_cases'])
    const yScale = d3.scaleLinear()
        .domain([deathLimits[1], deathLimits[0]])
        .range([margin.top, margin.top + height])

    const yAxis = svg.append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(d3.axisLeft(yScale))

    const line = d3.line()
        .x(function(d) { return xScale(d.dates); })
        .y(function(d) { return yScale(d['deaths_cases']); })

    svg.append('text')
    .attr('x', margin.left + 150)
    .attr('y', margin.top)
    .style('font-size', '16pt')
    .text("Cumulative Number of Deaths Over Time")

    svg.append('text')
    .attr('transform', 'translate(15, 350)rotate(-90)')
    .text('Number of Deaths')

    svg.append("path")
        .datum(data)
        .attr('class', 'line')
        .attr("d", function (d) { return line(d) })
        .attr("fill", "none")
        .attr("stroke", "steelblue")

    // append dots to svg to track data points
    svg.selectAll('.dot').data(data)
        .enter()
        .append('circle')
            .attr('cx', d => xScale(d['dates']))
            .attr('cy', d => yScale(d['deaths_cases']))
            .attr('r', 4)
            .attr('fill', 'steelblue')
            .on("mouseover", function(d) {
                let currentDate = d['dates']

                if (currentDate != "1/21/2020" && currentDate != "1/22/2020" &&
                    currentDate != "1/23/2020") {
                      let dataDate = topDeath.filter(d => d['dates'] == currentDate)
                      div.transition()
                          .duration(200)
                          .style('opacity', 0.9)

                      div.style('left', d3.event.pageX + "px")
                          .style('top', (d3.event.pageY - 28) + "px")

                      const xScale2 = d3.scaleBand()
                      .domain(dataDate.map((d) => d['top_death_province']))
                      .range([tooltipMargin.left, tooltipWidth + tooltipMargin.left])

                      tooltipSvg.append('text')
                      .attr('transform', 'translate(15, 300)rotate(-90)')
                      .text('Number of Deaths (Log Scale)')

                      tooltipSvg.append('g')
                      .attr("transform", "translate(0," + (tooltipHeight + tooltipMargin.top) + ")")
                      .call(d3.axisBottom(xScale2))

                      const deathLimits = d3.extent(dataDate, d => +d['top_death_number'])
                      const yScale2 = d3.scaleSymlog()
                      .domain([deathLimits[1], deathLimits[0]])
                      .range([tooltipMargin.top, tooltipHeight])

                      tooltipSvg.append('g')
                      .attr("transform", "translate(" + tooltipMargin.left + "," + tooltipMargin.top + ")")
                      .call(d3.axisLeft(yScale2))

                      tooltipSvg.append('text')
                      .attr('x', tooltipMargin.left + 100)
                      .attr('y', tooltipMargin.top)
                      .text("Top 3 Number of Deaths by Provinces")

                      tooltipSvg.selectAll()
                      .data(dataDate)
                      .enter()
                      .append('rect')
                      .attr('x', (d) => +xScale2(d['top_death_province']) + tooltipMargin.left)
                      .attr('y', (d) => yScale2(+d['top_death_number']))
                      .attr('height', function(d) {
                        let y = yScale2(+d['top_death_number'])
                        return tooltipHeight - y + tooltipMargin.top
                      })
                      .attr('width', xScale.bandwidth())
                      .attr('fill', 'darkred')
                    }
                  })
                  .on("mouseout", function(d) {
                    div.transition()
                        .duration(300)
                        .style('opacity', 0)
                    d3.select("#tooltipSvg").selectAll("*").remove()
                  })
  })
})
