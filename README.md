<h1>API Assignment Grader</h1>

This is a Node.js script that fetches assignment data from an API endpoint and writes it to a CSV file. The script uses the dotenv package to load environment variables from a .env file and the node-fetch package to make HTTP requests to the API.
Installation

<h2>To use this script, follow these steps:</h2>

    Clone the repository to your local machine.
    Run npm install to install the required packages.
    Create a .env file in the root directory of the project and add your API key as API_KEY=your_api_key.
    Modify the constants ASSIGNMENTS_ENDPOINT, ASSIGNMENT_GROUPS_ENDPOINT, and SUBMISSIONS_ENDPOINT to point to the appropriate API endpoints for your use case.
    Modify the pages variable to specify the number of pages of data you want to retrieve.
    Run the script with node index.js.

<h2>Usage</h2>

When you run the script, it will fetch the assignment data from the API, process it, and write it to a CSV file named data.csv in the root directory of the project. The CSV file will contain a table with the following columns:

    Unit: The name of the assignment group that the assignment belongs to.
    Assignment 1-4: The grades for each of the four assignments for each unit. If an assignment has not been graded yet, the cell will contain "Not graded yet". If an assignment has not been released yet, the cell will contain "Not released yet". If a student has not submitted an assignment, the cell will contain "Not Submitted" and the date when the assignment is due.

<h2>Dependencies</h2>

This script requires the following packages:

    dotenv: to load environment variables from a .env file.
    node-fetch: to make HTTP requests to the API.
    csv-writer: to write data to a CSV file.

<h2>License</h2>

This project is licensed under the MIT License.
