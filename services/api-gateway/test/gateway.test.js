import test from 'node:test';
import assert from 'node:assert';
import express from 'express';
import { createServiceProxy } from '../src/utils/proxy.js';

test('API Gateway Unit Test Suite', async (t) => {
  await t.test('PROXY: Reverse proxy helper correctly builds proxy middleware', () => {
    const proxyMiddleware = createServiceProxy('http://localhost:4001');
    assert.strictEqual(typeof proxyMiddleware, 'function');
  });
});
