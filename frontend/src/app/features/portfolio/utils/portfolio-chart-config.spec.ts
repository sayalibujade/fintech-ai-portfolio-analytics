import { Holding } from '../models/portfolio-model';
import { getPortfolioChartOptions } from './portfolio-chart-config';

describe('getPortfolioCHartOptions Utility', () => {
    it('should compile a valid donut config with parsed series and uppercase labels', () => {
        const mockHoldings: Holding[] = [
            { symbol: 'aapl', shares: 10, currentPrice: 150.255 } as any,
            { symbol: 'nvda', shares: 5, currentPrice: 500.101 } as any
        ];
        const result = getPortfolioChartOptions(mockHoldings);
        expect(result.labels).toEqual(['AAPL', 'NVDA']);
        expect(result.series).toEqual([1502.55, 2500.51]);
        expect(result.chart.type).toBe('donut');
        expect(result.chart.height).toBe(280);
        expect(result.dataLabels.enabled).toBe(true);
    });

    it('should return empty collections when an empty holdings array slice is passed', () => {
        const result = getPortfolioChartOptions([]);

        expect(result.labels).toEqual([]);
        expect(result.series).toEqual([]);

        const totalFormatter = result.plotOptions.pie.donut.labels.total.formatter;
        expect(totalFormatter()).toBe('0 Assets');
    });

    it('should format percentage data strings inside the dataLabels callback branch', () => {
        const result = getPortfolioChartOptions([]);
        const dataLabelFormatter = result.dataLabels.formatter;

        expect(dataLabelFormatter(45.234)).toBe('45.2%');
        expect(dataLabelFormatter(100)).toBe('100.0%');
    });

    it('should execute the pie donut total label formatter cleanly and output asset counts', () => {
    const mockHoldings: Holding[] = [
      { symbol: 'btc', shares: 1, currentPrice: 60000 } as any,
      { symbol: 'eth', shares: 10, currentPrice: 3000 } as any,
      { symbol: 'sol', shares: 100, currentPrice: 150 } as any
    ];

    const result = getPortfolioChartOptions(mockHoldings);
    const totalFormatter = result.plotOptions.pie.donut.labels.total.formatter;

    expect(totalFormatter()).toBe('3 Assets');
  });
});