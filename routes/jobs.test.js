'use strict';

const request = require('supertest');

const app = require('../app');
const db = require('../db');

const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	testJobIds,
	u1Token,
	adminToken,
	u2Token
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe('GET /jobs', function() {
	test('Does get all work', async function() {
		const resp = await request(app).get(`/jobs`);
		console.log('------>', resp.body);
		expect(resp.body).toEqual({
			jobs: [
				{
					id: expect.any(Number),
					title: 'J1',
					salary: 1,
					equity: '0.1',
					companyHandle: 'c1',
					companyName: 'C1'
				},
				{
					id: expect.any(Number),
					title: 'J2',
					salary: 2,
					equity: '0.2',
					companyHandle: 'c1',
					companyName: 'C1'
				},
				{
					id: expect.any(Number),
					title: 'J3',
					salary: 3,
					equity: null,
					companyHandle: 'c1',
					companyName: 'C1'
				}
			]
		});
	});
	// ---------------------------------
});

/************************************** GET /jobs/:id */

describe('GET /jobs/:id', function() {
	test('get a single job', async function() {
		const resp = await request(app).get(`/jobs/${testJobIds[0]}`);
		console.log('-----%%%---->', resp.body);
		expect(resp.body).toEqual({
			job: {
				id: testJobIds[0],
				title: 'J1',
				salary: 1,
				equity: '0.1',
				companyHandle: 'c1'
			}
		});
	});

	// test('not found for no such job', async function() {
	// 	const resp = await request(app).get(`/jobs/0`);
	// 	expect(resp.statusCode).toEqual(404);
	// });
});

/************************************** PATCH /jobs/:id */

describe('PATCH /jobs/:id', function() {
	test('works for admin', async function() {
		const resp = await request(app)
			.patch(`/jobs/${testJobIds[0]}`)
			.send({
				title: 'J-New'
			})
			.set('authorization', `Bearer ${adminToken}`);
		expect(resp.body).toEqual({
			job: {
				id: expect.any(Number),
				title: 'J-New',
				salary: 1,
				equity: '0.1',
				companyHandle: 'c1'
			}
		});
	});
});

/************************************** DELETE /jobs/:id */

describe('DELETE /jobs/:id', function() {
	test('works for admin', async function() {
		const resp = await request(app).delete(`/jobs/${testJobIds[0]}`).set('authorization', `Bearer ${adminToken}`);
		expect(resp.body).toEqual({ delete: testJobIds[0] });
	});
});
