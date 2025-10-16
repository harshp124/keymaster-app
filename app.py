"""
Flask API for fetching employee data from Redis.
Endpoint: GET /v1/employees/{id}
"""

from flask import Flask, jsonify
from redis_client import RedisClient
import json

app = Flask(__name__)

# Initialize Redis client
redis_client = RedisClient().get_client()


# Helper functions for error responses
def employee_not_found(employee_id):
    """Return 404 response for employee not found."""
    return jsonify({
        "status": 404,
        "error": "NOT_FOUND",
        "message": f"Employee with ID {employee_id} not found"
    }), 404


def internal_server_error(error_message):
    """Return 500 response for internal server errors."""
    return jsonify({
        "status": 500,
        "error": "INTERNAL_SERVER_ERROR",
        "message": error_message
    }), 500


@app.route("/v1/employees", methods=["GET"])
def get_all_employees():
    """
    Fetch all employees data from Redis.

    Returns:
        JSON response with list of all employees or error message
    """
    try:
        # Get all keys matching the pattern user:id:*
        keys = redis_client.keys("user:id:*")

        if not keys:
            return jsonify({
                "status": 200,
                "data": [],
                "message": "No employees found"
            }), 200

        employees = []
        for key in keys:
            try:
                data = redis_client.json().get(key)
                if data is not None:
                    employees.append(data)
            except Exception as e:
                # Skip keys that can't be parsed
                continue

        return jsonify({
            "status": 200,
            "data": employees,
            "count": len(employees)
        }), 200

    except Exception as e:
        return internal_server_error(str(e))


@app.route("/v1/employees/<employee_id>", methods=["GET"])
def get_employee(employee_id):
    """
    Fetch employee data from Redis by ID.

    Args:
        employee_id (str): Employee ID

    Returns:
        JSON response with employee data or error message
    """
    key = f"user:id:{employee_id}"

    try:
        # Fetch JSON data from Redis
        data = redis_client.json().get(key)

        if data is None:
            return employee_not_found(employee_id)

        return jsonify({
            "status": 200,
            "data": data
        }), 200

    except Exception as e:
        return internal_server_error(str(e))


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    try:
        redis_client.ping()
        return jsonify({
            "status": "healthy",
            "redis": "connected"
        }), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "redis": "disconnected",
            "error": str(e)
        }), 500


@app.errorhandler(404)
def handle_not_found(e):
    """Handle 404 errors for invalid endpoints."""
    return jsonify({
        "status": 404,
        "error": "NOT_FOUND",
        "message": "Endpoint not found"
    }), 404


@app.errorhandler(500)
def handle_internal_error(e):
    """Handle 500 errors for server errors."""
    return jsonify({
        "status": 500,
        "error": "INTERNAL_SERVER_ERROR",
        "message": "Internal server error"
    }), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8090)

