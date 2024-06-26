document.addEventListener('DOMContentLoaded', function() {
    d3.csv('mock_stock_data.csv').then(function(data) {
        data.forEach(d => {
            d.Date = new Date(d.Date);
            d.Price = +d.Price;
        });

        const stocks = Array.from(new Set(data.map(d => d.Stock)));
        const stockSelect = document.getElementById('stock-select');

        stocks.forEach(stock => {
            const option = document.createElement('option');
            option.value = stock;
            option.text = stock;
            stockSelect.appendChild(option);
        });

        function updateChart() {
            const selectedStock = stockSelect.value;
            const startDate = new Date(document.getElementById('date-start').value);
            const endDate = new Date(document.getElementById('date-end').value);
            const filteredData = filterData(data, selectedStock, startDate, endDate);
            createVisualization(filteredData);
        }

        stockSelect.addEventListener('change', updateChart);
        document.getElementById('date-start').addEventListener('change', updateChart);
        document.getElementById('date-end').addEventListener('change', updateChart);

        createVisualization(data);

        function filterData(data, stockName, startDate, endDate) {
            return data.filter(d => {
                return (!stockName || d.Stock === stockName) &&
                    (!startDate || d.Date >= startDate) &&
                    (!endDate || d.Date <= endDate);
            });
        }

        function createVisualization(data) {
            d3.select('#chart').selectAll('*').remove();

            const width = 600;
            const height = 600;
            const margin = { top: 20, right: 30, bottom: 30, left: 40 };

            const svg = d3.select('#chart')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.Date))
                .range([0, width - margin.left - margin.right]);

            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.Price)])
                .nice()
                .range([height - margin.top - margin.bottom, 0]);

            const line = d3.line()
                .x(d => x(d.Date))
                .y(d => y(d.Price));

            svg.append('g')
                .attr('class', 'x-axis')
                .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
                .call(d3.axisBottom(x));

            svg.append('g')
                .attr('class', 'y-axis')
                .call(d3.axisLeft(y));

            svg.append('path')
                .datum(data)
                .attr('fill', 'none')
                .attr('stroke', 'steelblue')
                .attr('stroke-width', 1.5)
                .attr('d', line);

            const tooltip = d3.select('#chart')
                .append('div')
                .attr('class', 'tooltip')
                .style('opacity', 0);

            svg.selectAll('.dot')
                .data(data)
                .enter().append('circle')
                .attr('class', 'dot')
                .attr('cx', d => x(d.Date))
                .attr('cy', d => y(d.Price))
                .attr('r', 3)
                .on('mouseover', function(event, d) {
                    tooltip.transition()
                        .duration(200)
                        .style('opacity', .9);
                    tooltip.html(`Date: ${d.Date.toLocaleDateString()}<br>Price: $${d.Price}`)
                        .style('left', (event.pageX + 5) + 'px')
                        .style('top', (event.pageY - 28) + 'px');
                })
                .on('mouseout', function() {
                    tooltip.transition()
                        .duration(500)
                        .style('opacity', 0);
                });
        }
    });
});
