"""
Script to populate Redis SET with employee skills using reverse indexing.
Creates skill → employees mapping for efficient querying.
"""

import redis
from config import Config
import random


# Fixed skills pool
SKILLS_POOL = [
    "aws",
    "docker",
    "gcp",
    "sql",
    "ai",
    "golang"
]


def connect_to_redis():
    """
    Establish connection to Redis database.
    
    Returns:
        redis.Redis: Redis client instance
    """
    try:
        redis_url = f"redis://{Config.REDIS_USERNAME}:{Config.REDIS_PASSWORD}@{Config.REDIS_HOST}:{Config.REDIS_PORT}/0"
        client = redis.from_url(
            redis_url,
            decode_responses=True
        )
        # Test the connection
        client.ping()
        print("✓ Successfully connected to Redis")
        return client
    except Exception as e:
        print(f"✗ Failed to connect to Redis: {e}")
        raise


def get_employee_id_from_key(key):
    """
    Extract employee ID from key format user:id:{id}

    Args:
        key (str): Redis key in format user:id:{id}

    Returns:
        str: Employee ID
    """
    return key.split(":")[-1]


def delete_all_skill_sets(client):
    """
    Delete all existing skill sets from Redis.

    Args:
        client (redis.Redis): Redis client instance
    """
    try:
        # Get all skill keys matching pattern skill:*:employees
        skill_keys = client.keys("skill:*:employees")

        if skill_keys:
            client.delete(*skill_keys)
            print(f"✓ Deleted {len(skill_keys)} existing skill sets")
        else:
            print("✓ No existing skill sets to delete")

    except Exception as e:
        print(f"✗ Error deleting skill sets: {e}")
        raise


def assign_random_skills_to_employee(employee_id):
    """
    Randomly select 2-4 skills for an employee.

    Args:
        employee_id (str): Employee ID

    Returns:
        list: List of randomly selected skills
    """
    # Randomly select 2-4 skills from the pool
    num_skills = random.randint(2, 4)
    return random.sample(SKILLS_POOL, num_skills)


def populate_employee_skills(client):
    """
    Populate Redis with reverse-indexed skill sets.
    Creates skill → employees mapping for efficient querying.

    For each employee, randomly assigns 2-4 skills and adds the employee ID
    to the corresponding skill SET.

    Args:
        client (redis.Redis): Redis client instance
    """
    try:
        # Get all keys matching the pattern user:id:*
        keys = client.keys("user:id:*")

        if not keys:
            print("✗ No employees found in Redis")
            return

        print(f"\nFound {len(keys)} employees")
        print("-" * 60)

        processed_count = 0
        skipped_count = 0

        # Dictionary to track which employees have which skills
        skill_to_employees = {skill: [] for skill in SKILLS_POOL}

        for key in keys:
            try:
                # Extract employee ID from key
                employee_id = get_employee_id_from_key(key)

                # Fetch employee JSON data
                try:
                    employee_data = client.json().get(key)
                except Exception:
                    # If JSON.GET fails, try to get as regular string and parse
                    try:
                        raw_data = client.get(key)
                        if raw_data:
                            import json as json_module
                            employee_data = json_module.loads(raw_data)
                        else:
                            employee_data = None
                    except Exception:
                        skipped_count += 1
                        continue

                if employee_data is None:
                    print(f"⚠ Skipped: Employee {employee_id} - No data found")
                    skipped_count += 1
                    continue

                if not isinstance(employee_data, dict):
                    print(f"⚠ Skipped: Employee {employee_id} - Invalid data format")
                    skipped_count += 1
                    continue

                # Get employee ID from JSON
                emp_id = employee_data.get('id')
                if not emp_id:
                    print(f"⚠ Skipped: Employee {employee_id} - No ID field in JSON")
                    skipped_count += 1
                    continue

                # Randomly assign 2-4 skills to this employee
                assigned_skills = assign_random_skills_to_employee(emp_id)

                # Add employee ID to each skill's SET
                for skill in assigned_skills:
                    skill_to_employees[skill].append(str(emp_id))

                employee_name = employee_data.get('display_name', f"{employee_data.get('first_name', '')} {employee_data.get('last_name', '')}")
                print(f"✓ Employee {emp_id} ({employee_name}): Assigned {len(assigned_skills)} skills")
                print(f"  Skills: {', '.join(sorted(assigned_skills))}")

                processed_count += 1

            except Exception as e:
                employee_id = get_employee_id_from_key(key)
                print(f"✗ Error processing employee {employee_id}: {e}")
                skipped_count += 1
                continue

        # Now add all employees to their respective skill SETs in Redis
        print("\n" + "-" * 60)
        print("Adding employees to skill SETs...")
        print("-" * 60)

        for skill, employee_ids in skill_to_employees.items():
            if employee_ids:
                skill_key = f"skill:{skill}:employees"
                client.sadd(skill_key, *employee_ids)
                print(f"✓ Skill '{skill}': Added {len(employee_ids)} employees")
            else:
                print(f"⚠ Skill '{skill}': No employees assigned")

        print("-" * 60)
        print(f"\n✓ Completed!")
        print(f"  Employees processed: {processed_count}")
        print(f"  Skipped: {skipped_count}")
        print(f"  Total employees: {len(keys)}")

    except Exception as e:
        print(f"✗ Error during population: {e}")
        raise


def verify_skills(client):
    """
    Verify that skills have been populated correctly.
    Shows skill → employees mapping.

    Args:
        client (redis.Redis): Redis client instance
    """
    try:
        print("\n" + "=" * 60)
        print("VERIFICATION - Skill to Employees Mapping")
        print("=" * 60)

        # Get all skills keys
        skills_keys = client.keys("skill:*:employees")

        if not skills_keys:
            print("✗ No skills found in Redis")
            return

        print(f"\nFound {len(skills_keys)} skills\n")

        for skills_key in sorted(skills_keys):
            skill_name = skills_key.split(":")[1]
            employee_ids = client.smembers(skills_key)
            print(f"Skill '{skill_name}':")
            print(f"  Employees: {', '.join(sorted(employee_ids))}")
            print(f"  Count: {len(employee_ids)}\n")

    except Exception as e:
        print(f"✗ Error during verification: {e}")


def main():
    """Main function to populate employee skills."""
    print("=" * 60)
    print("EMPLOYEE SKILLS POPULATION SCRIPT (Reverse Indexing)")
    print("=" * 60)

    # Connect to Redis
    client = connect_to_redis()

    # Delete all existing skill sets
    print("\nStep 1: Deleting existing skill sets...")
    delete_all_skill_sets(client)

    # Populate skills for all employees
    print("\nStep 2: Populating skills...")
    populate_employee_skills(client)

    # Verify the population
    print("\nStep 3: Verifying population...")
    verify_skills(client)

    # Close the connection
    client.close()
    print("\n✓ Connection closed")


if __name__ == "__main__":
    main()

