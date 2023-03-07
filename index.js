require('dotenv').config();
const fetch = require('node-fetch');

const { API_KEY } = process.env;
const pages = 100;
const ASSIGNMENTS_ENDPOINT = 'https://brock.instructure.com/api/v1/courses/330/assignments';
const ASSIGNMENT_GROUPS_ENDPOINT = 'https://brock.instructure.com/api/v1/courses/330/assignment_groups';
const SUBMISSIONS_ENDPOINT = 'https://brock.instructure.com/api/v1/courses/330/students/submissions';

class APIError {
	constructor(message) {
		this.message = message;
	}
}

function get_grade(submission) {
	let grade = submission.entered_grade || 'Not graded yet';
	if (submission.workflow_state !== 'graded' && !submission.score) {
		grade = 'Not graded yet';
	} else if (!submission.score) {
		grade = 'Not released yet';
	} else if (submission.score === null) {
		grade = 'Not graded yet';
	}
	if (submission.workflow_state === 'unsubmitted') {
		// convert date of cached_due_date to normal date without time
		var dateSubmitted = new Date(submission.cached_due_date).toLocaleDateString();
		grade = 'Not Submitted ' + dateSubmitted;
	}
	return grade;
}

async function main(assignmentsEndpoint, assignmentGroupsEndpoint, submissionsEndpoints, pages) {
	const unit_assignment = await get_assignments(assignmentsEndpoint, assignmentGroupsEndpoint, submissionsEndpoints, pages);
	const table_data = build_table(unit_assignment);
	write_csv(table_data);
}

async function get_assignments(assignmentsGroups, assignmentsEndpoint, submissionsEndpoints, pages) {
	try {
		const [response, groupsResponse, submissionsResponse] = await Promise.all([
			fetch(assignmentsEndpoint + `?per_page=${pages}`, { headers: { Authorization: `Bearer ${API_KEY}` } }),
			fetch(assignmentsGroups + `?per_page=${pages}`, { headers: { Authorization: `Bearer ${API_KEY}` } }),
			fetch(submissionsEndpoints + `?per_page=${pages}`, { headers: { Authorization: `Bearer ${API_KEY}` } }),
		]);

		let assignments = await response.json();

		if (response.status !== 200 || groupsResponse.status !== 200 || submissionsResponse.status !== 200) {
			throw new APIError('Error getting assignments');
		}

		const groups = (await groupsResponse.json()).reduce((acc, group) => ({ ...acc, [group.id]: group.name.slice(0, 7) }), {});

		const submissions = (await submissionsResponse.json()).reduce((acc, submission) => ({ ...acc, [submission.assignment_id]: submission }), {});

		let unit_assignments = {};

		assignments.forEach((assignment) => {
			const { id: assignmentId } = assignment;

			const submission = submissions[assignmentId];

			const grade = get_grade(submission);

			const unitName = groups[assignment['assignment_group_id']] || 'Unknown';

			if (!unit_assignments[unitName]) unit_assignments[unitName] = [];

			unit_assignments[unitName].push({
				assignment: `Assignment ${assignment['name'].slice(4).replace('A0', '').replace('_', '')}`.slice(0, 13),
				grade: grade,
			});
		});

		return unit_assignments;
	} catch (e) {
		console.log(`Error getting assignments: ${e}`);
	}
}
function build_table(unit_assignments) {
	let table_data = [];

	Object.entries(unit_assignments).forEach(([unit, assignments]) => {
		let row = [unit];

		assignments.forEach((assignment, i) => {
			let grade = assignment.grade || 'Not released yet';
			row[i + 1] = grade;
		});

		for (let i = assignments.length; i < 4; i++) {
			row[i + 1] = 'N/A';
		}

		table_data.push(row);
	});

	write_csv(table_data);

	return table_data;
}

const createCsvWriter = require('csv-writer').createObjectCsvWriter;

function write_csv(table_data) {
	try {
		const headers = [
			{ id: 'unit', title: 'Unit' },
			{ id: 'assignment1', title: 'Assignment 1' },
			{ id: 'assignment2', title: 'Assignment 2' },
			{ id: 'assignment3', title: 'Assignment 3' },
			{ id: 'assignment4', title: 'Assignment 4' },
		];

		const csvWriter = createCsvWriter({ path: 'data.csv', header: headers });

		const rows = table_data.map((row) => ({
			unit: row[0],
			assignment1: row[1],
			assignment2: row[2],
			assignment3: row[3],
			assignment4: row[4],
		}));

		csvWriter
			.writeRecords(rows)
			.then(() => console.log('Data written to data.csv file.'))
			.catch((error) => console.log(`Error writing data to CSV file ${error}`));
	} catch (e) {
		console.log(`Error writing data to CSV file ${e}`);
	}
}
main(ASSIGNMENT_GROUPS_ENDPOINT, ASSIGNMENTS_ENDPOINT, SUBMISSIONS_ENDPOINT, pages);
