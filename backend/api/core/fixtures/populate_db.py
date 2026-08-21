import subprocess

fixture_list = [
    # Foundational lookup data
    "states_fixture.json",
    "transmission_planning_regions_fixture.json",
    "organization_type_fixture.json",
    "depth_fixture.json",
    "topics_fixture.json",
    "status_role_fixture.json",

    # Roles (depend on RequestStatus via M2M)
    "roles_fixture.json",

    # Users
    "sample_users_fixture.json",

    # Core entities
    "reception_fixture.json",
    "sample_organizations_fixture.json",
    "sample_labs_fixture.json",
    "sample_programs_fixture.json",

    # Customers (depend on organizations, states, TPRs)
    "sample_customers_fixture.json",

    # Explicit owner fixtures keep primary keys deterministic. Signals do not
    # synthesize related rows while Django is deserializing raw fixture data.
    "sample_owners_fixture.json",

    # Lab role assignments (depend on users, roles, labs, and programs)
    "sample_lab_role_assignment_fixture.json",

    # Requests (depend on owners, statuses, depths, programs, labs, users)
    "sample_requests_fixture.json",

    # Customer-request relationships (depend on customers, requests, customer types)
    "sample_customer_request_relationship_fixture.json",

    # Expertise (depends on users, topics, depths)
    "sample_expertise_fixture.json",

    # Remaining role assignments
    "sample_system_role_assignment_fixture.json",
    "sample_reception_role_assignment_fixture.json",
    "sample_program_role_assignment_fixture.json",
]

def main():
    for fixture in fixture_list:
        command = f"python manage.py loaddata core/fixtures/{fixture}"
        subprocess.run(command, shell=True, text=True, check=True)


if __name__ == "__main__":
    main()
