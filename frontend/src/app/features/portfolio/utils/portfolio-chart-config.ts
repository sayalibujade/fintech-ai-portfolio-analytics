import { Holding } from '../models/portfolio-model';

export const getPortfolioChartOptions = (holdings: Holding[]) => {
    const labels = holdings.map(holding => holding.symbol.toUpperCase());
    const series = holdings.map(holding => Number((holding.shares * holding.currentPrice).toFixed(2)));

    return {
        series,
        labels,
        chart: {
            type: 'donut' as const,
            height: 280,
            fontfamily: 'system-ui, -apple-system, sans-serif'
        },
        colors: ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#6366f1'],
        legend: {
            position: 'bottom' as const,
            fontSize: '13px'
        },
        dataLabels: {
            enabled: true,
            formatter: (val: number) => `${val.toFixed(1)}%`
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Allocation',
                            fontSize: '14px',
                            color: '#64748b',
                            formatter: () => `${labels.length} Assets`
                        }
                    }
                }
            }
        }
    };
}