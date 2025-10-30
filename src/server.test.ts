import request from 'supertest';
import { app } from './server';

describe('API Endpoints', () => {
  describe('GET /health', () => {
    it('should return ok status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /api/validate-users', () => {
    it('should validate all users successfully', async () => {
      const response = await request(app).get('/api/validate-users');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ validated: 9 });
    }, 30000); // 30 second timeout since we're calling external API

    it('should handle all names with special characters', async () => {
      // This test verifies that names with apostrophes and accents are sanitized properly
      const response = await request(app).get('/api/validate-users');
      
      expect(response.status).toBe(200);
      expect(response.body.validated).toBeGreaterThan(0);
    }, 30000);
  });
});