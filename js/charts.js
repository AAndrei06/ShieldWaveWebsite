
const ctx = document.getElementById('alertsChart').getContext('2d');
const alertsChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Număr de alerte',
            data: [],
            backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(153, 102, 255, 0.7)',
                'rgba(255, 159, 64, 0.7)',
                'rgba(199, 199, 199, 0.7)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(199, 199, 199, 1)'
            ],
            borderWidth: 1,
            borderRadius: 5,
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {

            legend: {
                display: false,
                labels: {
                    font: {
                        size: 14,
                        family: 'Arial',
                        weight: 'bold',
                        color: '#333',
                    },
                    padding: 10
                },
                position: 'top',
            },
            title: {
                display: true,
                text: 'Numărul de alerte în ultimele 7 zile',
                font: {
                    size: 14,
                    weight: 'bold',
                },
                color: '#333',
                padding: {
                    top: 10,
                    bottom: 20
                }
            },

            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0,0,0,0.7)',
                titleColor: '#fff',
                bodyColor: '#fff',
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Zilele săptămânii',
                    color: '#333',
                    font: {
                        size: 16,
                        weight: 'bold',
                    },
                },
                ticks: {
                    color: '#666',
                    font: {
                        size: 12,
                    },
                },
                grid: {
                    color: 'rgba(200, 200, 200, 0.3)'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Număr de alerte',
                    color: '#333',
                    font: {
                        size: 16,
                        weight: 'bold',
                    },
                },
                ticks: {
                    color: '#666',
                    font: {
                        size: 12,
                    },
                },
                grid: {
                    color: 'rgba(200, 200, 200, 0.3)'
                },
                beginAtZero: true,
            }
        }
    }
});
const ctx1 = document.getElementById('alertsChart24h').getContext('2d');
const alertsChart1 = new Chart(ctx1, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointBackgroundColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(199, 199, 199, 1)',
            ],
            pointRadius: 5,
            pointHoverRadius: 7,
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => `Alerte: ${tooltipItem.raw}`,
                },
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                titleColor: '#fff',
                bodyColor: '#fff',
            },
            title: {
                display: true,
                text: 'Numărul de alerte pe oră (24h)',
                font: {
                    size: 14,
                    weight: 'bold',
                },
                color: '#333',
                padding: {
                    top: 10,
                    bottom: 20
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Orele zilei',
                    color: '#333',
                    font: {
                        size: 16,
                        weight: 'bold',
                    },
                },
                ticks: {
                    color: '#666',
                    font: {
                        size: 12,
                    },
                },
                grid: {
                    color: 'rgba(200, 200, 200, 0.3)'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Numărul de alerte',
                    color: '#333',
                    font: {
                        size: 16,
                        weight: 'bold',
                    },
                },
                ticks: {
                    color: '#666',
                    font: {
                        size: 12,
                    },
                },
                grid: {
                    color: 'rgba(200, 200, 200, 0.3)'
                },
                beginAtZero: true,
            }
        },
        elements: {
            line: {
                backgroundColor: 'white',
            }
        }
    }
});

var ctx3 = document.getElementById('alertChartPie').getContext('2d');

var alertData = {
    labels: [],
    datasets: [{
        label: 'Număr alerte',
        data: [],
        backgroundColor: [
            'rgba(255, 87, 51, 0.7)',
            'rgba(51, 255, 87, 0.7)',
            'rgba(51, 87, 255, 0.7)',
            'rgba(255, 51, 161, 0.7)'
        ],
        borderColor: [
            'rgba(255, 87, 51, 1)',
            'rgba(51, 255, 87, 1)',
            'rgba(51, 87, 255, 1)',
            'rgba(255, 51, 161, 1)'
        ],
        borderWidth: 1
    }]
};

var alertChart = new Chart(ctx3, {
    type: 'pie',
    data: alertData,
    options: {
        responsive: true,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        return tooltipItem.label + ': ' + tooltipItem.raw + ' alerte';
                    }
                }
            },
            legend: {
                display: false
            },
            datalabels: {
                anchor: 'center',
                align: 'center',
                font: {
                    weight: 'bold',
                    size: 12
                },
                color: 'white',
                formatter: (value, context) => {
                    return context.chart.data.labels[context.dataIndex] + '\n' + value;
                }
            },
            title: {
                display: true,
                text: 'Cele mai detectate alerte',
                font: {
                    size: 14,
                    weight: 'bold',
                },
                color: '#333',
                padding: {
                    top: 7,
                    bottom: 1
                }
            }
        }
    },
    plugins: [ChartDataLabels]
});
