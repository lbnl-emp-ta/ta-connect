import subprocess

def main():
    fixture_list = [
        "states_fixture.json",
        "transmission_planning_regions_fixture.json",
        "organization_type_fixture.json",
        "depth_fixture.json",
        "customer_type_fixture.json"
    ]

    for fixture in fixture_list:
        command = f"python3 manage.py loaddata core/fixtures/{fixture}"
        subprocess.run(command, shell=True, text=True)


if __name__ == "__main__":
    main()
