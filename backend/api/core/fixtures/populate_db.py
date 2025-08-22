import subprocess

fixture_list = [
    "user_fixture.json",
    "states_fixture.json",
    "transmission_planning_regions_fixture.json",
    "organization_type_fixture.json",
    "depth_fixture.json",
    "customer_type_fixture.json",
    "role_permission_dummy_fixture.json",
    "status_role_fixture.json",
    "topics_fixture.json"
]

def main():
    for fixture in fixture_list:
        command = f"python manage.py loaddata core/fixtures/{fixture}"
        subprocess.run(command, shell=True, text=True)


if __name__ == "__main__":
    main()
