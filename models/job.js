'use strict';

const { query } = require('express');
const { Query } = require('pg');
const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');
const { sqlForPartialUpdate } = require('../helpers/sql');

class Job {
	static async create(data) {
		const result = await db.query(
			`
        INSERT INTO jobs (title , salary , equity, company_handle )
        VALUES ($1,$2,$3,$4)
        RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
			[ data.title, data.salary, data.equity, data.companyHandle ]
		);

		let job = result.rows[0];
		return job;
	}

	static async findAll({ minSalary, hasEquity, title } = {}) {
		let results = `
        SELECT  j.id,
				j.title,
				j.salary,
				j.equity,
				j.company_handle AS "companyHandle",
				c.name AS "companyName"
		FROM jobs j
        LEFT JOIN companies AS c ON c.handle = j.company_handle
        `;

		let whereExpressions = [];
		let quaryValues = [];

		if (minSalary !== undefined) {
			quaryValues.push(minSalary);
			whereExpressions.push(`salary >= $${quaryValues.length}`);
		}
		if (hasEquity == true) {
			whereExpressions.push(`equity > 0`);
		}
		if (title !== undefined) {
			quaryValues.push(`%${title}%`);
			whereExpressions.push(`title ILIKE $${quaryValues.length}`);
		}
		if (whereExpressions.length > 0) {
			results += `WHERE` + whereExpressions.join(`AND`);
		}

		results += `ORDER BY title`;
		const jobsRes = await db.query(results, quaryValues);
		// let jobs = results.rows;
		console.log('***********************>', jobsRes.rows);
		return jobsRes.rows;
	}

	static async get(id) {
		const jobRes = await db.query(
			`
		SELECT id,
				title,
				salary,
				equity,
				company_handle AS "companyHandle"
			FROM jobs
			WHERE id = $1`,
			[ id ]
		);

		const job = jobRes.rows[0];
		console.log('^^^^^^^^^------>', job);
		if (!job) throw new NotFoundError(`No job: ${id}`);
		return job;
	}
	static async update(id, data) {
		const { setCols, values } = sqlForPartialUpdate(data, {});
		const idVarIdx = `$` + (values.length + 1);

		const querySql = `UPDATE jobs
							SET ${setCols}
							WHERE id =  ${idVarIdx}
							RETURNING id,
										title,
										salary,
										equity,
										company_handle as "companyHandle"`;
		const result = await db.query(querySql, [ ...values, id ]);
		const job = result.rows[0];
		if (!job) throw new NotFoundError(`No job: ${id}`);
		return job;
	}

	static async remove(id) {
		const results = await db.query(
			`
		DELETE 
			FROM jobs
			WHERE id = $1
			RETURNING id`,
			[ id ]
		);
		const job = results.rows[0];

		if (!job) throw new NotFoundError(`No job: ${id}`);
	}
}

module.exports = Job;
