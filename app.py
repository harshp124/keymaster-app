"""
Flask API for fetching employee data from Redis.
Endpoint: GET /v1/employees/{id}
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from redis_client import RedisClient
import json

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

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


@app.route("/v1/employees/search/by-skills", methods=["GET"])
def search_employees_by_skills():
    """
    Search for employees who have ALL the requested skills.
    Uses Redis SINTER command for efficient set intersection.

    Query Parameters:
        skills (str): Comma-separated list of skills to search for
                     Example: ?skills=aws,docker,gcp
                     Returns employees who have ALL these skills

    Returns:
        JSON response with list of employees who have ALL the specified skills
    """
    try:
        # Get skills from query parameters
        skills_param = request.args.get("skills", "")

        if not skills_param:
            return jsonify({
                "status": 400,
                "error": "BAD_REQUEST",
                "message": "Please provide 'skills' query parameter (comma-separated)"
            }), 400

        # Parse skills from comma-separated string
        requested_skills = [skill.strip().lower() for skill in skills_param.split(",")]
        requested_skills = [skill for skill in requested_skills if skill]  # Remove empty strings

        if not requested_skills:
            return jsonify({
                "status": 400,
                "error": "BAD_REQUEST",
                "message": "No valid skills provided"
            }), 400

        # Build skill SET keys for Redis SINTER
        # Format: skill:{skill_name}:employees
        skill_keys = [f"skill:{skill}:employees" for skill in requested_skills]

        # Use Redis SINTER to find employees with ALL requested skills
        try:
            employee_ids = redis_client.sinter(*skill_keys)
        except Exception as e:
            return jsonify({
                "status": 500,
                "error": "REDIS_ERROR",
                "message": f"Error querying Redis: {str(e)}"
            }), 500

        if not employee_ids:
            return jsonify({
                "status": 200,
                "requested_skills": requested_skills,
                "data": [],
                "count": 0
            }), 200

        # Fetch employee data for each matching employee ID
        matching_employees = []

        for emp_id in sorted(employee_ids, key=lambda x: int(x)):
            try:
                # Fetch employee data
                employee_key = f"user:id:{emp_id}"
                try:
                    employee_data = redis_client.json().get(employee_key)
                except Exception:
                    # Fallback to string parsing
                    try:
                        raw_data = redis_client.get(employee_key)
                        employee_data = json.loads(raw_data) if raw_data else None
                    except Exception:
                        employee_data = None

                if employee_data:
                    matching_employees.append({
                        "employee_id": emp_id,
                        "employee_data": employee_data,
                        "matching_skills": requested_skills
                    })

            except Exception as e:
                # Skip employees with errors
                continue

        return jsonify({
            "status": 200,
            "requested_skills": requested_skills,
            "data": matching_employees,
            "count": len(matching_employees)
        }), 200

    except Exception as e:
        return internal_server_error(str(e))


@app.route("/health", methods=["GET"])
def health_check():
    """
    Basic health check endpoint for quick status verification.

    Returns:
        JSON response with health status (200 if healthy, 503 if unhealthy)
    """
    try:
        redis_client.ping()
        return jsonify({
            "status": "healthy",
            "service": "keymaster-app",
            "redis": "connected"
        }), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "service": "keymaster-app",
            "redis": "disconnected",
            "error": str(e)
        }), 503


@app.route("/health/detailed", methods=["GET"])
def health_check_detailed():
    """
    Detailed health check endpoint with comprehensive system information.
    Useful for monitoring and debugging.

    Returns:
        JSON response with detailed health metrics and system info
    """
    import time
    from datetime import datetime, timezone

    health_data = {
        "status": "healthy",
        "service": "keymaster-app",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0",
        "components": {}
    }

    # Check Redis connection
    try:
        start_time = time.time()
        redis_client.ping()
        response_time = (time.time() - start_time) * 1000  # Convert to ms

        health_data["components"]["redis"] = {
            "status": "connected",
            "response_time_ms": round(response_time, 2)
        }
    except Exception as e:
        health_data["status"] = "unhealthy"
        health_data["components"]["redis"] = {
            "status": "disconnected",
            "error": str(e)
        }

    # Check Redis data availability
    try:
        employee_count = len(redis_client.keys("user:id:*"))
        skill_count = len(redis_client.keys("skill:*:employees"))

        health_data["components"]["data"] = {
            "status": "available",
            "employees_count": employee_count,
            "skills_count": skill_count
        }
    except Exception as e:
        health_data["components"]["data"] = {
            "status": "unavailable",
            "error": str(e)
        }

    # Determine HTTP status code
    http_status = 200 if health_data["status"] == "healthy" else 503

    return jsonify(health_data), http_status


@app.route("/health/live", methods=["GET"])
def health_check_live():
    """
    Liveness probe endpoint (Kubernetes-style).
    Returns 200 if the service is running, 503 otherwise.

    Returns:
        JSON response with liveness status
    """
    try:
        redis_client.ping()
        return jsonify({
            "status": "alive",
            "service": "keymaster-app"
        }), 200
    except Exception as e:
        return jsonify({
            "status": "dead",
            "service": "keymaster-app",
            "error": str(e)
        }), 503


@app.route("/health/ready", methods=["GET"])
def health_check_ready():
    """
    Readiness probe endpoint (Kubernetes-style).
    Returns 200 if the service is ready to accept requests, 503 otherwise.

    Returns:
        JSON response with readiness status
    """
    try:
        # Check if Redis is connected
        redis_client.ping()

        # Check if we have data
        employee_count = len(redis_client.keys("user:id:*"))

        if employee_count == 0:
            return jsonify({
                "status": "not_ready",
                "service": "keymaster-app",
                "reason": "No employee data found"
            }), 503

        return jsonify({
            "status": "ready",
            "service": "keymaster-app",
            "employees_available": employee_count
        }), 200
    except Exception as e:
        return jsonify({
            "status": "not_ready",
            "service": "keymaster-app",
            "error": str(e)
        }), 503


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
    app.run(debug=True, host="0.0.0.0", port=8082)

