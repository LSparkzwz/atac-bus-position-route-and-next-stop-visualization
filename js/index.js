let last_clicked_municipality

d3.xml('resources/roma.svg')
    .then(data => {
        d3.select('#map').node().append(data.documentElement)
        d3.select("#roma")
			.style('pointer-events','none')
            .style('max-height', '80%')
            .style('max-width', '80%')

        d3.selectAll("path.municipality")
			.style('pointer-events','auto')
            .on("click", (d, i, nodes) => {
            		let municipality = d3.select(nodes[i])
					municipality.style('fill', '#A8BED5')
					if(last_clicked_municipality !== undefined){
						last_clicked_municipality.style('fill','#fff6d5')
					}
				    last_clicked_municipality = municipality
                }
            )

    })