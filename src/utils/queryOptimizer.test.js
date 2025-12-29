import { describe, it, expect } from 'vitest';
import { QueryOptimizer, queryOptimizer, optimizeQuery, estimateResponseSize, analyzeQueryComplexity, createOptimizedQuery } from './queryOptimizer.js';

describe('QueryOptimizer', () => {
  describe('Basic functionality', () => {
    it('should create QueryOptimizer instance', () => {
      const optimizer = new QueryOptimizer();
      expect(optimizer).toBeInstanceOf(QueryOptimizer);
      expect(optimizer.fieldWeights).toBeDefined();
      expect(optimizer.contextFields).toBeDefined();
    });

    it('should provide singleton instance', () => {
      expect(queryOptimizer).toBeInstanceOf(QueryOptimizer);
    });
  });

  describe('Response size estimation', () => {
    it('should estimate response size for simple query', () => {
      const query = `{
        analyticsData {
          id
          imei
          latitude
          longitude
        }
      }`;
      
      const size = estimateResponseSize(query, 100);
      expect(size).toBeGreaterThan(0);
      expect(typeof size).toBe('number');
    });

    it('should estimate larger size for queries with heavy fields', () => {
      const lightQuery = `{
        analyticsData {
          id
          imei
        }
      }`;
      
      const heavyQuery = `{
        analyticsData {
          id
          imei
          rawPacket
          rawImei
          rawAlert
        }
      }`;
      
      const lightSize = estimateResponseSize(lightQuery, 100);
      const heavySize = estimateResponseSize(heavyQuery, 100);
      
      expect(heavySize).toBeGreaterThan(lightSize);
    });
  });

  describe('Query complexity analysis', () => {
    it('should analyze query complexity', () => {
      const query = `{
        analyticsData {
          id
          imei
          rawPacket
          rawAlert
        }
      }`;
      
      const analysis = analyzeQueryComplexity(query);
      
      expect(analysis).toHaveProperty('totalFields');
      expect(analysis).toHaveProperty('heavyFields');
      expect(analysis).toHaveProperty('estimatedSize');
      expect(analysis).toHaveProperty('complexity');
      expect(analysis).toHaveProperty('recommendations');
      
      expect(analysis.totalFields).toBe(4);
      expect(analysis.heavyFields).toContain('rawPacket');
      expect(analysis.heavyFields).toContain('rawAlert');
    });

    it('should provide recommendations for heavy queries', () => {
      const heavyQuery = `{
        analyticsData {
          rawPacket
          rawImei
          rawAlert
          rawTemperature
        }
      }`;
      
      const analysis = analyzeQueryComplexity(heavyQuery);
      
      expect(analysis.recommendations.length).toBeGreaterThan(0);
      expect(analysis.recommendations.some(r => r.type === 'warning')).toBe(true);
    });
  });

  describe('Query optimization', () => {
    it('should optimize query for dashboard context', () => {
      const originalQuery = `{
        analyticsData {
          id
          imei
          rawPacket
          rawAlert
          latitude
          longitude
          battery
          signal
        }
      }`;
      
      const optimized = optimizeQuery(originalQuery, { viewType: 'dashboard' });
      
      expect(optimized).toBeDefined();
      expect(optimized).not.toContain('rawPacket');
      expect(optimized).not.toContain('rawAlert');
      expect(optimized).toContain('latitude');
      expect(optimized).toContain('longitude');
    });

    it('should optimize query for map context', () => {
      const originalQuery = `{
        analyticsData {
          id
          imei
          latitude
          longitude
          speed
          battery
          signal
          rawPacket
        }
      }`;
      
      const optimized = optimizeQuery(originalQuery, { viewType: 'map' });
      
      expect(optimized).not.toContain('rawPacket');
      expect(optimized).not.toContain('signal');
      expect(optimized).toContain('latitude');
      expect(optimized).toContain('longitude');
    });
  });

  describe('Optimized query creation', () => {
    it('should create optimized getAllAnalytics query', () => {
      const query = createOptimizedQuery('getAllAnalytics', { viewType: 'dashboard' });
      
      expect(query).toContain('analyticsData');
      expect(query).toContain('id');
      expect(query).toContain('imei');
      expect(query).not.toContain('rawPacket');
    });

    it('should create optimized getAnalyticsByImei query', () => {
      const query = createOptimizedQuery('getAnalyticsByImei', { 
        viewType: 'details',
        imei: 'test123'
      });
      
      expect(query).toContain('analyticsDataByImei');
      expect(query).toContain('imei: "test123"');
      expect(query).toContain('latitude');
      expect(query).toContain('longitude');
    });

    it('should create optimized health query', () => {
      const query = createOptimizedQuery('getAnalyticsHealth', { 
        imei: 'test123'
      });
      
      expect(query).toContain('analyticsHealth');
      expect(query).toContain('imei: "test123"');
      expect(query).toContain('gpsScore');
      expect(query).toContain('temperatureHealthIndex');
    });
  });

  describe('Field selection', () => {
    it('should respect required fields', () => {
      const optimizer = new QueryOptimizer();
      const query = `{
        analyticsData {
          id
          imei
        }
      }`;
      
      const optimized = optimizer.optimizeQuery(query, {
        viewType: 'dashboard',
        requiredFields: ['rawPacket'] // Force include heavy field
      });
      
      expect(optimized).toContain('rawPacket');
    });

    it('should exclude specified fields', () => {
      const optimizer = new QueryOptimizer();
      const query = `{
        analyticsData {
          id
          imei
          latitude
          longitude
        }
      }`;
      
      const optimized = optimizer.optimizeQuery(query, {
        viewType: 'dashboard',
        excludeFields: ['latitude', 'longitude']
      });
      
      expect(optimized).not.toContain('latitude');
      expect(optimized).not.toContain('longitude');
    });
  });
});